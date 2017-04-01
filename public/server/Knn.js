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
            var knn = {};
            keys.forEach(function (key) {
                _this.db.all(_Db2.default.query_get_features.replace(":feature_value:", _this.features[key]), [key, _this.fp_id], function (err, rows) {

                    if (typeof rows != "undefined" && rows.length != 0) {

                        rows.forEach(function (coord) {
                            var key = coord.x + "_" + coord.y;
                            if (typeof knn[key] == "undefined") {
                                knn[key] = {
                                    x_y: coord.x + "_" + coord.y,
                                    x: Number(coord.x),
                                    y: Number(coord.y),
                                    distance: 0
                                };
                            }
                            knn[key].distance += Math.pow(coord.diff, 2);
                        });
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
            knn = Object.keys(knn).map(function (key) {
                var obj = knn[key];
                obj.distance = Math.sqrt(obj.distance);
                return knn[key];
            });
            knn = knn.sort(function (a, b) {
                if (a.distance > b.distance) {
                    return 1;
                } else if (b.distance > a.distance) {
                    return -1;
                }
                return 0;
            });
            knn = knn.splice(0, k);
            cb(knn);
        }
    }]);

    return Knn;
}();

exports.default = Knn;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvS25uLmVzNiJdLCJuYW1lcyI6WyJLbm4iLCJsb2ciLCJkYiIsImZwX2lkIiwiYXBfaWRzIiwiZ2V0RGF0YWJhc2UiLCJmZWF0dXJlcyIsIm1ha2VGZWF0dXJlcyIsImZvckVhY2giLCJyb3ciLCJyb3cxIiwiYXBfaWQiLCJNYXRoIiwiYWJzIiwiTnVtYmVyIiwidmFsdWUiLCJrIiwiY2IiLCJrZXlzIiwiT2JqZWN0IiwiZG9uZSIsImtubiIsImtleSIsImFsbCIsInF1ZXJ5X2dldF9mZWF0dXJlcyIsInJlcGxhY2UiLCJlcnIiLCJyb3dzIiwibGVuZ3RoIiwiY29vcmQiLCJ4IiwieSIsInhfeSIsImRpc3RhbmNlIiwicG93IiwiZGlmZiIsIm1ha2VHdWVzcyIsIm1hcCIsIm9iaiIsInNxcnQiLCJzb3J0IiwiYSIsImIiLCJzcGxpY2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7Ozs7Ozs7O0lBRU1BLEc7QUFDRixpQkFBWUMsR0FBWixFQUFpQkMsRUFBakIsRUFBcUJDLEtBQXJCLEVBQTRCQyxNQUE1QixFQUFtQztBQUFBOztBQUMvQixhQUFLSCxHQUFMLEdBQVdBLEdBQVg7QUFDQSxhQUFLQyxFQUFMLEdBQVVBLEdBQUdHLFdBQUgsRUFBVjtBQUNBLGFBQUtGLEtBQUwsR0FBYUEsS0FBYjtBQUNBLGFBQUtHLFFBQUwsR0FBZ0IsS0FBS0MsWUFBTCxDQUFrQkgsTUFBbEIsQ0FBaEI7QUFDSDs7OztxQ0FFWUEsTSxFQUFPO0FBQ2hCLGdCQUFJRSxXQUFXLEVBQWY7QUFDQUYsbUJBQU9JLE9BQVAsQ0FBZSxVQUFDQyxHQUFELEVBQVM7QUFDcEJMLHVCQUFPSSxPQUFQLENBQWUsVUFBQ0UsSUFBRCxFQUFVO0FBQ3JCSiw2QkFBU0csSUFBSUUsS0FBSixHQUFZRCxLQUFLQyxLQUExQixJQUFtQ0MsS0FBS0MsR0FBTCxDQUFTQyxPQUFPTCxJQUFJTSxLQUFYLElBQW9CRCxPQUFPSixLQUFLSyxLQUFaLENBQTdCLENBQW5DO0FBQ0gsaUJBRkQ7QUFHSCxhQUpEO0FBS0EsbUJBQU9ULFFBQVA7QUFDSDs7O3FDQUVZVSxDLEVBQUdDLEUsRUFBRztBQUFBOztBQUNmLGdCQUFJQyxPQUFPQyxPQUFPRCxJQUFQLENBQVksS0FBS1osUUFBakIsQ0FBWDtBQUNBLGdCQUFJYyxPQUFPLENBQVg7QUFDQSxnQkFBSUMsTUFBTSxFQUFWO0FBQ0FILGlCQUFLVixPQUFMLENBQWEsVUFBQ2MsR0FBRCxFQUFTO0FBQ2xCLHNCQUFLcEIsRUFBTCxDQUFRcUIsR0FBUixDQUFZLGFBQUdDLGtCQUFILENBQXNCQyxPQUF0QixDQUE4QixpQkFBOUIsRUFBaUQsTUFBS25CLFFBQUwsQ0FBY2dCLEdBQWQsQ0FBakQsQ0FBWixFQUFrRixDQUFDQSxHQUFELEVBQU0sTUFBS25CLEtBQVgsQ0FBbEYsRUFBcUcsVUFBQ3VCLEdBQUQsRUFBTUMsSUFBTixFQUFlOztBQUVoSCx3QkFBRyxPQUFPQSxJQUFQLElBQWdCLFdBQWhCLElBQStCQSxLQUFLQyxNQUFMLElBQWUsQ0FBakQsRUFBbUQ7O0FBRS9DRCw2QkFBS25CLE9BQUwsQ0FBYSxVQUFDcUIsS0FBRCxFQUFXO0FBQ3BCLGdDQUFJUCxNQUFNTyxNQUFNQyxDQUFOLEdBQVUsR0FBVixHQUFnQkQsTUFBTUUsQ0FBaEM7QUFDQSxnQ0FBRyxPQUFPVixJQUFJQyxHQUFKLENBQVAsSUFBb0IsV0FBdkIsRUFBbUM7QUFDL0JELG9DQUFJQyxHQUFKLElBQVc7QUFDUFUseUNBQUtILE1BQU1DLENBQU4sR0FBVSxHQUFWLEdBQWdCRCxNQUFNRSxDQURwQjtBQUVQRCx1Q0FBR2hCLE9BQU9lLE1BQU1DLENBQWIsQ0FGSTtBQUdQQyx1Q0FBR2pCLE9BQU9lLE1BQU1FLENBQWIsQ0FISTtBQUlQRSw4Q0FBVTtBQUpILGlDQUFYO0FBTUg7QUFDRFosZ0NBQUlDLEdBQUosRUFBU1csUUFBVCxJQUFxQnJCLEtBQUtzQixHQUFMLENBQVNMLE1BQU1NLElBQWYsRUFBcUIsQ0FBckIsQ0FBckI7QUFDSCx5QkFYRDtBQVlIO0FBQ0RmO0FBQ0Esd0JBQUdBLFFBQVFGLEtBQUtVLE1BQWhCLEVBQXVCO0FBQ25CLDhCQUFLUSxTQUFMLENBQWVmLEdBQWYsRUFBb0JKLEVBQXBCLEVBQXdCRCxDQUF4QjtBQUNIO0FBQ0osaUJBckJEO0FBc0JILGFBdkJEO0FBd0JIOzs7a0NBRVNLLEcsRUFBS0osRSxFQUFJRCxDLEVBQUU7QUFDakJLLGtCQUFNRixPQUNERCxJQURDLENBQ0lHLEdBREosRUFFRGdCLEdBRkMsQ0FFRyxVQUFDZixHQUFELEVBQVM7QUFDVixvQkFBSWdCLE1BQU1qQixJQUFJQyxHQUFKLENBQVY7QUFDQWdCLG9CQUFJTCxRQUFKLEdBQWVyQixLQUFLMkIsSUFBTCxDQUFVRCxJQUFJTCxRQUFkLENBQWY7QUFDQSx1QkFBT1osSUFBSUMsR0FBSixDQUFQO0FBQ0gsYUFOQyxDQUFOO0FBT0FELGtCQUFNQSxJQUFJbUIsSUFBSixDQUFTLFVBQUNDLENBQUQsRUFBSUMsQ0FBSixFQUFVO0FBQ3JCLG9CQUFHRCxFQUFFUixRQUFGLEdBQWFTLEVBQUVULFFBQWxCLEVBQTJCO0FBQ3ZCLDJCQUFPLENBQVA7QUFDSCxpQkFGRCxNQUVNLElBQUdTLEVBQUVULFFBQUYsR0FBYVEsRUFBRVIsUUFBbEIsRUFBMkI7QUFDN0IsMkJBQU8sQ0FBQyxDQUFSO0FBQ0g7QUFDRCx1QkFBTyxDQUFQO0FBQ0gsYUFQSyxDQUFOO0FBUUFaLGtCQUFNQSxJQUFJc0IsTUFBSixDQUFXLENBQVgsRUFBYzNCLENBQWQsQ0FBTjtBQUNBQyxlQUFHSSxHQUFIO0FBQ0g7Ozs7OztrQkFHVXJCLEciLCJmaWxlIjoiS25uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IERiIGZyb20gJy4vRGInO1xuXG5jbGFzcyBLbm4ge1xuICAgIGNvbnN0cnVjdG9yKGxvZywgZGIsIGZwX2lkLCBhcF9pZHMpe1xuICAgICAgICB0aGlzLmxvZyA9IGxvZztcbiAgICAgICAgdGhpcy5kYiA9IGRiLmdldERhdGFiYXNlKCk7XG4gICAgICAgIHRoaXMuZnBfaWQgPSBmcF9pZDtcbiAgICAgICAgdGhpcy5mZWF0dXJlcyA9IHRoaXMubWFrZUZlYXR1cmVzKGFwX2lkcyk7XG4gICAgfVxuXG4gICAgbWFrZUZlYXR1cmVzKGFwX2lkcyl7XG4gICAgICAgIGxldCBmZWF0dXJlcyA9IHt9O1xuICAgICAgICBhcF9pZHMuZm9yRWFjaCgocm93KSA9PiB7XG4gICAgICAgICAgICBhcF9pZHMuZm9yRWFjaCgocm93MSkgPT4ge1xuICAgICAgICAgICAgICAgIGZlYXR1cmVzW3Jvdy5hcF9pZCArIHJvdzEuYXBfaWRdID0gTWF0aC5hYnMoTnVtYmVyKHJvdy52YWx1ZSkgLSBOdW1iZXIocm93MS52YWx1ZSkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZmVhdHVyZXM7XG4gICAgfVxuXG4gICAgZ2V0TmVpZ2hib3JzKGssIGNiKXtcbiAgICAgICAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLmZlYXR1cmVzKTtcbiAgICAgICAgbGV0IGRvbmUgPSAwO1xuICAgICAgICBsZXQga25uID0ge307XG4gICAgICAgIGtleXMuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgICAgICB0aGlzLmRiLmFsbChEYi5xdWVyeV9nZXRfZmVhdHVyZXMucmVwbGFjZShcIjpmZWF0dXJlX3ZhbHVlOlwiLCB0aGlzLmZlYXR1cmVzW2tleV0pLCBba2V5LCB0aGlzLmZwX2lkXSwgKGVyciwgcm93cykgPT4ge1xuXG4gICAgICAgICAgICAgICAgaWYodHlwZW9mKHJvd3MpICE9IFwidW5kZWZpbmVkXCIgJiYgcm93cy5sZW5ndGggIT0gMCl7XG5cbiAgICAgICAgICAgICAgICAgICAgcm93cy5mb3JFYWNoKChjb29yZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGtleSA9IGNvb3JkLnggKyBcIl9cIiArIGNvb3JkLnk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZih0eXBlb2Yoa25uW2tleV0pID09IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtubltrZXldID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4X3k6IGNvb3JkLnggKyBcIl9cIiArIGNvb3JkLnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHg6IE51bWJlcihjb29yZC54KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogTnVtYmVyKGNvb3JkLnkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXN0YW5jZTogMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGtubltrZXldLmRpc3RhbmNlICs9IE1hdGgucG93KGNvb3JkLmRpZmYsIDIpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZG9uZSsrO1xuICAgICAgICAgICAgICAgIGlmKGRvbmUgPj0ga2V5cy5sZW5ndGgpe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1ha2VHdWVzcyhrbm4sIGNiLCBrKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgbWFrZUd1ZXNzKGtubiwgY2IsIGspe1xuICAgICAgICBrbm4gPSBPYmplY3RcbiAgICAgICAgICAgIC5rZXlzKGtubilcbiAgICAgICAgICAgIC5tYXAoKGtleSkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBvYmogPSBrbm5ba2V5XTtcbiAgICAgICAgICAgICAgICBvYmouZGlzdGFuY2UgPSBNYXRoLnNxcnQob2JqLmRpc3RhbmNlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ga25uW2tleV07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAga25uID0ga25uLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICAgIGlmKGEuZGlzdGFuY2UgPiBiLmRpc3RhbmNlKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIH1lbHNlIGlmKGIuZGlzdGFuY2UgPiBhLmRpc3RhbmNlKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfSk7XG4gICAgICAgIGtubiA9IGtubi5zcGxpY2UoMCwgayk7XG4gICAgICAgIGNiKGtubik7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBLbm47Il19
//# sourceMappingURL=Knn.js.map
