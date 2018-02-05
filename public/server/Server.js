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
var debug = false;

process.execArgv.forEach(function (item) {
    if (item.indexOf('--debug') > -1 || item.indexOf('--debug-brk') > -1) {
        debug = true;
    }
});

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
            this.trackingLog = new _Log2.default({
                logfolder: pjson.builder_log_folder,
                filename: "tracking.log",
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvU2VydmVyLmVzNiJdLCJuYW1lcyI6WyJudW1DUFVzIiwicmVxdWlyZSIsImNwdXMiLCJsZW5ndGgiLCJkZWJ1ZyIsInByb2Nlc3MiLCJleGVjQXJndiIsImZvckVhY2giLCJpdGVtIiwiaW5kZXhPZiIsImNsdXN0ZXIiLCJwanNvbiIsInV1aWQiLCJmcyIsIlNlcnZlciIsImRhdGEiLCJzZW5kIiwib25Xb3JrZXJNZXNzYWdlIiwibnVtV29ya2VyIiwid29ya2VycyIsInBhcnRpY2xlcyIsImNvbmZpZ3VyZSIsInJ1bk1haW5Xb3JrZXIiLCJydW4iLCJpc01hc3RlciIsImkiLCJjcmVhdGVXb3JrZXIiLCJ3IiwiZm9yayIsIm9uIiwibWVzc2FnZSIsInB1c2giLCJhY3Rpb24iLCJ1bmRlZmluZWQiLCJkYiIsImNsZWFyRmVhdHVyZXNDYWNoZSIsImZwX2lkIiwiaWQiLCJhbGxfcGFydGljbGVzIiwiaXNEZWFkIiwibWVzc2FnZVdvcmtlcnMiLCJvbk1haW5NZXNzYWdlIiwic29ja2V0IiwiZ3Vlc3MiLCJ0eXBlIiwibmVpZ2hib3JzIiwiY2x1c3RlcnMiLCJ2NCIsIm9sZFVVSUQiLCJyZWFkRmlsZVN5bmMiLCJlIiwid3JpdGVGaWxlU3luYyIsImxvZyIsImxvZ2ZvbGRlciIsImJ1aWxkZXJfbG9nX2ZvbGRlciIsImZpbGVuYW1lIiwiZmlsZXNpemUiLCJudW1maWxlcyIsInRyYWNraW5nTG9nIiwiYnVpbGRlcl9kYl9uYW1lIiwid29ya2VyIiwiY29kZSIsInNpZ25hbCIsImV4aXRlZEFmdGVyRGlzY29ubmVjdCIsInVwbnAiLCJzdGFydEJyb2FkY2FzdCIsInJlc3QiLCJjcmVhdGVTZXJ2ZXIiLCJsaXN0ZW4iLCJidWlsZGVyX3dzX3BvcnQiLCJnZXRMb2ciLCJnZXRTZXJ2ZXIiLCJzdGFydFNlcnZlciIsImJ1aWxkZXJfcmVzdF9wb3J0Il0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7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QixFQUFSLENBQVcsTUFBWCxFQUFtQixVQUFDK0IsTUFBRCxFQUFTQyxJQUFULEVBQWVDLE1BQWYsRUFBMEI7QUFDekMsb0JBQUlGLE9BQU9HLHFCQUFQLEtBQWlDLEtBQXJDLEVBQTRDO0FBQ3hDLDJCQUFLckMsWUFBTDtBQUNIO0FBQ0osYUFKRDs7QUFNQSxpQkFBS3NDLElBQUwsR0FBWSxvQkFBWjtBQUNBLGlCQUFLQSxJQUFMLENBQVVDLGNBQVY7O0FBRUEsZ0JBQU1DLE9BQU8seUJBQWUsSUFBZixDQUFiO0FBQ0FBLGlCQUFLQyxZQUFMO0FBQ0FELGlCQUFLRSxNQUFMLENBQVl6RCxNQUFNMEQsZUFBbEI7O0FBRUEsaUJBQUszQixNQUFMLEdBQWMsOEJBQW9Cd0IsS0FBS0ksTUFBTCxFQUFwQixFQUFtQ0osS0FBS0ssU0FBTCxFQUFuQyxDQUFkO0FBQ0EsaUJBQUs3QixNQUFMLENBQVk4QixXQUFaOztBQUVBLG1CQUFPTixJQUFQO0FBQ0g7Ozs4QkFFSztBQUFBOztBQUNGO0FBQ0E3RCxvQkFBUXdCLEVBQVIsQ0FBVyxTQUFYLEVBQXNCLFVBQUNDLE9BQUQsRUFBYTtBQUMvQix1QkFBS1csYUFBTCxDQUFtQlgsT0FBbkI7QUFDSCxhQUZEO0FBR0EsZ0JBQU1vQyxPQUFPLHlCQUFlLElBQWYsQ0FBYjtBQUNBQSxpQkFBS0MsWUFBTDtBQUNBRCxpQkFBS0UsTUFBTCxDQUFZekQsTUFBTThELGlCQUFsQjtBQUNIOzs7Ozs7QUFHTCxJQUFJM0QsTUFBSixDQUFXZCxPQUFYLEVBQW9CSSxLQUFwQiIsImZpbGUiOiJTZXJ2ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgU3NkcCBmcm9tICcuL1NzZHAnO1xuaW1wb3J0IFJlc3RTZXJ2ZXIgZnJvbSAnLi9SZXN0U2VydmVyJztcbmltcG9ydCBXZWJTb2NrZXRTZXJ2ZXIgZnJvbSAnLi9XZWJTb2NrZXRTZXJ2ZXInO1xuaW1wb3J0IExvZ2dlciBmcm9tICcuL0xvZyc7XG5pbXBvcnQgRGIgZnJvbSAnLi9EYic7XG5cbmNvbnN0IG51bUNQVXMgPSByZXF1aXJlKCdvcycpLmNwdXMoKS5sZW5ndGg7XG52YXIgZGVidWcgPSBmYWxzZTtcblxucHJvY2Vzcy5leGVjQXJndi5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgaWYoaXRlbS5pbmRleE9mKCctLWRlYnVnJykgPiAtMSB8fCBpdGVtLmluZGV4T2YoJy0tZGVidWctYnJrJykgPiAtMSl7XG4gICAgICAgIGRlYnVnID0gdHJ1ZTtcbiAgICB9XG59KTtcblxuY29uc3QgY2x1c3RlciA9IHJlcXVpcmUoJ2NsdXN0ZXInKTtcbmNvbnN0IHBqc29uID0gcmVxdWlyZSgnLi4vLi4vcGFja2FnZS5qc29uJyk7XG5jb25zdCB1dWlkID0gcmVxdWlyZSgndXVpZCcpO1xuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuXG5jbGFzcyBTZXJ2ZXIge1xuXG4gICAgc2VuZChkYXRhKXtcbiAgICAgICAgaWYoIXRoaXMuZGVidWcpIHtcbiAgICAgICAgICAgIHByb2Nlc3Muc2VuZChkYXRhKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICB0aGlzLm9uV29ya2VyTWVzc2FnZShkYXRhKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKG51bVdvcmtlcjogTnVtYmVyLCBkZWJ1ZzogYm9vbGVhbikge1xuICAgICAgICB0aGlzLmRlYnVnID0gZGVidWc7XG4gICAgICAgIHRoaXMud29ya2VycyA9IFtdO1xuICAgICAgICB0aGlzLnBhcnRpY2xlcyA9IHt9O1xuXG4gICAgICAgIHRoaXMuY29uZmlndXJlKCk7XG5cbiAgICAgICAgaWYoZGVidWcpe1xuICAgICAgICAgICAgdGhpcy5ydW5NYWluV29ya2VyKCk7XG4gICAgICAgICAgICB0aGlzLnJ1bigpO1xuICAgICAgICB9ZWxzZSBpZihjbHVzdGVyLmlzTWFzdGVyKXtcbiAgICAgICAgICAgIHRoaXMucnVuTWFpbldvcmtlcigpO1xuXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bVdvcmtlcjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVXb3JrZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucnVuKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjcmVhdGVXb3JrZXIoKXtcbiAgICAgICAgbGV0IHcgPSBjbHVzdGVyLmZvcmsoKTtcbiAgICAgICAgLy8gUmVjZWl2ZSBtZXNzYWdlcyBmcm9tIHRoaXMgd29ya2VyIGFuZCBoYW5kbGUgdGhlbSBpbiB0aGUgbWFzdGVyIHByb2Nlc3MuXG4gICAgICAgIHcub24oJ21lc3NhZ2UnLCAobWVzc2FnZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5vbldvcmtlck1lc3NhZ2UobWVzc2FnZSk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLndvcmtlcnMucHVzaCh3KTtcbiAgICB9XG5cbiAgICBvbk1haW5NZXNzYWdlKG1lc3NhZ2UpIHtcbiAgICAgICAgaWYobWVzc2FnZS5hY3Rpb24gPT09IHVuZGVmaW5lZCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBzd2l0Y2gobWVzc2FnZS5hY3Rpb24pe1xuICAgICAgICAgICAgY2FzZSAnTkVXX1JFQURJTkcnOlxuICAgICAgICAgICAgICAgIHRoaXMuZGIuY2xlYXJGZWF0dXJlc0NhY2hlKG1lc3NhZ2UuZnBfaWQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlICdMT0NBTElaRSc6XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXNbbWVzc2FnZS5pZF0gPSBtZXNzYWdlLmFsbF9wYXJ0aWNsZXM7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBtZXNzYWdlV29ya2VycyhtZXNzYWdlKXtcbiAgICAgICAgdGhpcy53b3JrZXJzLmZvckVhY2goKHcpID0+IHtcbiAgICAgICAgICAgIGlmICghdy5pc0RlYWQoKSkge1xuICAgICAgICAgICAgICAgIHcuc2VuZChtZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb25Xb3JrZXJNZXNzYWdlKG1lc3NhZ2UpIHtcbiAgICAgICAgaWYobWVzc2FnZS5hY3Rpb24gPT09IHVuZGVmaW5lZCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBzd2l0Y2gobWVzc2FnZS5hY3Rpb24pe1xuICAgICAgICAgICAgY2FzZSAnTkVXX1JFQURJTkcnOlxuICAgICAgICAgICAgICAgIGlmKCF0aGlzLmRlYnVnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVzc2FnZVdvcmtlcnMobWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25NYWluTWVzc2FnZShtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ0xPQ0FMSVpFJzpcbiAgICAgICAgICAgICAgICB0aGlzLnNvY2tldC5zZW5kKHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAnTE9DQUxJWkUnLFxuICAgICAgICAgICAgICAgICAgICBpZDogbWVzc2FnZS5pZCxcbiAgICAgICAgICAgICAgICAgICAgZ3Vlc3M6IG1lc3NhZ2UuZ3Vlc3MsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IG1lc3NhZ2UudHlwZSxcbiAgICAgICAgICAgICAgICAgICAgcGFydGljbGVzOiBtZXNzYWdlLnBhcnRpY2xlcyxcbiAgICAgICAgICAgICAgICAgICAgbmVpZ2hib3JzOiBtZXNzYWdlLm5laWdoYm9ycyxcbiAgICAgICAgICAgICAgICAgICAgY2x1c3RlcnM6IG1lc3NhZ2UuY2x1c3RlcnNcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZighdGhpcy5kZWJ1Zykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lc3NhZ2VXb3JrZXJzKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uTWFpbk1lc3NhZ2UobWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uZmlndXJlKCl7XG4gICAgICAgIHRoaXMuaWQgPSB1dWlkLnY0KCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgb2xkVVVJRCA9IGZzLnJlYWRGaWxlU3luYyhcIi51dWlkXCIsIFwidXRmOFwiKTtcbiAgICAgICAgICAgIHRoaXMuaWQgPSBvbGRVVUlEO1xuICAgICAgICB9Y2F0Y2goZSl7XG4gICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKFwiLnV1aWRcIiwgdGhpcy5pZCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxvZyA9IG5ldyBMb2dnZXIoe1xuICAgICAgICAgICAgbG9nZm9sZGVyOiBwanNvbi5idWlsZGVyX2xvZ19mb2xkZXIsXG4gICAgICAgICAgICBmaWxlbmFtZTogXCJyZXN0LmxvZ1wiLFxuICAgICAgICAgICAgZmlsZXNpemU6IDUwMDAwMDAsXG4gICAgICAgICAgICBudW1maWxlczogM1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy50cmFja2luZ0xvZyA9IG5ldyBMb2dnZXIoe1xuICAgICAgICAgICAgbG9nZm9sZGVyOiBwanNvbi5idWlsZGVyX2xvZ19mb2xkZXIsXG4gICAgICAgICAgICBmaWxlbmFtZTogXCJ0cmFja2luZy5sb2dcIixcbiAgICAgICAgICAgIGZpbGVzaXplOiA1MDAwMDAwLFxuICAgICAgICAgICAgbnVtZmlsZXM6IDNcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZGIgPSBuZXcgRGIodGhpcy5sb2csIHBqc29uLmJ1aWxkZXJfZGJfbmFtZSk7XG4gICAgfVxuXG4gICAgcnVuTWFpbldvcmtlcigpe1xuICAgICAgICBjbHVzdGVyLm9uKCdleGl0JywgKHdvcmtlciwgY29kZSwgc2lnbmFsKSA9PiB7XG4gICAgICAgICAgICBpZiAod29ya2VyLmV4aXRlZEFmdGVyRGlzY29ubmVjdCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVdvcmtlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnVwbnAgPSBuZXcgU3NkcCgpO1xuICAgICAgICB0aGlzLnVwbnAuc3RhcnRCcm9hZGNhc3QoKTtcblxuICAgICAgICBjb25zdCByZXN0ID0gbmV3IFJlc3RTZXJ2ZXIodGhpcyk7XG4gICAgICAgIHJlc3QuY3JlYXRlU2VydmVyKCk7XG4gICAgICAgIHJlc3QubGlzdGVuKHBqc29uLmJ1aWxkZXJfd3NfcG9ydCk7XG5cbiAgICAgICAgdGhpcy5zb2NrZXQgPSBuZXcgV2ViU29ja2V0U2VydmVyKHJlc3QuZ2V0TG9nKCksIHJlc3QuZ2V0U2VydmVyKCkpO1xuICAgICAgICB0aGlzLnNvY2tldC5zdGFydFNlcnZlcigpO1xuXG4gICAgICAgIHJldHVybiByZXN0O1xuICAgIH1cblxuICAgIHJ1bigpIHtcbiAgICAgICAgLy8gUmVjZWl2ZSBtZXNzYWdlcyBmcm9tIHRoZSBtYXN0ZXIgcHJvY2Vzcy5cbiAgICAgICAgcHJvY2Vzcy5vbignbWVzc2FnZScsIChtZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLm9uTWFpbk1lc3NhZ2UobWVzc2FnZSk7XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCByZXN0ID0gbmV3IFJlc3RTZXJ2ZXIodGhpcyk7XG4gICAgICAgIHJlc3QuY3JlYXRlU2VydmVyKCk7XG4gICAgICAgIHJlc3QubGlzdGVuKHBqc29uLmJ1aWxkZXJfcmVzdF9wb3J0KTtcbiAgICB9XG59XG5cbm5ldyBTZXJ2ZXIobnVtQ1BVcywgZGVidWcpO1xuXG5cblxuXG4iXX0=
//# sourceMappingURL=Server.js.map
