'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Knn = require('./Knn');

var _Knn2 = _interopRequireDefault(_Knn);

var _KMeans = require('./KMeans');

var _KMeans2 = _interopRequireDefault(_KMeans);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var express = require('express');
var bodyParser = require('body-parser');
var pjson = require('../../package.json');
var Logger = require('./Log.js');
var Db = require('./Db.js');
var fs = require('fs');
var Utils = require('./Utils.js');
var uuid = require('uuid');
var http = require('http');

/**
 * RestServer class is used to power the rest server that will communicate with the
 * mobile phone on the local wifi network. This server will respond to upnp devices
 * with the device description xml file as well as handle all saving and fetching of data.
 *
 * The rest server uses express.js and listens on a port configured by builder_rest_port
 * parameter in the package.json file within the public folder
 *
 * @author Rich Wandell <richwandell@gmail.com>
 */

var RestServer = function () {
    function RestServer() {
        _classCallCheck(this, RestServer);

        this.id = uuid.v4();
        try {
            var oldUUID = fs.readFileSync(".uuid", "utf8");
            this.id = oldUUID;
        } catch (e) {
            fs.writeFileSync(".uuid", this.id);
        }

        this.log = new Logger({
            logfolder: pjson.builder_log_folder,
            filename: "rest.log",
            filesize: 5000000,
            numfiles: 3
        });
        this.db = new Db(this.log);
        this.app = express();
        this.app.use(bodyParser.json({ limit: '50mb' }));
        this.app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
        this.app.use('/builder', express.static('builder'));
    }

    /**
     * Save handler for saving layout images from the UI
     * @param req
     * @param res
     */


    _createClass(RestServer, [{
        key: 'updateDatabase',
        value: function updateDatabase(req, res) {
            var log = this.log;
            var db = this.db;
            var data = req.body;
            var cleanData = {};
            var error = false;

            log.log("/rest/updateDatabase");
            this.setResponseHeaders(res);

            if (typeof data.layout_images != "undefined") {
                if (data.layout_images.length > 0) {
                    cleanData.layout_images = data.layout_images;
                } else {
                    error = true;
                }
            } else {
                error = true;
            }

            if (!error) {
                db.updateDatabase(cleanData, function (err, rows) {
                    res.send({ success: true });
                });
            } else {
                res.send({ success: false });
            }

            log.log(req.body);
        }

        /**
         * Returns the device description xml file for upnp readers
         * @param req
         * @param res
         */

    }, {
        key: 'getDeviceDescription',
        value: function getDeviceDescription(req, res) {
            var log = this.log;
            var id = this.id;
            log.log("devicedescription.xml");
            fs.readFile('devicedescription.xml', "binary", function (err, file) {
                if (err) {
                    res.header("Content-Type", "text/plain");
                    res.status(500).send(err);
                    return;
                }
                file = file.replace(/\{\{UDN\}\}/, "uuid:" + id);
                file = file.replace(/\{\{END\}\}/, "http://" + Utils.getServerIp() + ":8888/rest/");
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Content-Type", "text/xml");
                res.send(file);
            });
        }

        /**
         * Returns all of the layout image records as a json array
         * @param req
         * @param res
         */

    }, {
        key: 'getFloorplans',
        value: function getFloorplans(req, res) {
            var log = this.log;
            var db = this.db;
            log.log("/rest/floorplans");
            this.setResponseHeaders(res);
            db.getFloorPlans(function (err, rows) {
                rows.forEach(function (row) {
                    if (typeof row.layout_image != "undefined") {
                        row.layout_image = JSON.parse(row.layout_image);
                    }
                });
                res.send(rows);
            });
        }
    }, {
        key: 'getScannedCoords',
        value: function getScannedCoords(req, res) {
            var log = this.log;
            var db = this.db;
            var data = req.params;
            log.log("/rest/getScannedCoords");
            this.setResponseHeaders(res);
            db.getScannedCoords(data.fp_id, function (err, rows) {
                res.send(rows);
            });
        }
    }, {
        key: 'saveReadings',
        value: function saveReadings(req, res) {
            var log = this.log;
            log.log("/rest/saveReadings");
            this.setResponseHeaders(res);
            var data = req.body;
            log.log(data);
            if (typeof data.payload == "undefined") {
                return res.send({ success: false, message: "missing payload" });
            }
            this.db.saveReadings(data.payload);
            res.send({ success: true });
        }
    }, {
        key: 'getLayoutInfo',
        value: function getLayoutInfo(req, res) {
            var log = this.log;
            log.log("/rest/layout_info/all");
            this.setResponseHeaders(res);

            this.db.getLayoutInfo(function (err, rows) {
                res.send({
                    success: true,
                    payload: rows
                });
            });
        }
    }, {
        key: 'setResponseHeaders',
        value: function setResponseHeaders(res) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header('Content-Type', 'application/javascript');
            res.header("Cache-Control", "no-cache");
        }

        /**
         * Routes are defined here and mapped to actions
         */

    }, {
        key: 'startServer',
        value: function startServer() {
            var _this = this;

            var db = this.db;
            var log = this.log;
            var app = this.app;
            db.createTables(log);

            app.post('/rest/localize', function (req, res) {
                log.log('/rest/localize');
                log.log(req.body.ap_ids);
                _this.setResponseHeaders(res);
                var data = req.body;
                var knn = new _Knn2.default(log, db, data.fp_id, data.ap_ids);
                knn.getNeighbors(9, function (knn) {
                    log.log(knn);
                    var cc = new _KMeans2.default(4, knn);
                    res.send({
                        succes: true,
                        knn: knn,
                        clusters: cc[0],
                        centroids: cc[1]
                    });
                });
            });

            app.get('/rest/alive', function (req, res) {
                _this.setResponseHeaders(res);
                res.send({ success: true });
            });

            app.get('/rest/databaseVersion', function (req, res) {
                _this.getDatabaseVersion(req, res);
            });

            app.post('/rest/updateDatabase', function (req, res) {
                _this.updateDatabase(req, res);
            });

            app.get('/devicedescription.xml', function (req, res) {
                _this.getDeviceDescription(req, res);
            });

            app.get("/icon24.png", function (req, res) {
                _this.log.log("icon24.png");
                res.header("Access-Control-Allow-Origin", "*");
                res.sendFile(process.cwd() + '/src/icon24.png');
            });

            app.get("/rest/floorplans", function (req, res) {
                _this.getFloorplans(req, res);
            });

            app.post("/rest/saveReadings", function (req, res) {
                _this.saveReadings(req, res);
            });

            app.get("/rest/getScannedCoords/:fp_id", function (req, res) {
                _this.getScannedCoords(req, res);
            });

            this.server = http.createServer(app);
            this.server.listen(pjson.builder_rest_port);
        }
    }, {
        key: 'getServer',
        value: function getServer() {
            return this.server;
        }
    }, {
        key: 'getLog',
        value: function getLog() {
            return this.log;
        }
    }]);

    return RestServer;
}();

