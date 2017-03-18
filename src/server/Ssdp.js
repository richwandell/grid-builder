'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var dgram = require('dgram');
var fs = require("fs");
var Logger = require('./Log.js');
var Utils = require('./Utils.js');
var pjson = require('../../package.json');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlNzZHAuZXM2Il0sIm5hbWVzIjpbImRncmFtIiwicmVxdWlyZSIsImZzIiwiTG9nZ2VyIiwiVXRpbHMiLCJwanNvbiIsIlNlcnZlciIsImJ1aWxkZXIiLCJMb2ciLCJsb2ciLCJsb2dmb2xkZXIiLCJidWlsZGVyX2xvZ19mb2xkZXIiLCJmaWxlbmFtZSIsImZpbGVzaXplIiwibnVtZmlsZXMiLCJiIiwic2VydmVyIiwibG9jYXRpb24iLCJnZXRTZXJ2ZXJJcCIsImJ1aWxkZXJfcmVzdF9wb3J0IiwiYWRkVVNOIiwib24iLCJoZWFkZXJzIiwic3RhcnQiLCJwcm9jZXNzIiwic3RvcCIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLElBQU1BLFFBQVFDLFFBQVEsT0FBUixDQUFkO0FBQ0EsSUFBTUMsS0FBS0QsUUFBUSxJQUFSLENBQVg7QUFDQSxJQUFNRSxTQUFTRixRQUFRLFVBQVIsQ0FBZjtBQUNBLElBQU1HLFFBQVFILFFBQVEsWUFBUixDQUFkO0FBQ0EsSUFBTUksUUFBUUosUUFBUSxvQkFBUixDQUFkO0FBQ0EsSUFBTUssU0FBU0wsUUFBUSxXQUFSLEVBQXFCSyxNQUFwQztBQUNBLElBQUlDLFVBQVUsS0FBZDs7SUFFTUMsRztBQUVGLG1CQUFhO0FBQUE7O0FBQ1QsYUFBS0MsR0FBTCxHQUFXLElBQUlOLE1BQUosQ0FBVztBQUNsQk8sdUJBQVdMLE1BQU1NLGtCQURDO0FBRWxCQyxzQkFBVSxVQUZRO0FBR2xCQyxzQkFBVSxPQUhRO0FBSWxCQyxzQkFBVTtBQUpRLFNBQVgsQ0FBWDtBQU1IOzs7O2lDQUVRQyxDLEVBQUc7QUFDUlIsc0JBQVVRLENBQVY7QUFDSDs7O3lDQUVnQjtBQUNiLGdCQUFJTixNQUFNLEtBQUtBLEdBQWY7QUFDQSxnQkFBTU8sU0FBUyxJQUFJVixNQUFKLENBQVc7QUFDdEJXLDBCQUFVLFlBQVliLE1BQU1jLFdBQU4sRUFBWixHQUFrQyxHQUFsQyxHQUFzQ2IsTUFBTWMsaUJBQTVDLEdBQThEO0FBRGxELGFBQVgsQ0FBZjs7QUFJQUgsbUJBQU9JLE1BQVAsQ0FBYyxpQkFBZDtBQUNBSixtQkFBT0ksTUFBUCxDQUFjLDJDQUFkO0FBQ0FKLG1CQUFPSSxNQUFQLENBQWMsaURBQWQ7QUFDQUosbUJBQU9JLE1BQVAsQ0FBYyxrREFBZDs7QUFFQUosbUJBQU9LLEVBQVAsQ0FBVSxpQkFBVixFQUE2QixVQUFVQyxPQUFWLEVBQW1CO0FBQzVDYixvQkFBSUEsR0FBSixDQUFRYSxPQUFSO0FBQ0gsYUFGRDs7QUFJQU4sbUJBQU9LLEVBQVAsQ0FBVSxlQUFWLEVBQTJCLFVBQVVDLE9BQVYsRUFBbUI7QUFDMUNiLG9CQUFJQSxHQUFKLENBQVFhLE9BQVI7QUFDSCxhQUZEOztBQUlBO0FBQ0FOLG1CQUFPTyxLQUFQO0FBQ0FDLG9CQUFRSCxFQUFSLENBQVcsTUFBWCxFQUFtQixZQUFZO0FBQzNCWixvQkFBSUEsR0FBSixDQUFRLE1BQVI7QUFDQU8sdUJBQU9TLElBQVA7QUFDSCxhQUhEO0FBSUg7Ozs7OztBQUlMQyxPQUFPQyxPQUFQLEdBQWlCbkIsR0FBakIiLCJmaWxlIjoiU3NkcC5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGRncmFtID0gcmVxdWlyZSgnZGdyYW0nKTtcbmNvbnN0IGZzID0gcmVxdWlyZShcImZzXCIpO1xuY29uc3QgTG9nZ2VyID0gcmVxdWlyZSgnLi9Mb2cuanMnKTtcbmNvbnN0IFV0aWxzID0gcmVxdWlyZSgnLi9VdGlscy5qcycpO1xuY29uc3QgcGpzb24gPSByZXF1aXJlKCcuLi8uLi9wYWNrYWdlLmpzb24nKTtcbmNvbnN0IFNlcnZlciA9IHJlcXVpcmUoJ25vZGUtc3NkcCcpLlNlcnZlcjtcbmxldCBidWlsZGVyID0gZmFsc2U7XG5cbmNsYXNzIExvZyB7XG5cbiAgICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgICB0aGlzLmxvZyA9IG5ldyBMb2dnZXIoe1xuICAgICAgICAgICAgbG9nZm9sZGVyOiBwanNvbi5idWlsZGVyX2xvZ19mb2xkZXIsXG4gICAgICAgICAgICBmaWxlbmFtZTogXCJzc2RwLmxvZ1wiLFxuICAgICAgICAgICAgZmlsZXNpemU6IDUwMDAwMDAsXG4gICAgICAgICAgICBudW1maWxlczogM1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZWdpc3RlcihiKSB7XG4gICAgICAgIGJ1aWxkZXIgPSBiO1xuICAgIH1cblxuICAgIHN0YXJ0QnJvYWRjYXN0KCkge1xuICAgICAgICBsZXQgbG9nID0gdGhpcy5sb2c7XG4gICAgICAgIGNvbnN0IHNlcnZlciA9IG5ldyBTZXJ2ZXIoe1xuICAgICAgICAgICAgbG9jYXRpb246ICdodHRwOi8vJyArIFV0aWxzLmdldFNlcnZlcklwKCkgKyBcIjpcIitwanNvbi5idWlsZGVyX3Jlc3RfcG9ydCtcIi9kZXZpY2VkZXNjcmlwdGlvbi54bWxcIlxuICAgICAgICB9KTtcblxuICAgICAgICBzZXJ2ZXIuYWRkVVNOKCd1cG5wOnJvb3RkZXZpY2UnKTtcbiAgICAgICAgc2VydmVyLmFkZFVTTigndXJuOnNjaGVtYXMtdXBucC1vcmc6ZGV2aWNlOk1lZGlhU2VydmVyOjEnKTtcbiAgICAgICAgc2VydmVyLmFkZFVTTigndXJuOnNjaGVtYXMtdXBucC1vcmc6c2VydmljZTpDb250ZW50RGlyZWN0b3J5OjEnKTtcbiAgICAgICAgc2VydmVyLmFkZFVTTigndXJuOnNjaGVtYXMtdXBucC1vcmc6c2VydmljZTpDb25uZWN0aW9uTWFuYWdlcjoxJyk7XG5cbiAgICAgICAgc2VydmVyLm9uKCdhZHZlcnRpc2UtYWxpdmUnLCBmdW5jdGlvbiAoaGVhZGVycykge1xuICAgICAgICAgICAgbG9nLmxvZyhoZWFkZXJzKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc2VydmVyLm9uKCdhZHZlcnRpc2UtYnllJywgZnVuY3Rpb24gKGhlYWRlcnMpIHtcbiAgICAgICAgICAgIGxvZy5sb2coaGVhZGVycyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIHN0YXJ0IHRoZSBzZXJ2ZXJcbiAgICAgICAgc2VydmVyLnN0YXJ0KCk7XG4gICAgICAgIHByb2Nlc3Mub24oJ2V4aXQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsb2cubG9nKFwiZXhpdFwiKTtcbiAgICAgICAgICAgIHNlcnZlci5zdG9wKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IExvZztcbiJdfQ==
//# sourceMappingURL=Ssdp.js.map
