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
        var _this = this;

        _classCallCheck(this, Server);

        this.debug = debug;
        this.workers = [];
        if (cluster.isMaster && !debug) {
            this.runMainWorker();

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvU2VydmVyLmVzNiJdLCJuYW1lcyI6WyJudW1DUFVzIiwicmVxdWlyZSIsImNwdXMiLCJsZW5ndGgiLCJkZWJ1ZyIsInByb2Nlc3MiLCJleGVjQXJndiIsImluZGV4T2YiLCJjbHVzdGVyIiwicGpzb24iLCJTZXJ2ZXIiLCJkYXRhIiwic2VuZCIsIm9uV29ya2VyTWVzc2FnZSIsIm51bVdvcmtlciIsIndvcmtlcnMiLCJpc01hc3RlciIsInJ1bk1haW5Xb3JrZXIiLCJpIiwidyIsImZvcmsiLCJvbiIsIm1lc3NhZ2UiLCJwdXNoIiwicnVuIiwiY29uc29sZSIsImxvZyIsInBpZCIsInNvY2tldCIsIm9uTWFpbk1lc3NhZ2UiLCJ1cG5wIiwic3RhcnRCcm9hZGNhc3QiLCJyZXN0IiwiY3JlYXRlU2VydmVyIiwibGlzdGVuIiwiYnVpbGRlcl93c19wb3J0IiwiZ2V0TG9nIiwiZ2V0U2VydmVyIiwic3RhcnRTZXJ2ZXIiLCJidWlsZGVyX3Jlc3RfcG9ydCJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7QUFDQSxJQUFNQSxVQUFVQyxRQUFRLElBQVIsRUFBY0MsSUFBZCxHQUFxQkMsTUFBckM7QUFDQSxJQUFNQyxRQUFRQyxRQUFRQyxRQUFSLENBQWlCQyxPQUFqQixDQUF5QixTQUF6QixJQUFzQyxDQUFDLENBQXZDLElBQTRDRixRQUFRQyxRQUFSLENBQWlCQyxPQUFqQixDQUF5QixhQUF6QixJQUEwQyxDQUFDLENBQXJHO0FBQ0EsSUFBTUMsVUFBVVAsUUFBUSxTQUFSLENBQWhCO0FBQ0EsSUFBTVEsUUFBUVIsUUFBUSxvQkFBUixDQUFkOztJQUVNUyxNOzs7NkJBRUdDLEksRUFBSztBQUNOLGdCQUFHLENBQUMsS0FBS1AsS0FBVCxFQUFnQjtBQUNaQyx3QkFBUU8sSUFBUixDQUFhRCxJQUFiO0FBQ0gsYUFGRCxNQUVLO0FBQ0QscUJBQUtFLGVBQUwsQ0FBcUJGLElBQXJCO0FBQ0g7QUFDSjs7O0FBRUQsb0JBQVlHLFNBQVosRUFBK0JWLEtBQS9CLEVBQStDO0FBQUE7O0FBQUE7O0FBQzNDLGFBQUtBLEtBQUwsR0FBYUEsS0FBYjtBQUNBLGFBQUtXLE9BQUwsR0FBZSxFQUFmO0FBQ0EsWUFBSVAsUUFBUVEsUUFBUixJQUFvQixDQUFDWixLQUF6QixFQUFnQztBQUM1QixpQkFBS2EsYUFBTDs7QUFFQSxpQkFBSyxJQUFJQyxJQUFJLENBQWIsRUFBZ0JBLElBQUlKLFNBQXBCLEVBQStCSSxHQUEvQixFQUFvQztBQUNoQyxvQkFBSUMsSUFBSVgsUUFBUVksSUFBUixFQUFSOztBQUVBRCxrQkFBRUUsRUFBRixDQUFLLFNBQUwsRUFBZ0IsVUFBQ0MsT0FBRCxFQUFhO0FBQ3pCLDBCQUFLVCxlQUFMLENBQXFCUyxPQUFyQjtBQUNILGlCQUZEOztBQUlBLHFCQUFLUCxPQUFMLENBQWFRLElBQWIsQ0FBa0JKLENBQWxCO0FBQ0g7QUFDSixTQVpELE1BWUs7QUFDRCxpQkFBS0ssR0FBTDtBQUNIO0FBQ0o7Ozs7c0NBRWFGLE8sRUFBUztBQUNuQkcsb0JBQVFDLEdBQVIsQ0FBWSxtQkFBbUJyQixRQUFRc0IsR0FBdkM7QUFDSDs7O3dDQUVlTCxPLEVBQVM7QUFDckIsaUJBQUtNLE1BQUwsQ0FBWWhCLElBQVosQ0FBaUJVLE9BQWpCO0FBQ0g7Ozt3Q0FFYztBQUFBOztBQUNYakIsb0JBQVFnQixFQUFSLENBQVcsU0FBWCxFQUFzQixVQUFDQyxPQUFELEVBQWE7QUFDL0IsdUJBQUtPLGFBQUwsQ0FBbUJQLE9BQW5CO0FBQ0gsYUFGRDs7QUFJQSxpQkFBS1EsSUFBTCxHQUFZLG9CQUFaO0FBQ0EsaUJBQUtBLElBQUwsQ0FBVUMsY0FBVjs7QUFFQSxnQkFBTUMsT0FBTywwQkFBYjtBQUNBQSxpQkFBS0MsWUFBTDtBQUNBRCxpQkFBS0UsTUFBTCxDQUFZLElBQVosRUFBa0J6QixNQUFNMEIsZUFBeEI7O0FBRUEsaUJBQUtQLE1BQUwsR0FBYyw4QkFBb0JJLEtBQUtJLE1BQUwsRUFBcEIsRUFBbUNKLEtBQUtLLFNBQUwsRUFBbkMsQ0FBZDtBQUNBLGlCQUFLVCxNQUFMLENBQVlVLFdBQVo7O0FBRUEsbUJBQU9OLElBQVA7QUFDSDs7OzhCQUVLO0FBQ0YsZ0JBQU1BLE9BQU8sMEJBQWI7QUFDQUEsaUJBQUtDLFlBQUw7QUFDQUQsaUJBQUtFLE1BQUwsQ0FBWSxJQUFaLEVBQWtCekIsTUFBTThCLGlCQUF4QjtBQUNIOzs7Ozs7QUFHTCxJQUFJN0IsTUFBSixDQUFXVixPQUFYLEVBQW9CSSxLQUFwQiIsImZpbGUiOiJTZXJ2ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgU3NkcCBmcm9tICcuL1NzZHAnO1xuaW1wb3J0IFJlc3RTZXJ2ZXIgZnJvbSAnLi9SZXN0U2VydmVyJztcbmltcG9ydCBXZWJTb2NrZXRTZXJ2ZXIgZnJvbSAnLi9XZWJTb2NrZXRTZXJ2ZXInO1xuY29uc3QgbnVtQ1BVcyA9IHJlcXVpcmUoJ29zJykuY3B1cygpLmxlbmd0aDtcbmNvbnN0IGRlYnVnID0gcHJvY2Vzcy5leGVjQXJndi5pbmRleE9mKCctLWRlYnVnJykgPiAtMSB8fCBwcm9jZXNzLmV4ZWNBcmd2LmluZGV4T2YoJy0tZGVidWctYnJrJykgPiAtMTtcbmNvbnN0IGNsdXN0ZXIgPSByZXF1aXJlKCdjbHVzdGVyJyk7XG5jb25zdCBwanNvbiA9IHJlcXVpcmUoJy4uLy4uL3BhY2thZ2UuanNvbicpO1xuXG5jbGFzcyBTZXJ2ZXIge1xuXG4gICAgc2VuZChkYXRhKXtcbiAgICAgICAgaWYoIXRoaXMuZGVidWcpIHtcbiAgICAgICAgICAgIHByb2Nlc3Muc2VuZChkYXRhKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICB0aGlzLm9uV29ya2VyTWVzc2FnZShkYXRhKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKG51bVdvcmtlcjogTnVtYmVyLCBkZWJ1ZzogYm9vbGVhbikge1xuICAgICAgICB0aGlzLmRlYnVnID0gZGVidWc7XG4gICAgICAgIHRoaXMud29ya2VycyA9IFtdO1xuICAgICAgICBpZiAoY2x1c3Rlci5pc01hc3RlciAmJiAhZGVidWcpIHtcbiAgICAgICAgICAgIHRoaXMucnVuTWFpbldvcmtlcigpO1xuXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bVdvcmtlcjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IHcgPSBjbHVzdGVyLmZvcmsoKTtcblxuICAgICAgICAgICAgICAgIHcub24oJ21lc3NhZ2UnLCAobWVzc2FnZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uV29ya2VyTWVzc2FnZShtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHRoaXMud29ya2Vycy5wdXNoKHcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHRoaXMucnVuKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvbk1haW5NZXNzYWdlKG1lc3NhZ2UpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJNYWluIE1lc3NhZ2U6IFwiICsgcHJvY2Vzcy5waWQpO1xuICAgIH1cblxuICAgIG9uV29ya2VyTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgICAgIHRoaXMuc29ja2V0LnNlbmQobWVzc2FnZSk7XG4gICAgfVxuXG4gICAgcnVuTWFpbldvcmtlcigpe1xuICAgICAgICBwcm9jZXNzLm9uKCdtZXNzYWdlJywgKG1lc3NhZ2UpID0+IHtcbiAgICAgICAgICAgIHRoaXMub25NYWluTWVzc2FnZShtZXNzYWdlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy51cG5wID0gbmV3IFNzZHAoKTtcbiAgICAgICAgdGhpcy51cG5wLnN0YXJ0QnJvYWRjYXN0KCk7XG5cbiAgICAgICAgY29uc3QgcmVzdCA9IG5ldyBSZXN0U2VydmVyKCk7XG4gICAgICAgIHJlc3QuY3JlYXRlU2VydmVyKCk7XG4gICAgICAgIHJlc3QubGlzdGVuKHRoaXMsIHBqc29uLmJ1aWxkZXJfd3NfcG9ydCk7XG5cbiAgICAgICAgdGhpcy5zb2NrZXQgPSBuZXcgV2ViU29ja2V0U2VydmVyKHJlc3QuZ2V0TG9nKCksIHJlc3QuZ2V0U2VydmVyKCkpO1xuICAgICAgICB0aGlzLnNvY2tldC5zdGFydFNlcnZlcigpO1xuXG4gICAgICAgIHJldHVybiByZXN0O1xuICAgIH1cblxuICAgIHJ1bigpIHtcbiAgICAgICAgY29uc3QgcmVzdCA9IG5ldyBSZXN0U2VydmVyKCk7XG4gICAgICAgIHJlc3QuY3JlYXRlU2VydmVyKCk7XG4gICAgICAgIHJlc3QubGlzdGVuKHRoaXMsIHBqc29uLmJ1aWxkZXJfcmVzdF9wb3J0KTtcbiAgICB9XG59XG5cbm5ldyBTZXJ2ZXIobnVtQ1BVcywgZGVidWcpO1xuXG5cblxuXG4iXX0=
//# sourceMappingURL=Server.js.map
