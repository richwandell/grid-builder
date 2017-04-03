'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Db = require('./Db');

var _Db2 = _interopRequireDefault(_Db);

var _Log = require('./Log');

var _Log2 = _interopRequireDefault(_Log);

var _Features = require('./Features');

var _Features2 = _interopRequireDefault(_Features);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Knn = function () {
    function Knn(db, fp_id) {
        _classCallCheck(this, Knn);

        this.db = db;
        this.fp_id = fp_id;
    }

    _createClass(Knn, [{
        key: 'getNeighbors',
        value: function getNeighbors(features, points, k, cb) {
            this.features = features;
            var cache = points;

            var featureKeys = Object.keys(this.features);
            var featureKeysLength = featureKeys.length;
            var coords = Object.keys(cache);
            var coordsLength = coords.length;

            var knn = {};

            for (var i = 0; i < coordsLength; i++) {
                var coord = coords[i];
                if (knn[coord] === undefined) {
                    var _coord$split = coord.split("_"),
                        _coord$split2 = _slicedToArray(_coord$split, 2),
                        x = _coord$split2[0],
                        y = _coord$split2[1];

                    knn[coord] = {
                        x_y: coord,
                        x: Number(x),
                        y: Number(y),
                        distance: 0
                    };
                }
                for (var j = 0; j < featureKeysLength; j++) {
                    var feature = featureKeys[j];
                    var testValue = this.db.getFeatureValue(this.fp_id, coord, feature);
                    if (testValue) {
                        knn[coord].distance += Math.pow(Math.abs(testValue - this.features[feature]), 2);
                    }
                }
            }

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvS25uLmVzNiJdLCJuYW1lcyI6WyJLbm4iLCJkYiIsImZwX2lkIiwiZmVhdHVyZXMiLCJwb2ludHMiLCJrIiwiY2IiLCJjYWNoZSIsImZlYXR1cmVLZXlzIiwiT2JqZWN0Iiwia2V5cyIsImZlYXR1cmVLZXlzTGVuZ3RoIiwibGVuZ3RoIiwiY29vcmRzIiwiY29vcmRzTGVuZ3RoIiwia25uIiwiaSIsImNvb3JkIiwidW5kZWZpbmVkIiwic3BsaXQiLCJ4IiwieSIsInhfeSIsIk51bWJlciIsImRpc3RhbmNlIiwiaiIsImZlYXR1cmUiLCJ0ZXN0VmFsdWUiLCJnZXRGZWF0dXJlVmFsdWUiLCJNYXRoIiwicG93IiwiYWJzIiwibWFwIiwia2V5Iiwib2JqIiwic3FydCIsInNvcnQiLCJhIiwiYiIsInNwbGljZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7SUFFTUEsRztBQUVGLGlCQUFZQyxFQUFaLEVBQW9CQyxLQUFwQixFQUFrQztBQUFBOztBQUM5QixhQUFLRCxFQUFMLEdBQVVBLEVBQVY7QUFDQSxhQUFLQyxLQUFMLEdBQWFBLEtBQWI7QUFDSDs7OztxQ0FFWUMsUSxFQUFVQyxNLEVBQVFDLEMsRUFBR0MsRSxFQUFHO0FBQ2pDLGlCQUFLSCxRQUFMLEdBQWdCQSxRQUFoQjtBQUNBLGdCQUFNSSxRQUFRSCxNQUFkOztBQUVBLGdCQUFNSSxjQUFjQyxPQUFPQyxJQUFQLENBQVksS0FBS1AsUUFBakIsQ0FBcEI7QUFDQSxnQkFBTVEsb0JBQW9CSCxZQUFZSSxNQUF0QztBQUNBLGdCQUFNQyxTQUFTSixPQUFPQyxJQUFQLENBQVlILEtBQVosQ0FBZjtBQUNBLGdCQUFNTyxlQUFlRCxPQUFPRCxNQUE1Qjs7QUFFQSxnQkFBSUcsTUFBTSxFQUFWOztBQUVBLGlCQUFJLElBQUlDLElBQUksQ0FBWixFQUFlQSxJQUFJRixZQUFuQixFQUFpQ0UsR0FBakMsRUFBcUM7QUFDakMsb0JBQUlDLFFBQVFKLE9BQU9HLENBQVAsQ0FBWjtBQUNBLG9CQUFHRCxJQUFJRSxLQUFKLE1BQWVDLFNBQWxCLEVBQTRCO0FBQUEsdUNBQ1hELE1BQU1FLEtBQU4sQ0FBWSxHQUFaLENBRFc7QUFBQTtBQUFBLHdCQUNuQkMsQ0FEbUI7QUFBQSx3QkFDaEJDLENBRGdCOztBQUV4Qk4sd0JBQUlFLEtBQUosSUFBYTtBQUNUSyw2QkFBS0wsS0FESTtBQUVURywyQkFBR0csT0FBT0gsQ0FBUCxDQUZNO0FBR1RDLDJCQUFHRSxPQUFPRixDQUFQLENBSE07QUFJVEcsa0NBQVU7QUFKRCxxQkFBYjtBQU1IO0FBQ0QscUJBQUksSUFBSUMsSUFBSSxDQUFaLEVBQWVBLElBQUlkLGlCQUFuQixFQUFzQ2MsR0FBdEMsRUFBMEM7QUFDdEMsd0JBQUlDLFVBQVVsQixZQUFZaUIsQ0FBWixDQUFkO0FBQ0Esd0JBQUlFLFlBQVksS0FBSzFCLEVBQUwsQ0FBUTJCLGVBQVIsQ0FBd0IsS0FBSzFCLEtBQTdCLEVBQW9DZSxLQUFwQyxFQUEyQ1MsT0FBM0MsQ0FBaEI7QUFDQSx3QkFBR0MsU0FBSCxFQUFhO0FBQ1RaLDRCQUFJRSxLQUFKLEVBQVdPLFFBQVgsSUFBdUJLLEtBQUtDLEdBQUwsQ0FBU0QsS0FBS0UsR0FBTCxDQUFTSixZQUFZLEtBQUt4QixRQUFMLENBQWN1QixPQUFkLENBQXJCLENBQVQsRUFBdUQsQ0FBdkQsQ0FBdkI7QUFDSDtBQUNKO0FBQ0o7O0FBRURYLGtCQUFNTixPQUNEQyxJQURDLENBQ0lLLEdBREosRUFFRGlCLEdBRkMsQ0FFRyxVQUFDQyxHQUFELEVBQVM7QUFDVixvQkFBSUMsTUFBTW5CLElBQUlrQixHQUFKLENBQVY7QUFDQUMsb0JBQUlWLFFBQUosR0FBZUssS0FBS00sSUFBTCxDQUFVRCxJQUFJVixRQUFkLENBQWY7QUFDQSx1QkFBT1QsSUFBSWtCLEdBQUosQ0FBUDtBQUNILGFBTkMsQ0FBTjtBQU9BbEIsa0JBQU1BLElBQUlxQixJQUFKLENBQVMsVUFBQ0MsQ0FBRCxFQUFJQyxDQUFKLEVBQVU7QUFDckIsb0JBQUdELEVBQUViLFFBQUYsR0FBYWMsRUFBRWQsUUFBbEIsRUFBMkI7QUFDdkIsMkJBQU8sQ0FBUDtBQUNILGlCQUZELE1BRU0sSUFBR2MsRUFBRWQsUUFBRixHQUFhYSxFQUFFYixRQUFsQixFQUEyQjtBQUM3QiwyQkFBTyxDQUFDLENBQVI7QUFDSDtBQUNELHVCQUFPLENBQVA7QUFDSCxhQVBLLENBQU47QUFRQVQsa0JBQU1BLElBQUl3QixNQUFKLENBQVcsQ0FBWCxFQUFjbEMsQ0FBZCxDQUFOO0FBQ0FDLGVBQUdTLEdBQUg7QUFDSDs7Ozs7O2tCQUdVZixHIiwiZmlsZSI6Iktubi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBEYiBmcm9tICcuL0RiJztcbmltcG9ydCBMb2cgZnJvbSAnLi9Mb2cnO1xuaW1wb3J0IEZlYXR1cmVzIGZyb20gJy4vRmVhdHVyZXMnO1xuXG5jbGFzcyBLbm4gIHtcblxuICAgIGNvbnN0cnVjdG9yKGRiOiBEYiwgZnBfaWQ6IHN0cmluZyl7XG4gICAgICAgIHRoaXMuZGIgPSBkYjtcbiAgICAgICAgdGhpcy5mcF9pZCA9IGZwX2lkO1xuICAgIH1cblxuICAgIGdldE5laWdoYm9ycyhmZWF0dXJlcywgcG9pbnRzLCBrLCBjYil7XG4gICAgICAgIHRoaXMuZmVhdHVyZXMgPSBmZWF0dXJlcztcbiAgICAgICAgY29uc3QgY2FjaGUgPSBwb2ludHM7XG5cbiAgICAgICAgY29uc3QgZmVhdHVyZUtleXMgPSBPYmplY3Qua2V5cyh0aGlzLmZlYXR1cmVzKTtcbiAgICAgICAgY29uc3QgZmVhdHVyZUtleXNMZW5ndGggPSBmZWF0dXJlS2V5cy5sZW5ndGg7XG4gICAgICAgIGNvbnN0IGNvb3JkcyA9IE9iamVjdC5rZXlzKGNhY2hlKTtcbiAgICAgICAgY29uc3QgY29vcmRzTGVuZ3RoID0gY29vcmRzLmxlbmd0aDtcblxuICAgICAgICBsZXQga25uID0ge307XG5cbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IGNvb3Jkc0xlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGxldCBjb29yZCA9IGNvb3Jkc1tpXTtcbiAgICAgICAgICAgIGlmKGtubltjb29yZF0gPT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICAgICAgbGV0IFt4LCB5XSA9IGNvb3JkLnNwbGl0KFwiX1wiKTtcbiAgICAgICAgICAgICAgICBrbm5bY29vcmRdID0ge1xuICAgICAgICAgICAgICAgICAgICB4X3k6IGNvb3JkLFxuICAgICAgICAgICAgICAgICAgICB4OiBOdW1iZXIoeCksXG4gICAgICAgICAgICAgICAgICAgIHk6IE51bWJlcih5KSxcbiAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2U6IDBcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yKGxldCBqID0gMDsgaiA8IGZlYXR1cmVLZXlzTGVuZ3RoOyBqKyspe1xuICAgICAgICAgICAgICAgIGxldCBmZWF0dXJlID0gZmVhdHVyZUtleXNbal07XG4gICAgICAgICAgICAgICAgbGV0IHRlc3RWYWx1ZSA9IHRoaXMuZGIuZ2V0RmVhdHVyZVZhbHVlKHRoaXMuZnBfaWQsIGNvb3JkLCBmZWF0dXJlKTtcbiAgICAgICAgICAgICAgICBpZih0ZXN0VmFsdWUpe1xuICAgICAgICAgICAgICAgICAgICBrbm5bY29vcmRdLmRpc3RhbmNlICs9IE1hdGgucG93KE1hdGguYWJzKHRlc3RWYWx1ZSAtIHRoaXMuZmVhdHVyZXNbZmVhdHVyZV0pLCAyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBrbm4gPSBPYmplY3RcbiAgICAgICAgICAgIC5rZXlzKGtubilcbiAgICAgICAgICAgIC5tYXAoKGtleSkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBvYmogPSBrbm5ba2V5XTtcbiAgICAgICAgICAgICAgICBvYmouZGlzdGFuY2UgPSBNYXRoLnNxcnQob2JqLmRpc3RhbmNlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ga25uW2tleV07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAga25uID0ga25uLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICAgIGlmKGEuZGlzdGFuY2UgPiBiLmRpc3RhbmNlKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIH1lbHNlIGlmKGIuZGlzdGFuY2UgPiBhLmRpc3RhbmNlKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfSk7XG4gICAgICAgIGtubiA9IGtubi5zcGxpY2UoMCwgayk7XG4gICAgICAgIGNiKGtubik7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBLbm47Il19
//# sourceMappingURL=Knn.js.map
