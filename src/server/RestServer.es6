import Knn from './Knn';
import KMeans from './KMeans';
import ParticleFilter from './ParticleFilter';
import Features from './Features';

const express = require('express');
const bodyParser = require('body-parser');
const Utils = require('./Utils.js');
const http = require('http');
const fs = require("fs");


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

    constructor(server: Server){
        this.worker = server;
        this.id = server.id;
        this.log = server.log;
        this.db = server.db;

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
        this.db.saveReadings(data.payload, () => {
            res.send({success: true});
            this.notifyListeners({
                action: 'NEW_READING'
            });
        });

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
        const data = req.body;
        const id = data.device_id;

        let stateParticles = [];
        if(this.worker.particles[id] !== undefined){
            stateParticles = this.worker.particles[id];
        }
        let pf = new ParticleFilter(this.db, data.fp_id);
        pf.setParticles(stateParticles);

        const f = new Features();
        const features = f.makeFeatures(data.ap_ids);
        pf.move(features);
        const allParticles = pf.getParticles();
        this.worker.particles[id] = allParticles;

        const particles = pf.getParticleCoords();

        let knn = new Knn(this.db, data.fp_id);

        knn.getNeighbors(features, pf.getParticleKeys(), 5, (knn) => {
            let km = new KMeans(2, knn);
            const largestCluster = km.getLargestClusterIndex();
            const guess = km.getCentroid(largestCluster);

            res.send({
                success: true,
                guess: guess,
                particles: particles
            });
            this.notifyListeners({
                action: 'LOCALIZE',
                id: id,
                guess: guess,
                type: data.type,
                particles: particles,
                fp_id: data.fp_id,
                all_particles: allParticles
            });
        });
    }

    notifyListeners(data: Object) {
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
        const app = this.app;

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

        app.get("/rest/floorplans", this.jsonHeaders, (req, res) => {
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

    listen(port){
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