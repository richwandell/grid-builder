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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlNzZHAuZXM2Il0sIm5hbWVzIjpbImRncmFtIiwicmVxdWlyZSIsImZzIiwiTG9nZ2VyIiwiVXRpbHMiLCJwanNvbiIsIlNlcnZlciIsImJ1aWxkZXIiLCJTc2RwIiwibG9nIiwibG9nZm9sZGVyIiwiYnVpbGRlcl9sb2dfZm9sZGVyIiwiZmlsZW5hbWUiLCJmaWxlc2l6ZSIsIm51bWZpbGVzIiwiYiIsInNlcnZlciIsImxvY2F0aW9uIiwiZ2V0U2VydmVySXAiLCJidWlsZGVyX3Jlc3RfcG9ydCIsImFkZFVTTiIsIm9uIiwiaGVhZGVycyIsInN0YXJ0IiwicHJvY2VzcyIsInN0b3AiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxJQUFNQSxRQUFRQyxRQUFRLE9BQVIsQ0FBZDtBQUNBLElBQU1DLEtBQUtELFFBQVEsSUFBUixDQUFYO0FBQ0EsSUFBTUUsU0FBU0YsUUFBUSxVQUFSLENBQWY7QUFDQSxJQUFNRyxRQUFRSCxRQUFRLFlBQVIsQ0FBZDtBQUNBLElBQU1JLFFBQVFKLFFBQVEsb0JBQVIsQ0FBZDtBQUNBLElBQU1LLFNBQVNMLFFBQVEsV0FBUixFQUFxQkssTUFBcEM7QUFDQSxJQUFJQyxVQUFVLEtBQWQ7O0lBRU1DLEk7QUFFRixvQkFBYTtBQUFBOztBQUNULGFBQUtDLEdBQUwsR0FBVyxJQUFJTixNQUFKLENBQVc7QUFDbEJPLHVCQUFXTCxNQUFNTSxrQkFEQztBQUVsQkMsc0JBQVUsVUFGUTtBQUdsQkMsc0JBQVUsT0FIUTtBQUlsQkMsc0JBQVU7QUFKUSxTQUFYLENBQVg7QUFNSDs7OztpQ0FFUUMsQyxFQUFHO0FBQ1JSLHNCQUFVUSxDQUFWO0FBQ0g7Ozt5Q0FFZ0I7QUFDYixnQkFBSU4sTUFBTSxLQUFLQSxHQUFmO0FBQ0EsZ0JBQU1PLFNBQVMsSUFBSVYsTUFBSixDQUFXO0FBQ3RCVywwQkFBVSxZQUFZYixNQUFNYyxXQUFOLEVBQVosR0FBa0MsR0FBbEMsR0FBc0NiLE1BQU1jLGlCQUE1QyxHQUE4RDtBQURsRCxhQUFYLENBQWY7O0FBSUFILG1CQUFPSSxNQUFQLENBQWMsaUJBQWQ7QUFDQUosbUJBQU9JLE1BQVAsQ0FBYywyQ0FBZDtBQUNBSixtQkFBT0ksTUFBUCxDQUFjLGlEQUFkO0FBQ0FKLG1CQUFPSSxNQUFQLENBQWMsa0RBQWQ7O0FBRUFKLG1CQUFPSyxFQUFQLENBQVUsaUJBQVYsRUFBNkIsVUFBVUMsT0FBVixFQUFtQjtBQUM1Q2Isb0JBQUlBLEdBQUosQ0FBUWEsT0FBUjtBQUNILGFBRkQ7O0FBSUFOLG1CQUFPSyxFQUFQLENBQVUsZUFBVixFQUEyQixVQUFVQyxPQUFWLEVBQW1CO0FBQzFDYixvQkFBSUEsR0FBSixDQUFRYSxPQUFSO0FBQ0gsYUFGRDs7QUFJQTtBQUNBTixtQkFBT08sS0FBUDtBQUNBQyxvQkFBUUgsRUFBUixDQUFXLE1BQVgsRUFBbUIsWUFBWTtBQUMzQlosb0JBQUlBLEdBQUosQ0FBUSxNQUFSO0FBQ0FPLHVCQUFPUyxJQUFQO0FBQ0gsYUFIRDtBQUlIOzs7Ozs7a0JBSVVqQixJIiwiZmlsZSI6IlNzZHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBkZ3JhbSA9IHJlcXVpcmUoJ2RncmFtJyk7XG5jb25zdCBmcyA9IHJlcXVpcmUoXCJmc1wiKTtcbmNvbnN0IExvZ2dlciA9IHJlcXVpcmUoJy4vTG9nLmpzJyk7XG5jb25zdCBVdGlscyA9IHJlcXVpcmUoJy4vVXRpbHMuanMnKTtcbmNvbnN0IHBqc29uID0gcmVxdWlyZSgnLi4vLi4vcGFja2FnZS5qc29uJyk7XG5jb25zdCBTZXJ2ZXIgPSByZXF1aXJlKCdub2RlLXNzZHAnKS5TZXJ2ZXI7XG5sZXQgYnVpbGRlciA9IGZhbHNlO1xuXG5jbGFzcyBTc2RwIHtcblxuICAgIGNvbnN0cnVjdG9yKCl7XG4gICAgICAgIHRoaXMubG9nID0gbmV3IExvZ2dlcih7XG4gICAgICAgICAgICBsb2dmb2xkZXI6IHBqc29uLmJ1aWxkZXJfbG9nX2ZvbGRlcixcbiAgICAgICAgICAgIGZpbGVuYW1lOiBcInNzZHAubG9nXCIsXG4gICAgICAgICAgICBmaWxlc2l6ZTogNTAwMDAwMCxcbiAgICAgICAgICAgIG51bWZpbGVzOiAzXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlZ2lzdGVyKGIpIHtcbiAgICAgICAgYnVpbGRlciA9IGI7XG4gICAgfVxuXG4gICAgc3RhcnRCcm9hZGNhc3QoKSB7XG4gICAgICAgIGxldCBsb2cgPSB0aGlzLmxvZztcbiAgICAgICAgY29uc3Qgc2VydmVyID0gbmV3IFNlcnZlcih7XG4gICAgICAgICAgICBsb2NhdGlvbjogJ2h0dHA6Ly8nICsgVXRpbHMuZ2V0U2VydmVySXAoKSArIFwiOlwiK3Bqc29uLmJ1aWxkZXJfcmVzdF9wb3J0K1wiL2RldmljZWRlc2NyaXB0aW9uLnhtbFwiXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHNlcnZlci5hZGRVU04oJ3VwbnA6cm9vdGRldmljZScpO1xuICAgICAgICBzZXJ2ZXIuYWRkVVNOKCd1cm46c2NoZW1hcy11cG5wLW9yZzpkZXZpY2U6TWVkaWFTZXJ2ZXI6MScpO1xuICAgICAgICBzZXJ2ZXIuYWRkVVNOKCd1cm46c2NoZW1hcy11cG5wLW9yZzpzZXJ2aWNlOkNvbnRlbnREaXJlY3Rvcnk6MScpO1xuICAgICAgICBzZXJ2ZXIuYWRkVVNOKCd1cm46c2NoZW1hcy11cG5wLW9yZzpzZXJ2aWNlOkNvbm5lY3Rpb25NYW5hZ2VyOjEnKTtcblxuICAgICAgICBzZXJ2ZXIub24oJ2FkdmVydGlzZS1hbGl2ZScsIGZ1bmN0aW9uIChoZWFkZXJzKSB7XG4gICAgICAgICAgICBsb2cubG9nKGhlYWRlcnMpO1xuICAgICAgICB9KTtcblxuICAgICAgICBzZXJ2ZXIub24oJ2FkdmVydGlzZS1ieWUnLCBmdW5jdGlvbiAoaGVhZGVycykge1xuICAgICAgICAgICAgbG9nLmxvZyhoZWFkZXJzKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gc3RhcnQgdGhlIHNlcnZlclxuICAgICAgICBzZXJ2ZXIuc3RhcnQoKTtcbiAgICAgICAgcHJvY2Vzcy5vbignZXhpdCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxvZy5sb2coXCJleGl0XCIpO1xuICAgICAgICAgICAgc2VydmVyLnN0b3AoKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5cbmV4cG9ydCBkZWZhdWx0IFNzZHA7XG4iXX0=
//# sourceMappingURL=Ssdp.js.map
