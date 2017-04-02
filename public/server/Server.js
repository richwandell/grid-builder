'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Ssdp = require('./Ssdp');

var _Ssdp2 = _interopRequireDefault(_Ssdp);

var _RestServer = require('./RestServer');

var _RestServer2 = _interopRequireDefault(_RestServer);

var _WebSocketServer = require('./WebSocketServer');

var _WebSocketServer2 = _interopRequireDefault(_WebSocketServer);

var _Log = require('./Log');

var _Log2 = _interopRequireDefault(_Log);

var _Db = require('./Db');

var _Db2 = _interopRequireDefault(_Db);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var numCPUs = require('os').cpus().length;
var debug = process.execArgv.indexOf('--debug') > -1 || process.execArgv.indexOf('--debug-brk') > -1;
var cluster = require('cluster');
var pjson = require('../../package.json');
var uuid = require('uuid');
var fs = require('fs');

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
        this.configure();

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
        key: 'configure',
        value: function configure() {
            this.id = uuid.v4();
            try {
                var oldUUID = fs.readFileSync(".uuid", "utf8");
                this.id = oldUUID;
            } catch (e) {
                fs.writeFileSync(".uuid", this.id);
            }

            this.log = new _Log2.default({
                logfolder: pjson.builder_log_folder,
                filename: "rest.log",
                filesize: 5000000,
                numfiles: 3
            });
            this.db = new _Db2.default(this.log);
            this.db.createTables(this.log);
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

            var rest = new _RestServer2.default(this);
            rest.createServer();
            rest.listen(pjson.builder_ws_port);

            this.socket = new _WebSocketServer2.default(rest.getLog(), rest.getServer());
            this.socket.startServer();

            return rest;
        }
    }, {
        key: 'run',
        value: function run() {
            var rest = new _RestServer2.default(this);
            rest.createServer();
            rest.listen(pjson.builder_rest_port);
        }
    }]);

    return Server;
}();

