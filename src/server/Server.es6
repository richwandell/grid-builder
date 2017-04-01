import Ssdp from './Ssdp';
import RestServer from './RestServer';
import WebSocketServer from './WebSocketServer';
const numCPUs = require('os').cpus().length;
const debug = process.execArgv.indexOf('--debug') > -1 || process.execArgv.indexOf('--debug-brk') > -1;
const cluster = require('cluster');

class Server {

    constructor(numWorker: Number, debug: boolean) {
        this.debug = debug;
        this.workers = [];
        if (cluster.isMaster && !debug) {
            this.runtMainWorker();

            process.on('message', (message) => {
                this.onMainMessage(message);
            });

            for (let i = 0; i < numWorker; i++) {
                let w = cluster.fork();

                w.on('message', (message) => {
                    this.onWorkerMessage(message);
                });

                this.workers.push(w);
            }
        }else {
            this.run();
        }
    }

    onMainMessage(message) {
        console.log(message);
    }

    onWorkerMessage(message) {
        console.log(message);
    }

    runtMainWorker(){
        const upnp = new Ssdp();
        upnp.startBroadcast();

        const rest = new RestServer();
        rest.createServer();

        const socket = new WebSocketServer(rest.getLog(), rest.getServer());
        socket.startServer();

        return rest;
    }

    run() {
        const rest = new RestServer();
        rest.createServer();
        rest.listen(this);
    }
}

new Server(numCPUs, debug);




