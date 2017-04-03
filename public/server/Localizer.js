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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvTG9jYWxpemVyLmVzNiJdLCJuYW1lcyI6WyJwanNvbiIsInJlcXVpcmUiLCJzY2FubmVyIiwidXVpZCIsImh0dHAiLCJmcyIsInJlcXVlc3QiLCJMb2NhbGl6ZXIiLCJpZCIsInY0Iiwib2xkVVVJRCIsInJlYWRGaWxlU3luYyIsImUiLCJ3cml0ZUZpbGVTeW5jIiwicm93cyIsImRhdGEiLCJhY3Rpb24iLCJmcF9pZCIsImFwX2lkcyIsImRldmljZV9pZCIsInR5cGUiLCJ1cmwiLCJqc29uIiwibWV0aG9kIiwiYm9keSIsImVycm9yIiwicmVzIiwic3RhcnQiLCJzY2FuIiwiZXJyIiwibmV0d29ya3MiLCJjb25zb2xlIiwibWFwIiwibmV0IiwiYXBfaWQiLCJtYWMiLCJ2YWx1ZSIsInJzc2kiLCJzZW5kIiwibCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsSUFBTUEsUUFBUUMsUUFBUSxvQkFBUixDQUFkO0FBQ0EsSUFBTUMsVUFBVUQsUUFBUSxtQkFBUixDQUFoQjtBQUNBLElBQU1FLE9BQU9GLFFBQVEsTUFBUixDQUFiO0FBQ0EsSUFBTUcsT0FBT0gsUUFBUSxNQUFSLENBQWI7QUFDQSxJQUFNSSxLQUFLSixRQUFRLElBQVIsQ0FBWDtBQUNBLElBQU1LLFVBQVVMLFFBQVEsU0FBUixDQUFoQjs7SUFFTU0sUztBQUNGLHlCQUFhO0FBQUE7O0FBQ1QsYUFBS0MsRUFBTCxHQUFVTCxLQUFLTSxFQUFMLEVBQVY7QUFDQSxZQUFJO0FBQ0EsZ0JBQUlDLFVBQVVMLEdBQUdNLFlBQUgsQ0FBZ0IsT0FBaEIsRUFBeUIsTUFBekIsQ0FBZDtBQUNBLGlCQUFLSCxFQUFMLEdBQVVFLE9BQVY7QUFDSCxTQUhELENBR0MsT0FBTUUsQ0FBTixFQUFRO0FBQ0xQLGVBQUdRLGFBQUgsQ0FBaUIsT0FBakIsRUFBMEIsS0FBS0wsRUFBL0I7QUFDSDtBQUNKOzs7OzZCQUVJTSxJLEVBQUs7QUFBQTs7QUFDTixnQkFBTUMsT0FBTztBQUNUQyx3QkFBUSxRQURDO0FBRVRDLHVCQUFPLGtDQUZFO0FBR1RDLHdCQUFRSixJQUhDO0FBSVRLLDJCQUFXLEtBQUtYLEVBSlA7QUFLVFksc0JBQU07QUFMRyxhQUFiOztBQVNBZCxvQkFBUTtBQUNKZSxxQkFBSyxxQ0FERDtBQUVKQyxzQkFBTSxJQUZGO0FBR0pDLHdCQUFRLE1BSEo7QUFJSkMsc0JBQU1UO0FBSkYsYUFBUixFQUtHLFVBQUNVLEtBQUQsRUFBUUMsR0FBUixFQUFhRixJQUFiLEVBQXNCO0FBQ3JCLHNCQUFLRyxLQUFMLENBQVdiLElBQVg7QUFDQTtBQUNBO0FBQ0E7QUFDSCxhQVZEO0FBV0g7OztnQ0FFTTtBQUFBOztBQUNIWixvQkFBUTBCLElBQVIsQ0FBYSxVQUFDQyxHQUFELEVBQU1DLFFBQU4sRUFBbUI7QUFDNUIsb0JBQUlELEdBQUosRUFBUztBQUNMRSw0QkFBUU4sS0FBUixDQUFjSSxHQUFkO0FBQ0E7QUFDSDs7QUFFRCxvQkFBTWYsT0FBT2dCLFNBQVNFLEdBQVQsQ0FBYSxVQUFDQyxHQUFELEVBQVM7QUFDL0IsMkJBQU8sRUFBQ0MsT0FBT0QsSUFBSUUsR0FBWixFQUFpQkMsT0FBT0gsSUFBSUksSUFBNUIsRUFBUDtBQUNILGlCQUZZLENBQWI7QUFHQSx1QkFBS0MsSUFBTCxDQUFVeEIsSUFBVjtBQUNILGFBVkQ7QUFXSDs7Ozs7O0FBR0wsSUFBTXlCLElBQUksSUFBSWhDLFNBQUosRUFBVjtBQUNBZ0MsRUFBRVosS0FBRiIsImZpbGUiOiJMb2NhbGl6ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBwanNvbiA9IHJlcXVpcmUoJy4uLy4uL3BhY2thZ2UuanNvbicpO1xuY29uc3Qgc2Nhbm5lciA9IHJlcXVpcmUoJ25vZGUtd2lmaS1zY2FubmVyJyk7XG5jb25zdCB1dWlkID0gcmVxdWlyZSgndXVpZCcpO1xuY29uc3QgaHR0cCA9IHJlcXVpcmUoJ2h0dHAnKTtcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmNvbnN0IHJlcXVlc3QgPSByZXF1aXJlKCdyZXF1ZXN0Jyk7XG5cbmNsYXNzIExvY2FsaXplciB7XG4gICAgY29uc3RydWN0b3IoKXtcbiAgICAgICAgdGhpcy5pZCA9IHV1aWQudjQoKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCBvbGRVVUlEID0gZnMucmVhZEZpbGVTeW5jKFwiLnV1aWRcIiwgXCJ1dGY4XCIpO1xuICAgICAgICAgICAgdGhpcy5pZCA9IG9sZFVVSUQ7XG4gICAgICAgIH1jYXRjaChlKXtcbiAgICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMoXCIudXVpZFwiLCB0aGlzLmlkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNlbmQocm93cyl7XG4gICAgICAgIGNvbnN0IGRhdGEgPSB7XG4gICAgICAgICAgICBhY3Rpb246IFwiYWN0aW9uXCIsXG4gICAgICAgICAgICBmcF9pZDogXCIzMzZjNjU4MmMyODM0MjFjMjg0NzllODgwMWU4ZWRmYVwiLFxuICAgICAgICAgICAgYXBfaWRzOiByb3dzLFxuICAgICAgICAgICAgZGV2aWNlX2lkOiB0aGlzLmlkLFxuICAgICAgICAgICAgdHlwZTogXCJDT01QVVRFUlwiXG4gICAgICAgIH07XG5cblxuICAgICAgICByZXF1ZXN0KHtcbiAgICAgICAgICAgIHVybDogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODg4OC9yZXN0L2xvY2FsaXplJyxcbiAgICAgICAgICAgIGpzb246IHRydWUsXG4gICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICAgICAgYm9keTogZGF0YVxuICAgICAgICB9LCAoZXJyb3IsIHJlcywgYm9keSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zdGFydChyb3dzKTtcbiAgICAgICAgICAgIC8vIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgLy8gICAgIHRoaXMuc3RhcnQocm93cyk7XG4gICAgICAgICAgICAvLyB9LCA1MDApO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzdGFydCgpe1xuICAgICAgICBzY2FubmVyLnNjYW4oKGVyciwgbmV0d29ya3MpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCByb3dzID0gbmV0d29ya3MubWFwKChuZXQpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge2FwX2lkOiBuZXQubWFjLCB2YWx1ZTogbmV0LnJzc2l9O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLnNlbmQocm93cyk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuY29uc3QgbCA9IG5ldyBMb2NhbGl6ZXIoKTtcbmwuc3RhcnQoKTsiXX0=
//# sourceMappingURL=Localizer.js.map
