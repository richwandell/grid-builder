import Logger from './Log';

const dgram = require('dgram');
const fs = require("fs");
const Utils = require('./Utils.js');
const pjson = require('../../package.json');
const Server = require('node-ssdp').Server;
let builder = false;

class Ssdp {

    constructor(){
        this.log = new Logger({
            logfolder: pjson.builder_log_folder,
            filename: "ssdp.log",
            filesize: 5000000,
            numfiles: 3
        });
    }

    register(b) {
        builder = b;
    }

    startBroadcast() {
        let log = this.log;
        const server = new Server({
            location: 'http://' + Utils.getServerIp() + ":"+pjson.builder_rest_port+"/devicedescription.xml"
        });

        server.addUSN('upnp:rootdevice');
        server.addUSN('urn:schemas-upnp-org:device:MediaServer:1');
        server.addUSN('urn:schemas-upnp-org:service:ContentDirectory:1');
        server.addUSN('urn:schemas-upnp-org:service:ConnectionManager:1');

        server.on('advertise-alive', function (headers) {
            log.log(headers);
        });

        server.on('advertise-bye', function (headers) {
            log.log(headers);
        });

        // start the server
        server.start();
        process.on('exit', function () {
            log.log("exit");
            server.stop();
        });
    }
}


export default Ssdp;
