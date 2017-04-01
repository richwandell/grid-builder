'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _RestServer = require('./RestServer');

var _RestServer2 = _interopRequireDefault(_RestServer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WsServer = require('websocket').server;
var http = require('http');

var WebSocketServer = function () {
    function WebSocketServer(log, restServer) {
        _classCallCheck(this, WebSocketServer);

        this.log = log;
        this.connections = [];
        this.restServer = restServer;
    }

    _createClass(WebSocketServer, [{
        key: 'send',
        value: function send(message) {
            this.connections.forEach(function (conn) {
                conn.sendUTF(JSON.stringify(message));
            });
        }
    }, {
        key: 'startServer',
        value: function startServer() {
            var _this = this;

            this.server = new WsServer({
                httpServer: this.restServer,
                autoAcceptConnections: false
            });

            this.server.on('request', function (request) {
                try {
                    _this.onRequest(request);
                } catch (e) {
                    _this.log.error(e.message);
                }
            });
        }
    }, {
        key: 'onRequest',
        value: function onRequest(request) {
            var _this2 = this;

            var connection = request.accept('echo-protocol', request.origin);
            connection.cid = this.connections.length;
            this.connections.push(connection);
            this.log.log("Connection Accepted");

            connection.on('message', function (message) {
                _this2.onConnectionMessage(connection, message);
            });

            connection.on('close', function (reasonCode, description) {
                _this2.log.debug(new Date() + ' Peer ' + connection.remoteAddress + ' disconnected.');
                _this2.removeDisconnected();
            });

            connection.sendUTF(JSON.stringify({ 'action': 'HI' }));
        }
    }, {
        key: 'removeDisconnected',
        value: function removeDisconnected() {
            var dis = Infinity;
            for (var i = 0; i < this.connections.length; i++) {
                if (this.connections.closeEventEmitted) {
                    dis = i;
                }
            }
            if (dis < Infinity) {
                this.connections = this.connections.splice(dis, 1);
            }
        }
    }, {
        key: 'onConnectionMessage',
        value: function onConnectionMessage(connection, message) {
            if (message.type === 'utf8') {
                console.log('Received Message: ' + message.utf8Data);
                connection.sendUTF(message.utf8Data);
            } else if (message.type === 'binary') {
                console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
                connection.sendBytes(message.binaryData);
            }
        }
    }]);

    return WebSocketServer;
}();

exports.default = WebSocketServer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvV2ViU29ja2V0U2VydmVyLmVzNiJdLCJuYW1lcyI6WyJXc1NlcnZlciIsInJlcXVpcmUiLCJzZXJ2ZXIiLCJodHRwIiwiV2ViU29ja2V0U2VydmVyIiwibG9nIiwicmVzdFNlcnZlciIsImNvbm5lY3Rpb25zIiwibWVzc2FnZSIsImZvckVhY2giLCJjb25uIiwic2VuZFVURiIsIkpTT04iLCJzdHJpbmdpZnkiLCJodHRwU2VydmVyIiwiYXV0b0FjY2VwdENvbm5lY3Rpb25zIiwib24iLCJyZXF1ZXN0Iiwib25SZXF1ZXN0IiwiZSIsImVycm9yIiwiY29ubmVjdGlvbiIsImFjY2VwdCIsIm9yaWdpbiIsImNpZCIsImxlbmd0aCIsInB1c2giLCJvbkNvbm5lY3Rpb25NZXNzYWdlIiwicmVhc29uQ29kZSIsImRlc2NyaXB0aW9uIiwiZGVidWciLCJEYXRlIiwicmVtb3RlQWRkcmVzcyIsInJlbW92ZURpc2Nvbm5lY3RlZCIsImRpcyIsIkluZmluaXR5IiwiaSIsImNsb3NlRXZlbnRFbWl0dGVkIiwic3BsaWNlIiwidHlwZSIsImNvbnNvbGUiLCJ1dGY4RGF0YSIsImJpbmFyeURhdGEiLCJzZW5kQnl0ZXMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7Ozs7Ozs7O0FBQ0EsSUFBTUEsV0FBV0MsUUFBUSxXQUFSLEVBQXFCQyxNQUF0QztBQUNBLElBQU1DLE9BQU9GLFFBQVEsTUFBUixDQUFiOztJQUdNRyxlO0FBRUYsNkJBQVlDLEdBQVosRUFBc0JDLFVBQXRCLEVBQTZDO0FBQUE7O0FBQ3pDLGFBQUtELEdBQUwsR0FBV0EsR0FBWDtBQUNBLGFBQUtFLFdBQUwsR0FBbUIsRUFBbkI7QUFDQSxhQUFLRCxVQUFMLEdBQWtCQSxVQUFsQjtBQUNIOzs7OzZCQUVJRSxPLEVBQVE7QUFDVCxpQkFBS0QsV0FBTCxDQUFpQkUsT0FBakIsQ0FBeUIsVUFBQ0MsSUFBRCxFQUFVO0FBQy9CQSxxQkFBS0MsT0FBTCxDQUFhQyxLQUFLQyxTQUFMLENBQWVMLE9BQWYsQ0FBYjtBQUNILGFBRkQ7QUFHSDs7O3NDQUVZO0FBQUE7O0FBQ1QsaUJBQUtOLE1BQUwsR0FBYyxJQUFJRixRQUFKLENBQWE7QUFDdkJjLDRCQUFZLEtBQUtSLFVBRE07QUFFdkJTLHVDQUF1QjtBQUZBLGFBQWIsQ0FBZDs7QUFLQSxpQkFBS2IsTUFBTCxDQUFZYyxFQUFaLENBQWUsU0FBZixFQUEwQixVQUFDQyxPQUFELEVBQWE7QUFDbkMsb0JBQUk7QUFDQSwwQkFBS0MsU0FBTCxDQUFlRCxPQUFmO0FBQ0gsaUJBRkQsQ0FFQyxPQUFNRSxDQUFOLEVBQVE7QUFDTCwwQkFBS2QsR0FBTCxDQUFTZSxLQUFULENBQWVELEVBQUVYLE9BQWpCO0FBQ0g7QUFDSixhQU5EO0FBT0g7OztrQ0FFU1MsTyxFQUFTO0FBQUE7O0FBQ2YsZ0JBQUlJLGFBQWFKLFFBQVFLLE1BQVIsQ0FBZSxlQUFmLEVBQWdDTCxRQUFRTSxNQUF4QyxDQUFqQjtBQUNBRix1QkFBV0csR0FBWCxHQUFpQixLQUFLakIsV0FBTCxDQUFpQmtCLE1BQWxDO0FBQ0EsaUJBQUtsQixXQUFMLENBQWlCbUIsSUFBakIsQ0FBc0JMLFVBQXRCO0FBQ0EsaUJBQUtoQixHQUFMLENBQVNBLEdBQVQsQ0FBYSxxQkFBYjs7QUFFQWdCLHVCQUFXTCxFQUFYLENBQWMsU0FBZCxFQUF5QixVQUFDUixPQUFELEVBQWE7QUFDbEMsdUJBQUttQixtQkFBTCxDQUF5Qk4sVUFBekIsRUFBcUNiLE9BQXJDO0FBQ0gsYUFGRDs7QUFJQWEsdUJBQVdMLEVBQVgsQ0FBYyxPQUFkLEVBQXVCLFVBQUNZLFVBQUQsRUFBYUMsV0FBYixFQUE2QjtBQUNoRCx1QkFBS3hCLEdBQUwsQ0FBU3lCLEtBQVQsQ0FBZ0IsSUFBSUMsSUFBSixFQUFELEdBQWUsUUFBZixHQUEwQlYsV0FBV1csYUFBckMsR0FBcUQsZ0JBQXBFO0FBQ0EsdUJBQUtDLGtCQUFMO0FBQ0gsYUFIRDs7QUFLQVosdUJBQVdWLE9BQVgsQ0FBbUJDLEtBQUtDLFNBQUwsQ0FBZSxFQUFDLFVBQVUsSUFBWCxFQUFmLENBQW5CO0FBQ0g7Ozs2Q0FFb0I7QUFDakIsZ0JBQUlxQixNQUFNQyxRQUFWO0FBQ0EsaUJBQUksSUFBSUMsSUFBSSxDQUFaLEVBQWVBLElBQUksS0FBSzdCLFdBQUwsQ0FBaUJrQixNQUFwQyxFQUE0Q1csR0FBNUMsRUFBZ0Q7QUFDNUMsb0JBQUcsS0FBSzdCLFdBQUwsQ0FBaUI4QixpQkFBcEIsRUFBc0M7QUFDbENILDBCQUFNRSxDQUFOO0FBQ0g7QUFDSjtBQUNELGdCQUFHRixNQUFNQyxRQUFULEVBQW1CO0FBQ2YscUJBQUs1QixXQUFMLEdBQW1CLEtBQUtBLFdBQUwsQ0FBaUIrQixNQUFqQixDQUF3QkosR0FBeEIsRUFBNkIsQ0FBN0IsQ0FBbkI7QUFDSDtBQUNKOzs7NENBRW1CYixVLEVBQVliLE8sRUFBUztBQUNyQyxnQkFBSUEsUUFBUStCLElBQVIsS0FBaUIsTUFBckIsRUFBNkI7QUFDekJDLHdCQUFRbkMsR0FBUixDQUFZLHVCQUF1QkcsUUFBUWlDLFFBQTNDO0FBQ0FwQiwyQkFBV1YsT0FBWCxDQUFtQkgsUUFBUWlDLFFBQTNCO0FBQ0gsYUFIRCxNQUlLLElBQUlqQyxRQUFRK0IsSUFBUixLQUFpQixRQUFyQixFQUErQjtBQUNoQ0Msd0JBQVFuQyxHQUFSLENBQVksZ0NBQWdDRyxRQUFRa0MsVUFBUixDQUFtQmpCLE1BQW5ELEdBQTRELFFBQXhFO0FBQ0FKLDJCQUFXc0IsU0FBWCxDQUFxQm5DLFFBQVFrQyxVQUE3QjtBQUNIO0FBQ0o7Ozs7OztrQkFHVXRDLGUiLCJmaWxlIjoiV2ViU29ja2V0U2VydmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlc3RTZXJ2ZXIgZnJvbSAnLi9SZXN0U2VydmVyJztcbmNvbnN0IFdzU2VydmVyID0gcmVxdWlyZSgnd2Vic29ja2V0Jykuc2VydmVyO1xuY29uc3QgaHR0cCA9IHJlcXVpcmUoJ2h0dHAnKTtcblxuXG5jbGFzcyBXZWJTb2NrZXRTZXJ2ZXIge1xuXG4gICAgY29uc3RydWN0b3IobG9nOiBMb2csIHJlc3RTZXJ2ZXI6IFJlc3RTZXJ2ZXIpe1xuICAgICAgICB0aGlzLmxvZyA9IGxvZztcbiAgICAgICAgdGhpcy5jb25uZWN0aW9ucyA9IFtdO1xuICAgICAgICB0aGlzLnJlc3RTZXJ2ZXIgPSByZXN0U2VydmVyO1xuICAgIH1cblxuICAgIHNlbmQobWVzc2FnZSl7XG4gICAgICAgIHRoaXMuY29ubmVjdGlvbnMuZm9yRWFjaCgoY29ubikgPT4ge1xuICAgICAgICAgICAgY29ubi5zZW5kVVRGKEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc3RhcnRTZXJ2ZXIoKXtcbiAgICAgICAgdGhpcy5zZXJ2ZXIgPSBuZXcgV3NTZXJ2ZXIoe1xuICAgICAgICAgICAgaHR0cFNlcnZlcjogdGhpcy5yZXN0U2VydmVyLFxuICAgICAgICAgICAgYXV0b0FjY2VwdENvbm5lY3Rpb25zOiBmYWxzZVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnNlcnZlci5vbigncmVxdWVzdCcsIChyZXF1ZXN0KSA9PiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHRoaXMub25SZXF1ZXN0KHJlcXVlc3QpO1xuICAgICAgICAgICAgfWNhdGNoKGUpe1xuICAgICAgICAgICAgICAgIHRoaXMubG9nLmVycm9yKGUubWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG9uUmVxdWVzdChyZXF1ZXN0KSB7XG4gICAgICAgIGxldCBjb25uZWN0aW9uID0gcmVxdWVzdC5hY2NlcHQoJ2VjaG8tcHJvdG9jb2wnLCByZXF1ZXN0Lm9yaWdpbik7XG4gICAgICAgIGNvbm5lY3Rpb24uY2lkID0gdGhpcy5jb25uZWN0aW9ucy5sZW5ndGg7XG4gICAgICAgIHRoaXMuY29ubmVjdGlvbnMucHVzaChjb25uZWN0aW9uKTtcbiAgICAgICAgdGhpcy5sb2cubG9nKFwiQ29ubmVjdGlvbiBBY2NlcHRlZFwiKTtcblxuICAgICAgICBjb25uZWN0aW9uLm9uKCdtZXNzYWdlJywgKG1lc3NhZ2UpID0+IHtcbiAgICAgICAgICAgIHRoaXMub25Db25uZWN0aW9uTWVzc2FnZShjb25uZWN0aW9uLCBtZXNzYWdlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29ubmVjdGlvbi5vbignY2xvc2UnLCAocmVhc29uQ29kZSwgZGVzY3JpcHRpb24pID0+IHtcbiAgICAgICAgICAgIHRoaXMubG9nLmRlYnVnKChuZXcgRGF0ZSgpKSArICcgUGVlciAnICsgY29ubmVjdGlvbi5yZW1vdGVBZGRyZXNzICsgJyBkaXNjb25uZWN0ZWQuJyk7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZURpc2Nvbm5lY3RlZCgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBjb25uZWN0aW9uLnNlbmRVVEYoSlNPTi5zdHJpbmdpZnkoeydhY3Rpb24nOiAnSEknfSkpO1xuICAgIH1cblxuICAgIHJlbW92ZURpc2Nvbm5lY3RlZCgpIHtcbiAgICAgICAgbGV0IGRpcyA9IEluZmluaXR5O1xuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgdGhpcy5jb25uZWN0aW9ucy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICBpZih0aGlzLmNvbm5lY3Rpb25zLmNsb3NlRXZlbnRFbWl0dGVkKXtcbiAgICAgICAgICAgICAgICBkaXMgPSBpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmKGRpcyA8IEluZmluaXR5KSB7XG4gICAgICAgICAgICB0aGlzLmNvbm5lY3Rpb25zID0gdGhpcy5jb25uZWN0aW9ucy5zcGxpY2UoZGlzLCAxKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uQ29ubmVjdGlvbk1lc3NhZ2UoY29ubmVjdGlvbiwgbWVzc2FnZSkge1xuICAgICAgICBpZiAobWVzc2FnZS50eXBlID09PSAndXRmOCcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdSZWNlaXZlZCBNZXNzYWdlOiAnICsgbWVzc2FnZS51dGY4RGF0YSk7XG4gICAgICAgICAgICBjb25uZWN0aW9uLnNlbmRVVEYobWVzc2FnZS51dGY4RGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobWVzc2FnZS50eXBlID09PSAnYmluYXJ5Jykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1JlY2VpdmVkIEJpbmFyeSBNZXNzYWdlIG9mICcgKyBtZXNzYWdlLmJpbmFyeURhdGEubGVuZ3RoICsgJyBieXRlcycpO1xuICAgICAgICAgICAgY29ubmVjdGlvbi5zZW5kQnl0ZXMobWVzc2FnZS5iaW5hcnlEYXRhKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgV2ViU29ja2V0U2VydmVyOyJdfQ==
//# sourceMappingURL=WebSocketServer.js.map
