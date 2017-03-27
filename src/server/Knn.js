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
        this.features = this.makeFeatures(ap_ids);
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
            return features;
        }
    }, {
        key: "getNeighbors",
        value: function getNeighbors(k, cb) {
            var _this = this;

            var keys = Object.keys(this.features);
            var done = 0;
            var knn = [];
            keys.forEach(function (key) {
                _this.db.all(_Db2.default.query_get_features.replace(":feature_value:", _this.features[key]), [key, _this.fp_id], function (err, rows) {
                    if (rows.length != 0) {
                        var nei = null;
                        rows.forEach(function (coord) {
                            if (nei == null) {
                                nei = {
                                    x_y: coord.x + "_" + coord.y,
                                    x: Number(coord.x),
                                    y: Number(coord.y),
                                    distance: 0
                                };
                            }
                            nei.distance += Math.pow(coord.diff, 2);
                        });
                        nei.distance = Math.sqrt(nei.distance);
                        knn.push(nei);
                    }
                    done++;
                    if (done >= keys.length) {
                        _this.makeGuess(knn, cb, k);
                    }
                });
            });
        }
    }, {
        key: "makeGuess",
        value: function makeGuess(knn, cb, k) {
            knn.sort(function (a, b) {
                return a.distance > b.distance;
            });
            knn = knn.splice(0, k);
            cb(knn);
        }
    }]);

    return Knn;
}();

