'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var dgram = require('dgram');
var fs = require("fs");
var Logger = require('./Log.js');
var Utils = require('./Utils.js');
var pjson = require('../../package.json');
var Server = require('node-ssdp').Server;
var builder = false;

var Ssdp = function () {
    function Ssdp() {
        _classCallCheck(this, Ssdp);

        this.log = new Logger({
            logfolder: pjson.builder_log_folder,
            filename: "ssdp.log",
            filesize: 5000000,
            numfiles: 3
        });
    }

    _createClass(Ssdp, [{
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

    return Ssdp;
}();

exports.default = Ssdp;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvU3NkcC5lczYiXSwibmFtZXMiOlsiZGdyYW0iLCJyZXF1aXJlIiwiZnMiLCJMb2dnZXIiLCJVdGlscyIsInBqc29uIiwiU2VydmVyIiwiYnVpbGRlciIsIlNzZHAiLCJsb2ciLCJsb2dmb2xkZXIiLCJidWlsZGVyX2xvZ19mb2xkZXIiLCJmaWxlbmFtZSIsImZpbGVzaXplIiwibnVtZmlsZXMiLCJiIiwic2VydmVyIiwibG9jYXRpb24iLCJnZXRTZXJ2ZXJJcCIsImJ1aWxkZXJfcmVzdF9wb3J0IiwiYWRkVVNOIiwib24iLCJoZWFkZXJzIiwic3RhcnQiLCJwcm9jZXNzIiwic3RvcCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLElBQU1BLFFBQVFDLFFBQVEsT0FBUixDQUFkO0FBQ0EsSUFBTUMsS0FBS0QsUUFBUSxJQUFSLENBQVg7QUFDQSxJQUFNRSxTQUFTRixRQUFRLFVBQVIsQ0FBZjtBQUNBLElBQU1HLFFBQVFILFFBQVEsWUFBUixDQUFkO0FBQ0EsSUFBTUksUUFBUUosUUFBUSxvQkFBUixDQUFkO0FBQ0EsSUFBTUssU0FBU0wsUUFBUSxXQUFSLEVBQXFCSyxNQUFwQztBQUNBLElBQUlDLFVBQVUsS0FBZDs7SUFFTUMsSTtBQUVGLG9CQUFhO0FBQUE7O0FBQ1QsYUFBS0MsR0FBTCxHQUFXLElBQUlOLE1BQUosQ0FBVztBQUNsQk8sdUJBQVdMLE1BQU1NLGtCQURDO0FBRWxCQyxzQkFBVSxVQUZRO0FBR2xCQyxzQkFBVSxPQUhRO0FBSWxCQyxzQkFBVTtBQUpRLFNBQVgsQ0FBWDtBQU1IOzs7O2lDQUVRQyxDLEVBQUc7QUFDUlIsc0JBQVVRLENBQVY7QUFDSDs7O3lDQUVnQjtBQUNiLGdCQUFJTixNQUFNLEtBQUtBLEdBQWY7QUFDQSxnQkFBTU8sU0FBUyxJQUFJVixNQUFKLENBQVc7QUFDdEJXLDBCQUFVLFlBQVliLE1BQU1jLFdBQU4sRUFBWixHQUFrQyxHQUFsQyxHQUFzQ2IsTUFBTWMsaUJBQTVDLEdBQThEO0FBRGxELGFBQVgsQ0FBZjs7QUFJQUgsbUJBQU9JLE1BQVAsQ0FBYyxpQkFBZDtBQUNBSixtQkFBT0ksTUFBUCxDQUFjLDJDQUFkO0FBQ0FKLG1CQUFPSSxNQUFQLENBQWMsaURBQWQ7QUFDQUosbUJBQU9JLE1BQVAsQ0FBYyxrREFBZDs7QUFFQUosbUJBQU9LLEVBQVAsQ0FBVSxpQkFBVixFQUE2QixVQUFVQyxPQUFWLEVBQW1CO0FBQzVDYixvQkFBSUEsR0FBSixDQUFRYSxPQUFSO0FBQ0gsYUFGRDs7QUFJQU4sbUJBQU9LLEVBQVAsQ0FBVSxlQUFWLEVBQTJCLFVBQVVDLE9BQVYsRUFBbUI7QUFDMUNiLG9CQUFJQSxHQUFKLENBQVFhLE9BQVI7QUFDSCxhQUZEOztBQUlBO0FBQ0FOLG1CQUFPTyxLQUFQO0FBQ0FDLG9CQUFRSCxFQUFSLENBQVcsTUFBWCxFQUFtQixZQUFZO0FBQzNCWixvQkFBSUEsR0FBSixDQUFRLE1BQVI7QUFDQU8sdUJBQU9TLElBQVA7QUFDSCxhQUhEO0FBSUg7Ozs7OztrQkFJVWpCLEkiLCJmaWxlIjoiU3NkcC5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGRncmFtID0gcmVxdWlyZSgnZGdyYW0nKTtcbmNvbnN0IGZzID0gcmVxdWlyZShcImZzXCIpO1xuY29uc3QgTG9nZ2VyID0gcmVxdWlyZSgnLi9Mb2cuanMnKTtcbmNvbnN0IFV0aWxzID0gcmVxdWlyZSgnLi9VdGlscy5qcycpO1xuY29uc3QgcGpzb24gPSByZXF1aXJlKCcuLi8uLi9wYWNrYWdlLmpzb24nKTtcbmNvbnN0IFNlcnZlciA9IHJlcXVpcmUoJ25vZGUtc3NkcCcpLlNlcnZlcjtcbmxldCBidWlsZGVyID0gZmFsc2U7XG5cbmNsYXNzIFNzZHAge1xuXG4gICAgY29uc3RydWN0b3IoKXtcbiAgICAgICAgdGhpcy5sb2cgPSBuZXcgTG9nZ2VyKHtcbiAgICAgICAgICAgIGxvZ2ZvbGRlcjogcGpzb24uYnVpbGRlcl9sb2dfZm9sZGVyLFxuICAgICAgICAgICAgZmlsZW5hbWU6IFwic3NkcC5sb2dcIixcbiAgICAgICAgICAgIGZpbGVzaXplOiA1MDAwMDAwLFxuICAgICAgICAgICAgbnVtZmlsZXM6IDNcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVnaXN0ZXIoYikge1xuICAgICAgICBidWlsZGVyID0gYjtcbiAgICB9XG5cbiAgICBzdGFydEJyb2FkY2FzdCgpIHtcbiAgICAgICAgbGV0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBjb25zdCBzZXJ2ZXIgPSBuZXcgU2VydmVyKHtcbiAgICAgICAgICAgIGxvY2F0aW9uOiAnaHR0cDovLycgKyBVdGlscy5nZXRTZXJ2ZXJJcCgpICsgXCI6XCIrcGpzb24uYnVpbGRlcl9yZXN0X3BvcnQrXCIvZGV2aWNlZGVzY3JpcHRpb24ueG1sXCJcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc2VydmVyLmFkZFVTTigndXBucDpyb290ZGV2aWNlJyk7XG4gICAgICAgIHNlcnZlci5hZGRVU04oJ3VybjpzY2hlbWFzLXVwbnAtb3JnOmRldmljZTpNZWRpYVNlcnZlcjoxJyk7XG4gICAgICAgIHNlcnZlci5hZGRVU04oJ3VybjpzY2hlbWFzLXVwbnAtb3JnOnNlcnZpY2U6Q29udGVudERpcmVjdG9yeToxJyk7XG4gICAgICAgIHNlcnZlci5hZGRVU04oJ3VybjpzY2hlbWFzLXVwbnAtb3JnOnNlcnZpY2U6Q29ubmVjdGlvbk1hbmFnZXI6MScpO1xuXG4gICAgICAgIHNlcnZlci5vbignYWR2ZXJ0aXNlLWFsaXZlJywgZnVuY3Rpb24gKGhlYWRlcnMpIHtcbiAgICAgICAgICAgIGxvZy5sb2coaGVhZGVycyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHNlcnZlci5vbignYWR2ZXJ0aXNlLWJ5ZScsIGZ1bmN0aW9uIChoZWFkZXJzKSB7XG4gICAgICAgICAgICBsb2cubG9nKGhlYWRlcnMpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBzdGFydCB0aGUgc2VydmVyXG4gICAgICAgIHNlcnZlci5zdGFydCgpO1xuICAgICAgICBwcm9jZXNzLm9uKCdleGl0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbG9nLmxvZyhcImV4aXRcIik7XG4gICAgICAgICAgICBzZXJ2ZXIuc3RvcCgpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cblxuZXhwb3J0IGRlZmF1bHQgU3NkcDtcbiJdfQ==
//# sourceMappingURL=Ssdp.js.map
