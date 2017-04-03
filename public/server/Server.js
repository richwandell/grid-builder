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
                    this.db.createFeaturesCache();
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
                        particles: message.particles
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
            this.db = new _Db2.default(this.log);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvU2VydmVyLmVzNiJdLCJuYW1lcyI6WyJudW1DUFVzIiwicmVxdWlyZSIsImNwdXMiLCJsZW5ndGgiLCJkZWJ1ZyIsInByb2Nlc3MiLCJleGVjQXJndiIsImluZGV4T2YiLCJjbHVzdGVyIiwicGpzb24iLCJ1dWlkIiwiZnMiLCJTZXJ2ZXIiLCJkYXRhIiwic2VuZCIsIm9uV29ya2VyTWVzc2FnZSIsIm51bVdvcmtlciIsIndvcmtlcnMiLCJwYXJ0aWNsZXMiLCJjb25maWd1cmUiLCJydW5NYWluV29ya2VyIiwicnVuIiwiaXNNYXN0ZXIiLCJpIiwiY3JlYXRlV29ya2VyIiwidyIsImZvcmsiLCJvbiIsIm1lc3NhZ2UiLCJwdXNoIiwiYWN0aW9uIiwidW5kZWZpbmVkIiwiZGIiLCJjcmVhdGVGZWF0dXJlc0NhY2hlIiwiaWQiLCJhbGxfcGFydGljbGVzIiwiZm9yRWFjaCIsImlzRGVhZCIsIm1lc3NhZ2VXb3JrZXJzIiwib25NYWluTWVzc2FnZSIsInNvY2tldCIsImd1ZXNzIiwidHlwZSIsInY0Iiwib2xkVVVJRCIsInJlYWRGaWxlU3luYyIsImUiLCJ3cml0ZUZpbGVTeW5jIiwibG9nIiwibG9nZm9sZGVyIiwiYnVpbGRlcl9sb2dfZm9sZGVyIiwiZmlsZW5hbWUiLCJmaWxlc2l6ZSIsIm51bWZpbGVzIiwid29ya2VyIiwiY29kZSIsInNpZ25hbCIsImV4aXRlZEFmdGVyRGlzY29ubmVjdCIsInVwbnAiLCJzdGFydEJyb2FkY2FzdCIsInJlc3QiLCJjcmVhdGVTZXJ2ZXIiLCJsaXN0ZW4iLCJidWlsZGVyX3dzX3BvcnQiLCJnZXRMb2ciLCJnZXRTZXJ2ZXIiLCJzdGFydFNlcnZlciIsImJ1aWxkZXJfcmVzdF9wb3J0Il0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7QUFFQSxJQUFNQSxVQUFVQyxRQUFRLElBQVIsRUFBY0MsSUFBZCxHQUFxQkMsTUFBckM7QUFD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QUFDQSxpQkFBS3pCLE1BQUwsQ0FBWTBCLFdBQVo7O0FBRUEsbUJBQU9OLElBQVA7QUFDSDs7OzhCQUVLO0FBQUE7O0FBQ0Y7QUFDQXZELG9CQUFRc0IsRUFBUixDQUFXLFNBQVgsRUFBc0IsVUFBQ0MsT0FBRCxFQUFhO0FBQy9CLHVCQUFLVyxhQUFMLENBQW1CWCxPQUFuQjtBQUNILGFBRkQ7QUFHQSxnQkFBTWdDLE9BQU8seUJBQWUsSUFBZixDQUFiO0FBQ0FBLGlCQUFLQyxZQUFMO0FBQ0FELGlCQUFLRSxNQUFMLENBQVlyRCxNQUFNMEQsaUJBQWxCO0FBQ0g7Ozs7OztBQUdMLElBQUl2RCxNQUFKLENBQVdaLE9BQVgsRUFBb0JJLEtBQXBCIiwiZmlsZSI6IlNlcnZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTc2RwIGZyb20gJy4vU3NkcCc7XG5pbXBvcnQgUmVzdFNlcnZlciBmcm9tICcuL1Jlc3RTZXJ2ZXInO1xuaW1wb3J0IFdlYlNvY2tldFNlcnZlciBmcm9tICcuL1dlYlNvY2tldFNlcnZlcic7XG5pbXBvcnQgTG9nZ2VyIGZyb20gJy4vTG9nJztcbmltcG9ydCBEYiBmcm9tICcuL0RiJztcblxuY29uc3QgbnVtQ1BVcyA9IHJlcXVpcmUoJ29zJykuY3B1cygpLmxlbmd0aDtcbmNvbnN0IGRlYnVnID0gcHJvY2Vzcy5leGVjQXJndi5pbmRleE9mKCctLWRlYnVnJykgPiAtMSB8fCBwcm9jZXNzLmV4ZWNBcmd2LmluZGV4T2YoJy0tZGVidWctYnJrJykgPiAtMTtcbmNvbnN0IGNsdXN0ZXIgPSByZXF1aXJlKCdjbHVzdGVyJyk7XG5jb25zdCBwanNvbiA9IHJlcXVpcmUoJy4uLy4uL3BhY2thZ2UuanNvbicpO1xuY29uc3QgdXVpZCA9IHJlcXVpcmUoJ3V1aWQnKTtcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcblxuY2xhc3MgU2VydmVyIHtcblxuICAgIHNlbmQoZGF0YSl7XG4gICAgICAgIGlmKCF0aGlzLmRlYnVnKSB7XG4gICAgICAgICAgICBwcm9jZXNzLnNlbmQoZGF0YSk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgdGhpcy5vbldvcmtlck1lc3NhZ2UoZGF0YSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvcihudW1Xb3JrZXI6IE51bWJlciwgZGVidWc6IGJvb2xlYW4pIHtcbiAgICAgICAgdGhpcy5kZWJ1ZyA9IGRlYnVnO1xuICAgICAgICB0aGlzLndvcmtlcnMgPSBbXTtcbiAgICAgICAgdGhpcy5wYXJ0aWNsZXMgPSB7fTtcblxuICAgICAgICB0aGlzLmNvbmZpZ3VyZSgpO1xuXG4gICAgICAgIGlmKGRlYnVnKXtcbiAgICAgICAgICAgIHRoaXMucnVuTWFpbldvcmtlcigpO1xuICAgICAgICAgICAgdGhpcy5ydW4oKTtcbiAgICAgICAgfWVsc2UgaWYoY2x1c3Rlci5pc01hc3Rlcil7XG4gICAgICAgICAgICB0aGlzLnJ1bk1haW5Xb3JrZXIoKTtcblxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1Xb3JrZXI7IGkrKykge1xuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlV29ya2VyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJ1bigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY3JlYXRlV29ya2VyKCl7XG4gICAgICAgIGxldCB3ID0gY2x1c3Rlci5mb3JrKCk7XG4gICAgICAgIC8vIFJlY2VpdmUgbWVzc2FnZXMgZnJvbSB0aGlzIHdvcmtlciBhbmQgaGFuZGxlIHRoZW0gaW4gdGhlIG1hc3RlciBwcm9jZXNzLlxuICAgICAgICB3Lm9uKCdtZXNzYWdlJywgKG1lc3NhZ2UpID0+IHtcbiAgICAgICAgICAgIHRoaXMub25Xb3JrZXJNZXNzYWdlKG1lc3NhZ2UpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy53b3JrZXJzLnB1c2godyk7XG4gICAgfVxuXG4gICAgb25NYWluTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgICAgIGlmKG1lc3NhZ2UuYWN0aW9uID09PSB1bmRlZmluZWQpIHJldHVybiBmYWxzZTtcbiAgICAgICAgc3dpdGNoKG1lc3NhZ2UuYWN0aW9uKXtcbiAgICAgICAgICAgIGNhc2UgJ05FV19SRUFESU5HJzpcbiAgICAgICAgICAgICAgICB0aGlzLmRiLmNyZWF0ZUZlYXR1cmVzQ2FjaGUoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnTE9DQUxJWkUnOlxuICAgICAgICAgICAgICAgIHRoaXMucGFydGljbGVzW21lc3NhZ2UuaWRdID0gbWVzc2FnZS5hbGxfcGFydGljbGVzO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbWVzc2FnZVdvcmtlcnMobWVzc2FnZSl7XG4gICAgICAgIHRoaXMud29ya2Vycy5mb3JFYWNoKCh3KSA9PiB7XG4gICAgICAgICAgICBpZiAoIXcuaXNEZWFkKCkpIHtcbiAgICAgICAgICAgICAgICB3LnNlbmQobWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG9uV29ya2VyTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgICAgIGlmKG1lc3NhZ2UuYWN0aW9uID09PSB1bmRlZmluZWQpIHJldHVybiBmYWxzZTtcbiAgICAgICAgc3dpdGNoKG1lc3NhZ2UuYWN0aW9uKXtcbiAgICAgICAgICAgIGNhc2UgJ05FV19SRUFESU5HJzpcbiAgICAgICAgICAgICAgICBpZighdGhpcy5kZWJ1Zykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lc3NhZ2VXb3JrZXJzKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uTWFpbk1lc3NhZ2UobWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlICdMT0NBTElaRSc6XG4gICAgICAgICAgICAgICAgdGhpcy5zb2NrZXQuc2VuZCh7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ0xPQ0FMSVpFJyxcbiAgICAgICAgICAgICAgICAgICAgaWQ6IG1lc3NhZ2UuaWQsXG4gICAgICAgICAgICAgICAgICAgIGd1ZXNzOiBtZXNzYWdlLmd1ZXNzLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBtZXNzYWdlLnR5cGUsXG4gICAgICAgICAgICAgICAgICAgIHBhcnRpY2xlczogbWVzc2FnZS5wYXJ0aWNsZXNcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZighdGhpcy5kZWJ1Zykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lc3NhZ2VXb3JrZXJzKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uTWFpbk1lc3NhZ2UobWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uZmlndXJlKCl7XG4gICAgICAgIHRoaXMuaWQgPSB1dWlkLnY0KCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgb2xkVVVJRCA9IGZzLnJlYWRGaWxlU3luYyhcIi51dWlkXCIsIFwidXRmOFwiKTtcbiAgICAgICAgICAgIHRoaXMuaWQgPSBvbGRVVUlEO1xuICAgICAgICB9Y2F0Y2goZSl7XG4gICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKFwiLnV1aWRcIiwgdGhpcy5pZCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxvZyA9IG5ldyBMb2dnZXIoe1xuICAgICAgICAgICAgbG9nZm9sZGVyOiBwanNvbi5idWlsZGVyX2xvZ19mb2xkZXIsXG4gICAgICAgICAgICBmaWxlbmFtZTogXCJyZXN0LmxvZ1wiLFxuICAgICAgICAgICAgZmlsZXNpemU6IDUwMDAwMDAsXG4gICAgICAgICAgICBudW1maWxlczogM1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5kYiA9IG5ldyBEYih0aGlzLmxvZyk7XG4gICAgfVxuXG4gICAgcnVuTWFpbldvcmtlcigpe1xuICAgICAgICBjbHVzdGVyLm9uKCdleGl0JywgKHdvcmtlciwgY29kZSwgc2lnbmFsKSA9PiB7XG4gICAgICAgICAgICBpZiAod29ya2VyLmV4aXRlZEFmdGVyRGlzY29ubmVjdCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVdvcmtlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnVwbnAgPSBuZXcgU3NkcCgpO1xuICAgICAgICB0aGlzLnVwbnAuc3RhcnRCcm9hZGNhc3QoKTtcblxuICAgICAgICBjb25zdCByZXN0ID0gbmV3IFJlc3RTZXJ2ZXIodGhpcyk7XG4gICAgICAgIHJlc3QuY3JlYXRlU2VydmVyKCk7XG4gICAgICAgIHJlc3QubGlzdGVuKHBqc29uLmJ1aWxkZXJfd3NfcG9ydCk7XG5cbiAgICAgICAgdGhpcy5zb2NrZXQgPSBuZXcgV2ViU29ja2V0U2VydmVyKHJlc3QuZ2V0TG9nKCksIHJlc3QuZ2V0U2VydmVyKCkpO1xuICAgICAgICB0aGlzLnNvY2tldC5zdGFydFNlcnZlcigpO1xuXG4gICAgICAgIHJldHVybiByZXN0O1xuICAgIH1cblxuICAgIHJ1bigpIHtcbiAgICAgICAgLy8gUmVjZWl2ZSBtZXNzYWdlcyBmcm9tIHRoZSBtYXN0ZXIgcHJvY2Vzcy5cbiAgICAgICAgcHJvY2Vzcy5vbignbWVzc2FnZScsIChtZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLm9uTWFpbk1lc3NhZ2UobWVzc2FnZSk7XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCByZXN0ID0gbmV3IFJlc3RTZXJ2ZXIodGhpcyk7XG4gICAgICAgIHJlc3QuY3JlYXRlU2VydmVyKCk7XG4gICAgICAgIHJlc3QubGlzdGVuKHBqc29uLmJ1aWxkZXJfcmVzdF9wb3J0KTtcbiAgICB9XG59XG5cbm5ldyBTZXJ2ZXIobnVtQ1BVcywgZGVidWcpO1xuXG5cblxuXG4iXX0=
//# sourceMappingURL=Server.js.map
