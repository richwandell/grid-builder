'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Db = require('../src/server/Db');

var _Db2 = _interopRequireDefault(_Db);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require('fs');

var Test = function () {
    function Test() {
        var _this = this;

        _classCallCheck(this, Test);

        var database = new _Db2.default({
            debug: function debug() {}
        });

        var db = database.getDatabase();

        var rows = fs.readFileSync("./1-28.csv", "utf8").split("\n");

        var features = {};

        var fp_id = 0;

        rows.forEach(function (row) {
            row = row.split(",");
            if (typeof row[1] == "undefined") return;

            rows.forEach(function (row1) {
                row1 = row1.split(",");
                if (typeof row1[1] == "undefined") return;
                fp_id = row[0];
                features[row[1] + row1[1]] = Math.abs(Number(row[4]) - Number(row1[4]));
            });
        });
        this.start = new Date().getTime();
        var data = [];
        var keys = Object.keys(features);
        var done = 0;

        keys.forEach(function (key) {
            db.all(_Db2.default.query_get_features.replace(":feature_value:", features[key]), [key, fp_id], function (err, rows) {
                data.push(rows);
                done++;
                if (done >= keys.length) {
                    db.close();
                    _this.makeGuess(data);
                }
            });
        });
    }

    _createClass(Test, [{
        key: 'makeGuess',
        value: function makeGuess(data) {

            var distances = {};
            var knn = [];

            data.forEach(function (feature) {
                if (feature.length == 0) return;

                feature.forEach(function (coord) {
                    if (typeof distances[coord.x + "_" + coord.y] == "undefined") {
                        distances[coord.x + "_" + coord.y] = [];
                    }

                    distances[coord.x + "_" + coord.y].push(Math.pow(coord.diff, 2));
                });
            });
            var keys = Object.keys(distances);
            keys.forEach(function (key) {
                knn.push({
                    x_y: key,
                    distance: Math.sqrt(distances[key].reduce(function (a, b) {
                        return a + b;
                    }))
                });
            });
            knn.sort(function (a, b) {
                return a.distance > b.distance;
            });

            console.log(knn);
            this.end = new Date().getTime();
            console.log(this.end - this.start);
        }
    }]);

    return Test;
}();

//new Test();

