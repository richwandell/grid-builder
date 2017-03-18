'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Knn = require('./Knn');

var _Knn2 = _interopRequireDefault(_Knn);

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
                knn.getNeighbors(5, function (knn) {
                    log.log(knn);
                    res.send({ succes: true, knn: knn });
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

            app.listen(pjson.builder_rest_port, function () {
                log.log('Server Started');
            });
        }
    }]);

    return RestServer;
}();

module.exports = RestServer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlc3RTZXJ2ZXIuZXM2Il0sIm5hbWVzIjpbImV4cHJlc3MiLCJyZXF1aXJlIiwiYm9keVBhcnNlciIsInBqc29uIiwiTG9nZ2VyIiwiRGIiLCJmcyIsIlV0aWxzIiwidXVpZCIsIlJlc3RTZXJ2ZXIiLCJpZCIsInY0Iiwib2xkVVVJRCIsInJlYWRGaWxlU3luYyIsImUiLCJ3cml0ZUZpbGVTeW5jIiwibG9nIiwibG9nZm9sZGVyIiwiYnVpbGRlcl9sb2dfZm9sZGVyIiwiZmlsZW5hbWUiLCJmaWxlc2l6ZSIsIm51bWZpbGVzIiwiZGIiLCJhcHAiLCJ1c2UiLCJqc29uIiwibGltaXQiLCJ1cmxlbmNvZGVkIiwiZXh0ZW5kZWQiLCJzdGF0aWMiLCJyZXEiLCJyZXMiLCJkYXRhIiwiYm9keSIsImNsZWFuRGF0YSIsImVycm9yIiwic2V0UmVzcG9uc2VIZWFkZXJzIiwibGF5b3V0X2ltYWdlcyIsImxlbmd0aCIsInVwZGF0ZURhdGFiYXNlIiwiZXJyIiwicm93cyIsInNlbmQiLCJzdWNjZXNzIiwicmVhZEZpbGUiLCJmaWxlIiwiaGVhZGVyIiwic3RhdHVzIiwicmVwbGFjZSIsImdldFNlcnZlcklwIiwiZ2V0Rmxvb3JQbGFucyIsImZvckVhY2giLCJyb3ciLCJsYXlvdXRfaW1hZ2UiLCJKU09OIiwicGFyc2UiLCJwYXlsb2FkIiwibWVzc2FnZSIsInNhdmVSZWFkaW5ncyIsImdldExheW91dEluZm8iLCJjcmVhdGVUYWJsZXMiLCJwb3N0Iiwia25uIiwiZnBfaWQiLCJhcF9pZHMiLCJnZXROZWlnaGJvcnMiLCJzdWNjZXMiLCJnZXQiLCJnZXREYXRhYmFzZVZlcnNpb24iLCJnZXREZXZpY2VEZXNjcmlwdGlvbiIsInNlbmRGaWxlIiwicHJvY2VzcyIsImN3ZCIsImdldEZsb29ycGxhbnMiLCJsaXN0ZW4iLCJidWlsZGVyX3Jlc3RfcG9ydCIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTs7Ozs7Ozs7QUFDQSxJQUFNQSxVQUFVQyxR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QUFLc0Msb0JBQUwsQ0FBMEJ2QyxHQUExQixFQUErQkMsR0FBL0I7QUFDSCxhQUZEOztBQUlBUixnQkFBSTRDLEdBQUosQ0FBUSxhQUFSLEVBQXVCLFVBQUNyQyxHQUFELEVBQU1DLEdBQU4sRUFBYztBQUNqQyxzQkFBS2YsR0FBTCxDQUFTQSxHQUFULENBQWEsWUFBYjtBQUNBZSxvQkFBSWUsTUFBSixDQUFXLDZCQUFYLEVBQTBDLEdBQTFDO0FBQ0FmLG9CQUFJdUMsUUFBSixDQUFhQyxRQUFRQyxHQUFSLEtBQWdCLGlCQUE3QjtBQUNILGFBSkQ7O0FBTUFqRCxnQkFBSTRDLEdBQUosQ0FBUSxrQkFBUixFQUE0QixVQUFDckMsR0FBRCxFQUFNQyxHQUFOLEVBQWM7QUFDdEMsc0JBQUswQyxhQUFMLENBQW1CM0MsR0FBbkIsRUFBd0JDLEdBQXhCO0FBQ0gsYUFGRDs7QUFJQVIsZ0JBQUlzQyxJQUFKLENBQVMsb0JBQVQsRUFBK0IsVUFBQy9CLEdBQUQsRUFBTUMsR0FBTixFQUFjO0FBQ3pDLHNCQUFLMkIsWUFBTCxDQUFrQjVCLEdBQWxCLEVBQXVCQyxHQUF2QjtBQUNILGFBRkQ7O0FBSUFSLGdCQUFJbUQsTUFBSixDQUFXdkUsTUFBTXdFLGlCQUFqQixFQUFvQyxZQUFZO0FBQzVDM0Qsb0JBQUlBLEdBQUosQ0FBUSxnQkFBUjtBQUNILGFBRkQ7QUFHSDs7Ozs7O0FBTUw0RCxPQUFPQyxPQUFQLEdBQWlCcEUsVUFBakIiLCJmaWxlIjoiUmVzdFNlcnZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBLbm4gZnJvbSAnLi9Lbm4nO1xuY29uc3QgZXhwcmVzcyA9IHJlcXVpcmUoJ2V4cHJlc3MnKTtcbmNvbnN0IGJvZHlQYXJzZXIgPSByZXF1aXJlKCdib2R5LXBhcnNlcicpO1xuY29uc3QgcGpzb24gPSByZXF1aXJlKCcuLi8uLi9wYWNrYWdlLmpzb24nKTtcbmNvbnN0IExvZ2dlciA9IHJlcXVpcmUoJy4vTG9nLmpzJyk7XG5sZXQgRGIgPSByZXF1aXJlKCcuL0RiLmpzJyk7XG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5jb25zdCBVdGlscyA9IHJlcXVpcmUoJy4vVXRpbHMuanMnKTtcbmNvbnN0IHV1aWQgPSByZXF1aXJlKCd1dWlkJyk7XG5cblxuLyoqXG4gKiBSZXN0U2VydmVyIGNsYXNzIGlzIHVzZWQgdG8gcG93ZXIgdGhlIHJlc3Qgc2VydmVyIHRoYXQgd2lsbCBjb21tdW5pY2F0ZSB3aXRoIHRoZVxuICogbW9iaWxlIHBob25lIG9uIHRoZSBsb2NhbCB3aWZpIG5ldHdvcmsuIFRoaXMgc2VydmVyIHdpbGwgcmVzcG9uZCB0byB1cG5wIGRldmljZXNcbiAqIHdpdGggdGhlIGRldmljZSBkZXNjcmlwdGlvbiB4bWwgZmlsZSBhcyB3ZWxsIGFzIGhhbmRsZSBhbGwgc2F2aW5nIGFuZCBmZXRjaGluZyBvZiBkYXRhLlxuICpcbiAqIFRoZSByZXN0IHNlcnZlciB1c2VzIGV4cHJlc3MuanMgYW5kIGxpc3RlbnMgb24gYSBwb3J0IGNvbmZpZ3VyZWQgYnkgYnVpbGRlcl9yZXN0X3BvcnRcbiAqIHBhcmFtZXRlciBpbiB0aGUgcGFja2FnZS5qc29uIGZpbGUgd2l0aGluIHRoZSBwdWJsaWMgZm9sZGVyXG4gKlxuICogQGF1dGhvciBSaWNoIFdhbmRlbGwgPHJpY2h3YW5kZWxsQGdtYWlsLmNvbT5cbiAqL1xuY2xhc3MgUmVzdFNlcnZlcntcblxuXG5cbiAgICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgICB0aGlzLmlkID0gdXVpZC52NCgpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IG9sZFVVSUQgPSBmcy5yZWFkRmlsZVN5bmMoXCIudXVpZFwiLCBcInV0ZjhcIik7XG4gICAgICAgICAgICB0aGlzLmlkID0gb2xkVVVJRDtcbiAgICAgICAgfWNhdGNoKGUpe1xuICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhcIi51dWlkXCIsIHRoaXMuaWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5sb2cgPSBuZXcgTG9nZ2VyKHtcbiAgICAgICAgICAgIGxvZ2ZvbGRlcjogcGpzb24uYnVpbGRlcl9sb2dfZm9sZGVyLFxuICAgICAgICAgICAgZmlsZW5hbWU6IFwicmVzdC5sb2dcIixcbiAgICAgICAgICAgIGZpbGVzaXplOiA1MDAwMDAwLFxuICAgICAgICAgICAgbnVtZmlsZXM6IDNcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZGIgPSBuZXcgRGIodGhpcy5sb2cpO1xuICAgICAgICB0aGlzLmFwcCA9IGV4cHJlc3MoKTtcbiAgICAgICAgdGhpcy5hcHAudXNlKGJvZHlQYXJzZXIuanNvbih7bGltaXQ6ICc1MG1iJ30pKTtcbiAgICAgICAgdGhpcy5hcHAudXNlKGJvZHlQYXJzZXIudXJsZW5jb2RlZCh7IGV4dGVuZGVkOiB0cnVlLCBsaW1pdDogJzUwbWInIH0pKTtcbiAgICAgICAgdGhpcy5hcHAudXNlKCcvYnVpbGRlcicsIGV4cHJlc3Muc3RhdGljKCdidWlsZGVyJykpXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2F2ZSBoYW5kbGVyIGZvciBzYXZpbmcgbGF5b3V0IGltYWdlcyBmcm9tIHRoZSBVSVxuICAgICAqIEBwYXJhbSByZXFcbiAgICAgKiBAcGFyYW0gcmVzXG4gICAgICovXG4gICAgdXBkYXRlRGF0YWJhc2UocmVxLCByZXMpe1xuICAgICAgICBsZXQgbG9nID0gdGhpcy5sb2c7XG4gICAgICAgIGxldCBkYiA9IHRoaXMuZGI7XG4gICAgICAgIGNvbnN0IGRhdGEgPSByZXEuYm9keTtcbiAgICAgICAgbGV0IGNsZWFuRGF0YSA9IHt9O1xuICAgICAgICBsZXQgZXJyb3IgPSBmYWxzZTtcblxuICAgICAgICBsb2cubG9nKFwiL3Jlc3QvdXBkYXRlRGF0YWJhc2VcIik7XG4gICAgICAgIHRoaXMuc2V0UmVzcG9uc2VIZWFkZXJzKHJlcyk7XG5cbiAgICAgICAgaWYodHlwZW9mKGRhdGEubGF5b3V0X2ltYWdlcykgIT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgICAgICBpZihkYXRhLmxheW91dF9pbWFnZXMubGVuZ3RoID4gMCl7XG4gICAgICAgICAgICAgICAgY2xlYW5EYXRhLmxheW91dF9pbWFnZXMgPSBkYXRhLmxheW91dF9pbWFnZXM7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBlcnJvciA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgZXJyb3IgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoIWVycm9yKXtcbiAgICAgICAgICAgIGRiLnVwZGF0ZURhdGFiYXNlKGNsZWFuRGF0YSwgZnVuY3Rpb24oZXJyLCByb3dzKXtcbiAgICAgICAgICAgICAgICByZXMuc2VuZCh7c3VjY2VzczogdHJ1ZX0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgcmVzLnNlbmQoe3N1Y2Nlc3M6IGZhbHNlfSk7XG4gICAgICAgIH1cblxuICAgICAgICBsb2cubG9nKHJlcS5ib2R5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBkZXZpY2UgZGVzY3JpcHRpb24geG1sIGZpbGUgZm9yIHVwbnAgcmVhZGVyc1xuICAgICAqIEBwYXJhbSByZXFcbiAgICAgKiBAcGFyYW0gcmVzXG4gICAgICovXG4gICAgZ2V0RGV2aWNlRGVzY3JpcHRpb24ocmVxLCByZXMpe1xuICAgICAgICBsZXQgbG9nID0gdGhpcy5sb2c7XG4gICAgICAgIGxldCBpZCA9IHRoaXMuaWQ7XG4gICAgICAgIGxvZy5sb2coXCJkZXZpY2VkZXNjcmlwdGlvbi54bWxcIik7XG4gICAgICAgIGZzLnJlYWRGaWxlKCdkZXZpY2VkZXNjcmlwdGlvbi54bWwnLCBcImJpbmFyeVwiLCBmdW5jdGlvbiAoZXJyLCBmaWxlKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmVzLmhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcInRleHQvcGxhaW5cIik7XG4gICAgICAgICAgICAgICAgcmVzLnN0YXR1cyg1MDApLnNlbmQoZXJyKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaWxlID0gZmlsZS5yZXBsYWNlKC9cXHtcXHtVRE5cXH1cXH0vLCBcInV1aWQ6XCIgKyBpZCk7XG4gICAgICAgICAgICBmaWxlID0gZmlsZS5yZXBsYWNlKC9cXHtcXHtFTkRcXH1cXH0vLCBcImh0dHA6Ly9cIiArIFV0aWxzLmdldFNlcnZlcklwKCkgKyBcIjo4ODg4L3Jlc3QvXCIpO1xuICAgICAgICAgICAgcmVzLmhlYWRlcihcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiLCBcIipcIik7XG4gICAgICAgICAgICByZXMuaGVhZGVyKFwiQ29udGVudC1UeXBlXCIsIFwidGV4dC94bWxcIik7XG4gICAgICAgICAgICByZXMuc2VuZChmaWxlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhbGwgb2YgdGhlIGxheW91dCBpbWFnZSByZWNvcmRzIGFzIGEganNvbiBhcnJheVxuICAgICAqIEBwYXJhbSByZXFcbiAgICAgKiBAcGFyYW0gcmVzXG4gICAgICovXG4gICAgZ2V0Rmxvb3JwbGFucyhyZXEsIHJlcyl7XG4gICAgICAgIGxldCBsb2cgPSB0aGlzLmxvZztcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgbG9nLmxvZyhcIi9yZXN0L2Zsb29ycGxhbnNcIik7XG4gICAgICAgIHRoaXMuc2V0UmVzcG9uc2VIZWFkZXJzKHJlcyk7XG4gICAgICAgIGRiLmdldEZsb29yUGxhbnMoZnVuY3Rpb24oZXJyLCByb3dzKXtcbiAgICAgICAgICAgIHJvd3MuZm9yRWFjaChmdW5jdGlvbihyb3cpe1xuICAgICAgICAgICAgICAgIGlmKHR5cGVvZihyb3cubGF5b3V0X2ltYWdlKSAhPSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgICAgICAgICAgICAgcm93LmxheW91dF9pbWFnZSA9IEpTT04ucGFyc2Uocm93LmxheW91dF9pbWFnZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXMuc2VuZChyb3dzKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2F2ZVJlYWRpbmdzKHJlcSwgcmVzKXtcbiAgICAgICAgbGV0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBsb2cubG9nKFwiL3Jlc3Qvc2F2ZVJlYWRpbmdzXCIpO1xuICAgICAgICB0aGlzLnNldFJlc3BvbnNlSGVhZGVycyhyZXMpO1xuICAgICAgICBjb25zdCBkYXRhID0gcmVxLmJvZHk7XG4gICAgICAgIGxvZy5sb2coZGF0YSk7XG4gICAgICAgIGlmKHR5cGVvZihkYXRhLnBheWxvYWQpID09IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5zZW5kKHtzdWNjZXNzOiBmYWxzZSwgbWVzc2FnZTogXCJtaXNzaW5nIHBheWxvYWRcIn0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZGIuc2F2ZVJlYWRpbmdzKGRhdGEucGF5bG9hZCk7XG4gICAgICAgIHJlcy5zZW5kKHtzdWNjZXNzOiB0cnVlfSk7XG4gICAgfVxuXG4gICAgZ2V0TGF5b3V0SW5mbyhyZXEsIHJlcyl7XG4gICAgICAgIGxldCBsb2cgPSB0aGlzLmxvZztcbiAgICAgICAgbG9nLmxvZyhcIi9yZXN0L2xheW91dF9pbmZvL2FsbFwiKTtcbiAgICAgICAgdGhpcy5zZXRSZXNwb25zZUhlYWRlcnMocmVzKTtcblxuICAgICAgICB0aGlzLmRiLmdldExheW91dEluZm8oZnVuY3Rpb24oZXJyLCByb3dzKXtcbiAgICAgICAgICAgIHJlcy5zZW5kKHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgIHBheWxvYWQ6IHJvd3NcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzZXRSZXNwb25zZUhlYWRlcnMocmVzKXtcbiAgICAgICAgcmVzLmhlYWRlcihcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiLCBcIipcIik7XG4gICAgICAgIHJlcy5oZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qYXZhc2NyaXB0Jyk7XG4gICAgICAgIHJlcy5oZWFkZXIoXCJDYWNoZS1Db250cm9sXCIsIFwibm8tY2FjaGVcIik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUm91dGVzIGFyZSBkZWZpbmVkIGhlcmUgYW5kIG1hcHBlZCB0byBhY3Rpb25zXG4gICAgICovXG4gICAgc3RhcnRTZXJ2ZXIoKSB7XG4gICAgICAgIGNvbnN0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgY29uc3QgbG9nID0gdGhpcy5sb2c7XG4gICAgICAgIGNvbnN0IGFwcCA9IHRoaXMuYXBwO1xuICAgICAgICBkYi5jcmVhdGVUYWJsZXMobG9nKTtcblxuICAgICAgICBhcHAucG9zdCgnL3Jlc3QvbG9jYWxpemUnLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIGxvZy5sb2coJy9yZXN0L2xvY2FsaXplJyk7XG4gICAgICAgICAgICB0aGlzLnNldFJlc3BvbnNlSGVhZGVycyhyZXMpO1xuICAgICAgICAgICAgY29uc3QgZGF0YSA9IHJlcS5ib2R5O1xuICAgICAgICAgICAgbGV0IGtubiA9IG5ldyBLbm4obG9nLCBkYiwgZGF0YS5mcF9pZCwgZGF0YS5hcF9pZHMpO1xuICAgICAgICAgICAga25uLmdldE5laWdoYm9ycyg1LCAoa25uKSA9PiB7XG4gICAgICAgICAgICAgICAgbG9nLmxvZyhrbm4pO1xuICAgICAgICAgICAgICAgIHJlcy5zZW5kKHtzdWNjZXM6IHRydWUsIGtubjoga25ufSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXBwLmdldCgnL3Jlc3QvYWxpdmUnLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0UmVzcG9uc2VIZWFkZXJzKHJlcyk7XG4gICAgICAgICAgICByZXMuc2VuZCh7c3VjY2VzczogdHJ1ZX0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBhcHAuZ2V0KCcvcmVzdC9kYXRhYmFzZVZlcnNpb24nLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZ2V0RGF0YWJhc2VWZXJzaW9uKHJlcSwgcmVzKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXBwLnBvc3QoJy9yZXN0L3VwZGF0ZURhdGFiYXNlJywgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZURhdGFiYXNlKHJlcSwgcmVzKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXBwLmdldCgnL2RldmljZWRlc2NyaXB0aW9uLnhtbCcsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgdGhpcy5nZXREZXZpY2VEZXNjcmlwdGlvbihyZXEsIHJlcyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFwcC5nZXQoXCIvaWNvbjI0LnBuZ1wiLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHRoaXMubG9nLmxvZyhcImljb24yNC5wbmdcIik7XG4gICAgICAgICAgICByZXMuaGVhZGVyKFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCIsIFwiKlwiKTtcbiAgICAgICAgICAgIHJlcy5zZW5kRmlsZShwcm9jZXNzLmN3ZCgpICsgJy9zcmMvaWNvbjI0LnBuZycpO1xuICAgICAgICB9KTtcblxuICAgICAgICBhcHAuZ2V0KFwiL3Jlc3QvZmxvb3JwbGFuc1wiLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZ2V0Rmxvb3JwbGFucyhyZXEsIHJlcyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFwcC5wb3N0KFwiL3Jlc3Qvc2F2ZVJlYWRpbmdzXCIsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgdGhpcy5zYXZlUmVhZGluZ3MocmVxLCByZXMpO1xuICAgICAgICB9KTtcblxuICAgICAgICBhcHAubGlzdGVuKHBqc29uLmJ1aWxkZXJfcmVzdF9wb3J0LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsb2cubG9nKCdTZXJ2ZXIgU3RhcnRlZCcpXG4gICAgICAgIH0pO1xuICAgIH1cblxufVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBSZXN0U2VydmVyOyJdfQ==
//# sourceMappingURL=RestServer.js.map
