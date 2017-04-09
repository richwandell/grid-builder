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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvUmVzdFNlcnZlci5lczYiXSwibmFtZXMiOlsiZXhwcmVzcyIsInJlcXVpcmUiLCJib2R5UGFyc2VyIiwiVXRpbHMiLCJodHRwIiwiZnMiLCJSZXN0U2VydmVyIiwic2VydmVyIiwid29ya2VyIiwiaWQiLCJsb2ciLCJkYiIsImFwcCIsInVzZSIsImpzb24iLCJsaW1pdCIsInVybGVuY29kZWQiLCJleHRlbmRlZCIsInN0YXRpYyIsInJlcSIsInJlcyIsImRhdGEiLCJib2R5IiwiY2xlYW5EYXRhIiwiZXJyb3IiLCJzZXRSZXNwb25zZUhlYWRlcnMiLCJsYXlvdXRfaW1hZ2VzIiwibGVuZ3RoIiwidXBkYXRlRGF0YWJhc2UiLCJlcnIiLCJyb3dzIiwic2VuZCIsInN1Y2Nlc3MiLCJyZWFkRmlsZSIsImZpbGUiLCJoZWFkZXIiLCJzdGF0dXMiLCJyZXBsYWNlIiwiZ2V0U2VydmVySXAiLCJnZXRGbG9vclBsYW5zIiwiZm9yRWFjaCIsInJvdyIsImxheW91dF9pbWFnZSIsIkpTT04iLCJwYXJzZSIsInBhcmFtcyIsImdldFNjYW5uZWRDb29yZHMiLCJmcF9pZCIsInBheWxvYWQiLCJ1bmRlZmluZWQiLCJtZXNzYWdlIiwic2F2ZVJlYWRpbmdzIiwibm90aWZ5TGlzdGVuZXJzIiwiYWN0aW9uIiwiZ2V0TGF5b3V0SW5mbyIsImRldmljZV9pZCIsImNyZWF0ZUZlYXR1cmVzQ2FjaGUiLCJ0aGVuIiwic3RhdGVQYXJ0aWNsZXMiLCJwYXJ0aWNsZXMiLCJwZiIsInNldFBhcnRpY2xlcyIsImYiLCJmZWF0dXJlcyIsIm1ha2VGZWF0dXJlcyIsImFwX2lkcyIsIm1vdmUiLCJhbGxQYXJ0aWNsZXMiLCJnZXRQYXJ0aWNsZXMiLCJnZXRQYXJ0aWNsZUNvb3JkcyIsInVuaXF1ZSIsImdldFVuaXF1ZVBhcnRpY2xlcyIsImttIiwic2xpY2UiLCJsYXJnZXN0Q2x1c3RlciIsImdldExhcmdlc3RDbHVzdGVySW5kZXgiLCJndWVzcyIsImdldENlbnRyb2lkIiwidHlwZSIsIm5laWdoYm9ycyIsImNsdXN0ZXJzIiwiZ2V0Q2x1c3RlcnMiLCJhbGxfcGFydGljbGVzIiwibmV4dCIsInBvc3QiLCJqc29uSGVhZGVycyIsImxvY2FsaXplIiwiZ2V0IiwiZ2V0RGV2aWNlRGVzY3JpcHRpb24iLCJzZW5kRmlsZSIsInByb2Nlc3MiLCJjd2QiLCJnZXRGbG9vcnBsYW5zIiwiY3JlYXRlU2VydmVyIiwicG9ydCIsImxpc3RlbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7QUFFQSxJQUFNQSxVQUFVQyxRQUFRLFNBQVIsQ0FBaEI7QUFDQSxJQUFNQyxhQUFhRCxRQUFRLGFBQVIsQ0FBbkI7QUFDQSxJQUFNRSxRQUFRRixRQUFRLFlBQVIsQ0FBZDtBQUNBLElBQU1HLE9BQU9ILFFBQVEsTUFBUixDQUFiO0FBQ0EsSUFBTUksS0FBS0osUUFBUSxJQUFSLENBQVg7O0FBR0E7Ozs7Ozs7Ozs7O0lBVU1LLFU7QUFFRix3QkFBWUMsTUFBWixFQUEyQjtBQUFBOztBQUN2QixhQUFLQyxNQUFMLEdBQWNELE1BQWQ7QUFDQSxhQUFLRSxFQUFMLEdBQVVGLE9BQU9FLEVBQWpCO0FBQ0EsYUFBS0MsR0FBTCxHQUFXSCxPQUFPRyxHQUFsQjtBQUNBLGFBQUtDLEVBQUwsR0FBVUosT0FBT0ksRUFBakI7O0FBRUEsYUFBS0MsR0FBTCxHQUFXWixTQUFYO0FBQ0EsYUFBS1ksR0FBTCxDQUFTQyxHQUFULENBQWFYLFdBQVdZLElBQVgsQ0FBZ0IsRUFBQ0MsT0FBTyxNQUFSLEVBQWhCLENBQWI7QUFDQSxhQUFLSCxHQUFMLENBQVNDLEdBQVQsQ0FBYVgsV0FBV2MsVUFBWCxDQUFzQixFQUFFQyxVQUFVLElBQVosRUFBa0JGLE9BQU8sTUFBekIsRUFBdEIsQ0FBYjtBQUNBLGFBQUtILEdBQUwsQ0FBU0MsR0FBVCxDQUFhLFVBQWIsRUFBeUJiLFFBQVFrQixNQUFSLENBQWUsU0FBZixDQUF6QjtBQUNIOztBQUVEOzs7Ozs7Ozs7dUNBS2VDLEcsRUFBS0MsRyxFQUFJO0FBQ3BCLGdCQUFJVixNQUFNLEtBQUtBLEdBQWY7QUFDQSxnQkFBSUMsS0FBSyxLQUFLQSxFQUFkO0FBQ0EsZ0JBQU1VLE9BQU9GLElBQUlHLElBQWpCO0FBQ0EsZ0JBQUlDLFlBQVksRUFBaEI7QUFDQSxnQkFBSUMsUUFBUSxLQUFaOztBQUVBZCxnQkFBSUEsR0FBSixDQUFRLHNCQUFSO0FBQ0EsaUJBQUtlLGtCQUFMLENBQXdCTCxHQUF4Qjs7QUFFQSxnQkFBRyxPQUFPQyxLQUFLSyxhQUFaLElBQThCLFdBQWpDLEVBQTZDO0FBQ3pDLG9CQUFHTCxLQUFLSyxhQUFMLENBQW1CQyxNQUFuQixHQUE0QixDQUEvQixFQUFpQztBQUM3QkosOEJBQVVHLGFBQVYsR0FBMEJMLEtBQUtLLGFBQS9CO0FBQ0gsaUJBRkQsTUFFSztBQUNERiw0QkFBUSxJQUFSO0FBQ0g7QUFDSixhQU5ELE1BTUs7QUFDREEsd0JBQVEsSUFBUjtBQUNIOztBQUVELGdCQUFHLENBQUNBLEtBQUosRUFBVTtBQUNOYixtQkFBR2lCLGNBQUgsQ0FBa0JMLFNBQWxCLEVBQTZCLFVBQVNNLEdBQVQsRUFBY0MsSUFBZCxFQUFtQjtBQUM1Q1Ysd0JBQUlXLElBQUosQ0FBUyxFQUFDQyxTQUFTLElBQVYsRUFBVDtBQUNILGlCQUZEO0FBR0gsYUFKRCxNQUlLO0FBQ0RaLG9CQUFJVyxJQUFKLENBQVMsRUFBQ0MsU0FBUyxLQUFWLEVBQVQ7QUFDSDs7QUFFRHRCLGdCQUFJQSxHQUFKLENBQVFTLElBQUlHLElBQVo7QUFDSDs7QUFFRDs7Ozs7Ozs7NkNBS3FCSCxHLEVBQUtDLEcsRUFBSTtBQUMxQixnQkFBSVYsTUFBTSxLQUFLQSxHQUFmO0FBQ0EsZ0JBQUlELEtBQUssS0FBS0EsRUFBZDtBQUNBSixlQUFHNEIsUUFBSCxDQUFZLHVCQUFaLEVBQXFDLFFBQXJDLEVBQStDLFVBQVVKLEdBQVYsRUFBZUssSUFBZixFQUFxQjtBQUNoRSxvQkFBSUwsR0FBSixFQUFTO0FBQ0xULHdCQUFJZSxNQUFKLENBQVcsY0FBWCxFQUEyQixZQUEzQjtBQUNBZix3QkFBSWdCLE1BQUosQ0FBVyxHQUFYLEVBQWdCTCxJQUFoQixDQUFxQkYsR0FBckI7QUFDQTtBQUNIO0FBQ0RLLHVCQUFPQSxLQUFLRyxPQUFMLENBQWEsYUFBYixFQUE0QixVQUFVNUIsRUFBdEMsQ0FBUDtBQUNBeUIsdUJBQU9BLEtBQUtHLE9BQUwsQ0FBYSxhQUFiLEVBQTRCLFlBQVlsQyxNQUFNbUMsV0FBTixFQUFaLEdBQWtDLGFBQTlELENBQVA7QUFDQWxCLG9CQUFJZSxNQUFKLENBQVcsNkJBQVgsRUFBMEMsR0FBMUM7QUFDQWYsb0JBQUllLE1BQUosQ0FBVyxjQUFYLEVBQTJCLFVBQTNCO0FBQ0FmLG9CQUFJVyxJQUFKLENBQVNHLElBQVQ7QUFDSCxhQVhEO0FBWUg7O0FBRUQ7Ozs7Ozs7O3NDQUtjZixHLEVBQUtDLEcsRUFBSTtBQUNuQixnQkFBSVYsTUFBTSxLQUFLQSxHQUFmO0FBQ0EsZ0JBQUlDLEtBQUssS0FBS0EsRUFBZDtBQUNBRCxnQkFBSUEsR0FBSixDQUFRLGtCQUFSO0FBQ0FDLGVBQUc0QixhQUFILENBQWlCLFVBQVNWLEdBQVQsRUFBY0MsSUFBZCxFQUFtQjtBQUNoQ0EscUJBQUtVLE9BQUwsQ0FBYSxVQUFTQyxHQUFULEVBQWE7QUFDdEIsd0JBQUcsT0FBT0EsSUFBSUMsWUFBWCxJQUE0QixXQUEvQixFQUEyQztBQUN2Q0QsNEJBQUlDLFlBQUosR0FBbUJDLEtBQUtDLEtBQUwsQ0FBV0gsSUFBSUMsWUFBZixDQUFuQjtBQUNIO0FBQ0osaUJBSkQ7QUFLQXRCLG9CQUFJVyxJQUFKLENBQVNELElBQVQ7QUFDSCxhQVBEO0FBUUg7Ozt5Q0FFZ0JYLEcsRUFBS0MsRyxFQUFJO0FBQ3RCLGdCQUFJVixNQUFNLEtBQUtBLEdBQWY7QUFDQSxnQkFBSUMsS0FBSyxLQUFLQSxFQUFkO0FBQ0EsZ0JBQU1VLE9BQU9GLElBQUkwQixNQUFqQjtBQUNBbkMsZ0JBQUlBLEdBQUosQ0FBUSx3QkFBUjtBQUNBQyxlQUFHbUMsZ0JBQUgsQ0FBb0J6QixLQUFLMEIsS0FBekIsRUFBZ0MsVUFBU2xCLEdBQVQsRUFBY0MsSUFBZCxFQUFtQjtBQUMvQ1Ysb0JBQUlXLElBQUosQ0FBU0QsSUFBVDtBQUNILGFBRkQ7QUFHSDs7O3FDQUVZWCxHLEVBQUtDLEcsRUFBSTtBQUFBOztBQUNsQixnQkFBSVYsTUFBTSxLQUFLQSxHQUFmO0FBQ0FBLGdCQUFJQSxHQUFKLENBQVEsb0JBQVI7QUFDQSxnQkFBTVcsT0FBT0YsSUFBSUcsSUFBakI7QUFDQVosZ0JBQUlBLEdBQUosQ0FBUVcsSUFBUjtBQUNBLGdCQUFHQSxLQUFLMkIsT0FBTCxLQUFpQkMsU0FBcEIsRUFBOEI7QUFDMUIsdUJBQU83QixJQUFJVyxJQUFKLENBQVMsRUFBQ0MsU0FBUyxLQUFWLEVBQWlCa0IsU0FBUyxpQkFBMUIsRUFBVCxDQUFQO0FBQ0g7QUFDRCxpQkFBS3ZDLEVBQUwsQ0FBUXdDLFlBQVIsQ0FBcUI5QixLQUFLMkIsT0FBMUIsRUFBbUMsVUFBQ0QsS0FBRCxFQUFXO0FBQzFDM0Isb0JBQUlXLElBQUosQ0FBUyxFQUFDQyxTQUFTLElBQVYsRUFBVDtBQUNBLHNCQUFLb0IsZUFBTCxDQUFxQjtBQUNqQkMsNEJBQVEsYUFEUztBQUVqQk4sMkJBQU9BO0FBRlUsaUJBQXJCO0FBSUgsYUFORDtBQVFIOzs7c0NBRWE1QixHLEVBQUtDLEcsRUFBSTtBQUNuQixnQkFBSVYsTUFBTSxLQUFLQSxHQUFmO0FBQ0FBLGdCQUFJQSxHQUFKLENBQVEsdUJBQVI7QUFDQSxpQkFBS2Usa0JBQUwsQ0FBd0JMLEdBQXhCOztBQUVBLGlCQUFLVCxFQUFMLENBQVEyQyxhQUFSLENBQXNCLFVBQVN6QixHQUFULEVBQWNDLElBQWQsRUFBbUI7QUFDckNWLG9CQUFJVyxJQUFKLENBQVM7QUFDTEMsNkJBQVMsSUFESjtBQUVMZ0IsNkJBQVNsQjtBQUZKLGlCQUFUO0FBSUgsYUFMRDtBQU1IOzs7MkNBRWtCVixHLEVBQUk7QUFDbkJBLGdCQUFJZSxNQUFKLENBQVcsNkJBQVgsRUFBMEMsR0FBMUM7QUFDQWYsZ0JBQUllLE1BQUosQ0FBVyxjQUFYLEVBQTJCLHdCQUEzQjtBQUNBZixnQkFBSWUsTUFBSixDQUFXLGVBQVgsRUFBNEIsVUFBNUI7QUFDSDs7O2lDQUVRaEIsRyxFQUFLQyxHLEVBQUs7QUFBQTs7QUFDZixnQkFBTUMsT0FBT0YsSUFBSUcsSUFBakI7QUFDQSxnQkFBTWIsS0FBS1ksS0FBS2tDLFNBQWhCO0FBQ0EsZ0JBQU1SLFFBQVExQixLQUFLMEIsS0FBbkI7O0FBRUEsaUJBQUtwQyxFQUFMLENBQVE2QyxtQkFBUixDQUE0QlQsS0FBNUIsRUFDS1UsSUFETCxDQUNVLFlBQU07O0FBRVIsb0JBQUlDLGlCQUFpQixFQUFyQjtBQUNBLG9CQUFJLE9BQUtsRCxNQUFMLENBQVltRCxTQUFaLENBQXNCbEQsRUFBdEIsTUFBOEJ3QyxTQUFsQyxFQUE2QztBQUN6Q1MscUNBQWlCLE9BQUtsRCxNQUFMLENBQVltRCxTQUFaLENBQXNCbEQsRUFBdEIsQ0FBakI7QUFDSDtBQUNELG9CQUFJbUQsS0FBSyw2QkFBbUIsT0FBS2pELEVBQXhCLEVBQTRCVSxLQUFLMEIsS0FBakMsQ0FBVDtBQUNBYSxtQkFBR0MsWUFBSCxDQUFnQkgsY0FBaEI7O0FBRUEsb0JBQU1JLElBQUksd0JBQVY7QUFDQSxvQkFBTUMsV0FBV0QsRUFBRUUsWUFBRixDQUFlM0MsS0FBSzRDLE1BQXBCLENBQWpCO0FBQ0FMLG1CQUFHTSxJQUFILENBQVFILFFBQVI7QUFDQSxvQkFBTUksZUFBZVAsR0FBR1EsWUFBSCxFQUFyQjtBQUNBLHVCQUFLNUQsTUFBTCxDQUFZbUQsU0FBWixDQUFzQmxELEVBQXRCLElBQTRCMEQsWUFBNUI7O0FBRUEsb0JBQU1SLFlBQVlDLEdBQUdTLGlCQUFILEVBQWxCO0FBQ0Esb0JBQU1DLFNBQVNWLEdBQUdXLGtCQUFILEVBQWY7O0FBRUEsb0JBQUlDLEtBQUsscUJBQVcsQ0FBWCxFQUFjRixPQUFPRyxLQUFQLENBQWEsQ0FBYixFQUFlLENBQWYsQ0FBZCxDQUFUO0FBQ0Esb0JBQU1DLGlCQUFpQkYsR0FBR0csc0JBQUgsRUFBdkI7QUFDQSxvQkFBTUMsUUFBUUosR0FBR0ssV0FBSCxDQUFlSCxjQUFmLENBQWQ7O0FBRUF0RCxvQkFBSVcsSUFBSixDQUFTO0FBQ0xDLDZCQUFTLElBREo7QUFFTHZCLHdCQUFJQSxFQUZDO0FBR0xtRSwyQkFBT0EsS0FIRjtBQUlMRSwwQkFBTXpELEtBQUt5RCxJQUpOO0FBS0xuQiwrQkFBV0EsU0FMTjtBQU1Mb0IsK0JBQVdULE1BTk47QUFPTFUsOEJBQVVSLEdBQUdTLFdBQUg7QUFQTCxpQkFBVDtBQVNBLHVCQUFLN0IsZUFBTCxDQUFxQjtBQUNqQkMsNEJBQVEsVUFEUztBQUVqQjVDLHdCQUFJQSxFQUZhO0FBR2pCbUUsMkJBQU9BLEtBSFU7QUFJakJFLDBCQUFNekQsS0FBS3lELElBSk07QUFLakJuQiwrQkFBV0EsU0FMTTtBQU1qQm9CLCtCQUFXVCxNQU5NO0FBT2pCVSw4QkFBVVIsR0FBR1MsV0FBSCxFQVBPO0FBUWpCbEMsMkJBQU8xQixLQUFLMEIsS0FSSztBQVNqQm1DLG1DQUFlZjtBQVRFLGlCQUFyQjtBQVlILGFBNUNMO0FBOENIOzs7d0NBRWU5QyxJLEVBQWM7QUFDMUIsaUJBQUtiLE1BQUwsQ0FBWXVCLElBQVosQ0FBaUJWLElBQWpCO0FBQ0g7OztvQ0FFV0YsRyxFQUFLQyxHLEVBQUsrRCxJLEVBQUs7QUFDdkIvRCxnQkFBSWUsTUFBSixDQUFXLDZCQUFYLEVBQTBDLEdBQTFDO0FBQ0FmLGdCQUFJZSxNQUFKLENBQVcsY0FBWCxFQUEyQix3QkFBM0I7QUFDQWYsZ0JBQUllLE1BQUosQ0FBVyxlQUFYLEVBQTRCLFVBQTVCO0FBQ0FnRDtBQUNIOztBQUVEOzs7Ozs7dUNBR2U7QUFBQTs7QUFDWCxnQkFBTXZFLE1BQU0sS0FBS0EsR0FBakI7O0FBRUFBLGdCQUFJd0UsSUFBSixDQUFTLGdCQUFULEVBQTJCLEtBQUtDLFdBQWhDLEVBQTZDLFVBQUNsRSxHQUFELEVBQU1DLEdBQU4sRUFBYztBQUN2RCx1QkFBS2tFLFFBQUwsQ0FBY25FLEdBQWQsRUFBbUJDLEdBQW5CO0FBQ0gsYUFGRDs7QUFJQVIsZ0JBQUkyRSxHQUFKLENBQVEsYUFBUixFQUF1QixLQUFLRixXQUE1QixFQUF5QyxVQUFDbEUsR0FBRCxFQUFNQyxHQUFOLEVBQWM7QUFDbkRBLG9CQUFJVyxJQUFKLENBQVMsRUFBQ0MsU0FBUyxJQUFWLEVBQVQ7QUFDSCxhQUZEOztBQUlBcEIsZ0JBQUl3RSxJQUFKLENBQVMsc0JBQVQsRUFBaUMsVUFBQ2pFLEdBQUQsRUFBTUMsR0FBTixFQUFjO0FBQzNDLHVCQUFLUSxjQUFMLENBQW9CVCxHQUFwQixFQUF5QkMsR0FBekI7QUFDSCxhQUZEOztBQUlBUixnQkFBSTJFLEdBQUosQ0FBUSx3QkFBUixFQUFrQyxVQUFDcEUsR0FBRCxFQUFNQyxHQUFOLEVBQWM7QUFDNUMsdUJBQUtvRSxvQkFBTCxDQUEwQnJFLEdBQTFCLEVBQStCQyxHQUEvQjtBQUNILGFBRkQ7O0FBSUFSLGdCQUFJMkUsR0FBSixDQUFRLGFBQVIsRUFBdUIsVUFBQ3BFLEdBQUQsRUFBTUMsR0FBTixFQUFjO0FBQ2pDLHVCQUFLVixHQUFMLENBQVNBLEdBQVQsQ0FBYSxZQUFiO0FBQ0FVLG9CQUFJZSxNQUFKLENBQVcsNkJBQVgsRUFBMEMsR0FBMUM7QUFDQWYsb0JBQUlxRSxRQUFKLENBQWFDLFFBQVFDLEdBQVIsS0FBZ0IsaUJBQTdCO0FBQ0gsYUFKRDs7QUFNQS9FLGdCQUFJMkUsR0FBSixDQUFRLGtCQUFSLEVBQTRCLEtBQUtGLFdBQWpDLEVBQThDLFVBQUNsRSxHQUFELEVBQU1DLEdBQU4sRUFBYztBQUN4RCx1QkFBS3dFLGFBQUwsQ0FBbUJ6RSxHQUFuQixFQUF3QkMsR0FBeEI7QUFDSCxhQUZEOztBQUlBUixnQkFBSXdFLElBQUosQ0FBUyxvQkFBVCxFQUErQixLQUFLQyxXQUFwQyxFQUFpRCxVQUFDbEUsR0FBRCxFQUFNQyxHQUFOLEVBQWM7QUFDM0QsdUJBQUsrQixZQUFMLENBQWtCaEMsR0FBbEIsRUFBdUJDLEdBQXZCO0FBQ0gsYUFGRDs7QUFJQVIsZ0JBQUkyRSxHQUFKLENBQVEsK0JBQVIsRUFBeUMsS0FBS0YsV0FBOUMsRUFBMkQsVUFBQ2xFLEdBQUQsRUFBTUMsR0FBTixFQUFjO0FBQ3JFLHVCQUFLMEIsZ0JBQUwsQ0FBc0IzQixHQUF0QixFQUEyQkMsR0FBM0I7QUFDSCxhQUZEOztBQUlBLGlCQUFLYixNQUFMLEdBQWNILEtBQUt5RixZQUFMLENBQWtCakYsR0FBbEIsQ0FBZDtBQUVIOzs7K0JBRU1rRixJLEVBQUs7QUFDUixpQkFBS3ZGLE1BQUwsQ0FBWXdGLE1BQVosQ0FBbUJELElBQW5CO0FBQ0g7OztpQ0FFaUI7QUFDZCxtQkFBTyxLQUFLbEYsR0FBWjtBQUNIOzs7b0NBRW1CO0FBQ2hCLG1CQUFPLEtBQUtMLE1BQVo7QUFDSDs7O2lDQUVhO0FBQ1YsbUJBQU8sS0FBS0csR0FBWjtBQUNIOzs7Ozs7a0JBSVVKLFUiLCJmaWxlIjoiUmVzdFNlcnZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBLbm4gZnJvbSAnLi9Lbm4nO1xuaW1wb3J0IEtNZWFucyBmcm9tICcuL0tNZWFucyc7XG5pbXBvcnQgUGFydGljbGVGaWx0ZXIgZnJvbSAnLi9QYXJ0aWNsZUZpbHRlcic7XG5pbXBvcnQgRmVhdHVyZXMgZnJvbSAnLi9GZWF0dXJlcyc7XG5cbmNvbnN0IGV4cHJlc3MgPSByZXF1aXJlKCdleHByZXNzJyk7XG5jb25zdCBib2R5UGFyc2VyID0gcmVxdWlyZSgnYm9keS1wYXJzZXInKTtcbmNvbnN0IFV0aWxzID0gcmVxdWlyZSgnLi9VdGlscy5qcycpO1xuY29uc3QgaHR0cCA9IHJlcXVpcmUoJ2h0dHAnKTtcbmNvbnN0IGZzID0gcmVxdWlyZShcImZzXCIpO1xuXG5cbi8qKlxuICogUmVzdFNlcnZlciBjbGFzcyBpcyB1c2VkIHRvIHBvd2VyIHRoZSByZXN0IHNlcnZlciB0aGF0IHdpbGwgY29tbXVuaWNhdGUgd2l0aCB0aGVcbiAqIG1vYmlsZSBwaG9uZSBvbiB0aGUgbG9jYWwgd2lmaSBuZXR3b3JrLiBUaGlzIHNlcnZlciB3aWxsIHJlc3BvbmQgdG8gdXBucCBkZXZpY2VzXG4gKiB3aXRoIHRoZSBkZXZpY2UgZGVzY3JpcHRpb24geG1sIGZpbGUgYXMgd2VsbCBhcyBoYW5kbGUgYWxsIHNhdmluZyBhbmQgZmV0Y2hpbmcgb2YgZGF0YS5cbiAqXG4gKiBUaGUgcmVzdCBzZXJ2ZXIgdXNlcyBleHByZXNzLmpzIGFuZCBsaXN0ZW5zIG9uIGEgcG9ydCBjb25maWd1cmVkIGJ5IGJ1aWxkZXJfcmVzdF9wb3J0XG4gKiBwYXJhbWV0ZXIgaW4gdGhlIHBhY2thZ2UuanNvbiBmaWxlIHdpdGhpbiB0aGUgcHVibGljIGZvbGRlclxuICpcbiAqIEBhdXRob3IgUmljaCBXYW5kZWxsIDxyaWNod2FuZGVsbEBnbWFpbC5jb20+XG4gKi9cbmNsYXNzIFJlc3RTZXJ2ZXJ7XG5cbiAgICBjb25zdHJ1Y3RvcihzZXJ2ZXI6IFNlcnZlcil7XG4gICAgICAgIHRoaXMud29ya2VyID0gc2VydmVyO1xuICAgICAgICB0aGlzLmlkID0gc2VydmVyLmlkO1xuICAgICAgICB0aGlzLmxvZyA9IHNlcnZlci5sb2c7XG4gICAgICAgIHRoaXMuZGIgPSBzZXJ2ZXIuZGI7XG5cbiAgICAgICAgdGhpcy5hcHAgPSBleHByZXNzKCk7XG4gICAgICAgIHRoaXMuYXBwLnVzZShib2R5UGFyc2VyLmpzb24oe2xpbWl0OiAnNTBtYid9KSk7XG4gICAgICAgIHRoaXMuYXBwLnVzZShib2R5UGFyc2VyLnVybGVuY29kZWQoeyBleHRlbmRlZDogdHJ1ZSwgbGltaXQ6ICc1MG1iJyB9KSk7XG4gICAgICAgIHRoaXMuYXBwLnVzZSgnL2J1aWxkZXInLCBleHByZXNzLnN0YXRpYygnYnVpbGRlcicpKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNhdmUgaGFuZGxlciBmb3Igc2F2aW5nIGxheW91dCBpbWFnZXMgZnJvbSB0aGUgVUlcbiAgICAgKiBAcGFyYW0gcmVxXG4gICAgICogQHBhcmFtIHJlc1xuICAgICAqL1xuICAgIHVwZGF0ZURhdGFiYXNlKHJlcSwgcmVzKXtcbiAgICAgICAgbGV0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBjb25zdCBkYXRhID0gcmVxLmJvZHk7XG4gICAgICAgIGxldCBjbGVhbkRhdGEgPSB7fTtcbiAgICAgICAgbGV0IGVycm9yID0gZmFsc2U7XG5cbiAgICAgICAgbG9nLmxvZyhcIi9yZXN0L3VwZGF0ZURhdGFiYXNlXCIpO1xuICAgICAgICB0aGlzLnNldFJlc3BvbnNlSGVhZGVycyhyZXMpO1xuXG4gICAgICAgIGlmKHR5cGVvZihkYXRhLmxheW91dF9pbWFnZXMpICE9IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICAgICAgaWYoZGF0YS5sYXlvdXRfaW1hZ2VzLmxlbmd0aCA+IDApe1xuICAgICAgICAgICAgICAgIGNsZWFuRGF0YS5sYXlvdXRfaW1hZ2VzID0gZGF0YS5sYXlvdXRfaW1hZ2VzO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgZXJyb3IgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGVycm9yID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCFlcnJvcil7XG4gICAgICAgICAgICBkYi51cGRhdGVEYXRhYmFzZShjbGVhbkRhdGEsIGZ1bmN0aW9uKGVyciwgcm93cyl7XG4gICAgICAgICAgICAgICAgcmVzLnNlbmQoe3N1Y2Nlc3M6IHRydWV9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHJlcy5zZW5kKHtzdWNjZXNzOiBmYWxzZX0pO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9nLmxvZyhyZXEuYm9keSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgZGV2aWNlIGRlc2NyaXB0aW9uIHhtbCBmaWxlIGZvciB1cG5wIHJlYWRlcnNcbiAgICAgKiBAcGFyYW0gcmVxXG4gICAgICogQHBhcmFtIHJlc1xuICAgICAqL1xuICAgIGdldERldmljZURlc2NyaXB0aW9uKHJlcSwgcmVzKXtcbiAgICAgICAgbGV0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBsZXQgaWQgPSB0aGlzLmlkO1xuICAgICAgICBmcy5yZWFkRmlsZSgnZGV2aWNlZGVzY3JpcHRpb24ueG1sJywgXCJiaW5hcnlcIiwgZnVuY3Rpb24gKGVyciwgZmlsZSkge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHJlcy5oZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgXCJ0ZXh0L3BsYWluXCIpO1xuICAgICAgICAgICAgICAgIHJlcy5zdGF0dXMoNTAwKS5zZW5kKGVycik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmlsZSA9IGZpbGUucmVwbGFjZSgvXFx7XFx7VUROXFx9XFx9LywgXCJ1dWlkOlwiICsgaWQpO1xuICAgICAgICAgICAgZmlsZSA9IGZpbGUucmVwbGFjZSgvXFx7XFx7RU5EXFx9XFx9LywgXCJodHRwOi8vXCIgKyBVdGlscy5nZXRTZXJ2ZXJJcCgpICsgXCI6ODg4OC9yZXN0L1wiKTtcbiAgICAgICAgICAgIHJlcy5oZWFkZXIoXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIiwgXCIqXCIpO1xuICAgICAgICAgICAgcmVzLmhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcInRleHQveG1sXCIpO1xuICAgICAgICAgICAgcmVzLnNlbmQoZmlsZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYWxsIG9mIHRoZSBsYXlvdXQgaW1hZ2UgcmVjb3JkcyBhcyBhIGpzb24gYXJyYXlcbiAgICAgKiBAcGFyYW0gcmVxXG4gICAgICogQHBhcmFtIHJlc1xuICAgICAqL1xuICAgIGdldEZsb29ycGxhbnMocmVxLCByZXMpe1xuICAgICAgICBsZXQgbG9nID0gdGhpcy5sb2c7XG4gICAgICAgIGxldCBkYiA9IHRoaXMuZGI7XG4gICAgICAgIGxvZy5sb2coXCIvcmVzdC9mbG9vcnBsYW5zXCIpO1xuICAgICAgICBkYi5nZXRGbG9vclBsYW5zKGZ1bmN0aW9uKGVyciwgcm93cyl7XG4gICAgICAgICAgICByb3dzLmZvckVhY2goZnVuY3Rpb24ocm93KXtcbiAgICAgICAgICAgICAgICBpZih0eXBlb2Yocm93LmxheW91dF9pbWFnZSkgIT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgICAgICAgICAgICAgIHJvdy5sYXlvdXRfaW1hZ2UgPSBKU09OLnBhcnNlKHJvdy5sYXlvdXRfaW1hZ2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmVzLnNlbmQocm93cyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldFNjYW5uZWRDb29yZHMocmVxLCByZXMpe1xuICAgICAgICBsZXQgbG9nID0gdGhpcy5sb2c7XG4gICAgICAgIGxldCBkYiA9IHRoaXMuZGI7XG4gICAgICAgIGNvbnN0IGRhdGEgPSByZXEucGFyYW1zO1xuICAgICAgICBsb2cubG9nKFwiL3Jlc3QvZ2V0U2Nhbm5lZENvb3Jkc1wiKTtcbiAgICAgICAgZGIuZ2V0U2Nhbm5lZENvb3JkcyhkYXRhLmZwX2lkLCBmdW5jdGlvbihlcnIsIHJvd3Mpe1xuICAgICAgICAgICAgcmVzLnNlbmQocm93cyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHNhdmVSZWFkaW5ncyhyZXEsIHJlcyl7XG4gICAgICAgIGxldCBsb2cgPSB0aGlzLmxvZztcbiAgICAgICAgbG9nLmxvZyhcIi9yZXN0L3NhdmVSZWFkaW5nc1wiKTtcbiAgICAgICAgY29uc3QgZGF0YSA9IHJlcS5ib2R5O1xuICAgICAgICBsb2cubG9nKGRhdGEpO1xuICAgICAgICBpZihkYXRhLnBheWxvYWQgPT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICByZXR1cm4gcmVzLnNlbmQoe3N1Y2Nlc3M6IGZhbHNlLCBtZXNzYWdlOiBcIm1pc3NpbmcgcGF5bG9hZFwifSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kYi5zYXZlUmVhZGluZ3MoZGF0YS5wYXlsb2FkLCAoZnBfaWQpID0+IHtcbiAgICAgICAgICAgIHJlcy5zZW5kKHtzdWNjZXNzOiB0cnVlfSk7XG4gICAgICAgICAgICB0aGlzLm5vdGlmeUxpc3RlbmVycyh7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiAnTkVXX1JFQURJTkcnLFxuICAgICAgICAgICAgICAgIGZwX2lkOiBmcF9pZFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgZ2V0TGF5b3V0SW5mbyhyZXEsIHJlcyl7XG4gICAgICAgIGxldCBsb2cgPSB0aGlzLmxvZztcbiAgICAgICAgbG9nLmxvZyhcIi9yZXN0L2xheW91dF9pbmZvL2FsbFwiKTtcbiAgICAgICAgdGhpcy5zZXRSZXNwb25zZUhlYWRlcnMocmVzKTtcblxuICAgICAgICB0aGlzLmRiLmdldExheW91dEluZm8oZnVuY3Rpb24oZXJyLCByb3dzKXtcbiAgICAgICAgICAgIHJlcy5zZW5kKHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgIHBheWxvYWQ6IHJvd3NcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzZXRSZXNwb25zZUhlYWRlcnMocmVzKXtcbiAgICAgICAgcmVzLmhlYWRlcihcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiLCBcIipcIik7XG4gICAgICAgIHJlcy5oZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qYXZhc2NyaXB0Jyk7XG4gICAgICAgIHJlcy5oZWFkZXIoXCJDYWNoZS1Db250cm9sXCIsIFwibm8tY2FjaGVcIik7XG4gICAgfVxuXG4gICAgbG9jYWxpemUocmVxLCByZXMpIHtcbiAgICAgICAgY29uc3QgZGF0YSA9IHJlcS5ib2R5O1xuICAgICAgICBjb25zdCBpZCA9IGRhdGEuZGV2aWNlX2lkO1xuICAgICAgICBjb25zdCBmcF9pZCA9IGRhdGEuZnBfaWQ7XG5cbiAgICAgICAgdGhpcy5kYi5jcmVhdGVGZWF0dXJlc0NhY2hlKGZwX2lkKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgbGV0IHN0YXRlUGFydGljbGVzID0gW107XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMud29ya2VyLnBhcnRpY2xlc1tpZF0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBzdGF0ZVBhcnRpY2xlcyA9IHRoaXMud29ya2VyLnBhcnRpY2xlc1tpZF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxldCBwZiA9IG5ldyBQYXJ0aWNsZUZpbHRlcih0aGlzLmRiLCBkYXRhLmZwX2lkKTtcbiAgICAgICAgICAgICAgICBwZi5zZXRQYXJ0aWNsZXMoc3RhdGVQYXJ0aWNsZXMpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgZiA9IG5ldyBGZWF0dXJlcygpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGZlYXR1cmVzID0gZi5tYWtlRmVhdHVyZXMoZGF0YS5hcF9pZHMpO1xuICAgICAgICAgICAgICAgIHBmLm1vdmUoZmVhdHVyZXMpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGFsbFBhcnRpY2xlcyA9IHBmLmdldFBhcnRpY2xlcygpO1xuICAgICAgICAgICAgICAgIHRoaXMud29ya2VyLnBhcnRpY2xlc1tpZF0gPSBhbGxQYXJ0aWNsZXM7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBwYXJ0aWNsZXMgPSBwZi5nZXRQYXJ0aWNsZUNvb3JkcygpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHVuaXF1ZSA9IHBmLmdldFVuaXF1ZVBhcnRpY2xlcygpO1xuXG4gICAgICAgICAgICAgICAgbGV0IGttID0gbmV3IEtNZWFucygyLCB1bmlxdWUuc2xpY2UoMCw1KSk7XG4gICAgICAgICAgICAgICAgY29uc3QgbGFyZ2VzdENsdXN0ZXIgPSBrbS5nZXRMYXJnZXN0Q2x1c3RlckluZGV4KCk7XG4gICAgICAgICAgICAgICAgY29uc3QgZ3Vlc3MgPSBrbS5nZXRDZW50cm9pZChsYXJnZXN0Q2x1c3Rlcik7XG5cbiAgICAgICAgICAgICAgICByZXMuc2VuZCh7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGlkOiBpZCxcbiAgICAgICAgICAgICAgICAgICAgZ3Vlc3M6IGd1ZXNzLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBkYXRhLnR5cGUsXG4gICAgICAgICAgICAgICAgICAgIHBhcnRpY2xlczogcGFydGljbGVzLFxuICAgICAgICAgICAgICAgICAgICBuZWlnaGJvcnM6IHVuaXF1ZSxcbiAgICAgICAgICAgICAgICAgICAgY2x1c3RlcnM6IGttLmdldENsdXN0ZXJzKClcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLm5vdGlmeUxpc3RlbmVycyh7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ0xPQ0FMSVpFJyxcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgICAgICAgICBndWVzczogZ3Vlc3MsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IGRhdGEudHlwZSxcbiAgICAgICAgICAgICAgICAgICAgcGFydGljbGVzOiBwYXJ0aWNsZXMsXG4gICAgICAgICAgICAgICAgICAgIG5laWdoYm9yczogdW5pcXVlLFxuICAgICAgICAgICAgICAgICAgICBjbHVzdGVyczoga20uZ2V0Q2x1c3RlcnMoKSxcbiAgICAgICAgICAgICAgICAgICAgZnBfaWQ6IGRhdGEuZnBfaWQsXG4gICAgICAgICAgICAgICAgICAgIGFsbF9wYXJ0aWNsZXM6IGFsbFBhcnRpY2xlc1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgbm90aWZ5TGlzdGVuZXJzKGRhdGE6IE9iamVjdCkge1xuICAgICAgICB0aGlzLndvcmtlci5zZW5kKGRhdGEpO1xuICAgIH1cblxuICAgIGpzb25IZWFkZXJzKHJlcSwgcmVzLCBuZXh0KXtcbiAgICAgICAgcmVzLmhlYWRlcihcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiLCBcIipcIik7XG4gICAgICAgIHJlcy5oZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qYXZhc2NyaXB0Jyk7XG4gICAgICAgIHJlcy5oZWFkZXIoXCJDYWNoZS1Db250cm9sXCIsIFwibm8tY2FjaGVcIik7XG4gICAgICAgIG5leHQoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSb3V0ZXMgYXJlIGRlZmluZWQgaGVyZSBhbmQgbWFwcGVkIHRvIGFjdGlvbnNcbiAgICAgKi9cbiAgICBjcmVhdGVTZXJ2ZXIoKSB7XG4gICAgICAgIGNvbnN0IGFwcCA9IHRoaXMuYXBwO1xuXG4gICAgICAgIGFwcC5wb3N0KCcvcmVzdC9sb2NhbGl6ZScsIHRoaXMuanNvbkhlYWRlcnMsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgdGhpcy5sb2NhbGl6ZShyZXEsIHJlcyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFwcC5nZXQoJy9yZXN0L2FsaXZlJywgdGhpcy5qc29uSGVhZGVycywgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICByZXMuc2VuZCh7c3VjY2VzczogdHJ1ZX0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBhcHAucG9zdCgnL3Jlc3QvdXBkYXRlRGF0YWJhc2UnLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlRGF0YWJhc2UocmVxLCByZXMpO1xuICAgICAgICB9KTtcblxuICAgICAgICBhcHAuZ2V0KCcvZGV2aWNlZGVzY3JpcHRpb24ueG1sJywgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmdldERldmljZURlc2NyaXB0aW9uKHJlcSwgcmVzKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXBwLmdldChcIi9pY29uMjQucG5nXCIsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgdGhpcy5sb2cubG9nKFwiaWNvbjI0LnBuZ1wiKTtcbiAgICAgICAgICAgIHJlcy5oZWFkZXIoXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIiwgXCIqXCIpO1xuICAgICAgICAgICAgcmVzLnNlbmRGaWxlKHByb2Nlc3MuY3dkKCkgKyAnL3NyYy9pY29uMjQucG5nJyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFwcC5nZXQoXCIvcmVzdC9mbG9vcnBsYW5zXCIsIHRoaXMuanNvbkhlYWRlcnMsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgdGhpcy5nZXRGbG9vcnBsYW5zKHJlcSwgcmVzKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXBwLnBvc3QoXCIvcmVzdC9zYXZlUmVhZGluZ3NcIiwgdGhpcy5qc29uSGVhZGVycywgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNhdmVSZWFkaW5ncyhyZXEsIHJlcyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFwcC5nZXQoXCIvcmVzdC9nZXRTY2FubmVkQ29vcmRzLzpmcF9pZFwiLCB0aGlzLmpzb25IZWFkZXJzLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZ2V0U2Nhbm5lZENvb3JkcyhyZXEsIHJlcyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuc2VydmVyID0gaHR0cC5jcmVhdGVTZXJ2ZXIoYXBwKTtcblxuICAgIH1cblxuICAgIGxpc3Rlbihwb3J0KXtcbiAgICAgICAgdGhpcy5zZXJ2ZXIubGlzdGVuKHBvcnQpO1xuICAgIH1cblxuICAgIGdldEFwcCgpOiBleHByZXNzIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXBwO1xuICAgIH1cblxuICAgIGdldFNlcnZlcigpOiBTZXJ2ZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXJ2ZXJcbiAgICB9XG5cbiAgICBnZXRMb2coKTogTG9nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubG9nO1xuICAgIH1cbn1cblxuXG5leHBvcnQgZGVmYXVsdCBSZXN0U2VydmVyOyJdfQ==
//# sourceMappingURL=RestServer.js.map
