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
                _this2.worker.trackingLog.debug(data.ap_ids);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvUmVzdFNlcnZlci5lczYiXSwibmFtZXMiOlsiZXhwcmVzcyIsInJlcXVpcmUiLCJib2R5UGFyc2VyIiwiVXRpbHMiLCJodHRwIiwiZnMiLCJSZXN0U2VydmVyIiwic2VydmVyIiwid29ya2VyIiwiaWQiLCJsb2ciLCJkYiIsImFwcCIsInVzZSIsImpzb24iLCJsaW1pdCIsInVybGVuY29kZWQiLCJleHRlbmRlZCIsInN0YXRpYyIsInJlcSIsInJlcyIsImRhdGEiLCJib2R5IiwiY2xlYW5EYXRhIiwiZXJyb3IiLCJzZXRSZXNwb25zZUhlYWRlcnMiLCJsYXlvdXRfaW1hZ2VzIiwibGVuZ3RoIiwidXBkYXRlRGF0YWJhc2UiLCJlcnIiLCJyb3dzIiwic2VuZCIsInN1Y2Nlc3MiLCJyZWFkRmlsZSIsImZpbGUiLCJoZWFkZXIiLCJzdGF0dXMiLCJyZXBsYWNlIiwiZ2V0U2VydmVySXAiLCJnZXRGbG9vclBsYW5zIiwiZm9yRWFjaCIsInJvdyIsImxheW91dF9pbWFnZSIsIkpTT04iLCJwYXJzZSIsInBhcmFtcyIsImdldFNjYW5uZWRDb29yZHMiLCJmcF9pZCIsInBheWxvYWQiLCJ1bmRlZmluZWQiLCJtZXNzYWdlIiwic2F2ZVJlYWRpbmdzIiwibm90aWZ5TGlzdGVuZXJzIiwiYWN0aW9uIiwiZ2V0TGF5b3V0SW5mbyIsImRldmljZV9pZCIsImNyZWF0ZUZlYXR1cmVzQ2FjaGUiLCJ0aGVuIiwic3RhdGVQYXJ0aWNsZXMiLCJwYXJ0aWNsZXMiLCJwZiIsInNldFBhcnRpY2xlcyIsInRyYWNraW5nTG9nIiwiZGVidWciLCJhcF9pZHMiLCJmIiwiZmVhdHVyZXMiLCJtYWtlRmVhdHVyZXMiLCJtb3ZlIiwiYWxsUGFydGljbGVzIiwiZ2V0UGFydGljbGVzIiwiZ2V0UGFydGljbGVDb29yZHMiLCJ1bmlxdWUiLCJnZXRVbmlxdWVQYXJ0aWNsZXMiLCJrbSIsInNsaWNlIiwibGFyZ2VzdENsdXN0ZXIiLCJnZXRMYXJnZXN0Q2x1c3RlckluZGV4IiwiZ3Vlc3MiLCJnZXRDZW50cm9pZCIsInR5cGUiLCJuZWlnaGJvcnMiLCJjbHVzdGVycyIsImdldENsdXN0ZXJzIiwiYWxsX3BhcnRpY2xlcyIsIm5leHQiLCJwb3N0IiwianNvbkhlYWRlcnMiLCJydW5Mb2NhbGl6ZXIiLCJsb2NhbGl6ZSIsImdldCIsImdldERldmljZURlc2NyaXB0aW9uIiwic2VuZEZpbGUiLCJwcm9jZXNzIiwiY3dkIiwiZ2V0Rmxvb3JwbGFucyIsImNyZWF0ZVNlcnZlciIsInBvcnQiLCJsaXN0ZW4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7Ozs7O0FBRUEsSUFBTUEsVUFBVUMsUUFBUSxTQUFSLENBQWhCO0FBQ0EsSUFBTUMsYUFBYUQsUUFBUSxhQUFSLENBQW5CO0FBQ0EsSUFBTUUsUUFBUUYsUUFBUSxZQUFSLENBQWQ7QUFDQSxJQUFNRyxPQUFPSCxRQUFRLE1BQVIsQ0FBYjtBQUNBLElBQU1JLEtBQUtKLFFBQVEsSUFBUixDQUFYOztBQUdBOzs7Ozs7Ozs7OztJQVVNSyxVO0FBRUYsd0JBQVlDLE1BQVosRUFBMkI7QUFBQTs7QUFDdkIsYUFBS0MsTUFBTCxHQUFjRCxNQUFkO0FBQ0EsYUFBS0UsRUFBTCxHQUFVRixPQUFPRSxFQUFqQjtBQUNBLGFBQUtDLEdBQUwsR0FBV0gsT0FBT0csR0FBbEI7QUFDQSxhQUFLQyxFQUFMLEdBQVVKLE9BQU9JLEVBQWpCOztBQUVBLGFBQUtDLEdBQUwsR0FBV1osU0FBWDtBQUNBLGFBQUtZLEdBQUwsQ0FBU0MsR0FBVCxDQUFhWCxXQUFXWSxJQUFYLENBQWdCLEVBQUNDLE9BQU8sTUFBUixFQUFoQixDQUFiO0FBQ0EsYUFBS0gsR0FBTCxDQUFTQyxHQUFULENBQWFYLFdBQVdjLFVBQVgsQ0FBc0IsRUFBRUMsVUFBVSxJQUFaLEVBQWtCRixPQUFPLE1BQXpCLEVBQXRCLENBQWI7QUFDQSxhQUFLSCxHQUFMLENBQVNDLEdBQVQsQ0FBYSxVQUFiLEVBQXlCYixRQUFRa0Is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SThFLEdBQUosQ0FBUSxrQkFBUixFQUE0QixLQUFLSCxXQUFqQyxFQUE4QyxVQUFDcEUsR0FBRCxFQUFNQyxHQUFOLEVBQWM7QUFDeEQsdUJBQUsyRSxhQUFMLENBQW1CNUUsR0FBbkIsRUFBd0JDLEdBQXhCO0FBQ0gsYUFGRDs7QUFJQVIsZ0JBQUkwRSxJQUFKLENBQVMsb0JBQVQsRUFBK0IsS0FBS0MsV0FBcEMsRUFBaUQsVUFBQ3BFLEdBQUQsRUFBTUMsR0FBTixFQUFjO0FBQzNELHVCQUFLK0IsWUFBTCxDQUFrQmhDLEdBQWxCLEVBQXVCQyxHQUF2QjtBQUNILGFBRkQ7O0FBSUFSLGdCQUFJOEUsR0FBSixDQUFRLCtCQUFSLEVBQXlDLEtBQUtILFdBQTlDLEVBQTJELFVBQUNwRSxHQUFELEVBQU1DLEdBQU4sRUFBYztBQUNyRSx1QkFBSzBCLGdCQUFMLENBQXNCM0IsR0FBdEIsRUFBMkJDLEdBQTNCO0FBQ0gsYUFGRDs7QUFJQSxpQkFBS2IsTUFBTCxHQUFjSCxLQUFLNEYsWUFBTCxDQUFrQnBGLEdBQWxCLENBQWQ7QUFFSDs7OytCQUVNcUYsSSxFQUFLO0FBQ1IsaUJBQUsxRixNQUFMLENBQVkyRixNQUFaLENBQW1CRCxJQUFuQjtBQUNIOzs7aUNBRWlCO0FBQ2QsbUJBQU8sS0FBS3JGLEdBQVo7QUFDSDs7O29DQUVtQjtBQUNoQixtQkFBTyxLQUFLTCxNQUFaO0FBQ0g7OztpQ0FFYTtBQUNWLG1CQUFPLEtBQUtHLEdBQVo7QUFDSDs7Ozs7O2tCQUlVSixVIiwiZmlsZSI6IlJlc3RTZXJ2ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgS25uIGZyb20gJy4vS25uJztcbmltcG9ydCBLTWVhbnMgZnJvbSAnLi9LTWVhbnMnO1xuaW1wb3J0IFBhcnRpY2xlRmlsdGVyIGZyb20gJy4vUGFydGljbGVGaWx0ZXInO1xuaW1wb3J0IEZlYXR1cmVzIGZyb20gJy4vRmVhdHVyZXMnO1xuXG5jb25zdCBleHByZXNzID0gcmVxdWlyZSgnZXhwcmVzcycpO1xuY29uc3QgYm9keVBhcnNlciA9IHJlcXVpcmUoJ2JvZHktcGFyc2VyJyk7XG5jb25zdCBVdGlscyA9IHJlcXVpcmUoJy4vVXRpbHMuanMnKTtcbmNvbnN0IGh0dHAgPSByZXF1aXJlKCdodHRwJyk7XG5jb25zdCBmcyA9IHJlcXVpcmUoXCJmc1wiKTtcblxuXG4vKipcbiAqIFJlc3RTZXJ2ZXIgY2xhc3MgaXMgdXNlZCB0byBwb3dlciB0aGUgcmVzdCBzZXJ2ZXIgdGhhdCB3aWxsIGNvbW11bmljYXRlIHdpdGggdGhlXG4gKiBtb2JpbGUgcGhvbmUgb24gdGhlIGxvY2FsIHdpZmkgbmV0d29yay4gVGhpcyBzZXJ2ZXIgd2lsbCByZXNwb25kIHRvIHVwbnAgZGV2aWNlc1xuICogd2l0aCB0aGUgZGV2aWNlIGRlc2NyaXB0aW9uIHhtbCBmaWxlIGFzIHdlbGwgYXMgaGFuZGxlIGFsbCBzYXZpbmcgYW5kIGZldGNoaW5nIG9mIGRhdGEuXG4gKlxuICogVGhlIHJlc3Qgc2VydmVyIHVzZXMgZXhwcmVzcy5qcyBhbmQgbGlzdGVucyBvbiBhIHBvcnQgY29uZmlndXJlZCBieSBidWlsZGVyX3Jlc3RfcG9ydFxuICogcGFyYW1ldGVyIGluIHRoZSBwYWNrYWdlLmpzb24gZmlsZSB3aXRoaW4gdGhlIHB1YmxpYyBmb2xkZXJcbiAqXG4gKiBAYXV0aG9yIFJpY2ggV2FuZGVsbCA8cmljaHdhbmRlbGxAZ21haWwuY29tPlxuICovXG5jbGFzcyBSZXN0U2VydmVye1xuXG4gICAgY29uc3RydWN0b3Ioc2VydmVyOiBTZXJ2ZXIpe1xuICAgICAgICB0aGlzLndvcmtlciA9IHNlcnZlcjtcbiAgICAgICAgdGhpcy5pZCA9IHNlcnZlci5pZDtcbiAgICAgICAgdGhpcy5sb2cgPSBzZXJ2ZXIubG9nO1xuICAgICAgICB0aGlzLmRiID0gc2VydmVyLmRiO1xuXG4gICAgICAgIHRoaXMuYXBwID0gZXhwcmVzcygpO1xuICAgICAgICB0aGlzLmFwcC51c2UoYm9keVBhcnNlci5qc29uKHtsaW1pdDogJzUwbWInfSkpO1xuICAgICAgICB0aGlzLmFwcC51c2UoYm9keVBhcnNlci51cmxlbmNvZGVkKHsgZXh0ZW5kZWQ6IHRydWUsIGxpbWl0OiAnNTBtYicgfSkpO1xuICAgICAgICB0aGlzLmFwcC51c2UoJy9idWlsZGVyJywgZXhwcmVzcy5zdGF0aWMoJ2J1aWxkZXInKSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTYXZlIGhhbmRsZXIgZm9yIHNhdmluZyBsYXlvdXQgaW1hZ2VzIGZyb20gdGhlIFVJXG4gICAgICogQHBhcmFtIHJlcVxuICAgICAqIEBwYXJhbSByZXNcbiAgICAgKi9cbiAgICB1cGRhdGVEYXRhYmFzZShyZXEsIHJlcyl7XG4gICAgICAgIGxldCBsb2cgPSB0aGlzLmxvZztcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgY29uc3QgZGF0YSA9IHJlcS5ib2R5O1xuICAgICAgICBsZXQgY2xlYW5EYXRhID0ge307XG4gICAgICAgIGxldCBlcnJvciA9IGZhbHNlO1xuXG4gICAgICAgIGxvZy5sb2coXCIvcmVzdC91cGRhdGVEYXRhYmFzZVwiKTtcbiAgICAgICAgdGhpcy5zZXRSZXNwb25zZUhlYWRlcnMocmVzKTtcblxuICAgICAgICBpZih0eXBlb2YoZGF0YS5sYXlvdXRfaW1hZ2VzKSAhPSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgICAgIGlmKGRhdGEubGF5b3V0X2ltYWdlcy5sZW5ndGggPiAwKXtcbiAgICAgICAgICAgICAgICBjbGVhbkRhdGEubGF5b3V0X2ltYWdlcyA9IGRhdGEubGF5b3V0X2ltYWdlcztcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIGVycm9yID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBlcnJvciA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZighZXJyb3Ipe1xuICAgICAgICAgICAgZGIudXBkYXRlRGF0YWJhc2UoY2xlYW5EYXRhLCBmdW5jdGlvbihlcnIsIHJvd3Mpe1xuICAgICAgICAgICAgICAgIHJlcy5zZW5kKHtzdWNjZXNzOiB0cnVlfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICByZXMuc2VuZCh7c3VjY2VzczogZmFsc2V9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxvZy5sb2cocmVxLmJvZHkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGRldmljZSBkZXNjcmlwdGlvbiB4bWwgZmlsZSBmb3IgdXBucCByZWFkZXJzXG4gICAgICogQHBhcmFtIHJlcVxuICAgICAqIEBwYXJhbSByZXNcbiAgICAgKi9cbiAgICBnZXREZXZpY2VEZXNjcmlwdGlvbihyZXEsIHJlcyl7XG4gICAgICAgIGxldCBsb2cgPSB0aGlzLmxvZztcbiAgICAgICAgbGV0IGlkID0gdGhpcy5pZDtcbiAgICAgICAgZnMucmVhZEZpbGUoJ2RldmljZWRlc2NyaXB0aW9uLnhtbCcsIFwiYmluYXJ5XCIsIGZ1bmN0aW9uIChlcnIsIGZpbGUpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXMuaGVhZGVyKFwiQ29udGVudC1UeXBlXCIsIFwidGV4dC9wbGFpblwiKTtcbiAgICAgICAgICAgICAgICByZXMuc3RhdHVzKDUwMCkuc2VuZChlcnIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbGUgPSBmaWxlLnJlcGxhY2UoL1xce1xce1VETlxcfVxcfS8sIFwidXVpZDpcIiArIGlkKTtcbiAgICAgICAgICAgIGZpbGUgPSBmaWxlLnJlcGxhY2UoL1xce1xce0VORFxcfVxcfS8sIFwiaHR0cDovL1wiICsgVXRpbHMuZ2V0U2VydmVySXAoKSArIFwiOjg4ODgvcmVzdC9cIik7XG4gICAgICAgICAgICByZXMuaGVhZGVyKFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCIsIFwiKlwiKTtcbiAgICAgICAgICAgIHJlcy5oZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgXCJ0ZXh0L3htbFwiKTtcbiAgICAgICAgICAgIHJlcy5zZW5kKGZpbGUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGFsbCBvZiB0aGUgbGF5b3V0IGltYWdlIHJlY29yZHMgYXMgYSBqc29uIGFycmF5XG4gICAgICogQHBhcmFtIHJlcVxuICAgICAqIEBwYXJhbSByZXNcbiAgICAgKi9cbiAgICBnZXRGbG9vcnBsYW5zKHJlcSwgcmVzKXtcbiAgICAgICAgbGV0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBsb2cubG9nKFwiL3Jlc3QvZmxvb3JwbGFuc1wiKTtcbiAgICAgICAgZGIuZ2V0Rmxvb3JQbGFucyhmdW5jdGlvbihlcnIsIHJvd3Mpe1xuICAgICAgICAgICAgcm93cy5mb3JFYWNoKGZ1bmN0aW9uKHJvdyl7XG4gICAgICAgICAgICAgICAgaWYodHlwZW9mKHJvdy5sYXlvdXRfaW1hZ2UpICE9IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICAgICAgICAgICAgICByb3cubGF5b3V0X2ltYWdlID0gSlNPTi5wYXJzZShyb3cubGF5b3V0X2ltYWdlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJlcy5zZW5kKHJvd3MpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXRTY2FubmVkQ29vcmRzKHJlcSwgcmVzKXtcbiAgICAgICAgbGV0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBjb25zdCBkYXRhID0gcmVxLnBhcmFtcztcbiAgICAgICAgbG9nLmxvZyhcIi9yZXN0L2dldFNjYW5uZWRDb29yZHNcIik7XG4gICAgICAgIGRiLmdldFNjYW5uZWRDb29yZHMoZGF0YS5mcF9pZCwgZnVuY3Rpb24oZXJyLCByb3dzKXtcbiAgICAgICAgICAgIHJlcy5zZW5kKHJvd3MpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzYXZlUmVhZGluZ3MocmVxLCByZXMpe1xuICAgICAgICBsZXQgbG9nID0gdGhpcy5sb2c7XG4gICAgICAgIGxvZy5sb2coXCIvcmVzdC9zYXZlUmVhZGluZ3NcIik7XG4gICAgICAgIGNvbnN0IGRhdGEgPSByZXEuYm9keTtcbiAgICAgICAgbG9nLmxvZyhkYXRhKTtcbiAgICAgICAgaWYoZGF0YS5wYXlsb2FkID09PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5zZW5kKHtzdWNjZXNzOiBmYWxzZSwgbWVzc2FnZTogXCJtaXNzaW5nIHBheWxvYWRcIn0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZGIuc2F2ZVJlYWRpbmdzKGRhdGEucGF5bG9hZCwgKGZwX2lkKSA9PiB7XG4gICAgICAgICAgICByZXMuc2VuZCh7c3VjY2VzczogdHJ1ZX0pO1xuICAgICAgICAgICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoe1xuICAgICAgICAgICAgICAgIGFjdGlvbjogJ05FV19SRUFESU5HJyxcbiAgICAgICAgICAgICAgICBmcF9pZDogZnBfaWRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIHJ1bkxvY2FsaXplcihyZXEsIHJlcykge1xuICAgICAgICBjb25zdCBmcF9pZCA9IGRhdGEuZnBfaWQ7XG4gICAgfVxuXG4gICAgZ2V0TGF5b3V0SW5mbyhyZXEsIHJlcyl7XG4gICAgICAgIGxldCBsb2cgPSB0aGlzLmxvZztcbiAgICAgICAgbG9nLmxvZyhcIi9yZXN0L2xheW91dF9pbmZvL2FsbFwiKTtcbiAgICAgICAgdGhpcy5zZXRSZXNwb25zZUhlYWRlcnMocmVzKTtcblxuICAgICAgICB0aGlzLmRiLmdldExheW91dEluZm8oZnVuY3Rpb24oZXJyLCByb3dzKXtcbiAgICAgICAgICAgIHJlcy5zZW5kKHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgIHBheWxvYWQ6IHJvd3NcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzZXRSZXNwb25zZUhlYWRlcnMocmVzKXtcbiAgICAgICAgcmVzLmhlYWRlcihcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiLCBcIipcIik7XG4gICAgICAgIHJlcy5oZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qYXZhc2NyaXB0Jyk7XG4gICAgICAgIHJlcy5oZWFkZXIoXCJDYWNoZS1Db250cm9sXCIsIFwibm8tY2FjaGVcIik7XG4gICAgfVxuXG4gICAgbG9jYWxpemUocmVxLCByZXMpIHtcbiAgICAgICAgY29uc3QgZGF0YSA9IHJlcS5ib2R5O1xuICAgICAgICBjb25zdCBpZCA9IGRhdGEuZGV2aWNlX2lkO1xuICAgICAgICBjb25zdCBmcF9pZCA9IGRhdGEuZnBfaWQ7XG5cbiAgICAgICAgdGhpcy5kYi5jcmVhdGVGZWF0dXJlc0NhY2hlKGZwX2lkKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgbGV0IHN0YXRlUGFydGljbGVzID0gW107XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMud29ya2VyLnBhcnRpY2xlc1tpZF0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBzdGF0ZVBhcnRpY2xlcyA9IHRoaXMud29ya2VyLnBhcnRpY2xlc1tpZF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxldCBwZiA9IG5ldyBQYXJ0aWNsZUZpbHRlcih0aGlzLmRiLCBkYXRhLmZwX2lkKTtcbiAgICAgICAgICAgICAgICBwZi5zZXRQYXJ0aWNsZXMoc3RhdGVQYXJ0aWNsZXMpO1xuICAgICAgICAgICAgICAgIHRoaXMud29ya2VyLnRyYWNraW5nTG9nLmRlYnVnKGRhdGEuYXBfaWRzKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGYgPSBuZXcgRmVhdHVyZXMoKTtcbiAgICAgICAgICAgICAgICBjb25zdCBmZWF0dXJlcyA9IGYubWFrZUZlYXR1cmVzKGRhdGEuYXBfaWRzKTtcbiAgICAgICAgICAgICAgICBwZi5tb3ZlKGZlYXR1cmVzKTtcbiAgICAgICAgICAgICAgICBjb25zdCBhbGxQYXJ0aWNsZXMgPSBwZi5nZXRQYXJ0aWNsZXMoKTtcbiAgICAgICAgICAgICAgICB0aGlzLndvcmtlci5wYXJ0aWNsZXNbaWRdID0gYWxsUGFydGljbGVzO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgcGFydGljbGVzID0gcGYuZ2V0UGFydGljbGVDb29yZHMoKTtcbiAgICAgICAgICAgICAgICBjb25zdCB1bmlxdWUgPSBwZi5nZXRVbmlxdWVQYXJ0aWNsZXMoKTtcblxuICAgICAgICAgICAgICAgIGxldCBrbSA9IG5ldyBLTWVhbnMoMiwgdW5pcXVlLnNsaWNlKDAsNSkpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGxhcmdlc3RDbHVzdGVyID0ga20uZ2V0TGFyZ2VzdENsdXN0ZXJJbmRleCgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGd1ZXNzID0ga20uZ2V0Q2VudHJvaWQobGFyZ2VzdENsdXN0ZXIpO1xuXG4gICAgICAgICAgICAgICAgcmVzLnNlbmQoe1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBpZDogaWQsXG4gICAgICAgICAgICAgICAgICAgIGd1ZXNzOiBndWVzcyxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogZGF0YS50eXBlLFxuICAgICAgICAgICAgICAgICAgICBwYXJ0aWNsZXM6IHBhcnRpY2xlcyxcbiAgICAgICAgICAgICAgICAgICAgbmVpZ2hib3JzOiB1bmlxdWUsXG4gICAgICAgICAgICAgICAgICAgIGNsdXN0ZXJzOiBrbS5nZXRDbHVzdGVycygpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdMT0NBTElaRScsXG4gICAgICAgICAgICAgICAgICAgIGlkOiBpZCxcbiAgICAgICAgICAgICAgICAgICAgZ3Vlc3M6IGd1ZXNzLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBkYXRhLnR5cGUsXG4gICAgICAgICAgICAgICAgICAgIHBhcnRpY2xlczogcGFydGljbGVzLFxuICAgICAgICAgICAgICAgICAgICBuZWlnaGJvcnM6IHVuaXF1ZSxcbiAgICAgICAgICAgICAgICAgICAgY2x1c3RlcnM6IGttLmdldENsdXN0ZXJzKCksXG4gICAgICAgICAgICAgICAgICAgIGZwX2lkOiBkYXRhLmZwX2lkLFxuICAgICAgICAgICAgICAgICAgICBhbGxfcGFydGljbGVzOiBhbGxQYXJ0aWNsZXNcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH1cblxuICAgIG5vdGlmeUxpc3RlbmVycyhkYXRhOiBPYmplY3QpIHtcbiAgICAgICAgdGhpcy53b3JrZXIuc2VuZChkYXRhKTtcbiAgICB9XG5cbiAgICBqc29uSGVhZGVycyhyZXEsIHJlcywgbmV4dCl7XG4gICAgICAgIHJlcy5oZWFkZXIoXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIiwgXCIqXCIpO1xuICAgICAgICByZXMuaGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vamF2YXNjcmlwdCcpO1xuICAgICAgICByZXMuaGVhZGVyKFwiQ2FjaGUtQ29udHJvbFwiLCBcIm5vLWNhY2hlXCIpO1xuICAgICAgICBuZXh0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUm91dGVzIGFyZSBkZWZpbmVkIGhlcmUgYW5kIG1hcHBlZCB0byBhY3Rpb25zXG4gICAgICovXG4gICAgY3JlYXRlU2VydmVyKCkge1xuICAgICAgICBjb25zdCBhcHAgPSB0aGlzLmFwcDtcblxuICAgICAgICBhcHAucG9zdCgnL3Jlc3QvcnVuTG9jYWxpemVyJywgdGhpcy5qc29uSGVhZGVycywgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJ1bkxvY2FsaXplcihyZXEsIHJlcyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFwcC5wb3N0KCcvcmVzdC9sb2NhbGl6ZScsIHRoaXMuanNvbkhlYWRlcnMsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgdGhpcy5sb2NhbGl6ZShyZXEsIHJlcyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFwcC5nZXQoJy9yZXN0L2FsaXZlJywgdGhpcy5qc29uSGVhZGVycywgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICByZXMuc2VuZCh7c3VjY2VzczogdHJ1ZX0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBhcHAucG9zdCgnL3Jlc3QvdXBkYXRlRGF0YWJhc2UnLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlRGF0YWJhc2UocmVxLCByZXMpO1xuICAgICAgICB9KTtcblxuICAgICAgICBhcHAuZ2V0KCcvZGV2aWNlZGVzY3JpcHRpb24ueG1sJywgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmdldERldmljZURlc2NyaXB0aW9uKHJlcSwgcmVzKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXBwLmdldChcIi9pY29uMjQucG5nXCIsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgdGhpcy5sb2cubG9nKFwiaWNvbjI0LnBuZ1wiKTtcbiAgICAgICAgICAgIHJlcy5oZWFkZXIoXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIiwgXCIqXCIpO1xuICAgICAgICAgICAgcmVzLnNlbmRGaWxlKHByb2Nlc3MuY3dkKCkgKyAnL3NyYy9pY29uMjQucG5nJyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFwcC5nZXQoXCIvcmVzdC9mbG9vcnBsYW5zXCIsIHRoaXMuanNvbkhlYWRlcnMsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgdGhpcy5nZXRGbG9vcnBsYW5zKHJlcSwgcmVzKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXBwLnBvc3QoXCIvcmVzdC9zYXZlUmVhZGluZ3NcIiwgdGhpcy5qc29uSGVhZGVycywgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNhdmVSZWFkaW5ncyhyZXEsIHJlcyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFwcC5nZXQoXCIvcmVzdC9nZXRTY2FubmVkQ29vcmRzLzpmcF9pZFwiLCB0aGlzLmpzb25IZWFkZXJzLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZ2V0U2Nhbm5lZENvb3JkcyhyZXEsIHJlcyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuc2VydmVyID0gaHR0cC5jcmVhdGVTZXJ2ZXIoYXBwKTtcblxuICAgIH1cblxuICAgIGxpc3Rlbihwb3J0KXtcbiAgICAgICAgdGhpcy5zZXJ2ZXIubGlzdGVuKHBvcnQpO1xuICAgIH1cblxuICAgIGdldEFwcCgpOiBleHByZXNzIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXBwO1xuICAgIH1cblxuICAgIGdldFNlcnZlcigpOiBTZXJ2ZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXJ2ZXJcbiAgICB9XG5cbiAgICBnZXRMb2coKTogTG9nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubG9nO1xuICAgIH1cbn1cblxuXG5leHBvcnQgZGVmYXVsdCBSZXN0U2VydmVyOyJdfQ==
//# sourceMappingURL=RestServer.js.map
