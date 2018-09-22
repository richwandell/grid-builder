import {ServerBase, LargeClusterResponse, FinalResponse, ParticleFilterResponse} from "./ServerBase";

const express = require('express');
const bodyParser = require('body-parser');

const http = require('http');
const fs = require("fs");
const pjson = require('../../package.json');


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
class RestServer extends ServerBase {

    constructor(server: Server){
        super(server);
        this.id = server.id;
        this.log = server.log;
        this.db = server.db;

        this.app = express();
        this.app.use(bodyParser.json({limit: '50mb'}));
        this.app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
        this.app.use('/builder', express.static('public/builder'))
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
            file = file.replace(/\{\{END\}\}/, "http://"+ pjson.builder_host_name + ":" + pjson.builder_rest_port +"/rest/");
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
                    row.layout_image.name = row.floor_plan_name;
                    row.layout_image.id = row.id;
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
        db.getScannedCoords(data.fp_id, data.interpolated === "true", function(err, rows){
            res.send(rows);
        });
    }

    saveReadings(req, res){
        let log = this.log;
        log.log("/rest/saveReadings");
        const data = req.body;
        log.log(data);
        if(data.payload === undefined){
            return res.send({success: false, message: "missing payload"});
        }
        this.db.saveReadings(data.payload, (fp_id) => {
            res.send({success: true});
            this.notifyListeners({
                action: 'NEW_READING',
                fp_id: fp_id
            });
        });

    }

    runLocalizer(req, res) {
        const fp_id = data.fp_id;
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
        this.log.log("/rest/localize");
        const data = req.body;
        const id = data.device_id;
        const fp_id = data.fp_id;
        let steps = [];
        if(data.steps) {
            steps = data.steps;
        }
        let particleNumber = 20;
        if(data.particleNumber) {
            particleNumber = Number(data.particleNumber);
        }

        let alphaValue = 2;
        if(data.alphaValue) {
            alphaValue = data.alphaValue;
        }

        if(false) {
            this.saveWalkToFile(data);
        }

        this.db.createFeaturesCache(fp_id)
            .then(() => this.moveParticles(data, id, particleNumber, alphaValue))
            .then(this.doubleCluster)
            .then((lc: LargeClusterResponse) => {
                return new FinalResponse(lc)
            })
            .then((fr: FinalResponse) => {


                let particles = fr.particles;
                let unique = fr.unique;
                let allParticles = fr.all;
                let largeClusters = fr.largeClusters;
                let guess = fr.guess;
                let neighbors = fr.largestCluster.slice(0, 5)
                    .map((i) => {
                        return {x: i[0], y: i[1], weight: i[2]};
                    });

                this.worker.setPreviousState(id, guess);
                res.send({
                    success: true,
                    id: id,
                    guess: guess,
                    type: data.type,
                    particles: particles,
                    neighbors: neighbors,
                    clusters: largeClusters
                });
                this.notifyListeners({
                    action: 'LOCALIZE',
                    id: id,
                    guess: guess,
                    type: data.type,
                    particles: particles,
                    clusters: largeClusters,
                    fp_id: data.fp_id,
                    neighbors: neighbors,
                    all_particles: allParticles,
                    steps: steps
                });
            }
        );
    }

    saveWalkToFile(data){
        let dir = "db/walk_data";

        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }

        let walkData = {};

        try {
            walkData = JSON.parse(fs.readFileSync(`${dir}/${id}.json`, "utf8"));
        }catch(e){
            walkData = {walk: [], fpId: fp_id}
        }

        walkData.walk.push(data.ap_ids);

        fs.writeFileSync(`${dir}/${id}.json`, JSON.stringify(walkData));
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

        app.post('/rest/runLocalizer', this.jsonHeaders, (req, res) => {
            this.runLocalizer(req, res);
        });

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

        app.get("/rest/getScannedCoords/:fp_id/:interpolated", this.jsonHeaders, (req, res) => {
            this.getScannedCoords(req, res);
        });

        app.post("/rest/resetLocalizer", this.jsonHeaders, (req, res) => {
            const data = req.body;
            const fp_id = data.fp_id;
            const id = data.device_id;

            this.db.clearFeaturesCache(fp_id);
            delete this.worker.particles[id];
            res.send({success: true});
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
