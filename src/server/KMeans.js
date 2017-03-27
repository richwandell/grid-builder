"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var KMeans = function () {
    _createClass(KMeans, [{
        key: "kmeans",
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
                return [clusters, centroids];
            } else {
                return this.kmeans(clusters);
            }
        }
    }]);

    function KMeans(k, knn) {
        _classCallCheck(this, KMeans);

        var clusters = [];

        var c = [];
        for (var i = 0; i < knn.length; i++) {
            c.push([knn[i].x, knn[i].y, knn[i].distance]);
            if (i > 0 && i % Math.floor(knn.length / k) == 0) {
                clusters.push(c);
                c = [];
            }
        }
        if (c.length > 0) clusters.push(c);

        this.old_error = clusters.map(function () {
            return Infinity;
        });

        var cc = this.kmeans(clusters);
        cc[0].forEach(function (c) {
            c.sort(function (a, b) {
                return a[2] > b[2];
            });
        });
        cc[1] = cc[1].map(function (c) {
            return [Math.round(c[0]), Math.round(c[1])];
        });
        return cc;
    }

    _createClass(KMeans, [{
        key: "findCentroids",
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
        key: "findClusters",
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
        key: "dist",
        value: function dist(a, b) {
            var root = 0;
            for (var i = 0; i < 2; i++) {
                root += Math.pow(a[i] - b[i], 2);
            }
            return Math.sqrt(root);
        }
    }]);

    return KMeans;
}();

