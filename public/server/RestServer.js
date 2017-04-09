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
            if (data.payload === undefined) {
                return res.send({ success: false, message: "missing payload" });
            }
            this.db.saveReadings(data.payload, function (fp_id) {
                res.send({ success: true });
                _this.notifyListeners({
                    action: 'NEW_READING',
                    fp_id: fp_id
                });
            });
        }
    }, {
        key: 'runLocalizer',
        value: function runLocalizer(req, res) {
            var fp_id = data.fp_id;
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
            var fp_id = data.fp_id;

            this.db.createFeaturesCache(fp_id).then(function () {

                var stateParticles = [];
                if (_this2.worker.particles[id] !== undefined) {
                    stateParticles = _this2.worker.particles[id];
                }
                var pf = new _ParticleFilter2.default(_this2.db, data.fp_id);
                pf.setParticles(stateParticles);

                var f = new _Features2.default();
                var features = f.makeFeatures(data.ap_ids);
                pf.move(features);
                var allParticles = pf.getParticles();
                _this2.worker.particles[id] = allParticles;

                var particles = pf.getParticleCoords();
                var unique = pf.getUniqueParticles();

                var km = new _KMeans2.default(2, unique.slice(0, 5));
                var largestCluster = km.getLargestClusterIndex();
                var guess = km.getCentroid(largestCluster);

                res.send({
                    success: true,
                    id: id,
                    guess: guess,
                    type: data.type,
                    particles: particles,
                    neighbors: unique,
                    clusters: km.getClusters()
                });
                _this2.notifyListeners({
                    action: 'LOCALIZE',
                    id: id,
                    guess: guess,
                    type: data.type,
                    particles: particles,
                    neighbors: unique,
                    clusters: km.getClusters(),
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

            app.post('/rest/runLocalizer', this.jsonHeaders, function (req, res) {
                _this3.runLocalizer(req, res);
            });

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvUmVzdFNlcnZlci5lczYiXSwibmFtZXMiOlsiZXhwcmVzcyIsInJlcXVpcmUiLCJib2R5UGFyc2VyIiwiVXRpbHMiLCJodHRwIiwiZnMiLCJSZXN0U2VydmVyIiwic2VydmVyIiwid29ya2VyIiwiaWQiLCJsb2ciLCJkYiIsImFwcCIsInVzZSIsImpzb24iLCJsaW1pdCIsInVybGVuY29kZWQiLCJleHRlbmRlZCIsInN0YXRpYyIsInJlcSIsInJlcyIsImRhdGEiLCJib2R5IiwiY2xlYW5EYXRhIiwiZXJyb3IiLCJzZXRSZXNwb25zZUhlYWRlcnMiLCJsYXlvdXRfaW1hZ2VzIiwibGVuZ3RoIiwidXBkYXRlRGF0YWJhc2UiLCJlcnIiLCJyb3dzIiwic2VuZCIsInN1Y2Nlc3MiLCJyZWFkRmlsZSIsImZpbGUiLCJoZWFkZXIiLCJzdGF0dXMiLCJyZXBsYWNlIiwiZ2V0U2VydmVySXAiLCJnZXRGbG9vclBsYW5zIiwiZm9yRWFjaCIsInJvdyIsImxheW91dF9pbWFnZSIsIkpTT04iLCJwYXJzZSIsInBhcmFtcyIsImdldFNjYW5uZWRDb29yZHMiLCJmcF9pZCIsInBheWxvYWQiLCJ1bmRlZmluZWQiLCJtZXNzYWdlIiwic2F2ZVJlYWRpbmdzIiwibm90aWZ5TGlzdGVuZXJzIiwiYWN0aW9uIiwiZ2V0TGF5b3V0SW5mbyIsImRldmljZV9pZCIsImNyZWF0ZUZlYXR1cmVzQ2FjaGUiLCJ0aGVuIiwic3RhdGVQYXJ0aWNsZXMiLCJwYXJ0aWNsZXMiLCJwZiIsInNldFBhcnRpY2xlcyIsImYiLCJmZWF0dXJlcyIsIm1ha2VGZWF0dXJlcyIsImFwX2lkcyIsIm1vdmUiLCJhbGxQYXJ0aWNsZXMiLCJnZXRQYXJ0aWNsZXMiLCJnZXRQYXJ0aWNsZUNvb3JkcyIsInVuaXF1ZSIsImdldFVuaXF1ZVBhcnRpY2xlcyIsImttIiwic2xpY2UiLCJsYXJnZXN0Q2x1c3RlciIsImdldExhcmdlc3RDbHVzdGVySW5kZXgiLCJndWVzcyIsImdldENlbnRyb2lkIiwidHlwZSIsIm5laWdoYm9ycyIsImNsdXN0ZXJzIiwiZ2V0Q2x1c3RlcnMiLCJhbGxfcGFydGljbGVzIiwibmV4dCIsInBvc3QiLCJqc29uSGVhZGVycyIsInJ1bkxvY2FsaXplciIsImxvY2FsaXplIiwiZ2V0IiwiZ2V0RGV2aWNlRGVzY3JpcHRpb24iLCJzZW5kRmlsZSIsInByb2Nlc3MiLCJjd2QiLCJnZXRGbG9vcnBsYW5zIiwiY3JlYXRlU2VydmVyIiwicG9ydCIsImxpc3RlbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7QUFFQSxJQUFNQSxVQUFVQyxRQUFRLFNBQVIsQ0FBaEI7QUFDQSxJQUFNQyxhQUFhRCxRQUFRLGFBQVIsQ0FBbkI7QUFDQSxJQUFNRSxRQUFRRixRQUFRLFlBQVIsQ0FBZDtBQUNBLElBQU1HLE9BQU9ILFFBQVEsTUFBUixDQUFiO0FBQ0EsSUFBTUksS0FBS0osUUFBUSxJQUFSLENBQVg7O0FBR0E7Ozs7Ozs7Ozs7O0lBVU1LLFU7QUFFRix3QkFBWUMsTUFBWixFQUEyQjtBQUFBOztBQUN2QixhQUFLQyxNQUFMLEdBQWNELE1BQWQ7QUFDQSxhQUFLRSxFQUFMLEdBQVVGLE9BQU9FLEVBQWpCO0FBQ0EsYUFBS0MsR0FBTCxHQUFXSCxPQUFPRyxHQUFsQjtBQUNBLGFBQUtDLEVBQUwsR0FBVUosT0FBT0ksRUFBakI7O0FBRUEsYUFBS0MsR0FBTCxHQUFXWixTQUFYO0FBQ0EsYUFBS1ksR0FBTCxDQUFTQyxHQUFULENBQWFYLFdBQVdZLElBQVgsQ0FBZ0IsRUFBQ0MsT0FBTyxNQUFSLEVBQWhCLENBQWI7QUFDQSxhQUFLSCxHQUFMLENBQVNDLEdBQVQsQ0FBYVgsV0FBV2MsVUFBWCxDQUFzQixFQUFFQyxVQUFVLElBQVosRUFBa0JGLE9BQU8sTUFBekIsRUFBdEIsQ0FBYjtBQUNBLGFBQUtILEdBQUwsQ0FBU0MsR0FBVCxDQUFhLFVBQWIsRUFBeUJiLFFBQVFrQixNQUFSLENBQWUsU0FBZixDQUF6QjtB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YUFBTCxDQUFtQjFFLEdBQW5CLEVBQXdCQyxHQUF4QjtBQUNILGFBRkQ7O0FBSUFSLGdCQUFJd0UsSUFBSixDQUFTLG9CQUFULEVBQStCLEtBQUtDLFdBQXBDLEVBQWlELFVBQUNsRSxHQUFELEVBQU1DLEdBQU4sRUFBYztBQUMzRCx1QkFBSytCLFlBQUwsQ0FBa0JoQyxHQUFsQixFQUF1QkMsR0FBdkI7QUFDSCxhQUZEOztBQUlBUixnQkFBSTRFLEdBQUosQ0FBUSwrQkFBUixFQUF5QyxLQUFLSCxXQUE5QyxFQUEyRCxVQUFDbEUsR0FBRCxFQUFNQyxHQUFOLEVBQWM7QUFDckUsdUJBQUswQixnQkFBTCxDQUFzQjNCLEdBQXRCLEVBQTJCQyxHQUEzQjtBQUNILGFBRkQ7O0FBSUEsaUJBQUtiLE1BQUwsR0FBY0gsS0FBSzBGLFlBQUwsQ0FBa0JsRixHQUFsQixDQUFkO0FBRUg7OzsrQkFFTW1GLEksRUFBSztBQUNSLGlCQUFLeEYsTUFBTCxDQUFZeUYsTUFBWixDQUFtQkQsSUFBbkI7QUFDSDs7O2lDQUVpQjtBQUNkLG1CQUFPLEtBQUtuRixHQUFaO0FBQ0g7OztvQ0FFbUI7QUFDaEIsbUJBQU8sS0FBS0wsTUFBWjtBQUNIOzs7aUNBRWE7QUFDVixtQkFBTyxLQUFLRyxHQUFaO0FBQ0g7Ozs7OztrQkFJVUosVSIsImZpbGUiOiJSZXN0U2VydmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEtubiBmcm9tICcuL0tubic7XG5pbXBvcnQgS01lYW5zIGZyb20gJy4vS01lYW5zJztcbmltcG9ydCBQYXJ0aWNsZUZpbHRlciBmcm9tICcuL1BhcnRpY2xlRmlsdGVyJztcbmltcG9ydCBGZWF0dXJlcyBmcm9tICcuL0ZlYXR1cmVzJztcblxuY29uc3QgZXhwcmVzcyA9IHJlcXVpcmUoJ2V4cHJlc3MnKTtcbmNvbnN0IGJvZHlQYXJzZXIgPSByZXF1aXJlKCdib2R5LXBhcnNlcicpO1xuY29uc3QgVXRpbHMgPSByZXF1aXJlKCcuL1V0aWxzLmpzJyk7XG5jb25zdCBodHRwID0gcmVxdWlyZSgnaHR0cCcpO1xuY29uc3QgZnMgPSByZXF1aXJlKFwiZnNcIik7XG5cblxuLyoqXG4gKiBSZXN0U2VydmVyIGNsYXNzIGlzIHVzZWQgdG8gcG93ZXIgdGhlIHJlc3Qgc2VydmVyIHRoYXQgd2lsbCBjb21tdW5pY2F0ZSB3aXRoIHRoZVxuICogbW9iaWxlIHBob25lIG9uIHRoZSBsb2NhbCB3aWZpIG5ldHdvcmsuIFRoaXMgc2VydmVyIHdpbGwgcmVzcG9uZCB0byB1cG5wIGRldmljZXNcbiAqIHdpdGggdGhlIGRldmljZSBkZXNjcmlwdGlvbiB4bWwgZmlsZSBhcyB3ZWxsIGFzIGhhbmRsZSBhbGwgc2F2aW5nIGFuZCBmZXRjaGluZyBvZiBkYXRhLlxuICpcbiAqIFRoZSByZXN0IHNlcnZlciB1c2VzIGV4cHJlc3MuanMgYW5kIGxpc3RlbnMgb24gYSBwb3J0IGNvbmZpZ3VyZWQgYnkgYnVpbGRlcl9yZXN0X3BvcnRcbiAqIHBhcmFtZXRlciBpbiB0aGUgcGFja2FnZS5qc29uIGZpbGUgd2l0aGluIHRoZSBwdWJsaWMgZm9sZGVyXG4gKlxuICogQGF1dGhvciBSaWNoIFdhbmRlbGwgPHJpY2h3YW5kZWxsQGdtYWlsLmNvbT5cbiAqL1xuY2xhc3MgUmVzdFNlcnZlcntcblxuICAgIGNvbnN0cnVjdG9yKHNlcnZlcjogU2VydmVyKXtcbiAgICAgICAgdGhpcy53b3JrZXIgPSBzZXJ2ZXI7XG4gICAgICAgIHRoaXMuaWQgPSBzZXJ2ZXIuaWQ7XG4gICAgICAgIHRoaXMubG9nID0gc2VydmVyLmxvZztcbiAgICAgICAgdGhpcy5kYiA9IHNlcnZlci5kYjtcblxuICAgICAgICB0aGlzLmFwcCA9IGV4cHJlc3MoKTtcbiAgICAgICAgdGhpcy5hcHAudXNlKGJvZHlQYXJzZXIuanNvbih7bGltaXQ6ICc1MG1iJ30pKTtcbiAgICAgICAgdGhpcy5hcHAudXNlKGJvZHlQYXJzZXIudXJsZW5jb2RlZCh7IGV4dGVuZGVkOiB0cnVlLCBsaW1pdDogJzUwbWInIH0pKTtcbiAgICAgICAgdGhpcy5hcHAudXNlKCcvYnVpbGRlcicsIGV4cHJlc3Muc3RhdGljKCdidWlsZGVyJykpXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2F2ZSBoYW5kbGVyIGZvciBzYXZpbmcgbGF5b3V0IGltYWdlcyBmcm9tIHRoZSBVSVxuICAgICAqIEBwYXJhbSByZXFcbiAgICAgKiBAcGFyYW0gcmVzXG4gICAgICovXG4gICAgdXBkYXRlRGF0YWJhc2UocmVxLCByZXMpe1xuICAgICAgICBsZXQgbG9nID0gdGhpcy5sb2c7XG4gICAgICAgIGxldCBkYiA9IHRoaXMuZGI7XG4gICAgICAgIGNvbnN0IGRhdGEgPSByZXEuYm9keTtcbiAgICAgICAgbGV0IGNsZWFuRGF0YSA9IHt9O1xuICAgICAgICBsZXQgZXJyb3IgPSBmYWxzZTtcblxuICAgICAgICBsb2cubG9nKFwiL3Jlc3QvdXBkYXRlRGF0YWJhc2VcIik7XG4gICAgICAgIHRoaXMuc2V0UmVzcG9uc2VIZWFkZXJzKHJlcyk7XG5cbiAgICAgICAgaWYodHlwZW9mKGRhdGEubGF5b3V0X2ltYWdlcykgIT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgICAgICBpZihkYXRhLmxheW91dF9pbWFnZXMubGVuZ3RoID4gMCl7XG4gICAgICAgICAgICAgICAgY2xlYW5EYXRhLmxheW91dF9pbWFnZXMgPSBkYXRhLmxheW91dF9pbWFnZXM7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBlcnJvciA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgZXJyb3IgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoIWVycm9yKXtcbiAgICAgICAgICAgIGRiLnVwZGF0ZURhdGFiYXNlKGNsZWFuRGF0YSwgZnVuY3Rpb24oZXJyLCByb3dzKXtcbiAgICAgICAgICAgICAgICByZXMuc2VuZCh7c3VjY2VzczogdHJ1ZX0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgcmVzLnNlbmQoe3N1Y2Nlc3M6IGZhbHNlfSk7XG4gICAgICAgIH1cblxuICAgICAgICBsb2cubG9nKHJlcS5ib2R5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBkZXZpY2UgZGVzY3JpcHRpb24geG1sIGZpbGUgZm9yIHVwbnAgcmVhZGVyc1xuICAgICAqIEBwYXJhbSByZXFcbiAgICAgKiBAcGFyYW0gcmVzXG4gICAgICovXG4gICAgZ2V0RGV2aWNlRGVzY3JpcHRpb24ocmVxLCByZXMpe1xuICAgICAgICBsZXQgbG9nID0gdGhpcy5sb2c7XG4gICAgICAgIGxldCBpZCA9IHRoaXMuaWQ7XG4gICAgICAgIGZzLnJlYWRGaWxlKCdkZXZpY2VkZXNjcmlwdGlvbi54bWwnLCBcImJpbmFyeVwiLCBmdW5jdGlvbiAoZXJyLCBmaWxlKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmVzLmhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcInRleHQvcGxhaW5cIik7XG4gICAgICAgICAgICAgICAgcmVzLnN0YXR1cyg1MDApLnNlbmQoZXJyKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaWxlID0gZmlsZS5yZXBsYWNlKC9cXHtcXHtVRE5cXH1cXH0vLCBcInV1aWQ6XCIgKyBpZCk7XG4gICAgICAgICAgICBmaWxlID0gZmlsZS5yZXBsYWNlKC9cXHtcXHtFTkRcXH1cXH0vLCBcImh0dHA6Ly9cIiArIFV0aWxzLmdldFNlcnZlcklwKCkgKyBcIjo4ODg4L3Jlc3QvXCIpO1xuICAgICAgICAgICAgcmVzLmhlYWRlcihcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiLCBcIipcIik7XG4gICAgICAgICAgICByZXMuaGVhZGVyKFwiQ29udGVudC1UeXBlXCIsIFwidGV4dC94bWxcIik7XG4gICAgICAgICAgICByZXMuc2VuZChmaWxlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhbGwgb2YgdGhlIGxheW91dCBpbWFnZSByZWNvcmRzIGFzIGEganNvbiBhcnJheVxuICAgICAqIEBwYXJhbSByZXFcbiAgICAgKiBAcGFyYW0gcmVzXG4gICAgICovXG4gICAgZ2V0Rmxvb3JwbGFucyhyZXEsIHJlcyl7XG4gICAgICAgIGxldCBsb2cgPSB0aGlzLmxvZztcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgbG9nLmxvZyhcIi9yZXN0L2Zsb29ycGxhbnNcIik7XG4gICAgICAgIGRiLmdldEZsb29yUGxhbnMoZnVuY3Rpb24oZXJyLCByb3dzKXtcbiAgICAgICAgICAgIHJvd3MuZm9yRWFjaChmdW5jdGlvbihyb3cpe1xuICAgICAgICAgICAgICAgIGlmKHR5cGVvZihyb3cubGF5b3V0X2ltYWdlKSAhPSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgICAgICAgICAgICAgcm93LmxheW91dF9pbWFnZSA9IEpTT04ucGFyc2Uocm93LmxheW91dF9pbWFnZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXMuc2VuZChyb3dzKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0U2Nhbm5lZENvb3JkcyhyZXEsIHJlcyl7XG4gICAgICAgIGxldCBsb2cgPSB0aGlzLmxvZztcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgY29uc3QgZGF0YSA9IHJlcS5wYXJhbXM7XG4gICAgICAgIGxvZy5sb2coXCIvcmVzdC9nZXRTY2FubmVkQ29vcmRzXCIpO1xuICAgICAgICBkYi5nZXRTY2FubmVkQ29vcmRzKGRhdGEuZnBfaWQsIGZ1bmN0aW9uKGVyciwgcm93cyl7XG4gICAgICAgICAgICByZXMuc2VuZChyb3dzKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2F2ZVJlYWRpbmdzKHJlcSwgcmVzKXtcbiAgICAgICAgbGV0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBsb2cubG9nKFwiL3Jlc3Qvc2F2ZVJlYWRpbmdzXCIpO1xuICAgICAgICBjb25zdCBkYXRhID0gcmVxLmJvZHk7XG4gICAgICAgIGxvZy5sb2coZGF0YSk7XG4gICAgICAgIGlmKGRhdGEucGF5bG9hZCA9PT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgIHJldHVybiByZXMuc2VuZCh7c3VjY2VzczogZmFsc2UsIG1lc3NhZ2U6IFwibWlzc2luZyBwYXlsb2FkXCJ9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRiLnNhdmVSZWFkaW5ncyhkYXRhLnBheWxvYWQsIChmcF9pZCkgPT4ge1xuICAgICAgICAgICAgcmVzLnNlbmQoe3N1Y2Nlc3M6IHRydWV9KTtcbiAgICAgICAgICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246ICdORVdfUkVBRElORycsXG4gICAgICAgICAgICAgICAgZnBfaWQ6IGZwX2lkXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICBydW5Mb2NhbGl6ZXIocmVxLCByZXMpIHtcbiAgICAgICAgY29uc3QgZnBfaWQgPSBkYXRhLmZwX2lkO1xuICAgIH1cblxuICAgIGdldExheW91dEluZm8ocmVxLCByZXMpe1xuICAgICAgICBsZXQgbG9nID0gdGhpcy5sb2c7XG4gICAgICAgIGxvZy5sb2coXCIvcmVzdC9sYXlvdXRfaW5mby9hbGxcIik7XG4gICAgICAgIHRoaXMuc2V0UmVzcG9uc2VIZWFkZXJzKHJlcyk7XG5cbiAgICAgICAgdGhpcy5kYi5nZXRMYXlvdXRJbmZvKGZ1bmN0aW9uKGVyciwgcm93cyl7XG4gICAgICAgICAgICByZXMuc2VuZCh7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBwYXlsb2FkOiByb3dzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2V0UmVzcG9uc2VIZWFkZXJzKHJlcyl7XG4gICAgICAgIHJlcy5oZWFkZXIoXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIiwgXCIqXCIpO1xuICAgICAgICByZXMuaGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vamF2YXNjcmlwdCcpO1xuICAgICAgICByZXMuaGVhZGVyKFwiQ2FjaGUtQ29udHJvbFwiLCBcIm5vLWNhY2hlXCIpO1xuICAgIH1cblxuICAgIGxvY2FsaXplKHJlcSwgcmVzKSB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSByZXEuYm9keTtcbiAgICAgICAgY29uc3QgaWQgPSBkYXRhLmRldmljZV9pZDtcbiAgICAgICAgY29uc3QgZnBfaWQgPSBkYXRhLmZwX2lkO1xuXG4gICAgICAgIHRoaXMuZGIuY3JlYXRlRmVhdHVyZXNDYWNoZShmcF9pZClcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcblxuICAgICAgICAgICAgICAgIGxldCBzdGF0ZVBhcnRpY2xlcyA9IFtdO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLndvcmtlci5wYXJ0aWNsZXNbaWRdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdGVQYXJ0aWNsZXMgPSB0aGlzLndvcmtlci5wYXJ0aWNsZXNbaWRdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgcGYgPSBuZXcgUGFydGljbGVGaWx0ZXIodGhpcy5kYiwgZGF0YS5mcF9pZCk7XG4gICAgICAgICAgICAgICAgcGYuc2V0UGFydGljbGVzKHN0YXRlUGFydGljbGVzKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGYgPSBuZXcgRmVhdHVyZXMoKTtcbiAgICAgICAgICAgICAgICBjb25zdCBmZWF0dXJlcyA9IGYubWFrZUZlYXR1cmVzKGRhdGEuYXBfaWRzKTtcbiAgICAgICAgICAgICAgICBwZi5tb3ZlKGZlYXR1cmVzKTtcbiAgICAgICAgICAgICAgICBjb25zdCBhbGxQYXJ0aWNsZXMgPSBwZi5nZXRQYXJ0aWNsZXMoKTtcbiAgICAgICAgICAgICAgICB0aGlzLndvcmtlci5wYXJ0aWNsZXNbaWRdID0gYWxsUGFydGljbGVzO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgcGFydGljbGVzID0gcGYuZ2V0UGFydGljbGVDb29yZHMoKTtcbiAgICAgICAgICAgICAgICBjb25zdCB1bmlxdWUgPSBwZi5nZXRVbmlxdWVQYXJ0aWNsZXMoKTtcblxuICAgICAgICAgICAgICAgIGxldCBrbSA9IG5ldyBLTWVhbnMoMiwgdW5pcXVlLnNsaWNlKDAsNSkpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGxhcmdlc3RDbHVzdGVyID0ga20uZ2V0TGFyZ2VzdENsdXN0ZXJJbmRleCgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGd1ZXNzID0ga20uZ2V0Q2VudHJvaWQobGFyZ2VzdENsdXN0ZXIpO1xuXG4gICAgICAgICAgICAgICAgcmVzLnNlbmQoe1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBpZDogaWQsXG4gICAgICAgICAgICAgICAgICAgIGd1ZXNzOiBndWVzcyxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogZGF0YS50eXBlLFxuICAgICAgICAgICAgICAgICAgICBwYXJ0aWNsZXM6IHBhcnRpY2xlcyxcbiAgICAgICAgICAgICAgICAgICAgbmVpZ2hib3JzOiB1bmlxdWUsXG4gICAgICAgICAgICAgICAgICAgIGNsdXN0ZXJzOiBrbS5nZXRDbHVzdGVycygpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdMT0NBTElaRScsXG4gICAgICAgICAgICAgICAgICAgIGlkOiBpZCxcbiAgICAgICAgICAgICAgICAgICAgZ3Vlc3M6IGd1ZXNzLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBkYXRhLnR5cGUsXG4gICAgICAgICAgICAgICAgICAgIHBhcnRpY2xlczogcGFydGljbGVzLFxuICAgICAgICAgICAgICAgICAgICBuZWlnaGJvcnM6IHVuaXF1ZSxcbiAgICAgICAgICAgICAgICAgICAgY2x1c3RlcnM6IGttLmdldENsdXN0ZXJzKCksXG4gICAgICAgICAgICAgICAgICAgIGZwX2lkOiBkYXRhLmZwX2lkLFxuICAgICAgICAgICAgICAgICAgICBhbGxfcGFydGljbGVzOiBhbGxQYXJ0aWNsZXNcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH1cblxuICAgIG5vdGlmeUxpc3RlbmVycyhkYXRhOiBPYmplY3QpIHtcbiAgICAgICAgdGhpcy53b3JrZXIuc2VuZChkYXRhKTtcbiAgICB9XG5cbiAgICBqc29uSGVhZGVycyhyZXEsIHJlcywgbmV4dCl7XG4gICAgICAgIHJlcy5oZWFkZXIoXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIiwgXCIqXCIpO1xuICAgICAgICByZXMuaGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vamF2YXNjcmlwdCcpO1xuICAgICAgICByZXMuaGVhZGVyKFwiQ2FjaGUtQ29udHJvbFwiLCBcIm5vLWNhY2hlXCIpO1xuICAgICAgICBuZXh0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUm91dGVzIGFyZSBkZWZpbmVkIGhlcmUgYW5kIG1hcHBlZCB0byBhY3Rpb25zXG4gICAgICovXG4gICAgY3JlYXRlU2VydmVyKCkge1xuICAgICAgICBjb25zdCBhcHAgPSB0aGlzLmFwcDtcblxuICAgICAgICBhcHAucG9zdCgnL3Jlc3QvcnVuTG9jYWxpemVyJywgdGhpcy5qc29uSGVhZGVycywgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJ1bkxvY2FsaXplcihyZXEsIHJlcyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFwcC5wb3N0KCcvcmVzdC9sb2NhbGl6ZScsIHRoaXMuanNvbkhlYWRlcnMsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgdGhpcy5sb2NhbGl6ZShyZXEsIHJlcyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFwcC5nZXQoJy9yZXN0L2FsaXZlJywgdGhpcy5qc29uSGVhZGVycywgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICByZXMuc2VuZCh7c3VjY2VzczogdHJ1ZX0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBhcHAucG9zdCgnL3Jlc3QvdXBkYXRlRGF0YWJhc2UnLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlRGF0YWJhc2UocmVxLCByZXMpO1xuICAgICAgICB9KTtcblxuICAgICAgICBhcHAuZ2V0KCcvZGV2aWNlZGVzY3JpcHRpb24ueG1sJywgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmdldERldmljZURlc2NyaXB0aW9uKHJlcSwgcmVzKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXBwLmdldChcIi9pY29uMjQucG5nXCIsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgdGhpcy5sb2cubG9nKFwiaWNvbjI0LnBuZ1wiKTtcbiAgICAgICAgICAgIHJlcy5oZWFkZXIoXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIiwgXCIqXCIpO1xuICAgICAgICAgICAgcmVzLnNlbmRGaWxlKHByb2Nlc3MuY3dkKCkgKyAnL3NyYy9pY29uMjQucG5nJyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFwcC5nZXQoXCIvcmVzdC9mbG9vcnBsYW5zXCIsIHRoaXMuanNvbkhlYWRlcnMsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgdGhpcy5nZXRGbG9vcnBsYW5zKHJlcSwgcmVzKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXBwLnBvc3QoXCIvcmVzdC9zYXZlUmVhZGluZ3NcIiwgdGhpcy5qc29uSGVhZGVycywgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNhdmVSZWFkaW5ncyhyZXEsIHJlcyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFwcC5nZXQoXCIvcmVzdC9nZXRTY2FubmVkQ29vcmRzLzpmcF9pZFwiLCB0aGlzLmpzb25IZWFkZXJzLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZ2V0U2Nhbm5lZENvb3JkcyhyZXEsIHJlcyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuc2VydmVyID0gaHR0cC5jcmVhdGVTZXJ2ZXIoYXBwKTtcblxuICAgIH1cblxuICAgIGxpc3Rlbihwb3J0KXtcbiAgICAgICAgdGhpcy5zZXJ2ZXIubGlzdGVuKHBvcnQpO1xuICAgIH1cblxuICAgIGdldEFwcCgpOiBleHByZXNzIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXBwO1xuICAgIH1cblxuICAgIGdldFNlcnZlcigpOiBTZXJ2ZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXJ2ZXJcbiAgICB9XG5cbiAgICBnZXRMb2coKTogTG9nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubG9nO1xuICAgIH1cbn1cblxuXG5leHBvcnQgZGVmYXVsdCBSZXN0U2VydmVyOyJdfQ==
//# sourceMappingURL=RestServer.js.map
