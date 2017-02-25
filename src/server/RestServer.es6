const express = require('express');
const bodyParser = require('body-parser');
const pjson = require('../package.json');
const Logger = require('./Log.js');
let Db = require('./Db.js');
const fs = require('fs');
const Utils = require('./Utils.js');
const uuid = require('uuid');

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
     * Request handler for the /rest/databaseVersion endpoint
     * @param req
     * @param res
     */
    getDatabaseVersion(req, res){
        const log = this.log;
        const db = this.db;
        log.log("/rest/databaseVersion");
        res.header("Access-Control-Allow-Origin", "*");
        res.header('Content-Type', 'application/javascript');
        db.getDatabaseVersion(function(err, rows){
            if(rows.length > 0){
                res.send({databaseVersion: rows[0].value, success: true});
            }else{
                res.send({databaseVersion: 0, success: true});
            }
        });
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
        res.header("Access-Control-Allow-Origin", "*");
        res.header('Content-Type', 'application/javascript');
        log.log(req.body);

        if(typeof(data.databaseVersion) != "undefined"){
            if(!isNaN(data.databaseVersion)){
                cleanData.databaseVersion = data.databaseVersion;
            }else{
                error = true;
            }
            if(typeof(data.layout_images) != "undefined"){
                if(data.layout_images.length > 0){
                    cleanData.layout_images = data.layout_images;
                }else{
                    error = true;
                }
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
        res.header("Access-Control-Allow-Origin", "*");
        res.header('Content-Type', 'application/javascript');
        db.getFloorPlans(function(err, rows){
            rows.forEach(function(row){
                if(typeof(row.layout_image) != "undefined"){
                    row.layout_image = JSON.parse(row.layout_image);
                }
            });
            res.send(rows);
        });
    }

    saveReadings(req, res){
        let log = this.log;
        log.log("/rest/saveReadings");
        res.header("Access-Control-Allow-Origin", "*");
        res.header('Content-Type', 'application/javascript');
        const data = req.body;
        log.log(data);
        if(typeof(data.payload) == "undefined"){
            return res.send({success: false, message: "missing payload"});
        }
        this.db.saveReadings(data.payload);
        res.send({success: true});
    }

    /**
     * Routes are defined here and mapped to actions
     */
    startServer() {
        const db = this.db;
        const log = this.log;
        const app = this.app;
        db.createTables(log);

        app.get('/rest/databaseVersion', (req, res) => {
            this.getDatabaseVersion(req, res);
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

        app.post("/rest/saveReadings", (req, res) => {
            this.saveReadings(req, res);
        });

        app.listen(pjson.builder_rest_port, function () {
            log.log('Server Started')
        });
    }

}



module.exports = RestServer;