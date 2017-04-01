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

var Server = function () {
    function Server(numWorker, debug) {
        var _this = this;

        _classCallCheck(this, Server);

        this.debug = debug;
        this.workers = [];
        if (cluster.isMaster && !debug) {
            this.runtMainWorker();

            process.on('message', function (message) {
                _this.onMainMessage(message);
            });

            for (var i = 0; i < numWorker; i++) {
                var w = cluster.fork();

                w.on('message', function (message) {
                    _this.onWorkerMessage(message);
                });

                this.workers.push(w);
            }
        } else {
            this.run();
        }
    }

    _createClass(Server, [{
        key: 'onMainMessage',
        value: function onMainMessage(message) {
            console.log(message);
        }
    }, {
        key: 'onWorkerMessage',
        value: function onWorkerMessage(message) {
            console.log(message);
        }
    }, {
        key: 'runtMainWorker',
        value: function runtMainWorker() {
            var upnp = new _Ssdp2.default();
            upnp.startBroadcast();

            var rest = new _RestServer2.default();
            rest.createServer();

            var socket = new _WebSocketServer2.default(rest.getLog(), rest.getServer());
            socket.startServer();

            return rest;
        }
    }, {
        key: 'run',
        value: function run() {
            var rest = new _RestServer2.default();
            rest.createServer();
            rest.listen(this);
        }
    }]);

    return Server;
}();

