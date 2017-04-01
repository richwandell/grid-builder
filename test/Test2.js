'use strict';

var _Db = require('../src/server/Db');

var _Db2 = _interopRequireDefault(_Db);

var _Knn = require('../src/server/Knn');

var _Knn2 = _interopRequireDefault(_Knn);

var _KMeans = require('../src/server/KMeans');

var _KMeans2 = _interopRequireDefault(_KMeans);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require('fs');

var Test2 = function Test2() {
    _classCallCheck(this, Test2);

    debugger;
    var log = { debug: function debug() {}, log: function log() {} };
    var database = new _Db2.default(log);

    var rows = JSON.parse(fs.readFileSync("./test/0-18.json", "utf8"));

    var knn = new _Knn2.default(log, database, '336c6582c283421c28479e8801e8edfa', rows);
    knn.getNeighbors(5, function (knn) {
        var cc = new _KMeans2.default(2, knn);
        var out = {
            succes: true,
            knn: knn,
            clusters: cc[0],
            centroids: cc[1]
        };

        console.log(out.knn);
        console.log("\n");
        console.log(out.clusters);
        console.log("\n");
        console.log(out.centroids);

        var largest = 0;

        out.clusters.forEach(function (cl) {
            if (cl.length > largest) {
                largest = cl.length;
            }
        });
        var best = Infinity;
        var bestCluster = void 0;
        out.clusters.forEach(function (cl) {
            if (cl.length == largest) {
                var totalDist = 0;
                cl.forEach(function (i) {
                    totalDist += i[2];
                });
                if (totalDist < best) {
                    best = totalDist;
                    bestCluster = cl;
                }
            }
        });
        console.log(bestCluster);
    });
};

