'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var express = require('express');
var bodyParser = require('body-parser');
var pjson = require('../package.json');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlc3RTZXJ2ZXIuZXM2Il0sIm5hbWVzIjpbImV4cHJlc3MiLCJyZXF1aXJlIiwiYm9keVBhcnNlciIsInBqc29uIiwiTG9nZ2VyIiwiRGIiLCJmcyIsIlV0aWxzIiwidXVpZCIsIlJlc3RTZXJ2ZXIiLCJpZCIsInY0Iiwib2xkVVVJRCIsInJlYWRGaWxlU3luYyIsImUiLCJ3cml0ZUZpbGVTeW5jIiwibG9nIiwibG9nZm9sZGVyIiwiYnVpbGRlcl9sb2dfZm9sZGVyIiwiZmlsZW5hbWUiLCJmaWxlc2l6ZSIsIm51bWZpbGVzIiwiZGIiLCJhcHAiLCJ1c2UiLCJqc29uIiwibGltaXQiLCJ1cmxlbmNvZGVkIiwiZXh0ZW5kZWQiLCJzdGF0aWMiLCJyZXEiLCJyZXMiLCJkYXRhIiwiYm9keSIsImNsZWFuRGF0YSIsImVycm9yIiwic2V0UmVzcG9uc2VIZWFkZXJzIiwibGF5b3V0X2ltYWdlcyIsImxlbmd0aCIsInVwZGF0ZURhdGFiYXNlIiwiZXJyIiwicm93cyIsInNlbmQiLCJzdWNjZXNzIiwicmVhZEZpbGUiLCJmaWxlIiwiaGVhZGVyIiwic3RhdHVzIiwicmVwbGFjZSIsImdldFNlcnZlcklwIiwiZ2V0Rmxvb3JQbGFucyIsImZvckVhY2giLCJyb3ciLCJsYXlvdXRfaW1hZ2UiLCJKU09OIiwicGFyc2UiLCJwYXlsb2FkIiwibWVzc2FnZSIsInNhdmVSZWFkaW5ncyIsImdldExheW91dEluZm8iLCJjcmVhdGVUYWJsZXMiLCJnZXQiLCJnZXREYXRhYmFzZVZlcnNpb24iLCJwb3N0IiwiZ2V0RGV2aWNlRGVzY3JpcHRpb24iLCJzZW5kRmlsZSIsInByb2Nlc3MiLCJjd2QiLCJnZXRGbG9vcnBsYW5zIiwibGlzdGVuIiwiYnVpbGRlcl9yZXN0X3BvcnQiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxJQUFNQSxVQUFVQyxRQUFRLFNBQVIsQ0FBaEI7QUFDQSxJQUFNQyxhQUFhRCxRQUFRLGFBQVIsQ0FBbkI7QUFDQSxJQUFN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RUFBdUJDLEdBQXZCO0FBQ0gsYUFGRDs7QUFJQVIsZ0JBQUk4QyxNQUFKLENBQVdsRSxNQUFNbUUsaUJBQWpCLEVBQW9DLFlBQVk7QUFDNUN0RCxvQkFBSUEsR0FBSixDQUFRLGdCQUFSO0FBQ0gsYUFGRDtBQUdIOzs7Ozs7QUFNTHVELE9BQU9DLE9BQVAsR0FBaUIvRCxVQUFqQiIsImZpbGUiOiJSZXN0U2VydmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgZXhwcmVzcyA9IHJlcXVpcmUoJ2V4cHJlc3MnKTtcbmNvbnN0IGJvZHlQYXJzZXIgPSByZXF1aXJlKCdib2R5LXBhcnNlcicpO1xuY29uc3QgcGpzb24gPSByZXF1aXJlKCcuLi9wYWNrYWdlLmpzb24nKTtcbmNvbnN0IExvZ2dlciA9IHJlcXVpcmUoJy4vTG9nLmpzJyk7XG5sZXQgRGIgPSByZXF1aXJlKCcuL0RiLmpzJyk7XG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5jb25zdCBVdGlscyA9IHJlcXVpcmUoJy4vVXRpbHMuanMnKTtcbmNvbnN0IHV1aWQgPSByZXF1aXJlKCd1dWlkJyk7XG5cbi8qKlxuICogUmVzdFNlcnZlciBjbGFzcyBpcyB1c2VkIHRvIHBvd2VyIHRoZSByZXN0IHNlcnZlciB0aGF0IHdpbGwgY29tbXVuaWNhdGUgd2l0aCB0aGVcbiAqIG1vYmlsZSBwaG9uZSBvbiB0aGUgbG9jYWwgd2lmaSBuZXR3b3JrLiBUaGlzIHNlcnZlciB3aWxsIHJlc3BvbmQgdG8gdXBucCBkZXZpY2VzXG4gKiB3aXRoIHRoZSBkZXZpY2UgZGVzY3JpcHRpb24geG1sIGZpbGUgYXMgd2VsbCBhcyBoYW5kbGUgYWxsIHNhdmluZyBhbmQgZmV0Y2hpbmcgb2YgZGF0YS5cbiAqXG4gKiBUaGUgcmVzdCBzZXJ2ZXIgdXNlcyBleHByZXNzLmpzIGFuZCBsaXN0ZW5zIG9uIGEgcG9ydCBjb25maWd1cmVkIGJ5IGJ1aWxkZXJfcmVzdF9wb3J0XG4gKiBwYXJhbWV0ZXIgaW4gdGhlIHBhY2thZ2UuanNvbiBmaWxlIHdpdGhpbiB0aGUgcHVibGljIGZvbGRlclxuICpcbiAqIEBhdXRob3IgUmljaCBXYW5kZWxsIDxyaWNod2FuZGVsbEBnbWFpbC5jb20+XG4gKi9cbmNsYXNzIFJlc3RTZXJ2ZXJ7XG5cblxuXG4gICAgY29uc3RydWN0b3IoKXtcbiAgICAgICAgdGhpcy5pZCA9IHV1aWQudjQoKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCBvbGRVVUlEID0gZnMucmVhZEZpbGVTeW5jKFwiLnV1aWRcIiwgXCJ1dGY4XCIpO1xuICAgICAgICAgICAgdGhpcy5pZCA9IG9sZFVVSUQ7XG4gICAgICAgIH1jYXRjaChlKXtcbiAgICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMoXCIudXVpZFwiLCB0aGlzLmlkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubG9nID0gbmV3IExvZ2dlcih7XG4gICAgICAgICAgICBsb2dmb2xkZXI6IHBqc29uLmJ1aWxkZXJfbG9nX2ZvbGRlcixcbiAgICAgICAgICAgIGZpbGVuYW1lOiBcInJlc3QubG9nXCIsXG4gICAgICAgICAgICBmaWxlc2l6ZTogNTAwMDAwMCxcbiAgICAgICAgICAgIG51bWZpbGVzOiAzXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmRiID0gbmV3IERiKHRoaXMubG9nKTtcbiAgICAgICAgdGhpcy5hcHAgPSBleHByZXNzKCk7XG4gICAgICAgIHRoaXMuYXBwLnVzZShib2R5UGFyc2VyLmpzb24oe2xpbWl0OiAnNTBtYid9KSk7XG4gICAgICAgIHRoaXMuYXBwLnVzZShib2R5UGFyc2VyLnVybGVuY29kZWQoeyBleHRlbmRlZDogdHJ1ZSwgbGltaXQ6ICc1MG1iJyB9KSk7XG4gICAgICAgIHRoaXMuYXBwLnVzZSgnL2J1aWxkZXInLCBleHByZXNzLnN0YXRpYygnYnVpbGRlcicpKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNhdmUgaGFuZGxlciBmb3Igc2F2aW5nIGxheW91dCBpbWFnZXMgZnJvbSB0aGUgVUlcbiAgICAgKiBAcGFyYW0gcmVxXG4gICAgICogQHBhcmFtIHJlc1xuICAgICAqL1xuICAgIHVwZGF0ZURhdGFiYXNlKHJlcSwgcmVzKXtcbiAgICAgICAgbGV0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBjb25zdCBkYXRhID0gcmVxLmJvZHk7XG4gICAgICAgIGxldCBjbGVhbkRhdGEgPSB7fTtcbiAgICAgICAgbGV0IGVycm9yID0gZmFsc2U7XG5cbiAgICAgICAgbG9nLmxvZyhcIi9yZXN0L3VwZGF0ZURhdGFiYXNlXCIpO1xuICAgICAgICB0aGlzLnNldFJlc3BvbnNlSGVhZGVycyhyZXMpO1xuXG4gICAgICAgIGlmKHR5cGVvZihkYXRhLmxheW91dF9pbWFnZXMpICE9IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICAgICAgaWYoZGF0YS5sYXlvdXRfaW1hZ2VzLmxlbmd0aCA+IDApe1xuICAgICAgICAgICAgICAgIGNsZWFuRGF0YS5sYXlvdXRfaW1hZ2VzID0gZGF0YS5sYXlvdXRfaW1hZ2VzO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgZXJyb3IgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGVycm9yID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCFlcnJvcil7XG4gICAgICAgICAgICBkYi51cGRhdGVEYXRhYmFzZShjbGVhbkRhdGEsIGZ1bmN0aW9uKGVyciwgcm93cyl7XG4gICAgICAgICAgICAgICAgcmVzLnNlbmQoe3N1Y2Nlc3M6IHRydWV9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHJlcy5zZW5kKHtzdWNjZXNzOiBmYWxzZX0pO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9nLmxvZyhyZXEuYm9keSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgZGV2aWNlIGRlc2NyaXB0aW9uIHhtbCBmaWxlIGZvciB1cG5wIHJlYWRlcnNcbiAgICAgKiBAcGFyYW0gcmVxXG4gICAgICogQHBhcmFtIHJlc1xuICAgICAqL1xuICAgIGdldERldmljZURlc2NyaXB0aW9uKHJlcSwgcmVzKXtcbiAgICAgICAgbGV0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBsZXQgaWQgPSB0aGlzLmlkO1xuICAgICAgICBsb2cubG9nKFwiZGV2aWNlZGVzY3JpcHRpb24ueG1sXCIpO1xuICAgICAgICBmcy5yZWFkRmlsZSgnZGV2aWNlZGVzY3JpcHRpb24ueG1sJywgXCJiaW5hcnlcIiwgZnVuY3Rpb24gKGVyciwgZmlsZSkge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHJlcy5oZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgXCJ0ZXh0L3BsYWluXCIpO1xuICAgICAgICAgICAgICAgIHJlcy5zdGF0dXMoNTAwKS5zZW5kKGVycik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmlsZSA9IGZpbGUucmVwbGFjZSgvXFx7XFx7VUROXFx9XFx9LywgXCJ1dWlkOlwiICsgaWQpO1xuICAgICAgICAgICAgZmlsZSA9IGZpbGUucmVwbGFjZSgvXFx7XFx7RU5EXFx9XFx9LywgXCJodHRwOi8vXCIgKyBVdGlscy5nZXRTZXJ2ZXJJcCgpICsgXCI6ODg4OC9yZXN0L1wiKTtcbiAgICAgICAgICAgIHJlcy5oZWFkZXIoXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIiwgXCIqXCIpO1xuICAgICAgICAgICAgcmVzLmhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcInRleHQveG1sXCIpO1xuICAgICAgICAgICAgcmVzLnNlbmQoZmlsZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYWxsIG9mIHRoZSBsYXlvdXQgaW1hZ2UgcmVjb3JkcyBhcyBhIGpzb24gYXJyYXlcbiAgICAgKiBAcGFyYW0gcmVxXG4gICAgICogQHBhcmFtIHJlc1xuICAgICAqL1xuICAgIGdldEZsb29ycGxhbnMocmVxLCByZXMpe1xuICAgICAgICBsZXQgbG9nID0gdGhpcy5sb2c7XG4gICAgICAgIGxldCBkYiA9IHRoaXMuZGI7XG4gICAgICAgIGxvZy5sb2coXCIvcmVzdC9mbG9vcnBsYW5zXCIpO1xuICAgICAgICB0aGlzLnNldFJlc3BvbnNlSGVhZGVycyhyZXMpO1xuICAgICAgICBkYi5nZXRGbG9vclBsYW5zKGZ1bmN0aW9uKGVyciwgcm93cyl7XG4gICAgICAgICAgICByb3dzLmZvckVhY2goZnVuY3Rpb24ocm93KXtcbiAgICAgICAgICAgICAgICBpZih0eXBlb2Yocm93LmxheW91dF9pbWFnZSkgIT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgICAgICAgICAgICAgIHJvdy5sYXlvdXRfaW1hZ2UgPSBKU09OLnBhcnNlKHJvdy5sYXlvdXRfaW1hZ2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmVzLnNlbmQocm93cyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHNhdmVSZWFkaW5ncyhyZXEsIHJlcyl7XG4gICAgICAgIGxldCBsb2cgPSB0aGlzLmxvZztcbiAgICAgICAgbG9nLmxvZyhcIi9yZXN0L3NhdmVSZWFkaW5nc1wiKTtcbiAgICAgICAgdGhpcy5zZXRSZXNwb25zZUhlYWRlcnMocmVzKTtcbiAgICAgICAgY29uc3QgZGF0YSA9IHJlcS5ib2R5O1xuICAgICAgICBsb2cubG9nKGRhdGEpO1xuICAgICAgICBpZih0eXBlb2YoZGF0YS5wYXlsb2FkKSA9PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgICAgIHJldHVybiByZXMuc2VuZCh7c3VjY2VzczogZmFsc2UsIG1lc3NhZ2U6IFwibWlzc2luZyBwYXlsb2FkXCJ9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRiLnNhdmVSZWFkaW5ncyhkYXRhLnBheWxvYWQpO1xuICAgICAgICByZXMuc2VuZCh7c3VjY2VzczogdHJ1ZX0pO1xuICAgIH1cblxuICAgIGdldExheW91dEluZm8ocmVxLCByZXMpe1xuICAgICAgICBsZXQgbG9nID0gdGhpcy5sb2c7XG4gICAgICAgIGxvZy5sb2coXCIvcmVzdC9sYXlvdXRfaW5mby9hbGxcIik7XG4gICAgICAgIHRoaXMuc2V0UmVzcG9uc2VIZWFkZXJzKHJlcyk7XG5cbiAgICAgICAgdGhpcy5kYi5nZXRMYXlvdXRJbmZvKGZ1bmN0aW9uKGVyciwgcm93cyl7XG4gICAgICAgICAgICByZXMuc2VuZCh7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBwYXlsb2FkOiByb3dzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2V0UmVzcG9uc2VIZWFkZXJzKHJlcyl7XG4gICAgICAgIHJlcy5oZWFkZXIoXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIiwgXCIqXCIpO1xuICAgICAgICByZXMuaGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vamF2YXNjcmlwdCcpO1xuICAgICAgICByZXMuaGVhZGVyKFwiQ2FjaGUtQ29udHJvbFwiLCBcIm5vLWNhY2hlXCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJvdXRlcyBhcmUgZGVmaW5lZCBoZXJlIGFuZCBtYXBwZWQgdG8gYWN0aW9uc1xuICAgICAqL1xuICAgIHN0YXJ0U2VydmVyKCkge1xuICAgICAgICBjb25zdCBkYiA9IHRoaXMuZGI7XG4gICAgICAgIGNvbnN0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBjb25zdCBhcHAgPSB0aGlzLmFwcDtcbiAgICAgICAgZGIuY3JlYXRlVGFibGVzKGxvZyk7XG5cbiAgICAgICAgYXBwLmdldCgnL3Jlc3QvYWxpdmUnLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0UmVzcG9uc2VIZWFkZXJzKHJlcyk7XG4gICAgICAgICAgICByZXMuc2VuZCh7c3VjY2VzczogdHJ1ZX0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBhcHAuZ2V0KCcvcmVzdC9kYXRhYmFzZVZlcnNpb24nLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZ2V0RGF0YWJhc2VWZXJzaW9uKHJlcSwgcmVzKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXBwLnBvc3QoJy9yZXN0L3VwZGF0ZURhdGFiYXNlJywgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZURhdGFiYXNlKHJlcSwgcmVzKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXBwLmdldCgnL2RldmljZWRlc2NyaXB0aW9uLnhtbCcsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgdGhpcy5nZXREZXZpY2VEZXNjcmlwdGlvbihyZXEsIHJlcyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFwcC5nZXQoXCIvaWNvbjI0LnBuZ1wiLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHRoaXMubG9nLmxvZyhcImljb24yNC5wbmdcIik7XG4gICAgICAgICAgICByZXMuaGVhZGVyKFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCIsIFwiKlwiKTtcbiAgICAgICAgICAgIHJlcy5zZW5kRmlsZShwcm9jZXNzLmN3ZCgpICsgJy9zcmMvaWNvbjI0LnBuZycpO1xuICAgICAgICB9KTtcblxuICAgICAgICBhcHAuZ2V0KFwiL3Jlc3QvZmxvb3JwbGFuc1wiLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZ2V0Rmxvb3JwbGFucyhyZXEsIHJlcyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFwcC5wb3N0KFwiL3Jlc3Qvc2F2ZVJlYWRpbmdzXCIsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgdGhpcy5zYXZlUmVhZGluZ3MocmVxLCByZXMpO1xuICAgICAgICB9KTtcblxuICAgICAgICBhcHAubGlzdGVuKHBqc29uLmJ1aWxkZXJfcmVzdF9wb3J0LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsb2cubG9nKCdTZXJ2ZXIgU3RhcnRlZCcpXG4gICAgICAgIH0pO1xuICAgIH1cblxufVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBSZXN0U2VydmVyOyJdfQ==
//# sourceMappingURL=RestServer.js.map
