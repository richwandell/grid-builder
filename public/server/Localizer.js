'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var pjson = require('../../package.json');
var scanner = require('node-wifi-scanner');
var uuid = require('uuid');
var http = require('http');
var fs = require('fs');
var request = require('request');

var Localizer = function () {
    function Localizer() {
        _classCallCheck(this, Localizer);

        this.id = uuid.v4();
        try {
            var oldUUID = fs.readFileSync(".uuid", "utf8");
            this.id = oldUUID;
        } catch (e) {
            fs.writeFileSync(".uuid", this.id);
        }
    }

    _createClass(Localizer, [{
        key: 'send',
        value: function send(rows) {
            var _this = this;

            var data = {
                action: "action",
                fp_id: "336c6582c283421c28479e8801e8edfa",
                ap_ids: rows,
                device_id: this.id,
                type: "COMPUTER"
            };

            console.time('time');
            request({
                url: 'http://localhost:8888/rest/localize',
                json: true,
                method: "POST",
                body: data
            }, function (error, res, body) {
                console.timeEnd('time');

                _this.send(rows);
            });
        }
    }, {
        key: 'start',
        value: function start() {
            var _this2 = this;

            scanner.scan(function (err, networks) {
                if (err) {
                    console.error(err);
                    return;
                }

                var rows = networks.map(function (net) {
                    return { ap_id: net.mac, value: net.rssi };
                });

                console.log(rows);
                _this2.send(rows);
            });
        }
    }]);

    return Localizer;
}();

