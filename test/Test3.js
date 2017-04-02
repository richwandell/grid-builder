'use strict';

var _Db = require('../public/server/Db');

var _Db2 = _interopRequireDefault(_Db);

var _Knn = require('../public/server/Knn');

var _Knn2 = _interopRequireDefault(_Knn);

var _KMeans = require('../public/server/KMeans');

var _KMeans2 = _interopRequireDefault(_KMeans);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var scanner = require('node-wifi-scanner');
var os = require('os');

var ifaces = os.networkInterfaces();
console.log(ifaces);

scanner.scan(function (err, networks) {
    if (err) {
        console.error(err);
        return;
    }

    console.log(networks);

    var log = { debug: function debug() {}, log: function log() {} };
    var database = new _Db2.default(log);
    var rows = networks.map(function (net) {
        return { ap_id: net.mac, value: net.rssi };
    });

    var knn = new _Knn2.default(log, database, '336c6582c283421c28479e8801e8edfa', rows);
    knn.getNeighbors(5, function (knn) {
        var km = new _KMeans2.default(2, knn);
        var largestCluster = km.getLargestClusterIndex();
        var guess = km.getCentroid(largestCluster);

        console.log(guess);
    });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlRlc3QzLmVzNiJdLCJuYW1lcyI6WyJzY2FubmVyIiwicmVxdWlyZSIsIm9zIiwiaWZhY2VzIiwibmV0d29ya0ludGVyZmFjZXMiLCJjb25zb2xlIiwibG9nIiwic2NhbiIsImVyciIsIm5ldHdvcmtzIiwiZXJyb3IiLCJkZWJ1ZyIsImRhdGFiYXNlIiwicm93cyIsIm1hcCIsIm5ldCIsImFwX2lkIiwibWFjIiwidmFsdWUiLCJyc3NpIiwia25uIiwiZ2V0TmVpZ2hib3JzIiwia20iLCJsYXJnZXN0Q2x1c3RlciIsImdldExhcmdlc3RDbHVzdGVySW5kZXgiLCJndWVzcyIsImdldENlbnRyb2lkIl0sIm1hcHBpbmdzIjoiOztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBQ0EsSUFBTUEsVUFBVUMsUUFBUSxtQkFBUixDQUFoQjtBQUNBLElBQU1DLEtBQUtELFFBQVEsSUFBUixDQUFYOztBQUVBLElBQU1FLFNBQVNELEdBQUdFLGlCQUFILEVBQWY7QUFDQUMsUUFBUUMsR0FBUixDQUFZSCxNQUFaOztBQUVBSCxRQUFRTyxJQUFSLENBQWEsVUFBQ0MsR0FBRCxFQUFNQyxRQUFOLEVBQW1CO0FBQzVCLFFBQUlELEdBQUosRUFBUztBQUNMSCxnQkFBUUssS0FBUixDQUFjRixHQUFkO0FBQ0E7QUFDSDs7QUFFREgsWUFBUUMsR0FBUixDQUFZRyxRQUFaOztBQUVBLFFBQU1ILE1BQU0sRUFBQ0ssT0FBTyxpQkFBTSxDQUFFLENBQWhCLEVBQWtCTCxLQUFLLGVBQU0sQ0FBRSxDQUEvQixFQUFaO0FBQ0EsUUFBTU0sV0FBVyxpQkFBT04sR0FBUCxDQUFqQjtBQUNBLFFBQU1PLE9BQU9KLFNBQVNLLEdBQVQsQ0FBYSxVQUFDQyxHQUFELEVBQVM7QUFDL0IsZUFBTyxFQUFDQyxPQUFPRCxJQUFJRSxHQUFaLEVBQWlCQyxPQUFPSCxJQUFJSSxJQUE1QixFQUFQO0FBQ0gsS0FGWSxDQUFiOztBQUlBLFFBQUlDLE1BQU0sa0JBQVFkLEdBQVIsRUFBYU0sUUFBYixFQUF1QixrQ0FBdkIsRUFBMkRDLElBQTNELENBQVY7QUFDQU8sUUFBSUMsWUFBSixDQUFpQixDQUFqQixFQUFvQixVQUFDRCxHQUFELEVBQVM7QUFDekIsWUFBSUUsS0FBSyxxQkFBVyxDQUFYLEVBQWNGLEdBQWQsQ0FBVDtBQUNBLFlBQU1HLGlCQUFpQkQsR0FBR0Usc0JBQUgsRUFBdkI7QUFDQSxZQUFNQyxRQUFRSCxHQUFHSSxXQUFILENBQWVILGNBQWYsQ0FBZDs7QUFFQWxCLGdCQUFRQyxHQUFSLENBQVltQixLQUFaO0FBQ0gsS0FORDtBQU9ILENBdEJEIiwiZmlsZSI6IlRlc3QzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IERiIGZyb20gJy4uL3B1YmxpYy9zZXJ2ZXIvRGInO1xuaW1wb3J0IEtubiBmcm9tICcuLi9wdWJsaWMvc2VydmVyL0tubic7XG5pbXBvcnQgS01lYW5zIGZyb20gJy4uL3B1YmxpYy9zZXJ2ZXIvS01lYW5zJztcbmNvbnN0IHNjYW5uZXIgPSByZXF1aXJlKCdub2RlLXdpZmktc2Nhbm5lcicpO1xuY29uc3Qgb3MgPSByZXF1aXJlKCdvcycpO1xuXG5jb25zdCBpZmFjZXMgPSBvcy5uZXR3b3JrSW50ZXJmYWNlcygpO1xuY29uc29sZS5sb2coaWZhY2VzKTtcblxuc2Nhbm5lci5zY2FuKChlcnIsIG5ldHdvcmtzKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZyhuZXR3b3Jrcyk7XG5cbiAgICBjb25zdCBsb2cgPSB7ZGVidWc6ICgpID0+IHt9LCBsb2c6ICgpID0+IHt9fTtcbiAgICBjb25zdCBkYXRhYmFzZSA9IG5ldyBEYihsb2cpO1xuICAgIGNvbnN0IHJvd3MgPSBuZXR3b3Jrcy5tYXAoKG5ldCkgPT4ge1xuICAgICAgICByZXR1cm4ge2FwX2lkOiBuZXQubWFjLCB2YWx1ZTogbmV0LnJzc2l9O1xuICAgIH0pO1xuXG4gICAgbGV0IGtubiA9IG5ldyBLbm4obG9nLCBkYXRhYmFzZSwgJzMzNmM2NTgyYzI4MzQyMWMyODQ3OWU4ODAxZThlZGZhJywgcm93cyk7XG4gICAga25uLmdldE5laWdoYm9ycyg1LCAoa25uKSA9PiB7XG4gICAgICAgIGxldCBrbSA9IG5ldyBLTWVhbnMoMiwga25uKTtcbiAgICAgICAgY29uc3QgbGFyZ2VzdENsdXN0ZXIgPSBrbS5nZXRMYXJnZXN0Q2x1c3RlckluZGV4KCk7XG4gICAgICAgIGNvbnN0IGd1ZXNzID0ga20uZ2V0Q2VudHJvaWQobGFyZ2VzdENsdXN0ZXIpO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKGd1ZXNzKTtcbiAgICB9KTtcbn0pOyJdfQ==
//# sourceMappingURL=Test3.js.map