new Server(numCPUs, debug);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvU2VydmVyLmVzNiJdLCJuYW1lcyI6WyJudW1DUFVzIiwicmVxdWlyZSIsImNwdXMiLCJsZW5ndGgiLCJkZWJ1ZyIsInByb2Nlc3MiLCJleGVjQXJndiIsImluZGV4T2YiLCJjbHVzdGVyIiwicGpzb24iLCJ1dWlkIiwiZnMiLCJTZXJ2ZXIiLCJkYXRhIiwic2VuZCIsIm9uV29ya2VyTWVzc2FnZSIsIm51bVdvcmtlciIsIndvcmtlcnMiLCJjb25maWd1cmUiLCJydW5NYWluV29ya2VyIiwicnVuIiwiaXNNYXN0ZXIiLCJpIiwiY3JlYXRlV29ya2VyIiwidyIsImZvcmsiLCJvbiIsIm1lc3NhZ2UiLCJwdXNoIiwiY29uc29sZSIsImxvZyIsInBpZCIsInNvY2tldCIsImlkIiwidjQiLCJvbGRVVUlEIiwicmVhZEZpbGVTeW5jIiwiZSIsIndyaXRlRmlsZVN5bmMiLCJsb2dmb2xkZXIiLCJidWlsZGVyX2xvZ19mb2xkZXIiLCJmaWxlbmFtZSIsImZpbGVzaXplIiwibnVtZmlsZXMiLCJkYiIsImNyZWF0ZVRhYmxlcyIsIm9uTWFpbk1lc3NhZ2UiLCJ3b3JrZXIiLCJjb2RlIiwic2lnbmFsIiwiZXhpdGVkQWZ0ZXJEaXNjb25uZWN0IiwidXBucCIsInN0YXJ0QnJvYWRjYXN0IiwicmVzdCIsImNyZWF0ZVNlcnZlciIsImxpc3RlbiIsImJ1aWxkZXJfd3NfcG9ydCIsImdldExvZyIsImdldFNlcnZlciIsInN0YXJ0U2VydmVyIiwiYnVpbGRlcl9yZXN0X3BvcnQiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7OztBQUVBLElBQU1BLFVBQVVDLFFBQVEsSUFBUixFQUFjQyxJQUFkLEdBQXFCQyxNQUFyQztBQUNBLElBQU1DLFFBQVFDLFFBQVFDLFFBQVIsQ0FBaUJDLE9BQWpCLENBQXlCLFNBQXpCLElBQXNDLENBQUMsQ0FBdkMsSUFBNENGLFFBQVFDLFFBQVIsQ0FBaUJD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LFlBQUw7QUFDQUQsaUJBQUtFLE1BQUwsQ0FBWTlDLE1BQU0rQyxlQUFsQjs7QUFFQSxpQkFBS3hCLE1BQUwsR0FBYyw4QkFBb0JxQixLQUFLSSxNQUFMLEVBQXBCLEVBQW1DSixLQUFLSyxTQUFMLEVBQW5DLENBQWQ7QUFDQSxpQkFBSzFCLE1BQUwsQ0FBWTJCLFdBQVo7O0FBRUEsbUJBQU9OLElBQVA7QUFDSDs7OzhCQUVLO0FBQ0YsZ0JBQU1BLE9BQU8seUJBQWUsSUFBZixDQUFiO0FBQ0FBLGlCQUFLQyxZQUFMO0FBQ0FELGlCQUFLRSxNQUFMLENBQVk5QyxNQUFNbUQsaUJBQWxCO0FBQ0g7Ozs7OztBQUdMLElBQUloRCxNQUFKLENBQVdaLE9BQVgsRUFBb0JJLEtBQXBCIiwiZmlsZSI6IlNlcnZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTc2RwIGZyb20gJy4vU3NkcCc7XG5pbXBvcnQgUmVzdFNlcnZlciBmcm9tICcuL1Jlc3RTZXJ2ZXInO1xuaW1wb3J0IFdlYlNvY2tldFNlcnZlciBmcm9tICcuL1dlYlNvY2tldFNlcnZlcic7XG5pbXBvcnQgTG9nZ2VyIGZyb20gJy4vTG9nJztcbmltcG9ydCBEYiBmcm9tICcuL0RiJztcblxuY29uc3QgbnVtQ1BVcyA9IHJlcXVpcmUoJ29zJykuY3B1cygpLmxlbmd0aDtcbmNvbnN0IGRlYnVnID0gcHJvY2Vzcy5leGVjQXJndi5pbmRleE9mKCctLWRlYnVnJykgPiAtMSB8fCBwcm9jZXNzLmV4ZWNBcmd2LmluZGV4T2YoJy0tZGVidWctYnJrJykgPiAtMTtcbmNvbnN0IGNsdXN0ZXIgPSByZXF1aXJlKCdjbHVzdGVyJyk7XG5jb25zdCBwanNvbiA9IHJlcXVpcmUoJy4uLy4uL3BhY2thZ2UuanNvbicpO1xuY29uc3QgdXVpZCA9IHJlcXVpcmUoJ3V1aWQnKTtcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcblxuY2xhc3MgU2VydmVyIHtcblxuICAgIHNlbmQoZGF0YSl7XG4gICAgICAgIGlmKCF0aGlzLmRlYnVnKSB7XG4gICAgICAgICAgICBwcm9jZXNzLnNlbmQoZGF0YSk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgdGhpcy5vbldvcmtlck1lc3NhZ2UoZGF0YSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvcihudW1Xb3JrZXI6IE51bWJlciwgZGVidWc6IGJvb2xlYW4pIHtcbiAgICAgICAgdGhpcy5kZWJ1ZyA9IGRlYnVnO1xuICAgICAgICB0aGlzLndvcmtlcnMgPSBbXTtcbiAgICAgICAgdGhpcy5jb25maWd1cmUoKTtcblxuICAgICAgICBpZihkZWJ1Zyl7XG4gICAgICAgICAgICB0aGlzLnJ1bk1haW5Xb3JrZXIoKTtcbiAgICAgICAgICAgIHRoaXMucnVuKCk7XG4gICAgICAgIH1lbHNlIGlmKGNsdXN0ZXIuaXNNYXN0ZXIpe1xuICAgICAgICAgICAgdGhpcy5ydW5NYWluV29ya2VyKCk7XG5cbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtV29ya2VyOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVdvcmtlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5ydW4oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNyZWF0ZVdvcmtlcigpe1xuICAgICAgICBsZXQgdyA9IGNsdXN0ZXIuZm9yaygpO1xuICAgICAgICB3Lm9uKCdtZXNzYWdlJywgKG1lc3NhZ2UpID0+IHtcbiAgICAgICAgICAgIHRoaXMub25Xb3JrZXJNZXNzYWdlKG1lc3NhZ2UpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy53b3JrZXJzLnB1c2godyk7XG4gICAgfVxuXG4gICAgb25NYWluTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiTWFpbiBNZXNzYWdlOiBcIiArIHByb2Nlc3MucGlkKTtcbiAgICB9XG5cbiAgICBvbldvcmtlck1lc3NhZ2UobWVzc2FnZSkge1xuICAgICAgICB0aGlzLnNvY2tldC5zZW5kKG1lc3NhZ2UpO1xuICAgIH1cblxuICAgIGNvbmZpZ3VyZSgpe1xuICAgICAgICB0aGlzLmlkID0gdXVpZC52NCgpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IG9sZFVVSUQgPSBmcy5yZWFkRmlsZVN5bmMoXCIudXVpZFwiLCBcInV0ZjhcIik7XG4gICAgICAgICAgICB0aGlzLmlkID0gb2xkVVVJRDtcbiAgICAgICAgfWNhdGNoKGUpe1xuICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhcIi51dWlkXCIsIHRoaXMuaWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5sb2cgPSBuZXcgTG9nZ2VyKHtcbiAgICAgICAgICAgIGxvZ2ZvbGRlcjogcGpzb24uYnVpbGRlcl9sb2dfZm9sZGVyLFxuICAgICAgICAgICAgZmlsZW5hbWU6IFwicmVzdC5sb2dcIixcbiAgICAgICAgICAgIGZpbGVzaXplOiA1MDAwMDAwLFxuICAgICAgICAgICAgbnVtZmlsZXM6IDNcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZGIgPSBuZXcgRGIodGhpcy5sb2cpO1xuICAgICAgICB0aGlzLmRiLmNyZWF0ZVRhYmxlcyh0aGlzLmxvZyk7XG4gICAgfVxuXG4gICAgcnVuTWFpbldvcmtlcigpe1xuXG4gICAgICAgIHByb2Nlc3Mub24oJ21lc3NhZ2UnLCAobWVzc2FnZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5vbk1haW5NZXNzYWdlKG1lc3NhZ2UpO1xuICAgICAgICB9KTtcblxuICAgICAgICBjbHVzdGVyLm9uKCdleGl0JywgKHdvcmtlciwgY29kZSwgc2lnbmFsKSA9PiB7XG4gICAgICAgICAgICBpZiAod29ya2VyLmV4aXRlZEFmdGVyRGlzY29ubmVjdCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVdvcmtlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnVwbnAgPSBuZXcgU3NkcCgpO1xuICAgICAgICB0aGlzLnVwbnAuc3RhcnRCcm9hZGNhc3QoKTtcblxuICAgICAgICBjb25zdCByZXN0ID0gbmV3IFJlc3RTZXJ2ZXIodGhpcyk7XG4gICAgICAgIHJlc3QuY3JlYXRlU2VydmVyKCk7XG4gICAgICAgIHJlc3QubGlzdGVuKHBqc29uLmJ1aWxkZXJfd3NfcG9ydCk7XG5cbiAgICAgICAgdGhpcy5zb2NrZXQgPSBuZXcgV2ViU29ja2V0U2VydmVyKHJlc3QuZ2V0TG9nKCksIHJlc3QuZ2V0U2VydmVyKCkpO1xuICAgICAgICB0aGlzLnNvY2tldC5zdGFydFNlcnZlcigpO1xuXG4gICAgICAgIHJldHVybiByZXN0O1xuICAgIH1cblxuICAgIHJ1bigpIHtcbiAgICAgICAgY29uc3QgcmVzdCA9IG5ldyBSZXN0U2VydmVyKHRoaXMpO1xuICAgICAgICByZXN0LmNyZWF0ZVNlcnZlcigpO1xuICAgICAgICByZXN0Lmxpc3RlbihwanNvbi5idWlsZGVyX3Jlc3RfcG9ydCk7XG4gICAgfVxufVxuXG5uZXcgU2VydmVyKG51bUNQVXMsIGRlYnVnKTtcblxuXG5cblxuIl19
//# sourceMappingURL=Server.js.map
