'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Ssdp = require('./Ssdp');

var _Ssdp2 = _interopRequireDefault(_Ssdp);

var _RestServer = require('./RestServer');

var _RestServer2 = _interopRequireDefault(_RestServer);

var _WebSocketServer = require('./WebSocketServer');

var _WebSocketServer2 = _interopRequireDefault(_WebSocketServer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var numCPUs = require('os').cpus().length;
var debug = process.execArgv.indexOf('--debug') > -1 || process.execArgv.indexOf('--debug-brk') > -1;
var cluster = require('cluster');
var pjson = require('../../package.json');

var Server = function () {
    _createClass(Server, [{
        key: 'send',
        value: function send(data) {
            if (!this.debug) {
                process.send(data);
            } else {
                this.onWorkerMessage(data);
            }
        }
    }]);

    function Server(numWorker, debug) {
        _classCallCheck(this, Server);

        this.debug = debug;
        this.workers = [];

        if (debug) {
            this.runMainWorker();
            this.run();
        } else if (cluster.isMaster) {
            this.runMainWorker();

            for (var i = 0; i < numWorker; i++) {
                this.createWorker();
            }
        } else {
            this.run();
        }
    }

    _createClass(Server, [{
        key: 'createWorker',
        value: function createWorker() {
            var _this = this;

            var w = cluster.fork();
            w.on('message', function (message) {
                _this.onWorkerMessage(message);
            });
            this.workers.push(w);
        }
    }, {
        key: 'onMainMessage',
        value: function onMainMessage(message) {
            console.log("Main Message: " + process.pid);
        }
    }, {
        key: 'onWorkerMessage',
        value: function onWorkerMessage(message) {
            this.socket.send(message);
        }
    }, {
        key: 'runMainWorker',
        value: function runMainWorker() {
            var _this2 = this;

            process.on('message', function (message) {
                _this2.onMainMessage(message);
            });

            cluster.on('exit', function (worker, code, signal) {
                if (worker.exitedAfterDisconnect === false) {
                    _this2.createWorker();
                }
            });

            this.upnp = new _Ssdp2.default();
            this.upnp.startBroadcast();

            var rest = new _RestServer2.default();
            rest.createServer();
            rest.listen(this, pjson.builder_ws_port);

            this.socket = new _WebSocketServer2.default(rest.getLog(), rest.getServer());
            this.socket.startServer();

            return rest;
        }
    }, {
        key: 'run',
        value: function run() {
            var rest = new _RestServer2.default();
            rest.createServer();
            rest.listen(this, pjson.builder_rest_port);
        }
    }]);

    return Server;
}();

new Server(numCPUs, debug);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvU2VydmVyLmVzNiJdLCJuYW1lcyI6WyJudW1DUFVzIiwicmVxdWlyZSIsImNwdXMiLCJsZW5ndGgiLCJkZWJ1ZyIsInByb2Nlc3MiLCJleGVjQXJndiIsImluZGV4T2YiLCJjbHVzdGVyIiwicGpzb24iLCJTZXJ2ZXIiLCJkYXRhIiwic2VuZCIsIm9uV29ya2VyTWVzc2FnZSIsIm51bVdvcmtlciIsIndvcmtlcnMiLCJydW5NYWluV29ya2VyIiwicnVuIiwiaXNNYXN0ZXIiLCJpIiwiY3JlYXRlV29ya2VyIiwidyIsImZvcmsiLCJvbiIsIm1lc3NhZ2UiLCJwdXNoIiwiY29uc29sZSIsImxvZyIsInBpZCIsInNvY2tldCIsIm9uTWFpbk1lc3NhZ2UiLCJ3b3JrZXIiLCJjb2RlIiwic2lnbmFsIiwiZXhpdGVkQWZ0ZXJEaXNjb25uZWN0IiwidXBucCIsInN0YXJ0QnJvYWRjYXN0IiwicmVzdCIsImNyZWF0ZVNlcnZlciIsImxpc3RlbiIsImJ1aWxkZXJfd3NfcG9ydCIsImdldExvZyIsImdldFNlcnZlciIsInN0YXJ0U2VydmVyIiwiYnVpbGRlcl9yZXN0X3BvcnQiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTs7OztBQUNBOzs7O0FBQ0E7Ozs7Ozs7O0FBQ0EsSUFBTUEsVUFBVUMsUUFBUSxJQUFSLEVBQWNDLElBQWQsR0FBcUJDLE1BQXJDO0FBQ0EsSUFBTUMsUUFBUUMsUUFBUUMsUUFBUixDQUFpQkMsT0FBakIsQ0FBeUIsU0FBekIsSUFBc0MsQ0FBQyxDQUF2QyxJQUE0Q0YsUUFBUUMsUUFBUixDQUFpQkMsT0FBakIsQ0FBeUIsYUFBekIsSUFBMEMsQ0FBQyxDQUFyRztBQUNBLElBQU1DLFVBQVVQLFFBQVEsU0FBUixDQUFoQjtBQUNBLElBQU1RLFFBQVFSLFFBQVEsb0JBQVIsQ0FBZDs7SUFFTVMsTTs7OzZCQUVHQyxJLEVBQUs7QUFDTixnQkFBRyxDQUFDLEtBQUtQLEtBQVQsRUFBZ0I7QUFDWkMsd0JBQVFPLElBQVIsQ0FBYUQsSUFBYjtBQUNILGFBRkQsTUFFSztBQUNELHFCQUFLRSxlQUFMLENBQXFCRixJQUFyQjtBQUNIO0FBQ0o7OztBQUVELG9CQUFZRyxTQUFaLEVBQStCVixLQUEvQixFQUErQztBQUFBOztBQUMzQyxhQUFLQSxLQUFMLEdBQWFBLEtBQWI7QUFDQSxhQUFLVyxPQUFMLEdBQWUsRUFBZjs7QUFFQSxZQUFHWCxLQUFILEVBQVM7QUFDTCxpQkFBS1ksYUFBTDtBQUNBLGlCQUFLQyxHQUFMO0FBQ0gsU0FIRCxNQUdNLElBQUdULFFBQVFVLFFBQVgsRUFBb0I7QUFDdEIsaUJBQUtGLGFBQUw7O0FBRUEsaUJBQUssSUFBSUcsSUFBSSxDQUFiLEVBQWdCQSxJQUFJTCxTQUFwQixFQUErQkssR0FBL0IsRUFBb0M7QUFDaEMscUJBQUtDLFlBQUw7QUFDSDtBQUNKLFNBTkssTUFNQztBQUNILGlCQUFLSCxHQUFMO0FBQ0g7QUFDSjs7Ozt1Q0FFYTtBQUFBOztBQUNWLGdCQUFJSSxJQUFJYixRQUFRYyxJQUFSLEVBQVI7QUFDQUQsY0FBRUUsRUFBRixDQUFLLFNBQUwsRUFBZ0IsVUFBQ0MsT0FBRCxFQUFhO0FBQ3pCLHNCQUFLWCxlQUFMLENBQXFCVyxPQUFyQjtBQUNILGFBRkQ7QUFHQSxpQkFBS1QsT0FBTCxDQUFhVSxJQUFiLENBQWtCSixDQUFsQjtBQUNIOzs7c0NBRWFHLE8sRUFBUztBQUNuQkUsb0JBQVFDLEdBQVIsQ0FBWSxtQkFBbUJ0QixRQUFRdUIsR0FBdkM7QUFDSDs7O3dDQUVlSixPLEVBQVM7QUFDckIsaUJBQUtLLE1BQUwsQ0FBWWpCLElBQVosQ0FBaUJZLE9BQWpCO0FBQ0g7Ozt3Q0FFYztBQUFBOztBQUNYbkIsb0JBQVFrQixFQUFSLENBQVcsU0FBWCxFQUFzQixVQUFDQyxPQUFELEVBQWE7QUFDL0IsdUJBQUtNLGFBQUwsQ0FBbUJOLE9BQW5CO0FBQ0gsYUFGRDs7QUFJQWhCLG9CQUFRZSxFQUFSLENBQVcsTUFBWCxFQUFtQixVQUFDUSxNQUFELEVBQVNDLElBQVQsRUFBZUMsTUFBZixFQUEwQjtBQUN6QyxvQkFBSUYsT0FBT0cscUJBQVAsS0FBaUMsS0FBckMsRUFBNEM7QUFDeEMsMkJBQUtkLFlBQUw7QUFDSDtBQUNKLGFBSkQ7O0FBTUEsaUJBQUtlLElBQUwsR0FBWSxvQkFBWjtBQUNBLGlCQUFLQSxJQUFMLENBQVVDLGNBQVY7O0FBRUEsZ0JBQU1DLE9BQU8sMEJBQWI7QUFDQUEsaUJBQUtDLFlBQUw7QUFDQUQsaUJBQUtFLE1BQUwsQ0FBWSxJQUFaLEVBQWtCOUIsTUFBTStCLGVBQXhCOztBQUVBLGlCQUFLWCxNQUFMLEdBQWMsOEJBQW9CUSxLQUFLSSxNQUFMLEVBQXBCLEVBQW1DSixLQUFLSyxTQUFMLEVBQW5DLENBQWQ7QUFDQSxpQkFBS2IsTUFBTCxDQUFZYyxXQUFaOztBQUVBLG1CQUFPTixJQUFQO0FBQ0g7Ozs4QkFFSztBQUNGLGdCQUFNQSxPQUFPLDBCQUFiO0FBQ0FBLGlCQUFLQyxZQUFMO0FBQ0FELGlCQUFLRSxNQUFMLENBQVksSUFBWixFQUFrQjlCLE1BQU1tQyxpQkFBeEI7QUFDSDs7Ozs7O0FBR0wsSUFBSWxDLE1BQUosQ0FBV1YsT0FBWCxFQUFvQkksS0FBcEIiLCJmaWxlIjoiU2VydmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFNzZHAgZnJvbSAnLi9Tc2RwJztcbmltcG9ydCBSZXN0U2VydmVyIGZyb20gJy4vUmVzdFNlcnZlcic7XG5pbXBvcnQgV2ViU29ja2V0U2VydmVyIGZyb20gJy4vV2ViU29ja2V0U2VydmVyJztcbmNvbnN0IG51bUNQVXMgPSByZXF1aXJlKCdvcycpLmNwdXMoKS5sZW5ndGg7XG5jb25zdCBkZWJ1ZyA9IHByb2Nlc3MuZXhlY0FyZ3YuaW5kZXhPZignLS1kZWJ1ZycpID4gLTEgfHwgcHJvY2Vzcy5leGVjQXJndi5pbmRleE9mKCctLWRlYnVnLWJyaycpID4gLTE7XG5jb25zdCBjbHVzdGVyID0gcmVxdWlyZSgnY2x1c3RlcicpO1xuY29uc3QgcGpzb24gPSByZXF1aXJlKCcuLi8uLi9wYWNrYWdlLmpzb24nKTtcblxuY2xhc3MgU2VydmVyIHtcblxuICAgIHNlbmQoZGF0YSl7XG4gICAgICAgIGlmKCF0aGlzLmRlYnVnKSB7XG4gICAgICAgICAgICBwcm9jZXNzLnNlbmQoZGF0YSk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgdGhpcy5vbldvcmtlck1lc3NhZ2UoZGF0YSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvcihudW1Xb3JrZXI6IE51bWJlciwgZGVidWc6IGJvb2xlYW4pIHtcbiAgICAgICAgdGhpcy5kZWJ1ZyA9IGRlYnVnO1xuICAgICAgICB0aGlzLndvcmtlcnMgPSBbXTtcblxuICAgICAgICBpZihkZWJ1Zyl7XG4gICAgICAgICAgICB0aGlzLnJ1bk1haW5Xb3JrZXIoKTtcbiAgICAgICAgICAgIHRoaXMucnVuKCk7XG4gICAgICAgIH1lbHNlIGlmKGNsdXN0ZXIuaXNNYXN0ZXIpe1xuICAgICAgICAgICAgdGhpcy5ydW5NYWluV29ya2VyKCk7XG5cbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtV29ya2VyOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVdvcmtlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5ydW4oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNyZWF0ZVdvcmtlcigpe1xuICAgICAgICBsZXQgdyA9IGNsdXN0ZXIuZm9yaygpO1xuICAgICAgICB3Lm9uKCdtZXNzYWdlJywgKG1lc3NhZ2UpID0+IHtcbiAgICAgICAgICAgIHRoaXMub25Xb3JrZXJNZXNzYWdlKG1lc3NhZ2UpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy53b3JrZXJzLnB1c2godyk7XG4gICAgfVxuXG4gICAgb25NYWluTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiTWFpbiBNZXNzYWdlOiBcIiArIHByb2Nlc3MucGlkKTtcbiAgICB9XG5cbiAgICBvbldvcmtlck1lc3NhZ2UobWVzc2FnZSkge1xuICAgICAgICB0aGlzLnNvY2tldC5zZW5kKG1lc3NhZ2UpO1xuICAgIH1cblxuICAgIHJ1bk1haW5Xb3JrZXIoKXtcbiAgICAgICAgcHJvY2Vzcy5vbignbWVzc2FnZScsIChtZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLm9uTWFpbk1lc3NhZ2UobWVzc2FnZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNsdXN0ZXIub24oJ2V4aXQnLCAod29ya2VyLCBjb2RlLCBzaWduYWwpID0+IHtcbiAgICAgICAgICAgIGlmICh3b3JrZXIuZXhpdGVkQWZ0ZXJEaXNjb25uZWN0ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlV29ya2VyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMudXBucCA9IG5ldyBTc2RwKCk7XG4gICAgICAgIHRoaXMudXBucC5zdGFydEJyb2FkY2FzdCgpO1xuXG4gICAgICAgIGNvbnN0IHJlc3QgPSBuZXcgUmVzdFNlcnZlcigpO1xuICAgICAgICByZXN0LmNyZWF0ZVNlcnZlcigpO1xuICAgICAgICByZXN0Lmxpc3Rlbih0aGlzLCBwanNvbi5idWlsZGVyX3dzX3BvcnQpO1xuXG4gICAgICAgIHRoaXMuc29ja2V0ID0gbmV3IFdlYlNvY2tldFNlcnZlcihyZXN0LmdldExvZygpLCByZXN0LmdldFNlcnZlcigpKTtcbiAgICAgICAgdGhpcy5zb2NrZXQuc3RhcnRTZXJ2ZXIoKTtcblxuICAgICAgICByZXR1cm4gcmVzdDtcbiAgICB9XG5cbiAgICBydW4oKSB7XG4gICAgICAgIGNvbnN0IHJlc3QgPSBuZXcgUmVzdFNlcnZlcigpO1xuICAgICAgICByZXN0LmNyZWF0ZVNlcnZlcigpO1xuICAgICAgICByZXN0Lmxpc3Rlbih0aGlzLCBwanNvbi5idWlsZGVyX3Jlc3RfcG9ydCk7XG4gICAgfVxufVxuXG5uZXcgU2VydmVyKG51bUNQVXMsIGRlYnVnKTtcblxuXG5cblxuIl19
//# sourceMappingURL=Server.js.map
