'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Db = require('./Db');

var _Db2 = _interopRequireDefault(_Db);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require('fs');
var pjson = require('../package.json');
var Logger = require('./Log.js');

var Test = function () {
    function Test() {
        var _this = this;

        _classCallCheck(this, Test);

        var log = new Logger({
            logfolder: pjson.builder_log_folder,
            filename: "rest.log",
            filesize: 5000000,
            numfiles: 3
        });
        var database = new _Db2.default(log);
        database.createTables();

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

        var data = [];
        var keys = Object.keys(features);
        var done = 0;

        keys.forEach(function (key) {
            db.all(_Db2.default.query_get_features.replace(":feature_value:", features[key]), [key, fp_id], function (err, rows) {
                data.push(rows);
                done++;
                if (done >= keys.length) {
                    console.log(data.length, keys.length);
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
        }
    }]);

    return Test;
}();

new Test();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlRlc3QuZXM2Il0sIm5hbWVzIjpbImZzIiwicmVxdWlyZSIsInBqc29uIiwiTG9nZ2VyIiwiVGVzdCIsImxvZyIsImxvZ2ZvbGRlciIsImJ1aWxkZXJfbG9nX2ZvbGRlciIsImZpbGVuYW1lIiwiZmlsZXNpemUiLCJudW1maWxlcyIsImRhdGFiYXNlIiwiY3JlYXRlVGFibGVzIiwiZGIiLCJnZXREYXRhYmFzZSIsInJvd3MiLCJyZWFkRmlsZVN5bmMiLCJzcGxpdCIsImZlYXR1cmVzIiwiZnBfaWQiLCJmb3JFYWNoIiwicm93Iiwicm93MSIsIk1hdGgiLCJhYnMiLCJOdW1iZXIiLCJkYXRhIiwia2V5cyIsIk9iamVjdCIsImRvbmUiLCJrZXkiLCJhbGwiLCJxdWVyeV9nZXRfZmVhdHVyZXMiLCJyZXBsYWNlIiwiZXJyIiwicHVzaCIsImxlbmd0aCIsImNvbnNvbGUiLCJtYWtlR3Vlc3MiLCJkaXN0YW5jZXMiLCJrbm4iLCJmZWF0dXJlIiwiY29vcmQiLCJ4IiwieSIsInBvdyIsImRpZmYiLCJ4X3kiLCJkaXN0YW5jZSIsInNxcnQiLCJyZWR1Y2UiLCJhIiwiYiIsInNvcnQiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTs7Ozs7Ozs7QUFDQSxJQUFNQSxLQUFLQyxRQUFRLElBQVIsQ0FBWDtBQUNBLElBQU1DLFFBQVFELFFBQVEsaUJBQVIsQ0FBZDtBQUNBLElBQU1FLFNBQVNGLFFBQVEsVUFBUixDQUFmOztJQUVNRyxJO0FBQ0Ysb0JBQWE7QUFBQTs7QUFBQTs7QUFDVCxZQUFJQyxNQUFNLElBQUlGLE1BQUosQ0FBVztBQUNqQkcsdUJBQVdKLE1BQU1LLGtCQURBO0FBRWpCQyxzQkFBVSxVQUZPO0FBR2pCQyxzQkFBVSxPQUhPO0FBSWpCQyxzQkFBVTtBQUpPLFNBQVgsQ0FBVjtBQU1BLFlBQUlDLFdBQVcsaUJBQU9OLEdBQVAsQ0FBZjtBQUNBTSxpQkFBU0MsWUFBVDs7QUFFQSxZQUFJQyxLQUFLRixTQUFTRyxXQUFULEVBQVQ7O0FBRUEsWUFBSUMsT0FBT2Ys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QUlhLElBQUosQ0FBUyxVQUFDRixDQUFELEVBQUlDLENBQUosRUFBVTtBQUFFLHVCQUFPRCxFQUFFSCxRQUFGLEdBQWFJLEVBQUVKLFFBQXRCO0FBQWlDLGFBQXREOztBQUVBWCxvQkFBUWhDLEdBQVIsQ0FBWW1DLEdBQVo7QUFDSDs7Ozs7O0FBSUwsSUFBSXBDLElBQUoiLCJmaWxlIjoiVGVzdC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBEYiBmcm9tICcuL0RiJztcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmNvbnN0IHBqc29uID0gcmVxdWlyZSgnLi4vcGFja2FnZS5qc29uJyk7XG5jb25zdCBMb2dnZXIgPSByZXF1aXJlKCcuL0xvZy5qcycpO1xuXG5jbGFzcyBUZXN0IHtcbiAgICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgICBsZXQgbG9nID0gbmV3IExvZ2dlcih7XG4gICAgICAgICAgICBsb2dmb2xkZXI6IHBqc29uLmJ1aWxkZXJfbG9nX2ZvbGRlcixcbiAgICAgICAgICAgIGZpbGVuYW1lOiBcInJlc3QubG9nXCIsXG4gICAgICAgICAgICBmaWxlc2l6ZTogNTAwMDAwMCxcbiAgICAgICAgICAgIG51bWZpbGVzOiAzXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgZGF0YWJhc2UgPSBuZXcgRGIobG9nKTtcbiAgICAgICAgZGF0YWJhc2UuY3JlYXRlVGFibGVzKCk7XG5cbiAgICAgICAgbGV0IGRiID0gZGF0YWJhc2UuZ2V0RGF0YWJhc2UoKTtcblxuICAgICAgICBsZXQgcm93cyA9IGZzLnJlYWRGaWxlU3luYyhcIi4vMS0yOC5jc3ZcIiwgXCJ1dGY4XCIpLnNwbGl0KFwiXFxuXCIpO1xuXG4gICAgICAgIGxldCBmZWF0dXJlcyA9IHt9O1xuXG4gICAgICAgIGxldCBmcF9pZCA9IDA7XG5cbiAgICAgICAgcm93cy5mb3JFYWNoKChyb3cpID0+IHtcbiAgICAgICAgICAgIHJvdyA9IHJvdy5zcGxpdChcIixcIik7XG4gICAgICAgICAgICBpZih0eXBlb2Yocm93WzFdKSA9PSBcInVuZGVmaW5lZFwiKSByZXR1cm47XG5cbiAgICAgICAgICAgIHJvd3MuZm9yRWFjaCgocm93MSkgPT4ge1xuICAgICAgICAgICAgICAgIHJvdzEgPSByb3cxLnNwbGl0KFwiLFwiKTtcbiAgICAgICAgICAgICAgICBpZih0eXBlb2Yocm93MVsxXSkgPT0gXCJ1bmRlZmluZWRcIikgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGZwX2lkID0gcm93WzBdO1xuICAgICAgICAgICAgICAgIGZlYXR1cmVzW3Jvd1sxXSArIHJvdzFbMV1dID0gTWF0aC5hYnMoTnVtYmVyKHJvd1s0XSkgLSBOdW1iZXIocm93MVs0XSkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBkYXRhID0gW107XG4gICAgICAgIGxldCBrZXlzID0gT2JqZWN0LmtleXMoZmVhdHVyZXMpO1xuICAgICAgICBsZXQgZG9uZSA9IDA7XG5cbiAgICAgICAga2V5cy5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgICAgIGRiLmFsbChEYi5xdWVyeV9nZXRfZmVhdHVyZXMucmVwbGFjZShcIjpmZWF0dXJlX3ZhbHVlOlwiLCBmZWF0dXJlc1trZXldKSwgW2tleSwgZnBfaWRdLCAoZXJyLCByb3dzKSA9PiB7XG4gICAgICAgICAgICAgICAgZGF0YS5wdXNoKHJvd3MpO1xuICAgICAgICAgICAgICAgIGRvbmUrKztcbiAgICAgICAgICAgICAgICBpZihkb25lID49IGtleXMubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YS5sZW5ndGgsIGtleXMubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYWtlR3Vlc3MoZGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG1ha2VHdWVzcyhkYXRhKXtcbiAgICAgICAgbGV0IGRpc3RhbmNlcyA9IHt9O1xuICAgICAgICBsZXQga25uID0gW107XG5cbiAgICAgICAgZGF0YS5mb3JFYWNoKChmZWF0dXJlKSA9PiB7XG4gICAgICAgICAgICBpZihmZWF0dXJlLmxlbmd0aCA9PSAwKSByZXR1cm47XG5cbiAgICAgICAgICAgIGZlYXR1cmUuZm9yRWFjaCgoY29vcmQpID0+IHtcbiAgICAgICAgICAgICAgICBpZih0eXBlb2YoZGlzdGFuY2VzW2Nvb3JkLnggKyBcIl9cIiArIGNvb3JkLnldKSA9PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2VzW2Nvb3JkLnggKyBcIl9cIiArIGNvb3JkLnldID0gW107XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZGlzdGFuY2VzW2Nvb3JkLnggKyBcIl9cIiArIGNvb3JkLnldLnB1c2goTWF0aC5wb3coY29vcmQuZGlmZiwgMikpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzKGRpc3RhbmNlcyk7XG4gICAgICAgIGtleXMuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgICAgICBrbm4ucHVzaCh7XG4gICAgICAgICAgICAgICAgeF95OiBrZXksXG4gICAgICAgICAgICAgICAgZGlzdGFuY2U6IE1hdGguc3FydChkaXN0YW5jZXNba2V5XS5yZWR1Y2UoKGEsIGIpID0+IHsgcmV0dXJuIGErYjsgfSkpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGtubi5zb3J0KChhLCBiKSA9PiB7IHJldHVybiBhLmRpc3RhbmNlID4gYi5kaXN0YW5jZTsgfSk7XG5cbiAgICAgICAgY29uc29sZS5sb2coa25uKTtcbiAgICB9XG5cbn1cblxubmV3IFRlc3QoKTsiXX0=
//# sourceMappingURL=Test.js.map
