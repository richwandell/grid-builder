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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIktubi5lczYiXSwibmFtZXMiOlsiS25uIiwibG9nIiwiZGIiLCJmcF9pZCIsImFwX2lkcyIsImdldERhdGFiYXNlIiwiZmVhdHVyZXMiLCJtYWtlRmVhdHVyZXMiLCJmb3JFYWNoIiwicm93Iiwicm93MSIsImFwX2lkIiwiTWF0aCIsImFicyIsIk51bWJlciIsInZhbHVlIiwiayIsImNiIiwia2V5cyIsIk9iamVjdCIsImRvbmUiLCJrbm4iLCJrZXkiLCJhbGwiLCJxdWVyeV9nZXRfZmVhdHVyZXMiLCJyZXBsYWNlIiwiZXJyIiwicm93cyIsImxlbmd0aCIsImNvb3JkIiwieCIsInkiLCJ4X3kiLCJkaXN0YW5jZSIsInBvdyIsImRpZmYiLCJtYWtlR3Vlc3MiLCJtYXAiLCJvYmoiLCJzcXJ0Iiwic29ydCIsImEiLCJiIiwic3BsaWNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOzs7Ozs7OztJQUVNQSxHO0FBQ0YsaUJBQVlDLEdBQVosRUFBaUJDLEVBQWpCLEVBQXFCQyxLQUFyQixFQUE0QkMsTUFBNUIsRUFBbUM7QUFBQTs7QUFDL0IsYUFBS0gsR0FBTCxHQUFXQSxHQUFYO0FBQ0EsYUFBS0MsRUFBTCxHQUFVQSxHQUFHRyxXQUFILEVBQVY7QUFDQSxhQUFLRixLQUFMLEdBQWFBLEtBQWI7QUFDQSxhQUFLRyxRQUFMLEdBQWdCLEtBQUtDLFlBQUwsQ0FBa0JILE1BQWxCLENBQWhCO0FBQ0g7Ozs7cUNBRVlBLE0sRUFBTztBQUNoQixnQkFBSUUsV0FBVyxFQUFmO0FBQ0FGLG1CQUFPSSxPQUFQLENBQWUsVUFBQ0MsR0FBRCxFQUFTO0FBQ3BCTCx1QkFBT0ksT0FBUCxDQUFlLFVBQUNFLElBQUQsRUFBVTtBQUNyQkosNkJBQVNHLElBQUlFLEtBQUosR0FBWUQsS0FBS0MsS0FBMUIsSUFBbUNDLEtBQUtDLEdBQUwsQ0FBU0MsT0FBT0wsSUFBSU0sS0FBWCxJQUFvQkQsT0FBT0osS0FBS0ssS0FBWixDQUE3QixDQUFuQztBQUNILGlCQUZEO0FBR0gsYUFKRDtBQUtBLG1CQUFPVCxRQUFQO0FBQ0g7OztxQ0FFWVUsQyxFQUFHQyxFLEVBQUc7QUFBQTs7QUFDZixnQkFBSUMsT0FBT0MsT0FBT0QsSUFBUCxDQUFZLEtBQUtaLFFBQWpCLENBQVg7QUFDQSxnQkFBSWMsT0FBTyxDQUFYO0FBQ0EsZ0JBQUlDLE1BQU0sRUFBVjtBQUNBSCxpQkFBS1YsT0FBTCxDQUFhLFVBQUNjLEdBQUQsRUFBUztBQUNsQixzQkFBS3BCLEVBQUwsQ0FBUXFCLEdBQVIsQ0FBWSxhQUFHQyxrQkFBSCxDQUFzQkMsT0FBdEIsQ0FBOEIsaUJBQTlCLEVBQWlELE1BQUtuQixRQUFMLENBQWNnQixHQUFkLENBQWpELENBQVosRUFBa0YsQ0FBQ0EsR0FBRCxFQUFNLE1BQUtuQixLQUFYLENBQWxGLEVBQXFHLFVBQUN1QixHQUFELEVBQU1DLElBQU4sRUFBZTs7QUFFaEgsd0JBQUcsT0FBT0EsSUFBUCxJQUFnQixXQUFoQixJQUErQkEsS0FBS0MsTUFBTCxJQUFlLENBQWpELEVBQW1EOztBQUUvQ0QsNkJBQUtuQixPQUFMLENBQWEsVUFBQ3FCLEtBQUQsRUFBVztBQUNwQixnQ0FBSVAsTUFBTU8sTUFBTUMsQ0FBTixHQUFVLEdBQVYsR0FBZ0JELE1BQU1FLENBQWhDO0FBQ0EsZ0NBQUcsT0FBT1YsSUFBSUMsR0FBSixDQUFQLElBQW9CLFdBQXZCLEVBQW1DO0FBQy9CRCxvQ0FBSUMsR0FBSixJQUFXO0FBQ1BVLHlDQUFLSCxNQUFNQyxDQUFOLEdBQVUsR0FBVixHQUFnQkQsTUFBTUUsQ0FEcEI7QUFFUEQsdUNBQUdoQixPQUFPZSxNQUFNQyxDQUFiLENBRkk7QUFHUEMsdUNBQUdqQixPQUFPZSxNQUFNRSxDQUFiLENBSEk7QUFJUEUsOENBQVU7QUFKSCxpQ0FBWDtBQU1IO0FBQ0RaLGdDQUFJQyxHQUFKLEVBQVNXLFFBQVQsSUFBcUJyQixLQUFLc0IsR0FBTCxDQUFTTCxNQUFNTSxJQUFmLEVBQXFCLENBQXJCLENBQXJCO0FBQ0gseUJBWEQ7QUFZSDtBQUNEZjtBQUNBLHdCQUFHQSxRQUFRRixLQUFLVSxNQUFoQixFQUF1QjtBQUNuQiw4QkFBS1EsU0FBTCxDQUFlZixHQUFmLEVBQW9CSixFQUFwQixFQUF3QkQsQ0FBeEI7QUFDSDtBQUNKLGlCQXJCRDtBQXNCSCxhQXZCRDtBQXdCSDs7O2tDQUVTSyxHLEVBQUtKLEUsRUFBSUQsQyxFQUFFO0FBQ2pCSyxrQkFBTUYsT0FDREQsSUFEQyxDQUNJRyxHQURKLEVBRURnQixHQUZDLENBRUcsVUFBQ2YsR0FBRCxFQUFTO0FBQ1Ysb0JBQUlnQixNQUFNakIsSUFBSUMsR0FBSixDQUFWO0FBQ0FnQixvQkFBSUwsUUFBSixHQUFlckIsS0FBSzJCLElBQUwsQ0FBVUQsSUFBSUwsUUFBZCxDQUFmO0FBQ0EsdUJBQU9aLElBQUlDLEdBQUosQ0FBUDtBQUNILGFBTkMsQ0FBTjtBQU9BRCxrQkFBTUEsSUFBSW1CLElBQUosQ0FBUyxVQUFDQyxDQUFELEVBQUlDLENBQUosRUFBVTtBQUNyQixvQkFBR0QsRUFBRVIsUUFBRixHQUFhUyxFQUFFVCxRQUFsQixFQUEyQjtBQUN2QiwyQkFBTyxDQUFQO0FBQ0gsaUJBRkQsTUFFTSxJQUFHUyxFQUFFVCxRQUFGLEdBQWFRLEVBQUVSLFFBQWxCLEVBQTJCO0FBQzdCLDJCQUFPLENBQUMsQ0FBUjtBQUNIO0FBQ0QsdUJBQU8sQ0FBUDtBQUNILGFBUEssQ0FBTjtBQVFBWixrQkFBTUEsSUFBSXNCLE1BQUosQ0FBVyxDQUFYLEVBQWMzQixDQUFkLENBQU47QUFDQUMsZUFBR0ksR0FBSDtBQUNIOzs7Ozs7a0JBR1VyQixHIiwiZmlsZSI6Iktubi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBEYiBmcm9tICcuL0RiJztcblxuY2xhc3MgS25uIHtcbiAgICBjb25zdHJ1Y3Rvcihsb2csIGRiLCBmcF9pZCwgYXBfaWRzKXtcbiAgICAgICAgdGhpcy5sb2cgPSBsb2c7XG4gICAgICAgIHRoaXMuZGIgPSBkYi5nZXREYXRhYmFzZSgpO1xuICAgICAgICB0aGlzLmZwX2lkID0gZnBfaWQ7XG4gICAgICAgIHRoaXMuZmVhdHVyZXMgPSB0aGlzLm1ha2VGZWF0dXJlcyhhcF9pZHMpO1xuICAgIH1cblxuICAgIG1ha2VGZWF0dXJlcyhhcF9pZHMpe1xuICAgICAgICBsZXQgZmVhdHVyZXMgPSB7fTtcbiAgICAgICAgYXBfaWRzLmZvckVhY2goKHJvdykgPT4ge1xuICAgICAgICAgICAgYXBfaWRzLmZvckVhY2goKHJvdzEpID0+IHtcbiAgICAgICAgICAgICAgICBmZWF0dXJlc1tyb3cuYXBfaWQgKyByb3cxLmFwX2lkXSA9IE1hdGguYWJzKE51bWJlcihyb3cudmFsdWUpIC0gTnVtYmVyKHJvdzEudmFsdWUpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGZlYXR1cmVzO1xuICAgIH1cblxuICAgIGdldE5laWdoYm9ycyhrLCBjYil7XG4gICAgICAgIGxldCBrZXlzID0gT2JqZWN0LmtleXModGhpcy5mZWF0dXJlcyk7XG4gICAgICAgIGxldCBkb25lID0gMDtcbiAgICAgICAgbGV0IGtubiA9IHt9O1xuICAgICAgICBrZXlzLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5kYi5hbGwoRGIucXVlcnlfZ2V0X2ZlYXR1cmVzLnJlcGxhY2UoXCI6ZmVhdHVyZV92YWx1ZTpcIiwgdGhpcy5mZWF0dXJlc1trZXldKSwgW2tleSwgdGhpcy5mcF9pZF0sIChlcnIsIHJvd3MpID0+IHtcblxuICAgICAgICAgICAgICAgIGlmKHR5cGVvZihyb3dzKSAhPSBcInVuZGVmaW5lZFwiICYmIHJvd3MubGVuZ3RoICE9IDApe1xuXG4gICAgICAgICAgICAgICAgICAgIHJvd3MuZm9yRWFjaCgoY29vcmQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBrZXkgPSBjb29yZC54ICsgXCJfXCIgKyBjb29yZC55O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYodHlwZW9mKGtubltrZXldKSA9PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrbm5ba2V5XSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeF95OiBjb29yZC54ICsgXCJfXCIgKyBjb29yZC55LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiBOdW1iZXIoY29vcmQueCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IE51bWJlcihjb29yZC55KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2U6IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBrbm5ba2V5XS5kaXN0YW5jZSArPSBNYXRoLnBvdyhjb29yZC5kaWZmLCAyKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRvbmUrKztcbiAgICAgICAgICAgICAgICBpZihkb25lID49IGtleXMubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYWtlR3Vlc3Moa25uLCBjYiwgayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG1ha2VHdWVzcyhrbm4sIGNiLCBrKXtcbiAgICAgICAga25uID0gT2JqZWN0XG4gICAgICAgICAgICAua2V5cyhrbm4pXG4gICAgICAgICAgICAubWFwKChrZXkpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgb2JqID0ga25uW2tleV07XG4gICAgICAgICAgICAgICAgb2JqLmRpc3RhbmNlID0gTWF0aC5zcXJ0KG9iai5kaXN0YW5jZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGtubltrZXldO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIGtubiA9IGtubi5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgICAgICBpZihhLmRpc3RhbmNlID4gYi5kaXN0YW5jZSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICB9ZWxzZSBpZihiLmRpc3RhbmNlID4gYS5kaXN0YW5jZSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH0pO1xuICAgICAgICBrbm4gPSBrbm4uc3BsaWNlKDAsIGspO1xuICAgICAgICBjYihrbm4pO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgS25uOyJdfQ==
//# sourceMappingURL=Knn.js.map
