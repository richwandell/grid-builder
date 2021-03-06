import Ssdp from './Ssdp';
import RestServer from './RestServer';
import WebSocketServer from './WebSocketServer';
import Logger from './Log';
import Db from './Db';

const numCPUs = require('os').cpus().length;
var debug = false;

process.execArgv.forEach((item) => {
    if(
        item.indexOf('--debug') > -1
        || item.indexOf('--debug-brk') > -1
        || item.indexOf('--inspect') > -1
    ){
        debug = true;
    }
});

const cluster = require('cluster');
const pjson = require('../../package.json');
const uuid = require('uuid');
const fs = require('fs');

class Server {

    send(data){
        if(!this.debug) {
            process.send(data);
        }else{
            this.onWorkerMessage(data);
        }
    }

    setPreviousState(id, newState) {
        if(typeof(this.previousState[id]) !== "undefined") {
            let state = this.previousState[id];
            state.shift();
            state.push(newState);
            this.previousState[id] = state;
            return;
        }

        this.previousState[id] = [newState, newState];
    }

    constructor(numWorker: Number, debug: boolean) {
        this.debug = debug;
        this.workers = [];
        this.particles = {};
        this.previousState = {};

        this.configure();

        if(debug){
            this.runMainWorker();
            this.run();
        }else if(cluster.isMaster){
            this.runMainWorker();

            for (let i = 0; i < numWorker; i++) {
                this.createWorker();
            }
        } else {
            this.run();
        }
    }

    createWorker(){
        let w = cluster.fork();
        // Receive messages from this worker and handle them in the master process.
        w.on('message', (message) => {
            this.onWorkerMessage(message);
        });
        this.workers.push(w);
    }

    onMainMessage(message) {
        if(message.action === undefined) return false;
        switch(message.action){
            case 'NEW_READING':
                this.db.clearFeaturesCache(message.fp_id);
                break;

            case 'LOCALIZE':
                this.particles[message.id] = message.all_particles;
                break;
        }
    }

    messageWorkers(message){
        this.workers.forEach((w) => {
            if (!w.isDead()) {
                w.send(message);
            }
        });
    }

    onWorkerMessage(message) {
        if(message.action === undefined) return false;
        switch(message.action){
            case 'NEW_READING':
                if(!this.debug) {
                    this.messageWorkers(message);
                }else{
                    this.onMainMessage(message);
                }
                break;

            case 'LOCALIZE':
                this.socket.send({
                    action: 'LOCALIZE',
                    id: message.id,
                    guess: message.guess,
                    type: message.type,
                    particles: message.particles,
                    neighbors: message.neighbors,
                    clusters: message.clusters,
                    steps: message.steps,
                    large_clusters: message.large_clusters
                });
                if(!this.debug) {
                    this.messageWorkers(message);
                }else{
                    this.onMainMessage(message);
                }
                break;
        }
    }

    configure(){
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
        this.trackingLog = new Logger({
            logfolder: pjson.builder_log_folder,
            filename: "tracking.log",
            filesize: 5000000,
            numfiles: 3
        });
        this.db = new Db(this.log, pjson.builder_db_name);
    }

    runMainWorker(){
        cluster.on('exit', (worker, code, signal) => {
            if (worker.exitedAfterDisconnect === false) {
                this.createWorker();
            }
        });

        this.upnp = new Ssdp();
        this.upnp.startBroadcast();

        const rest = new RestServer(this);
        rest.createServer();
        rest.listen(pjson.builder_ws_port);

        this.socket = new WebSocketServer(rest.getLog(), rest.getServer());
        this.socket.startServer();

        return rest;
    }

    run() {
        // Receive messages from the master process.
        process.on('message', (message) => {
            this.onMainMessage(message);
        });
        const rest = new RestServer(this);
        rest.createServer();
        rest.listen(pjson.builder_rest_port);
    }
}

new Server(numCPUs, debug);




