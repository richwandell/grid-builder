import Ssdp from './Ssdp';
import RestServer from './RestServer';
import WebSocketServer from './WebSocketServer';
const numCPUs = require('os').cpus().length;
const debug = process.execArgv.indexOf('--debug') > -1 || process.execArgv.indexOf('--debug-brk') > -1;
const cluster = require('cluster');
const pjson = require('../../package.json');

class Server {

    send(data){
        if(!this.debug) {
            process.send(data);
        }else{
            this.onWorkerMessage(data);
        }
    }

    constructor(numWorker: Number, debug: boolean) {
        this.debug = debug;
        this.workers = [];

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
        w.on('message', (message) => {
            this.onWorkerMessage(message);
        });
        this.workers.push(w);
    }

    onMainMessage(message) {
        console.log("Main Message: " + process.pid);
    }

    onWorkerMessage(message) {
        this.socket.send(message);
    }

    runMainWorker(){
        process.on('message', (message) => {
            this.onMainMessage(message);
        });

        cluster.on('exit', (worker, code, signal) => {
            if (worker.exitedAfterDisconnect === false) {
                this.createWorker();
            }
        });

        this.upnp = new Ssdp();
        this.upnp.startBroadcast();

        const rest = new RestServer();
        rest.createServer();
        rest.listen(this, pjson.builder_ws_port);

        this.socket = new WebSocketServer(rest.getLog(), rest.getServer());
        this.socket.startServer();

        return rest;
    }

    run() {
        const rest = new RestServer();
        rest.createServer();
        rest.listen(this, pjson.builder_rest_port);
    }
}

new Server(numCPUs, debug);