new Test2();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlRlc3QyLmVzNiJdLCJuYW1lcyI6WyJmcyIsInJlcXVpcmUiLCJUZXN0MiIsImxvZyIsImRlYnVnIiwiZGF0YWJhc2UiLCJyb3dzIiwiSlNPTiIsInBhcnNlIiwicmVhZEZpbGVTeW5jIiwia25uIiwiZ2V0TmVpZ2hib3JzIiwiY2MiLCJvdXQiLCJzdWNjZXMiLCJjbHVzdGVycyIsImNlbnRyb2lkcyIsImNvbnNvbGUiLCJsYXJnZXN0IiwiZm9yRWFjaCIsImNsIiwibGVuZ3RoIiwiYmVzdCIsIkluZmluaXR5IiwiYmVzdENsdXN0ZXIiLCJ0b3RhbERpc3QiLCJpIl0sIm1hcHBpbmdzIjoiOztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7QUFDQSxJQUFNQSxLQUFLQyxRQUFRLElBQVIsQ0FBWDs7SUFFTUMsSyxHQUNGLGlCQUFhO0FBQUE7O0FBQ1Q7QUFDQSxRQUFNQyxNQUFNLEVBQUNDLE9BQU8saUJBQU0sQ0FBRSxDQUFoQixFQUFrQkQsS0FBSyxlQUFNLENBQUUsQ0FBL0IsRUFBWjtBQUNBLFFBQUlFLFdBQVcsaUJBQU9GLEdBQVAsQ0FBZjs7QUFFQSxRQUFJRyxPQUFPQyxLQUFLQyxLQUFMLENBQVdSLEdBQUdTLFlBQUgsQ0FBZ0Isa0JBQWhCLEVBQW9DLE1BQXBDLENBQVgsQ0FBWDs7QUFFQSxRQUFJQyxNQUFNLGtCQUFRUCxHQUFSLEVBQWFFLFFBQWIsRUFBdUIsa0NBQXZCLEVBQTJEQyxJQUEzRCxDQUFWO0FBQ0FJLFFBQUlDLFlBQUosQ0FBaUIsQ0FBakIsRUFBb0IsVUFBQ0QsR0FBRCxFQUFTO0FBQ3pCLFlBQUlFLEtBQUsscUJBQVcsQ0FBWCxFQUFjRixHQUFkLENBQVQ7QUFDQSxZQUFJRyxNQUFNO0FBQ05DLG9CQUFRLElBREY7QUFFTkosaUJBQUtBLEdBRkM7QUFHTkssc0JBQVVILEdBQUcsQ0FBSCxDQUhKO0FBSU5JLHVCQUFXSixHQUFHLENBQUg7QUFKTCxTQUFWOztBQU9BSyxnQkFBUWQsR0FBUixDQUFZVSxJQUFJSCxHQUFoQjtBQUNBTyxnQkFBUWQsR0FBUixDQUFZLElBQVo7QUFDQWMsZ0JBQVFkLEdBQVIsQ0FBWVUsSUFBSUUsUUFBaEI7QUFDQUUsZ0JBQVFkLEdBQVIsQ0FBWSxJQUFaO0FBQ0FjLGdCQUFRZCxHQUFSLENBQVlVLElBQUlHLFNBQWhCOztBQUdBLFlBQUlFLFVBQVUsQ0FBZDs7QUFFQUwsWUFBSUUsUUFBSixDQUFhSSxPQUFiLENBQXFCLFVBQVNDLEVBQVQsRUFBYTtBQUM5QixnQkFBR0EsR0FBR0MsTUFBSCxHQUFZSCxPQUFmLEVBQXVCO0FBQ25CQSwwQkFBVUUsR0FBR0MsTUFBYjtBQUNIO0FBQ0osU0FKRDtBQUtBLFlBQUlDLE9BQU9DLFFBQVg7QUFDQSxZQUFJQyxvQkFBSjtBQUNBWCxZQUFJRSxRQUFKLENBQWFJLE9BQWIsQ0FBcUIsVUFBU0MsRUFBVCxFQUFZO0FBQzdCLGdCQUFHQSxHQUFHQyxNQUFILElBQWFILE9BQWhCLEVBQXlCO0FBQ3JCLG9CQUFJTyxZQUFZLENBQWhCO0FBQ0FMLG1CQUFHRCxPQUFILENBQVcsVUFBVU8sQ0FBVixFQUFhO0FBQ3BCRCxpQ0FBYUMsRUFBRSxDQUFGLENBQWI7QUFDSCxpQkFGRDtBQUdBLG9CQUFJRCxZQUFZSCxJQUFoQixFQUFzQjtBQUNsQkEsMkJBQU9HLFNBQVA7QUFDQUQsa0NBQWNKLEVBQWQ7QUFDSDtBQUNKO0FBQ0osU0FYRDtBQVlBSCxnQkFBUWQsR0FBUixDQUFZcUIsV0FBWjtBQUNILEtBdENEO0FBdUNILEM7O0FBR0wsSUFBSXRCLEtBQUoiLCJmaWxlIjoiVGVzdDIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRGIgZnJvbSAnLi4vc3JjL3NlcnZlci9EYic7XG5pbXBvcnQgS25uIGZyb20gJy4uL3NyYy9zZXJ2ZXIvS25uJztcbmltcG9ydCBLTWVhbnMgZnJvbSAnLi4vc3JjL3NlcnZlci9LTWVhbnMnO1xuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuXG5jbGFzcyBUZXN0MntcbiAgICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgICBkZWJ1Z2dlcjtcbiAgICAgICAgY29uc3QgbG9nID0ge2RlYnVnOiAoKSA9PiB7fSwgbG9nOiAoKSA9PiB7fX07XG4gICAgICAgIGxldCBkYXRhYmFzZSA9IG5ldyBEYihsb2cpO1xuXG4gICAgICAgIGxldCByb3dzID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMoXCIuL3Rlc3QvMC0xOC5qc29uXCIsIFwidXRmOFwiKSk7XG5cbiAgICAgICAgbGV0IGtubiA9IG5ldyBLbm4obG9nLCBkYXRhYmFzZSwgJzMzNmM2NTgyYzI4MzQyMWMyODQ3OWU4ODAxZThlZGZhJywgcm93cyk7XG4gICAgICAgIGtubi5nZXROZWlnaGJvcnMoNSwgKGtubikgPT4ge1xuICAgICAgICAgICAgbGV0IGNjID0gbmV3IEtNZWFucygyLCBrbm4pO1xuICAgICAgICAgICAgbGV0IG91dCA9IHtcbiAgICAgICAgICAgICAgICBzdWNjZXM6IHRydWUsXG4gICAgICAgICAgICAgICAga25uOiBrbm4sXG4gICAgICAgICAgICAgICAgY2x1c3RlcnM6IGNjWzBdLFxuICAgICAgICAgICAgICAgIGNlbnRyb2lkczogY2NbMV1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKG91dC5rbm4pO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJcXG5cIik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhvdXQuY2x1c3RlcnMpXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlxcblwiKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKG91dC5jZW50cm9pZHMpO1xuXG5cbiAgICAgICAgICAgIGxldCBsYXJnZXN0ID0gMDtcblxuICAgICAgICAgICAgb3V0LmNsdXN0ZXJzLmZvckVhY2goZnVuY3Rpb24oY2wpIHtcbiAgICAgICAgICAgICAgICBpZihjbC5sZW5ndGggPiBsYXJnZXN0KXtcbiAgICAgICAgICAgICAgICAgICAgbGFyZ2VzdCA9IGNsLmxlbmd0aDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGxldCBiZXN0ID0gSW5maW5pdHk7XG4gICAgICAgICAgICBsZXQgYmVzdENsdXN0ZXI7XG4gICAgICAgICAgICBvdXQuY2x1c3RlcnMuZm9yRWFjaChmdW5jdGlvbihjbCl7XG4gICAgICAgICAgICAgICAgaWYoY2wubGVuZ3RoID09IGxhcmdlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRvdGFsRGlzdCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGNsLmZvckVhY2goZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsRGlzdCArPSBpWzJdXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAodG90YWxEaXN0IDwgYmVzdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmVzdCA9IHRvdGFsRGlzdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJlc3RDbHVzdGVyID0gY2w7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGJlc3RDbHVzdGVyKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5uZXcgVGVzdDIoKTsiXX0=
//# sourceMappingURL=Test2.js.map
