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
            var log = this.log;
            log.log("/rest/saveReadings");
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
    }, {
        key: 'localize',
        value: function localize(req, res) {
            var _this = this;

            this.log.log('/rest/localize');
            this.log.log(req.body.ap_ids);

            var data = req.body;
            var knn = new _Knn2.default(this.log, this.db, data.fp_id, data.ap_ids);
            knn.getNeighbors(5, function (knn) {
                _this.log.log(knn);
                var km = new _KMeans2.default(2, knn);
                var largestCluster = km.getLargestClusterIndex();
                var guess = km.getCentroid(largestCluster);
                var id = data.device_id;

                res.send({
                    succes: true,
                    guess: guess
                });
                _this.notifyListeners({
                    action: 'LOCALIZE',
                    id: id,
                    guess: guess
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
            var _this2 = this;

            var db = this.db;
            var log = this.log;
            var app = this.app;
            db.createTables(log);

            app.post('/rest/localize', this.jsonHeaders, function (req, res) {
                _this2.localize(req, res);
            });

            app.get('/rest/alive', this.jsonHeaders, function (req, res) {
                res.send({ success: true });
            });

            app.post('/rest/updateDatabase', function (req, res) {
                _this2.updateDatabase(req, res);
            });

            app.get('/devicedescription.xml', function (req, res) {
                _this2.getDeviceDescription(req, res);
            });

            app.get("/icon24.png", function (req, res) {
                _this2.log.log("icon24.png");
                res.header("Access-Control-Allow-Origin", "*");
                res.sendFile(process.cwd() + '/src/icon24.png');
            });

            app.get("/rest/floorplans", function (req, res) {
                _this2.getFloorplans(req, res);
            });

            app.post("/rest/saveReadings", this.jsonHeaders, function (req, res) {
                _this2.saveReadings(req, res);
            });

            app.get("/rest/getScannedCoords/:fp_id", this.jsonHeaders, function (req, res) {
                _this2.getScannedCoords(req, res);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvUmVzdFNlcnZlci5lczYiXSwibmFtZXMiOlsiZXhwcmVzcyIsInJlcXVpcmUiLCJib2R5UGFyc2VyIiwicGpzb24iLCJMb2dnZXIiLCJEYiIsImZzIiwiVXRpbHMiLCJ1dWlkIiwiaHR0cCIsIlJlc3RTZXJ2ZXIiLCJpZCIsInY0Iiwib2xkVVVJRCIsInJlYWRGaWxlU3luYyIsImUiLCJ3cml0ZUZpbGVTeW5jIiwibG9nIiwibG9nZm9sZGVyIiwiYnVpbGRlcl9sb2dfZm9sZGVyIiwiZmlsZW5hbWUiLCJmaWxlc2l6ZSIsIm51bWZpbGVzIiwiZGIiLCJhcHAiLCJ1c2UiLCJqc29uIiwibGltaXQiLCJ1cmxlbmNvZGVkIiwiZXh0ZW5kZWQiLCJzdGF0aWMiLCJyZXEiLCJyZXMiLCJkYXRhIiwiYm9keSIsImNsZWFuRGF0YSIsImVycm9yIiwic2V0UmVzcG9uc2VIZWFkZXJzIiwibGF5b3V0X2ltYWdlcyIsImxlbmd0aCIsInVwZGF0ZURhdGFiYXNlIiwiZXJyIiwicm93cyIsInNlbmQiLCJzdWNjZXNzIiwicmVhZEZpbGUiLCJmaWxlIiwiaGVhZGVyIiwic3RhdHVzIiwicmVwbGFjZSIsImdldFNlcnZlcklwIiwiZ2V0Rmxvb3JQbGFucyIsImZvckVhY2giLCJyb3ciLCJsYXlvdXRfaW1hZ2UiLCJKU09OIiwicGFyc2UiLCJwYXJhbXMiLCJnZXRTY2FubmVkQ29vcmRzIiwiZnBfaWQiLCJwYXlsb2FkIiwibWVzc2FnZSIsInNhdmVSZWFkaW5ncyIsImdldExheW91dEluZm8iLCJhcF9pZHMiLCJrbm4iLCJnZXROZWlnaGJvcnMiLCJrbSIsImxhcmdlc3RDbHVzdGVyIiwiZ2V0TGFyZ2VzdENsdXN0ZXJJbmRleCIsImd1ZXNzIiwiZ2V0Q2VudHJvaWQiLCJkZXZpY2VfaWQiLCJzdWNjZXMiLCJub3RpZnlMaXN0ZW5lcnMiLCJhY3Rpb24iLCJjb25zb2xlIiwicHJvY2VzcyIsInBpZCIsIndvcmtlciIsIm5leHQiLCJjcmVhdGVUYWJsZXMiLCJwb3N0IiwianNvbkhlYWRlcnMiLCJsb2NhbGl6ZSIsImdldCIsImdldERldmljZURlc2NyaXB0aW9uIiwic2VuZEZpbGUiLCJjd2QiLCJnZXRGbG9vcnBsYW5zIiwic2VydmVyIiwiY3JlYXRlU2VydmVyIiwicG9ydCIsImxpc3RlbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7OztBQUNBOzs7Ozs7OztBQUNBLElBQU1BLFVBQVVDLFFBQVEsU0FBUixDQUFoQjtBQUNBLElBQU1DLGFBQWFELFFBQVEsYUFBUixDQUFuQjtBQUNBLElBQU1FLFFBQVFGLFFBQVEsb0JBQVIsQ0FBZDtBQUNBLElBQU1HLFNBQVNILFFBQVEsVUFBUixDQUFmO0FBQ0EsSUFBSUksS0FBS0osUUFBUSxTQUFSLENBQVQ7QUFDQSxJQUFNSyxLQUFLTCxRQUFRLElBQVIsQ0FBWDtBQUNBLElBQU1NLFFBQVFOLFFBQVEsWUFBUixDQUFkO0FBQ0EsSUFBTU8sT0FBT1AsUUFBUSxNQUFSLENBQWI7QUFDQSxJQUFNUSxPQUFPUixRQUFRLE1BQVIsQ0FBYjs7QUFJQTs7Ozs7Ozs7Ozs7SUFVTVMsVTtBQUVGLDBCQUFhO0FBQUE7O0FBQ1QsYUFBS0MsRUFBTCxHQUFVSCxLQUFLSSxFQUFMLEVBQVY7QUFDQSxZQUFJO0FBQ0EsZ0JBQUlDLFVBQVVQLEdBQUdRLFlBQUgsQ0FBZ0IsT0FBaEIsRUFBeUIsTUFBekIsQ0FBZDtBQUNBLGlCQUFLSCxFQUFMLEdBQVVFLE9BQVY7QUFDSCxTQUhELENBR0MsT0FBTUUsQ0FBTixFQUFRO0FBQ0xULGVBQUdVLGFBQUgsQ0FBaUIsT0FBakIsRUFBMEIsS0FBS0wsRUFBL0I7QUFDSDs7QUFFRCxhQUFLTSxHQUFMLEdBQVcsSUFBSWIsTUFBSixDQUFXO0FBQ2xCYyx1QkFBV2YsTUFBTWdCLGtCQURDO0FBRWxCQyxzQkFBVSxVQUZRO0FBR2xCQyxzQkFBVSxPQUhRO0FBSWxCQyxzQkFBVTtBQUpRLFNBQVgsQ0FBWDtBQU1BLGFBQUtDLEVBQUwsR0FBVSxJQUFJbEIsRUFBSixDQUFPLEtB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Q0FBWUcsTUFBWixDQUFtQkQsSUFBbkI7QUFDSDs7O2lDQUVpQjtBQUNkLG1CQUFPLEtBQUtwRSxHQUFaO0FBQ0g7OztvQ0FFbUI7QUFDaEIsbUJBQU8sS0FBS2tFLE1BQVo7QUFDSDs7O2lDQUVhO0FBQ1YsbUJBQU8sS0FBS3pFLEdBQVo7QUFDSDs7Ozs7O2tCQUlVUCxVIiwiZmlsZSI6IlJlc3RTZXJ2ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgS25uIGZyb20gJy4vS25uJztcbmltcG9ydCBLTWVhbnMgZnJvbSAnLi9LTWVhbnMnO1xuY29uc3QgZXhwcmVzcyA9IHJlcXVpcmUoJ2V4cHJlc3MnKTtcbmNvbnN0IGJvZHlQYXJzZXIgPSByZXF1aXJlKCdib2R5LXBhcnNlcicpO1xuY29uc3QgcGpzb24gPSByZXF1aXJlKCcuLi8uLi9wYWNrYWdlLmpzb24nKTtcbmNvbnN0IExvZ2dlciA9IHJlcXVpcmUoJy4vTG9nLmpzJyk7XG5sZXQgRGIgPSByZXF1aXJlKCcuL0RiLmpzJyk7XG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5jb25zdCBVdGlscyA9IHJlcXVpcmUoJy4vVXRpbHMuanMnKTtcbmNvbnN0IHV1aWQgPSByZXF1aXJlKCd1dWlkJyk7XG5jb25zdCBodHRwID0gcmVxdWlyZSgnaHR0cCcpO1xuXG5cblxuLyoqXG4gKiBSZXN0U2VydmVyIGNsYXNzIGlzIHVzZWQgdG8gcG93ZXIgdGhlIHJlc3Qgc2VydmVyIHRoYXQgd2lsbCBjb21tdW5pY2F0ZSB3aXRoIHRoZVxuICogbW9iaWxlIHBob25lIG9uIHRoZSBsb2NhbCB3aWZpIG5ldHdvcmsuIFRoaXMgc2VydmVyIHdpbGwgcmVzcG9uZCB0byB1cG5wIGRldmljZXNcbiAqIHdpdGggdGhlIGRldmljZSBkZXNjcmlwdGlvbiB4bWwgZmlsZSBhcyB3ZWxsIGFzIGhhbmRsZSBhbGwgc2F2aW5nIGFuZCBmZXRjaGluZyBvZiBkYXRhLlxuICpcbiAqIFRoZSByZXN0IHNlcnZlciB1c2VzIGV4cHJlc3MuanMgYW5kIGxpc3RlbnMgb24gYSBwb3J0IGNvbmZpZ3VyZWQgYnkgYnVpbGRlcl9yZXN0X3BvcnRcbiAqIHBhcmFtZXRlciBpbiB0aGUgcGFja2FnZS5qc29uIGZpbGUgd2l0aGluIHRoZSBwdWJsaWMgZm9sZGVyXG4gKlxuICogQGF1dGhvciBSaWNoIFdhbmRlbGwgPHJpY2h3YW5kZWxsQGdtYWlsLmNvbT5cbiAqL1xuY2xhc3MgUmVzdFNlcnZlcntcblxuICAgIGNvbnN0cnVjdG9yKCl7XG4gICAgICAgIHRoaXMuaWQgPSB1dWlkLnY0KCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgb2xkVVVJRCA9IGZzLnJlYWRGaWxlU3luYyhcIi51dWlkXCIsIFwidXRmOFwiKTtcbiAgICAgICAgICAgIHRoaXMuaWQgPSBvbGRVVUlEO1xuICAgICAgICB9Y2F0Y2goZSl7XG4gICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKFwiLnV1aWRcIiwgdGhpcy5pZCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxvZyA9IG5ldyBMb2dnZXIoe1xuICAgICAgICAgICAgbG9nZm9sZGVyOiBwanNvbi5idWlsZGVyX2xvZ19mb2xkZXIsXG4gICAgICAgICAgICBmaWxlbmFtZTogXCJyZXN0LmxvZ1wiLFxuICAgICAgICAgICAgZmlsZXNpemU6IDUwMDAwMDAsXG4gICAgICAgICAgICBudW1maWxlczogM1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5kYiA9IG5ldyBEYih0aGlzLmxvZyk7XG4gICAgICAgIHRoaXMuYXBwID0gZXhwcmVzcygpO1xuICAgICAgICB0aGlzLmFwcC51c2UoYm9keVBhcnNlci5qc29uKHtsaW1pdDogJzUwbWInfSkpO1xuICAgICAgICB0aGlzLmFwcC51c2UoYm9keVBhcnNlci51cmxlbmNvZGVkKHsgZXh0ZW5kZWQ6IHRydWUsIGxpbWl0OiAnNTBtYicgfSkpO1xuICAgICAgICB0aGlzLmFwcC51c2UoJy9idWlsZGVyJywgZXhwcmVzcy5zdGF0aWMoJ2J1aWxkZXInKSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTYXZlIGhhbmRsZXIgZm9yIHNhdmluZyBsYXlvdXQgaW1hZ2VzIGZyb20gdGhlIFVJXG4gICAgICogQHBhcmFtIHJlcVxuICAgICAqIEBwYXJhbSByZXNcbiAgICAgKi9cbiAgICB1cGRhdGVEYXRhYmFzZShyZXEsIHJlcyl7XG4gICAgICAgIGxldCBsb2cgPSB0aGlzLmxvZztcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgY29uc3QgZGF0YSA9IHJlcS5ib2R5O1xuICAgICAgICBsZXQgY2xlYW5EYXRhID0ge307XG4gICAgICAgIGxldCBlcnJvciA9IGZhbHNlO1xuXG4gICAgICAgIGxvZy5sb2coXCIvcmVzdC91cGRhdGVEYXRhYmFzZVwiKTtcbiAgICAgICAgdGhpcy5zZXRSZXNwb25zZUhlYWRlcnMocmVzKTtcblxuICAgICAgICBpZih0eXBlb2YoZGF0YS5sYXlvdXRfaW1hZ2VzKSAhPSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgICAgIGlmKGRhdGEubGF5b3V0X2ltYWdlcy5sZW5ndGggPiAwKXtcbiAgICAgICAgICAgICAgICBjbGVhbkRhdGEubGF5b3V0X2ltYWdlcyA9IGRhdGEubGF5b3V0X2ltYWdlcztcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIGVycm9yID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBlcnJvciA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZighZXJyb3Ipe1xuICAgICAgICAgICAgZGIudXBkYXRlRGF0YWJhc2UoY2xlYW5EYXRhLCBmdW5jdGlvbihlcnIsIHJvd3Mpe1xuICAgICAgICAgICAgICAgIHJlcy5zZW5kKHtzdWNjZXNzOiB0cnVlfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICByZXMuc2VuZCh7c3VjY2VzczogZmFsc2V9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxvZy5sb2cocmVxLmJvZHkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGRldmljZSBkZXNjcmlwdGlvbiB4bWwgZmlsZSBmb3IgdXBucCByZWFkZXJzXG4gICAgICogQHBhcmFtIHJlcVxuICAgICAqIEBwYXJhbSByZXNcbiAgICAgKi9cbiAgICBnZXREZXZpY2VEZXNjcmlwdGlvbihyZXEsIHJlcyl7XG4gICAgICAgIGxldCBsb2cgPSB0aGlzLmxvZztcbiAgICAgICAgbGV0IGlkID0gdGhpcy5pZDtcbiAgICAgICAgbG9nLmxvZyhcImRldmljZWRlc2NyaXB0aW9uLnhtbFwiKTtcbiAgICAgICAgZnMucmVhZEZpbGUoJ2RldmljZWRlc2NyaXB0aW9uLnhtbCcsIFwiYmluYXJ5XCIsIGZ1bmN0aW9uIChlcnIsIGZpbGUpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXMuaGVhZGVyKFwiQ29udGVudC1UeXBlXCIsIFwidGV4dC9wbGFpblwiKTtcbiAgICAgICAgICAgICAgICByZXMuc3RhdHVzKDUwMCkuc2VuZChlcnIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbGUgPSBmaWxlLnJlcGxhY2UoL1xce1xce1VETlxcfVxcfS8sIFwidXVpZDpcIiArIGlkKTtcbiAgICAgICAgICAgIGZpbGUgPSBmaWxlLnJlcGxhY2UoL1xce1xce0VORFxcfVxcfS8sIFwiaHR0cDovL1wiICsgVXRpbHMuZ2V0U2VydmVySXAoKSArIFwiOjg4ODgvcmVzdC9cIik7XG4gICAgICAgICAgICByZXMuaGVhZGVyKFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCIsIFwiKlwiKTtcbiAgICAgICAgICAgIHJlcy5oZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgXCJ0ZXh0L3htbFwiKTtcbiAgICAgICAgICAgIHJlcy5zZW5kKGZpbGUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGFsbCBvZiB0aGUgbGF5b3V0IGltYWdlIHJlY29yZHMgYXMgYSBqc29uIGFycmF5XG4gICAgICogQHBhcmFtIHJlcVxuICAgICAqIEBwYXJhbSByZXNcbiAgICAgKi9cbiAgICBnZXRGbG9vcnBsYW5zKHJlcSwgcmVzKXtcbiAgICAgICAgbGV0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBsb2cubG9nKFwiL3Jlc3QvZmxvb3JwbGFuc1wiKTtcbiAgICAgICAgdGhpcy5zZXRSZXNwb25zZUhlYWRlcnMocmVzKTtcbiAgICAgICAgZGIuZ2V0Rmxvb3JQbGFucyhmdW5jdGlvbihlcnIsIHJvd3Mpe1xuICAgICAgICAgICAgcm93cy5mb3JFYWNoKGZ1bmN0aW9uKHJvdyl7XG4gICAgICAgICAgICAgICAgaWYodHlwZW9mKHJvdy5sYXlvdXRfaW1hZ2UpICE9IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICAgICAgICAgICAgICByb3cubGF5b3V0X2ltYWdlID0gSlNPTi5wYXJzZShyb3cubGF5b3V0X2ltYWdlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJlcy5zZW5kKHJvd3MpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXRTY2FubmVkQ29vcmRzKHJlcSwgcmVzKXtcbiAgICAgICAgbGV0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBjb25zdCBkYXRhID0gcmVxLnBhcmFtcztcbiAgICAgICAgbG9nLmxvZyhcIi9yZXN0L2dldFNjYW5uZWRDb29yZHNcIik7XG4gICAgICAgIGRiLmdldFNjYW5uZWRDb29yZHMoZGF0YS5mcF9pZCwgZnVuY3Rpb24oZXJyLCByb3dzKXtcbiAgICAgICAgICAgIHJlcy5zZW5kKHJvd3MpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzYXZlUmVhZGluZ3MocmVxLCByZXMpe1xuICAgICAgICBsZXQgbG9nID0gdGhpcy5sb2c7XG4gICAgICAgIGxvZy5sb2coXCIvcmVzdC9zYXZlUmVhZGluZ3NcIik7XG4gICAgICAgIGNvbnN0IGRhdGEgPSByZXEuYm9keTtcbiAgICAgICAgbG9nLmxvZyhkYXRhKTtcbiAgICAgICAgaWYodHlwZW9mKGRhdGEucGF5bG9hZCkgPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgICAgICByZXR1cm4gcmVzLnNlbmQoe3N1Y2Nlc3M6IGZhbHNlLCBtZXNzYWdlOiBcIm1pc3NpbmcgcGF5bG9hZFwifSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kYi5zYXZlUmVhZGluZ3MoZGF0YS5wYXlsb2FkKTtcbiAgICAgICAgcmVzLnNlbmQoe3N1Y2Nlc3M6IHRydWV9KTtcbiAgICB9XG5cbiAgICBnZXRMYXlvdXRJbmZvKHJlcSwgcmVzKXtcbiAgICAgICAgbGV0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBsb2cubG9nKFwiL3Jlc3QvbGF5b3V0X2luZm8vYWxsXCIpO1xuICAgICAgICB0aGlzLnNldFJlc3BvbnNlSGVhZGVycyhyZXMpO1xuXG4gICAgICAgIHRoaXMuZGIuZ2V0TGF5b3V0SW5mbyhmdW5jdGlvbihlcnIsIHJvd3Mpe1xuICAgICAgICAgICAgcmVzLnNlbmQoe1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgcGF5bG9hZDogcm93c1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHNldFJlc3BvbnNlSGVhZGVycyhyZXMpe1xuICAgICAgICByZXMuaGVhZGVyKFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCIsIFwiKlwiKTtcbiAgICAgICAgcmVzLmhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQnKTtcbiAgICAgICAgcmVzLmhlYWRlcihcIkNhY2hlLUNvbnRyb2xcIiwgXCJuby1jYWNoZVwiKTtcbiAgICB9XG5cbiAgICBsb2NhbGl6ZShyZXEsIHJlcykge1xuICAgICAgICB0aGlzLmxvZy5sb2coJy9yZXN0L2xvY2FsaXplJyk7XG4gICAgICAgIHRoaXMubG9nLmxvZyhyZXEuYm9keS5hcF9pZHMpO1xuXG4gICAgICAgIGNvbnN0IGRhdGEgPSByZXEuYm9keTtcbiAgICAgICAgbGV0IGtubiA9IG5ldyBLbm4odGhpcy5sb2csIHRoaXMuZGIsIGRhdGEuZnBfaWQsIGRhdGEuYXBfaWRzKTtcbiAgICAgICAga25uLmdldE5laWdoYm9ycyg1LCAoa25uKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmxvZy5sb2coa25uKTtcbiAgICAgICAgICAgIGxldCBrbSA9IG5ldyBLTWVhbnMoMiwga25uKTtcbiAgICAgICAgICAgIGNvbnN0IGxhcmdlc3RDbHVzdGVyID0ga20uZ2V0TGFyZ2VzdENsdXN0ZXJJbmRleCgpO1xuICAgICAgICAgICAgY29uc3QgZ3Vlc3MgPSBrbS5nZXRDZW50cm9pZChsYXJnZXN0Q2x1c3Rlcik7XG4gICAgICAgICAgICBjb25zdCBpZCA9IGRhdGEuZGV2aWNlX2lkO1xuXG5cbiAgICAgICAgICAgIHJlcy5zZW5kKHtcbiAgICAgICAgICAgICAgICBzdWNjZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgZ3Vlc3M6IGd1ZXNzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246ICdMT0NBTElaRScsXG4gICAgICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgICAgIGd1ZXNzOiBndWVzc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG5vdGlmeUxpc3RlbmVycyhkYXRhOiBPYmplY3QpIHtcbiAgICAgICAgY29uc29sZS5sb2cocHJvY2Vzcy5waWQpO1xuICAgICAgICB0aGlzLndvcmtlci5zZW5kKGRhdGEpO1xuICAgIH1cblxuICAgIGpzb25IZWFkZXJzKHJlcSwgcmVzLCBuZXh0KXtcbiAgICAgICAgcmVzLmhlYWRlcihcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiLCBcIipcIik7XG4gICAgICAgIHJlcy5oZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qYXZhc2NyaXB0Jyk7XG4gICAgICAgIHJlcy5oZWFkZXIoXCJDYWNoZS1Db250cm9sXCIsIFwibm8tY2FjaGVcIik7XG4gICAgICAgIG5leHQoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSb3V0ZXMgYXJlIGRlZmluZWQgaGVyZSBhbmQgbWFwcGVkIHRvIGFjdGlvbnNcbiAgICAgKi9cbiAgICBjcmVhdGVTZXJ2ZXIoKSB7XG4gICAgICAgIGNvbnN0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgY29uc3QgbG9nID0gdGhpcy5sb2c7XG4gICAgICAgIGNvbnN0IGFwcCA9IHRoaXMuYXBwO1xuICAgICAgICBkYi5jcmVhdGVUYWJsZXMobG9nKTtcblxuICAgICAgICBhcHAucG9zdCgnL3Jlc3QvbG9jYWxpemUnLCB0aGlzLmpzb25IZWFkZXJzLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHRoaXMubG9jYWxpemUocmVxLCByZXMpO1xuICAgICAgICB9KTtcblxuICAgICAgICBhcHAuZ2V0KCcvcmVzdC9hbGl2ZScsIHRoaXMuanNvbkhlYWRlcnMsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgcmVzLnNlbmQoe3N1Y2Nlc3M6IHRydWV9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXBwLnBvc3QoJy9yZXN0L3VwZGF0ZURhdGFiYXNlJywgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZURhdGFiYXNlKHJlcSwgcmVzKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXBwLmdldCgnL2RldmljZWRlc2NyaXB0aW9uLnhtbCcsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgdGhpcy5nZXREZXZpY2VEZXNjcmlwdGlvbihyZXEsIHJlcyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFwcC5nZXQoXCIvaWNvbjI0LnBuZ1wiLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHRoaXMubG9nLmxvZyhcImljb24yNC5wbmdcIik7XG4gICAgICAgICAgICByZXMuaGVhZGVyKFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCIsIFwiKlwiKTtcbiAgICAgICAgICAgIHJlcy5zZW5kRmlsZShwcm9jZXNzLmN3ZCgpICsgJy9zcmMvaWNvbjI0LnBuZycpO1xuICAgICAgICB9KTtcblxuICAgICAgICBhcHAuZ2V0KFwiL3Jlc3QvZmxvb3JwbGFuc1wiLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZ2V0Rmxvb3JwbGFucyhyZXEsIHJlcyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFwcC5wb3N0KFwiL3Jlc3Qvc2F2ZVJlYWRpbmdzXCIsIHRoaXMuanNvbkhlYWRlcnMsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgdGhpcy5zYXZlUmVhZGluZ3MocmVxLCByZXMpO1xuICAgICAgICB9KTtcblxuICAgICAgICBhcHAuZ2V0KFwiL3Jlc3QvZ2V0U2Nhbm5lZENvb3Jkcy86ZnBfaWRcIiwgdGhpcy5qc29uSGVhZGVycywgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmdldFNjYW5uZWRDb29yZHMocmVxLCByZXMpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnNlcnZlciA9IGh0dHAuY3JlYXRlU2VydmVyKGFwcCk7XG5cbiAgICB9XG5cbiAgICBsaXN0ZW4od29ya2VyLCBwb3J0KXtcbiAgICAgICAgdGhpcy53b3JrZXIgPSB3b3JrZXI7XG4gICAgICAgIHRoaXMuc2VydmVyLmxpc3Rlbihwb3J0KTtcbiAgICB9XG5cbiAgICBnZXRBcHAoKTogZXhwcmVzcyB7XG4gICAgICAgIHJldHVybiB0aGlzLmFwcDtcbiAgICB9XG5cbiAgICBnZXRTZXJ2ZXIoKTogU2VydmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VydmVyXG4gICAgfVxuXG4gICAgZ2V0TG9nKCk6IExvZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmxvZztcbiAgICB9XG59XG5cblxuZXhwb3J0IGRlZmF1bHQgUmVzdFNlcnZlcjsiXX0=
//# sourceMappingURL=RestServer.js.map
