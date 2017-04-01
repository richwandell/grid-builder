import Knn from './Knn';
import KMeans from './KMeans';
const express = require('express');
const bodyParser = require('body-parser');
const pjson = require('../../package.json');
const Logger = require('./Log.js');
let Db = require('./Db.js');
const fs = require('fs');
const Utils = require('./Utils.js');
const uuid = require('uuid');
const http = require('http');



/**
 * RestServer class is used to power the rest server that will communicate with the
 * mobile phone on the local wifi network. This server will respond to upnp devices
 * with the device description xml file as well as handle all saving and fetching of data.
 *
 * The rest server uses express.js and listens on a port configured by builder_rest_port
 * parameter in the package.json file within the public folder
 *
 * @author Rich Wandell <richwandell@gmail.com>
 */
class RestServer{

    constructor(){
        this.id = uuid.v4();
        try {
            let oldUUID = fs.readFileSync(".uuid", "utf8");
            this.id = oldUUID;
        }catch(e){
            fs.writeFileSync(".uuid", this.id);
        }

        this.log = new Logger({
            logfolder: pjson.builder_log_folder,
            filename: "rest.log",
            filesize: 5000000,
            numfiles: 3
        });
        this.db = new Db(this.log);
        this.app = express();
        this.app.use(bodyParser.json({limit: '50mb'}));
        this.app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
        this.app.use('/builder', express.static('builder'))
    }

    /**
     * Save handler for saving layout images from the UI
     * @param req
     * @param res
     */
    updateDatabase(req, res){
        let log = this.log;
        let db = this.db;
        const data = req.body;
        let cleanData = {};
        let error = false;

        log.log("/rest/updateDatabase");
        this.setResponseHeaders(res);

        if(typeof(data.layout_images) != "undefined"){
            if(data.layout_images.length > 0){
                cleanData.layout_images = data.layout_images;
            }else{
                error = true;
            }
        }else{
            error = true;
        }

        if(!error){
            db.updateDatabase(cleanData, function(err, rows){
                res.send({success: true});
            });
        }else{
            res.send({success: false});
        }

        log.log(req.body);
    }

    /**
     * Returns the device description xml file for upnp readers
     * @param req
     * @param res
     */
    getDeviceDescription(req, res){
        let log = this.log;
        let id = this.id;
        log.log("devicedescription.xml");
        fs.readFile('devicedescription.xml', "binary", function (err, file) {
            if (err) {
                res.header("Content-Type", "text/plain");
                res.status(500).send(err);
                return;
            }
            file = file.replace(/\{\{UDN\}\}/, "uuid:" + id);
            file = file.replace(/\{\{END\}\}/, "http://" + Utils.getServerIp() + ":8888/rest/");
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Content-Type", "text/xml");
            res.send(file);
        });
    }

    /**
     * Returns all of the layout image records as a json array
     * @param req
     * @param res
     */
    getFloorplans(req, res){
        let log = this.log;
        let db = this.db;
        log.log("/rest/floorplans");
        this.setResponseHeaders(res);
        db.getFloorPlans(function(err, rows){
            rows.forEach(function(row){
                if(typeof(row.layout_image) != "undefined"){
                    row.layout_image = JSON.parse(row.layout_image);
                }
            });
            res.send(rows);
        });
    }

    getScannedCoords(req, res){
        let log = this.log;
        let db = this.db;
        const data = req.params;
        log.log("/rest/getScannedCoords");
        db.getScannedCoords(data.fp_id, function(err, rows){
            res.send(rows);
        });
    }

    saveReadings(req, res){
        let log = this.log;
        log.log("/rest/saveReadings");
        const data = req.body;
        log.log(data);
        if(typeof(data.payload) == "undefined"){
            return res.send({success: false, message: "missing payload"});
        }
        this.db.saveReadings(data.payload);
        res.send({success: true});
    }

    getLayoutInfo(req, res){
        let log = this.log;
        log.log("/rest/layout_info/all");
        this.setResponseHeaders(res);

        this.db.getLayoutInfo(function(err, rows){
            res.send({
                success: true,
                payload: rows
            });
        });
    }

    setResponseHeaders(res){
        res.header("Access-Control-Allow-Origin", "*");
        res.header('Content-Type', 'application/javascript');
        res.header("Cache-Control", "no-cache");
    }

    localize(req, res) {
        this.log.log('/rest/localize');
        this.log.log(req.body.ap_ids);

        const data = req.body;
        let knn = new Knn(this.log, this.db, data.fp_id, data.ap_ids);
        knn.getNeighbors(5, (knn) => {
            this.log.log(knn);
            let km = new KMeans(2, knn);
            const largestCluster = km.getLargestClusterIndex();
            const guess = km.getCentroid(largestCluster);
            const id = data.device_id;


            res.send({
                succes: true,
                guess: guess
            });
            this.notifyListeners({
                action: 'LOCALIZE',
                id: id,
                guess: guess
            });
        });
    }

    notifyListeners(data: Object) {
        console.log(process.pid);
        this.worker.send(data);
    }

    jsonHeaders(req, res, next){
        res.header("Access-Control-Allow-Origin", "*");
        res.header('Content-Type', 'application/javascript');
        res.header("Cache-Control", "no-cache");
        next();
    }

    /**
     * Routes are defined here and mapped to actions
     */
    createServer() {
        const db = this.db;
        const log = this.log;
        const app = this.app;
        db.createTables(log);

        app.post('/rest/localize', this.jsonHeaders, (req, res) => {
            this.localize(req, res);
        });

        app.get('/rest/alive', this.jsonHeaders, (req, res) => {
            res.send({success: true});
        });

        app.post('/rest/updateDatabase', (req, res) => {
            this.updateDatabase(req, res);
        });

        app.get('/devicedescription.xml', (req, res) => {
            this.getDeviceDescription(req, res);
        });

        app.get("/icon24.png", (req, res) => {
            this.log.log("icon24.png");
            res.header("Access-Control-Allow-Origin", "*");
            res.sendFile(process.cwd() + '/src/icon24.png');
        });

        app.get("/rest/floorplans", (req, res) => {
            this.getFloorplans(req, res);
        });

        app.post("/rest/saveReadings", this.jsonHeaders, (req, res) => {
            this.saveReadings(req, res);
        });

        app.get("/rest/getScannedCoords/:fp_id", this.jsonHeaders, (req, res) => {
            this.getScannedCoords(req, res);
        });

        this.server = http.createServer(app);

    }

    listen(worker, port){
        this.worker = worker;
        this.server.listen(port);
    }

    getApp(): express {
        return this.app;
    }

    getServer(): Server {
        return this.server
    }

    getLog(): Log {
        return this.log;
    }
}


export default RestServer;