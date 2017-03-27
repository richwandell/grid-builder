'use strict';

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

            app.listen(pjson.builder_rest_port, function () {
                log.log('Server Started');
            });
        }
    }]);

    return RestServer;
}();

module.exports = RestServer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlc3RTZXJ2ZXIuZXM2Il0sIm5hbWVzIjpbImV4cHJlc3MiLCJyZXF1aXJlIiwiYm9keVBhcnNlciIsInBqc29uIiwiTG9nZ2VyIiwiRGIiLCJmcyIsIlV0aWxzIiwidXVpZCIsIlJlc3RTZXJ2ZXIiLCJpZCIsInY0Iiwib2xkVVVJRCIsInJlYWRGaWxlU3luYyIsImUiLCJ3cml0ZUZpbGVTeW5jIiwibG9nIiwibG9nZm9sZGVyIiwiYnVpbGRlcl9sb2dfZm9sZGVyIiwiZmlsZW5hbWUiLCJmaWxlc2l6ZSIsIm51bWZpbGVzIiwiZGIiLCJhcHAiLCJ1c2UiLCJqc29uIiwibGltaXQiLCJ1cmxlbmNvZGVkIiwiZXh0ZW5kZWQiLCJzdGF0aWMiLCJyZXEiLCJyZXMiLCJkYXRhIiwiYm9keSIsImNsZWFuRGF0YSIsImVycm9yIiwic2V0UmVzcG9uc2VIZWFkZXJzIiwibGF5b3V0X2ltYWdlcyIsImxlbmd0aCIsInVwZGF0ZURhdGFiYXNlIiwiZXJyIiwicm93cyIsInNlbmQiLCJzdWNjZXNzIiwicmVhZEZpbGUiLCJmaWxlIiwiaGVhZGVyIiwic3RhdHVzIiwicmVwbGFjZSIsImdldFNlcnZlcklwIiwiZ2V0Rmxvb3JQbGFucyIsImZvckVhY2giLCJyb3ciLCJsYXlvdXRfaW1hZ2UiLCJKU09OIiwicGFyc2UiLCJwYXJhbXMiLCJnZXRTY2FubmVkQ29vcmRzIiwiZnBfaWQiLCJwYXlsb2FkIiwibWVzc2FnZSIsInNhdmVSZWFkaW5ncyIsImdldExheW91dEluZm8iLCJjcmVhdGVUYWJsZXMiLCJwb3N0Iiwia25uIiwiYXBfaWRzIiwiZ2V0TmVpZ2hib3JzIiwiY2MiLCJzdWNjZXMiLCJjbHVzdGVycyIsImNlbnRyb2lkcyIsImdldCIsImdldERhdGFiYXNlVmVyc2lvbiIsImdldERldmljZURlc2NyaXB0aW9uIiwic2VuZEZpbGUiLCJwcm9jZXNzIiwiY3dkIiwiZ2V0Rmxvb3JwbGFucyIsImxpc3RlbiIsImJ1aWxkZXJfcmVzdF9wb3J0IiwibW9kdWxlIiwi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QUFjO0FBQ3pDLHNCQUFLOEIsWUFBTCxDQUFrQi9CLEdBQWxCLEVBQXVCQyxHQUF2QjtBQUNILGFBRkQ7O0FBSUFSLGdCQUFJaUQsR0FBSixDQUFRLCtCQUFSLEVBQXlDLFVBQUMxQyxHQUFELEVBQU1DLEdBQU4sRUFBYztBQUNuRCxzQkFBSzBCLGdCQUFMLENBQXNCM0IsR0FBdEIsRUFBMkJDLEdBQTNCO0FBQ0gsYUFGRDs7QUFJQVIsZ0JBQUl3RCxNQUFKLENBQVc1RSxNQUFNNkUsaUJBQWpCLEVBQW9DLFlBQVk7QUFDNUNoRSxvQkFBSUEsR0FBSixDQUFRLGdCQUFSO0FBQ0gsYUFGRDtBQUdIOzs7Ozs7QUFNTGlFLE9BQU9DLE9BQVAsR0FBaUJ6RSxVQUFqQiIsImZpbGUiOiJSZXN0U2VydmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEtubiBmcm9tICcuL0tubic7XG5pbXBvcnQgS01lYW5zIGZyb20gJy4vS01lYW5zJztcbmNvbnN0IGV4cHJlc3MgPSByZXF1aXJlKCdleHByZXNzJyk7XG5jb25zdCBib2R5UGFyc2VyID0gcmVxdWlyZSgnYm9keS1wYXJzZXInKTtcbmNvbnN0IHBqc29uID0gcmVxdWlyZSgnLi4vLi4vcGFja2FnZS5qc29uJyk7XG5jb25zdCBMb2dnZXIgPSByZXF1aXJlKCcuL0xvZy5qcycpO1xubGV0IERiID0gcmVxdWlyZSgnLi9EYi5qcycpO1xuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuY29uc3QgVXRpbHMgPSByZXF1aXJlKCcuL1V0aWxzLmpzJyk7XG5jb25zdCB1dWlkID0gcmVxdWlyZSgndXVpZCcpO1xuXG5cbi8qKlxuICogUmVzdFNlcnZlciBjbGFzcyBpcyB1c2VkIHRvIHBvd2VyIHRoZSByZXN0IHNlcnZlciB0aGF0IHdpbGwgY29tbXVuaWNhdGUgd2l0aCB0aGVcbiAqIG1vYmlsZSBwaG9uZSBvbiB0aGUgbG9jYWwgd2lmaSBuZXR3b3JrLiBUaGlzIHNlcnZlciB3aWxsIHJlc3BvbmQgdG8gdXBucCBkZXZpY2VzXG4gKiB3aXRoIHRoZSBkZXZpY2UgZGVzY3JpcHRpb24geG1sIGZpbGUgYXMgd2VsbCBhcyBoYW5kbGUgYWxsIHNhdmluZyBhbmQgZmV0Y2hpbmcgb2YgZGF0YS5cbiAqXG4gKiBUaGUgcmVzdCBzZXJ2ZXIgdXNlcyBleHByZXNzLmpzIGFuZCBsaXN0ZW5zIG9uIGEgcG9ydCBjb25maWd1cmVkIGJ5IGJ1aWxkZXJfcmVzdF9wb3J0XG4gKiBwYXJhbWV0ZXIgaW4gdGhlIHBhY2thZ2UuanNvbiBmaWxlIHdpdGhpbiB0aGUgcHVibGljIGZvbGRlclxuICpcbiAqIEBhdXRob3IgUmljaCBXYW5kZWxsIDxyaWNod2FuZGVsbEBnbWFpbC5jb20+XG4gKi9cbmNsYXNzIFJlc3RTZXJ2ZXJ7XG5cblxuXG4gICAgY29uc3RydWN0b3IoKXtcbiAgICAgICAgdGhpcy5pZCA9IHV1aWQudjQoKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCBvbGRVVUlEID0gZnMucmVhZEZpbGVTeW5jKFwiLnV1aWRcIiwgXCJ1dGY4XCIpO1xuICAgICAgICAgICAgdGhpcy5pZCA9IG9sZFVVSUQ7XG4gICAgICAgIH1jYXRjaChlKXtcbiAgICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMoXCIudXVpZFwiLCB0aGlzLmlkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubG9nID0gbmV3IExvZ2dlcih7XG4gICAgICAgICAgICBsb2dmb2xkZXI6IHBqc29uLmJ1aWxkZXJfbG9nX2ZvbGRlcixcbiAgICAgICAgICAgIGZpbGVuYW1lOiBcInJlc3QubG9nXCIsXG4gICAgICAgICAgICBmaWxlc2l6ZTogNTAwMDAwMCxcbiAgICAgICAgICAgIG51bWZpbGVzOiAzXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmRiID0gbmV3IERiKHRoaXMubG9nKTtcbiAgICAgICAgdGhpcy5hcHAgPSBleHByZXNzKCk7XG4gICAgICAgIHRoaXMuYXBwLnVzZShib2R5UGFyc2VyLmpzb24oe2xpbWl0OiAnNTBtYid9KSk7XG4gICAgICAgIHRoaXMuYXBwLnVzZShib2R5UGFyc2VyLnVybGVuY29kZWQoeyBleHRlbmRlZDogdHJ1ZSwgbGltaXQ6ICc1MG1iJyB9KSk7XG4gICAgICAgIHRoaXMuYXBwLnVzZSgnL2J1aWxkZXInLCBleHByZXNzLnN0YXRpYygnYnVpbGRlcicpKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNhdmUgaGFuZGxlciBmb3Igc2F2aW5nIGxheW91dCBpbWFnZXMgZnJvbSB0aGUgVUlcbiAgICAgKiBAcGFyYW0gcmVxXG4gICAgICogQHBhcmFtIHJlc1xuICAgICAqL1xuICAgIHVwZGF0ZURhdGFiYXNlKHJlcSwgcmVzKXtcbiAgICAgICAgbGV0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBjb25zdCBkYXRhID0gcmVxLmJvZHk7XG4gICAgICAgIGxldCBjbGVhbkRhdGEgPSB7fTtcbiAgICAgICAgbGV0IGVycm9yID0gZmFsc2U7XG5cbiAgICAgICAgbG9nLmxvZyhcIi9yZXN0L3VwZGF0ZURhdGFiYXNlXCIpO1xuICAgICAgICB0aGlzLnNldFJlc3BvbnNlSGVhZGVycyhyZXMpO1xuXG4gICAgICAgIGlmKHR5cGVvZihkYXRhLmxheW91dF9pbWFnZXMpICE9IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICAgICAgaWYoZGF0YS5sYXlvdXRfaW1hZ2VzLmxlbmd0aCA+IDApe1xuICAgICAgICAgICAgICAgIGNsZWFuRGF0YS5sYXlvdXRfaW1hZ2VzID0gZGF0YS5sYXlvdXRfaW1hZ2VzO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgZXJyb3IgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGVycm9yID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCFlcnJvcil7XG4gICAgICAgICAgICBkYi51cGRhdGVEYXRhYmFzZShjbGVhbkRhdGEsIGZ1bmN0aW9uKGVyciwgcm93cyl7XG4gICAgICAgICAgICAgICAgcmVzLnNlbmQoe3N1Y2Nlc3M6IHRydWV9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHJlcy5zZW5kKHtzdWNjZXNzOiBmYWxzZX0pO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9nLmxvZyhyZXEuYm9keSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgZGV2aWNlIGRlc2NyaXB0aW9uIHhtbCBmaWxlIGZvciB1cG5wIHJlYWRlcnNcbiAgICAgKiBAcGFyYW0gcmVxXG4gICAgICogQHBhcmFtIHJlc1xuICAgICAqL1xuICAgIGdldERldmljZURlc2NyaXB0aW9uKHJlcSwgcmVzKXtcbiAgICAgICAgbGV0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBsZXQgaWQgPSB0aGlzLmlkO1xuICAgICAgICBsb2cubG9nKFwiZGV2aWNlZGVzY3JpcHRpb24ueG1sXCIpO1xuICAgICAgICBmcy5yZWFkRmlsZSgnZGV2aWNlZGVzY3JpcHRpb24ueG1sJywgXCJiaW5hcnlcIiwgZnVuY3Rpb24gKGVyciwgZmlsZSkge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHJlcy5oZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgXCJ0ZXh0L3BsYWluXCIpO1xuICAgICAgICAgICAgICAgIHJlcy5zdGF0dXMoNTAwKS5zZW5kKGVycik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmlsZSA9IGZpbGUucmVwbGFjZSgvXFx7XFx7VUROXFx9XFx9LywgXCJ1dWlkOlwiICsgaWQpO1xuICAgICAgICAgICAgZmlsZSA9IGZpbGUucmVwbGFjZSgvXFx7XFx7RU5EXFx9XFx9LywgXCJodHRwOi8vXCIgKyBVdGlscy5nZXRTZXJ2ZXJJcCgpICsgXCI6ODg4OC9yZXN0L1wiKTtcbiAgICAgICAgICAgIHJlcy5oZWFkZXIoXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIiwgXCIqXCIpO1xuICAgICAgICAgICAgcmVzLmhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcInRleHQveG1sXCIpO1xuICAgICAgICAgICAgcmVzLnNlbmQoZmlsZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYWxsIG9mIHRoZSBsYXlvdXQgaW1hZ2UgcmVjb3JkcyBhcyBhIGpzb24gYXJyYXlcbiAgICAgKiBAcGFyYW0gcmVxXG4gICAgICogQHBhcmFtIHJlc1xuICAgICAqL1xuICAgIGdldEZsb29ycGxhbnMocmVxLCByZXMpe1xuICAgICAgICBsZXQgbG9nID0gdGhpcy5sb2c7XG4gICAgICAgIGxldCBkYiA9IHRoaXMuZGI7XG4gICAgICAgIGxvZy5sb2coXCIvcmVzdC9mbG9vcnBsYW5zXCIpO1xuICAgICAgICB0aGlzLnNldFJlc3BvbnNlSGVhZGVycyhyZXMpO1xuICAgICAgICBkYi5nZXRGbG9vclBsYW5zKGZ1bmN0aW9uKGVyciwgcm93cyl7XG4gICAgICAgICAgICByb3dzLmZvckVhY2goZnVuY3Rpb24ocm93KXtcbiAgICAgICAgICAgICAgICBpZih0eXBlb2Yocm93LmxheW91dF9pbWFnZSkgIT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgICAgICAgICAgICAgIHJvdy5sYXlvdXRfaW1hZ2UgPSBKU09OLnBhcnNlKHJvdy5sYXlvdXRfaW1hZ2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmVzLnNlbmQocm93cyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldFNjYW5uZWRDb29yZHMocmVxLCByZXMpe1xuICAgICAgICBsZXQgbG9nID0gdGhpcy5sb2c7XG4gICAgICAgIGxldCBkYiA9IHRoaXMuZGI7XG4gICAgICAgIGNvbnN0IGRhdGEgPSByZXEucGFyYW1zO1xuICAgICAgICBsb2cubG9nKFwiL3Jlc3QvZ2V0U2Nhbm5lZENvb3Jkc1wiKTtcbiAgICAgICAgdGhpcy5zZXRSZXNwb25zZUhlYWRlcnMocmVzKTtcbiAgICAgICAgZGIuZ2V0U2Nhbm5lZENvb3JkcyhkYXRhLmZwX2lkLCBmdW5jdGlvbihlcnIsIHJvd3Mpe1xuICAgICAgICAgICAgcmVzLnNlbmQocm93cyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHNhdmVSZWFkaW5ncyhyZXEsIHJlcyl7XG4gICAgICAgIGxldCBsb2cgPSB0aGlzLmxvZztcbiAgICAgICAgbG9nLmxvZyhcIi9yZXN0L3NhdmVSZWFkaW5nc1wiKTtcbiAgICAgICAgdGhpcy5zZXRSZXNwb25zZUhlYWRlcnMocmVzKTtcbiAgICAgICAgY29uc3QgZGF0YSA9IHJlcS5ib2R5O1xuICAgICAgICBsb2cubG9nKGRhdGEpO1xuICAgICAgICBpZih0eXBlb2YoZGF0YS5wYXlsb2FkKSA9PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgICAgIHJldHVybiByZXMuc2VuZCh7c3VjY2VzczogZmFsc2UsIG1lc3NhZ2U6IFwibWlzc2luZyBwYXlsb2FkXCJ9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRiLnNhdmVSZWFkaW5ncyhkYXRhLnBheWxvYWQpO1xuICAgICAgICByZXMuc2VuZCh7c3VjY2VzczogdHJ1ZX0pO1xuICAgIH1cblxuICAgIGdldExheW91dEluZm8ocmVxLCByZXMpe1xuICAgICAgICBsZXQgbG9nID0gdGhpcy5sb2c7XG4gICAgICAgIGxvZy5sb2coXCIvcmVzdC9sYXlvdXRfaW5mby9hbGxcIik7XG4gICAgICAgIHRoaXMuc2V0UmVzcG9uc2VIZWFkZXJzKHJlcyk7XG5cbiAgICAgICAgdGhpcy5kYi5nZXRMYXlvdXRJbmZvKGZ1bmN0aW9uKGVyciwgcm93cyl7XG4gICAgICAgICAgICByZXMuc2VuZCh7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBwYXlsb2FkOiByb3dzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2V0UmVzcG9uc2VIZWFkZXJzKHJlcyl7XG4gICAgICAgIHJlcy5oZWFkZXIoXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIiwgXCIqXCIpO1xuICAgICAgICByZXMuaGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vamF2YXNjcmlwdCcpO1xuICAgICAgICByZXMuaGVhZGVyKFwiQ2FjaGUtQ29udHJvbFwiLCBcIm5vLWNhY2hlXCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJvdXRlcyBhcmUgZGVmaW5lZCBoZXJlIGFuZCBtYXBwZWQgdG8gYWN0aW9uc1xuICAgICAqL1xuICAgIHN0YXJ0U2VydmVyKCkge1xuICAgICAgICBjb25zdCBkYiA9IHRoaXMuZGI7XG4gICAgICAgIGNvbnN0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBjb25zdCBhcHAgPSB0aGlzLmFwcDtcbiAgICAgICAgZGIuY3JlYXRlVGFibGVzKGxvZyk7XG5cbiAgICAgICAgYXBwLnBvc3QoJy9yZXN0L2xvY2FsaXplJywgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICBsb2cubG9nKCcvcmVzdC9sb2NhbGl6ZScpO1xuICAgICAgICAgICAgdGhpcy5zZXRSZXNwb25zZUhlYWRlcnMocmVzKTtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSByZXEuYm9keTtcbiAgICAgICAgICAgIGxldCBrbm4gPSBuZXcgS25uKGxvZywgZGIsIGRhdGEuZnBfaWQsIGRhdGEuYXBfaWRzKTtcbiAgICAgICAgICAgIGtubi5nZXROZWlnaGJvcnMoOSwgKGtubikgPT4ge1xuICAgICAgICAgICAgICAgIGxvZy5sb2coa25uKTtcbiAgICAgICAgICAgICAgICBsZXQgY2MgPSBuZXcgS01lYW5zKDQsIGtubik7XG4gICAgICAgICAgICAgICAgcmVzLnNlbmQoe1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGtubjoga25uLFxuICAgICAgICAgICAgICAgICAgICBjbHVzdGVyczogY2NbMF0sXG4gICAgICAgICAgICAgICAgICAgIGNlbnRyb2lkczogY2NbMV1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBhcHAuZ2V0KCcvcmVzdC9hbGl2ZScsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRSZXNwb25zZUhlYWRlcnMocmVzKTtcbiAgICAgICAgICAgIHJlcy5zZW5kKHtzdWNjZXNzOiB0cnVlfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFwcC5nZXQoJy9yZXN0L2RhdGFiYXNlVmVyc2lvbicsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgdGhpcy5nZXREYXRhYmFzZVZlcnNpb24ocmVxLCByZXMpO1xuICAgICAgICB9KTtcblxuICAgICAgICBhcHAucG9zdCgnL3Jlc3QvdXBkYXRlRGF0YWJhc2UnLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlRGF0YWJhc2UocmVxLCByZXMpO1xuICAgICAgICB9KTtcblxuICAgICAgICBhcHAuZ2V0KCcvZGV2aWNlZGVzY3JpcHRpb24ueG1sJywgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmdldERldmljZURlc2NyaXB0aW9uKHJlcSwgcmVzKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXBwLmdldChcIi9pY29uMjQucG5nXCIsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgdGhpcy5sb2cubG9nKFwiaWNvbjI0LnBuZ1wiKTtcbiAgICAgICAgICAgIHJlcy5oZWFkZXIoXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIiwgXCIqXCIpO1xuICAgICAgICAgICAgcmVzLnNlbmRGaWxlKHByb2Nlc3MuY3dkKCkgKyAnL3NyYy9pY29uMjQucG5nJyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFwcC5nZXQoXCIvcmVzdC9mbG9vcnBsYW5zXCIsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgdGhpcy5nZXRGbG9vcnBsYW5zKHJlcSwgcmVzKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXBwLnBvc3QoXCIvcmVzdC9zYXZlUmVhZGluZ3NcIiwgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNhdmVSZWFkaW5ncyhyZXEsIHJlcyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFwcC5nZXQoXCIvcmVzdC9nZXRTY2FubmVkQ29vcmRzLzpmcF9pZFwiLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZ2V0U2Nhbm5lZENvb3JkcyhyZXEsIHJlcyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFwcC5saXN0ZW4ocGpzb24uYnVpbGRlcl9yZXN0X3BvcnQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxvZy5sb2coJ1NlcnZlciBTdGFydGVkJylcbiAgICAgICAgfSk7XG4gICAgfVxuXG59XG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlc3RTZXJ2ZXI7Il19
//# sourceMappingURL=RestServer.js.map
