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

            request({
                url: 'http://localhost:8888/rest/localize',
                json: true,
                method: "POST",
                body: data
            }, function (error, res, body) {
                _this.start(rows);
                // setTimeout(() => {
                //     this.start(rows);
                // }, 500);
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
                _this2.send(rows);
            });
        }
    }]);

    return Localizer;
}();

var l = new Localizer();
l.start();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvTG9jYWxpemVyLmVzNiJdLCJuYW1lcyI6WyJwanNvbiIsInJlcXVpcmUiLCJzY2FubmVyIiwidXVpZCIsImh0dHAiLCJmcyIsInJlcXVlc3QiLCJMb2NhbGl6ZXIiLCJpZCIsInY0Iiwib2xkVVVJRCIsInJlYWRGaWxlU3luYyIsImUiLCJ3cml0ZUZpbGVTeW5jIiwicm93cyIsImRhdGEiLCJhY3Rpb24iLCJmcF9pZCIsImFwX2lkcyIsImRldmljZV9pZCIsInR5cGUiLCJ1cmwiLCJqc29uIiwibWV0aG9kIiwiYm9keSIsImVycm9yIiwicmVzIiwic3RhcnQiLCJzY2FuIiwiZXJyIiwibmV0d29ya3MiLCJjb25zb2xlIiwibWFwIiwibmV0IiwiYXBfaWQiLCJtYWMiLCJ2YWx1ZSIsInJzc2kiLCJzZW5kIiwibCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsSUFBTUEsUUFBUUMsUUFBUSxvQkFBUixDQUFkO0FBQ0EsSUFBTUMsVUFBVUQsUUFBUSxtQkFBUixDQUFoQjtBQUNBLElBQU1FLE9BQU9GLFFBQVEsTUFBUixDQUFiO0FBQ0EsSUFBTUcsT0FBT0gsUUFBUSxNQUFSLENBQWI7QUFDQSxJQUFNSSxLQUFLSixRQUFRLElBQVIsQ0FBWDtBQUNBLElBQU1LLFVBQVVMLFFBQVEsU0FBUixDQUFoQjs7SUFFTU0sUztBQUVGLHlCQUFhO0FBQUE7O0FBQ1QsYUFBS0MsRUFBTCxHQUFVTCxLQUFLTSxFQUFMLEVBQVY7QUFDQSxZQUFJO0FBQ0EsZ0JBQUlDLFVBQVVMLEdBQUdNLFlBQUgsQ0FBZ0IsT0FBaEIsRUFBeUIsTUFBekIsQ0FBZDtBQUNBLGlCQUFLSCxFQUFMLEdBQVVFLE9BQVY7QUFDSCxTQUhELENBR0MsT0FBTUUsQ0FBTixFQUFRO0FBQ0xQLGVBQUdRLGFBQUgsQ0FBaUIsT0FBakIsRUFBMEIsS0FBS0wsRUFBL0I7QUFDSDtBQUNKOzs7OzZCQUVJTSxJLEVBQUs7QUFBQTs7QUFDTixnQkFBTUMsT0FBTztBQUNUQyx3QkFBUSxRQURDO0FBRVRDLHVCQUFPLGtDQUZFO0FBR1RDLHdCQUFRSixJQUhDO0FBSVRLLDJCQUFXLEtBQUtYLEVBSlA7QUFLVFksc0JBQU07QUFMRyxhQUFiOztBQVNBZCxvQkFBUTtBQUNKZSxxQkFBSyxxQ0FERDtBQUVKQyxzQkFBTSxJQUZGO0FBR0pDLHdCQUFRLE1BSEo7QUFJSkMsc0JBQU1UO0FBSkYsYUFBUixFQUtHLFVBQUNVLEtBQUQsRUFBUUMsR0FBUixFQUFhRixJQUFiLEVBQXNCO0FBQ3JCLHNCQUFLRyxLQUFMLENBQVdiLElBQVg7QUFDQTtBQUNBO0FBQ0E7QUFDSCxhQVZEO0FBV0g7OztnQ0FFTTtBQUFBOztBQUNIWixvQkFBUTBCLElBQVIsQ0FBYSxVQUFDQyxHQUFELEVBQU1DLFFBQU4sRUFBbUI7QUFDNUIsb0JBQUlELEdBQUosRUFBUztBQUNMRSw0QkFBUU4sS0FBUixDQUFjSSxHQUFkO0FBQ0E7QUFDSDs7QUFFRCxvQkFBTWYsT0FBT2dCLFNBQVNFLEdBQVQsQ0FBYSxVQUFDQyxHQUFELEVBQVM7QUFDL0IsMkJBQU8sRUFBQ0MsT0FBT0QsSUFBSUUsR0FBWixFQUFpQkMsT0FBT0gsSUFBSUksSUFBNUIsRUFBUDtBQUNILGlCQUZZLENBQWI7QUFHQSx1QkFBS0MsSUFBTCxDQUFVeEIsSUFBVjtBQUNILGFBVkQ7QUFXSDs7Ozs7O0FBR0wsSUFBTXlCLElBQUksSUFBSWhDLFNBQUosRUFBVjtBQUNBZ0MsRUFBRVosS0FBRiIsImZpbGUiOiJMb2NhbGl6ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBwanNvbiA9IHJlcXVpcmUoJy4uLy4uL3BhY2thZ2UuanNvbicpO1xuY29uc3Qgc2Nhbm5lciA9IHJlcXVpcmUoJ25vZGUtd2lmaS1zY2FubmVyJyk7XG5jb25zdCB1dWlkID0gcmVxdWlyZSgndXVpZCcpO1xuY29uc3QgaHR0cCA9IHJlcXVpcmUoJ2h0dHAnKTtcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmNvbnN0IHJlcXVlc3QgPSByZXF1aXJlKCdyZXF1ZXN0Jyk7XG5cbmNsYXNzIExvY2FsaXplciB7XG5cbiAgICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgICB0aGlzLmlkID0gdXVpZC52NCgpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IG9sZFVVSUQgPSBmcy5yZWFkRmlsZVN5bmMoXCIudXVpZFwiLCBcInV0ZjhcIik7XG4gICAgICAgICAgICB0aGlzLmlkID0gb2xkVVVJRDtcbiAgICAgICAgfWNhdGNoKGUpe1xuICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhcIi51dWlkXCIsIHRoaXMuaWQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2VuZChyb3dzKXtcbiAgICAgICAgY29uc3QgZGF0YSA9IHtcbiAgICAgICAgICAgIGFjdGlvbjogXCJhY3Rpb25cIixcbiAgICAgICAgICAgIGZwX2lkOiBcIjMzNmM2NTgyYzI4MzQyMWMyODQ3OWU4ODAxZThlZGZhXCIsXG4gICAgICAgICAgICBhcF9pZHM6IHJvd3MsXG4gICAgICAgICAgICBkZXZpY2VfaWQ6IHRoaXMuaWQsXG4gICAgICAgICAgICB0eXBlOiBcIkNPTVBVVEVSXCJcbiAgICAgICAgfTtcblxuXG4gICAgICAgIHJlcXVlc3Qoe1xuICAgICAgICAgICAgdXJsOiAnaHR0cDovL2xvY2FsaG9zdDo4ODg4L3Jlc3QvbG9jYWxpemUnLFxuICAgICAgICAgICAganNvbjogdHJ1ZSxcbiAgICAgICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgICAgICBib2R5OiBkYXRhXG4gICAgICAgIH0sIChlcnJvciwgcmVzLCBib2R5KSA9PiB7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0KHJvd3MpO1xuICAgICAgICAgICAgLy8gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAvLyAgICAgdGhpcy5zdGFydChyb3dzKTtcbiAgICAgICAgICAgIC8vIH0sIDUwMCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHN0YXJ0KCl7XG4gICAgICAgIHNjYW5uZXIuc2NhbigoZXJyLCBuZXR3b3JrcykgPT4ge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHJvd3MgPSBuZXR3b3Jrcy5tYXAoKG5ldCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB7YXBfaWQ6IG5ldC5tYWMsIHZhbHVlOiBuZXQucnNzaX07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuc2VuZChyb3dzKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5jb25zdCBsID0gbmV3IExvY2FsaXplcigpO1xubC5zdGFydCgpOyJdfQ==
//# sourceMappingURL=Localizer.js.map
