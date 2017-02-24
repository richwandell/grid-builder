'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var dgram = require('dgram');
var fs = require("fs");
var Logger = require('./Log.js');
var Utils = require('./Utils.js');
var pjson = require('../package.json');
var Server = require('node-ssdp').Server;
var builder = false;

var Log = function () {
    function Log() {
        _classCallCheck(this, Log);

        this.log = new Logger({
            logfolder: pjson.builder_log_folder,
            filename: "ssdp.log",
            filesize: 5000000,
            numfiles: 3
        });
    }

    _createClass(Log, [{
        key: 'register',
        value: function register(b) {
            builder = b;
        }
    }, {
        key: 'startBroadcast',
        value: function startBroadcast() {
            var log = this.log;
            var server = new Server({
                location: 'http://' + Utils.getServerIp() + ":" + pjson.builder_rest_port + "/devicedescription.xml"
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
    }]);

    return Log;
}();

module.exports = Log;
//# sourceMappingURL=Ssdp.js.map