var Test1 = function () {
    _createClass(Test1, [{
        key: 'kmeans',
        value: function kmeans(c) {
            var centroids = this.findCentroids(c);
            var newCE = this.findClusters(centroids, c.reduce(function (a, b) {
                return a.concat(b);
            }));

            var new_error = newCE[0];
            var clusters = newCE[1];

            var same = true;
            for (var i = 0; i < new_error.length; i++) {
                if (new_error[i] !== this.old_error[i]) {
                    same = false;
                    this.old_error = new_error;
                    break;
                }
            }
            if (same) {
                return clusters;
            } else {
                return this.kmeans(clusters);
            }
        }
    }]);

    function Test1() {
        _classCallCheck(this, Test1);

        var success = JSON.parse('{"succes":true,"knn":[{"x_y":"8_2","x":8,"y":2,"distance":285.15278139022917},{"x_y":"0_20","x":0,"y":20,"distance":267.51499438540867},{"x_y":"1_20","x":1,"y":20,"distance":224.59007657700653},{"x_y":"2_17","x":2,"y":17,"distance":201.50943271573516},{"x_y":"0_17","x":0,"y":17,"distance":203.63129405777823}],"center":[3,16]}');

        var clusters = [success.knn.slice(0, 2).map(function (n) {
            return [n.x, n.y];
        }), success.knn.slice(2, 5).map(function (n) {
            return [n.x, n.y];
        })];

        this.old_error = clusters.map(function () {
            return Infinity;
        });

        clusters = this.kmeans(clusters);

        console.log(clusters);
    }

    _createClass(Test1, [{
        key: 'findCentroids',
        value: function findCentroids(clusters) {

            var centroids = [];

            for (var i = 0; i < clusters.length; i++) {
                var clu = clusters[i];
                var x = 0;
                var y = 0;
                for (var j = 0; j < clu.length; j++) {
                    x += clu[j][0];
                    y += clu[j][1];
                }
                var center = [x / clu.length, y / clu.length];
                centroids.push(center);
            }
            return centroids;
        }
    }, {
        key: 'findClusters',
        value: function findClusters(centroids, dataset) {

            var clusters = centroids.map(function (c) {
                return [];
            });
            var new_error = centroids.map(function () {
                return 0;
            });
            for (var i = 0; i < dataset.length; i++) {
                var dp = dataset[i];
                var closest = false;
                var closest_distance = Infinity;
                for (var j = 0; j < centroids.length; j++) {
                    var center = centroids[j];
                    var distance = this.dist(center, dp);
                    if (distance < closest_distance) {
                        closest = j;
                        closest_distance = distance;
                    }
                }
                new_error[closest] = Number(new_error[closest]) + Math.pow(closest_distance, 2);

                clusters[closest].push(dp);
            }
            return [new_error, clusters];
        }
    }, {
        key: 'dist',
        value: function dist(a, b) {
            var root = 0;
            for (var i = 0; i < a.length; i++) {
                root += Math.pow(a[i] - b[i], 2);
            }
            return Math.sqrt(root);
        }
    }]);

    return Test1;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlRlc3QuZXM2Il0sIm5hbWVzIjpbImZzIiwicmVxdWlyZSIsIlRlc3QiLCJkYXRhYmFzZSIsImRlYnVnIiwiZGIiLCJnZXREYXRhYmFzZSIsInJvd3MiLCJyZWFkRmlsZVN5bmMiLCJzcGxpdCIsImZlYXR1cmVzIiwiZnBfaWQiLCJmb3JFYWNoIiwicm93Iiwicm93MSIsIk1hdGgiLCJhYnMiLCJOdW1iZXIiLCJzdGFydCIsIkRhdGUiLCJnZXRUaW1lIiwiZGF0YSIsImtleXMiLCJPYmplY3QiLCJkb25lIiwia2V5IiwiYWxsIiwicXVlcnlfZ2V0X2ZlYXR1cmVzIiwicmVwbGFjZSIsImVyciIsInB1c2giLCJsZW5ndGgiLCJjbG9zZSIsIm1ha2VHdWVzcyIsImRpc3RhbmNlcyIsImtubiIsImZlYXR1cmUiLCJjb29yZCIsIngiLCJ5IiwicG93IiwiZGlmZiIsInhfeSIsImRpc3RhbmNlIiwic3FydCIsInJlZHVjZSIsImEiLCJiIiwic29ydCIsImNvbnNvbGUiLCJsb2ciLCJlbmQiLCJUZXN0MSIsImMiLCJjZW50cm9pZHMiLCJmaW5kQ2VudHJvaWRzIiwibmV3Q0UiLCJmaW5kQ2x1c3RlcnMiLCJjb25jYXQiLCJuZXdfZXJyb3IiLCJjbHVzdGVycyIsInNhbWUiLCJpIiwib2xkX2Vycm9yIiwia21lYW5zIiwic3VjY2VzcyIsIkpTT04iLCJwYXJzZSIsInNsaWNlIiwibWFwIiwibiIsIkluZmluaXR5IiwiY2x1IiwiaiIsImNlbnRlciIsImRhdGFzZXQiLCJkcCIsImNsb3Nlc3QiLCJjbG9zZXN0X2Rpc3RhbmNlIiwiZGlzdCIsInJvb3QiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTs7Ozs7Ozs7QUFDQSxJQUFNQSxLQUFLQyxRQUFRLElBQVIsQ0FBWDs7SUFFTUMsSTtBQUNGLG9CQUFhO0FBQUE7O0FBQUE7O0FBQ1QsWUFBSUMsV0FBVyxpQkFBTztBQUNsQkMsbUJBQU8saUJBQU0sQ0FBRTtBQURHLFNBQVAsQ0FBZjs7QUFJQSxZQUFJQyxLQUFLRixTQUFT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TyxDQUFDakIsU0FBRCxFQUFZQyxRQUFaLENBQVA7QUFDSDs7OzZCQUVJZCxDLEVBQUdDLEMsRUFBRTtBQUNOLGdCQUFJaUMsT0FBTyxDQUFYO0FBQ0EsaUJBQUksSUFBSWxCLElBQUksQ0FBWixFQUFlQSxJQUFJaEIsRUFBRWYsTUFBckIsRUFBNkIrQixHQUE3QixFQUFpQztBQUM3QmtCLHdCQUFRakUsS0FBS3lCLEdBQUwsQ0FBVU0sRUFBRWdCLENBQUYsSUFBT2YsRUFBRWUsQ0FBRixDQUFqQixFQUF3QixDQUF4QixDQUFSO0FBQ0g7QUFDRCxtQkFBTy9DLEtBQUs2QixJQUFMLENBQVVvQyxJQUFWLENBQVA7QUFDSCIsImZpbGUiOiJUZXN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IERiIGZyb20gJy4uL3NyYy9zZXJ2ZXIvRGInO1xuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuXG5jbGFzcyBUZXN0IHtcbiAgICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgICBsZXQgZGF0YWJhc2UgPSBuZXcgRGIoe1xuICAgICAgICAgICAgZGVidWc6ICgpID0+IHt9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBkYiA9IGRhdGFiYXNlLmdldERhdGFiYXNlKCk7XG5cbiAgICAgICAgbGV0IHJvd3MgPSBmcy5yZWFkRmlsZVN5bmMoXCIuLzEtMjguY3N2XCIsIFwidXRmOFwiKS5zcGxpdChcIlxcblwiKTtcblxuICAgICAgICBsZXQgZmVhdHVyZXMgPSB7fTtcblxuICAgICAgICBsZXQgZnBfaWQgPSAwO1xuXG4gICAgICAgIHJvd3MuZm9yRWFjaCgocm93KSA9PiB7XG4gICAgICAgICAgICByb3cgPSByb3cuc3BsaXQoXCIsXCIpO1xuICAgICAgICAgICAgaWYodHlwZW9mKHJvd1sxXSkgPT0gXCJ1bmRlZmluZWRcIikgcmV0dXJuO1xuXG4gICAgICAgICAgICByb3dzLmZvckVhY2goKHJvdzEpID0+IHtcbiAgICAgICAgICAgICAgICByb3cxID0gcm93MS5zcGxpdChcIixcIik7XG4gICAgICAgICAgICAgICAgaWYodHlwZW9mKHJvdzFbMV0pID09IFwidW5kZWZpbmVkXCIpIHJldHVybjtcbiAgICAgICAgICAgICAgICBmcF9pZCA9IHJvd1swXTtcbiAgICAgICAgICAgICAgICBmZWF0dXJlc1tyb3dbMV0gKyByb3cxWzFdXSA9IE1hdGguYWJzKE51bWJlcihyb3dbNF0pIC0gTnVtYmVyKHJvdzFbNF0pKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5zdGFydCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICBsZXQgZGF0YSA9IFtdO1xuICAgICAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzKGZlYXR1cmVzKTtcbiAgICAgICAgbGV0IGRvbmUgPSAwO1xuXG4gICAgICAgIGtleXMuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgICAgICBkYi5hbGwoRGIucXVlcnlfZ2V0X2ZlYXR1cmVzLnJlcGxhY2UoXCI6ZmVhdHVyZV92YWx1ZTpcIiwgZmVhdHVyZXNba2V5XSksIFtrZXksIGZwX2lkXSwgKGVyciwgcm93cykgPT4ge1xuICAgICAgICAgICAgICAgIGRhdGEucHVzaChyb3dzKTtcbiAgICAgICAgICAgICAgICBkb25lKys7XG4gICAgICAgICAgICAgICAgaWYoZG9uZSA+PSBrZXlzLmxlbmd0aCl7XG4gICAgICAgICAgICAgICAgICAgIGRiLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFrZUd1ZXNzKGRhdGEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBtYWtlR3Vlc3MoZGF0YSl7XG5cbiAgICAgICAgbGV0IGRpc3RhbmNlcyA9IHt9O1xuICAgICAgICBsZXQga25uID0gW107XG5cbiAgICAgICAgZGF0YS5mb3JFYWNoKChmZWF0dXJlKSA9PiB7XG4gICAgICAgICAgICBpZihmZWF0dXJlLmxlbmd0aCA9PSAwKSByZXR1cm47XG5cbiAgICAgICAgICAgIGZlYXR1cmUuZm9yRWFjaCgoY29vcmQpID0+IHtcbiAgICAgICAgICAgICAgICBpZih0eXBlb2YoZGlzdGFuY2VzW2Nvb3JkLnggKyBcIl9cIiArIGNvb3JkLnldKSA9PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2VzW2Nvb3JkLnggKyBcIl9cIiArIGNvb3JkLnldID0gW107XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZGlzdGFuY2VzW2Nvb3JkLnggKyBcIl9cIiArIGNvb3JkLnldLnB1c2goTWF0aC5wb3coY29vcmQuZGlmZiwgMikpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzKGRpc3RhbmNlcyk7XG4gICAgICAgIGtleXMuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgICAgICBrbm4ucHVzaCh7XG4gICAgICAgICAgICAgICAgeF95OiBrZXksXG4gICAgICAgICAgICAgICAgZGlzdGFuY2U6IE1hdGguc3FydChkaXN0YW5jZXNba2V5XS5yZWR1Y2UoKGEsIGIpID0+IHsgcmV0dXJuIGErYjsgfSkpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGtubi5zb3J0KChhLCBiKSA9PiB7IHJldHVybiBhLmRpc3RhbmNlID4gYi5kaXN0YW5jZTsgfSk7XG5cbiAgICAgICAgY29uc29sZS5sb2coa25uKTtcbiAgICAgICAgdGhpcy5lbmQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5lbmQgLSB0aGlzLnN0YXJ0KTtcbiAgICB9XG5cbn1cblxuLy9uZXcgVGVzdCgpO1xuXG5jbGFzcyBUZXN0MXtcblxuICAgIGttZWFucyhjKXtcbiAgICAgICAgbGV0IGNlbnRyb2lkcyA9IHRoaXMuZmluZENlbnRyb2lkcyhjKTtcbiAgICAgICAgbGV0IG5ld0NFID0gdGhpcy5maW5kQ2x1c3RlcnMoXG4gICAgICAgICAgICBjZW50cm9pZHMsXG4gICAgICAgICAgICBjLnJlZHVjZSgoYSwgYikgPT4geyByZXR1cm4gYS5jb25jYXQoYik7IH0pXG4gICAgICAgICk7XG5cbiAgICAgICAgbGV0IG5ld19lcnJvciA9IG5ld0NFWzBdO1xuICAgICAgICBsZXQgY2x1c3RlcnMgPSBuZXdDRVsxXTtcblxuICAgICAgICBsZXQgc2FtZSA9IHRydWU7XG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBuZXdfZXJyb3IubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgaWYobmV3X2Vycm9yW2ldICE9PSB0aGlzLm9sZF9lcnJvcltpXSl7XG4gICAgICAgICAgICAgICAgc2FtZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMub2xkX2Vycm9yID0gbmV3X2Vycm9yO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmKHNhbWUpe1xuICAgICAgICAgICAgcmV0dXJuIGNsdXN0ZXJzO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmttZWFucyhjbHVzdGVycyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgICBjb25zdCBzdWNjZXNzID0gSlNPTi5wYXJzZSgne1wic3VjY2VzXCI6dHJ1ZSxcImtublwiOlt7XCJ4X3lcIjpcIjhfMlwiLFwieFwiOjgsXCJ5XCI6MixcImRpc3RhbmNlXCI6Mjg1LjE1Mjc4MTM5MDIyOTE3fSx7XCJ4X3lcIjpcIjBfMjBcIixcInhcIjowLFwieVwiOjIwLFwiZGlzdGFuY2VcIjoyNjcuNTE0OTk0Mzg1NDA4Njd9LHtcInhfeVwiOlwiMV8yMFwiLFwieFwiOjEsXCJ5XCI6MjAsXCJkaXN0YW5jZVwiOjIyNC41OTAwNzY1NzcwMDY1M30se1wieF95XCI6XCIyXzE3XCIsXCJ4XCI6MixcInlcIjoxNyxcImRpc3RhbmNlXCI6MjAxLjUwOTQzMjcxNTczNTE2fSx7XCJ4X3lcIjpcIjBfMTdcIixcInhcIjowLFwieVwiOjE3LFwiZGlzdGFuY2VcIjoyMDMuNjMxMjk0MDU3Nzc4MjN9XSxcImNlbnRlclwiOlszLDE2XX0nKTtcblxuICAgICAgICBsZXQgY2x1c3RlcnMgPSBbXG4gICAgICAgICAgICBzdWNjZXNzLmtubi5zbGljZSgwLCAyKVxuICAgICAgICAgICAgICAgIC5tYXAoKG4pID0+IHtyZXR1cm4gW24ueCwgbi55XTt9KSxcbiAgICAgICAgICAgIHN1Y2Nlc3Mua25uLnNsaWNlKDIsIDUpXG4gICAgICAgICAgICAgICAgLm1hcCgobikgPT4ge3JldHVybiBbbi54LCBuLnldO30pXG4gICAgICAgIF07XG5cbiAgICAgICAgdGhpcy5vbGRfZXJyb3IgPSBjbHVzdGVycy5tYXAoKCkgPT4ge3JldHVybiBJbmZpbml0eTt9KTtcblxuICAgICAgICBjbHVzdGVycyA9IHRoaXMua21lYW5zKGNsdXN0ZXJzKTtcblxuICAgICAgICBjb25zb2xlLmxvZyhjbHVzdGVycyk7XG4gICAgfVxuXG5cbiAgICBmaW5kQ2VudHJvaWRzKGNsdXN0ZXJzKXtcblxuICAgICAgICBsZXQgY2VudHJvaWRzID0gW107XG5cbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IGNsdXN0ZXJzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGxldCBjbHUgPSBjbHVzdGVyc1tpXTtcbiAgICAgICAgICAgIGxldCB4ID0gMDtcbiAgICAgICAgICAgIGxldCB5ID0gMDtcbiAgICAgICAgICAgIGZvcihsZXQgaiA9IDA7IGogPCBjbHUubGVuZ3RoOyBqKyspe1xuICAgICAgICAgICAgICAgIHggKz0gY2x1W2pdWzBdO1xuICAgICAgICAgICAgICAgIHkgKz0gY2x1W2pdWzFdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IGNlbnRlciA9IFt4IC8gY2x1Lmxlbmd0aCwgeSAvIGNsdS5sZW5ndGhdO1xuICAgICAgICAgICAgY2VudHJvaWRzLnB1c2goY2VudGVyKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2VudHJvaWRzO1xuICAgIH1cblxuICAgIGZpbmRDbHVzdGVycyhjZW50cm9pZHMsIGRhdGFzZXQpe1xuXG4gICAgICAgIGxldCBjbHVzdGVycyA9IGNlbnRyb2lkcy5tYXAoKGMpID0+IHsgcmV0dXJuIFtdOyB9KTtcbiAgICAgICAgbGV0IG5ld19lcnJvciA9IGNlbnRyb2lkcy5tYXAoKCkgPT4ge3JldHVybiAwO30pO1xuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgZGF0YXNldC5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICBsZXQgZHAgPSBkYXRhc2V0W2ldO1xuICAgICAgICAgICAgbGV0IGNsb3Nlc3QgPSBmYWxzZTtcbiAgICAgICAgICAgIGxldCBjbG9zZXN0X2Rpc3RhbmNlID0gSW5maW5pdHk7XG4gICAgICAgICAgICBmb3IobGV0IGogPSAwOyBqIDwgY2VudHJvaWRzLmxlbmd0aDsgaisrKXtcbiAgICAgICAgICAgICAgICBsZXQgY2VudGVyID0gY2VudHJvaWRzW2pdO1xuICAgICAgICAgICAgICAgIGxldCBkaXN0YW5jZSA9IHRoaXMuZGlzdChjZW50ZXIsIGRwKTtcbiAgICAgICAgICAgICAgICBpZihkaXN0YW5jZSA8IGNsb3Nlc3RfZGlzdGFuY2Upe1xuICAgICAgICAgICAgICAgICAgICBjbG9zZXN0ID0gajtcbiAgICAgICAgICAgICAgICAgICAgY2xvc2VzdF9kaXN0YW5jZSA9IGRpc3RhbmNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5ld19lcnJvcltjbG9zZXN0XSA9IE51bWJlcihuZXdfZXJyb3JbY2xvc2VzdF0pICsgTWF0aC5wb3coY2xvc2VzdF9kaXN0YW5jZSwgMik7XG5cbiAgICAgICAgICAgIGNsdXN0ZXJzW2Nsb3Nlc3RdLnB1c2goZHApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBbbmV3X2Vycm9yLCBjbHVzdGVyc107XG4gICAgfVxuXG4gICAgZGlzdChhLCBiKXtcbiAgICAgICAgbGV0IHJvb3QgPSAwO1xuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgYS5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICByb290ICs9IE1hdGgucG93KChhW2ldIC0gYltpXSksIDIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQocm9vdCk7XG4gICAgfVxufVxuXG4iXX0=
//# sourceMappingURL=Test.js.map
