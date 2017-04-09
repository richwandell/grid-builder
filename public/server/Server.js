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
        this.particles = {};

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
            // Receive messages from this worker and handle them in the master process.
            w.on('message', function (message) {
                _this.onWorkerMessage(message);
            });
            this.workers.push(w);
        }
    }, {
        key: 'onMainMessage',
        value: function onMainMessage(message) {
            if (message.action === undefined) return false;
            switch (message.action) {
                case 'NEW_READING':
                    this.db.clearFeaturesCache(message.fp_id);
                    break;

                case 'LOCALIZE':
                    this.particles[message.id] = message.all_particles;
                    break;
            }
        }
    }, {
        key: 'messageWorkers',
        value: function messageWorkers(message) {
            this.workers.forEach(function (w) {
                if (!w.isDead()) {
                    w.send(message);
                }
            });
        }
    }, {
        key: 'onWorkerMessage',
        value: function onWorkerMessage(message) {
            if (message.action === undefined) return false;
            switch (message.action) {
                case 'NEW_READING':
                    if (!this.debug) {
                        this.messageWorkers(message);
                    } else {
                        this.onMainMessage(message);
                    }
                    break;

                case 'LOCALIZE':
                    this.socket.send({
                        action: 'LOCALIZE',
                        id: message.id,
                        guess: message.guess,
                        type: message.type,
                        particles: message.particles,
                        neighbors: message.neighbors,
                        clusters: message.clusters
                    });
                    if (!this.debug) {
                        this.messageWorkers(message);
                    } else {
                        this.onMainMessage(message);
                    }
                    break;
            }
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
            this.db = new _Db2.default(this.log, pjson.builder_db_name);
        }
    }, {
        key: 'runMainWorker',
        value: function runMainWorker() {
            var _this2 = this;

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
            var _this3 = this;

            // Receive messages from the master process.
            process.on('message', function (message) {
                _this3.onMainMessage(message);
            });
            var rest = new _RestServer2.default(this);
            rest.createServer();
            rest.listen(pjson.builder_rest_port);
        }
    }]);

    return Server;
}();

