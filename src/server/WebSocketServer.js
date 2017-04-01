'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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
        key: 'startServer',
        value: function startServer() {
            var _this = this;

            this.server = new WsServer({
                httpServer: this.restServer,
                autoAcceptConnections: false
            });

            this.server.on('request', function (request) {
                _this.onRequest(request);
            });
        }
    }, {
        key: 'onRequest',
        value: function onRequest(request) {
            var _this2 = this;

            var connection = request.accept('echo-protocol', request.origin);
            this.connections.push(connection);
            this.log.log("Connection Accepted");

            connection.on('message', function (message) {
                _this2.onConnectionMessage(connection, message);
            });

            connection.on('close', function (reasonCode, description) {
                _this2.log.log(new Date() + ' Peer ' + connection.remoteAddress + ' disconnected.');
            });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIldlYlNvY2tldFNlcnZlci5lczYiXSwibmFtZXMiOlsiV3NTZXJ2ZXIiLCJyZXF1aXJlIiwic2VydmVyIiwiaHR0cCIsIldlYlNvY2tldFNlcnZlciIsImxvZyIsInJlc3RTZXJ2ZXIiLCJjb25uZWN0aW9ucyIsImh0dHBTZXJ2ZXIiLCJhdXRvQWNjZXB0Q29ubmVjdGlvbnMiLCJvbiIsInJlcXVlc3QiLCJvblJlcXVlc3QiLCJjb25uZWN0aW9uIiwiYWNjZXB0Iiwib3JpZ2luIiwicHVzaCIsIm1lc3NhZ2UiLCJvbkNvbm5lY3Rpb25NZXNzYWdlIiwicmVhc29uQ29kZSIsImRlc2NyaXB0aW9uIiwiRGF0ZSIsInJlbW90ZUFkZHJlc3MiLCJ0eXBlIiwiY29uc29sZSIsInV0ZjhEYXRhIiwic2VuZFVURiIsImJpbmFyeURhdGEiLCJsZW5ndGgiLCJzZW5kQnl0ZXMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxJQUFNQSxXQUFXQyxRQUFRLFdBQVIsRUFBcUJDLE1BQXRDO0FBQ0EsSUFBTUMsT0FBT0YsUUFBUSxNQUFSLENBQWI7O0lBR01HLGU7QUFFRiw2QkFBWUMsR0FBWixFQUFzQkMsVUFBdEIsRUFBNkM7QUFBQTs7QUFDekMsYUFBS0QsR0FBTCxHQUFXQSxHQUFYO0FBQ0EsYUFBS0UsV0FBTCxHQUFtQixFQUFuQjtBQUNBLGFBQUtELFVBQUwsR0FBa0JBLFVBQWxCO0FBQ0g7Ozs7c0NBRVk7QUFBQTs7QUFDVCxpQkFBS0osTUFBTCxHQUFjLElBQUlGLFFBQUosQ0FBYTtBQUN2QlEsNEJBQVksS0FBS0YsVUFETTtBQUV2QkcsdUNBQXVCO0FBRkEsYUFBYixDQUFkOztBQUtBLGlCQUFLUCxNQUFMLENBQVlRLEVBQVosQ0FBZSxTQUFmLEVBQTBCLFVBQUNDLE9BQUQsRUFBYTtBQUNuQyxzQkFBS0MsU0FBTCxDQUFlRCxPQUFmO0FBQ0gsYUFGRDtBQUdIOzs7a0NBRVNBLE8sRUFBUztBQUFBOztBQUNmLGdCQUFJRSxhQUFhRixRQUFRRyxNQUFSLENBQWUsZUFBZixFQUFnQ0gsUUFBUUksTUFBeEMsQ0FBakI7QUFDQSxpQkFBS1IsV0FBTCxDQUFpQlMsSUFBakIsQ0FBc0JILFVBQXRCO0FBQ0EsaUJBQUtSLEdBQUwsQ0FBU0EsR0FBVCxDQUFhLHFCQUFiOztBQUVBUSx1QkFBV0gsRUFBWCxDQUFjLFNBQWQsRUFBeUIsVUFBQ08sT0FBRCxFQUFhO0FBQ2xDLHVCQUFLQyxtQkFBTCxDQUF5QkwsVUFBekIsRUFBcUNJLE9BQXJDO0FBQ0gsYUFGRDs7QUFJQUosdUJBQVdILEVBQVgsQ0FBYyxPQUFkLEVBQXVCLFVBQUNTLFVBQUQsRUFBYUMsV0FBYixFQUE2QjtBQUNoRCx1QkFBS2YsR0FBTCxDQUFTQSxHQUFULENBQWMsSUFBSWdCLElBQUosRUFBRCxHQUFlLFFBQWYsR0FBMEJSLFdBQVdTLGFBQXJDLEdBQXFELGdCQUFsRTtBQUNILGFBRkQ7QUFHSDs7OzRDQUVtQlQsVSxFQUFZSSxPLEVBQVM7QUFDckMsZ0JBQUlBLFFBQVFNLElBQVIsS0FBaUIsTUFBckIsRUFBNkI7QUFDekJDLHdCQUFRbkIsR0FBUixDQUFZLHVCQUF1QlksUUFBUVEsUUFBM0M7QUFDQVosMkJBQVdhLE9BQVgsQ0FBbUJULFFBQVFRLFFBQTNCO0FBQ0gsYUFIRCxNQUlLLElBQUlSLFFBQVFNLElBQVIsS0FBaUIsUUFBckIsRUFBK0I7QUFDaENDLHdCQUFRbkIsR0FBUixDQUFZLGdDQUFnQ1ksUUFBUVUsVUFBUixDQUFtQkMsTUFBbkQsR0FBNEQsUUFBeEU7QUFDQWYsMkJBQVdnQixTQUFYLENBQXFCWixRQUFRVSxVQUE3QjtBQUNIO0FBQ0o7Ozs7OztrQkFHVXZCLGUiLCJmaWxlIjoiV2ViU29ja2V0U2VydmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgV3NTZXJ2ZXIgPSByZXF1aXJlKCd3ZWJzb2NrZXQnKS5zZXJ2ZXI7XG5jb25zdCBodHRwID0gcmVxdWlyZSgnaHR0cCcpO1xuXG5cbmNsYXNzIFdlYlNvY2tldFNlcnZlciB7XG5cbiAgICBjb25zdHJ1Y3Rvcihsb2c6IExvZywgcmVzdFNlcnZlcjogUmVzdFNlcnZlcil7XG4gICAgICAgIHRoaXMubG9nID0gbG9nO1xuICAgICAgICB0aGlzLmNvbm5lY3Rpb25zID0gW107XG4gICAgICAgIHRoaXMucmVzdFNlcnZlciA9IHJlc3RTZXJ2ZXI7XG4gICAgfVxuXG4gICAgc3RhcnRTZXJ2ZXIoKXtcbiAgICAgICAgdGhpcy5zZXJ2ZXIgPSBuZXcgV3NTZXJ2ZXIoe1xuICAgICAgICAgICAgaHR0cFNlcnZlcjogdGhpcy5yZXN0U2VydmVyLFxuICAgICAgICAgICAgYXV0b0FjY2VwdENvbm5lY3Rpb25zOiBmYWxzZVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnNlcnZlci5vbigncmVxdWVzdCcsIChyZXF1ZXN0KSA9PiB7XG4gICAgICAgICAgICB0aGlzLm9uUmVxdWVzdChyZXF1ZXN0KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb25SZXF1ZXN0KHJlcXVlc3QpIHtcbiAgICAgICAgbGV0IGNvbm5lY3Rpb24gPSByZXF1ZXN0LmFjY2VwdCgnZWNoby1wcm90b2NvbCcsIHJlcXVlc3Qub3JpZ2luKTtcbiAgICAgICAgdGhpcy5jb25uZWN0aW9ucy5wdXNoKGNvbm5lY3Rpb24pO1xuICAgICAgICB0aGlzLmxvZy5sb2coXCJDb25uZWN0aW9uIEFjY2VwdGVkXCIpO1xuXG4gICAgICAgIGNvbm5lY3Rpb24ub24oJ21lc3NhZ2UnLCAobWVzc2FnZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5vbkNvbm5lY3Rpb25NZXNzYWdlKGNvbm5lY3Rpb24sIG1lc3NhZ2UpO1xuICAgICAgICB9KTtcblxuICAgICAgICBjb25uZWN0aW9uLm9uKCdjbG9zZScsIChyZWFzb25Db2RlLCBkZXNjcmlwdGlvbikgPT4ge1xuICAgICAgICAgICAgdGhpcy5sb2cubG9nKChuZXcgRGF0ZSgpKSArICcgUGVlciAnICsgY29ubmVjdGlvbi5yZW1vdGVBZGRyZXNzICsgJyBkaXNjb25uZWN0ZWQuJyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG9uQ29ubmVjdGlvbk1lc3NhZ2UoY29ubmVjdGlvbiwgbWVzc2FnZSkge1xuICAgICAgICBpZiAobWVzc2FnZS50eXBlID09PSAndXRmOCcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdSZWNlaXZlZCBNZXNzYWdlOiAnICsgbWVzc2FnZS51dGY4RGF0YSk7XG4gICAgICAgICAgICBjb25uZWN0aW9uLnNlbmRVVEYobWVzc2FnZS51dGY4RGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobWVzc2FnZS50eXBlID09PSAnYmluYXJ5Jykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1JlY2VpdmVkIEJpbmFyeSBNZXNzYWdlIG9mICcgKyBtZXNzYWdlLmJpbmFyeURhdGEubGVuZ3RoICsgJyBieXRlcycpO1xuICAgICAgICAgICAgY29ubmVjdGlvbi5zZW5kQnl0ZXMobWVzc2FnZS5iaW5hcnlEYXRhKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgV2ViU29ja2V0U2VydmVyOyJdfQ==
//# sourceMappingURL=WebSocketServer.js.map
