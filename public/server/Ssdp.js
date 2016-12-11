var dgram = require('dgram');
var fs = require("fs");
var builder = false;
var log = require('./Log.js');
var Utils = require('./Utils.js');
var exports = {};
var pjson = require('../../package.json');


log = new log("ssdp.log");

exports.register = function(b){
    builder = b;
};

exports.startBroadcast = function () {
    var Server = require('node-ssdp').Server,
        server = new Server({
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
};

module.exports = exports;
