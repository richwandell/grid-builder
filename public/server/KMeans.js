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
            if (i > 0 && i % Math.floor(knn.length / k) === 0) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvS01lYW5zLmVzNiJdLCJuYW1lcyI6WyJLTWVhbnMiLCJjIiwiY2VudHJvaWRzIiwiZmluZENlbnRyb2lkcyIsIm5ld0NFIiwiZmluZENsdXN0ZXJzIiwicmVkdWNlIiwiYSIsImIiLCJjb25jYXQiLCJuZXdfZXJyb3IiLCJjbHVzdGVycyIsInNhbWUiLCJpIiwibGVuZ3RoIiwib2xkX2Vycm9yIiwia21lYW5zIiwiayIsImtubiIsInB1c2giLCJ4IiwieSIsImRpc3RhbmNlIiwiTWF0aCIsImZsb29yIiwibWFwIiwiSW5maW5pdHkiLCJjYyIsImZvckVhY2giLCJzb3J0Iiwicm91bmQiLCJjbHVzdGVySW5kZXgiLCJsYXJnZXN0TGVuZ3RoIiwibGFyZ2VzdENsdXN0ZXIiLCJjbHUiLCJqIiwiY2VudGVyIiwiZGF0YXNldCIsImRwIiwiY2xvc2VzdCIsImNsb3Nlc3RfZGlzdGFuY2UiLCJkaXN0IiwiTnVtYmVyIiwicG93Iiwicm9vdCIsInNxcnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7SUFBTUEsTTs7OytCQUVLQyxDLEVBQUU7QUFDTCxnQkFBSUMsWUFBWSxLQUFLQyxhQUFMLENBQW1CRixDQUFuQixDQUFoQjtBQUNBLGdCQUFJRyxRQUFRLEtBQUtDLFlBQUwsQ0FDUkgsU0FEUSxFQUVSRCxFQUFFSyxNQUFGLENBQVMsVUFBQ0MsQ0FBRCxFQUFJQyxDQUFKLEVBQVU7QUFBRSx1QkFBT0QsRUFBRUUsTUFBRixDQUFTRCxDQUFULENBQVA7QUFBcUIsYUFBMUMsQ0FGUSxDQUFaOztBQUtBLGdCQUFJRSxZQUFZTixNQUFNLENBQU4sQ0FBaEI7QUFDQSxnQkFBSU8sV0FBV1AsTUFBTSxDQUFOLENBQWY7O0FBRUEsZ0JBQUlRLE9BQU8sSUFBWDtBQUNBLGlCQUFJLElBQUlDLElBQUksQ0FBWixFQUFlQSxJQUFJSCxVQUFVSSxNQUE3QixFQUFxQ0QsR0FBckMsRUFBeUM7QUFDckMsb0JBQUdILFVBQVVHLENBQVYsTUFBaUIsS0FBS0UsU0FBTCxDQUFlRixDQUFmLENBQXBCLEVBQXNDO0FBQ2xDRCwyQkFBTyxLQUFQO0FBQ0EseUJBQUtHLFNBQUwsR0FBaUJMLFNBQWpCO0FBQ0E7QUFDSDtBQUNKO0FBQ0QsZ0JBQUdFLElBQUgsRUFBUTtBQUNKLHVCQUFPLENBQUNELFFBQUQsRUFBV1QsU0FBWCxDQUFQO0FBQ0gsYUFGRCxNQUVLO0FBQ0QsdUJBQU8sS0FBS2MsTUFBTCxDQUFZTCxRQUFaLENBQVA7QUFDSDtBQUNKOzs7QUFFRCxvQkFBWU0sQ0FBWixFQUFlQyxHQUFmLEVBQW1CO0FBQUE7O0FBQ2YsWUFBSVAsV0FBVyxFQUFmOztBQUVBLFlBQUlWLElBQUksRUFBUjtBQUNBLGFBQUksSUFBSVksSUFBSSxDQUFaLEVBQWVBLElBQUlLLElBQUlKLE1BQXZCLEVBQStCRCxHQUEvQixFQUFtQztBQUMvQlosY0FBRWtCLElBQUYsQ0FBTyxDQUFDRCxJQUFJTCxDQUFKLEVBQU9PLENBQVIsRUFBV0YsSUFBSUwsQ0FBSixFQUFPUSxDQUFsQixFQUFxQkgsSUFBSUwsQ0FBSixFQUFPUyxRQUE1QixDQUFQO0FBQ0EsZ0JBQUdULElBQUksQ0FBSixJQUFTQSxJQUFJVSxLQUFLQyxLQUFMLENBQVdOLElBQUlKLE1BQUosR0FBYUcsQ0FBeEIsQ0FBSixLQUFtQyxDQUEvQyxFQUFpRDtBQUM3Q04seUJBQVNRLElBQVQsQ0FBY2xCLENBQWQ7QUFDQUEsb0JBQUksRUFBSjtBQUNIO0FBQ0o7QUFDRCxZQUFHQSxFQUFFYSxNQUFGLEdBQVcsQ0FBZCxFQUFpQkgsU0FBU1EsSUFBVCxDQUFjbEIsQ0FBZDs7QUFFakIsYUFBS2MsU0FBTCxHQUFpQkosU0FBU2MsR0FBVCxDQUFhLFlBQU07QUFBQyxtQkFBT0MsUUFBUDtBQUFpQixTQUFyQyxDQUFqQjs7QUFFQSxZQUFJQyxLQUFLLEtBQUtYLE1BQUwsQ0FBWUwsUUFBWixDQUFUO0FBQ0FnQixXQUFHLENBQUgsRUFDS0MsT0FETCxDQUNhLFVBQUMzQixDQUFELEVBQU87QUFDWkEsY0FBRTRCLElBQUYsQ0FBTyxVQUFDdEIsQ0FBRCxFQUFJQyxDQUFKLEVBQVU7QUFDYix1QkFBT0QsRUFBRSxDQUFGLElBQU9DLEVBQUUsQ0FBRixDQUFkO0FBQ0gsYUFGRDtBQUdILFNBTEw7O0FBT0FtQixXQUFHLENBQUgsSUFBUUEsR0FBRyxDQUFILEVBQU1GLEdBQU4sQ0FBVSxVQUFDeEIsQ0FBRCxFQUFPO0FBQ3JCLG1CQUFPLENBQUNzQixLQUFLTyxLQUFMLENBQVc3QixFQUFFLENBQUYsQ0FBWCxDQUFELEVBQW1Cc0IsS0FBS08sS0FBTCxDQUFXN0IsRUFBRSxDQUFGLENBQVgsQ0FBbkIsQ0FBUDtBQUNILFNBRk8sQ0FBUjtBQUdBLGFBQUtVLFFBQUwsR0FBZ0JnQixHQUFHLENBQUgsQ0FBaEI7QUFDQSxhQUFLekIsU0FBTCxHQUFpQnlCLEdBQUcsQ0FBSCxDQUFqQjtBQUNIOzs7O3NDQUVZO0FBQ1QsbUJBQU8sS0FBS2hCLFFBQVo7QUFDSDs7O3VDQUVhO0FBQ1YsbUJBQU8sS0FBS1QsU0FBWjtBQUNIOzs7b0NBRVc2QixZLEVBQXFCO0FBQzdCLG1CQUFPLEtBQUs3QixTQUFMLENBQWU2QixZQUFmLENBQVA7QUFDSDs7O2lEQUV1QjtBQUNwQixnQkFBSUMsZ0JBQWdCLENBQXBCO0FBQ0EsZ0JBQUlDLGlCQUFpQixDQUFyQjtBQUNBLGlCQUFLdEIsUUFBTCxDQUFjaUIsT0FBZCxDQUFzQixVQUFDTSxHQUFELEVBQU1yQixDQUFOLEVBQVk7QUFDOUIsb0JBQUdxQixJQUFJcEIsTUFBSixHQUFha0IsYUFBaEIsRUFBOEI7QUFDMUJBLG9DQUFnQkUsSUFBSXBCLE1BQXBCO0FBQ0FtQixxQ0FBaUJwQixDQUFqQjtBQUNIO0FBQ0osYUFMRDtBQU1BLG1CQUFPb0IsY0FBUDtBQUNIOzs7c0NBR2F0QixRLEVBQVM7O0FBRW5CLGdCQUFJVCxZQUFZLEVBQWhCOztBQUVBLGlCQUFJLElBQUlXLElBQUksQ0FBWixFQUFlQSxJQUFJRixTQUFTRyxNQUE1QixFQUFvQ0QsR0FBcEMsRUFBd0M7QUFDcEMsb0JBQUlxQixNQUFNdkIsU0FBU0UsQ0FBVCxDQUFWO0FBQ0Esb0JBQUlPLElBQUksQ0FBUjtBQUNBLG9CQUFJQyxJQUFJLENBQVI7QUFDQSxxQkFBSSxJQUFJYyxJQUFJLENBQVosRUFBZUEsSUFBSUQsSUFBSXBCLE1BQXZCLEVBQStCcUIsR0FBL0IsRUFBbUM7QUFDL0JmLHlCQUFLYyxJQUFJQyxDQUFKLEVBQU8sQ0FBUCxDQUFMO0FBQ0FkLHlCQUFLYSxJQUFJQyxDQUFKLEVBQU8sQ0FBUCxDQUFMO0FBQ0g7QUFDRCxvQkFBSUMsU0FBUyxDQUFDaEIsSUFBSWMsSUFBSXBCLE1BQVQsRUFBaUJPLElBQUlhLElBQUlwQixNQUF6QixDQUFiO0FBQ0FaLDBCQUFVaUIsSUFBVixDQUFlaUIsTUFBZjtBQUNIO0FBQ0QsbUJBQU9sQyxTQUFQO0FBQ0g7OztxQ0FFWUEsUyxFQUFXbUMsTyxFQUFROztBQUU1QixnQkFBSTFCLFdBQVdULFVBQVV1QixHQUFWLENBQWMsVUFBQ3hCLENBQUQsRUFBTztBQUFFLHVCQUFPLEVBQVA7QUFBWSxhQUFuQyxDQUFmO0FBQ0EsZ0JBQUlTLFlBQVlSLFVBQVV1QixHQUFWLENBQWMsWUFBTTtBQUFDLHVCQUFPLENBQVA7QUFBVSxhQUEvQixDQUFoQjtBQUNBLGlCQUFJLElBQUlaLElBQUksQ0FBWixFQUFlQSxJQUFJd0IsUUFBUXZCLE1BQTNCLEVBQW1DRCxHQUFuQyxFQUF1QztBQUNuQyxvQkFBSXlCLEtBQUtELFFBQVF4QixDQUFSLENBQVQ7QUFDQSxvQkFBSTBCLFVBQVUsS0FBZDtBQUNBLG9CQUFJQyxtQkFBbUJkLFFBQXZCO0FBQ0EscUJBQUksSUFBSVMsSUFBSSxDQUFaLEVBQWVBLElBQUlqQyxVQUFVWSxNQUE3QixFQUFxQ3FCLEdBQXJDLEVBQXlDO0FBQ3JDLHdCQUFJQyxTQUFTbEMsVUFBVWlDLENBQVYsQ0FBYjtBQUNBLHdCQUFJYixXQUFXLEtBQUttQixJQUFMLENBQVVMLE1BQVYsRUFBa0JFLEVBQWxCLENBQWY7QUFDQSx3QkFBR2hCLFdBQVdrQixnQkFBZCxFQUErQjtBQUMzQkQsa0NBQVVKLENBQVY7QUFDQUssMkNBQW1CbEIsUUFBbkI7QUFDSDtBQUNKO0FBQ0RaLDBCQUFVNkIsT0FBVixJQUFxQkcsT0FBT2hDLFVBQVU2QixPQUFWLENBQVAsSUFBNkJoQixLQUFLb0IsR0FBTCxDQUFTSCxnQkFBVCxFQUEyQixDQUEzQixDQUFsRDs7QUFFQTdCLHlCQUFTNEIsT0FBVCxFQUFrQnBCLElBQWxCLENBQXVCbUIsRUFBdkI7QUFDSDtBQUNELG1CQUFPLENBQUM1QixTQUFELEVBQVlDLFFBQVosQ0FBUDtBQUNIOzs7NkJBRUlKLEMsRUFBR0MsQyxFQUFFO0FBQ04sZ0JBQUlvQyxPQUFPLENBQVg7QUFDQSxpQkFBSSxJQUFJL0IsSUFBSSxDQUFaLEVBQWVBLElBQUksQ0FBbkIsRUFBc0JBLEdBQXRCLEVBQTBCO0FBQ3RCK0Isd0JBQVFyQixLQUFLb0IsR0FBTCxDQUFVcEMsRUFBRU0sQ0FBRixJQUFPTCxFQUFFSyxDQUFGLENBQWpCLEVBQXdCLENBQXhCLENBQVI7QUFDSDtBQUNELG1CQUFPVSxLQUFLc0IsSUFBTCxDQUFVRCxJQUFWLENBQVA7QUFDSDs7Ozs7O2tCQUdVNUMsTSIsImZpbGUiOiJLTWVhbnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBLTWVhbnMge1xuXG4gICAga21lYW5zKGMpe1xuICAgICAgICBsZXQgY2VudHJvaWRzID0gdGhpcy5maW5kQ2VudHJvaWRzKGMpO1xuICAgICAgICBsZXQgbmV3Q0UgPSB0aGlzLmZpbmRDbHVzdGVycyhcbiAgICAgICAgICAgIGNlbnRyb2lkcyxcbiAgICAgICAgICAgIGMucmVkdWNlKChhLCBiKSA9PiB7IHJldHVybiBhLmNvbmNhdChiKTsgfSlcbiAgICAgICAgKTtcblxuICAgICAgICBsZXQgbmV3X2Vycm9yID0gbmV3Q0VbMF07XG4gICAgICAgIGxldCBjbHVzdGVycyA9IG5ld0NFWzFdO1xuXG4gICAgICAgIGxldCBzYW1lID0gdHJ1ZTtcbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IG5ld19lcnJvci5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICBpZihuZXdfZXJyb3JbaV0gIT09IHRoaXMub2xkX2Vycm9yW2ldKXtcbiAgICAgICAgICAgICAgICBzYW1lID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5vbGRfZXJyb3IgPSBuZXdfZXJyb3I7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYoc2FtZSl7XG4gICAgICAgICAgICByZXR1cm4gW2NsdXN0ZXJzLCBjZW50cm9pZHNdO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmttZWFucyhjbHVzdGVycyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvcihrLCBrbm4pe1xuICAgICAgICBsZXQgY2x1c3RlcnMgPSBbXTtcblxuICAgICAgICBsZXQgYyA9IFtdO1xuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwga25uLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGMucHVzaChba25uW2ldLngsIGtubltpXS55LCBrbm5baV0uZGlzdGFuY2VdKTtcbiAgICAgICAgICAgIGlmKGkgPiAwICYmIGkgJSBNYXRoLmZsb29yKGtubi5sZW5ndGggLyBrKSA9PT0gMCl7XG4gICAgICAgICAgICAgICAgY2x1c3RlcnMucHVzaChjKTtcbiAgICAgICAgICAgICAgICBjID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYoYy5sZW5ndGggPiAwKSBjbHVzdGVycy5wdXNoKGMpO1xuXG4gICAgICAgIHRoaXMub2xkX2Vycm9yID0gY2x1c3RlcnMubWFwKCgpID0+IHtyZXR1cm4gSW5maW5pdHk7fSk7XG5cbiAgICAgICAgbGV0IGNjID0gdGhpcy5rbWVhbnMoY2x1c3RlcnMpO1xuICAgICAgICBjY1swXVxuICAgICAgICAgICAgLmZvckVhY2goKGMpID0+IHtcbiAgICAgICAgICAgICAgICBjLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFbMl0gPiBiWzJdO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgY2NbMV0gPSBjY1sxXS5tYXAoKGMpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBbTWF0aC5yb3VuZChjWzBdKSwgTWF0aC5yb3VuZChjWzFdKV07XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNsdXN0ZXJzID0gY2NbMF07XG4gICAgICAgIHRoaXMuY2VudHJvaWRzID0gY2NbMV07XG4gICAgfVxuXG4gICAgZ2V0Q2x1c3RlcnMoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2x1c3RlcnM7XG4gICAgfVxuXG4gICAgZ2V0Q2VudHJvaWRzKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmNlbnRyb2lkcztcbiAgICB9XG5cbiAgICBnZXRDZW50cm9pZChjbHVzdGVySW5kZXg6IG51bWJlcil7XG4gICAgICAgIHJldHVybiB0aGlzLmNlbnRyb2lkc1tjbHVzdGVySW5kZXhdO1xuICAgIH1cblxuICAgIGdldExhcmdlc3RDbHVzdGVySW5kZXgoKXtcbiAgICAgICAgbGV0IGxhcmdlc3RMZW5ndGggPSAwO1xuICAgICAgICBsZXQgbGFyZ2VzdENsdXN0ZXIgPSAwO1xuICAgICAgICB0aGlzLmNsdXN0ZXJzLmZvckVhY2goKGNsdSwgaSkgPT4ge1xuICAgICAgICAgICAgaWYoY2x1Lmxlbmd0aCA+IGxhcmdlc3RMZW5ndGgpe1xuICAgICAgICAgICAgICAgIGxhcmdlc3RMZW5ndGggPSBjbHUubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGxhcmdlc3RDbHVzdGVyID0gaTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBsYXJnZXN0Q2x1c3RlcjtcbiAgICB9XG5cblxuICAgIGZpbmRDZW50cm9pZHMoY2x1c3RlcnMpe1xuXG4gICAgICAgIGxldCBjZW50cm9pZHMgPSBbXTtcblxuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgY2x1c3RlcnMubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgbGV0IGNsdSA9IGNsdXN0ZXJzW2ldO1xuICAgICAgICAgICAgbGV0IHggPSAwO1xuICAgICAgICAgICAgbGV0IHkgPSAwO1xuICAgICAgICAgICAgZm9yKGxldCBqID0gMDsgaiA8IGNsdS5sZW5ndGg7IGorKyl7XG4gICAgICAgICAgICAgICAgeCArPSBjbHVbal1bMF07XG4gICAgICAgICAgICAgICAgeSArPSBjbHVbal1bMV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgY2VudGVyID0gW3ggLyBjbHUubGVuZ3RoLCB5IC8gY2x1Lmxlbmd0aF07XG4gICAgICAgICAgICBjZW50cm9pZHMucHVzaChjZW50ZXIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjZW50cm9pZHM7XG4gICAgfVxuXG4gICAgZmluZENsdXN0ZXJzKGNlbnRyb2lkcywgZGF0YXNldCl7XG5cbiAgICAgICAgbGV0IGNsdXN0ZXJzID0gY2VudHJvaWRzLm1hcCgoYykgPT4geyByZXR1cm4gW107IH0pO1xuICAgICAgICBsZXQgbmV3X2Vycm9yID0gY2VudHJvaWRzLm1hcCgoKSA9PiB7cmV0dXJuIDA7fSk7XG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBkYXRhc2V0Lmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGxldCBkcCA9IGRhdGFzZXRbaV07XG4gICAgICAgICAgICBsZXQgY2xvc2VzdCA9IGZhbHNlO1xuICAgICAgICAgICAgbGV0IGNsb3Nlc3RfZGlzdGFuY2UgPSBJbmZpbml0eTtcbiAgICAgICAgICAgIGZvcihsZXQgaiA9IDA7IGogPCBjZW50cm9pZHMubGVuZ3RoOyBqKyspe1xuICAgICAgICAgICAgICAgIGxldCBjZW50ZXIgPSBjZW50cm9pZHNbal07XG4gICAgICAgICAgICAgICAgbGV0IGRpc3RhbmNlID0gdGhpcy5kaXN0KGNlbnRlciwgZHApO1xuICAgICAgICAgICAgICAgIGlmKGRpc3RhbmNlIDwgY2xvc2VzdF9kaXN0YW5jZSl7XG4gICAgICAgICAgICAgICAgICAgIGNsb3Nlc3QgPSBqO1xuICAgICAgICAgICAgICAgICAgICBjbG9zZXN0X2Rpc3RhbmNlID0gZGlzdGFuY2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbmV3X2Vycm9yW2Nsb3Nlc3RdID0gTnVtYmVyKG5ld19lcnJvcltjbG9zZXN0XSkgKyBNYXRoLnBvdyhjbG9zZXN0X2Rpc3RhbmNlLCAyKTtcblxuICAgICAgICAgICAgY2x1c3RlcnNbY2xvc2VzdF0ucHVzaChkcCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFtuZXdfZXJyb3IsIGNsdXN0ZXJzXTtcbiAgICB9XG5cbiAgICBkaXN0KGEsIGIpe1xuICAgICAgICBsZXQgcm9vdCA9IDA7XG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCAyOyBpKyspe1xuICAgICAgICAgICAgcm9vdCArPSBNYXRoLnBvdygoYVtpXSAtIGJbaV0pLCAyKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KHJvb3QpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgS01lYW5zOyJdfQ==
//# sourceMappingURL=KMeans.js.map
