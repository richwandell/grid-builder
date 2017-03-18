"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Db = require("./Db");

var _Db2 = _interopRequireDefault(_Db);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Knn = function () {
    function Knn(log, db, fp_id, ap_ids) {
        _classCallCheck(this, Knn);

        this.log = log;
        this.db = db.getDatabase();
        this.fp_id = fp_id;
        this.makeFeatures(ap_ids);
    }

    _createClass(Knn, [{
        key: "makeFeatures",
        value: function makeFeatures(ap_ids) {
            var features = {};
            ap_ids.forEach(function (row) {
                ap_ids.forEach(function (row1) {
                    features[row.ap_id + row1.ap_id] = Math.abs(Number(row.value) - Number(row1.value));
                });
            });
            this.features = features;
        }
    }, {
        key: "getNeighbors",
        value: function getNeighbors(k, cb) {
            var _this = this;

            var keys = Object.keys(this.features);
            var done = 0;
            var data = [];

            keys.forEach(function (key) {
                _this.db.all(_Db2.default.query_get_features.replace(":feature_value:", _this.features[key]), [key, _this.fp_id], function (err, rows) {
                    data.push(rows);
                    done++;
                    if (done >= keys.length) {
                        _this.makeGuess(data, cb, k);
                    }
                });
            });
        }
    }, {
        key: "makeGuess",
        value: function makeGuess(data, cb, k) {

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
            cb(knn.splice(0, k));
        }
    }]);

    return Knn;
}();

