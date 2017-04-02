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
            console.log(process.pid);
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

            var db = this.db;
            var log = this.log;
            var app = this.app;
            db.createTables(log);

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

            app.get("/rest/floorplans", function (req, res) {
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
        value: function listen(worker, port) {
            this.worker = worker;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvUmVzdFNlcnZlci5lczYiXSwibmFtZXMiOlsiZXhwcmVzcyIsInJlcXVpcmUiLCJib2R5UGFyc2VyIiwicGpzb24iLCJMb2dnZXIiLCJEYiIsImZzIiwiVXRpbHMiLCJ1dWlkIiwiaHR0cCIsIlJlc3RTZXJ2ZXIiLCJpZCIsInY0Iiwib2xkVVVJRCIsInJlYWRGaWxlU3luYyIsImUiLCJ3cml0ZUZpbGVTeW5jIiwibG9nIiwibG9nZm9sZGVyIiwiYnVpbGRlcl9sb2dfZm9sZGVyIiwiZmlsZW5hbWUiLCJmaWxlc2l6ZSIsIm51bWZpbGVzIiwiZGIiLCJhcHAiLCJ1c2UiLCJqc29uIiwibGltaXQiLCJ1cmxlbmNvZGVkIiwiZXh0ZW5kZWQiLCJzdGF0aWMiLCJyZXEiLCJyZXMiLCJkYXRhIiwiYm9keSIsImNsZWFuRGF0YSIsImVycm9yIiwic2V0UmVzcG9uc2VIZWFkZXJzIiwibGF5b3V0X2ltYWdlcyIsImxlbmd0aCIsInVwZGF0ZURhdGFiYXNlIiwiZXJyIiwicm93cyIsInNlbmQiLCJzdWNjZXNzIiwicmVhZEZpbGUiLCJmaWxlIiwiaGVhZGVyIiwic3RhdHVzIiwicmVwbGFjZSIsImdldFNlcnZlcklwIiwiZ2V0Rmxvb3JQbGFucyIsImZvckVhY2giLCJyb3ciLCJsYXlvdXRfaW1hZ2UiLCJKU09OIiwicGFyc2UiLCJwYXJhbXMiLCJnZXRTY2FubmVkQ29vcmRzIiwiZnBfaWQiLCJwYXlsb2FkIiwibWVzc2FnZSIsInNhdmVSZWFkaW5ncyIsIm5vdGlmeUxpc3RlbmVycyIsImFjdGlvbiIsImdldExheW91dEluZm8iLCJhcF9pZHMiLCJrbm4iLCJnZXROZWlnaGJvcnMiLCJrbSIsImxhcmdlc3RDbHVzdGVyIiwiZ2V0TGFyZ2VzdENsdXN0ZXJJbmRleCIsImd1ZXNzIiwiZ2V0Q2VudHJvaWQiLCJkZXZpY2VfaWQiLCJzdWNjZXMiLCJ0eXBlIiwiY29uc29sZSIsInByb2Nlc3MiLCJwaWQiLCJ3b3JrZXIiLCJuZXh0IiwiY3JlYXRlVGFibGVzIiwicG9zdCIsImpzb25IZWFkZXJzIiwibG9jYWxpemUiLCJnZXQiLCJnZXREZXZpY2VEZXNjcmlwdGlvbiIsInNlbmRGaWxlIiwiY3dkIiwiZ2V0Rmxvb3JwbGFucyIsInNlcnZlciIsImNyZWF0ZVNlcnZlciIsInBvcnQiLCJsaXN0ZW4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7Ozs7Ozs7QUFDQSxJQUFNQSxVQUFVQyxRQUFRLFNBQVIsQ0FBaEI7QUFDQSxJQUFNQyxhQUFhRCxRQUFRLGFBQVIsQ0FBbkI7QUFDQSxJQUFNRSxRQUFRRixRQUFRLG9CQUFSLENBQWQ7QUFDQSxJQUFNRyxTQUFTSCxRQUFRLFVBQVIsQ0FBZjtBQUNBLElBQUlJLEtBQUtKLFFBQVEsU0FBUixDQUFUO0FBQ0EsSUFBTUssS0FBS0wsUUFBUSxJQUFSLENBQVg7QUFDQSxJQUFNTSxRQUFRTixRQUFRLFlBQVIsQ0FBZDtBQUNBLElBQU1PLE9BQU9QLFFBQVEsTUFBUixDQUFiO0FBQ0EsSUFBTVEsT0FBT1IsUUFBUSxNQUFSLENBQWI7O0FBSUE7Ozs7Ozs7Ozs7O0lBVU1TLFU7QUFFRiwwQkFBYTtBQUFBOztBQUNULGFBQUtDLEVBQUwsR0FBVUgsS0FBS0ksRUFBTCxFQUFWO0FBQ0EsWUFBSTtBQUNBLGdCQUFJQyxVQUFVUCxHQUFHUSxZQUFILENBQWdCLE9BQWhCLEVBQXlCLE1BQXpCLENBQWQ7QUFDQSxpQkFBS0gsRUFBTCxHQUFVRSxPQUFWO0FBQ0gsU0FIRCxDQUdDLE9BQU1FLENBQU4sRUFBUTtBQUNMVCxlQUFHVSxhQUFILENBQWlCLE9BQWpCLEVBQTBCLEtBQUtMLEVBQS9CO0FBQ0g7O0FBRUQsYUFBS00sR0FBTCxHQUFXLElBQUliLE1BQUosQ0FBVztBQUNsQmMsdUJBQVdmLE1BQU1nQixrQkFEQztBQUVsQkMsc0JBQVUsVUFGUTtBQUdsQkMsc0JBQVUsT0FIUTtBQUlsQkMsc0JBQVU7QUFKUSxTQUFYLENBQVg7QUFNQSxhQUFLQyxFQUFMLEdBQVUsSUFBSWxCLEVBQUos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QWNsRixLQUFLbUYsWUFBTCxDQUFrQnBFLEdBQWxCLENBQWQ7QUFFSDs7OytCQUVNd0QsTSxFQUFRYSxJLEVBQUs7QUFDaEIsaUJBQUtiLE1BQUwsR0FBY0EsTUFBZDtBQUNBLGlCQUFLVyxNQUFMLENBQVlHLE1BQVosQ0FBbUJELElBQW5CO0FBQ0g7OztpQ0FFaUI7QUFDZCxtQkFBTyxLQUFLckUsR0FBWjtBQUNIOzs7b0NBRW1CO0FBQ2hCLG1CQUFPLEtBQUttRSxNQUFaO0FBQ0g7OztpQ0FFYTtBQUNWLG1CQUFPLEtBQUsxRSxHQUFaO0FBQ0g7Ozs7OztrQkFJVVAsVSIsImZpbGUiOiJSZXN0U2VydmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEtubiBmcm9tICcuL0tubic7XG5pbXBvcnQgS01lYW5zIGZyb20gJy4vS01lYW5zJztcbmNvbnN0IGV4cHJlc3MgPSByZXF1aXJlKCdleHByZXNzJyk7XG5jb25zdCBib2R5UGFyc2VyID0gcmVxdWlyZSgnYm9keS1wYXJzZXInKTtcbmNvbnN0IHBqc29uID0gcmVxdWlyZSgnLi4vLi4vcGFja2FnZS5qc29uJyk7XG5jb25zdCBMb2dnZXIgPSByZXF1aXJlKCcuL0xvZy5qcycpO1xubGV0IERiID0gcmVxdWlyZSgnLi9EYi5qcycpO1xuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuY29uc3QgVXRpbHMgPSByZXF1aXJlKCcuL1V0aWxzLmpzJyk7XG5jb25zdCB1dWlkID0gcmVxdWlyZSgndXVpZCcpO1xuY29uc3QgaHR0cCA9IHJlcXVpcmUoJ2h0dHAnKTtcblxuXG5cbi8qKlxuICogUmVzdFNlcnZlciBjbGFzcyBpcyB1c2VkIHRvIHBvd2VyIHRoZSByZXN0IHNlcnZlciB0aGF0IHdpbGwgY29tbXVuaWNhdGUgd2l0aCB0aGVcbiAqIG1vYmlsZSBwaG9uZSBvbiB0aGUgbG9jYWwgd2lmaSBuZXR3b3JrLiBUaGlzIHNlcnZlciB3aWxsIHJlc3BvbmQgdG8gdXBucCBkZXZpY2VzXG4gKiB3aXRoIHRoZSBkZXZpY2UgZGVzY3JpcHRpb24geG1sIGZpbGUgYXMgd2VsbCBhcyBoYW5kbGUgYWxsIHNhdmluZyBhbmQgZmV0Y2hpbmcgb2YgZGF0YS5cbiAqXG4gKiBUaGUgcmVzdCBzZXJ2ZXIgdXNlcyBleHByZXNzLmpzIGFuZCBsaXN0ZW5zIG9uIGEgcG9ydCBjb25maWd1cmVkIGJ5IGJ1aWxkZXJfcmVzdF9wb3J0XG4gKiBwYXJhbWV0ZXIgaW4gdGhlIHBhY2thZ2UuanNvbiBmaWxlIHdpdGhpbiB0aGUgcHVibGljIGZvbGRlclxuICpcbiAqIEBhdXRob3IgUmljaCBXYW5kZWxsIDxyaWNod2FuZGVsbEBnbWFpbC5jb20+XG4gKi9cbmNsYXNzIFJlc3RTZXJ2ZXJ7XG5cbiAgICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgICB0aGlzLmlkID0gdXVpZC52NCgpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IG9sZFVVSUQgPSBmcy5yZWFkRmlsZVN5bmMoXCIudXVpZFwiLCBcInV0ZjhcIik7XG4gICAgICAgICAgICB0aGlzLmlkID0gb2xkVVVJRDtcbiAgICAgICAgfWNhdGNoKGUpe1xuICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhcIi51dWlkXCIsIHRoaXMuaWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5sb2cgPSBuZXcgTG9nZ2VyKHtcbiAgICAgICAgICAgIGxvZ2ZvbGRlcjogcGpzb24uYnVpbGRlcl9sb2dfZm9sZGVyLFxuICAgICAgICAgICAgZmlsZW5hbWU6IFwicmVzdC5sb2dcIixcbiAgICAgICAgICAgIGZpbGVzaXplOiA1MDAwMDAwLFxuICAgICAgICAgICAgbnVtZmlsZXM6IDNcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZGIgPSBuZXcgRGIodGhpcy5sb2cpO1xuICAgICAgICB0aGlzLmFwcCA9IGV4cHJlc3MoKTtcbiAgICAgICAgdGhpcy5hcHAudXNlKGJvZHlQYXJzZXIuanNvbih7bGltaXQ6ICc1MG1iJ30pKTtcbiAgICAgICAgdGhpcy5hcHAudXNlKGJvZHlQYXJzZXIudXJsZW5jb2RlZCh7IGV4dGVuZGVkOiB0cnVlLCBsaW1pdDogJzUwbWInIH0pKTtcbiAgICAgICAgdGhpcy5hcHAudXNlKCcvYnVpbGRlcicsIGV4cHJlc3Muc3RhdGljKCdidWlsZGVyJykpXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2F2ZSBoYW5kbGVyIGZvciBzYXZpbmcgbGF5b3V0IGltYWdlcyBmcm9tIHRoZSBVSVxuICAgICAqIEBwYXJhbSByZXFcbiAgICAgKiBAcGFyYW0gcmVzXG4gICAgICovXG4gICAgdXBkYXRlRGF0YWJhc2UocmVxLCByZXMpe1xuICAgICAgICBsZXQgbG9nID0gdGhpcy5sb2c7XG4gICAgICAgIGxldCBkYiA9IHRoaXMuZGI7XG4gICAgICAgIGNvbnN0IGRhdGEgPSByZXEuYm9keTtcbiAgICAgICAgbGV0IGNsZWFuRGF0YSA9IHt9O1xuICAgICAgICBsZXQgZXJyb3IgPSBmYWxzZTtcblxuICAgICAgICBsb2cubG9nKFwiL3Jlc3QvdXBkYXRlRGF0YWJhc2VcIik7XG4gICAgICAgIHRoaXMuc2V0UmVzcG9uc2VIZWFkZXJzKHJlcyk7XG5cbiAgICAgICAgaWYodHlwZW9mKGRhdGEubGF5b3V0X2ltYWdlcykgIT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgICAgICBpZihkYXRhLmxheW91dF9pbWFnZXMubGVuZ3RoID4gMCl7XG4gICAgICAgICAgICAgICAgY2xlYW5EYXRhLmxheW91dF9pbWFnZXMgPSBkYXRhLmxheW91dF9pbWFnZXM7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBlcnJvciA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgZXJyb3IgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoIWVycm9yKXtcbiAgICAgICAgICAgIGRiLnVwZGF0ZURhdGFiYXNlKGNsZWFuRGF0YSwgZnVuY3Rpb24oZXJyLCByb3dzKXtcbiAgICAgICAgICAgICAgICByZXMuc2VuZCh7c3VjY2VzczogdHJ1ZX0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgcmVzLnNlbmQoe3N1Y2Nlc3M6IGZhbHNlfSk7XG4gICAgICAgIH1cblxuICAgICAgICBsb2cubG9nKHJlcS5ib2R5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBkZXZpY2UgZGVzY3JpcHRpb24geG1sIGZpbGUgZm9yIHVwbnAgcmVhZGVyc1xuICAgICAqIEBwYXJhbSByZXFcbiAgICAgKiBAcGFyYW0gcmVzXG4gICAgICovXG4gICAgZ2V0RGV2aWNlRGVzY3JpcHRpb24ocmVxLCByZXMpe1xuICAgICAgICBsZXQgbG9nID0gdGhpcy5sb2c7XG4gICAgICAgIGxldCBpZCA9IHRoaXMuaWQ7XG4gICAgICAgIGxvZy5sb2coXCJkZXZpY2VkZXNjcmlwdGlvbi54bWxcIik7XG4gICAgICAgIGZzLnJlYWRGaWxlKCdkZXZpY2VkZXNjcmlwdGlvbi54bWwnLCBcImJpbmFyeVwiLCBmdW5jdGlvbiAoZXJyLCBmaWxlKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmVzLmhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcInRleHQvcGxhaW5cIik7XG4gICAgICAgICAgICAgICAgcmVzLnN0YXR1cyg1MDApLnNlbmQoZXJyKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaWxlID0gZmlsZS5yZXBsYWNlKC9cXHtcXHtVRE5cXH1cXH0vLCBcInV1aWQ6XCIgKyBpZCk7XG4gICAgICAgICAgICBmaWxlID0gZmlsZS5yZXBsYWNlKC9cXHtcXHtFTkRcXH1cXH0vLCBcImh0dHA6Ly9cIiArIFV0aWxzLmdldFNlcnZlcklwKCkgKyBcIjo4ODg4L3Jlc3QvXCIpO1xuICAgICAgICAgICAgcmVzLmhlYWRlcihcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiLCBcIipcIik7XG4gICAgICAgICAgICByZXMuaGVhZGVyKFwiQ29udGVudC1UeXBlXCIsIFwidGV4dC94bWxcIik7XG4gICAgICAgICAgICByZXMuc2VuZChmaWxlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhbGwgb2YgdGhlIGxheW91dCBpbWFnZSByZWNvcmRzIGFzIGEganNvbiBhcnJheVxuICAgICAqIEBwYXJhbSByZXFcbiAgICAgKiBAcGFyYW0gcmVzXG4gICAgICovXG4gICAgZ2V0Rmxvb3JwbGFucyhyZXEsIHJlcyl7XG4gICAgICAgIGxldCBsb2cgPSB0aGlzLmxvZztcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgbG9nLmxvZyhcIi9yZXN0L2Zsb29ycGxhbnNcIik7XG4gICAgICAgIHRoaXMuc2V0UmVzcG9uc2VIZWFkZXJzKHJlcyk7XG4gICAgICAgIGRiLmdldEZsb29yUGxhbnMoZnVuY3Rpb24oZXJyLCByb3dzKXtcbiAgICAgICAgICAgIHJvd3MuZm9yRWFjaChmdW5jdGlvbihyb3cpe1xuICAgICAgICAgICAgICAgIGlmKHR5cGVvZihyb3cubGF5b3V0X2ltYWdlKSAhPSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgICAgICAgICAgICAgcm93LmxheW91dF9pbWFnZSA9IEpTT04ucGFyc2Uocm93LmxheW91dF9pbWFnZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXMuc2VuZChyb3dzKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0U2Nhbm5lZENvb3JkcyhyZXEsIHJlcyl7XG4gICAgICAgIGxldCBsb2cgPSB0aGlzLmxvZztcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgY29uc3QgZGF0YSA9IHJlcS5wYXJhbXM7XG4gICAgICAgIGxvZy5sb2coXCIvcmVzdC9nZXRTY2FubmVkQ29vcmRzXCIpO1xuICAgICAgICBkYi5nZXRTY2FubmVkQ29vcmRzKGRhdGEuZnBfaWQsIGZ1bmN0aW9uKGVyciwgcm93cyl7XG4gICAgICAgICAgICByZXMuc2VuZChyb3dzKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2F2ZVJlYWRpbmdzKHJlcSwgcmVzKXtcbiAgICAgICAgbGV0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBsb2cubG9nKFwiL3Jlc3Qvc2F2ZVJlYWRpbmdzXCIpO1xuICAgICAgICBjb25zdCBkYXRhID0gcmVxLmJvZHk7XG4gICAgICAgIGxvZy5sb2coZGF0YSk7XG4gICAgICAgIGlmKHR5cGVvZihkYXRhLnBheWxvYWQpID09IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5zZW5kKHtzdWNjZXNzOiBmYWxzZSwgbWVzc2FnZTogXCJtaXNzaW5nIHBheWxvYWRcIn0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZGIuc2F2ZVJlYWRpbmdzKGRhdGEucGF5bG9hZCwgKCkgPT4ge1xuICAgICAgICAgICAgcmVzLnNlbmQoe3N1Y2Nlc3M6IHRydWV9KTtcbiAgICAgICAgICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246ICdORVdfUkVBRElORydcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIGdldExheW91dEluZm8ocmVxLCByZXMpe1xuICAgICAgICBsZXQgbG9nID0gdGhpcy5sb2c7XG4gICAgICAgIGxvZy5sb2coXCIvcmVzdC9sYXlvdXRfaW5mby9hbGxcIik7XG4gICAgICAgIHRoaXMuc2V0UmVzcG9uc2VIZWFkZXJzKHJlcyk7XG5cbiAgICAgICAgdGhpcy5kYi5nZXRMYXlvdXRJbmZvKGZ1bmN0aW9uKGVyciwgcm93cyl7XG4gICAgICAgICAgICByZXMuc2VuZCh7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBwYXlsb2FkOiByb3dzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2V0UmVzcG9uc2VIZWFkZXJzKHJlcyl7XG4gICAgICAgIHJlcy5oZWFkZXIoXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIiwgXCIqXCIpO1xuICAgICAgICByZXMuaGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vamF2YXNjcmlwdCcpO1xuICAgICAgICByZXMuaGVhZGVyKFwiQ2FjaGUtQ29udHJvbFwiLCBcIm5vLWNhY2hlXCIpO1xuICAgIH1cblxuICAgIGxvY2FsaXplKHJlcSwgcmVzKSB7XG4gICAgICAgIHRoaXMubG9nLmxvZygnL3Jlc3QvbG9jYWxpemUnKTtcbiAgICAgICAgdGhpcy5sb2cubG9nKHJlcS5ib2R5LmFwX2lkcyk7XG5cbiAgICAgICAgY29uc3QgZGF0YSA9IHJlcS5ib2R5O1xuICAgICAgICBsZXQga25uID0gbmV3IEtubih0aGlzLmxvZywgdGhpcy5kYiwgZGF0YS5mcF9pZCwgZGF0YS5hcF9pZHMpO1xuICAgICAgICBrbm4uZ2V0TmVpZ2hib3JzKDUsIChrbm4pID0+IHtcbiAgICAgICAgICAgIHRoaXMubG9nLmxvZyhrbm4pO1xuICAgICAgICAgICAgbGV0IGttID0gbmV3IEtNZWFucygyLCBrbm4pO1xuICAgICAgICAgICAgY29uc3QgbGFyZ2VzdENsdXN0ZXIgPSBrbS5nZXRMYXJnZXN0Q2x1c3RlckluZGV4KCk7XG4gICAgICAgICAgICBjb25zdCBndWVzcyA9IGttLmdldENlbnRyb2lkKGxhcmdlc3RDbHVzdGVyKTtcbiAgICAgICAgICAgIGNvbnN0IGlkID0gZGF0YS5kZXZpY2VfaWQ7XG5cblxuICAgICAgICAgICAgcmVzLnNlbmQoe1xuICAgICAgICAgICAgICAgIHN1Y2NlczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBndWVzczogZ3Vlc3NcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoe1xuICAgICAgICAgICAgICAgIGFjdGlvbjogJ0xPQ0FMSVpFJyxcbiAgICAgICAgICAgICAgICBpZDogaWQsXG4gICAgICAgICAgICAgICAgZ3Vlc3M6IGd1ZXNzLFxuICAgICAgICAgICAgICAgIHR5cGU6IGRhdGEudHlwZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG5vdGlmeUxpc3RlbmVycyhkYXRhOiBPYmplY3QpIHtcbiAgICAgICAgY29uc29sZS5sb2cocHJvY2Vzcy5waWQpO1xuICAgICAgICB0aGlzLndvcmtlci5zZW5kKGRhdGEpO1xuICAgIH1cblxuICAgIGpzb25IZWFkZXJzKHJlcSwgcmVzLCBuZXh0KXtcbiAgICAgICAgcmVzLmhlYWRlcihcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiLCBcIipcIik7XG4gICAgICAgIHJlcy5oZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qYXZhc2NyaXB0Jyk7XG4gICAgICAgIHJlcy5oZWFkZXIoXCJDYWNoZS1Db250cm9sXCIsIFwibm8tY2FjaGVcIik7XG4gICAgICAgIG5leHQoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSb3V0ZXMgYXJlIGRlZmluZWQgaGVyZSBhbmQgbWFwcGVkIHRvIGFjdGlvbnNcbiAgICAgKi9cbiAgICBjcmVhdGVTZXJ2ZXIoKSB7XG4gICAgICAgIGNvbnN0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgY29uc3QgbG9nID0gdGhpcy5sb2c7XG4gICAgICAgIGNvbnN0IGFwcCA9IHRoaXMuYXBwO1xuICAgICAgICBkYi5jcmVhdGVUYWJsZXMobG9nKTtcblxuICAgICAgICBhcHAucG9zdCgnL3Jlc3QvbG9jYWxpemUnLCB0aGlzLmpzb25IZWFkZXJzLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHRoaXMubG9jYWxpemUocmVxLCByZXMpO1xuICAgICAgICB9KTtcblxuICAgICAgICBhcHAuZ2V0KCcvcmVzdC9hbGl2ZScsIHRoaXMuanNvbkhlYWRlcnMsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgcmVzLnNlbmQoe3N1Y2Nlc3M6IHRydWV9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXBwLnBvc3QoJy9yZXN0L3VwZGF0ZURhdGFiYXNlJywgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZURhdGFiYXNlKHJlcSwgcmVzKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXBwLmdldCgnL2RldmljZWRlc2NyaXB0aW9uLnhtbCcsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgdGhpcy5nZXREZXZpY2VEZXNjcmlwdGlvbihyZXEsIHJlcyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFwcC5nZXQoXCIvaWNvbjI0LnBuZ1wiLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHRoaXMubG9nLmxvZyhcImljb24yNC5wbmdcIik7XG4gICAgICAgICAgICByZXMuaGVhZGVyKFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCIsIFwiKlwiKTtcbiAgICAgICAgICAgIHJlcy5zZW5kRmlsZShwcm9jZXNzLmN3ZCgpICsgJy9zcmMvaWNvbjI0LnBuZycpO1xuICAgICAgICB9KTtcblxuICAgICAgICBhcHAuZ2V0KFwiL3Jlc3QvZmxvb3JwbGFuc1wiLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZ2V0Rmxvb3JwbGFucyhyZXEsIHJlcyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFwcC5wb3N0KFwiL3Jlc3Qvc2F2ZVJlYWRpbmdzXCIsIHRoaXMuanNvbkhlYWRlcnMsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgdGhpcy5zYXZlUmVhZGluZ3MocmVxLCByZXMpO1xuICAgICAgICB9KTtcblxuICAgICAgICBhcHAuZ2V0KFwiL3Jlc3QvZ2V0U2Nhbm5lZENvb3Jkcy86ZnBfaWRcIiwgdGhpcy5qc29uSGVhZGVycywgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmdldFNjYW5uZWRDb29yZHMocmVxLCByZXMpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnNlcnZlciA9IGh0dHAuY3JlYXRlU2VydmVyKGFwcCk7XG5cbiAgICB9XG5cbiAgICBsaXN0ZW4od29ya2VyLCBwb3J0KXtcbiAgICAgICAgdGhpcy53b3JrZXIgPSB3b3JrZXI7XG4gICAgICAgIHRoaXMuc2VydmVyLmxpc3Rlbihwb3J0KTtcbiAgICB9XG5cbiAgICBnZXRBcHAoKTogZXhwcmVzcyB7XG4gICAgICAgIHJldHVybiB0aGlzLmFwcDtcbiAgICB9XG5cbiAgICBnZXRTZXJ2ZXIoKTogU2VydmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VydmVyXG4gICAgfVxuXG4gICAgZ2V0TG9nKCk6IExvZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmxvZztcbiAgICB9XG59XG5cblxuZXhwb3J0IGRlZmF1bHQgUmVzdFNlcnZlcjsiXX0=
//# sourceMappingURL=RestServer.js.map
