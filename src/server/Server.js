'use strict';

var _Ssdp = require('./Ssdp');

var _Ssdp2 = _interopRequireDefault(_Ssdp);

var _RestServer = require('./RestServer');

var _RestServer2 = _interopRequireDefault(_RestServer);

var _WebSocketServer = require('./WebSocketServer');

var _WebSocketServer2 = _interopRequireDefault(_WebSocketServer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var upnp = new _Ssdp2.default();
upnp.startBroadcast();

var rest = new _RestServer2.default();
rest.startServer();

var socket = new _WebSocketServer2.default(rest.getLog(), rest.getServer());
socket.startServer();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlNlcnZlci5lczYiXSwibmFtZXMiOlsidXBucCIsInN0YXJ0QnJvYWRjYXN0IiwicmVzdCIsInN0YXJ0U2VydmVyIiwic29ja2V0IiwiZ2V0TG9nIiwiZ2V0U2VydmVyIl0sIm1hcHBpbmdzIjoiOztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBRUEsSUFBTUEsT0FBTyxvQkFBYjtBQUNBQSxLQUFLQyxjQUFMOztBQUVBLElBQU1DLE9BQU8sMEJBQWI7QUFDQUEsS0FBS0MsV0FBTDs7QUFFQSxJQUFNQyxTQUFTLDhCQUFvQkYsS0FBS0csTUFBTCxFQUFwQixFQUFtQ0gsS0FBS0ksU0FBTCxFQUFuQyxDQUFmO0FBQ0FGLE9BQU9ELFdBQVAiLCJmaWxlIjoiU2VydmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFNzZHAgZnJvbSAnLi9Tc2RwJztcbmltcG9ydCBSZXN0U2VydmVyIGZyb20gJy4vUmVzdFNlcnZlcic7XG5pbXBvcnQgV2ViU29ja2V0U2VydmVyIGZyb20gJy4vV2ViU29ja2V0U2VydmVyJztcblxuY29uc3QgdXBucCA9IG5ldyBTc2RwKCk7XG51cG5wLnN0YXJ0QnJvYWRjYXN0KCk7XG5cbmNvbnN0IHJlc3QgPSBuZXcgUmVzdFNlcnZlcigpO1xucmVzdC5zdGFydFNlcnZlcigpO1xuXG5jb25zdCBzb2NrZXQgPSBuZXcgV2ViU29ja2V0U2VydmVyKHJlc3QuZ2V0TG9nKCksIHJlc3QuZ2V0U2VydmVyKCkpO1xuc29ja2V0LnN0YXJ0U2VydmVyKCk7Il19
//# sourceMappingURL=Server.js.map
