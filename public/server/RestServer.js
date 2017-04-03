'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Knn = require('./Knn');

var _Knn2 = _interopRequireDefault(_Knn);

var _KMeans = require('./KMeans');

var _KMeans2 = _interopRequireDefault(_KMeans);

var _ParticleFilter = require('./ParticleFilter');

var _ParticleFilter2 = _interopRequireDefault(_ParticleFilter);

var _Features = require('./Features');

var _Features2 = _interopRequireDefault(_Features);

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

            var data = req.body;
            var id = data.device_id;

            var stateParticles = [];
            if (this.worker.particles[id] !== undefined) {
                stateParticles = this.worker.particles[id];
            }
            var pf = new _ParticleFilter2.default(this.db, data.fp_id);
            pf.setParticles(stateParticles);

            var f = new _Features2.default();
            var features = f.makeFeatures(data.ap_ids);
            pf.move(features);
            var allParticles = pf.getParticles();
            this.worker.particles[id] = allParticles;

            var particles = pf.getParticleCoords();

            var knn = new _Knn2.default(this.db, data.fp_id);

            knn.getNeighbors(features, pf.getParticleKeys(), 5, function (knn) {
                var km = new _KMeans2.default(2, knn);
                var largestCluster = km.getLargestClusterIndex();
                var guess = km.getCentroid(largestCluster);

                res.send({
                    success: true,
                    guess: guess,
                    particles: particles
                });
                _this2.notifyListeners({
                    action: 'LOCALIZE',
                    id: id,
                    guess: guess,
                    type: data.type,
                    particles: particles,
                    fp_id: data.fp_id,
                    all_particles: allParticles
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvUmVzdFNlcnZlci5lczYiXSwibmFtZXMiOlsiZXhwcmVzcyIsInJlcXVpcmUiLCJib2R5UGFyc2VyIiwiVXRpbHMiLCJodHRwIiwiZnMiLCJSZXN0U2VydmVyIiwic2VydmVyIiwid29ya2VyIiwiaWQiLCJsb2ciLCJkYiIsImFwcCIsInVzZSIsImpzb24iLCJsaW1pdCIsInVybGVuY29kZWQiLCJleHRlbmRlZCIsInN0YXRpYyIsInJlcSIsInJlcyIsImRhdGEiLCJib2R5IiwiY2xlYW5EYXRhIiwiZXJyb3IiLCJzZXRSZXNwb25zZUhlYWRlcnMiLCJsYXlvdXRfaW1hZ2VzIiwibGVuZ3RoIiwidXBkYXRlRGF0YWJhc2UiLCJlcnIiLCJyb3dzIiwic2VuZCIsInN1Y2Nlc3MiLCJyZWFkRmlsZSIsImZpbGUiLCJoZWFkZXIiLCJzdGF0dXMiLCJyZXBsYWNlIiwiZ2V0U2VydmVySXAiLCJnZXRGbG9vclBsYW5zIiwiZm9yRWFjaCIsInJvdyIsImxheW91dF9pbWFnZSIsIkpTT04iLCJwYXJzZSIsInBhcmFtcyIsImdldFNjYW5uZWRDb29yZHMiLCJmcF9pZCIsInBheWxvYWQiLCJtZXNzYWdlIiwic2F2ZVJlYWRpbmdzIiwibm90aWZ5TGlzdGVuZXJzIiwiYWN0aW9uIiwiZ2V0TGF5b3V0SW5mbyIsImRldmljZV9pZCIsInN0YXRlUGFydGljbGVzIiwicGFydGljbGVzIiwidW5kZWZpbmVkIiwicGYiLCJzZXRQYXJ0aWNsZXMiLCJmIiwiZmVhdHVyZXMiLCJtYWtlRmVhdHVyZXMiLCJhcF9pZHMiLCJtb3ZlIiwiYWxsUGFydGljbGVzIiwiZ2V0UGFydGljbGVzIiwiZ2V0UGFydGljbGVDb29yZHMiLCJrbm4iLCJnZXROZWlnaGJvcnMiLCJnZXRQYXJ0aWNsZUtleXMiLCJrbSIsImxhcmdlc3RDbHVzdGVyIiwiZ2V0TGFyZ2VzdENsdXN0ZXJJbmRleCIsImd1ZXNzIiwiZ2V0Q2VudHJvaWQiLCJ0eXBlIiwiYWxsX3BhcnRpY2xlcyIsIm5leHQiLCJwb3N0IiwianNvbkhlYWRlcnMiLCJsb2NhbGl6ZSIsImdldCIsImdldERldmljZURlc2NyaXB0aW9uIiwic2VuZEZpbGUiLCJwcm9jZXNzIiwiY3dkIiwiZ2V0Rmxvb3JwbGFucyIsImNyZWF0ZVNlcnZlciIsInBvcnQiLCJsaXN0ZW4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7Ozs7O0FBRUEsSUFBTUEsVUFBVUMsUUFBUSxTQUFSLENBQWhCO0FBQ0EsSUFBTUMsYUFBYUQsUUFBUSxhQUFSLENBQW5CO0FBQ0EsSUFBTUUsUUFBUUYsUUFBUSxZQUFSLENBQWQ7QUFDQSxJQUFNRyxPQUFPSCxRQUFRLE1BQVIsQ0FBYjtBQUNBLElBQU1JLEtBQUtKLFFBQVEsSUFBUixDQUFYOztBQUdBOzs7Ozs7Ozs7OztJQVVNSyxVO0FBRUYsd0JBQVlDLE1BQVosRUFBMkI7QUFBQTs7QUFDdkIsYUFBS0MsTUFBTCxHQUFjRCxNQUFkO0FBQ0EsYUFBS0UsRUFBTCxHQUFVRixPQUFPRSxFQUFqQjtBQUNBLGFBQUtDLEdBQUwsR0FBV0gsT0FBT0csR0FBbEI7QUFDQSxhQUFLQyxFQUFMLEdBQVVKLE9BQU9JLEVBQWpCOztBQUVBLGFBQUtDLEdBQUwsR0FBV1osU0FBWDtBQUNBLGFBQUtZLEdBQUwsQ0FBU0MsR0FBVCxDQUFhWCxXQUFXWSxJQUFYLENBQWdCLEVBQUNDLE9BQU8sTUFBUixFQUFoQixDQUFiO0FBQ0EsYUFBS0gsR0FBTCxDQUFTQyxHQUFULENBQWFYLFdBQVdjLFVBQVgsQ0FBc0IsRUFBRUMsVUFBVSxJQUFaLEVBQWtCRixPQUFPLE1BQXpCLEVBQXRCLENBQWI7QUFDQSxhQUFLSCxHQUFMLENBQVNDLEdBQVQsQ0FBYSxVQUFiLEVBQXlCYixRQUFRa0IsTUFBUixDQUFlLFNBQWYsQ0FBekI7QUFDSDs7QUFFRDs7Ozs7Ozs7O3VDQUtlQyxHLEVBQUtDLEcsRUFBSTtBQUNwQixnQkFBSVYsTUFBTSxLQUFLQSxHQUFmO0FBQ0EsZ0JBQUlD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QUs3RSxHQUFaO0FBQ0g7OztvQ0FFbUI7QUFDaEIsbUJBQU8sS0FBS0wsTUFBWjtBQUNIOzs7aUNBRWE7QUFDVixtQkFBTyxLQUFLRyxHQUFaO0FBQ0g7Ozs7OztrQkFJVUosVSIsImZpbGUiOiJSZXN0U2VydmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEtubiBmcm9tICcuL0tubic7XG5pbXBvcnQgS01lYW5zIGZyb20gJy4vS01lYW5zJztcbmltcG9ydCBQYXJ0aWNsZUZpbHRlciBmcm9tICcuL1BhcnRpY2xlRmlsdGVyJztcbmltcG9ydCBGZWF0dXJlcyBmcm9tICcuL0ZlYXR1cmVzJztcblxuY29uc3QgZXhwcmVzcyA9IHJlcXVpcmUoJ2V4cHJlc3MnKTtcbmNvbnN0IGJvZHlQYXJzZXIgPSByZXF1aXJlKCdib2R5LXBhcnNlcicpO1xuY29uc3QgVXRpbHMgPSByZXF1aXJlKCcuL1V0aWxzLmpzJyk7XG5jb25zdCBodHRwID0gcmVxdWlyZSgnaHR0cCcpO1xuY29uc3QgZnMgPSByZXF1aXJlKFwiZnNcIik7XG5cblxuLyoqXG4gKiBSZXN0U2VydmVyIGNsYXNzIGlzIHVzZWQgdG8gcG93ZXIgdGhlIHJlc3Qgc2VydmVyIHRoYXQgd2lsbCBjb21tdW5pY2F0ZSB3aXRoIHRoZVxuICogbW9iaWxlIHBob25lIG9uIHRoZSBsb2NhbCB3aWZpIG5ldHdvcmsuIFRoaXMgc2VydmVyIHdpbGwgcmVzcG9uZCB0byB1cG5wIGRldmljZXNcbiAqIHdpdGggdGhlIGRldmljZSBkZXNjcmlwdGlvbiB4bWwgZmlsZSBhcyB3ZWxsIGFzIGhhbmRsZSBhbGwgc2F2aW5nIGFuZCBmZXRjaGluZyBvZiBkYXRhLlxuICpcbiAqIFRoZSByZXN0IHNlcnZlciB1c2VzIGV4cHJlc3MuanMgYW5kIGxpc3RlbnMgb24gYSBwb3J0IGNvbmZpZ3VyZWQgYnkgYnVpbGRlcl9yZXN0X3BvcnRcbiAqIHBhcmFtZXRlciBpbiB0aGUgcGFja2FnZS5qc29uIGZpbGUgd2l0aGluIHRoZSBwdWJsaWMgZm9sZGVyXG4gKlxuICogQGF1dGhvciBSaWNoIFdhbmRlbGwgPHJpY2h3YW5kZWxsQGdtYWlsLmNvbT5cbiAqL1xuY2xhc3MgUmVzdFNlcnZlcntcblxuICAgIGNvbnN0cnVjdG9yKHNlcnZlcjogU2VydmVyKXtcbiAgICAgICAgdGhpcy53b3JrZXIgPSBzZXJ2ZXI7XG4gICAgICAgIHRoaXMuaWQgPSBzZXJ2ZXIuaWQ7XG4gICAgICAgIHRoaXMubG9nID0gc2VydmVyLmxvZztcbiAgICAgICAgdGhpcy5kYiA9IHNlcnZlci5kYjtcblxuICAgICAgICB0aGlzLmFwcCA9IGV4cHJlc3MoKTtcbiAgICAgICAgdGhpcy5hcHAudXNlKGJvZHlQYXJzZXIuanNvbih7bGltaXQ6ICc1MG1iJ30pKTtcbiAgICAgICAgdGhpcy5hcHAudXNlKGJvZHlQYXJzZXIudXJsZW5jb2RlZCh7IGV4dGVuZGVkOiB0cnVlLCBsaW1pdDogJzUwbWInIH0pKTtcbiAgICAgICAgdGhpcy5hcHAudXNlKCcvYnVpbGRlcicsIGV4cHJlc3Muc3RhdGljKCdidWlsZGVyJykpXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2F2ZSBoYW5kbGVyIGZvciBzYXZpbmcgbGF5b3V0IGltYWdlcyBmcm9tIHRoZSBVSVxuICAgICAqIEBwYXJhbSByZXFcbiAgICAgKiBAcGFyYW0gcmVzXG4gICAgICovXG4gICAgdXBkYXRlRGF0YWJhc2UocmVxLCByZXMpe1xuICAgICAgICBsZXQgbG9nID0gdGhpcy5sb2c7XG4gICAgICAgIGxldCBkYiA9IHRoaXMuZGI7XG4gICAgICAgIGNvbnN0IGRhdGEgPSByZXEuYm9keTtcbiAgICAgICAgbGV0IGNsZWFuRGF0YSA9IHt9O1xuICAgICAgICBsZXQgZXJyb3IgPSBmYWxzZTtcblxuICAgICAgICBsb2cubG9nKFwiL3Jlc3QvdXBkYXRlRGF0YWJhc2VcIik7XG4gICAgICAgIHRoaXMuc2V0UmVzcG9uc2VIZWFkZXJzKHJlcyk7XG5cbiAgICAgICAgaWYodHlwZW9mKGRhdGEubGF5b3V0X2ltYWdlcykgIT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgICAgICBpZihkYXRhLmxheW91dF9pbWFnZXMubGVuZ3RoID4gMCl7XG4gICAgICAgICAgICAgICAgY2xlYW5EYXRhLmxheW91dF9pbWFnZXMgPSBkYXRhLmxheW91dF9pbWFnZXM7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBlcnJvciA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgZXJyb3IgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoIWVycm9yKXtcbiAgICAgICAgICAgIGRiLnVwZGF0ZURhdGFiYXNlKGNsZWFuRGF0YSwgZnVuY3Rpb24oZXJyLCByb3dzKXtcbiAgICAgICAgICAgICAgICByZXMuc2VuZCh7c3VjY2VzczogdHJ1ZX0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgcmVzLnNlbmQoe3N1Y2Nlc3M6IGZhbHNlfSk7XG4gICAgICAgIH1cblxuICAgICAgICBsb2cubG9nKHJlcS5ib2R5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBkZXZpY2UgZGVzY3JpcHRpb24geG1sIGZpbGUgZm9yIHVwbnAgcmVhZGVyc1xuICAgICAqIEBwYXJhbSByZXFcbiAgICAgKiBAcGFyYW0gcmVzXG4gICAgICovXG4gICAgZ2V0RGV2aWNlRGVzY3JpcHRpb24ocmVxLCByZXMpe1xuICAgICAgICBsZXQgbG9nID0gdGhpcy5sb2c7XG4gICAgICAgIGxldCBpZCA9IHRoaXMuaWQ7XG4gICAgICAgIGZzLnJlYWRGaWxlKCdkZXZpY2VkZXNjcmlwdGlvbi54bWwnLCBcImJpbmFyeVwiLCBmdW5jdGlvbiAoZXJyLCBmaWxlKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmVzLmhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcInRleHQvcGxhaW5cIik7XG4gICAgICAgICAgICAgICAgcmVzLnN0YXR1cyg1MDApLnNlbmQoZXJyKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaWxlID0gZmlsZS5yZXBsYWNlKC9cXHtcXHtVRE5cXH1cXH0vLCBcInV1aWQ6XCIgKyBpZCk7XG4gICAgICAgICAgICBmaWxlID0gZmlsZS5yZXBsYWNlKC9cXHtcXHtFTkRcXH1cXH0vLCBcImh0dHA6Ly9cIiArIFV0aWxzLmdldFNlcnZlcklwKCkgKyBcIjo4ODg4L3Jlc3QvXCIpO1xuICAgICAgICAgICAgcmVzLmhlYWRlcihcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiLCBcIipcIik7XG4gICAgICAgICAgICByZXMuaGVhZGVyKFwiQ29udGVudC1UeXBlXCIsIFwidGV4dC94bWxcIik7XG4gICAgICAgICAgICByZXMuc2VuZChmaWxlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhbGwgb2YgdGhlIGxheW91dCBpbWFnZSByZWNvcmRzIGFzIGEganNvbiBhcnJheVxuICAgICAqIEBwYXJhbSByZXFcbiAgICAgKiBAcGFyYW0gcmVzXG4gICAgICovXG4gICAgZ2V0Rmxvb3JwbGFucyhyZXEsIHJlcyl7XG4gICAgICAgIGxldCBsb2cgPSB0aGlzLmxvZztcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgbG9nLmxvZyhcIi9yZXN0L2Zsb29ycGxhbnNcIik7XG4gICAgICAgIGRiLmdldEZsb29yUGxhbnMoZnVuY3Rpb24oZXJyLCByb3dzKXtcbiAgICAgICAgICAgIHJvd3MuZm9yRWFjaChmdW5jdGlvbihyb3cpe1xuICAgICAgICAgICAgICAgIGlmKHR5cGVvZihyb3cubGF5b3V0X2ltYWdlKSAhPSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgICAgICAgICAgICAgcm93LmxheW91dF9pbWFnZSA9IEpTT04ucGFyc2Uocm93LmxheW91dF9pbWFnZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXMuc2VuZChyb3dzKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0U2Nhbm5lZENvb3JkcyhyZXEsIHJlcyl7XG4gICAgICAgIGxldCBsb2cgPSB0aGlzLmxvZztcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgY29uc3QgZGF0YSA9IHJlcS5wYXJhbXM7XG4gICAgICAgIGxvZy5sb2coXCIvcmVzdC9nZXRTY2FubmVkQ29vcmRzXCIpO1xuICAgICAgICBkYi5nZXRTY2FubmVkQ29vcmRzKGRhdGEuZnBfaWQsIGZ1bmN0aW9uKGVyciwgcm93cyl7XG4gICAgICAgICAgICByZXMuc2VuZChyb3dzKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2F2ZVJlYWRpbmdzKHJlcSwgcmVzKXtcbiAgICAgICAgbGV0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBsb2cubG9nKFwiL3Jlc3Qvc2F2ZVJlYWRpbmdzXCIpO1xuICAgICAgICBjb25zdCBkYXRhID0gcmVxLmJvZHk7XG4gICAgICAgIGxvZy5sb2coZGF0YSk7XG4gICAgICAgIGlmKHR5cGVvZihkYXRhLnBheWxvYWQpID09IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5zZW5kKHtzdWNjZXNzOiBmYWxzZSwgbWVzc2FnZTogXCJtaXNzaW5nIHBheWxvYWRcIn0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZGIuc2F2ZVJlYWRpbmdzKGRhdGEucGF5bG9hZCwgKCkgPT4ge1xuICAgICAgICAgICAgcmVzLnNlbmQoe3N1Y2Nlc3M6IHRydWV9KTtcbiAgICAgICAgICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246ICdORVdfUkVBRElORydcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIGdldExheW91dEluZm8ocmVxLCByZXMpe1xuICAgICAgICBsZXQgbG9nID0gdGhpcy5sb2c7XG4gICAgICAgIGxvZy5sb2coXCIvcmVzdC9sYXlvdXRfaW5mby9hbGxcIik7XG4gICAgICAgIHRoaXMuc2V0UmVzcG9uc2VIZWFkZXJzKHJlcyk7XG5cbiAgICAgICAgdGhpcy5kYi5nZXRMYXlvdXRJbmZvKGZ1bmN0aW9uKGVyciwgcm93cyl7XG4gICAgICAgICAgICByZXMuc2VuZCh7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBwYXlsb2FkOiByb3dzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2V0UmVzcG9uc2VIZWFkZXJzKHJlcyl7XG4gICAgICAgIHJlcy5oZWFkZXIoXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIiwgXCIqXCIpO1xuICAgICAgICByZXMuaGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vamF2YXNjcmlwdCcpO1xuICAgICAgICByZXMuaGVhZGVyKFwiQ2FjaGUtQ29udHJvbFwiLCBcIm5vLWNhY2hlXCIpO1xuICAgIH1cblxuICAgIGxvY2FsaXplKHJlcSwgcmVzKSB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSByZXEuYm9keTtcbiAgICAgICAgY29uc3QgaWQgPSBkYXRhLmRldmljZV9pZDtcblxuICAgICAgICBsZXQgc3RhdGVQYXJ0aWNsZXMgPSBbXTtcbiAgICAgICAgaWYodGhpcy53b3JrZXIucGFydGljbGVzW2lkXSAhPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgIHN0YXRlUGFydGljbGVzID0gdGhpcy53b3JrZXIucGFydGljbGVzW2lkXTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgcGYgPSBuZXcgUGFydGljbGVGaWx0ZXIodGhpcy5kYiwgZGF0YS5mcF9pZCk7XG4gICAgICAgIHBmLnNldFBhcnRpY2xlcyhzdGF0ZVBhcnRpY2xlcyk7XG5cbiAgICAgICAgY29uc3QgZiA9IG5ldyBGZWF0dXJlcygpO1xuICAgICAgICBjb25zdCBmZWF0dXJlcyA9IGYubWFrZUZlYXR1cmVzKGRhdGEuYXBfaWRzKTtcbiAgICAgICAgcGYubW92ZShmZWF0dXJlcyk7XG4gICAgICAgIGNvbnN0IGFsbFBhcnRpY2xlcyA9IHBmLmdldFBhcnRpY2xlcygpO1xuICAgICAgICB0aGlzLndvcmtlci5wYXJ0aWNsZXNbaWRdID0gYWxsUGFydGljbGVzO1xuXG4gICAgICAgIGNvbnN0IHBhcnRpY2xlcyA9IHBmLmdldFBhcnRpY2xlQ29vcmRzKCk7XG5cbiAgICAgICAgbGV0IGtubiA9IG5ldyBLbm4odGhpcy5kYiwgZGF0YS5mcF9pZCk7XG5cbiAgICAgICAga25uLmdldE5laWdoYm9ycyhmZWF0dXJlcywgcGYuZ2V0UGFydGljbGVLZXlzKCksIDUsIChrbm4pID0+IHtcbiAgICAgICAgICAgIGxldCBrbSA9IG5ldyBLTWVhbnMoMiwga25uKTtcbiAgICAgICAgICAgIGNvbnN0IGxhcmdlc3RDbHVzdGVyID0ga20uZ2V0TGFyZ2VzdENsdXN0ZXJJbmRleCgpO1xuICAgICAgICAgICAgY29uc3QgZ3Vlc3MgPSBrbS5nZXRDZW50cm9pZChsYXJnZXN0Q2x1c3Rlcik7XG5cbiAgICAgICAgICAgIHJlcy5zZW5kKHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgIGd1ZXNzOiBndWVzcyxcbiAgICAgICAgICAgICAgICBwYXJ0aWNsZXM6IHBhcnRpY2xlc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLm5vdGlmeUxpc3RlbmVycyh7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiAnTE9DQUxJWkUnLFxuICAgICAgICAgICAgICAgIGlkOiBpZCxcbiAgICAgICAgICAgICAgICBndWVzczogZ3Vlc3MsXG4gICAgICAgICAgICAgICAgdHlwZTogZGF0YS50eXBlLFxuICAgICAgICAgICAgICAgIHBhcnRpY2xlczogcGFydGljbGVzLFxuICAgICAgICAgICAgICAgIGZwX2lkOiBkYXRhLmZwX2lkLFxuICAgICAgICAgICAgICAgIGFsbF9wYXJ0aWNsZXM6IGFsbFBhcnRpY2xlc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG5vdGlmeUxpc3RlbmVycyhkYXRhOiBPYmplY3QpIHtcbiAgICAgICAgdGhpcy53b3JrZXIuc2VuZChkYXRhKTtcbiAgICB9XG5cbiAgICBqc29uSGVhZGVycyhyZXEsIHJlcywgbmV4dCl7XG4gICAgICAgIHJlcy5oZWFkZXIoXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIiwgXCIqXCIpO1xuICAgICAgICByZXMuaGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vamF2YXNjcmlwdCcpO1xuICAgICAgICByZXMuaGVhZGVyKFwiQ2FjaGUtQ29udHJvbFwiLCBcIm5vLWNhY2hlXCIpO1xuICAgICAgICBuZXh0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUm91dGVzIGFyZSBkZWZpbmVkIGhlcmUgYW5kIG1hcHBlZCB0byBhY3Rpb25zXG4gICAgICovXG4gICAgY3JlYXRlU2VydmVyKCkge1xuICAgICAgICBjb25zdCBhcHAgPSB0aGlzLmFwcDtcblxuICAgICAgICBhcHAucG9zdCgnL3Jlc3QvbG9jYWxpemUnLCB0aGlzLmpzb25IZWFkZXJzLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHRoaXMubG9jYWxpemUocmVxLCByZXMpO1xuICAgICAgICB9KTtcblxuICAgICAgICBhcHAuZ2V0KCcvcmVzdC9hbGl2ZScsIHRoaXMuanNvbkhlYWRlcnMsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgcmVzLnNlbmQoe3N1Y2Nlc3M6IHRydWV9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXBwLnBvc3QoJy9yZXN0L3VwZGF0ZURhdGFiYXNlJywgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZURhdGFiYXNlKHJlcSwgcmVzKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXBwLmdldCgnL2RldmljZWRlc2NyaXB0aW9uLnhtbCcsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgdGhpcy5nZXREZXZpY2VEZXNjcmlwdGlvbihyZXEsIHJlcyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFwcC5nZXQoXCIvaWNvbjI0LnBuZ1wiLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHRoaXMubG9nLmxvZyhcImljb24yNC5wbmdcIik7XG4gICAgICAgICAgICByZXMuaGVhZGVyKFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCIsIFwiKlwiKTtcbiAgICAgICAgICAgIHJlcy5zZW5kRmlsZShwcm9jZXNzLmN3ZCgpICsgJy9zcmMvaWNvbjI0LnBuZycpO1xuICAgICAgICB9KTtcblxuICAgICAgICBhcHAuZ2V0KFwiL3Jlc3QvZmxvb3JwbGFuc1wiLCB0aGlzLmpzb25IZWFkZXJzLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZ2V0Rmxvb3JwbGFucyhyZXEsIHJlcyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFwcC5wb3N0KFwiL3Jlc3Qvc2F2ZVJlYWRpbmdzXCIsIHRoaXMuanNvbkhlYWRlcnMsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgdGhpcy5zYXZlUmVhZGluZ3MocmVxLCByZXMpO1xuICAgICAgICB9KTtcblxuICAgICAgICBhcHAuZ2V0KFwiL3Jlc3QvZ2V0U2Nhbm5lZENvb3Jkcy86ZnBfaWRcIiwgdGhpcy5qc29uSGVhZGVycywgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmdldFNjYW5uZWRDb29yZHMocmVxLCByZXMpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnNlcnZlciA9IGh0dHAuY3JlYXRlU2VydmVyKGFwcCk7XG5cbiAgICB9XG5cbiAgICBsaXN0ZW4ocG9ydCl7XG4gICAgICAgIHRoaXMuc2VydmVyLmxpc3Rlbihwb3J0KTtcbiAgICB9XG5cbiAgICBnZXRBcHAoKTogZXhwcmVzcyB7XG4gICAgICAgIHJldHVybiB0aGlzLmFwcDtcbiAgICB9XG5cbiAgICBnZXRTZXJ2ZXIoKTogU2VydmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VydmVyXG4gICAgfVxuXG4gICAgZ2V0TG9nKCk6IExvZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmxvZztcbiAgICB9XG59XG5cblxuZXhwb3J0IGRlZmF1bHQgUmVzdFNlcnZlcjsiXX0=
//# sourceMappingURL=RestServer.js.map