exports.default = Knn;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIktubi5lczYiXSwibmFtZXMiOlsiS25uIiwibG9nIiwiZGIiLCJmcF9pZCIsImFwX2lkcyIsImdldERhdGFiYXNlIiwibWFrZUZlYXR1cmVzIiwiZmVhdHVyZXMiLCJmb3JFYWNoIiwicm93Iiwicm93MSIsImFwX2lkIiwiTWF0aCIsImFicyIsIk51bWJlciIsInZhbHVlIiwiayIsImNiIiwia2V5cyIsIk9iamVjdCIsImRvbmUiLCJkYXRhIiwia2V5IiwiYWxsIiwicXVlcnlfZ2V0X2ZlYXR1cmVzIiwicmVwbGFjZSIsImVyciIsInJvd3MiLCJwdXNoIiwibGVuZ3RoIiwibWFrZUd1ZXNzIiwiZGlzdGFuY2VzIiwia25uIiwiZmVhdHVyZSIsImNvb3JkIiwieCIsInkiLCJwb3ciLCJkaWZmIiwieF95IiwiZGlzdGFuY2UiLCJzcXJ0IiwicmVkdWNlIiwiYSIsImIiLCJzb3J0Iiwic3BsaWNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOzs7Ozs7OztJQUVNQSxHO0FBQ0YsaUJBQVlDLEdBQVosRUFBaUJDLEVBQWpCLEVBQXFCQyxLQUFyQixFQUE0QkMsTUFBNUIsRUFBbUM7QUFBQTs7QUFDL0IsYUFBS0gsR0FBTCxHQUFXQSxHQUFYO0FBQ0EsYUFBS0MsRUFBTCxHQUFVQSxHQUFHRyxXQUFILEVBQVY7QUFDQSxhQUFLRixLQUFMLEdBQWFBLEtBQWI7QUFDQSxhQUFLRyxZQUFMLENBQWtCRixNQUFsQjtBQUNIOzs7O3FDQUVZQSxNLEVBQU87QUFDaEIsZ0JBQUlHLFdBQVcsRUFBZjtBQUNBSCxtQkFBT0ksT0FBUCxDQUFlLFVBQUNDLEdBQUQsRUFBUztBQUNwQkwsdUJBQU9JLE9BQVAsQ0FBZSxVQUFDRSxJQUFELEVBQVU7QUFDckJILDZCQUFTRSxJQUFJRSxLQUFKLEdBQVlELEtBQUtDLEtBQTFCLElBQW1DQyxLQUFLQyxHQUFMLENBQVNDLE9BQU9MLElBQUlNLEtBQVgsSUFBb0JELE9BQU9KLEtBQUtLLEtBQVosQ0FBN0IsQ0FBbkM7QUFDSCxpQkFGRDtBQUdILGFBSkQ7QUFLQSxpQkFBS1IsUUFBTCxHQUFnQkEsUUFBaEI7QUFDSDs7O3FDQUVZUyxDLEVBQUdDLEUsRUFBRztBQUFBOztBQUNmLGdCQUFJQyxPQUFPQyxPQUFPRCxJQUFQLENBQVksS0FBS1gsUUFBakIsQ0FBWDtBQUNBLGdCQUFJYSxPQUFPLENBQVg7QUFDQSxnQkFBSUMsT0FBTyxFQUFYOztBQUVBSCxpQkFBS1YsT0FBTCxDQUFhLFVBQUNjLEdBQUQsRUFBUztBQUNsQixzQkFBS3BCLEVBQUwsQ0FBUXFCLEdBQVIsQ0FBWSxhQUFHQyxrQkFBSCxDQUFzQkMsT0FBdEIsQ0FBOEIsaUJBQTlCLEVBQWlELE1BQUtsQixRQUFMLENBQWNlLEdBQWQsQ0FBakQsQ0FBWixFQUFrRixDQUFDQSxHQUFELEVBQU0sTUFBS25CLEtBQVgsQ0FBbEYsRUFBcUcsVUFBQ3VCLEdBQUQsRUFBTUMsSUFBTixFQUFlO0FBQ2hITix5QkFBS08sSUFBTCxDQUFVRCxJQUFWO0FBQ0FQO0FBQ0Esd0JBQUdBLFFBQVFGLEtBQUtXLE1BQWhCLEVBQXVCO0FBQ25CLDhCQUFLQyxTQUFMLENBQWVULElBQWYsRUFBcUJKLEVBQXJCLEVBQXlCRCxDQUF6QjtBQUNIO0FBQ0osaUJBTkQ7QUFPSCxhQVJEO0FBU0g7OztrQ0FFU0ssSSxFQUFNSixFLEVBQUlELEMsRUFBRTs7QUFFbEIsZ0JBQUllLFlBQVksRUFBaEI7QUFDQSxnQkFBSUMsTUFBTSxFQUFWOztBQUVBWCxpQkFBS2IsT0FBTCxDQUFhLFVBQUN5QixPQUFELEVBQWE7QUFDdEIsb0JBQUdBLFFBQVFKLE1BQVIsSUFBa0IsQ0FBckIsRUFBd0I7O0FBRXhCSSx3QkFBUXpCLE9BQVIsQ0FBZ0IsVUFBQzBCLEtBQUQsRUFBVztBQUN2Qix3QkFBRyxPQUFPSCxVQUFVRyxNQUFNQyxDQUFOLEdBQVUsR0FBVixHQUFnQkQsTUFBTUUsQ0FBaEMsQ0FBUCxJQUE4QyxXQUFqRCxFQUE2RDtBQUN6REwsa0NBQVVHLE1BQU1DLENBQU4sR0FBVSxHQUFWLEdBQWdCRCxNQUFNRSxDQUFoQyxJQUFxQyxFQUFyQztBQUNIO0FBQ0RMLDhCQUFVRyxNQUFNQyxDQUFOLEdBQVUsR0FBVixHQUFnQkQsTUFBTUUsQ0FBaEMsRUFBbUNSLElBQW5DLENBQXdDaEIsS0FBS3lCLEdBQUwsQ0FBU0gsTUFBTUksSUFBZixFQUFxQixDQUFyQixDQUF4QztBQUNILGlCQUxEO0FBTUgsYUFURDtBQVVBLGdCQUFJcEIsT0FBT0MsT0FBT0QsSUFBUCxDQUFZYSxTQUFaLENBQVg7QUFDQWIsaUJBQUtWLE9BQUwsQ0FBYSxVQUFDYyxHQUFELEVBQVM7QUFDbEJVLG9CQUFJSixJQUFKLENBQVM7QUFDTFcseUJBQUtqQixHQURBO0FBRUxrQiw4QkFBVTVCLEtBQUs2QixJQUFMLENBQVVWLFVBQVVULEdBQVYsRUFBZW9CLE1BQWYsQ0FBc0IsVUFBQ0MsQ0FBRCxFQUFJQyxDQUFKLEVBQVU7QUFBRSwrQkFBT0QsSUFBRUMsQ0FBVDtBQUFhLHFCQUEvQyxDQUFWO0FBRkwsaUJBQVQ7QUFJSCxhQUxEO0FBTUFaLGdCQUFJYSxJQUFKLENBQVMsVUFBQ0YsQ0FBRCxFQUFJQyxDQUFKLEVBQVU7QUFBRSx1QkFBT0QsRUFBRUgsUUFBRixHQUFhSSxFQUFFSixRQUF0QjtBQUFpQyxhQUF0RDtBQUNBdkIsZUFBR2UsSUFBSWMsTUFBSixDQUFXLENBQVgsRUFBYzlCLENBQWQsQ0FBSDtBQUNIOzs7Ozs7a0JBR1VoQixHIiwiZmlsZSI6Iktubi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBEYiBmcm9tICcuL0RiJztcblxuY2xhc3MgS25uIHtcbiAgICBjb25zdHJ1Y3Rvcihsb2csIGRiLCBmcF9pZCwgYXBfaWRzKXtcbiAgICAgICAgdGhpcy5sb2cgPSBsb2c7XG4gICAgICAgIHRoaXMuZGIgPSBkYi5nZXREYXRhYmFzZSgpO1xuICAgICAgICB0aGlzLmZwX2lkID0gZnBfaWQ7XG4gICAgICAgIHRoaXMubWFrZUZlYXR1cmVzKGFwX2lkcyk7XG4gICAgfVxuXG4gICAgbWFrZUZlYXR1cmVzKGFwX2lkcyl7XG4gICAgICAgIGxldCBmZWF0dXJlcyA9IHt9O1xuICAgICAgICBhcF9pZHMuZm9yRWFjaCgocm93KSA9PiB7XG4gICAgICAgICAgICBhcF9pZHMuZm9yRWFjaCgocm93MSkgPT4ge1xuICAgICAgICAgICAgICAgIGZlYXR1cmVzW3Jvdy5hcF9pZCArIHJvdzEuYXBfaWRdID0gTWF0aC5hYnMoTnVtYmVyKHJvdy52YWx1ZSkgLSBOdW1iZXIocm93MS52YWx1ZSkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmZlYXR1cmVzID0gZmVhdHVyZXM7XG4gICAgfVxuXG4gICAgZ2V0TmVpZ2hib3JzKGssIGNiKXtcbiAgICAgICAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLmZlYXR1cmVzKTtcbiAgICAgICAgbGV0IGRvbmUgPSAwO1xuICAgICAgICBsZXQgZGF0YSA9IFtdO1xuXG4gICAgICAgIGtleXMuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgICAgICB0aGlzLmRiLmFsbChEYi5xdWVyeV9nZXRfZmVhdHVyZXMucmVwbGFjZShcIjpmZWF0dXJlX3ZhbHVlOlwiLCB0aGlzLmZlYXR1cmVzW2tleV0pLCBba2V5LCB0aGlzLmZwX2lkXSwgKGVyciwgcm93cykgPT4ge1xuICAgICAgICAgICAgICAgIGRhdGEucHVzaChyb3dzKTtcbiAgICAgICAgICAgICAgICBkb25lKys7XG4gICAgICAgICAgICAgICAgaWYoZG9uZSA+PSBrZXlzLmxlbmd0aCl7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFrZUd1ZXNzKGRhdGEsIGNiLCBrKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgbWFrZUd1ZXNzKGRhdGEsIGNiLCBrKXtcblxuICAgICAgICBsZXQgZGlzdGFuY2VzID0ge307XG4gICAgICAgIGxldCBrbm4gPSBbXTtcblxuICAgICAgICBkYXRhLmZvckVhY2goKGZlYXR1cmUpID0+IHtcbiAgICAgICAgICAgIGlmKGZlYXR1cmUubGVuZ3RoID09IDApIHJldHVybjtcblxuICAgICAgICAgICAgZmVhdHVyZS5mb3JFYWNoKChjb29yZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKHR5cGVvZihkaXN0YW5jZXNbY29vcmQueCArIFwiX1wiICsgY29vcmQueV0pID09IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICAgICAgICAgICAgICBkaXN0YW5jZXNbY29vcmQueCArIFwiX1wiICsgY29vcmQueV0gPSBbXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZGlzdGFuY2VzW2Nvb3JkLnggKyBcIl9cIiArIGNvb3JkLnldLnB1c2goTWF0aC5wb3coY29vcmQuZGlmZiwgMikpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzKGRpc3RhbmNlcyk7XG4gICAgICAgIGtleXMuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgICAgICBrbm4ucHVzaCh7XG4gICAgICAgICAgICAgICAgeF95OiBrZXksXG4gICAgICAgICAgICAgICAgZGlzdGFuY2U6IE1hdGguc3FydChkaXN0YW5jZXNba2V5XS5yZWR1Y2UoKGEsIGIpID0+IHsgcmV0dXJuIGErYjsgfSkpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGtubi5zb3J0KChhLCBiKSA9PiB7IHJldHVybiBhLmRpc3RhbmNlID4gYi5kaXN0YW5jZTsgfSk7XG4gICAgICAgIGNiKGtubi5zcGxpY2UoMCwgaykpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgS25uOyJdfQ==
//# sourceMappingURL=Knn.js.map
