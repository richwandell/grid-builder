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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvS01lYW5zLmVzNiJdLCJuYW1lcyI6WyJLTWVhbnMiLCJjIiwiY2VudHJvaWRzIiwiZmluZENlbnRyb2lkcyIsIm5ld0NFIiwiZmluZENsdXN0ZXJzIiwicmVkdWNlIiwiYSIsImIiLCJjb25jYXQiLCJuZXdfZXJyb3IiLCJjbHVzdGVycyIsInNhbWUiLCJpIiwibGVuZ3RoIiwib2xkX2Vycm9yIiwia21lYW5zIiwiayIsImtubiIsInB1c2giLCJ4IiwieSIsImRpc3RhbmNlIiwiTWF0aCIsImZsb29yIiwibWFwIiwiSW5maW5pdHkiLCJjYyIsImZvckVhY2giLCJzb3J0Iiwicm91bmQiLCJjbHUiLCJqIiwiY2VudGVyIiwiZGF0YXNldCIsImRwIiwiY2xvc2VzdCIsImNsb3Nlc3RfZGlzdGFuY2UiLCJkaXN0IiwiTnVtYmVyIiwicG93Iiwicm9vdCIsInNxcnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7SUFBTUEsTTs7OytCQUVLQyxDLEVBQUU7QUFDTCxnQkFBSUMsWUFBWSxLQUFLQyxhQUFMLENBQW1CRixDQUFuQixDQUFoQjtBQUNBLGdCQUFJRyxRQUFRLEtBQUtDLFlBQUwsQ0FDUkgsU0FEUSxFQUVSRCxFQUFFSyxNQUFGLENBQVMsVUFBQ0MsQ0FBRCxFQUFJQyxDQUFKLEVBQVU7QUFBRSx1QkFBT0QsRUFBRUUsTUFBRixDQUFTRCxDQUFULENBQVA7QUFBcUIsYUFBMUMsQ0FGUSxDQUFaOztBQUtBLGdCQUFJRSxZQUFZTixNQUFNLENBQU4sQ0FBaEI7QUFDQSxnQkFBSU8sV0FBV1AsTUFBTSxDQUFOLENBQWY7O0FBRUEsZ0JBQUlRLE9BQU8sSUFBWDtBQUNBLGlCQUFJLElBQUlDLElBQUksQ0FBWixFQUFlQSxJQUFJSCxVQUFVSSxNQUE3QixFQUFxQ0QsR0FBckMsRUFBeUM7QUFDckMsb0JBQUdILFVBQVVHLENBQVYsTUFBaUIsS0FBS0UsU0FBTCxDQUFlRixDQUFmLENBQXBCLEVBQXNDO0FBQ2xDRCwyQkFBTyxLQUFQ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ZWFucy5qcyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEtNZWFucyB7XG5cbiAgICBrbWVhbnMoYyl7XG4gICAgICAgIGxldCBjZW50cm9pZHMgPSB0aGlzLmZpbmRDZW50cm9pZHMoYyk7XG4gICAgICAgIGxldCBuZXdDRSA9IHRoaXMuZmluZENsdXN0ZXJzKFxuICAgICAgICAgICAgY2VudHJvaWRzLFxuICAgICAgICAgICAgYy5yZWR1Y2UoKGEsIGIpID0+IHsgcmV0dXJuIGEuY29uY2F0KGIpOyB9KVxuICAgICAgICApO1xuXG4gICAgICAgIGxldCBuZXdfZXJyb3IgPSBuZXdDRVswXTtcbiAgICAgICAgbGV0IGNsdXN0ZXJzID0gbmV3Q0VbMV07XG5cbiAgICAgICAgbGV0IHNhbWUgPSB0cnVlO1xuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgbmV3X2Vycm9yLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGlmKG5ld19lcnJvcltpXSAhPT0gdGhpcy5vbGRfZXJyb3JbaV0pe1xuICAgICAgICAgICAgICAgIHNhbWUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLm9sZF9lcnJvciA9IG5ld19lcnJvcjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZihzYW1lKXtcbiAgICAgICAgICAgIHJldHVybiBbY2x1c3RlcnMsIGNlbnRyb2lkc107XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMua21lYW5zKGNsdXN0ZXJzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKGssIGtubil7XG4gICAgICAgIGxldCBjbHVzdGVycyA9IFtdO1xuXG4gICAgICAgIGxldCBjID0gW107XG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBrbm4ubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgYy5wdXNoKFtrbm5baV0ueCwga25uW2ldLnksIGtubltpXS5kaXN0YW5jZV0pO1xuICAgICAgICAgICAgaWYoaSA+IDAgJiYgaSAlIE1hdGguZmxvb3Ioa25uLmxlbmd0aCAvIGspID09IDApe1xuICAgICAgICAgICAgICAgIGNsdXN0ZXJzLnB1c2goYyk7XG4gICAgICAgICAgICAgICAgYyA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmKGMubGVuZ3RoID4gMCkgY2x1c3RlcnMucHVzaChjKTtcblxuICAgICAgICB0aGlzLm9sZF9lcnJvciA9IGNsdXN0ZXJzLm1hcCgoKSA9PiB7cmV0dXJuIEluZmluaXR5O30pO1xuXG4gICAgICAgIGxldCBjYyA9IHRoaXMua21lYW5zKGNsdXN0ZXJzKTtcbiAgICAgICAgY2NbMF0uZm9yRWFjaCgoYykgPT4ge1xuICAgICAgICAgICAgYy5zb3J0KChhLCBiKSA9PiB7IHJldHVybiBhWzJdID4gYlsyXTsgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBjY1sxXSA9IGNjWzFdLm1hcCgoYykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIFtNYXRoLnJvdW5kKGNbMF0pLCBNYXRoLnJvdW5kKGNbMV0pXTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBjYztcbiAgICB9XG5cblxuICAgIGZpbmRDZW50cm9pZHMoY2x1c3RlcnMpe1xuXG4gICAgICAgIGxldCBjZW50cm9pZHMgPSBbXTtcblxuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgY2x1c3RlcnMubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgbGV0IGNsdSA9IGNsdXN0ZXJzW2ldO1xuICAgICAgICAgICAgbGV0IHggPSAwO1xuICAgICAgICAgICAgbGV0IHkgPSAwO1xuICAgICAgICAgICAgZm9yKGxldCBqID0gMDsgaiA8IGNsdS5sZW5ndGg7IGorKyl7XG4gICAgICAgICAgICAgICAgeCArPSBjbHVbal1bMF07XG4gICAgICAgICAgICAgICAgeSArPSBjbHVbal1bMV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgY2VudGVyID0gW3ggLyBjbHUubGVuZ3RoLCB5IC8gY2x1Lmxlbmd0aF07XG4gICAgICAgICAgICBjZW50cm9pZHMucHVzaChjZW50ZXIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjZW50cm9pZHM7XG4gICAgfVxuXG4gICAgZmluZENsdXN0ZXJzKGNlbnRyb2lkcywgZGF0YXNldCl7XG5cbiAgICAgICAgbGV0IGNsdXN0ZXJzID0gY2VudHJvaWRzLm1hcCgoYykgPT4geyByZXR1cm4gW107IH0pO1xuICAgICAgICBsZXQgbmV3X2Vycm9yID0gY2VudHJvaWRzLm1hcCgoKSA9PiB7cmV0dXJuIDA7fSk7XG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBkYXRhc2V0Lmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGxldCBkcCA9IGRhdGFzZXRbaV07XG4gICAgICAgICAgICBsZXQgY2xvc2VzdCA9IGZhbHNlO1xuICAgICAgICAgICAgbGV0IGNsb3Nlc3RfZGlzdGFuY2UgPSBJbmZpbml0eTtcbiAgICAgICAgICAgIGZvcihsZXQgaiA9IDA7IGogPCBjZW50cm9pZHMubGVuZ3RoOyBqKyspe1xuICAgICAgICAgICAgICAgIGxldCBjZW50ZXIgPSBjZW50cm9pZHNbal07XG4gICAgICAgICAgICAgICAgbGV0IGRpc3RhbmNlID0gdGhpcy5kaXN0KGNlbnRlciwgZHApO1xuICAgICAgICAgICAgICAgIGlmKGRpc3RhbmNlIDwgY2xvc2VzdF9kaXN0YW5jZSl7XG4gICAgICAgICAgICAgICAgICAgIGNsb3Nlc3QgPSBqO1xuICAgICAgICAgICAgICAgICAgICBjbG9zZXN0X2Rpc3RhbmNlID0gZGlzdGFuY2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbmV3X2Vycm9yW2Nsb3Nlc3RdID0gTnVtYmVyKG5ld19lcnJvcltjbG9zZXN0XSkgKyBNYXRoLnBvdyhjbG9zZXN0X2Rpc3RhbmNlLCAyKTtcblxuICAgICAgICAgICAgY2x1c3RlcnNbY2xvc2VzdF0ucHVzaChkcCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFtuZXdfZXJyb3IsIGNsdXN0ZXJzXTtcbiAgICB9XG5cbiAgICBkaXN0KGEsIGIpe1xuICAgICAgICBsZXQgcm9vdCA9IDA7XG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCAyOyBpKyspe1xuICAgICAgICAgICAgcm9vdCArPSBNYXRoLnBvdygoYVtpXSAtIGJbaV0pLCAyKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KHJvb3QpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgS01lYW5zOyJdfQ==
//# sourceMappingURL=KMeans.js.map
