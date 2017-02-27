'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Db = require('./Db');

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

new Test();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlRlc3QuZXM2Il0sIm5hbWVzIjpbImZzIiwicmVxdWlyZSIsIlRlc3QiLCJkYXRhYmFzZSIsImRlYnVnIiwiZGIiLCJnZXREYXRhYmFzZSIsInJvd3MiLCJyZWFkRmlsZVN5bmMiLCJzcGxpdCIsImZlYXR1cmVzIiwiZnBfaWQiLCJmb3JFYWNoIiwicm93Iiwicm93MSIsIk1hdGgiLCJhYnMiLCJOdW1iZXIiLCJzdGFydCIsIkRhdGUiLCJnZXRUaW1lIiwiZGF0YSIsImtleXMiLCJPYmplY3QiLCJkb25lIiwia2V5IiwiYWxsIiwicXVlcnlfZ2V0X2ZlYXR1cmVzIiwicmVwbGFjZSIsImVyciIsInB1c2giLCJsZW5ndGgiLCJjbG9zZSIsIm1ha2VHdWVzcyIsImRpc3RhbmNlcyIsImtubiIsImZlYXR1cmUiLCJjb29yZCIsIngiLCJ5IiwicG93IiwiZGlmZiIsInhfeSIsImRpc3RhbmNlIiwic3FydCIsInJlZHVjZSIsImEiLCJiIiwic29ydCIsImNvbnNvbGUiLCJsb2ciLCJlbmQiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTs7Ozs7Ozs7QUFDQSxJQUFNQSxLQUFLQyxRQUFRLElBQVIsQ0FBWDs7SUFFTUMsSTtBQUNGLG9CQUFhO0FBQUE7O0FBQUE7O0FBQ1QsWUFBSUMsV0FBVyxpQkFBTztBQUNsQkMsbUJBQU8saUJBQU0sQ0FBRTtBQURHLFNBQVAsQ0FBZjs7QUFJQSxZQUFJQyxLQUFLRixTQUFTRyxXQUFULEVBQVQ7O0FBRUEsWUFBSUMsT0FBT1AsR0FBR1EsWUFBSCxDQUFnQixZQUFoQixFQUE4QixNQUE5QixFQUFzQ0MsS0FBdEMsQ0FBNEMsSUFBNUMsQ0FBWDs7QUFFQSxZQUFJQyxXQUFXLEVBQWY7O0FBRUEsWUFBSUMsUUFBUSxDQUFaOztBQUVBSixhQUFLSyxPQUFMLENBQWEsVUFBQ0MsR0FBRCxFQUFTO0FBQ2xCQSxrQkFBTUEsSUFBSUosS0FBSixDQUFVLEdBQVYsQ0FBTjtBQUNBLGdCQUFHLE9BQU9JLElBQUksQ0FBSixDQUFQLElBQWtCLFdB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S0FBS2pDLEtBQTVCO0FBQ0g7Ozs7OztBQUlMLElBQUloQixJQUFKIiwiZmlsZSI6IlRlc3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRGIgZnJvbSAnLi9EYic7XG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5cbmNsYXNzIFRlc3Qge1xuICAgIGNvbnN0cnVjdG9yKCl7XG4gICAgICAgIGxldCBkYXRhYmFzZSA9IG5ldyBEYih7XG4gICAgICAgICAgICBkZWJ1ZzogKCkgPT4ge31cbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IGRiID0gZGF0YWJhc2UuZ2V0RGF0YWJhc2UoKTtcblxuICAgICAgICBsZXQgcm93cyA9IGZzLnJlYWRGaWxlU3luYyhcIi4vMS0yOC5jc3ZcIiwgXCJ1dGY4XCIpLnNwbGl0KFwiXFxuXCIpO1xuXG4gICAgICAgIGxldCBmZWF0dXJlcyA9IHt9O1xuXG4gICAgICAgIGxldCBmcF9pZCA9IDA7XG5cbiAgICAgICAgcm93cy5mb3JFYWNoKChyb3cpID0+IHtcbiAgICAgICAgICAgIHJvdyA9IHJvdy5zcGxpdChcIixcIik7XG4gICAgICAgICAgICBpZih0eXBlb2Yocm93WzFdKSA9PSBcInVuZGVmaW5lZFwiKSByZXR1cm47XG5cbiAgICAgICAgICAgIHJvd3MuZm9yRWFjaCgocm93MSkgPT4ge1xuICAgICAgICAgICAgICAgIHJvdzEgPSByb3cxLnNwbGl0KFwiLFwiKTtcbiAgICAgICAgICAgICAgICBpZih0eXBlb2Yocm93MVsxXSkgPT0gXCJ1bmRlZmluZWRcIikgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGZwX2lkID0gcm93WzBdO1xuICAgICAgICAgICAgICAgIGZlYXR1cmVzW3Jvd1sxXSArIHJvdzFbMV1dID0gTWF0aC5hYnMoTnVtYmVyKHJvd1s0XSkgLSBOdW1iZXIocm93MVs0XSkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnN0YXJ0ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgIGxldCBkYXRhID0gW107XG4gICAgICAgIGxldCBrZXlzID0gT2JqZWN0LmtleXMoZmVhdHVyZXMpO1xuICAgICAgICBsZXQgZG9uZSA9IDA7XG5cbiAgICAgICAga2V5cy5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgICAgIGRiLmFsbChEYi5xdWVyeV9nZXRfZmVhdHVyZXMucmVwbGFjZShcIjpmZWF0dXJlX3ZhbHVlOlwiLCBmZWF0dXJlc1trZXldKSwgW2tleSwgZnBfaWRdLCAoZXJyLCByb3dzKSA9PiB7XG4gICAgICAgICAgICAgICAgZGF0YS5wdXNoKHJvd3MpO1xuICAgICAgICAgICAgICAgIGRvbmUrKztcbiAgICAgICAgICAgICAgICBpZihkb25lID49IGtleXMubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICAgICAgZGIuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYWtlR3Vlc3MoZGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG1ha2VHdWVzcyhkYXRhKXtcblxuICAgICAgICBsZXQgZGlzdGFuY2VzID0ge307XG4gICAgICAgIGxldCBrbm4gPSBbXTtcblxuICAgICAgICBkYXRhLmZvckVhY2goKGZlYXR1cmUpID0+IHtcbiAgICAgICAgICAgIGlmKGZlYXR1cmUubGVuZ3RoID09IDApIHJldHVybjtcblxuICAgICAgICAgICAgZmVhdHVyZS5mb3JFYWNoKChjb29yZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKHR5cGVvZihkaXN0YW5jZXNbY29vcmQueCArIFwiX1wiICsgY29vcmQueV0pID09IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICAgICAgICAgICAgICBkaXN0YW5jZXNbY29vcmQueCArIFwiX1wiICsgY29vcmQueV0gPSBbXTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBkaXN0YW5jZXNbY29vcmQueCArIFwiX1wiICsgY29vcmQueV0ucHVzaChNYXRoLnBvdyhjb29yZC5kaWZmLCAyKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCBrZXlzID0gT2JqZWN0LmtleXMoZGlzdGFuY2VzKTtcbiAgICAgICAga2V5cy5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgICAgIGtubi5wdXNoKHtcbiAgICAgICAgICAgICAgICB4X3k6IGtleSxcbiAgICAgICAgICAgICAgICBkaXN0YW5jZTogTWF0aC5zcXJ0KGRpc3RhbmNlc1trZXldLnJlZHVjZSgoYSwgYikgPT4geyByZXR1cm4gYStiOyB9KSlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAga25uLnNvcnQoKGEsIGIpID0+IHsgcmV0dXJuIGEuZGlzdGFuY2UgPiBiLmRpc3RhbmNlOyB9KTtcblxuICAgICAgICBjb25zb2xlLmxvZyhrbm4pO1xuICAgICAgICB0aGlzLmVuZCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmVuZCAtIHRoaXMuc3RhcnQpO1xuICAgIH1cblxufVxuXG5uZXcgVGVzdCgpOyJdfQ==
//# sourceMappingURL=Test.js.map
