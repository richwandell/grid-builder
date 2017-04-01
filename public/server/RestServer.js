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
        key: 'createServer',
        value: function createServer() {
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
        }
    }, {
        key: 'listen',
        value: function listen(worker) {
            this.worker = worker;
            this.server.listen(pjson.builder_rest_port);
        }
    }, {
        key: 'getApp',
        value: function getApp() {
            return this.app;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvUmVzdFNlcnZlci5lczYiXSwibmFtZXMiOlsiZXhwcmVzcyIsInJlcXVpcmUiLCJib2R5UGFyc2VyIiwicGpzb24iLCJMb2dnZXIiLCJEYiIsImZzIiwiVXRpbHMiLCJ1dWlkIiwiaHR0cCIsIlJlc3RTZXJ2ZXIiLCJpZCIsInY0Iiwib2xkVVVJRCIsInJlYWRGaWxlU3luYyIsImUiLCJ3cml0ZUZpbGVTeW5jIiwibG9nIiwibG9nZm9sZGVyIiwiYnVpbGRlcl9sb2dfZm9sZGVyIiwiZmlsZW5hbWUiLCJmaWxlc2l6ZSIsIm51bWZpbGVzIiwiZGIiLCJhcHAiLCJ1c2UiLCJqc29uIiwibGltaXQiLCJ1cmxlbmNvZGVkIiwiZXh0ZW5kZWQiLCJzdGF0aWMiLCJyZXEiLCJyZXMiLCJkYXRhIiwiYm9keSIsImNsZWFuRGF0YSIsImVycm9yIiwic2V0UmVzcG9uc2VIZWFkZXJzIiwibGF5b3V0X2ltYWdlcyIsImxlbmd0aCIsInVwZGF0ZURhdGFiYXNlIiwiZXJyIiwicm93cyIsInNlbmQiLCJzdWNjZXNzIiwicmVhZEZpbGUiLCJmaWxlIiwiaGVhZGVyIiwic3RhdHVzIiwicmVwbGFjZSIsImdldFNlcnZlcklwIiwiZ2V0Rmxvb3JQbGFucyIsImZvckVhY2giLCJyb3ciLCJsYXlvdXRfaW1hZ2UiLCJKU09OIiwicGFyc2UiLCJwYXJhbXMiLCJnZXRTY2FubmVkQ29vcmRzIiwiZnBfaWQiLCJwYXlsb2FkIiwibWVzc2FnZSIsInNhdmVSZWFkaW5ncyIsImdldExheW91dEluZm8iLCJjcmVhdGVUYWJsZXMiLCJwb3N0IiwiYXBfaWRzIiwia25uIiwiZ2V0TmVpZ2hib3JzIiwiY2MiLCJzdWNjZXMiLCJjbHVzdGVycyIsImNlbnRyb2lkcyIsImdldCIsImdldERhdGFiYXNlVmVyc2lvbiIsImdldERldmljZURlc2NyaXB0aW9uIiwic2VuZEZpbGUiLCJwcm9jZXNzIiwiY3dkIiwiZ2V0Rmxvb3JwbGFucyIsInNlcnZlciIsImNyZWF0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TixFQUFjO0FBQ3RDLHNCQUFLK0MsYUFBTCxDQUFtQmhELEdBQW5CLEVBQXdCQyxHQUF4QjtBQUNILGFBRkQ7O0FBSUFSLGdCQUFJeUMsSUFBSixDQUFTLG9CQUFULEVBQStCLFVBQUNsQyxHQUFELEVBQU1DLEdBQU4sRUFBYztBQUN6QyxzQkFBSzhCLFlBQUwsQ0FBa0IvQixHQUFsQixFQUF1QkMsR0FBdkI7QUFDSCxhQUZEOztBQUlBUixnQkFBSWlELEdBQUosQ0FBUSwrQkFBUixFQUF5QyxVQUFDMUMsR0FBRCxFQUFNQyxHQUFOLEVBQWM7QUFDbkQsc0JBQUswQixnQkFBTCxDQUFzQjNCLEdBQXRCLEVBQTJCQyxHQUEzQjtBQUNILGFBRkQ7O0FBSUEsaUJBQUtnRCxNQUFMLEdBQWN2RSxLQUFLd0UsWUFBTCxDQUFrQnpELEdBQWxCLENBQWQ7QUFFSDs7OytCQUVNMEQsTSxFQUFlO0FBQ2xCLGlCQUFLQSxNQUFMLEdBQWNBLE1BQWQ7QUFDQSxpQkFBS0YsTUFBTCxDQUFZRyxNQUFaLENBQW1CaEYsTUFBTWlGLGlCQUF6QjtBQUNIOzs7aUNBRWlCO0FBQ2QsbUJBQU8sS0FBSzVELEdBQVo7QUFDSDs7O29DQUVtQjtBQUNoQixtQkFBTyxLQUFLd0QsTUFBWjtBQUNIOzs7aUNBRWE7QUFDVixtQkFBTyxLQUFLL0QsR0FBWjtBQUNIOzs7Ozs7a0JBSVVQLFUiLCJmaWxlIjoiUmVzdFNlcnZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBLbm4gZnJvbSAnLi9Lbm4nO1xuaW1wb3J0IEtNZWFucyBmcm9tICcuL0tNZWFucyc7XG5jb25zdCBleHByZXNzID0gcmVxdWlyZSgnZXhwcmVzcycpO1xuY29uc3QgYm9keVBhcnNlciA9IHJlcXVpcmUoJ2JvZHktcGFyc2VyJyk7XG5jb25zdCBwanNvbiA9IHJlcXVpcmUoJy4uLy4uL3BhY2thZ2UuanNvbicpO1xuY29uc3QgTG9nZ2VyID0gcmVxdWlyZSgnLi9Mb2cuanMnKTtcbmxldCBEYiA9IHJlcXVpcmUoJy4vRGIuanMnKTtcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmNvbnN0IFV0aWxzID0gcmVxdWlyZSgnLi9VdGlscy5qcycpO1xuY29uc3QgdXVpZCA9IHJlcXVpcmUoJ3V1aWQnKTtcbmNvbnN0IGh0dHAgPSByZXF1aXJlKCdodHRwJyk7XG5cblxuXG4vKipcbiAqIFJlc3RTZXJ2ZXIgY2xhc3MgaXMgdXNlZCB0byBwb3dlciB0aGUgcmVzdCBzZXJ2ZXIgdGhhdCB3aWxsIGNvbW11bmljYXRlIHdpdGggdGhlXG4gKiBtb2JpbGUgcGhvbmUgb24gdGhlIGxvY2FsIHdpZmkgbmV0d29yay4gVGhpcyBzZXJ2ZXIgd2lsbCByZXNwb25kIHRvIHVwbnAgZGV2aWNlc1xuICogd2l0aCB0aGUgZGV2aWNlIGRlc2NyaXB0aW9uIHhtbCBmaWxlIGFzIHdlbGwgYXMgaGFuZGxlIGFsbCBzYXZpbmcgYW5kIGZldGNoaW5nIG9mIGRhdGEuXG4gKlxuICogVGhlIHJlc3Qgc2VydmVyIHVzZXMgZXhwcmVzcy5qcyBhbmQgbGlzdGVucyBvbiBhIHBvcnQgY29uZmlndXJlZCBieSBidWlsZGVyX3Jlc3RfcG9ydFxuICogcGFyYW1ldGVyIGluIHRoZSBwYWNrYWdlLmpzb24gZmlsZSB3aXRoaW4gdGhlIHB1YmxpYyBmb2xkZXJcbiAqXG4gKiBAYXV0aG9yIFJpY2ggV2FuZGVsbCA8cmljaHdhbmRlbGxAZ21haWwuY29tPlxuICovXG5jbGFzcyBSZXN0U2VydmVye1xuXG4gICAgY29uc3RydWN0b3IoKXtcbiAgICAgICAgdGhpcy5pZCA9IHV1aWQudjQoKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCBvbGRVVUlEID0gZnMucmVhZEZpbGVTeW5jKFwiLnV1aWRcIiwgXCJ1dGY4XCIpO1xuICAgICAgICAgICAgdGhpcy5pZCA9IG9sZFVVSUQ7XG4gICAgICAgIH1jYXRjaChlKXtcbiAgICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMoXCIudXVpZFwiLCB0aGlzLmlkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubG9nID0gbmV3IExvZ2dlcih7XG4gICAgICAgICAgICBsb2dmb2xkZXI6IHBqc29uLmJ1aWxkZXJfbG9nX2ZvbGRlcixcbiAgICAgICAgICAgIGZpbGVuYW1lOiBcInJlc3QubG9nXCIsXG4gICAgICAgICAgICBmaWxlc2l6ZTogNTAwMDAwMCxcbiAgICAgICAgICAgIG51bWZpbGVzOiAzXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmRiID0gbmV3IERiKHRoaXMubG9nKTtcbiAgICAgICAgdGhpcy5hcHAgPSBleHByZXNzKCk7XG4gICAgICAgIHRoaXMuYXBwLnVzZShib2R5UGFyc2VyLmpzb24oe2xpbWl0OiAnNTBtYid9KSk7XG4gICAgICAgIHRoaXMuYXBwLnVzZShib2R5UGFyc2VyLnVybGVuY29kZWQoeyBleHRlbmRlZDogdHJ1ZSwgbGltaXQ6ICc1MG1iJyB9KSk7XG4gICAgICAgIHRoaXMuYXBwLnVzZSgnL2J1aWxkZXInLCBleHByZXNzLnN0YXRpYygnYnVpbGRlcicpKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNhdmUgaGFuZGxlciBmb3Igc2F2aW5nIGxheW91dCBpbWFnZXMgZnJvbSB0aGUgVUlcbiAgICAgKiBAcGFyYW0gcmVxXG4gICAgICogQHBhcmFtIHJlc1xuICAgICAqL1xuICAgIHVwZGF0ZURhdGFiYXNlKHJlcSwgcmVzKXtcbiAgICAgICAgbGV0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBjb25zdCBkYXRhID0gcmVxLmJvZHk7XG4gICAgICAgIGxldCBjbGVhbkRhdGEgPSB7fTtcbiAgICAgICAgbGV0IGVycm9yID0gZmFsc2U7XG5cbiAgICAgICAgbG9nLmxvZyhcIi9yZXN0L3VwZGF0ZURhdGFiYXNlXCIpO1xuICAgICAgICB0aGlzLnNldFJlc3BvbnNlSGVhZGVycyhyZXMpO1xuXG4gICAgICAgIGlmKHR5cGVvZihkYXRhLmxheW91dF9pbWFnZXMpICE9IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICAgICAgaWYoZGF0YS5sYXlvdXRfaW1hZ2VzLmxlbmd0aCA+IDApe1xuICAgICAgICAgICAgICAgIGNsZWFuRGF0YS5sYXlvdXRfaW1hZ2VzID0gZGF0YS5sYXlvdXRfaW1hZ2VzO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgZXJyb3IgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGVycm9yID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCFlcnJvcil7XG4gICAgICAgICAgICBkYi51cGRhdGVEYXRhYmFzZShjbGVhbkRhdGEsIGZ1bmN0aW9uKGVyciwgcm93cyl7XG4gICAgICAgICAgICAgICAgcmVzLnNlbmQoe3N1Y2Nlc3M6IHRydWV9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHJlcy5zZW5kKHtzdWNjZXNzOiBmYWxzZX0pO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9nLmxvZyhyZXEuYm9keSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgZGV2aWNlIGRlc2NyaXB0aW9uIHhtbCBmaWxlIGZvciB1cG5wIHJlYWRlcnNcbiAgICAgKiBAcGFyYW0gcmVxXG4gICAgICogQHBhcmFtIHJlc1xuICAgICAqL1xuICAgIGdldERldmljZURlc2NyaXB0aW9uKHJlcSwgcmVzKXtcbiAgICAgICAgbGV0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBsZXQgaWQgPSB0aGlzLmlkO1xuICAgICAgICBsb2cubG9nKFwiZGV2aWNlZGVzY3JpcHRpb24ueG1sXCIpO1xuICAgICAgICBmcy5yZWFkRmlsZSgnZGV2aWNlZGVzY3JpcHRpb24ueG1sJywgXCJiaW5hcnlcIiwgZnVuY3Rpb24gKGVyciwgZmlsZSkge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHJlcy5oZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgXCJ0ZXh0L3BsYWluXCIpO1xuICAgICAgICAgICAgICAgIHJlcy5zdGF0dXMoNTAwKS5zZW5kKGVycik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmlsZSA9IGZpbGUucmVwbGFjZSgvXFx7XFx7VUROXFx9XFx9LywgXCJ1dWlkOlwiICsgaWQpO1xuICAgICAgICAgICAgZmlsZSA9IGZpbGUucmVwbGFjZSgvXFx7XFx7RU5EXFx9XFx9LywgXCJodHRwOi8vXCIgKyBVdGlscy5nZXRTZXJ2ZXJJcCgpICsgXCI6ODg4OC9yZXN0L1wiKTtcbiAgICAgICAgICAgIHJlcy5oZWFkZXIoXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIiwgXCIqXCIpO1xuICAgICAgICAgICAgcmVzLmhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcInRleHQveG1sXCIpO1xuICAgICAgICAgICAgcmVzLnNlbmQoZmlsZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYWxsIG9mIHRoZSBsYXlvdXQgaW1hZ2UgcmVjb3JkcyBhcyBhIGpzb24gYXJyYXlcbiAgICAgKiBAcGFyYW0gcmVxXG4gICAgICogQHBhcmFtIHJlc1xuICAgICAqL1xuICAgIGdldEZsb29ycGxhbnMocmVxLCByZXMpe1xuICAgICAgICBsZXQgbG9nID0gdGhpcy5sb2c7XG4gICAgICAgIGxldCBkYiA9IHRoaXMuZGI7XG4gICAgICAgIGxvZy5sb2coXCIvcmVzdC9mbG9vcnBsYW5zXCIpO1xuICAgICAgICB0aGlzLnNldFJlc3BvbnNlSGVhZGVycyhyZXMpO1xuICAgICAgICBkYi5nZXRGbG9vclBsYW5zKGZ1bmN0aW9uKGVyciwgcm93cyl7XG4gICAgICAgICAgICByb3dzLmZvckVhY2goZnVuY3Rpb24ocm93KXtcbiAgICAgICAgICAgICAgICBpZih0eXBlb2Yocm93LmxheW91dF9pbWFnZSkgIT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgICAgICAgICAgICAgIHJvdy5sYXlvdXRfaW1hZ2UgPSBKU09OLnBhcnNlKHJvdy5sYXlvdXRfaW1hZ2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmVzLnNlbmQocm93cyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldFNjYW5uZWRDb29yZHMocmVxLCByZXMpe1xuICAgICAgICBsZXQgbG9nID0gdGhpcy5sb2c7XG4gICAgICAgIGxldCBkYiA9IHRoaXMuZGI7XG4gICAgICAgIGNvbnN0IGRhdGEgPSByZXEucGFyYW1zO1xuICAgICAgICBsb2cubG9nKFwiL3Jlc3QvZ2V0U2Nhbm5lZENvb3Jkc1wiKTtcbiAgICAgICAgdGhpcy5zZXRSZXNwb25zZUhlYWRlcnMocmVzKTtcbiAgICAgICAgZGIuZ2V0U2Nhbm5lZENvb3JkcyhkYXRhLmZwX2lkLCBmdW5jdGlvbihlcnIsIHJvd3Mpe1xuICAgICAgICAgICAgcmVzLnNlbmQocm93cyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHNhdmVSZWFkaW5ncyhyZXEsIHJlcyl7XG4gICAgICAgIGxldCBsb2cgPSB0aGlzLmxvZztcbiAgICAgICAgbG9nLmxvZyhcIi9yZXN0L3NhdmVSZWFkaW5nc1wiKTtcbiAgICAgICAgdGhpcy5zZXRSZXNwb25zZUhlYWRlcnMocmVzKTtcbiAgICAgICAgY29uc3QgZGF0YSA9IHJlcS5ib2R5O1xuICAgICAgICBsb2cubG9nKGRhdGEpO1xuICAgICAgICBpZih0eXBlb2YoZGF0YS5wYXlsb2FkKSA9PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgICAgIHJldHVybiByZXMuc2VuZCh7c3VjY2VzczogZmFsc2UsIG1lc3NhZ2U6IFwibWlzc2luZyBwYXlsb2FkXCJ9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRiLnNhdmVSZWFkaW5ncyhkYXRhLnBheWxvYWQpO1xuICAgICAgICByZXMuc2VuZCh7c3VjY2VzczogdHJ1ZX0pO1xuICAgIH1cblxuICAgIGdldExheW91dEluZm8ocmVxLCByZXMpe1xuICAgICAgICBsZXQgbG9nID0gdGhpcy5sb2c7XG4gICAgICAgIGxvZy5sb2coXCIvcmVzdC9sYXlvdXRfaW5mby9hbGxcIik7XG4gICAgICAgIHRoaXMuc2V0UmVzcG9uc2VIZWFkZXJzKHJlcyk7XG5cbiAgICAgICAgdGhpcy5kYi5nZXRMYXlvdXRJbmZvKGZ1bmN0aW9uKGVyciwgcm93cyl7XG4gICAgICAgICAgICByZXMuc2VuZCh7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBwYXlsb2FkOiByb3dzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2V0UmVzcG9uc2VIZWFkZXJzKHJlcyl7XG4gICAgICAgIHJlcy5oZWFkZXIoXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIiwgXCIqXCIpO1xuICAgICAgICByZXMuaGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vamF2YXNjcmlwdCcpO1xuICAgICAgICByZXMuaGVhZGVyKFwiQ2FjaGUtQ29udHJvbFwiLCBcIm5vLWNhY2hlXCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJvdXRlcyBhcmUgZGVmaW5lZCBoZXJlIGFuZCBtYXBwZWQgdG8gYWN0aW9uc1xuICAgICAqL1xuICAgIGNyZWF0ZVNlcnZlcigpIHtcbiAgICAgICAgY29uc3QgZGIgPSB0aGlzLmRiO1xuICAgICAgICBjb25zdCBsb2cgPSB0aGlzLmxvZztcbiAgICAgICAgY29uc3QgYXBwID0gdGhpcy5hcHA7XG4gICAgICAgIGRiLmNyZWF0ZVRhYmxlcyhsb2cpO1xuXG4gICAgICAgIGFwcC5wb3N0KCcvcmVzdC9sb2NhbGl6ZScsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgbG9nLmxvZygnL3Jlc3QvbG9jYWxpemUnKTtcbiAgICAgICAgICAgIGxvZy5sb2cocmVxLmJvZHkuYXBfaWRzKTtcbiAgICAgICAgICAgIHRoaXMuc2V0UmVzcG9uc2VIZWFkZXJzKHJlcyk7XG4gICAgICAgICAgICBjb25zdCBkYXRhID0gcmVxLmJvZHk7XG4gICAgICAgICAgICBsZXQga25uID0gbmV3IEtubihsb2csIGRiLCBkYXRhLmZwX2lkLCBkYXRhLmFwX2lkcyk7XG4gICAgICAgICAgICBrbm4uZ2V0TmVpZ2hib3JzKDksIChrbm4pID0+IHtcbiAgICAgICAgICAgICAgICBsb2cubG9nKGtubik7XG4gICAgICAgICAgICAgICAgbGV0IGNjID0gbmV3IEtNZWFucyg0LCBrbm4pO1xuICAgICAgICAgICAgICAgIHJlcy5zZW5kKHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBrbm46IGtubixcbiAgICAgICAgICAgICAgICAgICAgY2x1c3RlcnM6IGNjWzBdLFxuICAgICAgICAgICAgICAgICAgICBjZW50cm9pZHM6IGNjWzFdXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXBwLmdldCgnL3Jlc3QvYWxpdmUnLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0UmVzcG9uc2VIZWFkZXJzKHJlcyk7XG4gICAgICAgICAgICByZXMuc2VuZCh7c3VjY2VzczogdHJ1ZX0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBhcHAuZ2V0KCcvcmVzdC9kYXRhYmFzZVZlcnNpb24nLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZ2V0RGF0YWJhc2VWZXJzaW9uKHJlcSwgcmVzKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXBwLnBvc3QoJy9yZXN0L3VwZGF0ZURhdGFiYXNlJywgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZURhdGFiYXNlKHJlcSwgcmVzKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXBwLmdldCgnL2RldmljZWRlc2NyaXB0aW9uLnhtbCcsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgdGhpcy5nZXREZXZpY2VEZXNjcmlwdGlvbihyZXEsIHJlcyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFwcC5nZXQoXCIvaWNvbjI0LnBuZ1wiLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHRoaXMubG9nLmxvZyhcImljb24yNC5wbmdcIik7XG4gICAgICAgICAgICByZXMuaGVhZGVyKFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCIsIFwiKlwiKTtcbiAgICAgICAgICAgIHJlcy5zZW5kRmlsZShwcm9jZXNzLmN3ZCgpICsgJy9zcmMvaWNvbjI0LnBuZycpO1xuICAgICAgICB9KTtcblxuICAgICAgICBhcHAuZ2V0KFwiL3Jlc3QvZmxvb3JwbGFuc1wiLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZ2V0Rmxvb3JwbGFucyhyZXEsIHJlcyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFwcC5wb3N0KFwiL3Jlc3Qvc2F2ZVJlYWRpbmdzXCIsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgdGhpcy5zYXZlUmVhZGluZ3MocmVxLCByZXMpO1xuICAgICAgICB9KTtcblxuICAgICAgICBhcHAuZ2V0KFwiL3Jlc3QvZ2V0U2Nhbm5lZENvb3Jkcy86ZnBfaWRcIiwgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmdldFNjYW5uZWRDb29yZHMocmVxLCByZXMpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnNlcnZlciA9IGh0dHAuY3JlYXRlU2VydmVyKGFwcCk7XG5cbiAgICB9XG5cbiAgICBsaXN0ZW4od29ya2VyOiBXb3JrZXIpe1xuICAgICAgICB0aGlzLndvcmtlciA9IHdvcmtlcjtcbiAgICAgICAgdGhpcy5zZXJ2ZXIubGlzdGVuKHBqc29uLmJ1aWxkZXJfcmVzdF9wb3J0KTtcbiAgICB9XG5cbiAgICBnZXRBcHAoKTogZXhwcmVzcyB7XG4gICAgICAgIHJldHVybiB0aGlzLmFwcDtcbiAgICB9XG5cbiAgICBnZXRTZXJ2ZXIoKTogU2VydmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VydmVyXG4gICAgfVxuXG4gICAgZ2V0TG9nKCk6IExvZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmxvZztcbiAgICB9XG59XG5cblxuZXhwb3J0IGRlZmF1bHQgUmVzdFNlcnZlcjsiXX0=
//# sourceMappingURL=RestServer.js.map
