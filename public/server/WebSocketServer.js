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
            this.connections.push(connection);
            this.log.log("Connection Accepted");

            connection.on('message', function (message) {
                _this2.onConnectionMessage(connection, message);
            });

            connection.on('close', function (reasonCode, description) {
                _this2.log.log(new Date() + ' Peer ' + connection.remoteAddress + ' disconnected.');
            });

            connection.sendUTF(JSON.stringify({ 'action': 'HI' }));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvV2ViU29ja2V0U2VydmVyLmVzNiJdLCJuYW1lcyI6WyJXc1NlcnZlciIsInJlcXVpcmUiLCJzZXJ2ZXIiLCJodHRwIiwiV2ViU29ja2V0U2VydmVyIiwibG9nIiwicmVzdFNlcnZlciIsImNvbm5lY3Rpb25zIiwiaHR0cFNlcnZlciIsImF1dG9BY2NlcHRDb25uZWN0aW9ucyIsIm9uIiwicmVxdWVzdCIsIm9uUmVxdWVzdCIsImUiLCJlcnJvciIsIm1lc3NhZ2UiLCJjb25uZWN0aW9uIiwiYWNjZXB0Iiwib3JpZ2luIiwicHVzaCIsIm9uQ29ubmVjdGlvbk1lc3NhZ2UiLCJyZWFzb25Db2RlIiwiZGVzY3JpcHRpb24iLCJEYXRlIiwicmVtb3RlQWRkcmVzcyIsInNlbmRVVEYiLCJKU09OIiwic3RyaW5naWZ5IiwidHlwZSIsImNvbnNvbGUiLCJ1dGY4RGF0YSIsImJpbmFyeURhdGEiLCJsZW5ndGgiLCJzZW5kQnl0ZXMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxJQUFNQSxXQUFXQyxRQUFRLFdBQVIsRUFBcUJDLE1BQXRDO0FBQ0EsSUFBTUMsT0FBT0YsUUFBUSxNQUFSLENBQWI7O0lBR01HLGU7QUFFRiw2QkFBWUMsR0FBWixFQUFzQkMsVUFBdEIsRUFBNkM7QUFBQTs7QUFDekMsYUFBS0QsR0FBTCxHQUFXQSxHQUFYO0FBQ0EsYUFBS0UsV0FBTCxHQUFtQixFQUFuQjtBQUNBLGFBQUtELFVBQUwsR0FBa0JBLFVBQWxCO0FBQ0g7Ozs7c0NBRVk7QUFBQTs7QUFDVCxpQkFBS0osTUFBTCxHQUFjLElBQUlGLFFBQUosQ0FBYTtBQUN2QlEsNEJBQVksS0FBS0YsVUFETTtBQUV2QkcsdUNBQXVCO0FBRkEsYUFBYixDQUFkOztBQUtBLGlCQUFLUCxNQUFMLENBQVlRLEVBQVosQ0FBZSxTQUFmLEVBQTBCLFVBQUNDLE9BQUQsRUFBYTtBQUNuQyxvQkFBSTtBQUNBLDBCQUFLQyxTQUFMLENBQWVELE9BQWY7QUFDSCxpQkFGRCxDQUVDLE9BQU1FLENBQU4sRUFBUTtBQUNMLDBCQUFLUixHQUFMLENBQVNTLEtBQVQsQ0FBZUQsRUFBRUUsT0FBakI7QUFDSDtBQUNKLGFBTkQ7QUFPSDs7O2tDQUVTSixPLEVBQVM7QUFBQTs7QUFDZixnQkFBSUssYUFBYUwsUUFBUU0sTUFBUixDQUFlLGVBQWYsRUFBZ0NOLFFBQVFPLE1BQXhDLENBQWpCO0FBQ0EsaUJBQUtYLFdBQUwsQ0FBaUJZLElBQWpCLENBQXNCSCxVQUF0QjtBQUNBLGlCQUFLWCxHQUFMLENBQVNBLEdBQVQsQ0FBYSxxQkFBYjs7QUFFQVcsdUJBQVdOLEVBQVgsQ0FBYyxTQUFkLEVBQXlCLFVBQUNLLE9BQUQsRUFBYTtBQUNsQyx1QkFBS0ssbUJBQUwsQ0FBeUJKLFVBQXpCLEVBQXFDRCxPQUFyQztBQUNILGFBRkQ7O0FBSUFDLHVCQUFXTixFQUFYLENBQWMsT0FBZCxFQUF1QixVQUFDVyxVQUFELEVBQWFDLFdBQWIsRUFBNkI7QUFDaEQsdUJBQUtqQixHQUFMLENBQVNBLEdBQVQsQ0FBYyxJQUFJa0IsSUFBSixFQUFELEdBQWUsUUFBZixHQUEwQlAsV0FBV1EsYUFBckMsR0FBcUQsZ0JBQWxFO0FBQ0gsYUFGRDs7QUFJQVIsdUJBQVdTLE9BQVgsQ0FBbUJDLEtBQUtDLFNBQUwsQ0FBZSxFQUFDLFVBQVUsSUFBWCxFQUFmLENBQW5CO0FBQ0g7Ozs0Q0FFbUJYLFUsRUFBWUQsTyxFQUFTO0FBQ3JDLGdCQUFJQSxRQUFRYSxJQUFSLEtBQWlCLE1BQXJCLEVBQTZCO0FBQ3pCQyx3QkFBUXhCLEdBQVIsQ0FBWSx1QkFBdUJVLFFBQVFlLFFBQTNDO0FBQ0FkLDJCQUFXUyxPQUFYLENBQW1CVixRQUFRZSxRQUEzQjtBQUNILGFBSEQsTUFJSyxJQUFJZixRQUFRYSxJQUFSLEtBQWlCLFFBQXJCLEVBQStCO0FBQ2hDQyx3QkFBUXhCLEdBQVIsQ0FBWSxnQ0FBZ0NVLFFBQVFnQixVQUFSLENBQW1CQyxNQUFuRCxHQUE0RCxRQUF4RTtBQUNBaEIsMkJBQVdpQixTQUFYLENBQXFCbEIsUUFBUWdCLFVBQTdCO0FBQ0g7QUFDSjs7Ozs7O2tCQUdVM0IsZSIsImZpbGUiOiJXZWJTb2NrZXRTZXJ2ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBXc1NlcnZlciA9IHJlcXVpcmUoJ3dlYnNvY2tldCcpLnNlcnZlcjtcbmNvbnN0IGh0dHAgPSByZXF1aXJlKCdodHRwJyk7XG5cblxuY2xhc3MgV2ViU29ja2V0U2VydmVyIHtcblxuICAgIGNvbnN0cnVjdG9yKGxvZzogTG9nLCByZXN0U2VydmVyOiBSZXN0U2VydmVyKXtcbiAgICAgICAgdGhpcy5sb2cgPSBsb2c7XG4gICAgICAgIHRoaXMuY29ubmVjdGlvbnMgPSBbXTtcbiAgICAgICAgdGhpcy5yZXN0U2VydmVyID0gcmVzdFNlcnZlcjtcbiAgICB9XG5cbiAgICBzdGFydFNlcnZlcigpe1xuICAgICAgICB0aGlzLnNlcnZlciA9IG5ldyBXc1NlcnZlcih7XG4gICAgICAgICAgICBodHRwU2VydmVyOiB0aGlzLnJlc3RTZXJ2ZXIsXG4gICAgICAgICAgICBhdXRvQWNjZXB0Q29ubmVjdGlvbnM6IGZhbHNlXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuc2VydmVyLm9uKCdyZXF1ZXN0JywgKHJlcXVlc3QpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vblJlcXVlc3QocmVxdWVzdCk7XG4gICAgICAgICAgICB9Y2F0Y2goZSl7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoZS5tZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb25SZXF1ZXN0KHJlcXVlc3QpIHtcbiAgICAgICAgbGV0IGNvbm5lY3Rpb24gPSByZXF1ZXN0LmFjY2VwdCgnZWNoby1wcm90b2NvbCcsIHJlcXVlc3Qub3JpZ2luKTtcbiAgICAgICAgdGhpcy5jb25uZWN0aW9ucy5wdXNoKGNvbm5lY3Rpb24pO1xuICAgICAgICB0aGlzLmxvZy5sb2coXCJDb25uZWN0aW9uIEFjY2VwdGVkXCIpO1xuXG4gICAgICAgIGNvbm5lY3Rpb24ub24oJ21lc3NhZ2UnLCAobWVzc2FnZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5vbkNvbm5lY3Rpb25NZXNzYWdlKGNvbm5lY3Rpb24sIG1lc3NhZ2UpO1xuICAgICAgICB9KTtcblxuICAgICAgICBjb25uZWN0aW9uLm9uKCdjbG9zZScsIChyZWFzb25Db2RlLCBkZXNjcmlwdGlvbikgPT4ge1xuICAgICAgICAgICAgdGhpcy5sb2cubG9nKChuZXcgRGF0ZSgpKSArICcgUGVlciAnICsgY29ubmVjdGlvbi5yZW1vdGVBZGRyZXNzICsgJyBkaXNjb25uZWN0ZWQuJyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbm5lY3Rpb24uc2VuZFVURihKU09OLnN0cmluZ2lmeSh7J2FjdGlvbic6ICdISSd9KSk7XG4gICAgfVxuXG4gICAgb25Db25uZWN0aW9uTWVzc2FnZShjb25uZWN0aW9uLCBtZXNzYWdlKSB7XG4gICAgICAgIGlmIChtZXNzYWdlLnR5cGUgPT09ICd1dGY4Jykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1JlY2VpdmVkIE1lc3NhZ2U6ICcgKyBtZXNzYWdlLnV0ZjhEYXRhKTtcbiAgICAgICAgICAgIGNvbm5lY3Rpb24uc2VuZFVURihtZXNzYWdlLnV0ZjhEYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChtZXNzYWdlLnR5cGUgPT09ICdiaW5hcnknKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnUmVjZWl2ZWQgQmluYXJ5IE1lc3NhZ2Ugb2YgJyArIG1lc3NhZ2UuYmluYXJ5RGF0YS5sZW5ndGggKyAnIGJ5dGVzJyk7XG4gICAgICAgICAgICBjb25uZWN0aW9uLnNlbmRCeXRlcyhtZXNzYWdlLmJpbmFyeURhdGEpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBXZWJTb2NrZXRTZXJ2ZXI7Il19
//# sourceMappingURL=WebSocketServer.js.map