new Server(numCPUs, debug);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvU2VydmVyLmVzNiJdLCJuYW1lcyI6WyJudW1DUFVzIiwicmVxdWlyZSIsImNwdXMiLCJsZW5ndGgiLCJkZWJ1ZyIsInByb2Nlc3MiLCJleGVjQXJndiIsImluZGV4T2YiLCJjbHVzdGVyIiwicGpzb24iLCJ1dWlkIiwiZnMiLCJTZXJ2ZXIiLCJkYXRhIiwic2VuZCIsIm9uV29ya2VyTWVzc2FnZSIsIm51bVdvcmtlciIsIndvcmtlcnMiLCJwYXJ0aWNsZXMiLCJjb25maWd1cmUiLCJydW5NYWluV29ya2VyIiwicnVuIiwiaXNNYXN0ZXIiLCJpIiwiY3JlYXRlV29ya2VyIiwidyIsImZvcmsiLCJvbiIsIm1lc3NhZ2UiLCJwdXNoIiwiYWN0aW9uIiwidW5kZWZpbmVkIiwiZGIiLCJjbGVhckZlYXR1cmVzQ2FjaGUiLCJmcF9pZCIsImlkIiwiYWxsX3BhcnRpY2xlcyIsImZvckVhY2giLCJpc0RlYWQiLCJtZXNzYWdlV29ya2VycyIsIm9uTWFpbk1lc3NhZ2UiLCJzb2NrZXQiLCJndWVzcyIsInR5cGUiLCJuZWlnaGJvcnMiLCJjbHVzdGVycyIsInY0Iiwib2xkVVVJRCIsInJlYWRGaWxlU3luYyIsImUiLCJ3cml0ZUZpbGVTeW5jIiwibG9nIiwibG9nZm9sZGVyIiwiYnVpbGRlcl9sb2dfZm9sZGVyIiwiZmlsZW5hbWUiLCJmaWxlc2l6ZSIsIm51bWZpbGVzIiwiYnVpbGRlcl9kYl9uYW1lIiwid29ya2VyIiwiY29kZSIsInNpZ25hbCIsImV4aXRlZEFmdGVyRGlzY29ubmVjdCIsInVwbnAiLCJzdGFydEJyb2FkY2FzdCIsInJlc3QiLCJjcmVhdGVTZXJ2ZXIiLCJsaXN0ZW4iLCJidWlsZGVyX3dzX3BvcnQiLCJnZXRMb2ciLCJnZXRTZXJ2ZXIiLCJzdGFydFNlcnZlciIsImJ1aWxkZXJfcmVzdF9wb3J0Il0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7QUFFQSxJ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QUFmLENBQWI7QUFDQUEsaUJBQUtDLFlBQUw7QUFDQUQsaUJBQUtFLE1BQUwsQ0FBWXpELE1BQU0wRCxlQUFsQjs7QUFFQSxpQkFBSzFCLE1BQUwsR0FBYyw4QkFBb0J1QixLQUFLSSxNQUFMLEVBQXBCLEVBQW1DSixLQUFLSyxTQUFMLEVBQW5DLENBQWQ7QUFDQSxpQkFBSzVCLE1BQUwsQ0FBWTZCLFdBQVo7O0FBRUEsbUJBQU9OLElBQVA7QUFDSDs7OzhCQUVLO0FBQUE7O0FBQ0Y7QUFDQTNELG9CQUFRc0IsRUFBUixDQUFXLFNBQVgsRUFBc0IsVUFBQ0MsT0FBRCxFQUFhO0FBQy9CLHVCQUFLWSxhQUFMLENBQW1CWixPQUFuQjtBQUNILGFBRkQ7QUFHQSxnQkFBTW9DLE9BQU8seUJBQWUsSUFBZixDQUFiO0FBQ0FBLGlCQUFLQyxZQUFMO0FBQ0FELGlCQUFLRSxNQUFMLENBQVl6RCxNQUFNOEQsaUJBQWxCO0FBQ0g7Ozs7OztBQUdMLElBQUkzRCxNQUFKLENBQVdaLE9BQVgsRUFBb0JJLEtBQXBCIiwiZmlsZSI6IlNlcnZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTc2RwIGZyb20gJy4vU3NkcCc7XG5pbXBvcnQgUmVzdFNlcnZlciBmcm9tICcuL1Jlc3RTZXJ2ZXInO1xuaW1wb3J0IFdlYlNvY2tldFNlcnZlciBmcm9tICcuL1dlYlNvY2tldFNlcnZlcic7XG5pbXBvcnQgTG9nZ2VyIGZyb20gJy4vTG9nJztcbmltcG9ydCBEYiBmcm9tICcuL0RiJztcblxuY29uc3QgbnVtQ1BVcyA9IHJlcXVpcmUoJ29zJykuY3B1cygpLmxlbmd0aDtcbmNvbnN0IGRlYnVnID0gcHJvY2Vzcy5leGVjQXJndi5pbmRleE9mKCctLWRlYnVnJykgPiAtMSB8fCBwcm9jZXNzLmV4ZWNBcmd2LmluZGV4T2YoJy0tZGVidWctYnJrJykgPiAtMTtcbmNvbnN0IGNsdXN0ZXIgPSByZXF1aXJlKCdjbHVzdGVyJyk7XG5jb25zdCBwanNvbiA9IHJlcXVpcmUoJy4uLy4uL3BhY2thZ2UuanNvbicpO1xuY29uc3QgdXVpZCA9IHJlcXVpcmUoJ3V1aWQnKTtcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcblxuY2xhc3MgU2VydmVyIHtcblxuICAgIHNlbmQoZGF0YSl7XG4gICAgICAgIGlmKCF0aGlzLmRlYnVnKSB7XG4gICAgICAgICAgICBwcm9jZXNzLnNlbmQoZGF0YSk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgdGhpcy5vbldvcmtlck1lc3NhZ2UoZGF0YSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvcihudW1Xb3JrZXI6IE51bWJlciwgZGVidWc6IGJvb2xlYW4pIHtcbiAgICAgICAgdGhpcy5kZWJ1ZyA9IGRlYnVnO1xuICAgICAgICB0aGlzLndvcmtlcnMgPSBbXTtcbiAgICAgICAgdGhpcy5wYXJ0aWNsZXMgPSB7fTtcblxuICAgICAgICB0aGlzLmNvbmZpZ3VyZSgpO1xuXG4gICAgICAgIGlmKGRlYnVnKXtcbiAgICAgICAgICAgIHRoaXMucnVuTWFpbldvcmtlcigpO1xuICAgICAgICAgICAgdGhpcy5ydW4oKTtcbiAgICAgICAgfWVsc2UgaWYoY2x1c3Rlci5pc01hc3Rlcil7XG4gICAgICAgICAgICB0aGlzLnJ1bk1haW5Xb3JrZXIoKTtcblxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1Xb3JrZXI7IGkrKykge1xuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlV29ya2VyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJ1bigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY3JlYXRlV29ya2VyKCl7XG4gICAgICAgIGxldCB3ID0gY2x1c3Rlci5mb3JrKCk7XG4gICAgICAgIC8vIFJlY2VpdmUgbWVzc2FnZXMgZnJvbSB0aGlzIHdvcmtlciBhbmQgaGFuZGxlIHRoZW0gaW4gdGhlIG1hc3RlciBwcm9jZXNzLlxuICAgICAgICB3Lm9uKCdtZXNzYWdlJywgKG1lc3NhZ2UpID0+IHtcbiAgICAgICAgICAgIHRoaXMub25Xb3JrZXJNZXNzYWdlKG1lc3NhZ2UpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy53b3JrZXJzLnB1c2godyk7XG4gICAgfVxuXG4gICAgb25NYWluTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgICAgIGlmKG1lc3NhZ2UuYWN0aW9uID09PSB1bmRlZmluZWQpIHJldHVybiBmYWxzZTtcbiAgICAgICAgc3dpdGNoKG1lc3NhZ2UuYWN0aW9uKXtcbiAgICAgICAgICAgIGNhc2UgJ05FV19SRUFESU5HJzpcbiAgICAgICAgICAgICAgICB0aGlzLmRiLmNsZWFyRmVhdHVyZXNDYWNoZShtZXNzYWdlLmZwX2lkKTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnTE9DQUxJWkUnOlxuICAgICAgICAgICAgICAgIHRoaXMucGFydGljbGVzW21lc3NhZ2UuaWRdID0gbWVzc2FnZS5hbGxfcGFydGljbGVzO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbWVzc2FnZVdvcmtlcnMobWVzc2FnZSl7XG4gICAgICAgIHRoaXMud29ya2Vycy5mb3JFYWNoKCh3KSA9PiB7XG4gICAgICAgICAgICBpZiAoIXcuaXNEZWFkKCkpIHtcbiAgICAgICAgICAgICAgICB3LnNlbmQobWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG9uV29ya2VyTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgICAgIGlmKG1lc3NhZ2UuYWN0aW9uID09PSB1bmRlZmluZWQpIHJldHVybiBmYWxzZTtcbiAgICAgICAgc3dpdGNoKG1lc3NhZ2UuYWN0aW9uKXtcbiAgICAgICAgICAgIGNhc2UgJ05FV19SRUFESU5HJzpcbiAgICAgICAgICAgICAgICBpZighdGhpcy5kZWJ1Zykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lc3NhZ2VXb3JrZXJzKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uTWFpbk1lc3NhZ2UobWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlICdMT0NBTElaRSc6XG4gICAgICAgICAgICAgICAgdGhpcy5zb2NrZXQuc2VuZCh7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ0xPQ0FMSVpFJyxcbiAgICAgICAgICAgICAgICAgICAgaWQ6IG1lc3NhZ2UuaWQsXG4gICAgICAgICAgICAgICAgICAgIGd1ZXNzOiBtZXNzYWdlLmd1ZXNzLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBtZXNzYWdlLnR5cGUsXG4gICAgICAgICAgICAgICAgICAgIHBhcnRpY2xlczogbWVzc2FnZS5wYXJ0aWNsZXMsXG4gICAgICAgICAgICAgICAgICAgIG5laWdoYm9yczogbWVzc2FnZS5uZWlnaGJvcnMsXG4gICAgICAgICAgICAgICAgICAgIGNsdXN0ZXJzOiBtZXNzYWdlLmNsdXN0ZXJzXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYoIXRoaXMuZGVidWcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZXNzYWdlV29ya2VycyhtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbk1haW5NZXNzYWdlKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbmZpZ3VyZSgpe1xuICAgICAgICB0aGlzLmlkID0gdXVpZC52NCgpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IG9sZFVVSUQgPSBmcy5yZWFkRmlsZVN5bmMoXCIudXVpZFwiLCBcInV0ZjhcIik7XG4gICAgICAgICAgICB0aGlzLmlkID0gb2xkVVVJRDtcbiAgICAgICAgfWNhdGNoKGUpe1xuICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhcIi51dWlkXCIsIHRoaXMuaWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5sb2cgPSBuZXcgTG9nZ2VyKHtcbiAgICAgICAgICAgIGxvZ2ZvbGRlcjogcGpzb24uYnVpbGRlcl9sb2dfZm9sZGVyLFxuICAgICAgICAgICAgZmlsZW5hbWU6IFwicmVzdC5sb2dcIixcbiAgICAgICAgICAgIGZpbGVzaXplOiA1MDAwMDAwLFxuICAgICAgICAgICAgbnVtZmlsZXM6IDNcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZGIgPSBuZXcgRGIodGhpcy5sb2csIHBqc29uLmJ1aWxkZXJfZGJfbmFtZSk7XG4gICAgfVxuXG4gICAgcnVuTWFpbldvcmtlcigpe1xuICAgICAgICBjbHVzdGVyLm9uKCdleGl0JywgKHdvcmtlciwgY29kZSwgc2lnbmFsKSA9PiB7XG4gICAgICAgICAgICBpZiAod29ya2VyLmV4aXRlZEFmdGVyRGlzY29ubmVjdCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVdvcmtlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnVwbnAgPSBuZXcgU3NkcCgpO1xuICAgICAgICB0aGlzLnVwbnAuc3RhcnRCcm9hZGNhc3QoKTtcblxuICAgICAgICBjb25zdCByZXN0ID0gbmV3IFJlc3RTZXJ2ZXIodGhpcyk7XG4gICAgICAgIHJlc3QuY3JlYXRlU2VydmVyKCk7XG4gICAgICAgIHJlc3QubGlzdGVuKHBqc29uLmJ1aWxkZXJfd3NfcG9ydCk7XG5cbiAgICAgICAgdGhpcy5zb2NrZXQgPSBuZXcgV2ViU29ja2V0U2VydmVyKHJlc3QuZ2V0TG9nKCksIHJlc3QuZ2V0U2VydmVyKCkpO1xuICAgICAgICB0aGlzLnNvY2tldC5zdGFydFNlcnZlcigpO1xuXG4gICAgICAgIHJldHVybiByZXN0O1xuICAgIH1cblxuICAgIHJ1bigpIHtcbiAgICAgICAgLy8gUmVjZWl2ZSBtZXNzYWdlcyBmcm9tIHRoZSBtYXN0ZXIgcHJvY2Vzcy5cbiAgICAgICAgcHJvY2Vzcy5vbignbWVzc2FnZScsIChtZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLm9uTWFpbk1lc3NhZ2UobWVzc2FnZSk7XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCByZXN0ID0gbmV3IFJlc3RTZXJ2ZXIodGhpcyk7XG4gICAgICAgIHJlc3QuY3JlYXRlU2VydmVyKCk7XG4gICAgICAgIHJlc3QubGlzdGVuKHBqc29uLmJ1aWxkZXJfcmVzdF9wb3J0KTtcbiAgICB9XG59XG5cbm5ldyBTZXJ2ZXIobnVtQ1BVcywgZGVidWcpO1xuXG5cblxuXG4iXX0=
//# sourceMappingURL=Server.js.map
