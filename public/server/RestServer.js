'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

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
        key: 'moveParticles',
        value: function moveParticles(data, id) {
            var stateParticles = [];
            if (this.worker.particles[id] !== undefined) {
                stateParticles = this.worker.particles[id];
            }
            var pf = new _ParticleFilter2.default(this.db, data.fp_id);
            pf.setParticles(stateParticles);
            this.worker.trackingLog.debug(data.ap_ids);

            var f = new _Features2.default();
            var features = f.makeFeatures(data.ap_ids);
            pf.move(features);
            var allParticles = pf.getParticles();
            this.worker.particles[id] = allParticles;

            var particles = pf.getParticleCoords();
            var unique = pf.getUniqueParticles();
            return [particles, unique, allParticles];
        }
    }, {
        key: 'makeKMeans',
        value: function makeKMeans(args) {
            var _args = _slicedToArray(args, 3),
                particles = _args[0],
                unique = _args[1],
                allParticles = _args[2];

            var km = new _KMeans2.default(2, unique.slice(0, 5));
            var largestCluster = km.getLargestClusterIndex();
            var guess = km.getCentroid(largestCluster);
            var clusters = km.getClusters();

            return [particles, unique, clusters, guess, allParticles];
        }
    }, {
        key: 'localize',
        value: function localize(req, res) {
            var _this2 = this;

            this.log.log("/rest/localize");
            var data = req.body;
            var id = data.device_id;
            var fp_id = data.fp_id;

            this.db.createFeaturesCache(fp_id).then(function () {
                return _this2.moveParticles(data, id);
            }).then(this.makeKMeans).then(function (args) {
                var _args2 = _slicedToArray(args, 5),
                    particles = _args2[0],
                    unique = _args2[1],
                    clusters = _args2[2],
                    guess = _args2[3],
                    allParticles = _args2[4];

                res.send({
                    success: true,
                    id: id,
                    guess: guess,
                    type: data.type,
                    particles: particles,
                    neighbors: unique,
                    clusters: clusters
                });
                _this2.notifyListeners({
                    action: 'LOCALIZE',
                    id: id,
                    guess: guess,
                    type: data.type,
                    particles: particles,
                    neighbors: unique,
                    clusters: clusters,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvUmVzdFNlcnZlci5lczYiXSwibmFtZXMiOlsiZXhwcmVzcyIsInJlcXVpcmUiLCJib2R5UGFyc2VyIiwiVXRpbHMiLCJodHRwIiwiZnMiLCJSZXN0U2VydmVyIiwic2VydmVyIiwid29ya2VyIiwiaWQiLCJsb2ciLCJkYiIsImFwcCIsInVzZSIsImpzb24iLCJsaW1pdCIsInVybGVuY29kZWQiLCJleHRlbmRlZCIsInN0YXRpYyIsInJlcSIsInJlcyIsImRhdGEiLCJib2R5IiwiY2xlYW5EYXRhIiwiZXJyb3IiLCJzZXRSZXNwb25zZUhlYWRlcnMiLCJsYXlvdXRfaW1hZ2VzIiwibGVuZ3RoIiwidXBkYXRlRGF0YWJhc2UiLCJlcnIiLCJyb3dzIiwic2VuZCIsInN1Y2Nlc3MiLCJyZWFkRmlsZSIsImZpbGUiLCJoZWFkZXIiLCJzdGF0dXMiLCJyZXBsYWNlIiwiZ2V0U2VydmVySXAiLCJnZXRGbG9vclBsYW5zIiwiZm9yRWFjaCIsInJvdyIsImxheW91dF9pbWFnZSIsIkpTT04iLCJwYXJzZSIsInBhcmFtcyIsImdldFNjYW5uZWRDb29yZHMiLCJmcF9pZCIsInBheWxvYWQiLCJ1bmRlZmluZWQiLCJtZXNzYWdlIiwic2F2ZVJlYWRpbmdzIiwibm90aWZ5TGlzdGVuZXJzIiwiYWN0aW9uIiwiZ2V0TGF5b3V0SW5mbyIsInN0YXRlUGFydGljbGVzIiwicGFydGljbGVzIiwicGYiLCJzZXRQYXJ0aWNsZXMiLCJ0cmFja2luZ0xvZyIsImRlYnVnIiwiYXBfaWRzIiwiZiIsImZlYXR1cmVzIiwibWFrZUZlYXR1cmVzIiwibW92ZSIsImFsbFBhcnRpY2xlcyIsImdldFBhcnRpY2xlcyIsImdldFBhcnRpY2xlQ29vcmRzIiwidW5pcXVlIiwiZ2V0VW5pcXVlUGFydGljbGVzIiwiYXJncyIsImttIiwic2xpY2UiLCJsYXJnZXN0Q2x1c3RlciIsImdldExhcmdlc3RDbHVzdGVySW5kZXgiLCJndWVzcyIsImdldENlbnRyb2lkIiwiY2x1c3RlcnMiLCJnZXRDbHVzdGVycyIsImRldmljZV9pZCIsImNyZWF0ZUZlYXR1cmVzQ2FjaGUiLCJ0aGVuIiwibW92ZVBhcnRpY2xlcyIsIm1ha2VLTWVhbnMiLCJ0eXBlIiwibmVpZ2hib3JzIiwiYWxsX3BhcnRpY2xlcyIsIm5leHQiLCJwb3N0IiwianNvbkhlYWRlcnMiLCJydW5Mb2NhbGl6ZXIiLCJsb2NhbGl6ZSIsImdldCIsImdldERldmljZURlc2NyaXB0aW9uIiwic2VuZEZpbGUiLCJwcm9jZXNzIiwiY3dkIiwiZ2V0Rmxvb3JwbGFucyIsImNyZWF0ZVNlcnZlciIsInBvcnQiLCJsaXN0ZW4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7QUFFQSxJQUFNQSxVQUFVQyxRQUFRLFNBQVIsQ0FBaEI7QUFDQSxJQUFNQyxhQUFhRCxRQUFRLGFBQVIsQ0FBbkI7QUFDQSxJQUFNRSxRQUFRRixRQUFRLFlBQVIsQ0FBZDtBQUNBLElBQU1HLE9BQU9ILFFBQVEsTUFBUixDQUFiO0FBQ0EsSUFBTUksS0FBS0osUUFBUSxJQUFSLENBQVg7O0FBR0E7Ozs7Ozs7Ozs7O0lBVU1LLFU7QUFFRix3QkFBWUMsTUFBWixFQUEyQjtBQUFBOztBQUN2QixhQUFLQyxNQUFMLEdBQWNELE1BQWQ7QUFDQSxhQUFLRSxFQUFMLEdBQVVGLE9BQU9FLEVBQWpCO0FBQ0EsYUFBS0MsR0FBTCxHQUFXSCxPQUFPRyxHQUFsQjtBQUNBLGFBQUtDLEVBQUwsR0FBVUosT0FBT0ksRUFBakI7O0FBRUEsYUFBS0MsR0FBTCxHQUFXWixTQUFYO0FBQ0EsYUFBS1ksR0FBTCxDQUFTQyxHQUFULENBQWFYLFdBQVdZLElBQVgsQ0FBZ0IsRUFBQ0MsT0FBTyxNQUFSLEVBQWhCLENBQWI7QUFDQSxhQUFLSCxHQUFMLENBQVNDLEdBQVQsQ0FBYVgsV0FBV2MsVUFBWCxDQUFzQixFQUFFQyxVQUFVLElBQVosRUFBa0JGLE9BQU8sTUFBekIsRUFBdEIsQ0FBYjtBQUNBLGFBQUtILEdB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dkUsR0FBRCxFQUFNQyxHQUFOLEVBQWM7QUFDckUsdUJBQUswQixnQkFBTCxDQUFzQjNCLEdBQXRCLEVBQTJCQyxHQUEzQjtBQUNILGFBRkQ7O0FBSUEsaUJBQUtiLE1BQUwsR0FBY0gsS0FBSytGLFlBQUwsQ0FBa0J2RixHQUFsQixDQUFkO0FBRUg7OzsrQkFFTXdGLEksRUFBSztBQUNSLGlCQUFLN0YsTUFBTCxDQUFZOEYsTUFBWixDQUFtQkQsSUFBbkI7QUFDSDs7O2lDQUVpQjtBQUNkLG1CQUFPLEtBQUt4RixHQUFaO0FBQ0g7OztvQ0FFbUI7QUFDaEIsbUJBQU8sS0FBS0wsTUFBWjtBQUNIOzs7aUNBRWE7QUFDVixtQkFBTyxLQUFLRyxHQUFaO0FBQ0g7Ozs7OztrQkFJVUosVSIsImZpbGUiOiJSZXN0U2VydmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEtubiBmcm9tICcuL0tubic7XG5pbXBvcnQgS01lYW5zIGZyb20gJy4vS01lYW5zJztcbmltcG9ydCBQYXJ0aWNsZUZpbHRlciBmcm9tICcuL1BhcnRpY2xlRmlsdGVyJztcbmltcG9ydCBGZWF0dXJlcyBmcm9tICcuL0ZlYXR1cmVzJztcblxuY29uc3QgZXhwcmVzcyA9IHJlcXVpcmUoJ2V4cHJlc3MnKTtcbmNvbnN0IGJvZHlQYXJzZXIgPSByZXF1aXJlKCdib2R5LXBhcnNlcicpO1xuY29uc3QgVXRpbHMgPSByZXF1aXJlKCcuL1V0aWxzLmpzJyk7XG5jb25zdCBodHRwID0gcmVxdWlyZSgnaHR0cCcpO1xuY29uc3QgZnMgPSByZXF1aXJlKFwiZnNcIik7XG5cblxuLyoqXG4gKiBSZXN0U2VydmVyIGNsYXNzIGlzIHVzZWQgdG8gcG93ZXIgdGhlIHJlc3Qgc2VydmVyIHRoYXQgd2lsbCBjb21tdW5pY2F0ZSB3aXRoIHRoZVxuICogbW9iaWxlIHBob25lIG9uIHRoZSBsb2NhbCB3aWZpIG5ldHdvcmsuIFRoaXMgc2VydmVyIHdpbGwgcmVzcG9uZCB0byB1cG5wIGRldmljZXNcbiAqIHdpdGggdGhlIGRldmljZSBkZXNjcmlwdGlvbiB4bWwgZmlsZSBhcyB3ZWxsIGFzIGhhbmRsZSBhbGwgc2F2aW5nIGFuZCBmZXRjaGluZyBvZiBkYXRhLlxuICpcbiAqIFRoZSByZXN0IHNlcnZlciB1c2VzIGV4cHJlc3MuanMgYW5kIGxpc3RlbnMgb24gYSBwb3J0IGNvbmZpZ3VyZWQgYnkgYnVpbGRlcl9yZXN0X3BvcnRcbiAqIHBhcmFtZXRlciBpbiB0aGUgcGFja2FnZS5qc29uIGZpbGUgd2l0aGluIHRoZSBwdWJsaWMgZm9sZGVyXG4gKlxuICogQGF1dGhvciBSaWNoIFdhbmRlbGwgPHJpY2h3YW5kZWxsQGdtYWlsLmNvbT5cbiAqL1xuY2xhc3MgUmVzdFNlcnZlcntcblxuICAgIGNvbnN0cnVjdG9yKHNlcnZlcjogU2VydmVyKXtcbiAgICAgICAgdGhpcy53b3JrZXIgPSBzZXJ2ZXI7XG4gICAgICAgIHRoaXMuaWQgPSBzZXJ2ZXIuaWQ7XG4gICAgICAgIHRoaXMubG9nID0gc2VydmVyLmxvZztcbiAgICAgICAgdGhpcy5kYiA9IHNlcnZlci5kYjtcblxuICAgICAgICB0aGlzLmFwcCA9IGV4cHJlc3MoKTtcbiAgICAgICAgdGhpcy5hcHAudXNlKGJvZHlQYXJzZXIuanNvbih7bGltaXQ6ICc1MG1iJ30pKTtcbiAgICAgICAgdGhpcy5hcHAudXNlKGJvZHlQYXJzZXIudXJsZW5jb2RlZCh7IGV4dGVuZGVkOiB0cnVlLCBsaW1pdDogJzUwbWInIH0pKTtcbiAgICAgICAgdGhpcy5hcHAudXNlKCcvYnVpbGRlcicsIGV4cHJlc3Muc3RhdGljKCdidWlsZGVyJykpXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2F2ZSBoYW5kbGVyIGZvciBzYXZpbmcgbGF5b3V0IGltYWdlcyBmcm9tIHRoZSBVSVxuICAgICAqIEBwYXJhbSByZXFcbiAgICAgKiBAcGFyYW0gcmVzXG4gICAgICovXG4gICAgdXBkYXRlRGF0YWJhc2UocmVxLCByZXMpe1xuICAgICAgICBsZXQgbG9nID0gdGhpcy5sb2c7XG4gICAgICAgIGxldCBkYiA9IHRoaXMuZGI7XG4gICAgICAgIGNvbnN0IGRhdGEgPSByZXEuYm9keTtcbiAgICAgICAgbGV0IGNsZWFuRGF0YSA9IHt9O1xuICAgICAgICBsZXQgZXJyb3IgPSBmYWxzZTtcblxuICAgICAgICBsb2cubG9nKFwiL3Jlc3QvdXBkYXRlRGF0YWJhc2VcIik7XG4gICAgICAgIHRoaXMuc2V0UmVzcG9uc2VIZWFkZXJzKHJlcyk7XG5cbiAgICAgICAgaWYodHlwZW9mKGRhdGEubGF5b3V0X2ltYWdlcykgIT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgICAgICBpZihkYXRhLmxheW91dF9pbWFnZXMubGVuZ3RoID4gMCl7XG4gICAgICAgICAgICAgICAgY2xlYW5EYXRhLmxheW91dF9pbWFnZXMgPSBkYXRhLmxheW91dF9pbWFnZXM7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBlcnJvciA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgZXJyb3IgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoIWVycm9yKXtcbiAgICAgICAgICAgIGRiLnVwZGF0ZURhdGFiYXNlKGNsZWFuRGF0YSwgZnVuY3Rpb24oZXJyLCByb3dzKXtcbiAgICAgICAgICAgICAgICByZXMuc2VuZCh7c3VjY2VzczogdHJ1ZX0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgcmVzLnNlbmQoe3N1Y2Nlc3M6IGZhbHNlfSk7XG4gICAgICAgIH1cblxuICAgICAgICBsb2cubG9nKHJlcS5ib2R5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBkZXZpY2UgZGVzY3JpcHRpb24geG1sIGZpbGUgZm9yIHVwbnAgcmVhZGVyc1xuICAgICAqIEBwYXJhbSByZXFcbiAgICAgKiBAcGFyYW0gcmVzXG4gICAgICovXG4gICAgZ2V0RGV2aWNlRGVzY3JpcHRpb24ocmVxLCByZXMpe1xuICAgICAgICBsZXQgbG9nID0gdGhpcy5sb2c7XG4gICAgICAgIGxldCBpZCA9IHRoaXMuaWQ7XG4gICAgICAgIGZzLnJlYWRGaWxlKCdkZXZpY2VkZXNjcmlwdGlvbi54bWwnLCBcImJpbmFyeVwiLCBmdW5jdGlvbiAoZXJyLCBmaWxlKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmVzLmhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcInRleHQvcGxhaW5cIik7XG4gICAgICAgICAgICAgICAgcmVzLnN0YXR1cyg1MDApLnNlbmQoZXJyKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaWxlID0gZmlsZS5yZXBsYWNlKC9cXHtcXHtVRE5cXH1cXH0vLCBcInV1aWQ6XCIgKyBpZCk7XG4gICAgICAgICAgICBmaWxlID0gZmlsZS5yZXBsYWNlKC9cXHtcXHtFTkRcXH1cXH0vLCBcImh0dHA6Ly9cIiArIFV0aWxzLmdldFNlcnZlcklwKCkgKyBcIjo4ODg4L3Jlc3QvXCIpO1xuICAgICAgICAgICAgcmVzLmhlYWRlcihcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiLCBcIipcIik7XG4gICAgICAgICAgICByZXMuaGVhZGVyKFwiQ29udGVudC1UeXBlXCIsIFwidGV4dC94bWxcIik7XG4gICAgICAgICAgICByZXMuc2VuZChmaWxlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhbGwgb2YgdGhlIGxheW91dCBpbWFnZSByZWNvcmRzIGFzIGEganNvbiBhcnJheVxuICAgICAqIEBwYXJhbSByZXFcbiAgICAgKiBAcGFyYW0gcmVzXG4gICAgICovXG4gICAgZ2V0Rmxvb3JwbGFucyhyZXEsIHJlcyl7XG4gICAgICAgIGxldCBsb2cgPSB0aGlzLmxvZztcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgbG9nLmxvZyhcIi9yZXN0L2Zsb29ycGxhbnNcIik7XG4gICAgICAgIGRiLmdldEZsb29yUGxhbnMoZnVuY3Rpb24oZXJyLCByb3dzKXtcbiAgICAgICAgICAgIHJvd3MuZm9yRWFjaChmdW5jdGlvbihyb3cpe1xuICAgICAgICAgICAgICAgIGlmKHR5cGVvZihyb3cubGF5b3V0X2ltYWdlKSAhPSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgICAgICAgICAgICAgcm93LmxheW91dF9pbWFnZSA9IEpTT04ucGFyc2Uocm93LmxheW91dF9pbWFnZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXMuc2VuZChyb3dzKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0U2Nhbm5lZENvb3JkcyhyZXEsIHJlcyl7XG4gICAgICAgIGxldCBsb2cgPSB0aGlzLmxvZztcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgY29uc3QgZGF0YSA9IHJlcS5wYXJhbXM7XG4gICAgICAgIGxvZy5sb2coXCIvcmVzdC9nZXRTY2FubmVkQ29vcmRzXCIpO1xuICAgICAgICBkYi5nZXRTY2FubmVkQ29vcmRzKGRhdGEuZnBfaWQsIGZ1bmN0aW9uKGVyciwgcm93cyl7XG4gICAgICAgICAgICByZXMuc2VuZChyb3dzKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2F2ZVJlYWRpbmdzKHJlcSwgcmVzKXtcbiAgICAgICAgbGV0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBsb2cubG9nKFwiL3Jlc3Qvc2F2ZVJlYWRpbmdzXCIpO1xuICAgICAgICBjb25zdCBkYXRhID0gcmVxLmJvZHk7XG4gICAgICAgIGxvZy5sb2coZGF0YSk7XG4gICAgICAgIGlmKGRhdGEucGF5bG9hZCA9PT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgIHJldHVybiByZXMuc2VuZCh7c3VjY2VzczogZmFsc2UsIG1lc3NhZ2U6IFwibWlzc2luZyBwYXlsb2FkXCJ9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRiLnNhdmVSZWFkaW5ncyhkYXRhLnBheWxvYWQsIChmcF9pZCkgPT4ge1xuICAgICAgICAgICAgcmVzLnNlbmQoe3N1Y2Nlc3M6IHRydWV9KTtcbiAgICAgICAgICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246ICdORVdfUkVBRElORycsXG4gICAgICAgICAgICAgICAgZnBfaWQ6IGZwX2lkXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICBydW5Mb2NhbGl6ZXIocmVxLCByZXMpIHtcbiAgICAgICAgY29uc3QgZnBfaWQgPSBkYXRhLmZwX2lkO1xuICAgIH1cblxuICAgIGdldExheW91dEluZm8ocmVxLCByZXMpe1xuICAgICAgICBsZXQgbG9nID0gdGhpcy5sb2c7XG4gICAgICAgIGxvZy5sb2coXCIvcmVzdC9sYXlvdXRfaW5mby9hbGxcIik7XG4gICAgICAgIHRoaXMuc2V0UmVzcG9uc2VIZWFkZXJzKHJlcyk7XG5cbiAgICAgICAgdGhpcy5kYi5nZXRMYXlvdXRJbmZvKGZ1bmN0aW9uKGVyciwgcm93cyl7XG4gICAgICAgICAgICByZXMuc2VuZCh7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBwYXlsb2FkOiByb3dzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2V0UmVzcG9uc2VIZWFkZXJzKHJlcyl7XG4gICAgICAgIHJlcy5oZWFkZXIoXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIiwgXCIqXCIpO1xuICAgICAgICByZXMuaGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vamF2YXNjcmlwdCcpO1xuICAgICAgICByZXMuaGVhZGVyKFwiQ2FjaGUtQ29udHJvbFwiLCBcIm5vLWNhY2hlXCIpO1xuICAgIH1cblxuICAgIG1vdmVQYXJ0aWNsZXMoZGF0YSwgaWQpIHtcbiAgICAgICAgbGV0IHN0YXRlUGFydGljbGVzID0gW107XG4gICAgICAgIGlmICh0aGlzLndvcmtlci5wYXJ0aWNsZXNbaWRdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHN0YXRlUGFydGljbGVzID0gdGhpcy53b3JrZXIucGFydGljbGVzW2lkXTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgcGYgPSBuZXcgUGFydGljbGVGaWx0ZXIodGhpcy5kYiwgZGF0YS5mcF9pZCk7XG4gICAgICAgIHBmLnNldFBhcnRpY2xlcyhzdGF0ZVBhcnRpY2xlcyk7XG4gICAgICAgIHRoaXMud29ya2VyLnRyYWNraW5nTG9nLmRlYnVnKGRhdGEuYXBfaWRzKTtcblxuICAgICAgICBjb25zdCBmID0gbmV3IEZlYXR1cmVzKCk7XG4gICAgICAgIGNvbnN0IGZlYXR1cmVzID0gZi5tYWtlRmVhdHVyZXMoZGF0YS5hcF9pZHMpO1xuICAgICAgICBwZi5tb3ZlKGZlYXR1cmVzKTtcbiAgICAgICAgY29uc3QgYWxsUGFydGljbGVzID0gcGYuZ2V0UGFydGljbGVzKCk7XG4gICAgICAgIHRoaXMud29ya2VyLnBhcnRpY2xlc1tpZF0gPSBhbGxQYXJ0aWNsZXM7XG5cbiAgICAgICAgY29uc3QgcGFydGljbGVzID0gcGYuZ2V0UGFydGljbGVDb29yZHMoKTtcbiAgICAgICAgY29uc3QgdW5pcXVlID0gcGYuZ2V0VW5pcXVlUGFydGljbGVzKCk7XG4gICAgICAgIHJldHVybiBbcGFydGljbGVzLCB1bmlxdWUsIGFsbFBhcnRpY2xlc11cbiAgICB9XG5cbiAgICBtYWtlS01lYW5zKGFyZ3MpIHtcbiAgICAgICAgbGV0IFtwYXJ0aWNsZXMsIHVuaXF1ZSwgYWxsUGFydGljbGVzXSA9IGFyZ3M7XG4gICAgICAgIGxldCBrbSA9IG5ldyBLTWVhbnMoMiwgdW5pcXVlLnNsaWNlKDAsIDUpKTtcbiAgICAgICAgY29uc3QgbGFyZ2VzdENsdXN0ZXIgPSBrbS5nZXRMYXJnZXN0Q2x1c3RlckluZGV4KCk7XG4gICAgICAgIGNvbnN0IGd1ZXNzID0ga20uZ2V0Q2VudHJvaWQobGFyZ2VzdENsdXN0ZXIpO1xuICAgICAgICBjb25zdCBjbHVzdGVycyA9IGttLmdldENsdXN0ZXJzKCk7XG5cbiAgICAgICAgcmV0dXJuIFtwYXJ0aWNsZXMsIHVuaXF1ZSwgY2x1c3RlcnMsIGd1ZXNzLCBhbGxQYXJ0aWNsZXNdO1xuICAgIH1cblxuICAgIGxvY2FsaXplKHJlcSwgcmVzKSB7XG4gICAgICAgIHRoaXMubG9nLmxvZyhcIi9yZXN0L2xvY2FsaXplXCIpO1xuICAgICAgICBjb25zdCBkYXRhID0gcmVxLmJvZHk7XG4gICAgICAgIGNvbnN0IGlkID0gZGF0YS5kZXZpY2VfaWQ7XG4gICAgICAgIGNvbnN0IGZwX2lkID0gZGF0YS5mcF9pZDtcblxuICAgICAgICB0aGlzLmRiLmNyZWF0ZUZlYXR1cmVzQ2FjaGUoZnBfaWQpXG4gICAgICAgICAgICAudGhlbigoKSA9PiB0aGlzLm1vdmVQYXJ0aWNsZXMoZGF0YSwgaWQpKVxuICAgICAgICAgICAgLnRoZW4odGhpcy5tYWtlS01lYW5zKVxuICAgICAgICAgICAgLnRoZW4oKGFyZ3MpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgW3BhcnRpY2xlcywgdW5pcXVlLCBjbHVzdGVycywgZ3Vlc3MsIGFsbFBhcnRpY2xlc10gPSBhcmdzO1xuICAgICAgICAgICAgICAgIHJlcy5zZW5kKHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgICAgICAgICBndWVzczogZ3Vlc3MsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IGRhdGEudHlwZSxcbiAgICAgICAgICAgICAgICAgICAgcGFydGljbGVzOiBwYXJ0aWNsZXMsXG4gICAgICAgICAgICAgICAgICAgIG5laWdoYm9yczogdW5pcXVlLFxuICAgICAgICAgICAgICAgICAgICBjbHVzdGVyczogY2x1c3RlcnNcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLm5vdGlmeUxpc3RlbmVycyh7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ0xPQ0FMSVpFJyxcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgICAgICAgICBndWVzczogZ3Vlc3MsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IGRhdGEudHlwZSxcbiAgICAgICAgICAgICAgICAgICAgcGFydGljbGVzOiBwYXJ0aWNsZXMsXG4gICAgICAgICAgICAgICAgICAgIG5laWdoYm9yczogdW5pcXVlLFxuICAgICAgICAgICAgICAgICAgICBjbHVzdGVyczogY2x1c3RlcnMsXG4gICAgICAgICAgICAgICAgICAgIGZwX2lkOiBkYXRhLmZwX2lkLFxuICAgICAgICAgICAgICAgICAgICBhbGxfcGFydGljbGVzOiBhbGxQYXJ0aWNsZXNcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBub3RpZnlMaXN0ZW5lcnMoZGF0YTogT2JqZWN0KSB7XG4gICAgICAgIHRoaXMud29ya2VyLnNlbmQoZGF0YSk7XG4gICAgfVxuXG4gICAganNvbkhlYWRlcnMocmVxLCByZXMsIG5leHQpe1xuICAgICAgICByZXMuaGVhZGVyKFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCIsIFwiKlwiKTtcbiAgICAgICAgcmVzLmhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQnKTtcbiAgICAgICAgcmVzLmhlYWRlcihcIkNhY2hlLUNvbnRyb2xcIiwgXCJuby1jYWNoZVwiKTtcbiAgICAgICAgbmV4dCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJvdXRlcyBhcmUgZGVmaW5lZCBoZXJlIGFuZCBtYXBwZWQgdG8gYWN0aW9uc1xuICAgICAqL1xuICAgIGNyZWF0ZVNlcnZlcigpIHtcbiAgICAgICAgY29uc3QgYXBwID0gdGhpcy5hcHA7XG5cbiAgICAgICAgYXBwLnBvc3QoJy9yZXN0L3J1bkxvY2FsaXplcicsIHRoaXMuanNvbkhlYWRlcnMsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgdGhpcy5ydW5Mb2NhbGl6ZXIocmVxLCByZXMpO1xuICAgICAgICB9KTtcblxuICAgICAgICBhcHAucG9zdCgnL3Jlc3QvbG9jYWxpemUnLCB0aGlzLmpzb25IZWFkZXJzLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHRoaXMubG9jYWxpemUocmVxLCByZXMpO1xuICAgICAgICB9KTtcblxuICAgICAgICBhcHAuZ2V0KCcvcmVzdC9hbGl2ZScsIHRoaXMuanNvbkhlYWRlcnMsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgcmVzLnNlbmQoe3N1Y2Nlc3M6IHRydWV9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXBwLnBvc3QoJy9yZXN0L3VwZGF0ZURhdGFiYXNlJywgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZURhdGFiYXNlKHJlcSwgcmVzKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXBwLmdldCgnL2RldmljZWRlc2NyaXB0aW9uLnhtbCcsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgdGhpcy5nZXREZXZpY2VEZXNjcmlwdGlvbihyZXEsIHJlcyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFwcC5nZXQoXCIvaWNvbjI0LnBuZ1wiLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHRoaXMubG9nLmxvZyhcImljb24yNC5wbmdcIik7XG4gICAgICAgICAgICByZXMuaGVhZGVyKFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCIsIFwiKlwiKTtcbiAgICAgICAgICAgIHJlcy5zZW5kRmlsZShwcm9jZXNzLmN3ZCgpICsgJy9zcmMvaWNvbjI0LnBuZycpO1xuICAgICAgICB9KTtcblxuICAgICAgICBhcHAuZ2V0KFwiL3Jlc3QvZmxvb3JwbGFuc1wiLCB0aGlzLmpzb25IZWFkZXJzLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZ2V0Rmxvb3JwbGFucyhyZXEsIHJlcyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFwcC5wb3N0KFwiL3Jlc3Qvc2F2ZVJlYWRpbmdzXCIsIHRoaXMuanNvbkhlYWRlcnMsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgdGhpcy5zYXZlUmVhZGluZ3MocmVxLCByZXMpO1xuICAgICAgICB9KTtcblxuICAgICAgICBhcHAuZ2V0KFwiL3Jlc3QvZ2V0U2Nhbm5lZENvb3Jkcy86ZnBfaWRcIiwgdGhpcy5qc29uSGVhZGVycywgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmdldFNjYW5uZWRDb29yZHMocmVxLCByZXMpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnNlcnZlciA9IGh0dHAuY3JlYXRlU2VydmVyKGFwcCk7XG5cbiAgICB9XG5cbiAgICBsaXN0ZW4ocG9ydCl7XG4gICAgICAgIHRoaXMuc2VydmVyLmxpc3Rlbihwb3J0KTtcbiAgICB9XG5cbiAgICBnZXRBcHAoKTogZXhwcmVzcyB7XG4gICAgICAgIHJldHVybiB0aGlzLmFwcDtcbiAgICB9XG5cbiAgICBnZXRTZXJ2ZXIoKTogU2VydmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VydmVyXG4gICAgfVxuXG4gICAgZ2V0TG9nKCk6IExvZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmxvZztcbiAgICB9XG59XG5cblxuZXhwb3J0IGRlZmF1bHQgUmVzdFNlcnZlcjsiXX0=
//# sourceMappingURL=RestServer.js.map
