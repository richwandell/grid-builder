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
var Utils = require('./Utils.js');
var http = require('http');
var fs = require("fs");

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
    function RestServer(server) {
        _classCallCheck(this, RestServer);

        this.worker = server;
        this.id = server.id;
        this.log = server.log;
        this.db = server.db;

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
            db.getScannedCoords(data.fp_id, function (err, rows) {
                res.send(rows);
            });
        }
    }, {
        key: 'saveReadings',
        value: function saveReadings(req, res) {
            var _this = this;

            var log = this.log;
            log.log("/rest/saveReadings");
            var data = req.body;
            log.log(data);
            if (typeof data.payload == "undefined") {
                return res.send({ success: false, message: "missing payload" });
            }
            this.db.saveReadings(data.payload, function () {
                res.send({ success: true });
                _this.notifyListeners({
                    action: 'NEW_READING'
                });
            });
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
    }, {
        key: 'localize',
        value: function localize(req, res) {
            var _this2 = this;

            this.log.log('/rest/localize');
            this.log.log(req.body.ap_ids);

            var data = req.body;
            var knn = new _Knn2.default(this.log, this.db, data.fp_id, data.ap_ids);
            knn.getNeighbors(5, function (knn) {
                _this2.log.log(knn);
                var km = new _KMeans2.default(2, knn);
                var largestCluster = km.getLargestClusterIndex();
                var guess = km.getCentroid(largestCluster);
                var id = data.device_id;

                res.send({
                    succes: true,
                    guess: guess
                });
                _this2.notifyListeners({
                    action: 'LOCALIZE',
                    id: id,
                    guess: guess,
                    type: data.type
                });
            });
        }
    }, {
        key: 'notifyListeners',
        value: function notifyListeners(data) {
            this.worker.send(data);
        }
    }, {
        key: 'jsonHeaders',
        value: function jsonHeaders(req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header('Content-Type', 'application/javascript');
            res.header("Cache-Control", "no-cache");
            next();
        }

        /**
         * Routes are defined here and mapped to actions
         */

    }, {
        key: 'createServer',
        value: function createServer() {
            var _this3 = this;

            var app = this.app;

            app.post('/rest/localize', this.jsonHeaders, function (req, res) {
                _this3.localize(req, res);
            });

            app.get('/rest/alive', this.jsonHeaders, function (req, res) {
                res.send({ success: true });
            });

            app.post('/rest/updateDatabase', function (req, res) {
                _this3.updateDatabase(req, res);
            });

            app.get('/devicedescription.xml', function (req, res) {
                _this3.getDeviceDescription(req, res);
            });

            app.get("/icon24.png", function (req, res) {
                _this3.log.log("icon24.png");
                res.header("Access-Control-Allow-Origin", "*");
                res.sendFile(process.cwd() + '/src/icon24.png');
            });

            app.get("/rest/floorplans", this.jsonHeaders, function (req, res) {
                _this3.getFloorplans(req, res);
            });

            app.post("/rest/saveReadings", this.jsonHeaders, function (req, res) {
                _this3.saveReadings(req, res);
            });

            app.get("/rest/getScannedCoords/:fp_id", this.jsonHeaders, function (req, res) {
                _this3.getScannedCoords(req, res);
            });

            this.server = http.createServer(app);
        }
    }, {
        key: 'listen',
        value: function listen(port) {
            this.server.listen(port);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvUmVzdFNlcnZlci5lczYiXSwibmFtZXMiOlsiZXhwcmVzcyIsInJlcXVpcmUiLCJib2R5UGFyc2VyIiwiVXRpbHMiLCJodHRwIiwiZnMiLCJSZXN0U2VydmVyIiwic2VydmVyIiwid29ya2VyIiwiaWQiLCJsb2ciLCJkYiIsImFwcCIsInVzZSIsImpzb24iLCJsaW1pdCIsInVybGVuY29kZWQiLCJleHRlbmRlZCIsInN0YXRpYyIsInJlcSIsInJlcyIsImRhdGEiLCJib2R5IiwiY2xlYW5EYXRhIiwiZXJyb3IiLCJzZXRSZXNwb25zZUhlYWRlcnMiLCJsYXlvdXRfaW1hZ2VzIiwibGVuZ3RoIiwidXBkYXRlRGF0YWJhc2UiLCJlcnIiLCJyb3dzIiwic2VuZCIsInN1Y2Nlc3MiLCJyZWFkRmlsZSIsImZpbGUiLCJoZWFkZXIiLCJzdGF0dXMiLCJyZXBsYWNlIiwiZ2V0U2VydmVySXAiLCJnZXRGbG9vclBsYW5zIiwiZm9yRWFjaCIsInJvdyIsImxheW91dF9pbWFnZSIsIkpTT04iLCJwYXJzZSIsInBhcmFtcyIsImdldFNjYW5uZWRDb29yZHMiLCJmcF9pZCIsInBheWxvYWQiLCJtZXNzYWdlIiwic2F2ZVJlYWRpbmdzIiwibm90aWZ5TGlzdGVuZXJzIiwiYWN0aW9uIiwiZ2V0TGF5b3V0SW5mbyIsImFwX2lkcyIsImtubiIsImdldE5laWdoYm9ycyIsImttIiwibGFyZ2VzdENsdXN0ZXIiLCJnZXRMYXJnZXN0Q2x1c3RlckluZGV4IiwiZ3Vlc3MiLCJnZXRDZW50cm9pZCIsImRldmljZV9pZCIsInN1Y2NlcyIsInR5cGUiLCJuZXh0IiwicG9zdCIsImpzb25IZWFkZXJzIiwibG9jYWxpemUiLCJnZXQiLCJnZXREZXZpY2VEZXNjcmlwdGlvbiIsInNlbmRGaWxlIiwicHJvY2VzcyIsImN3ZCIsImdldEZsb29ycGxhbnMiLCJjcmVhdGVTZXJ2ZXIiLCJwb3J0IiwibGlzdGVuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOzs7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dUJDLEdBQXZCO0FBQ0gsYUFGRDs7QUFJQVIsZ0JBQUl5RCxHQUFKLENBQVEsK0JBQVIsRUFBeUMsS0FBS0YsV0FBOUMsRUFBMkQsVUFBQ2hELEdBQUQsRUFBTUMsR0FBTixFQUFjO0FBQ3JFLHVCQUFLMEIsZ0JBQUwsQ0FBc0IzQixHQUF0QixFQUEyQkMsR0FBM0I7QUFDSCxhQUZEOztBQUlBLGlCQUFLYixNQUFMLEdBQWNILEtBQUt1RSxZQUFMLENBQWtCL0QsR0FBbEIsQ0FBZDtBQUVIOzs7K0JBRU1nRSxJLEVBQUs7QUFDUixpQkFBS3JFLE1BQUwsQ0FBWXNFLE1BQVosQ0FBbUJELElBQW5CO0FBQ0g7OztpQ0FFaUI7QUFDZCxtQkFBTyxLQUFLaEUsR0FBWjtBQUNIOzs7b0NBRW1CO0FBQ2hCLG1CQUFPLEtBQUtMLE1BQVo7QUFDSDs7O2lDQUVhO0FBQ1YsbUJBQU8sS0FBS0csR0FBWjtBQUNIOzs7Ozs7a0JBSVVKLFUiLCJmaWxlIjoiUmVzdFNlcnZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBLbm4gZnJvbSAnLi9Lbm4nO1xuaW1wb3J0IEtNZWFucyBmcm9tICcuL0tNZWFucyc7XG5cbmNvbnN0IGV4cHJlc3MgPSByZXF1aXJlKCdleHByZXNzJyk7XG5jb25zdCBib2R5UGFyc2VyID0gcmVxdWlyZSgnYm9keS1wYXJzZXInKTtcbmNvbnN0IFV0aWxzID0gcmVxdWlyZSgnLi9VdGlscy5qcycpO1xuY29uc3QgaHR0cCA9IHJlcXVpcmUoJ2h0dHAnKTtcbmNvbnN0IGZzID0gcmVxdWlyZShcImZzXCIpO1xuXG5cbi8qKlxuICogUmVzdFNlcnZlciBjbGFzcyBpcyB1c2VkIHRvIHBvd2VyIHRoZSByZXN0IHNlcnZlciB0aGF0IHdpbGwgY29tbXVuaWNhdGUgd2l0aCB0aGVcbiAqIG1vYmlsZSBwaG9uZSBvbiB0aGUgbG9jYWwgd2lmaSBuZXR3b3JrLiBUaGlzIHNlcnZlciB3aWxsIHJlc3BvbmQgdG8gdXBucCBkZXZpY2VzXG4gKiB3aXRoIHRoZSBkZXZpY2UgZGVzY3JpcHRpb24geG1sIGZpbGUgYXMgd2VsbCBhcyBoYW5kbGUgYWxsIHNhdmluZyBhbmQgZmV0Y2hpbmcgb2YgZGF0YS5cbiAqXG4gKiBUaGUgcmVzdCBzZXJ2ZXIgdXNlcyBleHByZXNzLmpzIGFuZCBsaXN0ZW5zIG9uIGEgcG9ydCBjb25maWd1cmVkIGJ5IGJ1aWxkZXJfcmVzdF9wb3J0XG4gKiBwYXJhbWV0ZXIgaW4gdGhlIHBhY2thZ2UuanNvbiBmaWxlIHdpdGhpbiB0aGUgcHVibGljIGZvbGRlclxuICpcbiAqIEBhdXRob3IgUmljaCBXYW5kZWxsIDxyaWNod2FuZGVsbEBnbWFpbC5jb20+XG4gKi9cbmNsYXNzIFJlc3RTZXJ2ZXJ7XG5cbiAgICBjb25zdHJ1Y3RvcihzZXJ2ZXI6IFNlcnZlcil7XG4gICAgICAgIHRoaXMud29ya2VyID0gc2VydmVyO1xuICAgICAgICB0aGlzLmlkID0gc2VydmVyLmlkO1xuICAgICAgICB0aGlzLmxvZyA9IHNlcnZlci5sb2c7XG4gICAgICAgIHRoaXMuZGIgPSBzZXJ2ZXIuZGI7XG5cbiAgICAgICAgdGhpcy5hcHAgPSBleHByZXNzKCk7XG4gICAgICAgIHRoaXMuYXBwLnVzZShib2R5UGFyc2VyLmpzb24oe2xpbWl0OiAnNTBtYid9KSk7XG4gICAgICAgIHRoaXMuYXBwLnVzZShib2R5UGFyc2VyLnVybGVuY29kZWQoeyBleHRlbmRlZDogdHJ1ZSwgbGltaXQ6ICc1MG1iJyB9KSk7XG4gICAgICAgIHRoaXMuYXBwLnVzZSgnL2J1aWxkZXInLCBleHByZXNzLnN0YXRpYygnYnVpbGRlcicpKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNhdmUgaGFuZGxlciBmb3Igc2F2aW5nIGxheW91dCBpbWFnZXMgZnJvbSB0aGUgVUlcbiAgICAgKiBAcGFyYW0gcmVxXG4gICAgICogQHBhcmFtIHJlc1xuICAgICAqL1xuICAgIHVwZGF0ZURhdGFiYXNlKHJlcSwgcmVzKXtcbiAgICAgICAgbGV0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBjb25zdCBkYXRhID0gcmVxLmJvZHk7XG4gICAgICAgIGxldCBjbGVhbkRhdGEgPSB7fTtcbiAgICAgICAgbGV0IGVycm9yID0gZmFsc2U7XG5cbiAgICAgICAgbG9nLmxvZyhcIi9yZXN0L3VwZGF0ZURhdGFiYXNlXCIpO1xuICAgICAgICB0aGlzLnNldFJlc3BvbnNlSGVhZGVycyhyZXMpO1xuXG4gICAgICAgIGlmKHR5cGVvZihkYXRhLmxheW91dF9pbWFnZXMpICE9IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICAgICAgaWYoZGF0YS5sYXlvdXRfaW1hZ2VzLmxlbmd0aCA+IDApe1xuICAgICAgICAgICAgICAgIGNsZWFuRGF0YS5sYXlvdXRfaW1hZ2VzID0gZGF0YS5sYXlvdXRfaW1hZ2VzO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgZXJyb3IgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGVycm9yID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCFlcnJvcil7XG4gICAgICAgICAgICBkYi51cGRhdGVEYXRhYmFzZShjbGVhbkRhdGEsIGZ1bmN0aW9uKGVyciwgcm93cyl7XG4gICAgICAgICAgICAgICAgcmVzLnNlbmQoe3N1Y2Nlc3M6IHRydWV9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHJlcy5zZW5kKHtzdWNjZXNzOiBmYWxzZX0pO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9nLmxvZyhyZXEuYm9keSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgZGV2aWNlIGRlc2NyaXB0aW9uIHhtbCBmaWxlIGZvciB1cG5wIHJlYWRlcnNcbiAgICAgKiBAcGFyYW0gcmVxXG4gICAgICogQHBhcmFtIHJlc1xuICAgICAqL1xuICAgIGdldERldmljZURlc2NyaXB0aW9uKHJlcSwgcmVzKXtcbiAgICAgICAgbGV0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBsZXQgaWQgPSB0aGlzLmlkO1xuICAgICAgICBsb2cubG9nKFwiZGV2aWNlZGVzY3JpcHRpb24ueG1sXCIpO1xuICAgICAgICBmcy5yZWFkRmlsZSgnZGV2aWNlZGVzY3JpcHRpb24ueG1sJywgXCJiaW5hcnlcIiwgZnVuY3Rpb24gKGVyciwgZmlsZSkge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHJlcy5oZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgXCJ0ZXh0L3BsYWluXCIpO1xuICAgICAgICAgICAgICAgIHJlcy5zdGF0dXMoNTAwKS5zZW5kKGVycik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmlsZSA9IGZpbGUucmVwbGFjZSgvXFx7XFx7VUROXFx9XFx9LywgXCJ1dWlkOlwiICsgaWQpO1xuICAgICAgICAgICAgZmlsZSA9IGZpbGUucmVwbGFjZSgvXFx7XFx7RU5EXFx9XFx9LywgXCJodHRwOi8vXCIgKyBVdGlscy5nZXRTZXJ2ZXJJcCgpICsgXCI6ODg4OC9yZXN0L1wiKTtcbiAgICAgICAgICAgIHJlcy5oZWFkZXIoXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIiwgXCIqXCIpO1xuICAgICAgICAgICAgcmVzLmhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcInRleHQveG1sXCIpO1xuICAgICAgICAgICAgcmVzLnNlbmQoZmlsZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYWxsIG9mIHRoZSBsYXlvdXQgaW1hZ2UgcmVjb3JkcyBhcyBhIGpzb24gYXJyYXlcbiAgICAgKiBAcGFyYW0gcmVxXG4gICAgICogQHBhcmFtIHJlc1xuICAgICAqL1xuICAgIGdldEZsb29ycGxhbnMocmVxLCByZXMpe1xuICAgICAgICBsZXQgbG9nID0gdGhpcy5sb2c7XG4gICAgICAgIGxldCBkYiA9IHRoaXMuZGI7XG4gICAgICAgIGxvZy5sb2coXCIvcmVzdC9mbG9vcnBsYW5zXCIpO1xuICAgICAgICBkYi5nZXRGbG9vclBsYW5zKGZ1bmN0aW9uKGVyciwgcm93cyl7XG4gICAgICAgICAgICByb3dzLmZvckVhY2goZnVuY3Rpb24ocm93KXtcbiAgICAgICAgICAgICAgICBpZih0eXBlb2Yocm93LmxheW91dF9pbWFnZSkgIT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgICAgICAgICAgICAgIHJvdy5sYXlvdXRfaW1hZ2UgPSBKU09OLnBhcnNlKHJvdy5sYXlvdXRfaW1hZ2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmVzLnNlbmQocm93cyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldFNjYW5uZWRDb29yZHMocmVxLCByZXMpe1xuICAgICAgICBsZXQgbG9nID0gdGhpcy5sb2c7XG4gICAgICAgIGxldCBkYiA9IHRoaXMuZGI7XG4gICAgICAgIGNvbnN0IGRhdGEgPSByZXEucGFyYW1zO1xuICAgICAgICBsb2cubG9nKFwiL3Jlc3QvZ2V0U2Nhbm5lZENvb3Jkc1wiKTtcbiAgICAgICAgZGIuZ2V0U2Nhbm5lZENvb3JkcyhkYXRhLmZwX2lkLCBmdW5jdGlvbihlcnIsIHJvd3Mpe1xuICAgICAgICAgICAgcmVzLnNlbmQocm93cyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHNhdmVSZWFkaW5ncyhyZXEsIHJlcyl7XG4gICAgICAgIGxldCBsb2cgPSB0aGlzLmxvZztcbiAgICAgICAgbG9nLmxvZyhcIi9yZXN0L3NhdmVSZWFkaW5nc1wiKTtcbiAgICAgICAgY29uc3QgZGF0YSA9IHJlcS5ib2R5O1xuICAgICAgICBsb2cubG9nKGRhdGEpO1xuICAgICAgICBpZih0eXBlb2YoZGF0YS5wYXlsb2FkKSA9PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgICAgIHJldHVybiByZXMuc2VuZCh7c3VjY2VzczogZmFsc2UsIG1lc3NhZ2U6IFwibWlzc2luZyBwYXlsb2FkXCJ9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRiLnNhdmVSZWFkaW5ncyhkYXRhLnBheWxvYWQsICgpID0+IHtcbiAgICAgICAgICAgIHJlcy5zZW5kKHtzdWNjZXNzOiB0cnVlfSk7XG4gICAgICAgICAgICB0aGlzLm5vdGlmeUxpc3RlbmVycyh7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiAnTkVXX1JFQURJTkcnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICBnZXRMYXlvdXRJbmZvKHJlcSwgcmVzKXtcbiAgICAgICAgbGV0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBsb2cubG9nKFwiL3Jlc3QvbGF5b3V0X2luZm8vYWxsXCIpO1xuICAgICAgICB0aGlzLnNldFJlc3BvbnNlSGVhZGVycyhyZXMpO1xuXG4gICAgICAgIHRoaXMuZGIuZ2V0TGF5b3V0SW5mbyhmdW5jdGlvbihlcnIsIHJvd3Mpe1xuICAgICAgICAgICAgcmVzLnNlbmQoe1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgcGF5bG9hZDogcm93c1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHNldFJlc3BvbnNlSGVhZGVycyhyZXMpe1xuICAgICAgICByZXMuaGVhZGVyKFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCIsIFwiKlwiKTtcbiAgICAgICAgcmVzLmhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQnKTtcbiAgICAgICAgcmVzLmhlYWRlcihcIkNhY2hlLUNvbnRyb2xcIiwgXCJuby1jYWNoZVwiKTtcbiAgICB9XG5cbiAgICBsb2NhbGl6ZShyZXEsIHJlcykge1xuICAgICAgICB0aGlzLmxvZy5sb2coJy9yZXN0L2xvY2FsaXplJyk7XG4gICAgICAgIHRoaXMubG9nLmxvZyhyZXEuYm9keS5hcF9pZHMpO1xuXG4gICAgICAgIGNvbnN0IGRhdGEgPSByZXEuYm9keTtcbiAgICAgICAgbGV0IGtubiA9IG5ldyBLbm4odGhpcy5sb2csIHRoaXMuZGIsIGRhdGEuZnBfaWQsIGRhdGEuYXBfaWRzKTtcbiAgICAgICAga25uLmdldE5laWdoYm9ycyg1LCAoa25uKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmxvZy5sb2coa25uKTtcbiAgICAgICAgICAgIGxldCBrbSA9IG5ldyBLTWVhbnMoMiwga25uKTtcbiAgICAgICAgICAgIGNvbnN0IGxhcmdlc3RDbHVzdGVyID0ga20uZ2V0TGFyZ2VzdENsdXN0ZXJJbmRleCgpO1xuICAgICAgICAgICAgY29uc3QgZ3Vlc3MgPSBrbS5nZXRDZW50cm9pZChsYXJnZXN0Q2x1c3Rlcik7XG4gICAgICAgICAgICBjb25zdCBpZCA9IGRhdGEuZGV2aWNlX2lkO1xuXG5cbiAgICAgICAgICAgIHJlcy5zZW5kKHtcbiAgICAgICAgICAgICAgICBzdWNjZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgZ3Vlc3M6IGd1ZXNzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246ICdMT0NBTElaRScsXG4gICAgICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgICAgIGd1ZXNzOiBndWVzcyxcbiAgICAgICAgICAgICAgICB0eXBlOiBkYXRhLnR5cGVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBub3RpZnlMaXN0ZW5lcnMoZGF0YTogT2JqZWN0KSB7XG4gICAgICAgIHRoaXMud29ya2VyLnNlbmQoZGF0YSk7XG4gICAgfVxuXG4gICAganNvbkhlYWRlcnMocmVxLCByZXMsIG5leHQpe1xuICAgICAgICByZXMuaGVhZGVyKFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCIsIFwiKlwiKTtcbiAgICAgICAgcmVzLmhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQnKTtcbiAgICAgICAgcmVzLmhlYWRlcihcIkNhY2hlLUNvbnRyb2xcIiwgXCJuby1jYWNoZVwiKTtcbiAgICAgICAgbmV4dCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJvdXRlcyBhcmUgZGVmaW5lZCBoZXJlIGFuZCBtYXBwZWQgdG8gYWN0aW9uc1xuICAgICAqL1xuICAgIGNyZWF0ZVNlcnZlcigpIHtcbiAgICAgICAgY29uc3QgYXBwID0gdGhpcy5hcHA7XG5cbiAgICAgICAgYXBwLnBvc3QoJy9yZXN0L2xvY2FsaXplJywgdGhpcy5qc29uSGVhZGVycywgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmxvY2FsaXplKHJlcSwgcmVzKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXBwLmdldCgnL3Jlc3QvYWxpdmUnLCB0aGlzLmpzb25IZWFkZXJzLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHJlcy5zZW5kKHtzdWNjZXNzOiB0cnVlfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFwcC5wb3N0KCcvcmVzdC91cGRhdGVEYXRhYmFzZScsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVEYXRhYmFzZShyZXEsIHJlcyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFwcC5nZXQoJy9kZXZpY2VkZXNjcmlwdGlvbi54bWwnLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZ2V0RGV2aWNlRGVzY3JpcHRpb24ocmVxLCByZXMpO1xuICAgICAgICB9KTtcblxuICAgICAgICBhcHAuZ2V0KFwiL2ljb24yNC5wbmdcIiwgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmxvZy5sb2coXCJpY29uMjQucG5nXCIpO1xuICAgICAgICAgICAgcmVzLmhlYWRlcihcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiLCBcIipcIik7XG4gICAgICAgICAgICByZXMuc2VuZEZpbGUocHJvY2Vzcy5jd2QoKSArICcvc3JjL2ljb24yNC5wbmcnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXBwLmdldChcIi9yZXN0L2Zsb29ycGxhbnNcIiwgdGhpcy5qc29uSGVhZGVycywgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmdldEZsb29ycGxhbnMocmVxLCByZXMpO1xuICAgICAgICB9KTtcblxuICAgICAgICBhcHAucG9zdChcIi9yZXN0L3NhdmVSZWFkaW5nc1wiLCB0aGlzLmpzb25IZWFkZXJzLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2F2ZVJlYWRpbmdzKHJlcSwgcmVzKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXBwLmdldChcIi9yZXN0L2dldFNjYW5uZWRDb29yZHMvOmZwX2lkXCIsIHRoaXMuanNvbkhlYWRlcnMsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgdGhpcy5nZXRTY2FubmVkQ29vcmRzKHJlcSwgcmVzKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5zZXJ2ZXIgPSBodHRwLmNyZWF0ZVNlcnZlcihhcHApO1xuXG4gICAgfVxuXG4gICAgbGlzdGVuKHBvcnQpe1xuICAgICAgICB0aGlzLnNlcnZlci5saXN0ZW4ocG9ydCk7XG4gICAgfVxuXG4gICAgZ2V0QXBwKCk6IGV4cHJlc3Mge1xuICAgICAgICByZXR1cm4gdGhpcy5hcHA7XG4gICAgfVxuXG4gICAgZ2V0U2VydmVyKCk6IFNlcnZlciB7XG4gICAgICAgIHJldHVybiB0aGlzLnNlcnZlclxuICAgIH1cblxuICAgIGdldExvZygpOiBMb2cge1xuICAgICAgICByZXR1cm4gdGhpcy5sb2c7XG4gICAgfVxufVxuXG5cbmV4cG9ydCBkZWZhdWx0IFJlc3RTZXJ2ZXI7Il19
//# sourceMappingURL=RestServer.js.map