exports.default = Knn;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIktubi5lczYiXSwibmFtZXMiOlsiS25uIiwibG9nIiwiZGIiLCJmcF9pZCIsImFwX2lkcyIsImdldERhdGFiYXNlIiwiZmVhdHVyZXMiLCJtYWtlRmVhdHVyZXMiLCJmb3JFYWNoIiwicm93Iiwicm93MSIsImFwX2lkIiwiTWF0aCIsImFicyIsIk51bWJlciIsInZhbHVlIiwiayIsImNiIiwia2V5cyIsIk9iamVjdCIsImRvbmUiLCJrbm4iLCJrZXkiLCJhbGwiLCJxdWVyeV9nZXRfZmVhdHVyZXMiLCJyZXBsYWNlIiwiZXJyIiwicm93cyIsImxlbmd0aCIsIm5laSIsImNvb3JkIiwieF95IiwieCIsInkiLCJkaXN0YW5jZSIsInBvdyIsImRpZmYiLCJzcXJ0IiwicHVzaCIsIm1ha2VHdWVzcyIsInNvcnQiLCJhIiwiYiIsInNwbGljZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7Ozs7Ozs7SUFFTUEsRztBQUNGLGlCQUFZQyxHQUFaLEVBQWlCQyxFQUFqQixFQUFxQkMsS0FBckIsRUFBNEJDLE1BQTVCLEVBQW1DO0FBQUE7O0FBQy9CLGFBQUtILEdBQUwsR0FBV0EsR0FBWDtBQUNBLGFBQUtDLEVBQUwsR0FBVUEsR0FBR0csV0FBSCxFQUFWO0FBQ0EsYUFBS0YsS0FBTCxHQUFhQSxLQUFiO0FBQ0EsYUFBS0csUUFBTCxHQUFnQixLQUFLQyxZQUFMLENBQWtCSCxNQUFsQixDQUFoQjtBQUNIOzs7O3FDQUVZQSxNLEVBQU87QUFDaEIsZ0JBQUlFLFdBQVcsRUFBZjtBQUNBRixtQkFBT0ksT0FBUCxDQUFlLFVBQUNDLEdBQUQsRUFBUztBQUNwQkwsdUJBQU9JLE9BQVAsQ0FBZSxVQUFDRSxJQUFELEVBQVU7QUFDckJKLDZCQUFTRyxJQUFJRSxLQUFKLEdBQVlELEtBQUtDLEtBQTFCLElBQW1DQyxLQUFLQyxHQUFMLENBQVNDLE9BQU9MLElBQUlNLEtBQVgsSUFBb0JELE9BQU9KLEtBQUtLLEtBQVosQ0FBN0IsQ0FBbkM7QUFDSCxpQkFGRDtBQUdILGFBSkQ7QUFLQSxtQkFBT1QsUUFBUDtBQUNIOzs7cUNBRVlVLEMsRUFBR0MsRSxFQUFHO0FBQUE7O0FBQ2YsZ0JBQUlDLE9BQU9DLE9BQU9ELElBQVAsQ0FBWSxLQUFLWixRQUFqQixDQUFYO0FBQ0EsZ0JBQUljLE9BQU8sQ0FBWDtBQUNBLGdCQUFJQyxNQUFNLEVBQVY7QUFDQUgsaUJBQUtWLE9BQUwsQ0FBYSxVQUFDYyxHQUFELEVBQVM7QUFDbEIsc0JBQUtwQixFQUFMLENBQVFxQixHQUFSLENBQVksYUFBR0Msa0JBQUgsQ0FBc0JDLE9BQXRCLENBQThCLGlCQUE5QixFQUFpRCxNQUFLbkIsUUFBTCxDQUFjZ0IsR0FBZCxDQUFqRCxDQUFaLEVBQWtGLENBQUNBLEdBQUQsRUFBTSxNQUFLbkIsS0FBWCxDQUFsRixFQUFxRyxVQUFDdUIsR0FBRCxFQUFNQyxJQUFOLEVBQWU7QUFDaEgsd0JBQUdBLEtBQUtDLE1BQUwsSUFBZSxDQUFsQixFQUFvQjtBQUNoQiw0QkFBSUMsTUFBTSxJQUFWO0FBQ0FGLDZCQUFLbkIsT0FBTCxDQUFhLFVBQUNzQixLQUFELEVBQVc7QUFDcEIsZ0NBQUdELE9BQU8sSUFBVixFQUFlO0FBQ1hBLHNDQUFNO0FBQ0ZFLHlDQUFLRCxNQUFNRSxDQUFOLEdBQVUsR0FBVixHQUFnQkYsTUFBTUcsQ0FEekI7QUFFRkQsdUNBQUdsQixPQUFPZ0IsTUFBTUUsQ0FBYixDQUZEO0FBR0ZDLHVDQUFHbkIsT0FBT2dCLE1BQU1HLENBQWIsQ0FIRDtBQUlGQyw4Q0FBVTtBQUpSLGlDQUFOO0FBTUg7QUFDREwsZ0NBQUlLLFFBQUosSUFBZ0J0QixLQUFLdUIsR0FBTCxDQUFTTCxNQUFNTSxJQUFmLEVBQXFCLENBQXJCLENBQWhCO0FBQ0gseUJBVkQ7QUFXQVAsNEJBQUlLLFFBQUosR0FBZXRCLEtBQUt5QixJQUFMLENBQVVSLElBQUlLLFFBQWQsQ0FBZjtBQUNBYiw0QkFBSWlCLElBQUosQ0FBU1QsR0FBVDtBQUNIO0FBQ0RUO0FBQ0Esd0JBQUdBLFFBQVFGLEtBQUtVLE1BQWhCLEVBQXVCO0FBQ25CLDhCQUFLVyxTQUFMLENBQWVsQixHQUFmLEVBQW9CSixFQUFwQixFQUF3QkQsQ0FBeEI7QUFDSDtBQUNKLGlCQXJCRDtBQXNCSCxhQXZCRDtBQXdCSDs7O2tDQUVTSyxHLEVBQUtKLEUsRUFBSUQsQyxFQUFFO0FBQ2pCSyxnQkFBSW1CLElBQUosQ0FBUyxVQUFDQyxDQUFELEVBQUlDLENBQUosRUFBVTtBQUFFLHVCQUFPRCxFQUFFUCxRQUFGLEdBQWFRLEVBQUVSLFFBQXRCO0FBQWlDLGFBQXREO0FBQ0FiLGtCQUFNQSxJQUFJc0IsTUFBSixDQUFXLENBQVgsRUFBYzNCLENBQWQsQ0FBTjtBQUNBQyxlQUFHSSxHQUFIO0FBQ0g7Ozs7OztrQkFHVXJCLEciLCJmaWxlIjoiS25uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IERiIGZyb20gJy4vRGInO1xuXG5jbGFzcyBLbm4ge1xuICAgIGNvbnN0cnVjdG9yKGxvZywgZGIsIGZwX2lkLCBhcF9pZHMpe1xuICAgICAgICB0aGlzLmxvZyA9IGxvZztcbiAgICAgICAgdGhpcy5kYiA9IGRiLmdldERhdGFiYXNlKCk7XG4gICAgICAgIHRoaXMuZnBfaWQgPSBmcF9pZDtcbiAgICAgICAgdGhpcy5mZWF0dXJlcyA9IHRoaXMubWFrZUZlYXR1cmVzKGFwX2lkcyk7XG4gICAgfVxuXG4gICAgbWFrZUZlYXR1cmVzKGFwX2lkcyl7XG4gICAgICAgIGxldCBmZWF0dXJlcyA9IHt9O1xuICAgICAgICBhcF9pZHMuZm9yRWFjaCgocm93KSA9PiB7XG4gICAgICAgICAgICBhcF9pZHMuZm9yRWFjaCgocm93MSkgPT4ge1xuICAgICAgICAgICAgICAgIGZlYXR1cmVzW3Jvdy5hcF9pZCArIHJvdzEuYXBfaWRdID0gTWF0aC5hYnMoTnVtYmVyKHJvdy52YWx1ZSkgLSBOdW1iZXIocm93MS52YWx1ZSkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZmVhdHVyZXM7XG4gICAgfVxuXG4gICAgZ2V0TmVpZ2hib3JzKGssIGNiKXtcbiAgICAgICAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLmZlYXR1cmVzKTtcbiAgICAgICAgbGV0IGRvbmUgPSAwO1xuICAgICAgICBsZXQga25uID0gW107XG4gICAgICAgIGtleXMuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgICAgICB0aGlzLmRiLmFsbChEYi5xdWVyeV9nZXRfZmVhdHVyZXMucmVwbGFjZShcIjpmZWF0dXJlX3ZhbHVlOlwiLCB0aGlzLmZlYXR1cmVzW2tleV0pLCBba2V5LCB0aGlzLmZwX2lkXSwgKGVyciwgcm93cykgPT4ge1xuICAgICAgICAgICAgICAgIGlmKHJvd3MubGVuZ3RoICE9IDApe1xuICAgICAgICAgICAgICAgICAgICBsZXQgbmVpID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgcm93cy5mb3JFYWNoKChjb29yZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYobmVpID09IG51bGwpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5laSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeF95OiBjb29yZC54ICsgXCJfXCIgKyBjb29yZC55LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiBOdW1iZXIoY29vcmQueCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IE51bWJlcihjb29yZC55KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2U6IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBuZWkuZGlzdGFuY2UgKz0gTWF0aC5wb3coY29vcmQuZGlmZiwgMik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBuZWkuZGlzdGFuY2UgPSBNYXRoLnNxcnQobmVpLmRpc3RhbmNlKTtcbiAgICAgICAgICAgICAgICAgICAga25uLnB1c2gobmVpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZG9uZSsrO1xuICAgICAgICAgICAgICAgIGlmKGRvbmUgPj0ga2V5cy5sZW5ndGgpe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1ha2VHdWVzcyhrbm4sIGNiLCBrKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgbWFrZUd1ZXNzKGtubiwgY2IsIGspe1xuICAgICAgICBrbm4uc29ydCgoYSwgYikgPT4geyByZXR1cm4gYS5kaXN0YW5jZSA+IGIuZGlzdGFuY2U7IH0pO1xuICAgICAgICBrbm4gPSBrbm4uc3BsaWNlKDAsIGspO1xuICAgICAgICBjYihrbm4pO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgS25uOyJdfQ==
//# sourceMappingURL=Knn.js.map