exports.default = KMeans;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIktNZWFucy5lczYiXSwibmFtZXMiOlsiS01lYW5zIiwiYyIsImNlbnRyb2lkcyIsImZpbmRDZW50cm9pZHMiLCJuZXdDRSIsImZpbmRDbHVzdGVycyIsInJlZHVjZSIsImEiLCJiIiwiY29uY2F0IiwibmV3X2Vycm9yIiwiY2x1c3RlcnMiLCJzYW1lIiwiaSIsImxlbmd0aCIsIm9sZF9lcnJvciIsImttZWFucyIsImsiLCJrbm4iLCJwdXNoIiwieCIsInkiLCJkaXN0YW5jZSIsIk1hdGgiLCJmbG9vciIsIm1hcCIsIkluZmluaXR5IiwiY2MiLCJmb3JFYWNoIiwic29ydCIsInJvdW5kIiwiY2x1IiwiaiIsImNlbnRlciIsImRhdGFzZXQiLCJkcCIsImNsb3Nlc3QiLCJjbG9zZXN0X2Rpc3RhbmNlIiwiZGlzdCIsIk51bWJlciIsInBvdyIsInJvb3QiLCJzcXJ0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0lBQU1BLE07OzsrQkFFS0MsQyxFQUFFO0FBQ0wsZ0JBQUlDLFlBQVksS0FBS0MsYUFBTCxDQUFtQkYsQ0FBbkIsQ0FBaEI7QUFDQSxnQkFBSUcsUUFBUSxLQUFLQyxZQUFMLENBQ1JILFNBRFEsRUFFUkQsRUFBRUssTUFBRixDQUFTLFVBQUNDLENBQUQsRUFBSUMsQ0FBSixFQUFVO0FBQUUsdUJBQU9ELEVBQUVFLE1BQUYsQ0FBU0QsQ0FBVCxDQUFQO0FBQXFCLGFBQTFDLENBRlEsQ0FBWjs7QUFLQSxnQkFBSUUsWUFBWU4sTUFBTSxDQUFOLENBQWhCO0FBQ0EsZ0JBQUlPLFdBQVdQLE1BQU0sQ0FBTixDQUFmOztBQUVBLGdCQUFJUSxPQUFPLElBQVg7QUFDQSxpQkFBSSxJQUFJQyxJQUFJLENBQVosRUFBZUEsSUFBSUgsVUFBVUksTUFBN0IsRUFBcUNELEdBQXJDLEVBQXlDO0FBQ3JDLG9CQUFHSCxVQUFVRyxDQUFWLE1BQWlCLEtBQUtFLFNBQUwsQ0FBZUYsQ0FBZixDQUFwQixFQUFzQztBQUNsQ0QsMkJBQU8sS0FBUDtBQUNBLHlCQUFLRyxTQUFM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Q29udGVudCI6WyJjbGFzcyBLTWVhbnMge1xuXG4gICAga21lYW5zKGMpe1xuICAgICAgICBsZXQgY2VudHJvaWRzID0gdGhpcy5maW5kQ2VudHJvaWRzKGMpO1xuICAgICAgICBsZXQgbmV3Q0UgPSB0aGlzLmZpbmRDbHVzdGVycyhcbiAgICAgICAgICAgIGNlbnRyb2lkcyxcbiAgICAgICAgICAgIGMucmVkdWNlKChhLCBiKSA9PiB7IHJldHVybiBhLmNvbmNhdChiKTsgfSlcbiAgICAgICAgKTtcblxuICAgICAgICBsZXQgbmV3X2Vycm9yID0gbmV3Q0VbMF07XG4gICAgICAgIGxldCBjbHVzdGVycyA9IG5ld0NFWzFdO1xuXG4gICAgICAgIGxldCBzYW1lID0gdHJ1ZTtcbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IG5ld19lcnJvci5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICBpZihuZXdfZXJyb3JbaV0gIT09IHRoaXMub2xkX2Vycm9yW2ldKXtcbiAgICAgICAgICAgICAgICBzYW1lID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5vbGRfZXJyb3IgPSBuZXdfZXJyb3I7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYoc2FtZSl7XG4gICAgICAgICAgICByZXR1cm4gW2NsdXN0ZXJzLCBjZW50cm9pZHNdO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmttZWFucyhjbHVzdGVycyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvcihrLCBrbm4pe1xuICAgICAgICBsZXQgY2x1c3RlcnMgPSBbXTtcblxuICAgICAgICBsZXQgYyA9IFtdO1xuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwga25uLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGMucHVzaChba25uW2ldLngsIGtubltpXS55LCBrbm5baV0uZGlzdGFuY2VdKTtcbiAgICAgICAgICAgIGlmKGkgPiAwICYmIGkgJSBNYXRoLmZsb29yKGtubi5sZW5ndGggLyBrKSA9PSAwKXtcbiAgICAgICAgICAgICAgICBjbHVzdGVycy5wdXNoKGMpO1xuICAgICAgICAgICAgICAgIGMgPSBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZihjLmxlbmd0aCA+IDApIGNsdXN0ZXJzLnB1c2goYyk7XG5cbiAgICAgICAgdGhpcy5vbGRfZXJyb3IgPSBjbHVzdGVycy5tYXAoKCkgPT4ge3JldHVybiBJbmZpbml0eTt9KTtcblxuICAgICAgICBsZXQgY2MgPSB0aGlzLmttZWFucyhjbHVzdGVycyk7XG4gICAgICAgIGNjWzBdLmZvckVhY2goKGMpID0+IHtcbiAgICAgICAgICAgIGMuc29ydCgoYSwgYikgPT4geyByZXR1cm4gYVsyXSA+IGJbMl07IH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgY2NbMV0gPSBjY1sxXS5tYXAoKGMpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBbTWF0aC5yb3VuZChjWzBdKSwgTWF0aC5yb3VuZChjWzFdKV07XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gY2M7XG4gICAgfVxuXG5cbiAgICBmaW5kQ2VudHJvaWRzKGNsdXN0ZXJzKXtcblxuICAgICAgICBsZXQgY2VudHJvaWRzID0gW107XG5cbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IGNsdXN0ZXJzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGxldCBjbHUgPSBjbHVzdGVyc1tpXTtcbiAgICAgICAgICAgIGxldCB4ID0gMDtcbiAgICAgICAgICAgIGxldCB5ID0gMDtcbiAgICAgICAgICAgIGZvcihsZXQgaiA9IDA7IGogPCBjbHUubGVuZ3RoOyBqKyspe1xuICAgICAgICAgICAgICAgIHggKz0gY2x1W2pdWzBdO1xuICAgICAgICAgICAgICAgIHkgKz0gY2x1W2pdWzFdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IGNlbnRlciA9IFt4IC8gY2x1Lmxlbmd0aCwgeSAvIGNsdS5sZW5ndGhdO1xuICAgICAgICAgICAgY2VudHJvaWRzLnB1c2goY2VudGVyKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2VudHJvaWRzO1xuICAgIH1cblxuICAgIGZpbmRDbHVzdGVycyhjZW50cm9pZHMsIGRhdGFzZXQpe1xuXG4gICAgICAgIGxldCBjbHVzdGVycyA9IGNlbnRyb2lkcy5tYXAoKGMpID0+IHsgcmV0dXJuIFtdOyB9KTtcbiAgICAgICAgbGV0IG5ld19lcnJvciA9IGNlbnRyb2lkcy5tYXAoKCkgPT4ge3JldHVybiAwO30pO1xuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgZGF0YXNldC5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICBsZXQgZHAgPSBkYXRhc2V0W2ldO1xuICAgICAgICAgICAgbGV0IGNsb3Nlc3QgPSBmYWxzZTtcbiAgICAgICAgICAgIGxldCBjbG9zZXN0X2Rpc3RhbmNlID0gSW5maW5pdHk7XG4gICAgICAgICAgICBmb3IobGV0IGogPSAwOyBqIDwgY2VudHJvaWRzLmxlbmd0aDsgaisrKXtcbiAgICAgICAgICAgICAgICBsZXQgY2VudGVyID0gY2VudHJvaWRzW2pdO1xuICAgICAgICAgICAgICAgIGxldCBkaXN0YW5jZSA9IHRoaXMuZGlzdChjZW50ZXIsIGRwKTtcbiAgICAgICAgICAgICAgICBpZihkaXN0YW5jZSA8IGNsb3Nlc3RfZGlzdGFuY2Upe1xuICAgICAgICAgICAgICAgICAgICBjbG9zZXN0ID0gajtcbiAgICAgICAgICAgICAgICAgICAgY2xvc2VzdF9kaXN0YW5jZSA9IGRpc3RhbmNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5ld19lcnJvcltjbG9zZXN0XSA9IE51bWJlcihuZXdfZXJyb3JbY2xvc2VzdF0pICsgTWF0aC5wb3coY2xvc2VzdF9kaXN0YW5jZSwgMik7XG5cbiAgICAgICAgICAgIGNsdXN0ZXJzW2Nsb3Nlc3RdLnB1c2goZHApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBbbmV3X2Vycm9yLCBjbHVzdGVyc107XG4gICAgfVxuXG4gICAgZGlzdChhLCBiKXtcbiAgICAgICAgbGV0IHJvb3QgPSAwO1xuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgMjsgaSsrKXtcbiAgICAgICAgICAgIHJvb3QgKz0gTWF0aC5wb3coKGFbaV0gLSBiW2ldKSwgMik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE1hdGguc3FydChyb290KTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEtNZWFuczsiXX0=
//# sourceMappingURL=KMeans.js.map
