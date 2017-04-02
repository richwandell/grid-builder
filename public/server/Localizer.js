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
        key: 'start',
        value: function start() {
            var _this = this;

            scanner.scan(function (err, networks) {
                if (err) {
                    console.error(err);
                    return;
                }

                var rows = networks.map(function (net) {
                    return { ap_id: net.mac, value: net.rssi };
                });

                console.log(rows);

                var data = {
                    action: "action",
                    fp_id: "336c6582c283421c28479e8801e8edfa",
                    ap_ids: rows,
                    device_id: _this.id,
                    type: "COMPUTER"
                };

                console.log(data);
                request({
                    url: 'http://localhost:8888/rest/localize',
                    json: true,
                    method: "POST",
                    body: data
                }, function (error, res, body) {
                    console.log(error, res, body);
                    setTimeout(function () {
                        _this.start();
                    }, 2000);
                });
            });
        }
    }]);

    return Localizer;
}();

var l = new Localizer();
l.start();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvTG9jYWxpemVyLmVzNiJdLCJuYW1lcyI6WyJwanNvbiIsInJlcXVpcmUiLCJzY2FubmVyIiwidXVpZCIsImh0dHAiLCJmcyIsInJlcXVlc3QiLCJMb2NhbGl6ZXIiLCJpZCIsInY0Iiwib2xkVVVJRCIsInJlYWRGaWxlU3luYyIsImUiLCJ3cml0ZUZpbGVTeW5jIiwic2NhbiIsImVyciIsIm5ldHdvcmtzIiwiY29uc29sZSIsImVycm9yIiwicm93cyIsIm1hcCIsIm5ldCIsImFwX2lkIiwibWFjIiwidmFsdWUiLCJyc3NpIiwibG9nIiwiZGF0YSIsImFjdGlvbiIsImZwX2lkIiwiYXBfaWRzIiwiZGV2aWNlX2lkIiwidHlwZSIsInVybCIsImpzb24iLCJtZXRob2QiLCJib2R5IiwicmVzIiwic2V0VGltZW91dCIsInN0YXJ0IiwibCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsSUFBTUEsUUFBUUMsUUFBUSxvQkFBUixDQUFkO0FBQ0EsSUFBTUMsVUFBVUQsUUFBUSxtQkFBUixDQUFoQjtBQUNBLElBQU1FLE9BQU9GLFFBQVEsTUFBUixDQUFiO0FBQ0EsSUFBTUcsT0FBT0gsUUFBUSxNQUFSLENBQWI7QUFDQSxJQUFNSSxLQUFLSixRQUFRLElBQVIsQ0FBWDtBQUNBLElBQU1LLFVBQVVMLFFBQVEsU0FBUixDQUFoQjs7SUFFTU0sUztBQUNGLHlCQUFhO0FBQUE7O0FBQ1QsYUFBS0MsRUFBTCxHQUFVTCxLQUFLTSxFQUFMLEVBQVY7QUFDQSxZQUFJO0FBQ0EsZ0JBQUlDLFVBQVVMLEdBQUdNLFlBQUgsQ0FBZ0IsT0FBaEIsRUFBeUIsTUFBekIsQ0FBZDtBQUNBLGlCQUFLSCxFQUFMLEdBQVVFLE9BQVY7QUFDSCxTQUhELENBR0MsT0FBTUUsQ0FBTixFQUFRO0FBQ0xQLGVBQUdRLGFBQUgsQ0FBaUIsT0FBakIsRUFBMEIsS0FBS0wsRUFBL0I7QUFDSDtBQUNKOzs7O2dDQUVNO0FBQUE7O0FBQ0hOLG9CQUFRWSxJQUFSLENBQWEsVUFBQ0MsR0FBRCxFQUFNQyxRQUFOLEVBQW1CO0FBQzVCLG9CQUFJRCxHQUFKLEVBQVM7QUFDTEUsNEJBQVFDLEtBQVIsQ0FBY0gsR0FBZDtBQUNBO0FBQ0g7O0FBRUQsb0JBQU1JLE9BQU9ILFNBQVNJLEdBQVQsQ0FBYSxVQUFDQyxHQUFELEVBQVM7QUFDL0IsMkJBQU8sRUFBQ0MsT0FBT0QsSUFBSUUsR0FBWixFQUFpQkMsT0FBT0gsSUFBSUksSUFBNUIsRUFBUDtBQUNILGlCQUZZLENBQWI7O0FBSUFSLHdCQUFRUyxHQUFSLENBQVlQLElBQVo7O0FBRUEsb0JBQU1RLE9BQU87QUFDVEMsNEJBQVEsUUFEQztBQUVUQywyQkFBTyxrQ0FGRTtBQUdUQyw0QkFBUVgsSUFIQztBQUlUWSwrQkFBVyxNQUFLdkIsRUFKUDtBQUtUd0IsMEJBQU07QUFMRyxpQkFBYjs7QUFRQWYsd0JBQVFTLEdBQVIsQ0FBWUMsSUFBWjtBQUNBckIsd0JBQVE7QUFDSjJCLHlCQUFLLHFDQUREO0FBRUpDLDBCQUFNLElBRkY7QUFHSkMsNEJBQVEsTUFISjtBQUlKQywwQkFBTVQ7QUFKRixpQkFBUixFQUtHLFVBQUNULEtBQUQsRUFBUW1CLEdBQVIsRUFBYUQsSUFBYixFQUFzQjtBQUNyQm5CLDRCQUFRUyxHQUFSLENBQVlSLEtBQVosRUFBbUJtQixHQUFuQixFQUF3QkQsSUFBeEI7QUFDQUUsK0JBQVcsWUFBSztBQUNaLDhCQUFLQyxLQUFMO0FBQ0gscUJBRkQsRUFFRyxJQUZIO0FBR0gsaUJBVkQ7QUFXSCxhQWhDRDtBQWlDSDs7Ozs7O0FBR0wsSUFBTUMsSUFBSSxJQUFJakMsU0FBSixFQUFWO0FBQ0FpQyxFQUFFRCxLQUFGIiwiZmlsZSI6IkxvY2FsaXplci5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHBqc29uID0gcmVxdWlyZSgnLi4vLi4vcGFja2FnZS5qc29uJyk7XG5jb25zdCBzY2FubmVyID0gcmVxdWlyZSgnbm9kZS13aWZpLXNjYW5uZXInKTtcbmNvbnN0IHV1aWQgPSByZXF1aXJlKCd1dWlkJyk7XG5jb25zdCBodHRwID0gcmVxdWlyZSgnaHR0cCcpO1xuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuY29uc3QgcmVxdWVzdCA9IHJlcXVpcmUoJ3JlcXVlc3QnKTtcblxuY2xhc3MgTG9jYWxpemVyIHtcbiAgICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgICB0aGlzLmlkID0gdXVpZC52NCgpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IG9sZFVVSUQgPSBmcy5yZWFkRmlsZVN5bmMoXCIudXVpZFwiLCBcInV0ZjhcIik7XG4gICAgICAgICAgICB0aGlzLmlkID0gb2xkVVVJRDtcbiAgICAgICAgfWNhdGNoKGUpe1xuICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhcIi51dWlkXCIsIHRoaXMuaWQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhcnQoKXtcbiAgICAgICAgc2Nhbm5lci5zY2FuKChlcnIsIG5ldHdvcmtzKSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3Qgcm93cyA9IG5ldHdvcmtzLm1hcCgobmV0KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHthcF9pZDogbmV0Lm1hYywgdmFsdWU6IG5ldC5yc3NpfTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyb3dzKTtcblxuICAgICAgICAgICAgY29uc3QgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICBhY3Rpb246IFwiYWN0aW9uXCIsXG4gICAgICAgICAgICAgICAgZnBfaWQ6IFwiMzM2YzY1ODJjMjgzNDIxYzI4NDc5ZTg4MDFlOGVkZmFcIixcbiAgICAgICAgICAgICAgICBhcF9pZHM6IHJvd3MsXG4gICAgICAgICAgICAgICAgZGV2aWNlX2lkOiB0aGlzLmlkLFxuICAgICAgICAgICAgICAgIHR5cGU6IFwiQ09NUFVURVJcIlxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XG4gICAgICAgICAgICByZXF1ZXN0KHtcbiAgICAgICAgICAgICAgICB1cmw6ICdodHRwOi8vbG9jYWxob3N0Ojg4ODgvcmVzdC9sb2NhbGl6ZScsXG4gICAgICAgICAgICAgICAganNvbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICAgICAgICAgIGJvZHk6IGRhdGFcbiAgICAgICAgICAgIH0sIChlcnJvciwgcmVzLCBib2R5KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IsIHJlcywgYm9keSk7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKT0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGFydCgpO1xuICAgICAgICAgICAgICAgIH0sIDIwMDApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuY29uc3QgbCA9IG5ldyBMb2NhbGl6ZXIoKTtcbmwuc3RhcnQoKTsiXX0=
//# sourceMappingURL=Localizer.js.map
