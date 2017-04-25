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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvU2VydmVyLmVzNiJdLCJuYW1lcyI6WyJudW1DUFVzIiwicmVxdWlyZSIsImNwdXMiLCJsZW5ndGgiLCJkZWJ1ZyIsInByb2Nlc3MiLCJleGVjQXJndiIsImluZGV4T2YiLCJjbHVzdGVyIiwicGpzb24iLCJ1dWlkIiwiZnMiLCJTZXJ2ZXIiLCJkYXRhIiwic2VuZCIsIm9uV29ya2VyTWVzc2FnZSIsIm51bVdvcmtlciIsIndvcmtlcnMiLCJwYXJ0aWNsZXMiLCJjb25maWd1cmUiLCJydW5NYWluV29ya2VyIiwicnVuIiwiaXNNYXN0ZXIiLCJpIiwiY3JlYXRlV29ya2VyIiwidyIsImZvcmsiLCJvbiIsIm1lc3NhZ2UiLCJwdXNoIiwiYWN0aW9uIiwidW5kZWZpbmVkIiwiZGIiLCJjbGVhckZlYXR1cmVzQ2FjaGUiLCJmcF9pZCIsImlkIiwiYWxsX3BhcnRpY2xlcyIsImZvckVhY2giLCJpc0RlYWQiLCJtZXNzYWdlV29ya2VycyIsIm9uTWFpbk1lc3NhZ2UiLCJzb2NrZXQiLCJndWVzcyIsInR5cGUiLCJuZWlnaGJvcnMiLCJjbHVzdGVycyIsInY0Iiwib2xkVVVJRCIsInJlYWRGaWxlU3luYyIsImUiLCJ3cml0ZUZpbGVTeW5jIiwibG9nIiwibG9nZm9sZGVyIiwiYnVpbGRlcl9sb2dfZm9sZGVyIiwiZmlsZW5hbWUiLCJmaWxlc2l6ZSIsIm51bWZpbGVzIiwidHJhY2tpbmdMb2ciLCJidWlsZGVyX2RiX25hbWUiLCJ3b3JrZXIiLCJjb2RlIiwic2lnbmFsIiwiZXhpdGVkQWZ0ZXJEaXNjb25uZWN0IiwidXBucCIsInN0YXJ0QnJvYWRjYXN0IiwicmVzdCIsImNyZWF0ZVNlcnZlciIsImxpc3RlbiIsImJ1aWxkZXJfd3NfcG9ydCIsImdldExvZyIsImdldFNlcnZlciIsInN0YXJ0U2VydmVyIiwiYnVpbGRlcl9yZXN0X3BvcnQiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNB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QUFQLEtBQWlDLEtBQXJDLEVBQTRDO0FBQ3hDLDJCQUFLdEMsWUFBTDtBQUNIO0FBQ0osYUFKRDs7QUFNQSxpQkFBS3VDLElBQUwsR0FBWSxvQkFBWjtBQUNBLGlCQUFLQSxJQUFMLENBQVVDLGNBQVY7O0FBRUEsZ0JBQU1DLE9BQU8seUJBQWUsSUFBZixDQUFiO0FBQ0FBLGlCQUFLQyxZQUFMO0FBQ0FELGlCQUFLRSxNQUFMLENBQVkxRCxNQUFNMkQsZUFBbEI7O0FBRUEsaUJBQUszQixNQUFMLEdBQWMsOEJBQW9Cd0IsS0FBS0ksTUFBTCxFQUFwQixFQUFtQ0osS0FBS0ssU0FBTCxFQUFuQyxDQUFkO0FBQ0EsaUJBQUs3QixNQUFMLENBQVk4QixXQUFaOztBQUVBLG1CQUFPTixJQUFQO0FBQ0g7Ozs4QkFFSztBQUFBOztBQUNGO0FBQ0E1RCxvQkFBUXNCLEVBQVIsQ0FBVyxTQUFYLEVBQXNCLFVBQUNDLE9BQUQsRUFBYTtBQUMvQix1QkFBS1ksYUFBTCxDQUFtQlosT0FBbkI7QUFDSCxhQUZEO0FBR0EsZ0JBQU1xQyxPQUFPLHlCQUFlLElBQWYsQ0FBYjtBQUNBQSxpQkFBS0MsWUFBTDtBQUNBRCxpQkFBS0UsTUFBTCxDQUFZMUQsTUFBTStELGlCQUFsQjtBQUNIOzs7Ozs7QUFHTCxJQUFJNUQsTUFBSixDQUFXWixPQUFYLEVBQW9CSSxLQUFwQiIsImZpbGUiOiJTZXJ2ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgU3NkcCBmcm9tICcuL1NzZHAnO1xuaW1wb3J0IFJlc3RTZXJ2ZXIgZnJvbSAnLi9SZXN0U2VydmVyJztcbmltcG9ydCBXZWJTb2NrZXRTZXJ2ZXIgZnJvbSAnLi9XZWJTb2NrZXRTZXJ2ZXInO1xuaW1wb3J0IExvZ2dlciBmcm9tICcuL0xvZyc7XG5pbXBvcnQgRGIgZnJvbSAnLi9EYic7XG5cbmNvbnN0IG51bUNQVXMgPSByZXF1aXJlKCdvcycpLmNwdXMoKS5sZW5ndGg7XG5jb25zdCBkZWJ1ZyA9IHByb2Nlc3MuZXhlY0FyZ3YuaW5kZXhPZignLS1kZWJ1ZycpID4gLTEgfHwgcHJvY2Vzcy5leGVjQXJndi5pbmRleE9mKCctLWRlYnVnLWJyaycpID4gLTE7XG5jb25zdCBjbHVzdGVyID0gcmVxdWlyZSgnY2x1c3RlcicpO1xuY29uc3QgcGpzb24gPSByZXF1aXJlKCcuLi8uLi9wYWNrYWdlLmpzb24nKTtcbmNvbnN0IHV1aWQgPSByZXF1aXJlKCd1dWlkJyk7XG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5cbmNsYXNzIFNlcnZlciB7XG5cbiAgICBzZW5kKGRhdGEpe1xuICAgICAgICBpZighdGhpcy5kZWJ1Zykge1xuICAgICAgICAgICAgcHJvY2Vzcy5zZW5kKGRhdGEpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHRoaXMub25Xb3JrZXJNZXNzYWdlKGRhdGEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IobnVtV29ya2VyOiBOdW1iZXIsIGRlYnVnOiBib29sZWFuKSB7XG4gICAgICAgIHRoaXMuZGVidWcgPSBkZWJ1ZztcbiAgICAgICAgdGhpcy53b3JrZXJzID0gW107XG4gICAgICAgIHRoaXMucGFydGljbGVzID0ge307XG5cbiAgICAgICAgdGhpcy5jb25maWd1cmUoKTtcblxuICAgICAgICBpZihkZWJ1Zyl7XG4gICAgICAgICAgICB0aGlzLnJ1bk1haW5Xb3JrZXIoKTtcbiAgICAgICAgICAgIHRoaXMucnVuKCk7XG4gICAgICAgIH1lbHNlIGlmKGNsdXN0ZXIuaXNNYXN0ZXIpe1xuICAgICAgICAgICAgdGhpcy5ydW5NYWluV29ya2VyKCk7XG5cbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtV29ya2VyOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVdvcmtlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5ydW4oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNyZWF0ZVdvcmtlcigpe1xuICAgICAgICBsZXQgdyA9IGNsdXN0ZXIuZm9yaygpO1xuICAgICAgICAvLyBSZWNlaXZlIG1lc3NhZ2VzIGZyb20gdGhpcyB3b3JrZXIgYW5kIGhhbmRsZSB0aGVtIGluIHRoZSBtYXN0ZXIgcHJvY2Vzcy5cbiAgICAgICAgdy5vbignbWVzc2FnZScsIChtZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLm9uV29ya2VyTWVzc2FnZShtZXNzYWdlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMud29ya2Vycy5wdXNoKHcpO1xuICAgIH1cblxuICAgIG9uTWFpbk1lc3NhZ2UobWVzc2FnZSkge1xuICAgICAgICBpZihtZXNzYWdlLmFjdGlvbiA9PT0gdW5kZWZpbmVkKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHN3aXRjaChtZXNzYWdlLmFjdGlvbil7XG4gICAgICAgICAgICBjYXNlICdORVdfUkVBRElORyc6XG4gICAgICAgICAgICAgICAgdGhpcy5kYi5jbGVhckZlYXR1cmVzQ2FjaGUobWVzc2FnZS5mcF9pZCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ0xPQ0FMSVpFJzpcbiAgICAgICAgICAgICAgICB0aGlzLnBhcnRpY2xlc1ttZXNzYWdlLmlkXSA9IG1lc3NhZ2UuYWxsX3BhcnRpY2xlcztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG1lc3NhZ2VXb3JrZXJzKG1lc3NhZ2Upe1xuICAgICAgICB0aGlzLndvcmtlcnMuZm9yRWFjaCgodykgPT4ge1xuICAgICAgICAgICAgaWYgKCF3LmlzRGVhZCgpKSB7XG4gICAgICAgICAgICAgICAgdy5zZW5kKG1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBvbldvcmtlck1lc3NhZ2UobWVzc2FnZSkge1xuICAgICAgICBpZihtZXNzYWdlLmFjdGlvbiA9PT0gdW5kZWZpbmVkKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHN3aXRjaChtZXNzYWdlLmFjdGlvbil7XG4gICAgICAgICAgICBjYXNlICdORVdfUkVBRElORyc6XG4gICAgICAgICAgICAgICAgaWYoIXRoaXMuZGVidWcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZXNzYWdlV29ya2VycyhtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbk1haW5NZXNzYWdlKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnTE9DQUxJWkUnOlxuICAgICAgICAgICAgICAgIHRoaXMuc29ja2V0LnNlbmQoe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdMT0NBTElaRScsXG4gICAgICAgICAgICAgICAgICAgIGlkOiBtZXNzYWdlLmlkLFxuICAgICAgICAgICAgICAgICAgICBndWVzczogbWVzc2FnZS5ndWVzcyxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogbWVzc2FnZS50eXBlLFxuICAgICAgICAgICAgICAgICAgICBwYXJ0aWNsZXM6IG1lc3NhZ2UucGFydGljbGVzLFxuICAgICAgICAgICAgICAgICAgICBuZWlnaGJvcnM6IG1lc3NhZ2UubmVpZ2hib3JzLFxuICAgICAgICAgICAgICAgICAgICBjbHVzdGVyczogbWVzc2FnZS5jbHVzdGVyc1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmKCF0aGlzLmRlYnVnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVzc2FnZVdvcmtlcnMobWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25NYWluTWVzc2FnZShtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25maWd1cmUoKXtcbiAgICAgICAgdGhpcy5pZCA9IHV1aWQudjQoKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCBvbGRVVUlEID0gZnMucmVhZEZpbGVTeW5jKFwiLnV1aWRcIiwgXCJ1dGY4XCIpO1xuICAgICAgICAgICAgdGhpcy5pZCA9IG9sZFVVSUQ7XG4gICAgICAgIH1jYXRjaChlKXtcbiAgICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMoXCIudXVpZFwiLCB0aGlzLmlkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubG9nID0gbmV3IExvZ2dlcih7XG4gICAgICAgICAgICBsb2dmb2xkZXI6IHBqc29uLmJ1aWxkZXJfbG9nX2ZvbGRlcixcbiAgICAgICAgICAgIGZpbGVuYW1lOiBcInJlc3QubG9nXCIsXG4gICAgICAgICAgICBmaWxlc2l6ZTogNTAwMDAwMCxcbiAgICAgICAgICAgIG51bWZpbGVzOiAzXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnRyYWNraW5nTG9nID0gbmV3IExvZ2dlcih7XG4gICAgICAgICAgICBsb2dmb2xkZXI6IHBqc29uLmJ1aWxkZXJfbG9nX2ZvbGRlcixcbiAgICAgICAgICAgIGZpbGVuYW1lOiBcInRyYWNraW5nLmxvZ1wiLFxuICAgICAgICAgICAgZmlsZXNpemU6IDUwMDAwMDAsXG4gICAgICAgICAgICBudW1maWxlczogM1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5kYiA9IG5ldyBEYih0aGlzLmxvZywgcGpzb24uYnVpbGRlcl9kYl9uYW1lKTtcbiAgICB9XG5cbiAgICBydW5NYWluV29ya2VyKCl7XG4gICAgICAgIGNsdXN0ZXIub24oJ2V4aXQnLCAod29ya2VyLCBjb2RlLCBzaWduYWwpID0+IHtcbiAgICAgICAgICAgIGlmICh3b3JrZXIuZXhpdGVkQWZ0ZXJEaXNjb25uZWN0ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlV29ya2VyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMudXBucCA9IG5ldyBTc2RwKCk7XG4gICAgICAgIHRoaXMudXBucC5zdGFydEJyb2FkY2FzdCgpO1xuXG4gICAgICAgIGNvbnN0IHJlc3QgPSBuZXcgUmVzdFNlcnZlcih0aGlzKTtcbiAgICAgICAgcmVzdC5jcmVhdGVTZXJ2ZXIoKTtcbiAgICAgICAgcmVzdC5saXN0ZW4ocGpzb24uYnVpbGRlcl93c19wb3J0KTtcblxuICAgICAgICB0aGlzLnNvY2tldCA9IG5ldyBXZWJTb2NrZXRTZXJ2ZXIocmVzdC5nZXRMb2coKSwgcmVzdC5nZXRTZXJ2ZXIoKSk7XG4gICAgICAgIHRoaXMuc29ja2V0LnN0YXJ0U2VydmVyKCk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3Q7XG4gICAgfVxuXG4gICAgcnVuKCkge1xuICAgICAgICAvLyBSZWNlaXZlIG1lc3NhZ2VzIGZyb20gdGhlIG1hc3RlciBwcm9jZXNzLlxuICAgICAgICBwcm9jZXNzLm9uKCdtZXNzYWdlJywgKG1lc3NhZ2UpID0+IHtcbiAgICAgICAgICAgIHRoaXMub25NYWluTWVzc2FnZShtZXNzYWdlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHJlc3QgPSBuZXcgUmVzdFNlcnZlcih0aGlzKTtcbiAgICAgICAgcmVzdC5jcmVhdGVTZXJ2ZXIoKTtcbiAgICAgICAgcmVzdC5saXN0ZW4ocGpzb24uYnVpbGRlcl9yZXN0X3BvcnQpO1xuICAgIH1cbn1cblxubmV3IFNlcnZlcihudW1DUFVzLCBkZWJ1Zyk7XG5cblxuXG5cbiJdfQ==
//# sourceMappingURL=Server.js.map
