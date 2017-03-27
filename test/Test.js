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

new Test1();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlRlc3QuZXM2Il0sIm5hbWVzIjpbImZzIiwicmVxdWlyZSIsIlRlc3QiLCJkYXRhYmFzZSIsImRlYnVnIiwiZGIiLCJnZXREYXRhYmFzZSIsInJvd3MiLCJyZWFkRmlsZVN5bmMiLCJzcGxpdCIsImZlYXR1cmVzIiwiZnBfaWQiLCJmb3JFYWNoIiwicm93Iiwicm93MSIsIk1hdGgiLCJhYnMiLCJOdW1iZXIiLCJzdGFydCIsIkRhdGUiLCJnZXRUaW1lIiwiZGF0YSIsImtleXMiLCJPYmplY3QiLCJkb25lIiwia2V5IiwiYWxsIiwicXVlcnlfZ2V0X2ZlYXR1cmVzIiwicmVwbGFjZSIsImVyciIsInB1c2giLCJsZW5ndGgiLCJjbG9zZSIsIm1ha2VHdWVzcyIsImRpc3RhbmNlcyIsImtubiIsImZlYXR1cmUiLCJjb29yZCIsIngiLCJ5IiwicG93IiwiZGlmZiIsInhfeSIsImRpc3RhbmNlIiwic3FydCIsInJlZHVjZSIsImEiLCJiIiwic29ydCIsImNvbnNvbGUiLCJsb2ciLCJlbmQiLCJUZXN0MSIsImMiLCJjZW50cm9pZHMiLCJmaW5kQ2VudHJvaWRzIiwibmV3Q0UiLCJmaW5kQ2x1c3RlcnMiLCJjb25jYXQiLCJuZXdfZXJyb3IiLCJjbHVzdGVycyIsInNhbWUiLCJpIiwib2xkX2Vycm9yIiwia21lYW5zIiwic3VjY2VzcyIsIkpTT04iLCJwYXJzZSIsInNsaWNlIiwibWFwIiwibiIsIkluZmluaXR5IiwiY2x1IiwiaiIsImNlbnRlciIsImRhdGFzZXQiLCJkcCIsImNsb3Nlc3QiLCJjbG9zZXN0X2Rpc3RhbmNlIiwiZGlzdCIsInJvb3QiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTs7Ozs7Ozs7QUFDQSxJQUFNQSxLQUFLQyxRQUFRLElBQVIsQ0FBWDs7SUFFTUMsSTtBQUNGLG9CQUFhO0FBQUE7O0FBQUE7O0FBQ1QsWUFBSUMsV0FBVyxpQkFBTztBQUNsQkMsbUJBQU8saUJBQU0sQ0FBRTtBQURHLFNBQVAsQ0FBZjs7QUFJQSxZQUFJQyxLQUFLRixTQUFT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TyxDQUFDakIsU0FBRCxFQUFZQyxRQUFaLENBQVA7QUFDSDs7OzZCQUVJZCxDLEVBQUdDLEMsRUFBRTtBQUNOLGdCQUFJaUMsT0FBTyxDQUFYO0FBQ0EsaUJBQUksSUFBSWxCLElBQUksQ0FBWixFQUFlQSxJQUFJaEIsRUFBRWYsTUFBckIsRUFBNkIrQixHQUE3QixFQUFpQztBQUM3QmtCLHdCQUFRakUsS0FBS3lCLEdBQUwsQ0FBVU0sRUFBRWdCLENBQUYsSUFBT2YsRUFBRWUsQ0FBRixDQUFqQixFQUF3QixDQUF4QixDQUFSO0FBQ0g7QUFDRCxtQkFBTy9DLEtBQUs2QixJQUFMLENBQVVvQyxJQUFWLENBQVA7QUFDSDs7Ozs7O0FBR0wsSUFBSTVCLEtBQUoiLCJmaWxlIjoiVGVzdC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBEYiBmcm9tICcuLi9zcmMvc2VydmVyL0RiJztcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcblxuY2xhc3MgVGVzdCB7XG4gICAgY29uc3RydWN0b3IoKXtcbiAgICAgICAgbGV0IGRhdGFiYXNlID0gbmV3IERiKHtcbiAgICAgICAgICAgIGRlYnVnOiAoKSA9PiB7fVxuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgZGIgPSBkYXRhYmFzZS5nZXREYXRhYmFzZSgpO1xuXG4gICAgICAgIGxldCByb3dzID0gZnMucmVhZEZpbGVTeW5jKFwiLi8xLTI4LmNzdlwiLCBcInV0ZjhcIikuc3BsaXQoXCJcXG5cIik7XG5cbiAgICAgICAgbGV0IGZlYXR1cmVzID0ge307XG5cbiAgICAgICAgbGV0IGZwX2lkID0gMDtcblxuICAgICAgICByb3dzLmZvckVhY2goKHJvdykgPT4ge1xuICAgICAgICAgICAgcm93ID0gcm93LnNwbGl0KFwiLFwiKTtcbiAgICAgICAgICAgIGlmKHR5cGVvZihyb3dbMV0pID09IFwidW5kZWZpbmVkXCIpIHJldHVybjtcblxuICAgICAgICAgICAgcm93cy5mb3JFYWNoKChyb3cxKSA9PiB7XG4gICAgICAgICAgICAgICAgcm93MSA9IHJvdzEuc3BsaXQoXCIsXCIpO1xuICAgICAgICAgICAgICAgIGlmKHR5cGVvZihyb3cxWzFdKSA9PSBcInVuZGVmaW5lZFwiKSByZXR1cm47XG4gICAgICAgICAgICAgICAgZnBfaWQgPSByb3dbMF07XG4gICAgICAgICAgICAgICAgZmVhdHVyZXNbcm93WzFdICsgcm93MVsxXV0gPSBNYXRoLmFicyhOdW1iZXIocm93WzRdKSAtIE51bWJlcihyb3cxWzRdKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc3RhcnQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgbGV0IGRhdGEgPSBbXTtcbiAgICAgICAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyhmZWF0dXJlcyk7XG4gICAgICAgIGxldCBkb25lID0gMDtcblxuICAgICAgICBrZXlzLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICAgICAgZGIuYWxsKERiLnF1ZXJ5X2dldF9mZWF0dXJlcy5yZXBsYWNlKFwiOmZlYXR1cmVfdmFsdWU6XCIsIGZlYXR1cmVzW2tleV0pLCBba2V5LCBmcF9pZF0sIChlcnIsIHJvd3MpID0+IHtcbiAgICAgICAgICAgICAgICBkYXRhLnB1c2gocm93cyk7XG4gICAgICAgICAgICAgICAgZG9uZSsrO1xuICAgICAgICAgICAgICAgIGlmKGRvbmUgPj0ga2V5cy5sZW5ndGgpe1xuICAgICAgICAgICAgICAgICAgICBkYi5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1ha2VHdWVzcyhkYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgbWFrZUd1ZXNzKGRhdGEpe1xuXG4gICAgICAgIGxldCBkaXN0YW5jZXMgPSB7fTtcbiAgICAgICAgbGV0IGtubiA9IFtdO1xuXG4gICAgICAgIGRhdGEuZm9yRWFjaCgoZmVhdHVyZSkgPT4ge1xuICAgICAgICAgICAgaWYoZmVhdHVyZS5sZW5ndGggPT0gMCkgcmV0dXJuO1xuXG4gICAgICAgICAgICBmZWF0dXJlLmZvckVhY2goKGNvb3JkKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYodHlwZW9mKGRpc3RhbmNlc1tjb29yZC54ICsgXCJfXCIgKyBjb29yZC55XSkgPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgICAgICAgICAgICAgIGRpc3RhbmNlc1tjb29yZC54ICsgXCJfXCIgKyBjb29yZC55XSA9IFtdO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGRpc3RhbmNlc1tjb29yZC54ICsgXCJfXCIgKyBjb29yZC55XS5wdXNoKE1hdGgucG93KGNvb3JkLmRpZmYsIDIpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyhkaXN0YW5jZXMpO1xuICAgICAgICBrZXlzLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICAgICAga25uLnB1c2goe1xuICAgICAgICAgICAgICAgIHhfeToga2V5LFxuICAgICAgICAgICAgICAgIGRpc3RhbmNlOiBNYXRoLnNxcnQoZGlzdGFuY2VzW2tleV0ucmVkdWNlKChhLCBiKSA9PiB7IHJldHVybiBhK2I7IH0pKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBrbm4uc29ydCgoYSwgYikgPT4geyByZXR1cm4gYS5kaXN0YW5jZSA+IGIuZGlzdGFuY2U7IH0pO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKGtubik7XG4gICAgICAgIHRoaXMuZW5kID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMuZW5kIC0gdGhpcy5zdGFydCk7XG4gICAgfVxuXG59XG5cbi8vbmV3IFRlc3QoKTtcblxuY2xhc3MgVGVzdDF7XG5cbiAgICBrbWVhbnMoYyl7XG4gICAgICAgIGxldCBjZW50cm9pZHMgPSB0aGlzLmZpbmRDZW50cm9pZHMoYyk7XG4gICAgICAgIGxldCBuZXdDRSA9IHRoaXMuZmluZENsdXN0ZXJzKFxuICAgICAgICAgICAgY2VudHJvaWRzLFxuICAgICAgICAgICAgYy5yZWR1Y2UoKGEsIGIpID0+IHsgcmV0dXJuIGEuY29uY2F0KGIpOyB9KVxuICAgICAgICApO1xuXG4gICAgICAgIGxldCBuZXdfZXJyb3IgPSBuZXdDRVswXTtcbiAgICAgICAgbGV0IGNsdXN0ZXJzID0gbmV3Q0VbMV07XG5cbiAgICAgICAgbGV0IHNhbWUgPSB0cnVlO1xuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgbmV3X2Vycm9yLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGlmKG5ld19lcnJvcltpXSAhPT0gdGhpcy5vbGRfZXJyb3JbaV0pe1xuICAgICAgICAgICAgICAgIHNhbWUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLm9sZF9lcnJvciA9IG5ld19lcnJvcjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZihzYW1lKXtcbiAgICAgICAgICAgIHJldHVybiBjbHVzdGVycztcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5rbWVhbnMoY2x1c3RlcnMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IoKXtcbiAgICAgICAgY29uc3Qgc3VjY2VzcyA9IEpTT04ucGFyc2UoJ3tcInN1Y2Nlc1wiOnRydWUsXCJrbm5cIjpbe1wieF95XCI6XCI4XzJcIixcInhcIjo4LFwieVwiOjIsXCJkaXN0YW5jZVwiOjI4NS4xNTI3ODEzOTAyMjkxN30se1wieF95XCI6XCIwXzIwXCIsXCJ4XCI6MCxcInlcIjoyMCxcImRpc3RhbmNlXCI6MjY3LjUxNDk5NDM4NTQwODY3fSx7XCJ4X3lcIjpcIjFfMjBcIixcInhcIjoxLFwieVwiOjIwLFwiZGlzdGFuY2VcIjoyMjQuNTkwMDc2NTc3MDA2NTN9LHtcInhfeVwiOlwiMl8xN1wiLFwieFwiOjIsXCJ5XCI6MTcsXCJkaXN0YW5jZVwiOjIwMS41MDk0MzI3MTU3MzUxNn0se1wieF95XCI6XCIwXzE3XCIsXCJ4XCI6MCxcInlcIjoxNyxcImRpc3RhbmNlXCI6MjAzLjYzMTI5NDA1Nzc3ODIzfV0sXCJjZW50ZXJcIjpbMywxNl19Jyk7XG5cbiAgICAgICAgbGV0IGNsdXN0ZXJzID0gW1xuICAgICAgICAgICAgc3VjY2Vzcy5rbm4uc2xpY2UoMCwgMilcbiAgICAgICAgICAgICAgICAubWFwKChuKSA9PiB7cmV0dXJuIFtuLngsIG4ueV07fSksXG4gICAgICAgICAgICBzdWNjZXNzLmtubi5zbGljZSgyLCA1KVxuICAgICAgICAgICAgICAgIC5tYXAoKG4pID0+IHtyZXR1cm4gW24ueCwgbi55XTt9KVxuICAgICAgICBdO1xuXG4gICAgICAgIHRoaXMub2xkX2Vycm9yID0gY2x1c3RlcnMubWFwKCgpID0+IHtyZXR1cm4gSW5maW5pdHk7fSk7XG5cbiAgICAgICAgY2x1c3RlcnMgPSB0aGlzLmttZWFucyhjbHVzdGVycyk7XG5cbiAgICAgICAgY29uc29sZS5sb2coY2x1c3RlcnMpO1xuICAgIH1cblxuXG4gICAgZmluZENlbnRyb2lkcyhjbHVzdGVycyl7XG5cbiAgICAgICAgbGV0IGNlbnRyb2lkcyA9IFtdO1xuXG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBjbHVzdGVycy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICBsZXQgY2x1ID0gY2x1c3RlcnNbaV07XG4gICAgICAgICAgICBsZXQgeCA9IDA7XG4gICAgICAgICAgICBsZXQgeSA9IDA7XG4gICAgICAgICAgICBmb3IobGV0IGogPSAwOyBqIDwgY2x1Lmxlbmd0aDsgaisrKXtcbiAgICAgICAgICAgICAgICB4ICs9IGNsdVtqXVswXTtcbiAgICAgICAgICAgICAgICB5ICs9IGNsdVtqXVsxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBjZW50ZXIgPSBbeCAvIGNsdS5sZW5ndGgsIHkgLyBjbHUubGVuZ3RoXTtcbiAgICAgICAgICAgIGNlbnRyb2lkcy5wdXNoKGNlbnRlcik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNlbnRyb2lkcztcbiAgICB9XG5cbiAgICBmaW5kQ2x1c3RlcnMoY2VudHJvaWRzLCBkYXRhc2V0KXtcblxuICAgICAgICBsZXQgY2x1c3RlcnMgPSBjZW50cm9pZHMubWFwKChjKSA9PiB7IHJldHVybiBbXTsgfSk7XG4gICAgICAgIGxldCBuZXdfZXJyb3IgPSBjZW50cm9pZHMubWFwKCgpID0+IHtyZXR1cm4gMDt9KTtcbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IGRhdGFzZXQubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgbGV0IGRwID0gZGF0YXNldFtpXTtcbiAgICAgICAgICAgIGxldCBjbG9zZXN0ID0gZmFsc2U7XG4gICAgICAgICAgICBsZXQgY2xvc2VzdF9kaXN0YW5jZSA9IEluZmluaXR5O1xuICAgICAgICAgICAgZm9yKGxldCBqID0gMDsgaiA8IGNlbnRyb2lkcy5sZW5ndGg7IGorKyl7XG4gICAgICAgICAgICAgICAgbGV0IGNlbnRlciA9IGNlbnRyb2lkc1tqXTtcbiAgICAgICAgICAgICAgICBsZXQgZGlzdGFuY2UgPSB0aGlzLmRpc3QoY2VudGVyLCBkcCk7XG4gICAgICAgICAgICAgICAgaWYoZGlzdGFuY2UgPCBjbG9zZXN0X2Rpc3RhbmNlKXtcbiAgICAgICAgICAgICAgICAgICAgY2xvc2VzdCA9IGo7XG4gICAgICAgICAgICAgICAgICAgIGNsb3Nlc3RfZGlzdGFuY2UgPSBkaXN0YW5jZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBuZXdfZXJyb3JbY2xvc2VzdF0gPSBOdW1iZXIobmV3X2Vycm9yW2Nsb3Nlc3RdKSArIE1hdGgucG93KGNsb3Nlc3RfZGlzdGFuY2UsIDIpO1xuXG4gICAgICAgICAgICBjbHVzdGVyc1tjbG9zZXN0XS5wdXNoKGRwKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW25ld19lcnJvciwgY2x1c3RlcnNdO1xuICAgIH1cblxuICAgIGRpc3QoYSwgYil7XG4gICAgICAgIGxldCByb290ID0gMDtcbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IGEubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgcm9vdCArPSBNYXRoLnBvdygoYVtpXSAtIGJbaV0pLCAyKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KHJvb3QpO1xuICAgIH1cbn1cblxubmV3IFRlc3QxKCk7Il19
//# sourceMappingURL=Test.js.map