var l = new Localizer();
l.start();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvTG9jYWxpemVyLmVzNiJdLCJuYW1lcyI6WyJwanNvbiIsInJlcXVpcmUiLCJzY2FubmVyIiwidXVpZCIsImh0dHAiLCJmcyIsInJlcXVlc3QiLCJMb2NhbGl6ZXIiLCJpZCIsInY0Iiwib2xkVVVJRCIsInJlYWRGaWxlU3luYyIsImUiLCJ3cml0ZUZpbGVTeW5jIiwicm93cyIsImRhdGEiLCJhY3Rpb24iLCJmcF9pZCIsImFwX2lkcyIsImRldmljZV9pZCIsInR5cGUiLCJjb25zb2xlIiwidGltZSIsInVybCIsImpzb24iLCJtZXRob2QiLCJib2R5IiwiZXJyb3IiLCJyZXMiLCJ0aW1lRW5kIiwic2VuZCIsInNjYW4iLCJlcnIiLCJuZXR3b3JrcyIsIm1hcCIsIm5ldCIsImFwX2lkIiwibWFjIiwidmFsdWUiLCJyc3NpIiwibG9nIiwibCIsInN0YXJ0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxJQUFNQSxRQUFRQyxRQUFRLG9CQUFSLENBQWQ7QUFDQSxJQUFNQyxVQUFVRCxRQUFRLG1CQUFSLENBQWhCO0FBQ0EsSUFBTUUsT0FBT0YsUUFBUSxNQUFSLENBQWI7QUFDQSxJQUFNRyxPQUFPSCxRQUFRLE1BQVIsQ0FBYjtBQUNBLElBQU1JLEtBQUtKLFFBQVEsSUFBUixDQUFYO0FBQ0EsSUFBTUssVUFBVUwsUUFBUSxTQUFSLENBQWhCOztJQUVNTSxTO0FBQ0YseUJBQWE7QUFBQTs7QUFDVCxhQUFLQyxFQUFMLEdBQVVMLEtBQUtNLEVBQUwsRUFBVjtBQUNBLFlBQUk7QUFDQSxnQkFBSUMsVUFBVUwsR0FBR00sWUFBSCxDQUFnQixPQUFoQixFQUF5QixNQUF6QixDQUFkO0FBQ0EsaUJBQUtILEVBQUwsR0FBVUUsT0FBVjtBQUNILFNBSEQsQ0FHQyxPQUFNRSxDQUFOLEVBQVE7QUFDTFAsZUFBR1EsYUFBSCxDQUFpQixPQUFqQixFQUEwQixLQUFLTCxFQUEvQjtBQUNIO0FBQ0o7Ozs7NkJBRUlNLEksRUFBSztBQUFBOztBQUdOLGdCQUFNQyxPQUFPO0FBQ1RDLHdCQUFRLFFBREM7QUFFVEMsdUJBQU8sa0NBRkU7QUFHVEMsd0JBQVFKLElBSEM7QUFJVEssMkJBQVcsS0FBS1gsRUFKUDtBQUtUWSxzQkFBTTtBQUxHLGFBQWI7O0FBUUFDLG9CQUFRQyxJQUFSLENBQWEsTUFBYjtBQUNBaEIsb0JBQVE7QUFDSmlCLHFCQUFLLHFDQUREO0FBRUpDLHNCQUFNLElBRkY7QUFHSkMsd0JBQVEsTUFISjtBQUlKQyxzQkFBTVg7QUFKRixhQUFSLEVBS0csVUFBQ1ksS0FBRCxFQUFRQyxHQUFSLEVBQWFGLElBQWIsRUFBc0I7QUFDckJMLHdCQUFRUSxPQUFSLENBQWdCLE1BQWhCOztBQUVBLHNCQUFLQyxJQUFMLENBQVVoQixJQUFWO0FBQ0gsYUFURDtBQVVIOzs7Z0NBRU07QUFBQTs7QUFDSFosb0JBQVE2QixJQUFSLENBQWEsVUFBQ0MsR0FBRCxFQUFNQyxRQUFOLEVBQW1CO0FBQzVCLG9CQUFJRCxHQUFKLEVBQVM7QUFDTFgsNEJBQVFNLEtBQVIsQ0FBY0ssR0FBZDtBQUNBO0FBQ0g7O0FBRUQsb0JBQU1sQixPQUFPbUIsU0FBU0MsR0FBVCxDQUFhLFVBQUNDLEdBQUQsRUFBUztBQUMvQiwyQkFBTyxFQUFDQyxPQUFPRCxJQUFJRSxHQUFaLEVBQWlCQyxPQUFPSCxJQUFJSSxJQUE1QixFQUFQO0FBQ0gsaUJBRlksQ0FBYjs7QUFJQWxCLHdCQUFRbUIsR0FBUixDQUFZMUIsSUFBWjtBQUNBLHVCQUFLZ0IsSUFBTCxDQUFVaEIsSUFBVjtBQUNILGFBWkQ7QUFhSDs7Ozs7O0FBR0wsSUFBTTJCLElBQUksSUFBSWxDLFNBQUosRUFBVjtBQUNBa0MsRUFBRUMsS0FBRiIsImZpbGUiOiJMb2NhbGl6ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBwanNvbiA9IHJlcXVpcmUoJy4uLy4uL3BhY2thZ2UuanNvbicpO1xuY29uc3Qgc2Nhbm5lciA9IHJlcXVpcmUoJ25vZGUtd2lmaS1zY2FubmVyJyk7XG5jb25zdCB1dWlkID0gcmVxdWlyZSgndXVpZCcpO1xuY29uc3QgaHR0cCA9IHJlcXVpcmUoJ2h0dHAnKTtcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmNvbnN0IHJlcXVlc3QgPSByZXF1aXJlKCdyZXF1ZXN0Jyk7XG5cbmNsYXNzIExvY2FsaXplciB7XG4gICAgY29uc3RydWN0b3IoKXtcbiAgICAgICAgdGhpcy5pZCA9IHV1aWQudjQoKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCBvbGRVVUlEID0gZnMucmVhZEZpbGVTeW5jKFwiLnV1aWRcIiwgXCJ1dGY4XCIpO1xuICAgICAgICAgICAgdGhpcy5pZCA9IG9sZFVVSUQ7XG4gICAgICAgIH1jYXRjaChlKXtcbiAgICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMoXCIudXVpZFwiLCB0aGlzLmlkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNlbmQocm93cyl7XG5cblxuICAgICAgICBjb25zdCBkYXRhID0ge1xuICAgICAgICAgICAgYWN0aW9uOiBcImFjdGlvblwiLFxuICAgICAgICAgICAgZnBfaWQ6IFwiMzM2YzY1ODJjMjgzNDIxYzI4NDc5ZTg4MDFlOGVkZmFcIixcbiAgICAgICAgICAgIGFwX2lkczogcm93cyxcbiAgICAgICAgICAgIGRldmljZV9pZDogdGhpcy5pZCxcbiAgICAgICAgICAgIHR5cGU6IFwiQ09NUFVURVJcIlxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnNvbGUudGltZSgndGltZScpO1xuICAgICAgICByZXF1ZXN0KHtcbiAgICAgICAgICAgIHVybDogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODg4OC9yZXN0L2xvY2FsaXplJyxcbiAgICAgICAgICAgIGpzb246IHRydWUsXG4gICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICAgICAgYm9keTogZGF0YVxuICAgICAgICB9LCAoZXJyb3IsIHJlcywgYm9keSkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS50aW1lRW5kKCd0aW1lJyk7XG5cbiAgICAgICAgICAgIHRoaXMuc2VuZChyb3dzKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc3RhcnQoKXtcbiAgICAgICAgc2Nhbm5lci5zY2FuKChlcnIsIG5ldHdvcmtzKSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3Qgcm93cyA9IG5ldHdvcmtzLm1hcCgobmV0KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHthcF9pZDogbmV0Lm1hYywgdmFsdWU6IG5ldC5yc3NpfTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyb3dzKTtcbiAgICAgICAgICAgIHRoaXMuc2VuZChyb3dzKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5jb25zdCBsID0gbmV3IExvY2FsaXplcigpO1xubC5zdGFydCgpOyJdfQ==
//# sourceMappingURL=Localizer.js.map
