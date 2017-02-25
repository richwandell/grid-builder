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
     * Request handler for the /rest/databaseVersion endpoint
     * @param req
     * @param res
     */


    _createClass(RestServer, [{
        key: 'getDatabaseVersion',
        value: function getDatabaseVersion(req, res) {
            var log = this.log;
            var db = this.db;
            log.log("/rest/databaseVersion");
            res.header("Access-Control-Allow-Origin", "*");
            res.header('Content-Type', 'application/javascript');
            db.getDatabaseVersion(function (err, rows) {
                if (rows.length > 0) {
                    res.send({ databaseVersion: rows[0].value, success: true });
                } else {
                    res.send({ databaseVersion: 0, success: true });
                }
            });
        }

        /**
         * Save handler for saving layout images from the UI
         * @param req
         * @param res
         */

    }, {
        key: 'updateDatabase',
        value: function updateDatabase(req, res) {
            var log = this.log;
            var db = this.db;
            var data = req.body;
            var cleanData = {};
            var error = false;

            log.log("/rest/updateDatabase");
            res.header("Access-Control-Allow-Origin", "*");
            res.header('Content-Type', 'application/javascript');
            log.log(req.body);

            if (typeof data.databaseVersion != "undefined") {
                if (!isNaN(data.databaseVersion)) {
                    cleanData.databaseVersion = data.databaseVersion;
                } else {
                    error = true;
                }
                if (typeof data.layout_images != "undefined") {
                    if (data.layout_images.length > 0) {
                        cleanData.layout_images = data.layout_images;
                    } else {
                        error = true;
                    }
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
            res.header("Access-Control-Allow-Origin", "*");
            res.header('Content-Type', 'application/javascript');
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
            res.header("Access-Control-Allow-Origin", "*");
            res.header('Content-Type', 'application/javascript');
            var data = req.body;
            log.log(data);
            if (typeof data.payload == "undefined") {
                return res.send({ success: false, message: "missing payload" });
            }
            this.db.saveReadings(data.payload);
            res.send({ success: true });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlc3RTZXJ2ZXIuZXM2Il0sIm5hbWVzIjpbImV4cHJlc3MiLCJyZXF1aXJlIiwiYm9keVBhcnNlciIsInBqc29uIiwiTG9nZ2VyIiwiRGIiLCJmcyIsIlV0aWxzIiwidXVpZCIsIlJlc3RTZXJ2ZXIiLCJpZCIsInY0Iiwib2xkVVVJRCIsInJlYWRGaWxlU3luYyIsImUiLCJ3cml0ZUZpbGVTeW5jIiwibG9nIiwibG9nZm9sZGVyIiwiYnVpbGRlcl9sb2dfZm9sZGVyIiwiZmlsZW5hbWUiLCJmaWxlc2l6ZSIsIm51bWZpbGVzIiwiZGIiLCJhcHAiLCJ1c2UiLCJqc29uIiwibGltaXQiLCJ1cmxlbmNvZGVkIiwiZXh0ZW5kZWQiLCJzdGF0aWMiLCJyZXEiLCJyZXMiLCJoZWFkZXIiLCJnZXREYXRhYmFzZVZlcnNpb24iLCJlcnIiLCJyb3dzIiwibGVuZ3RoIiwic2VuZCIsImRhdGFiYXNlVmVyc2lvbiIsInZhbHVlIiwic3VjY2VzcyIsImRhdGEiLCJib2R5IiwiY2xlYW5EYXRhIiwiZXJyb3IiLCJpc05hTiIsImxheW91dF9pbWFnZXMiLCJ1cGRhdGVEYXRhYmFzZSIsInJlYWRGaWxlIiwiZmlsZSIsInN0YXR1cyIsInJlcGxhY2UiLCJnZXRTZXJ2ZXJJcCIsImdldEZsb29yUGxhbnMiLCJmb3JFYWNoIiwicm93IiwibGF5b3V0X2ltYWdlIiwiSlNPTiIsInBhcnNlIiwicGF5bG9hZCIsIm1lc3NhZ2UiLCJzYXZlUmVhZGluZ3MiLCJjcmVhdGVUYWJsZXMiLCJnZXQiLCJwb3N0IiwiZ2V0RGV2aWNlRGVzY3JpcHRpb24iLCJzZW5kRmlsZSIsInByb2Nlc3MiLCJjd2QiLCJnZXRGbG9vcnBsYW5zIiwibGlzdGVuIiwiYnVpbGRlcl9yZXN0X3BvcnQiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxJQUFNQSxVQUFVQyxRQUFRLFNBQVIsQ0FBaEI7QUFDQSxJQUFNQyxhQUFhRCxRQUFRLGFBQVIsQ0FBbkI7QUFDQSxJQUFNRSxR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YjtBQUNBZSxvQkFBSUMsTUFBSixDQUFXLDZCQUFYLEVBQTBDLEdBQTFDO0FBQ0FELG9CQUFJbUMsUUFBSixDQUFhQyxRQUFRQyxHQUFSLEtBQWdCLGlCQUE3QjtBQUNILGFBSkQ7O0FBTUE3QyxnQkFBSXdDLEdBQUosQ0FBUSxrQkFBUixFQUE0QixVQUFDakMsR0FBRCxFQUFNQyxHQUFOLEVBQWM7QUFDdEMsc0JBQUtzQyxhQUFMLENBQW1CdkMsR0FBbkIsRUFBd0JDLEdBQXhCO0FBQ0gsYUFGRDs7QUFJQVIsZ0JBQUl5QyxJQUFKLENBQVMsb0JBQVQsRUFBK0IsVUFBQ2xDLEdBQUQsRUFBTUMsR0FBTixFQUFjO0FBQ3pDLHNCQUFLOEIsWUFBTCxDQUFrQi9CLEdBQWxCLEVBQXVCQyxHQUF2QjtBQUNILGFBRkQ7O0FBSUFSLGdCQUFJK0MsTUFBSixDQUFXbkUsTUFBTW9FLGlCQUFqQixFQUFvQyxZQUFZO0FBQzVDdkQsb0JBQUlBLEdBQUosQ0FBUSxnQkFBUjtBQUNILGFBRkQ7QUFHSDs7Ozs7O0FBTUx3RCxPQUFPQyxPQUFQLEdBQWlCaEUsVUFBakIiLCJmaWxlIjoiUmVzdFNlcnZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGV4cHJlc3MgPSByZXF1aXJlKCdleHByZXNzJyk7XG5jb25zdCBib2R5UGFyc2VyID0gcmVxdWlyZSgnYm9keS1wYXJzZXInKTtcbmNvbnN0IHBqc29uID0gcmVxdWlyZSgnLi4vcGFja2FnZS5qc29uJyk7XG5jb25zdCBMb2dnZXIgPSByZXF1aXJlKCcuL0xvZy5qcycpO1xubGV0IERiID0gcmVxdWlyZSgnLi9EYi5qcycpO1xuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuY29uc3QgVXRpbHMgPSByZXF1aXJlKCcuL1V0aWxzLmpzJyk7XG5jb25zdCB1dWlkID0gcmVxdWlyZSgndXVpZCcpO1xuXG4vKipcbiAqIFJlc3RTZXJ2ZXIgY2xhc3MgaXMgdXNlZCB0byBwb3dlciB0aGUgcmVzdCBzZXJ2ZXIgdGhhdCB3aWxsIGNvbW11bmljYXRlIHdpdGggdGhlXG4gKiBtb2JpbGUgcGhvbmUgb24gdGhlIGxvY2FsIHdpZmkgbmV0d29yay4gVGhpcyBzZXJ2ZXIgd2lsbCByZXNwb25kIHRvIHVwbnAgZGV2aWNlc1xuICogd2l0aCB0aGUgZGV2aWNlIGRlc2NyaXB0aW9uIHhtbCBmaWxlIGFzIHdlbGwgYXMgaGFuZGxlIGFsbCBzYXZpbmcgYW5kIGZldGNoaW5nIG9mIGRhdGEuXG4gKlxuICogVGhlIHJlc3Qgc2VydmVyIHVzZXMgZXhwcmVzcy5qcyBhbmQgbGlzdGVucyBvbiBhIHBvcnQgY29uZmlndXJlZCBieSBidWlsZGVyX3Jlc3RfcG9ydFxuICogcGFyYW1ldGVyIGluIHRoZSBwYWNrYWdlLmpzb24gZmlsZSB3aXRoaW4gdGhlIHB1YmxpYyBmb2xkZXJcbiAqXG4gKiBAYXV0aG9yIFJpY2ggV2FuZGVsbCA8cmljaHdhbmRlbGxAZ21haWwuY29tPlxuICovXG5jbGFzcyBSZXN0U2VydmVye1xuXG5cblxuICAgIGNvbnN0cnVjdG9yKCl7XG4gICAgICAgIHRoaXMuaWQgPSB1dWlkLnY0KCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgb2xkVVVJRCA9IGZzLnJlYWRGaWxlU3luYyhcIi51dWlkXCIsIFwidXRmOFwiKTtcbiAgICAgICAgICAgIHRoaXMuaWQgPSBvbGRVVUlEO1xuICAgICAgICB9Y2F0Y2goZSl7XG4gICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKFwiLnV1aWRcIiwgdGhpcy5pZCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxvZyA9IG5ldyBMb2dnZXIoe1xuICAgICAgICAgICAgbG9nZm9sZGVyOiBwanNvbi5idWlsZGVyX2xvZ19mb2xkZXIsXG4gICAgICAgICAgICBmaWxlbmFtZTogXCJyZXN0LmxvZ1wiLFxuICAgICAgICAgICAgZmlsZXNpemU6IDUwMDAwMDAsXG4gICAgICAgICAgICBudW1maWxlczogM1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5kYiA9IG5ldyBEYih0aGlzLmxvZyk7XG4gICAgICAgIHRoaXMuYXBwID0gZXhwcmVzcygpO1xuICAgICAgICB0aGlzLmFwcC51c2UoYm9keVBhcnNlci5qc29uKHtsaW1pdDogJzUwbWInfSkpO1xuICAgICAgICB0aGlzLmFwcC51c2UoYm9keVBhcnNlci51cmxlbmNvZGVkKHsgZXh0ZW5kZWQ6IHRydWUsIGxpbWl0OiAnNTBtYicgfSkpO1xuICAgICAgICB0aGlzLmFwcC51c2UoJy9idWlsZGVyJywgZXhwcmVzcy5zdGF0aWMoJ2J1aWxkZXInKSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXF1ZXN0IGhhbmRsZXIgZm9yIHRoZSAvcmVzdC9kYXRhYmFzZVZlcnNpb24gZW5kcG9pbnRcbiAgICAgKiBAcGFyYW0gcmVxXG4gICAgICogQHBhcmFtIHJlc1xuICAgICAqL1xuICAgIGdldERhdGFiYXNlVmVyc2lvbihyZXEsIHJlcyl7XG4gICAgICAgIGNvbnN0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBjb25zdCBkYiA9IHRoaXMuZGI7XG4gICAgICAgIGxvZy5sb2coXCIvcmVzdC9kYXRhYmFzZVZlcnNpb25cIik7XG4gICAgICAgIHJlcy5oZWFkZXIoXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIiwgXCIqXCIpO1xuICAgICAgICByZXMuaGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vamF2YXNjcmlwdCcpO1xuICAgICAgICBkYi5nZXREYXRhYmFzZVZlcnNpb24oZnVuY3Rpb24oZXJyLCByb3dzKXtcbiAgICAgICAgICAgIGlmKHJvd3MubGVuZ3RoID4gMCl7XG4gICAgICAgICAgICAgICAgcmVzLnNlbmQoe2RhdGFiYXNlVmVyc2lvbjogcm93c1swXS52YWx1ZSwgc3VjY2VzczogdHJ1ZX0pO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgcmVzLnNlbmQoe2RhdGFiYXNlVmVyc2lvbjogMCwgc3VjY2VzczogdHJ1ZX0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTYXZlIGhhbmRsZXIgZm9yIHNhdmluZyBsYXlvdXQgaW1hZ2VzIGZyb20gdGhlIFVJXG4gICAgICogQHBhcmFtIHJlcVxuICAgICAqIEBwYXJhbSByZXNcbiAgICAgKi9cbiAgICB1cGRhdGVEYXRhYmFzZShyZXEsIHJlcyl7XG4gICAgICAgIGxldCBsb2cgPSB0aGlzLmxvZztcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgY29uc3QgZGF0YSA9IHJlcS5ib2R5O1xuICAgICAgICBsZXQgY2xlYW5EYXRhID0ge307XG4gICAgICAgIGxldCBlcnJvciA9IGZhbHNlO1xuXG4gICAgICAgIGxvZy5sb2coXCIvcmVzdC91cGRhdGVEYXRhYmFzZVwiKTtcbiAgICAgICAgcmVzLmhlYWRlcihcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiLCBcIipcIik7XG4gICAgICAgIHJlcy5oZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qYXZhc2NyaXB0Jyk7XG4gICAgICAgIGxvZy5sb2cocmVxLmJvZHkpO1xuXG4gICAgICAgIGlmKHR5cGVvZihkYXRhLmRhdGFiYXNlVmVyc2lvbikgIT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgICAgICBpZighaXNOYU4oZGF0YS5kYXRhYmFzZVZlcnNpb24pKXtcbiAgICAgICAgICAgICAgICBjbGVhbkRhdGEuZGF0YWJhc2VWZXJzaW9uID0gZGF0YS5kYXRhYmFzZVZlcnNpb247XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBlcnJvciA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZih0eXBlb2YoZGF0YS5sYXlvdXRfaW1hZ2VzKSAhPSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgICAgICAgICBpZihkYXRhLmxheW91dF9pbWFnZXMubGVuZ3RoID4gMCl7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFuRGF0YS5sYXlvdXRfaW1hZ2VzID0gZGF0YS5sYXlvdXRfaW1hZ2VzO1xuICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICBlcnJvciA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgZXJyb3IgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGVycm9yID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCFlcnJvcil7XG4gICAgICAgICAgICBkYi51cGRhdGVEYXRhYmFzZShjbGVhbkRhdGEsIGZ1bmN0aW9uKGVyciwgcm93cyl7XG4gICAgICAgICAgICAgICAgcmVzLnNlbmQoe3N1Y2Nlc3M6IHRydWV9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHJlcy5zZW5kKHtzdWNjZXNzOiBmYWxzZX0pO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9nLmxvZyhyZXEuYm9keSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgZGV2aWNlIGRlc2NyaXB0aW9uIHhtbCBmaWxlIGZvciB1cG5wIHJlYWRlcnNcbiAgICAgKiBAcGFyYW0gcmVxXG4gICAgICogQHBhcmFtIHJlc1xuICAgICAqL1xuICAgIGdldERldmljZURlc2NyaXB0aW9uKHJlcSwgcmVzKXtcbiAgICAgICAgbGV0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBsZXQgaWQgPSB0aGlzLmlkO1xuICAgICAgICBsb2cubG9nKFwiZGV2aWNlZGVzY3JpcHRpb24ueG1sXCIpO1xuICAgICAgICBmcy5yZWFkRmlsZSgnZGV2aWNlZGVzY3JpcHRpb24ueG1sJywgXCJiaW5hcnlcIiwgZnVuY3Rpb24gKGVyciwgZmlsZSkge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHJlcy5oZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgXCJ0ZXh0L3BsYWluXCIpO1xuICAgICAgICAgICAgICAgIHJlcy5zdGF0dXMoNTAwKS5zZW5kKGVycik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmlsZSA9IGZpbGUucmVwbGFjZSgvXFx7XFx7VUROXFx9XFx9LywgXCJ1dWlkOlwiICsgaWQpO1xuICAgICAgICAgICAgZmlsZSA9IGZpbGUucmVwbGFjZSgvXFx7XFx7RU5EXFx9XFx9LywgXCJodHRwOi8vXCIgKyBVdGlscy5nZXRTZXJ2ZXJJcCgpICsgXCI6ODg4OC9yZXN0L1wiKTtcbiAgICAgICAgICAgIHJlcy5oZWFkZXIoXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIiwgXCIqXCIpO1xuICAgICAgICAgICAgcmVzLmhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcInRleHQveG1sXCIpO1xuICAgICAgICAgICAgcmVzLnNlbmQoZmlsZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYWxsIG9mIHRoZSBsYXlvdXQgaW1hZ2UgcmVjb3JkcyBhcyBhIGpzb24gYXJyYXlcbiAgICAgKiBAcGFyYW0gcmVxXG4gICAgICogQHBhcmFtIHJlc1xuICAgICAqL1xuICAgIGdldEZsb29ycGxhbnMocmVxLCByZXMpe1xuICAgICAgICBsZXQgbG9nID0gdGhpcy5sb2c7XG4gICAgICAgIGxldCBkYiA9IHRoaXMuZGI7XG4gICAgICAgIGxvZy5sb2coXCIvcmVzdC9mbG9vcnBsYW5zXCIpO1xuICAgICAgICByZXMuaGVhZGVyKFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCIsIFwiKlwiKTtcbiAgICAgICAgcmVzLmhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQnKTtcbiAgICAgICAgZGIuZ2V0Rmxvb3JQbGFucyhmdW5jdGlvbihlcnIsIHJvd3Mpe1xuICAgICAgICAgICAgcm93cy5mb3JFYWNoKGZ1bmN0aW9uKHJvdyl7XG4gICAgICAgICAgICAgICAgaWYodHlwZW9mKHJvdy5sYXlvdXRfaW1hZ2UpICE9IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICAgICAgICAgICAgICByb3cubGF5b3V0X2ltYWdlID0gSlNPTi5wYXJzZShyb3cubGF5b3V0X2ltYWdlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJlcy5zZW5kKHJvd3MpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzYXZlUmVhZGluZ3MocmVxLCByZXMpe1xuICAgICAgICBsZXQgbG9nID0gdGhpcy5sb2c7XG4gICAgICAgIGxvZy5sb2coXCIvcmVzdC9zYXZlUmVhZGluZ3NcIik7XG4gICAgICAgIHJlcy5oZWFkZXIoXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIiwgXCIqXCIpO1xuICAgICAgICByZXMuaGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vamF2YXNjcmlwdCcpO1xuICAgICAgICBjb25zdCBkYXRhID0gcmVxLmJvZHk7XG4gICAgICAgIGxvZy5sb2coZGF0YSk7XG4gICAgICAgIGlmKHR5cGVvZihkYXRhLnBheWxvYWQpID09IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5zZW5kKHtzdWNjZXNzOiBmYWxzZSwgbWVzc2FnZTogXCJtaXNzaW5nIHBheWxvYWRcIn0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZGIuc2F2ZVJlYWRpbmdzKGRhdGEucGF5bG9hZCk7XG4gICAgICAgIHJlcy5zZW5kKHtzdWNjZXNzOiB0cnVlfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUm91dGVzIGFyZSBkZWZpbmVkIGhlcmUgYW5kIG1hcHBlZCB0byBhY3Rpb25zXG4gICAgICovXG4gICAgc3RhcnRTZXJ2ZXIoKSB7XG4gICAgICAgIGNvbnN0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgY29uc3QgbG9nID0gdGhpcy5sb2c7XG4gICAgICAgIGNvbnN0IGFwcCA9IHRoaXMuYXBwO1xuICAgICAgICBkYi5jcmVhdGVUYWJsZXMobG9nKTtcblxuICAgICAgICBhcHAuZ2V0KCcvcmVzdC9kYXRhYmFzZVZlcnNpb24nLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZ2V0RGF0YWJhc2VWZXJzaW9uKHJlcSwgcmVzKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXBwLnBvc3QoJy9yZXN0L3VwZGF0ZURhdGFiYXNlJywgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZURhdGFiYXNlKHJlcSwgcmVzKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXBwLmdldCgnL2RldmljZWRlc2NyaXB0aW9uLnhtbCcsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgdGhpcy5nZXREZXZpY2VEZXNjcmlwdGlvbihyZXEsIHJlcyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFwcC5nZXQoXCIvaWNvbjI0LnBuZ1wiLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHRoaXMubG9nLmxvZyhcImljb24yNC5wbmdcIik7XG4gICAgICAgICAgICByZXMuaGVhZGVyKFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCIsIFwiKlwiKTtcbiAgICAgICAgICAgIHJlcy5zZW5kRmlsZShwcm9jZXNzLmN3ZCgpICsgJy9zcmMvaWNvbjI0LnBuZycpO1xuICAgICAgICB9KTtcblxuICAgICAgICBhcHAuZ2V0KFwiL3Jlc3QvZmxvb3JwbGFuc1wiLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZ2V0Rmxvb3JwbGFucyhyZXEsIHJlcyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFwcC5wb3N0KFwiL3Jlc3Qvc2F2ZVJlYWRpbmdzXCIsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgdGhpcy5zYXZlUmVhZGluZ3MocmVxLCByZXMpO1xuICAgICAgICB9KTtcblxuICAgICAgICBhcHAubGlzdGVuKHBqc29uLmJ1aWxkZXJfcmVzdF9wb3J0LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsb2cubG9nKCdTZXJ2ZXIgU3RhcnRlZCcpXG4gICAgICAgIH0pO1xuICAgIH1cblxufVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBSZXN0U2VydmVyOyJdfQ==
//# sourceMappingURL=RestServer.js.map