new Server(numCPUs, debug);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvU2VydmVyLmVzNiJdLCJuYW1lcyI6WyJudW1DUFVzIiwicmVxdWlyZSIsImNwdXMiLCJsZW5ndGgiLCJkZWJ1ZyIsInByb2Nlc3MiLCJleGVjQXJndiIsImluZGV4T2YiLCJjbHVzdGVyIiwiU2VydmVyIiwibnVtV29ya2VyIiwid29ya2VycyIsImlzTWFzdGVyIiwicnVudE1haW5Xb3JrZXIiLCJvbiIsIm1lc3NhZ2UiLCJvbk1haW5NZXNzYWdlIiwiaSIsInciLCJmb3JrIiwib25Xb3JrZXJNZXNzYWdlIiwicHVzaCIsInJ1biIsImNvbnNvbGUiLCJsb2ciLCJ1cG5wIiwic3RhcnRCcm9hZGNhc3QiLCJyZXN0IiwiY3JlYXRlU2VydmVyIiwic29ja2V0IiwiZ2V0TG9nIiwiZ2V0U2VydmVyIiwic3RhcnRTZXJ2ZXIiLCJsaXN0ZW4iXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTs7OztBQUNBOzs7O0FBQ0E7Ozs7Ozs7O0FBQ0EsSUFBTUEsVUFBVUMsUUFBUSxJQUFSLEVBQWNDLElBQWQsR0FBcUJDLE1BQXJDO0FBQ0EsSUFBTUMsUUFBUUMsUUFBUUMsUUFBUixDQUFpQkMsT0FBakIsQ0FBeUIsU0FBekIsSUFBc0MsQ0FBQyxDQUF2QyxJQUE0Q0YsUUFBUUMsUUFBUixDQUFpQkMsT0FBakIsQ0FBeUIsYUFBekIsSUFBMEMsQ0FBQyxDQUFyRztBQUNBLElBQU1DLFVBQVVQLFFBQVEsU0FBUixDQUFoQjs7SUFFTVEsTTtBQUVGLG9CQUFZQyxTQUFaLEVBQStCTixLQUEvQixFQUErQztBQUFBOztBQUFBOztBQUMzQyxhQUFLQSxLQUFMLEdBQWFBLEtBQWI7QUFDQSxhQUFLTyxPQUFMLEdBQWUsRUFBZjtBQUNBLFlBQUlILFFBQVFJLFFBQVIsSUFBb0IsQ0FBQ1IsS0FBekIsRUFBZ0M7QUFDNUIsaUJBQUtTLGNBQUw7O0FBRUFSLG9CQUFRUyxFQUFSLENBQVcsU0FBWCxFQUFzQixVQUFDQyxPQUFELEVBQWE7QUFDL0Isc0JBQUtDLGFBQUwsQ0FBbUJELE9BQW5CO0FBQ0gsYUFGRDs7QUFJQSxpQkFBSyxJQUFJRSxJQUFJLENBQWIsRUFBZ0JBLElBQUlQLFNBQXBCLEVBQStCTyxHQUEvQixFQUFvQztBQUNoQyxvQkFBSUMsSUFBSVYsUUFBUVcsSUFBUixFQUFSOztBQUVBRCxrQkFBRUosRUFBRixDQUFLLFNBQUwsRUFBZ0IsVUFBQ0MsT0FBRCxFQUFhO0FBQ3pCLDBCQUFLSyxlQUFMLENBQXFCTCxPQUFyQjtBQUNILGlCQUZEOztBQUlBLHFCQUFLSixPQUFMLENBQWFVLElBQWIsQ0FBa0JILENBQWxCO0FBQ0g7QUFDSixTQWhCRCxNQWdCTTtBQUNGLGlCQUFLSSxHQUFMO0FBQ0g7QUFDSjs7OztzQ0FFYVAsTyxFQUFTO0FBQ25CUSxvQkFBUUMsR0FBUixDQUFZVCxPQUFaO0FBQ0g7Ozt3Q0FFZUEsTyxFQUFTO0FBQ3JCUSxvQkFBUUMsR0FBUixDQUFZVCxPQUFaO0FBQ0g7Ozt5Q0FFZTtBQUNaLGdCQUFNVSxPQUFPLG9CQUFiO0FBQ0FBLGlCQUFLQyxjQUFMOztBQUVBLGdCQUFNQyxPQUFPLDBCQUFiO0FBQ0FBLGlCQUFLQyxZQUFMOztBQUVBLGdCQUFNQyxTQUFTLDhCQUFvQkYsS0FBS0csTUFBTCxFQUFwQixFQUFtQ0gsS0FBS0ksU0FBTCxFQUFuQyxDQUFmO0FBQ0FGLG1CQUFPRyxXQUFQOztBQUVBLG1CQUFPTCxJQUFQO0FBQ0g7Ozs4QkFFSztBQUNGLGdCQUFNQSxPQUFPLDBCQUFiO0FBQ0FBLGlCQUFLQyxZQUFMO0FBQ0FELGlCQUFLTSxNQUFMLENBQVksSUFBWjtBQUNIOzs7Ozs7QUFHTCxJQUFJeEIsTUFBSixDQUFXVCxPQUFYLEVBQW9CSSxLQUFwQiIsImZpbGUiOiJTZXJ2ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgU3NkcCBmcm9tICcuL1NzZHAnO1xuaW1wb3J0IFJlc3RTZXJ2ZXIgZnJvbSAnLi9SZXN0U2VydmVyJztcbmltcG9ydCBXZWJTb2NrZXRTZXJ2ZXIgZnJvbSAnLi9XZWJTb2NrZXRTZXJ2ZXInO1xuY29uc3QgbnVtQ1BVcyA9IHJlcXVpcmUoJ29zJykuY3B1cygpLmxlbmd0aDtcbmNvbnN0IGRlYnVnID0gcHJvY2Vzcy5leGVjQXJndi5pbmRleE9mKCctLWRlYnVnJykgPiAtMSB8fCBwcm9jZXNzLmV4ZWNBcmd2LmluZGV4T2YoJy0tZGVidWctYnJrJykgPiAtMTtcbmNvbnN0IGNsdXN0ZXIgPSByZXF1aXJlKCdjbHVzdGVyJyk7XG5cbmNsYXNzIFNlcnZlciB7XG5cbiAgICBjb25zdHJ1Y3RvcihudW1Xb3JrZXI6IE51bWJlciwgZGVidWc6IGJvb2xlYW4pIHtcbiAgICAgICAgdGhpcy5kZWJ1ZyA9IGRlYnVnO1xuICAgICAgICB0aGlzLndvcmtlcnMgPSBbXTtcbiAgICAgICAgaWYgKGNsdXN0ZXIuaXNNYXN0ZXIgJiYgIWRlYnVnKSB7XG4gICAgICAgICAgICB0aGlzLnJ1bnRNYWluV29ya2VyKCk7XG5cbiAgICAgICAgICAgIHByb2Nlc3Mub24oJ21lc3NhZ2UnLCAobWVzc2FnZSkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMub25NYWluTWVzc2FnZShtZXNzYWdlKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bVdvcmtlcjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IHcgPSBjbHVzdGVyLmZvcmsoKTtcblxuICAgICAgICAgICAgICAgIHcub24oJ21lc3NhZ2UnLCAobWVzc2FnZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uV29ya2VyTWVzc2FnZShtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHRoaXMud29ya2Vycy5wdXNoKHcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9ZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJ1bigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25NYWluTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xuICAgIH1cblxuICAgIG9uV29ya2VyTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xuICAgIH1cblxuICAgIHJ1bnRNYWluV29ya2VyKCl7XG4gICAgICAgIGNvbnN0IHVwbnAgPSBuZXcgU3NkcCgpO1xuICAgICAgICB1cG5wLnN0YXJ0QnJvYWRjYXN0KCk7XG5cbiAgICAgICAgY29uc3QgcmVzdCA9IG5ldyBSZXN0U2VydmVyKCk7XG4gICAgICAgIHJlc3QuY3JlYXRlU2VydmVyKCk7XG5cbiAgICAgICAgY29uc3Qgc29ja2V0ID0gbmV3IFdlYlNvY2tldFNlcnZlcihyZXN0LmdldExvZygpLCByZXN0LmdldFNlcnZlcigpKTtcbiAgICAgICAgc29ja2V0LnN0YXJ0U2VydmVyKCk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3Q7XG4gICAgfVxuXG4gICAgcnVuKCkge1xuICAgICAgICBjb25zdCByZXN0ID0gbmV3IFJlc3RTZXJ2ZXIoKTtcbiAgICAgICAgcmVzdC5jcmVhdGVTZXJ2ZXIoKTtcbiAgICAgICAgcmVzdC5saXN0ZW4odGhpcyk7XG4gICAgfVxufVxuXG5uZXcgU2VydmVyKG51bUNQVXMsIGRlYnVnKTtcblxuXG5cblxuIl19
//# sourceMappingURL=Server.js.map
