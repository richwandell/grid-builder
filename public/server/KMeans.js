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
        this.clusters = cc[0];
        this.centroids = cc[1];
    }

    _createClass(KMeans, [{
        key: "getClusters",
        value: function getClusters() {
            return this.clusters;
        }
    }, {
        key: "getCentroids",
        value: function getCentroids() {
            return this.centroids;
        }
    }, {
        key: "getCentroid",
        value: function getCentroid(clusterIndex) {
            return this.centroids[clusterIndex];
        }
    }, {
        key: "getLargestClusterIndex",
        value: function getLargestClusterIndex() {
            var largestLength = 0;
            var largestCluster = 0;
            this.clusters.forEach(function (clu, i) {
                if (clu.length > largestLength) {
                    largestLength = clu.length;
                    largestCluster = i;
                }
            });
            return largestCluster;
        }
    }, {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvS01lYW5zLmVzNiJdLCJuYW1lcyI6WyJLTWVhbnMiLCJjIiwiY2VudHJvaWRzIiwiZmluZENlbnRyb2lkcyIsIm5ld0NFIiwiZmluZENsdXN0ZXJzIiwicmVkdWNlIiwiYSIsImIiLCJjb25jYXQiLCJuZXdfZXJyb3IiLCJjbHVzdGVycyIsInNhbWUiLCJpIiwibGVuZ3RoIiwib2xkX2Vycm9yIiwia21lYW5zIiwiayIsImtubiIsInB1c2giLCJ4IiwieSIsImRpc3RhbmNlIiwiTWF0aCIsImZsb29yIiwibWFwIiwiSW5maW5pdHkiLCJjYyIsImZvckVhY2giLCJzb3J0Iiwicm91bmQiLCJjbHVzdGVySW5kZXgiLCJsYXJnZXN0TGVuZ3RoIiwibGFyZ2VzdENsdXN0ZXIiLCJjbHUiLCJqIiwiY2VudGVyIiwiZGF0YXNldCIsImRwIiwiY2xvc2VzdCIsImNsb3Nlc3RfZGlzdGFuY2UiLCJkaXN0IiwiTnVtYmVyIiwicG93Iiwicm9vdCIsInNxcnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7SUFBTUEsTTs7OytCQUVLQyxDLEVBQUU7QUFDTCxnQkFBSUMsWUFBWSxLQUFLQyxhQUFMLENBQW1CRixDQUFuQixDQUFoQjtBQUNBLGdCQUFJRyxRQUFRLEtBQUtDLFlBQUwsQ0FDUkgsU0FEUSxFQUVSRCxFQUFFSyxNQUFGLENBQVMsVUFBQ0MsQ0FBRCxFQUFJQyxDQUFKLEVBQVU7QUFBRSx1QkFBT0QsRUFBRUUsTUFBRixDQUFTRCxDQUFULENBQVA7QUFBcUIsYUFBMUMsQ0FGUSxDQUFaOztBQUtBLGdCQUFJRSxZQUFZTixNQUFNLENBQU4sQ0FBaEI7QUFDQSxnQkFBSU8sV0FBV1AsTUFBTSxDQUFOLENBQWY7O0FBRUEsZ0JBQUlRLE9BQU8sSUFBWDtBQUNBLGlCQUFJLElBQUlDLElBQUksQ0FBWixFQUFlQSxJQUFJSCxVQUFVSSxNQUE3QixFQUFxQ0QsR0FBckMsRUFBeUM7QUFDckMsb0JBQUdILFVBQVVHLENBQVYsTUFBaUIsS0FB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LENBQVY7QUFDQUssMkNBQW1CbEIsUUFBbkI7QUFDSDtBQUNKO0FBQ0RaLDBCQUFVNkIsT0FBVixJQUFxQkcsT0FBT2hDLFVBQVU2QixPQUFWLENBQVAsSUFBNkJoQixLQUFLb0IsR0FBTCxDQUFTSCxnQkFBVCxFQUEyQixDQUEzQixDQUFsRDs7QUFFQTdCLHlCQUFTNEIsT0FBVCxFQUFrQnBCLElBQWxCLENBQXVCbUIsRUFBdkI7QUFDSDtBQUNELG1CQUFPLENBQUM1QixTQUFELEVBQVlDLFFBQVosQ0FBUDtBQUNIOzs7NkJBRUlKLEMsRUFBR0MsQyxFQUFFO0FBQ04sZ0JBQUlvQyxPQUFPLENBQVg7QUFDQSxpQkFBSSxJQUFJL0IsSUFBSSxDQUFaLEVBQWVBLElBQUksQ0FBbkIsRUFBc0JBLEdBQXRCLEVBQTBCO0FBQ3RCK0Isd0JBQVFyQixLQUFLb0IsR0FBTCxDQUFVcEMsRUFBRU0sQ0FBRixJQUFPTCxFQUFFSyxDQUFGLENBQWpCLEVBQXdCLENBQXhCLENBQVI7QUFDSDtBQUNELG1CQUFPVSxLQUFLc0IsSUFBTCxDQUFVRCxJQUFWLENBQVA7QUFDSDs7Ozs7O2tCQUdVNUMsTSIsImZpbGUiOiJLTWVhbnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBLTWVhbnMge1xuXG4gICAga21lYW5zKGMpe1xuICAgICAgICBsZXQgY2VudHJvaWRzID0gdGhpcy5maW5kQ2VudHJvaWRzKGMpO1xuICAgICAgICBsZXQgbmV3Q0UgPSB0aGlzLmZpbmRDbHVzdGVycyhcbiAgICAgICAgICAgIGNlbnRyb2lkcyxcbiAgICAgICAgICAgIGMucmVkdWNlKChhLCBiKSA9PiB7IHJldHVybiBhLmNvbmNhdChiKTsgfSlcbiAgICAgICAgKTtcblxuICAgICAgICBsZXQgbmV3X2Vycm9yID0gbmV3Q0VbMF07XG4gICAgICAgIGxldCBjbHVzdGVycyA9IG5ld0NFWzFdO1xuXG4gICAgICAgIGxldCBzYW1lID0gdHJ1ZTtcbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IG5ld19lcnJvci5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICBpZihuZXdfZXJyb3JbaV0gIT09IHRoaXMub2xkX2Vycm9yW2ldKXtcbiAgICAgICAgICAgICAgICBzYW1lID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5vbGRfZXJyb3IgPSBuZXdfZXJyb3I7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYoc2FtZSl7XG4gICAgICAgICAgICByZXR1cm4gW2NsdXN0ZXJzLCBjZW50cm9pZHNdO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmttZWFucyhjbHVzdGVycyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvcihrLCBrbm4pe1xuICAgICAgICBsZXQgY2x1c3RlcnMgPSBbXTtcblxuICAgICAgICBsZXQgYyA9IFtdO1xuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwga25uLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGMucHVzaChba25uW2ldLngsIGtubltpXS55LCBrbm5baV0uZGlzdGFuY2VdKTtcbiAgICAgICAgICAgIGlmKGkgPiAwICYmIGkgJSBNYXRoLmZsb29yKGtubi5sZW5ndGggLyBrKSA9PSAwKXtcbiAgICAgICAgICAgICAgICBjbHVzdGVycy5wdXNoKGMpO1xuICAgICAgICAgICAgICAgIGMgPSBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZihjLmxlbmd0aCA+IDApIGNsdXN0ZXJzLnB1c2goYyk7XG5cbiAgICAgICAgdGhpcy5vbGRfZXJyb3IgPSBjbHVzdGVycy5tYXAoKCkgPT4ge3JldHVybiBJbmZpbml0eTt9KTtcblxuICAgICAgICBsZXQgY2MgPSB0aGlzLmttZWFucyhjbHVzdGVycyk7XG4gICAgICAgIGNjWzBdXG4gICAgICAgICAgICAuZm9yRWFjaCgoYykgPT4ge1xuICAgICAgICAgICAgICAgIGMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYVsyXSA+IGJbMl07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBjY1sxXSA9IGNjWzFdLm1hcCgoYykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIFtNYXRoLnJvdW5kKGNbMF0pLCBNYXRoLnJvdW5kKGNbMV0pXTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuY2x1c3RlcnMgPSBjY1swXTtcbiAgICAgICAgdGhpcy5jZW50cm9pZHMgPSBjY1sxXTtcbiAgICB9XG5cbiAgICBnZXRDbHVzdGVycygpe1xuICAgICAgICByZXR1cm4gdGhpcy5jbHVzdGVycztcbiAgICB9XG5cbiAgICBnZXRDZW50cm9pZHMoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2VudHJvaWRzO1xuICAgIH1cblxuICAgIGdldENlbnRyb2lkKGNsdXN0ZXJJbmRleDogbnVtYmVyKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2VudHJvaWRzW2NsdXN0ZXJJbmRleF07XG4gICAgfVxuXG4gICAgZ2V0TGFyZ2VzdENsdXN0ZXJJbmRleCgpe1xuICAgICAgICBsZXQgbGFyZ2VzdExlbmd0aCA9IDA7XG4gICAgICAgIGxldCBsYXJnZXN0Q2x1c3RlciA9IDA7XG4gICAgICAgIHRoaXMuY2x1c3RlcnMuZm9yRWFjaCgoY2x1LCBpKSA9PiB7XG4gICAgICAgICAgICBpZihjbHUubGVuZ3RoID4gbGFyZ2VzdExlbmd0aCl7XG4gICAgICAgICAgICAgICAgbGFyZ2VzdExlbmd0aCA9IGNsdS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgbGFyZ2VzdENsdXN0ZXIgPSBpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGxhcmdlc3RDbHVzdGVyO1xuICAgIH1cblxuXG4gICAgZmluZENlbnRyb2lkcyhjbHVzdGVycyl7XG5cbiAgICAgICAgbGV0IGNlbnRyb2lkcyA9IFtdO1xuXG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBjbHVzdGVycy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICBsZXQgY2x1ID0gY2x1c3RlcnNbaV07XG4gICAgICAgICAgICBsZXQgeCA9IDA7XG4gICAgICAgICAgICBsZXQgeSA9IDA7XG4gICAgICAgICAgICBmb3IobGV0IGogPSAwOyBqIDwgY2x1Lmxlbmd0aDsgaisrKXtcbiAgICAgICAgICAgICAgICB4ICs9IGNsdVtqXVswXTtcbiAgICAgICAgICAgICAgICB5ICs9IGNsdVtqXVsxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBjZW50ZXIgPSBbeCAvIGNsdS5sZW5ndGgsIHkgLyBjbHUubGVuZ3RoXTtcbiAgICAgICAgICAgIGNlbnRyb2lkcy5wdXNoKGNlbnRlcik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNlbnRyb2lkcztcbiAgICB9XG5cbiAgICBmaW5kQ2x1c3RlcnMoY2VudHJvaWRzLCBkYXRhc2V0KXtcblxuICAgICAgICBsZXQgY2x1c3RlcnMgPSBjZW50cm9pZHMubWFwKChjKSA9PiB7IHJldHVybiBbXTsgfSk7XG4gICAgICAgIGxldCBuZXdfZXJyb3IgPSBjZW50cm9pZHMubWFwKCgpID0+IHtyZXR1cm4gMDt9KTtcbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IGRhdGFzZXQubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgbGV0IGRwID0gZGF0YXNldFtpXTtcbiAgICAgICAgICAgIGxldCBjbG9zZXN0ID0gZmFsc2U7XG4gICAgICAgICAgICBsZXQgY2xvc2VzdF9kaXN0YW5jZSA9IEluZmluaXR5O1xuICAgICAgICAgICAgZm9yKGxldCBqID0gMDsgaiA8IGNlbnRyb2lkcy5sZW5ndGg7IGorKyl7XG4gICAgICAgICAgICAgICAgbGV0IGNlbnRlciA9IGNlbnRyb2lkc1tqXTtcbiAgICAgICAgICAgICAgICBsZXQgZGlzdGFuY2UgPSB0aGlzLmRpc3QoY2VudGVyLCBkcCk7XG4gICAgICAgICAgICAgICAgaWYoZGlzdGFuY2UgPCBjbG9zZXN0X2Rpc3RhbmNlKXtcbiAgICAgICAgICAgICAgICAgICAgY2xvc2VzdCA9IGo7XG4gICAgICAgICAgICAgICAgICAgIGNsb3Nlc3RfZGlzdGFuY2UgPSBkaXN0YW5jZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBuZXdfZXJyb3JbY2xvc2VzdF0gPSBOdW1iZXIobmV3X2Vycm9yW2Nsb3Nlc3RdKSArIE1hdGgucG93KGNsb3Nlc3RfZGlzdGFuY2UsIDIpO1xuXG4gICAgICAgICAgICBjbHVzdGVyc1tjbG9zZXN0XS5wdXNoKGRwKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW25ld19lcnJvciwgY2x1c3RlcnNdO1xuICAgIH1cblxuICAgIGRpc3QoYSwgYil7XG4gICAgICAgIGxldCByb290ID0gMDtcbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IDI7IGkrKyl7XG4gICAgICAgICAgICByb290ICs9IE1hdGgucG93KChhW2ldIC0gYltpXSksIDIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQocm9vdCk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBLTWVhbnM7Il19
//# sourceMappingURL=KMeans.js.map