exports.default = RestServer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlc3RTZXJ2ZXIuZXM2Il0sIm5hbWVzIjpbImV4cHJlc3MiLCJyZXF1aXJlIiwiYm9keVBhcnNlciIsInBqc29uIiwiTG9nZ2VyIiwiRGIiLCJmcyIsIlV0aWxzIiwidXVpZCIsImh0dHAiLCJSZXN0U2VydmVyIiwiaWQiLCJ2NCIsIm9sZFVVSUQiLCJyZWFkRmlsZVN5bmMiLCJlIiwid3JpdGVGaWxlU3luYyIsImxvZyIsImxvZ2ZvbGRlciIsImJ1aWxkZXJfbG9nX2ZvbGRlciIsImZpbGVuYW1lIiwiZmlsZXNpemUiLCJudW1maWxlcyIsImRiIiwiYXBwIiwidXNlIiwianNvbiIsImxpbWl0IiwidXJsZW5jb2RlZCIsImV4dGVuZGVkIiwic3RhdGljIiwicmVxIiwicmVzIiwiZGF0YSIsImJvZHkiLCJjbGVhbkRhdGEiLCJlcnJvciIsInNldFJlc3BvbnNlSGVhZGVycyIsImxheW91dF9pbWFnZXMiLCJsZW5ndGgiLCJ1cGRhdGVEYXRhYmFzZSIsImVyciIsInJvd3MiLCJzZW5kIiwic3VjY2VzcyIsInJlYWRGaWxlIiwiZmlsZSIsImhlYWRlciIsInN0YXR1cyIsInJlcGxhY2UiLCJnZXRTZXJ2ZXJJcCIsImdldEZsb29yUGxhbnMiLCJmb3JFYWNoIiwicm93IiwibGF5b3V0X2ltYWdlIiwiSlNPTiIsInBhcnNlIiwicGFyYW1zIiwiZ2V0U2Nhbm5lZENvb3JkcyIsImZwX2lkIiwicGF5bG9hZCIsIm1lc3NhZ2UiLCJzYXZlUmVhZGluZ3MiLCJnZXRMYXlvdXRJbmZvIiwiY3JlYXRlVGFibGVzIiwicG9zdCIsImFwX2lkcyIsImtubiIsImdldE5laWdoYm9ycyIsImNjIiwic3VjY2VzIiwiY2x1c3RlcnMiLCJjZW50cm9pZHMiLCJnZXQiLCJnZXREYXRhYmFzZVZlcnNpb24iLCJnZXREZXZpY2VEZXNjcmlwdGlvbiIsInNlbmRGaWxlIiwicHJvY2VzcyIsImN3ZCIsImdldEZsb29ycGxhbnMiLCJzZXJ2ZXIiLCJjcmVhdGVTZXJ2ZXIiLCJsaXN0ZW4i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Q0FBbUJoRCxHQUFuQixFQUF3QkMsR0FBeEI7QUFDSCxhQUZEOztBQUlBUixnQkFBSXlDLElBQUosQ0FBUyxvQkFBVCxFQUErQixVQUFDbEMsR0FBRCxFQUFNQyxHQUFOLEVBQWM7QUFDekMsc0JBQUs4QixZQUFMLENBQWtCL0IsR0FBbEIsRUFBdUJDLEdBQXZCO0FBQ0gsYUFGRDs7QUFJQVIsZ0JBQUlpRCxHQUFKLENBQVEsK0JBQVIsRUFBeUMsVUFBQzFDLEdBQUQsRUFBTUMsR0FBTixFQUFjO0FBQ25ELHNCQUFLMEIsZ0JBQUwsQ0FBc0IzQixHQUF0QixFQUEyQkMsR0FBM0I7QUFDSCxhQUZEOztBQUlBLGlCQUFLZ0QsTUFBTCxHQUFjdkUsS0FBS3dFLFlBQUwsQ0FBa0J6RCxHQUFsQixDQUFkO0FBQ0EsaUJBQUt3RCxNQUFMLENBQVlFLE1BQVosQ0FBbUIvRSxNQUFNZ0YsaUJBQXpCO0FBQ0g7OztvQ0FFbUI7QUFDaEIsbUJBQU8sS0FBS0gsTUFBWjtBQUNIOzs7aUNBRWE7QUFDVixtQkFBTyxLQUFLL0QsR0FBWjtBQUNIOzs7Ozs7a0JBSVVQLFUiLCJmaWxlIjoiUmVzdFNlcnZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBLbm4gZnJvbSAnLi9Lbm4nO1xuaW1wb3J0IEtNZWFucyBmcm9tICcuL0tNZWFucyc7XG5jb25zdCBleHByZXNzID0gcmVxdWlyZSgnZXhwcmVzcycpO1xuY29uc3QgYm9keVBhcnNlciA9IHJlcXVpcmUoJ2JvZHktcGFyc2VyJyk7XG5jb25zdCBwanNvbiA9IHJlcXVpcmUoJy4uLy4uL3BhY2thZ2UuanNvbicpO1xuY29uc3QgTG9nZ2VyID0gcmVxdWlyZSgnLi9Mb2cuanMnKTtcbmxldCBEYiA9IHJlcXVpcmUoJy4vRGIuanMnKTtcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmNvbnN0IFV0aWxzID0gcmVxdWlyZSgnLi9VdGlscy5qcycpO1xuY29uc3QgdXVpZCA9IHJlcXVpcmUoJ3V1aWQnKTtcbmNvbnN0IGh0dHAgPSByZXF1aXJlKCdodHRwJyk7XG5cblxuLyoqXG4gKiBSZXN0U2VydmVyIGNsYXNzIGlzIHVzZWQgdG8gcG93ZXIgdGhlIHJlc3Qgc2VydmVyIHRoYXQgd2lsbCBjb21tdW5pY2F0ZSB3aXRoIHRoZVxuICogbW9iaWxlIHBob25lIG9uIHRoZSBsb2NhbCB3aWZpIG5ldHdvcmsuIFRoaXMgc2VydmVyIHdpbGwgcmVzcG9uZCB0byB1cG5wIGRldmljZXNcbiAqIHdpdGggdGhlIGRldmljZSBkZXNjcmlwdGlvbiB4bWwgZmlsZSBhcyB3ZWxsIGFzIGhhbmRsZSBhbGwgc2F2aW5nIGFuZCBmZXRjaGluZyBvZiBkYXRhLlxuICpcbiAqIFRoZSByZXN0IHNlcnZlciB1c2VzIGV4cHJlc3MuanMgYW5kIGxpc3RlbnMgb24gYSBwb3J0IGNvbmZpZ3VyZWQgYnkgYnVpbGRlcl9yZXN0X3BvcnRcbiAqIHBhcmFtZXRlciBpbiB0aGUgcGFja2FnZS5qc29uIGZpbGUgd2l0aGluIHRoZSBwdWJsaWMgZm9sZGVyXG4gKlxuICogQGF1dGhvciBSaWNoIFdhbmRlbGwgPHJpY2h3YW5kZWxsQGdtYWlsLmNvbT5cbiAqL1xuY2xhc3MgUmVzdFNlcnZlcntcblxuICAgIGNvbnN0cnVjdG9yKCl7XG4gICAgICAgIHRoaXMuaWQgPSB1dWlkLnY0KCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgb2xkVVVJRCA9IGZzLnJlYWRGaWxlU3luYyhcIi51dWlkXCIsIFwidXRmOFwiKTtcbiAgICAgICAgICAgIHRoaXMuaWQgPSBvbGRVVUlEO1xuICAgICAgICB9Y2F0Y2goZSl7XG4gICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKFwiLnV1aWRcIiwgdGhpcy5pZCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxvZyA9IG5ldyBMb2dnZXIoe1xuICAgICAgICAgICAgbG9nZm9sZGVyOiBwanNvbi5idWlsZGVyX2xvZ19mb2xkZXIsXG4gICAgICAgICAgICBmaWxlbmFtZTogXCJyZXN0LmxvZ1wiLFxuICAgICAgICAgICAgZmlsZXNpemU6IDUwMDAwMDAsXG4gICAgICAgICAgICBudW1maWxlczogM1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5kYiA9IG5ldyBEYih0aGlzLmxvZyk7XG4gICAgICAgIHRoaXMuYXBwID0gZXhwcmVzcygpO1xuICAgICAgICB0aGlzLmFwcC51c2UoYm9keVBhcnNlci5qc29uKHtsaW1pdDogJzUwbWInfSkpO1xuICAgICAgICB0aGlzLmFwcC51c2UoYm9keVBhcnNlci51cmxlbmNvZGVkKHsgZXh0ZW5kZWQ6IHRydWUsIGxpbWl0OiAnNTBtYicgfSkpO1xuICAgICAgICB0aGlzLmFwcC51c2UoJy9idWlsZGVyJywgZXhwcmVzcy5zdGF0aWMoJ2J1aWxkZXInKSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTYXZlIGhhbmRsZXIgZm9yIHNhdmluZyBsYXlvdXQgaW1hZ2VzIGZyb20gdGhlIFVJXG4gICAgICogQHBhcmFtIHJlcVxuICAgICAqIEBwYXJhbSByZXNcbiAgICAgKi9cbiAgICB1cGRhdGVEYXRhYmFzZShyZXEsIHJlcyl7XG4gICAgICAgIGxldCBsb2cgPSB0aGlzLmxvZztcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgY29uc3QgZGF0YSA9IHJlcS5ib2R5O1xuICAgICAgICBsZXQgY2xlYW5EYXRhID0ge307XG4gICAgICAgIGxldCBlcnJvciA9IGZhbHNlO1xuXG4gICAgICAgIGxvZy5sb2coXCIvcmVzdC91cGRhdGVEYXRhYmFzZVwiKTtcbiAgICAgICAgdGhpcy5zZXRSZXNwb25zZUhlYWRlcnMocmVzKTtcblxuICAgICAgICBpZih0eXBlb2YoZGF0YS5sYXlvdXRfaW1hZ2VzKSAhPSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgICAgIGlmKGRhdGEubGF5b3V0X2ltYWdlcy5sZW5ndGggPiAwKXtcbiAgICAgICAgICAgICAgICBjbGVhbkRhdGEubGF5b3V0X2ltYWdlcyA9IGRhdGEubGF5b3V0X2ltYWdlcztcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIGVycm9yID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBlcnJvciA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZighZXJyb3Ipe1xuICAgICAgICAgICAgZGIudXBkYXRlRGF0YWJhc2UoY2xlYW5EYXRhLCBmdW5jdGlvbihlcnIsIHJvd3Mpe1xuICAgICAgICAgICAgICAgIHJlcy5zZW5kKHtzdWNjZXNzOiB0cnVlfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICByZXMuc2VuZCh7c3VjY2VzczogZmFsc2V9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxvZy5sb2cocmVxLmJvZHkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGRldmljZSBkZXNjcmlwdGlvbiB4bWwgZmlsZSBmb3IgdXBucCByZWFkZXJzXG4gICAgICogQHBhcmFtIHJlcVxuICAgICAqIEBwYXJhbSByZXNcbiAgICAgKi9cbiAgICBnZXREZXZpY2VEZXNjcmlwdGlvbihyZXEsIHJlcyl7XG4gICAgICAgIGxldCBsb2cgPSB0aGlzLmxvZztcbiAgICAgICAgbGV0IGlkID0gdGhpcy5pZDtcbiAgICAgICAgbG9nLmxvZyhcImRldmljZWRlc2NyaXB0aW9uLnhtbFwiKTtcbiAgICAgICAgZnMucmVhZEZpbGUoJ2RldmljZWRlc2NyaXB0aW9uLnhtbCcsIFwiYmluYXJ5XCIsIGZ1bmN0aW9uIChlcnIsIGZpbGUpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXMuaGVhZGVyKFwiQ29udGVudC1UeXBlXCIsIFwidGV4dC9wbGFpblwiKTtcbiAgICAgICAgICAgICAgICByZXMuc3RhdHVzKDUwMCkuc2VuZChlcnIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbGUgPSBmaWxlLnJlcGxhY2UoL1xce1xce1VETlxcfVxcfS8sIFwidXVpZDpcIiArIGlkKTtcbiAgICAgICAgICAgIGZpbGUgPSBmaWxlLnJlcGxhY2UoL1xce1xce0VORFxcfVxcfS8sIFwiaHR0cDovL1wiICsgVXRpbHMuZ2V0U2VydmVySXAoKSArIFwiOjg4ODgvcmVzdC9cIik7XG4gICAgICAgICAgICByZXMuaGVhZGVyKFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCIsIFwiKlwiKTtcbiAgICAgICAgICAgIHJlcy5oZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgXCJ0ZXh0L3htbFwiKTtcbiAgICAgICAgICAgIHJlcy5zZW5kKGZpbGUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGFsbCBvZiB0aGUgbGF5b3V0IGltYWdlIHJlY29yZHMgYXMgYSBqc29uIGFycmF5XG4gICAgICogQHBhcmFtIHJlcVxuICAgICAqIEBwYXJhbSByZXNcbiAgICAgKi9cbiAgICBnZXRGbG9vcnBsYW5zKHJlcSwgcmVzKXtcbiAgICAgICAgbGV0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBsb2cubG9nKFwiL3Jlc3QvZmxvb3JwbGFuc1wiKTtcbiAgICAgICAgdGhpcy5zZXRSZXNwb25zZUhlYWRlcnMocmVzKTtcbiAgICAgICAgZGIuZ2V0Rmxvb3JQbGFucyhmdW5jdGlvbihlcnIsIHJvd3Mpe1xuICAgICAgICAgICAgcm93cy5mb3JFYWNoKGZ1bmN0aW9uKHJvdyl7XG4gICAgICAgICAgICAgICAgaWYodHlwZW9mKHJvdy5sYXlvdXRfaW1hZ2UpICE9IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICAgICAgICAgICAgICByb3cubGF5b3V0X2ltYWdlID0gSlNPTi5wYXJzZShyb3cubGF5b3V0X2ltYWdlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJlcy5zZW5kKHJvd3MpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXRTY2FubmVkQ29vcmRzKHJlcSwgcmVzKXtcbiAgICAgICAgbGV0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBjb25zdCBkYXRhID0gcmVxLnBhcmFtcztcbiAgICAgICAgbG9nLmxvZyhcIi9yZXN0L2dldFNjYW5uZWRDb29yZHNcIik7XG4gICAgICAgIHRoaXMuc2V0UmVzcG9uc2VIZWFkZXJzKHJlcyk7XG4gICAgICAgIGRiLmdldFNjYW5uZWRDb29yZHMoZGF0YS5mcF9pZCwgZnVuY3Rpb24oZXJyLCByb3dzKXtcbiAgICAgICAgICAgIHJlcy5zZW5kKHJvd3MpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzYXZlUmVhZGluZ3MocmVxLCByZXMpe1xuICAgICAgICBsZXQgbG9nID0gdGhpcy5sb2c7XG4gICAgICAgIGxvZy5sb2coXCIvcmVzdC9zYXZlUmVhZGluZ3NcIik7XG4gICAgICAgIHRoaXMuc2V0UmVzcG9uc2VIZWFkZXJzKHJlcyk7XG4gICAgICAgIGNvbnN0IGRhdGEgPSByZXEuYm9keTtcbiAgICAgICAgbG9nLmxvZyhkYXRhKTtcbiAgICAgICAgaWYodHlwZW9mKGRhdGEucGF5bG9hZCkgPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgICAgICByZXR1cm4gcmVzLnNlbmQoe3N1Y2Nlc3M6IGZhbHNlLCBtZXNzYWdlOiBcIm1pc3NpbmcgcGF5bG9hZFwifSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kYi5zYXZlUmVhZGluZ3MoZGF0YS5wYXlsb2FkKTtcbiAgICAgICAgcmVzLnNlbmQoe3N1Y2Nlc3M6IHRydWV9KTtcbiAgICB9XG5cbiAgICBnZXRMYXlvdXRJbmZvKHJlcSwgcmVzKXtcbiAgICAgICAgbGV0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBsb2cubG9nKFwiL3Jlc3QvbGF5b3V0X2luZm8vYWxsXCIpO1xuICAgICAgICB0aGlzLnNldFJlc3BvbnNlSGVhZGVycyhyZXMpO1xuXG4gICAgICAgIHRoaXMuZGIuZ2V0TGF5b3V0SW5mbyhmdW5jdGlvbihlcnIsIHJvd3Mpe1xuICAgICAgICAgICAgcmVzLnNlbmQoe1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgcGF5bG9hZDogcm93c1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHNldFJlc3BvbnNlSGVhZGVycyhyZXMpe1xuICAgICAgICByZXMuaGVhZGVyKFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCIsIFwiKlwiKTtcbiAgICAgICAgcmVzLmhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQnKTtcbiAgICAgICAgcmVzLmhlYWRlcihcIkNhY2hlLUNvbnRyb2xcIiwgXCJuby1jYWNoZVwiKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSb3V0ZXMgYXJlIGRlZmluZWQgaGVyZSBhbmQgbWFwcGVkIHRvIGFjdGlvbnNcbiAgICAgKi9cbiAgICBzdGFydFNlcnZlcigpIHtcbiAgICAgICAgY29uc3QgZGIgPSB0aGlzLmRiO1xuICAgICAgICBjb25zdCBsb2cgPSB0aGlzLmxvZztcbiAgICAgICAgY29uc3QgYXBwID0gdGhpcy5hcHA7XG4gICAgICAgIGRiLmNyZWF0ZVRhYmxlcyhsb2cpO1xuXG4gICAgICAgIGFwcC5wb3N0KCcvcmVzdC9sb2NhbGl6ZScsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgbG9nLmxvZygnL3Jlc3QvbG9jYWxpemUnKTtcbiAgICAgICAgICAgIGxvZy5sb2cocmVxLmJvZHkuYXBfaWRzKTtcbiAgICAgICAgICAgIHRoaXMuc2V0UmVzcG9uc2VIZWFkZXJzKHJlcyk7XG4gICAgICAgICAgICBjb25zdCBkYXRhID0gcmVxLmJvZHk7XG4gICAgICAgICAgICBsZXQga25uID0gbmV3IEtubihsb2csIGRiLCBkYXRhLmZwX2lkLCBkYXRhLmFwX2lkcyk7XG4gICAgICAgICAgICBrbm4uZ2V0TmVpZ2hib3JzKDksIChrbm4pID0+IHtcbiAgICAgICAgICAgICAgICBsb2cubG9nKGtubik7XG4gICAgICAgICAgICAgICAgbGV0IGNjID0gbmV3IEtNZWFucyg0LCBrbm4pO1xuICAgICAgICAgICAgICAgIHJlcy5zZW5kKHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBrbm46IGtubixcbiAgICAgICAgICAgICAgICAgICAgY2x1c3RlcnM6IGNjWzBdLFxuICAgICAgICAgICAgICAgICAgICBjZW50cm9pZHM6IGNjWzFdXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXBwLmdldCgnL3Jlc3QvYWxpdmUnLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0UmVzcG9uc2VIZWFkZXJzKHJlcyk7XG4gICAgICAgICAgICByZXMuc2VuZCh7c3VjY2VzczogdHJ1ZX0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBhcHAuZ2V0KCcvcmVzdC9kYXRhYmFzZVZlcnNpb24nLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZ2V0RGF0YWJhc2VWZXJzaW9uKHJlcSwgcmVzKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXBwLnBvc3QoJy9yZXN0L3VwZGF0ZURhdGFiYXNlJywgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZURhdGFiYXNlKHJlcSwgcmVzKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXBwLmdldCgnL2RldmljZWRlc2NyaXB0aW9uLnhtbCcsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgdGhpcy5nZXREZXZpY2VEZXNjcmlwdGlvbihyZXEsIHJlcyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFwcC5nZXQoXCIvaWNvbjI0LnBuZ1wiLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHRoaXMubG9nLmxvZyhcImljb24yNC5wbmdcIik7XG4gICAgICAgICAgICByZXMuaGVhZGVyKFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCIsIFwiKlwiKTtcbiAgICAgICAgICAgIHJlcy5zZW5kRmlsZShwcm9jZXNzLmN3ZCgpICsgJy9zcmMvaWNvbjI0LnBuZycpO1xuICAgICAgICB9KTtcblxuICAgICAgICBhcHAuZ2V0KFwiL3Jlc3QvZmxvb3JwbGFuc1wiLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZ2V0Rmxvb3JwbGFucyhyZXEsIHJlcyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFwcC5wb3N0KFwiL3Jlc3Qvc2F2ZVJlYWRpbmdzXCIsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgdGhpcy5zYXZlUmVhZGluZ3MocmVxLCByZXMpO1xuICAgICAgICB9KTtcblxuICAgICAgICBhcHAuZ2V0KFwiL3Jlc3QvZ2V0U2Nhbm5lZENvb3Jkcy86ZnBfaWRcIiwgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmdldFNjYW5uZWRDb29yZHMocmVxLCByZXMpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnNlcnZlciA9IGh0dHAuY3JlYXRlU2VydmVyKGFwcCk7XG4gICAgICAgIHRoaXMuc2VydmVyLmxpc3RlbihwanNvbi5idWlsZGVyX3Jlc3RfcG9ydCk7XG4gICAgfVxuXG4gICAgZ2V0U2VydmVyKCk6IFNlcnZlciB7XG4gICAgICAgIHJldHVybiB0aGlzLnNlcnZlclxuICAgIH1cblxuICAgIGdldExvZygpOiBMb2cge1xuICAgICAgICByZXR1cm4gdGhpcy5sb2c7XG4gICAgfVxufVxuXG5cbmV4cG9ydCBkZWZhdWx0IFJlc3RTZXJ2ZXI7Il19
//# sourceMappingURL=RestServer.js.map
