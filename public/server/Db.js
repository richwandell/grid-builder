'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _KalmanFilter = require('./KalmanFilter');

var _KalmanFilter2 = _interopRequireDefault(_KalmanFilter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var sqlite3 = require('sqlite3').verbose();

var Db = function () {
    function Db(log) {
        var _this = this;

        _classCallCheck(this, Db);

        this.log = log;
        this.db = new sqlite3.Database('db/db.sqlite3');
        this.db.configure('busyTimeout', 15000);
        this.db.serialize(function () {
            _this.db.exec("PRAGMA journal_mode = WAL;");
            _this.db.exec("PRAGMA cache_size = 4096000;");
            _this.db.exec("PRAGMA optimize;");
        });
        this.log.debug("Db.constructor");
    }

    _createClass(Db, [{
        key: 'getDatabase',
        value: function getDatabase() {
            return this.db;
        }
    }, {
        key: 'doUpgrade',
        value: function doUpgrade(databaseCodeVersion) {
            var _this2 = this;

            this.log.debug("Db.doUpgrade");
            var db = this.db;
            switch (databaseCodeVersion) {
                case 0:
                    db.serialize(function () {
                        Db.migration1.forEach(function (mig) {
                            db.run(mig);
                        });
                        _this2.createTables();
                    });
                    break;

                case 1:
                    db.serialize(function () {
                        Db.migration2.forEach(function (mig) {
                            db.run(mig);
                        });
                        _this2.createTables();
                    });
                    break;

                case 2:
                    db.serialize(function () {
                        Db.migration3.forEach(function (mig) {
                            db.run(mig);
                        });
                        _this2.createTables();
                    });
                    break;

                case 3:
                    db.serialize(function () {
                        Db.migration4.forEach(function (mig) {
                            db.run(mig);
                        });
                        _this2.createTables();
                    });
                    break;
            }
        }

        /**
         * Creates the sqlite tables
         */

    }, {
        key: 'createTables',
        value: function createTables() {
            var _this3 = this;

            this.log.debug("Db.createTables");
            var creates = Db.creates;
            var db = this.db;

            db.serialize(function () {
                creates.forEach(function (create) {
                    db.run(create);
                });

                var databaseCodeVersion = 0;

                db.all("select * from settings", function (err, rows) {
                    rows.forEach(function (row) {
                        switch (row.key) {
                            case "database_code_version":
                                databaseCodeVersion = Number(row.value);
                                break;
                        }
                    });
                    if (databaseCodeVersion < Db.database_code_version) {
                        _this3.doUpgrade(databaseCodeVersion);
                    }
                });
            });
        }
    }, {
        key: 'getScannedCoords',
        value: function getScannedCoords(fp_id, cb) {
            this.log.debug("Db.getScannedCoords");
            var db = this.db;
            db.all(Db.query_get_scanned_coords, fp_id, cb);
        }
    }, {
        key: 'getFloorPlans',
        value: function getFloorPlans(cb) {
            this.log.debug("Db.getFloorPlans");
            var db = this.db;
            db.all(Db.query_get_all_floorplans, cb);
        }
    }, {
        key: 'getDatabaseVersion',
        value: function getDatabaseVersion(cb) {
            this.log.debug("Db.getDatabaseVersion");
            var db = this.db;
            db.all(Db.query_get_database_version, cb);
        }
    }, {
        key: 'updateDatabase',
        value: function updateDatabase(data, cb) {
            this.log.debug("Db.updateDatabase");
            var db = this.db;
            var stmt = db.prepare(Db.query_insert_version);
            stmt.run(data.databaseVersion);
            stmt.finalize();

            stmt = db.prepare(Db.query_update_version);
            stmt.run(data.databaseVersion);
            stmt.finalize();

            if (typeof data.layout_images != "undefined" && data.layout_images.length > 0) {
                stmt = db.prepare(Db.query_insert_layout);
                var upstmt = db.prepare(Db.query_update_layout);

                data.layout_images.forEach(function (el) {
                    var id = el.id;
                    var floor_plan_name = el.floorplanname;
                    var stringdata = JSON.stringify(el);
                    stmt.run(id, stringdata, floor_plan_name);
                    upstmt.run(stringdata, floor_plan_name, id);
                });
                stmt.finalize();
                upstmt.finalize();
            }

            cb();
        }
    }, {
        key: 'saveReadings',
        value: function saveReadings(payload, cb) {
            var _this4 = this;

            var log = this.log;
            var db = this.db;
            log.debug("Db.saveReadings");

            var stmt = db.prepare(Db.query_insert_scan_results);
            var finished = 0;
            db.get(Db.query_get_scan_id, function (err, row) {
                db.run(Db.query_update_scan_id);
                payload.forEach(function (el) {
                    var s_id = Number(row.value);
                    var fp_id = el.fp_id;
                    var ap_id = el.ap_id;
                    var x = Number(el.x);
                    var y = Number(el.y);
                    var value = Number(el.value);
                    var orig_values = el.orig_values;
                    var created = el.created;
                    stmt.run(s_id, fp_id, ap_id, x, y, value, orig_values, created, function (err) {
                        finished++;
                        if (finished >= payload.length) {
                            stmt.finalize();
                            _this4.updateKalman(fp_id, cb);
                        }
                    });
                });
            });
        }
    }, {
        key: 'updateKalman',
        value: function updateKalman(fp_id, cb) {
            var log = this.log;
            var db = this.db;
            var kalman = {};

            db.all(Db.query_get_for_kalman, fp_id, function (err, rows) {
                var insert = db.prepare(Db.query_insert_kalman_estimates);
                var update = db.prepare(Db.query_update_kalman_estimates);

                if (err) {
                    log.error(err);
                    return;
                }

                var done = 0;
                rows.forEach(function (row) {
                    var k = false;
                    if (typeof kalman[row.fp_id + row.ap_id + row.x + row.y] == "undefined") {
                        kalman[row.fp_id + row.ap_id + row.x + row.y] = new _KalmanFilter2.default(row.cest);
                    }
                    k = kalman[row.fp_id + row.ap_id + row.x + row.y];

                    var values = row.values.split(",").map(function (el) {
                        return Number(el);
                    });

                    for (var i = 0; i < values.length; i++) {
                        k.addSample(values[i]);
                    }
                    insert.run(row.fp_id, row.ap_id, row.x, row.y, k.getEstimate(), function () {
                        update.run(k.getEstimate(), row.fp_id, row.ap_id, row.x, row.y, function () {
                            done++;
                            if (done >= rows.length) {
                                insert.finalize();
                                update.finalize();
                                db.serialize(function () {
                                    db.run("delete from features where fp_id = ?", fp_id);
                                    db.run(Db.query_update_features, fp_id, fp_id, function () {
                                        cb();
                                    });
                                });
                            }
                        });
                    });
                });
            });
        }
    }]);

    return Db;
}();

Db.database_code_version = 4;
Db.query_get_all_floorplans = "select * from layout_images";
Db.query_get_database_version = "select value from settings where key = 'database_version';";
Db.query_insert_version = "insert or ignore into settings values ('database_version', ?);";
Db.query_update_version = "update settings set value = ? where key = 'database_version';";
Db.query_insert_layout = "insert or ignore into layout_images values (?, ?, ?);";
Db.query_update_layout = "update layout_images set layout_image = ?, floor_plan_name = ? where id = ?;";
Db.query_insert_scan_results = "insert into scan_results values (?, ?, ?, ?, ?, ?, ?, ?);";
Db.query_get_scan_results = "select * from scan_results;";
Db.query_get_for_kalman = "SELECT s.fp_id, s.ap_id, s.x, s.y, " + "group_concat(s.value) `values`, " + "case when k.kalman is null then avg(s.value) else k.kalman end `cest`, " + "k.kalman FROM scan_results s left join " + "kalman_estimates k on s.fp_id = k.fp_id and s.ap_id = k.ap_id and s.x = k.x and s.y = k.y " + " where s.fp_id = ? GROUP BY s.fp_id, s.ap_id, s.x, s.y;";
Db.query_insert_kalman_estimates = "insert or ignore into kalman_estimates values (?, ?, ?, ?, ?);";
Db.query_update_kalman_estimates = "update kalman_estimates set kalman = ? where fp_id = ? and ap_id = ? and " + " x = ? and y = ?;";
Db.query_update_features = "insert into features " + " select k.fp_id, k.x, k.y, k.ap_id || k1.ap_id as feature, abs(k.kalman - k1.kalman) as value " + " from kalman_estimates k join kalman_estimates k1 on k.fp_id = k1.fp_id and k.x = k1.x and k.y = k1.y" + " where value != 0 and k.fp_id = ? and k1.fp_id = ?";
Db.query_update_oldest_features = "select k.fp_id, k.x, k.y, k.ap_id || k1.ap_id as feature, " + " abs(k.kalman - k1.kalman) as value, :scan_id: s_id from kalman_estimates k join " + " kalman_estimates k1 on k.fp_id = k1.fp_id and k.x = k1.x and k.y = k1.y and k.ap_id < k1.ap_id where" + " k.kalman != 0 and k1.kalman != 0 and k.fp_id = ? and k1.fp_id = ?;";
Db.query_get_features = "select f.*, abs(value - :feature_value:) diff from features f " + " where f.feature = ? and f.fp_id = ? order by diff asc;";
Db.query_get_scanned_coords = "select count(*) as num_features, x, y from features where fp_id = ? " + " group by x, y;";
Db.query_get_min_sid = "select min(s_id) from features where fp_id = ?";
Db.query_get_scan_id = "select value + 1 as value from settings where key = 'scan_id';";
Db.query_update_scan_id = "update settings set value = value + 1 where key = 'scan_id';";
Db.creates = ["CREATE TABLE if not exists layout_images (id TEXT PRIMARY KEY, layout_image TEXT);", "CREATE UNIQUE INDEX if not exists layout_images_id_uindex ON layout_images (id);",

/**
 * Create the settings table with default settings
 */
"create table if not exists settings (key TEXT PRIMARY KEY, value TEXT);", "create unique index if not exists settings_key on settings (key);", "insert or ignore into settings (key, value) values ('database_version', 0);", "insert or ignore into settings (key, value) values ('database_code_version', 0);",

/**
 * ap_id = access point id
 * fp_id = floorplan id
 */
"CREATE TABLE if not exists scan_results " + "(s_id INTEGER, fp_id TEXT, ap_id TEXT, x INTEGER, " + "y INTEGER, value REAL, orig_values TEXT, created TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL, " + "PRIMARY KEY (s_id, fp_id, ap_id), " + "CONSTRAINT scan_results_layout_images_id_fk FOREIGN KEY (fp_id) REFERENCES layout_images (id));", "create index if not exists x_and_y on scan_results (x, y);", "CREATE TABLE if not exists kalman_estimates (fp_id TEXT, ap_id TEXT, x INTEGER, " + "y INTEGER, kalman REAL, " + "CONSTRAINT kalman_estimates_fp_id_ap_id_x_y_pk PRIMARY KEY (fp_id, ap_id, x, y)," + "FOREIGN KEY (ap_id, fp_id, x, y) REFERENCES scan_results (ap_id, fp_id, x, y) ON DELETE CASCADE)", "CREATE TABLE if not exists features (fp_id TEXT, x INTEGER, y INTEGER, feature TEXT, value REAL, " + " CONSTRAINT features_fp_id_x_y_feature_pk PRIMARY KEY (fp_id, x, y, feature));", "CREATE UNIQUE INDEX if not exists features_feature_index1 ON features(fp_id,feature,x,y);", "CREATE INDEX if not exists features_feature_index2 ON features(feature);"];
Db.drops = ["drop table if exists layout_images;", "drop table if exists settings;", "drop table if exists scan_results;", "drop table if exists kalman_estimates;"];
Db.migration1 = ["ALTER TABLE layout_images ADD floor_plan_name TEXT NULL;", "update settings set value = '" + Db.database_code_version + "' where key = 'database_code_version';"];
Db.migration2 = ["ALTER TABLE features ADD s_id INT NULL;", "DROP INDEX features_feature_index1;", "DROP INDEX features_feature_index2;", "CREATE TABLE featuresa8d1 (fp_id TEXT, x INTEGER, y INTEGER, feature TEXT, value REAL, s_id INTEGER," + " CONSTRAINT features_fp_id_x_y_feature_s_id_pk PRIMARY KEY (fp_id, x, y, feature, s_id));", "CREATE UNIQUE INDEX features_feature_index1 ON featuresa8d1 (fp_id, feature, x, y, s_id);", "INSERT INTO featuresa8d1(fp_id, x, y, feature, value, s_id) SELECT fp_id, x, y, feature, value, s_id FROM features;", "DROP TABLE features;", "ALTER TABLE featuresa8d1 RENAME TO features;", "CREATE INDEX features_feature_index2 ON features(feature);", "update settings set value = '" + Db.database_code_version + "' where key = 'database_code_version';"];
Db.migration3 = ["insert or ignore into settings values ('scan_id', 64);", "update settings set value = '" + Db.database_code_version + "' where key = 'database_code_version';"];
Db.migration4 = ["drop table features;", "CREATE TABLE features (fp_id TEXT, x INTEGER, y INTEGER, feature TEXT, value REAL, " + " CONSTRAINT features_fp_id_x_y_feature_pk PRIMARY KEY (fp_id, x, y, feature));", "update settings set value = '" + Db.database_code_version + "' where key = 'database_code_version';"];


module.exports = Db;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvRGIuZXM2Il0sIm5hbWVzIjpbInNxbGl0ZTMiLCJyZXF1aXJlIiwidmVyYm9zZSIsIkRiIiwibG9nIiwiZGIiLCJEYXRhYmFzZSIsImNvbmZpZ3VyZSIsInNlcmlhbGl6ZSIsImV4ZWMiLCJkZWJ1ZyIsImRhdGFiYXNlQ29kZVZlcnNpb24iLCJtaWdyYXRpb24xIiwiZm9yRWFjaCIsIm1pZyIsInJ1biIsImNyZWF0ZVRhYmxlcyIsIm1pZ3JhdGlvbjIiLCJtaWdyYXRpb24zIiwibWlncmF0aW9uNCIsImNyZWF0ZXMiLCJjcmVhdGUiLCJhbGwiLCJlcnIiLCJyb3dzIiwicm93Iiwia2V5IiwiTnVtYmVyIiwidmFsdWUiLCJkYXRhYmFzZV9jb2RlX3ZlcnNpb24iLCJkb1VwZ3JhZGUiLCJmcF9pZCIsImNiIiwicXVlcnlfZ2V0X3NjYW5uZWRfY29vcmRzIiwicXVlcnlfZ2V0X2FsbF9mbG9vcnBsYW5zIiwicXVlcnlfZ2V0X2RhdGFiYXNlX3ZlcnNpb24iLCJkYXRhIiwic3RtdCIsInByZXBhcmUiLCJxdWVyeV9pbnNlcnRfdmVyc2lvbiIsImRhdGFiYXNlVmVyc2lvbiIsImZpbmFsaXplIiwicXVlcnlfdXBkYXRlX3ZlcnNpb24iLCJsYXlvdXRfaW1hZ2VzIiwibGVuZ3RoIiwicXVlcnlfaW5zZXJ0X2xheW91dCIsInVwc3RtdCIsInF1ZXJ5X3VwZGF0ZV9sYXlvdXQiLCJlbCIsImlkIiwiZmxvb3JfcGxhbl9uYW1lIiwiZmxvb3JwbGFubmFtZSIsInN0cmluZ2RhdGEiLCJKU09OIiwic3RyaW5naWZ5IiwicGF5bG9hZCIsInF1ZXJ5X2luc2VydF9zY2FuX3Jlc3VsdHMiLCJmaW5pc2hlZCIsImdldCIsInF1ZXJ5X2dldF9zY2FuX2lkIiwicXVlcnlfdXBkYXRlX3NjYW5faWQiLCJzX2lkIiwiYXBfaWQiLCJ4IiwieSIsIm9yaWdfdmFsdWVzIiwiY3JlYXRlZCIsInVwZGF0ZUthbG1hbiIsImthbG1hbiIsInF1ZXJ5X2dldF9mb3Jfa2FsbWFuIiwiaW5zZXJ0IiwicXVlcnlfaW5zZXJ0X2thbG1hbl9lc3RpbWF0ZXMiLCJ1cGRhdGUiLCJxdWVyeV91cGRhdGVfa2FsbWFuX2VzdGltYXRlcyIsImVycm9yIiwiZG9uZSIsImsiLCJjZXN0IiwidmFsdWVzIiwic3BsaXQiLCJtYXAiLCJpIiwiYWRkU2FtcGxlIiwiZ2V0RXN0aW1hdGUiLCJxdWVyeV91cGRhdGVfZmVhdHVyZXMiLCJxdWVyeV9nZXRfc2Nhbl9yZXN1bHRzIiwicXVlcnlfdXBkYXRlX29sZGVzdF9mZWF0dXJlcyIsInF1ZXJ5X2dldF9mZWF0dXJlcyIsInF1ZXJ5X2dldF9taW5fc2lkIiwiZHJvcHMiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7Ozs7Ozs7O0FBRUEsSUFBSUEsVUFBVUMsUUFBUSxTQUFSLEVBQW1CQyxPQUFuQixFQUFkOztJQUVNQyxFO0FBNEdGLGdCQUFZQyxHQUFaLEVBQWdCO0FBQUE7O0FBQUE7O0FBQ1osYUFBS0EsR0FBTCxHQUFXQSxHQUFYO0FBQ0EsYUFBS0MsRUFBTCxHQUFVLElBQUlMLFFBQVFNLFFBQVosQ0FBcUIsZUFBckIsQ0FBVjtBQUNBLGFBQUtELEVBQUwsQ0FBUUUsU0FBUixDQUFrQixhQUFsQixFQUFpQyxLQUFqQztBQUNBLGFBQUtGLEVBQUwsQ0FBUUcsU0FBUixDQUFrQixZQUFNO0FBQ3BCLGtCQUFLSCxFQUFMLENBQVFJLElBQVIsQ0FBYSw0QkFBYjtBQUNBLGtCQUFLSixFQUFMLENBQVFJLElBQVIsQ0FBYSw4QkFBYjtBQUNBLGtCQUFLSixFQUFMLENBQVFJLElBQVIsQ0FBYSxrQkFBYjtBQUNILFNBSkQ7QUFLQSxhQUFLTCxHQUFMLENBQVNNLEtBQVQsQ0FBZSxnQkFBZjtBQUNIOzs7O3NDQUVZO0FBQ1QsbUJBQU8sS0FBS0wsRUFBWjtBQUNIOzs7a0NBRVNNLG1CLEVBQXFCO0FBQUE7O0FBQzNCLGlCQUFLUCxHQUFMLENBQVNNLEtBQVQsQ0FBZSxjQUFmO0FBQ0EsZ0JBQUlMLEtBQUssS0FB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LEM7QUE3RWxCMUIsRSxDQWtGS2MsVSxHQUFhLENBQ2hCLHlDQURnQixFQUVoQixxQ0FGZ0IsRUFHaEIscUNBSGdCLEVBSWhCLHlHQUNFLDJGQUxjLEVBTWhCLDJGQU5nQixFQU9oQixxSEFQZ0IsRUFRaEIsc0JBUmdCLEVBU2hCLDhDQVRnQixFQVVoQiw0REFWZ0IsRUFXaEIsa0NBQWtDZCxHQUFHMEIscUJBQXJDLEdBQTZELHdDQVg3QyxDO0FBbEZsQjFCLEUsQ0FnR0tlLFUsR0FBYSxDQUNoQix3REFEZ0IsRUFFaEIsa0NBQWtDZixHQUFHMEIscUJBQXJDLEdBQTZELHdDQUY3QyxDO0FBaEdsQjFCLEUsQ0FxR0tnQixVLEdBQWEsQ0FDaEIsc0JBRGdCLEVBRWhCLHdGQUNFLGdGQUhjLEVBSWhCLGtDQUFrQ2hCLEdBQUcwQixxQkFBckMsR0FBNkQsd0NBSjdDLEM7OztBQTZOeEI2RCxPQUFPQyxPQUFQLEdBQWlCeEYsRUFBakIiLCJmaWxlIjoiRGIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgS2FsbWFuRmlsdGVyIGZyb20gJy4vS2FsbWFuRmlsdGVyJztcblxubGV0IHNxbGl0ZTMgPSByZXF1aXJlKCdzcWxpdGUzJykudmVyYm9zZSgpO1xuXG5jbGFzcyBEYiB7XG5cbiAgICBzdGF0aWMgZGF0YWJhc2VfY29kZV92ZXJzaW9uID0gNDtcbiAgICBzdGF0aWMgcXVlcnlfZ2V0X2FsbF9mbG9vcnBsYW5zID0gXCJzZWxlY3QgKiBmcm9tIGxheW91dF9pbWFnZXNcIjtcbiAgICBzdGF0aWMgcXVlcnlfZ2V0X2RhdGFiYXNlX3ZlcnNpb24gPSBcInNlbGVjdCB2YWx1ZSBmcm9tIHNldHRpbmdzIHdoZXJlIGtleSA9ICdkYXRhYmFzZV92ZXJzaW9uJztcIjtcbiAgICBzdGF0aWMgcXVlcnlfaW5zZXJ0X3ZlcnNpb24gPSBcImluc2VydCBvciBpZ25vcmUgaW50byBzZXR0aW5ncyB2YWx1ZXMgKCdkYXRhYmFzZV92ZXJzaW9uJywgPyk7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X3VwZGF0ZV92ZXJzaW9uID0gXCJ1cGRhdGUgc2V0dGluZ3Mgc2V0IHZhbHVlID0gPyB3aGVyZSBrZXkgPSAnZGF0YWJhc2VfdmVyc2lvbic7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X2luc2VydF9sYXlvdXQgPSBcImluc2VydCBvciBpZ25vcmUgaW50byBsYXlvdXRfaW1hZ2VzIHZhbHVlcyAoPywgPywgPyk7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X3VwZGF0ZV9sYXlvdXQgPSBcInVwZGF0ZSBsYXlvdXRfaW1hZ2VzIHNldCBsYXlvdXRfaW1hZ2UgPSA/LCBmbG9vcl9wbGFuX25hbWUgPSA/IHdoZXJlIGlkID0gPztcIjtcbiAgICBzdGF0aWMgcXVlcnlfaW5zZXJ0X3NjYW5fcmVzdWx0cyA9IFwiaW5zZXJ0IGludG8gc2Nhbl9yZXN1bHRzIHZhbHVlcyAoPywgPywgPywgPywgPywgPywgPywgPyk7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X2dldF9zY2FuX3Jlc3VsdHMgPSBcInNlbGVjdCAqIGZyb20gc2Nhbl9yZXN1bHRzO1wiO1xuICAgIHN0YXRpYyBxdWVyeV9nZXRfZm9yX2thbG1hbiA9IFwiU0VMRUNUIHMuZnBfaWQsIHMuYXBfaWQsIHMueCwgcy55LCBcIlxuICAgICsgXCJncm91cF9jb25jYXQocy52YWx1ZSkgYHZhbHVlc2AsIFwiXG4gICAgKyBcImNhc2Ugd2hlbiBrLmthbG1hbiBpcyBudWxsIHRoZW4gYXZnKHMudmFsdWUpIGVsc2Ugay5rYWxtYW4gZW5kIGBjZXN0YCwgXCJcbiAgICArIFwiay5rYWxtYW4gRlJPTSBzY2FuX3Jlc3VsdHMgcyBsZWZ0IGpvaW4gXCJcbiAgICArIFwia2FsbWFuX2VzdGltYXRlcyBrIG9uIHMuZnBfaWQgPSBrLmZwX2lkIGFuZCBzLmFwX2lkID0gay5hcF9pZCBhbmQgcy54ID0gay54IGFuZCBzLnkgPSBrLnkgXCJcbiAgICArIFwiIHdoZXJlIHMuZnBfaWQgPSA/IEdST1VQIEJZIHMuZnBfaWQsIHMuYXBfaWQsIHMueCwgcy55O1wiO1xuICAgIHN0YXRpYyBxdWVyeV9pbnNlcnRfa2FsbWFuX2VzdGltYXRlcyA9IFwiaW5zZXJ0IG9yIGlnbm9yZSBpbnRvIGthbG1hbl9lc3RpbWF0ZXMgdmFsdWVzICg/LCA/LCA/LCA/LCA/KTtcIjtcbiAgICBzdGF0aWMgcXVlcnlfdXBkYXRlX2thbG1hbl9lc3RpbWF0ZXMgPSBcInVwZGF0ZSBrYWxtYW5fZXN0aW1hdGVzIHNldCBrYWxtYW4gPSA/IHdoZXJlIGZwX2lkID0gPyBhbmQgYXBfaWQgPSA/IGFuZCBcIlxuICAgICsgXCIgeCA9ID8gYW5kIHkgPSA/O1wiO1xuICAgIHN0YXRpYyBxdWVyeV91cGRhdGVfZmVhdHVyZXMgPSBcImluc2VydCBpbnRvIGZlYXR1cmVzIFwiXG4gICAgKyBcIiBzZWxlY3Qgay5mcF9pZCwgay54LCBrLnksIGsuYXBfaWQgfHwgazEuYXBfaWQgYXMgZmVhdHVyZSwgYWJzKGsua2FsbWFuIC0gazEua2FsbWFuKSBhcyB2YWx1ZSBcIlxuICAgICsgXCIgZnJvbSBrYWxtYW5fZXN0aW1hdGVzIGsgam9pbiBrYWxtYW5fZXN0aW1hdGVzIGsxIG9uIGsuZnBfaWQgPSBrMS5mcF9pZCBhbmQgay54ID0gazEueCBhbmQgay55ID0gazEueVwiXG4gICAgKyBcIiB3aGVyZSB2YWx1ZSAhPSAwIGFuZCBrLmZwX2lkID0gPyBhbmQgazEuZnBfaWQgPSA/XCI7XG4gICAgc3RhdGljIHF1ZXJ5X3VwZGF0ZV9vbGRlc3RfZmVhdHVyZXMgPSBcInNlbGVjdCBrLmZwX2lkLCBrLngsIGsueSwgay5hcF9pZCB8fCBrMS5hcF9pZCBhcyBmZWF0dXJlLCBcIlxuICAgICsgXCIgYWJzKGsua2FsbWFuIC0gazEua2FsbWFuKSBhcyB2YWx1ZSwgOnNjYW5faWQ6IHNfaWQgZnJvbSBrYWxtYW5fZXN0aW1hdGVzIGsgam9pbiBcIlxuICAgICsgXCIga2FsbWFuX2VzdGltYXRlcyBrMSBvbiBrLmZwX2lkID0gazEuZnBfaWQgYW5kIGsueCA9IGsxLnggYW5kIGsueSA9IGsxLnkgYW5kIGsuYXBfaWQgPCBrMS5hcF9pZCB3aGVyZVwiXG4gICAgKyBcIiBrLmthbG1hbiAhPSAwIGFuZCBrMS5rYWxtYW4gIT0gMCBhbmQgay5mcF9pZCA9ID8gYW5kIGsxLmZwX2lkID0gPztcIjtcbiAgICBzdGF0aWMgcXVlcnlfZ2V0X2ZlYXR1cmVzID0gXCJzZWxlY3QgZi4qLCBhYnModmFsdWUgLSA6ZmVhdHVyZV92YWx1ZTopIGRpZmYgZnJvbSBmZWF0dXJlcyBmIFwiXG4gICAgKyBcIiB3aGVyZSBmLmZlYXR1cmUgPSA/IGFuZCBmLmZwX2lkID0gPyBvcmRlciBieSBkaWZmIGFzYztcIjtcbiAgICBzdGF0aWMgcXVlcnlfZ2V0X3NjYW5uZWRfY29vcmRzID0gXCJzZWxlY3QgY291bnQoKikgYXMgbnVtX2ZlYXR1cmVzLCB4LCB5IGZyb20gZmVhdHVyZXMgd2hlcmUgZnBfaWQgPSA/IFwiXG4gICAgKyBcIiBncm91cCBieSB4LCB5O1wiO1xuICAgIHN0YXRpYyBxdWVyeV9nZXRfbWluX3NpZCA9IFwic2VsZWN0IG1pbihzX2lkKSBmcm9tIGZlYXR1cmVzIHdoZXJlIGZwX2lkID0gP1wiO1xuICAgIHN0YXRpYyBxdWVyeV9nZXRfc2Nhbl9pZCA9IFwic2VsZWN0IHZhbHVlICsgMSBhcyB2YWx1ZSBmcm9tIHNldHRpbmdzIHdoZXJlIGtleSA9ICdzY2FuX2lkJztcIjtcbiAgICBzdGF0aWMgcXVlcnlfdXBkYXRlX3NjYW5faWQgPSBcInVwZGF0ZSBzZXR0aW5ncyBzZXQgdmFsdWUgPSB2YWx1ZSArIDEgd2hlcmUga2V5ID0gJ3NjYW5faWQnO1wiO1xuXG4gICAgc3RhdGljIGNyZWF0ZXMgPSBbXG4gICAgICAgIFwiQ1JFQVRFIFRBQkxFIGlmIG5vdCBleGlzdHMgbGF5b3V0X2ltYWdlcyAoaWQgVEVYVCBQUklNQVJZIEtFWSwgbGF5b3V0X2ltYWdlIFRFWFQpO1wiLFxuICAgICAgICBcIkNSRUFURSBVTklRVUUgSU5ERVggaWYgbm90IGV4aXN0cyBsYXlvdXRfaW1hZ2VzX2lkX3VpbmRleCBPTiBsYXlvdXRfaW1hZ2VzIChpZCk7XCIsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENyZWF0ZSB0aGUgc2V0dGluZ3MgdGFibGUgd2l0aCBkZWZhdWx0IHNldHRpbmdzXG4gICAgICAgICAqL1xuICAgICAgICBcImNyZWF0ZSB0YWJsZSBpZiBub3QgZXhpc3RzIHNldHRpbmdzIChrZXkgVEVYVCBQUklNQVJZIEtFWSwgdmFsdWUgVEVYVCk7XCIsXG4gICAgICAgIFwiY3JlYXRlIHVuaXF1ZSBpbmRleCBpZiBub3QgZXhpc3RzIHNldHRpbmdzX2tleSBvbiBzZXR0aW5ncyAoa2V5KTtcIixcbiAgICAgICAgXCJpbnNlcnQgb3IgaWdub3JlIGludG8gc2V0dGluZ3MgKGtleSwgdmFsdWUpIHZhbHVlcyAoJ2RhdGFiYXNlX3ZlcnNpb24nLCAwKTtcIixcbiAgICAgICAgXCJpbnNlcnQgb3IgaWdub3JlIGludG8gc2V0dGluZ3MgKGtleSwgdmFsdWUpIHZhbHVlcyAoJ2RhdGFiYXNlX2NvZGVfdmVyc2lvbicsIDApO1wiLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBhcF9pZCA9IGFjY2VzcyBwb2ludCBpZFxuICAgICAgICAgKiBmcF9pZCA9IGZsb29ycGxhbiBpZFxuICAgICAgICAgKi9cbiAgICAgICAgXCJDUkVBVEUgVEFCTEUgaWYgbm90IGV4aXN0cyBzY2FuX3Jlc3VsdHMgXCIgK1xuICAgICAgICBcIihzX2lkIElOVEVHRVIsIGZwX2lkIFRFWFQsIGFwX2lkIFRFWFQsIHggSU5URUdFUiwgXCIgK1xuICAgICAgICBcInkgSU5URUdFUiwgdmFsdWUgUkVBTCwgb3JpZ192YWx1ZXMgVEVYVCwgY3JlYXRlZCBUSU1FU1RBTVAgREVGQVVMVCBDVVJSRU5UX1RJTUVTVEFNUCBOT1QgTlVMTCwgXCIgK1xuICAgICAgICBcIlBSSU1BUlkgS0VZIChzX2lkLCBmcF9pZCwgYXBfaWQpLCBcIiArXG4gICAgICAgIFwiQ09OU1RSQUlOVCBzY2FuX3Jlc3VsdHNfbGF5b3V0X2ltYWdlc19pZF9mayBGT1JFSUdOIEtFWSAoZnBfaWQpIFJFRkVSRU5DRVMgbGF5b3V0X2ltYWdlcyAoaWQpKTtcIixcbiAgICAgICAgXCJjcmVhdGUgaW5kZXggaWYgbm90IGV4aXN0cyB4X2FuZF95IG9uIHNjYW5fcmVzdWx0cyAoeCwgeSk7XCIsXG5cbiAgICAgICAgXCJDUkVBVEUgVEFCTEUgaWYgbm90IGV4aXN0cyBrYWxtYW5fZXN0aW1hdGVzIChmcF9pZCBURVhULCBhcF9pZCBURVhULCB4IElOVEVHRVIsIFwiXG4gICAgICAgICsgXCJ5IElOVEVHRVIsIGthbG1hbiBSRUFMLCBcIlxuICAgICAgICArIFwiQ09OU1RSQUlOVCBrYWxtYW5fZXN0aW1hdGVzX2ZwX2lkX2FwX2lkX3hfeV9wayBQUklNQVJZIEtFWSAoZnBfaWQsIGFwX2lkLCB4LCB5KSxcIlxuICAgICAgICArIFwiRk9SRUlHTiBLRVkgKGFwX2lkLCBmcF9pZCwgeCwgeSkgUkVGRVJFTkNFUyBzY2FuX3Jlc3VsdHMgKGFwX2lkLCBmcF9pZCwgeCwgeSkgT04gREVMRVRFIENBU0NBREUpXCIsXG5cbiAgICAgICAgXCJDUkVBVEUgVEFCTEUgaWYgbm90IGV4aXN0cyBmZWF0dXJlcyAoZnBfaWQgVEVYVCwgeCBJTlRFR0VSLCB5IElOVEVHRVIsIGZlYXR1cmUgVEVYVCwgdmFsdWUgUkVBTCwgXCJcbiAgICAgICAgKyBcIiBDT05TVFJBSU5UIGZlYXR1cmVzX2ZwX2lkX3hfeV9mZWF0dXJlX3BrIFBSSU1BUlkgS0VZIChmcF9pZCwgeCwgeSwgZmVhdHVyZSkpO1wiLFxuICAgICAgICBcIkNSRUFURSBVTklRVUUgSU5ERVggaWYgbm90IGV4aXN0cyBmZWF0dXJlc19mZWF0dXJlX2luZGV4MSBPTiBmZWF0dXJlcyhmcF9pZCxmZWF0dXJlLHgseSk7XCIsXG4gICAgICAgIFwiQ1JFQVRFIElOREVYIGlmIG5vdCBleGlzdHMgZmVhdHVyZXNfZmVhdHVyZV9pbmRleDIgT04gZmVhdHVyZXMoZmVhdHVyZSk7XCJcbiAgICBdO1xuXG4gICAgc3RhdGljIGRyb3BzID0gW1xuICAgICAgICBcImRyb3AgdGFibGUgaWYgZXhpc3RzIGxheW91dF9pbWFnZXM7XCIsXG4gICAgICAgIFwiZHJvcCB0YWJsZSBpZiBleGlzdHMgc2V0dGluZ3M7XCIsXG4gICAgICAgIFwiZHJvcCB0YWJsZSBpZiBleGlzdHMgc2Nhbl9yZXN1bHRzO1wiLFxuICAgICAgICBcImRyb3AgdGFibGUgaWYgZXhpc3RzIGthbG1hbl9lc3RpbWF0ZXM7XCJcbiAgICBdO1xuXG4gICAgc3RhdGljIG1pZ3JhdGlvbjEgPSBbXG4gICAgICAgIFwiQUxURVIgVEFCTEUgbGF5b3V0X2ltYWdlcyBBREQgZmxvb3JfcGxhbl9uYW1lIFRFWFQgTlVMTDtcIixcbiAgICAgICAgXCJ1cGRhdGUgc2V0dGluZ3Mgc2V0IHZhbHVlID0gJ1wiICsgRGIuZGF0YWJhc2VfY29kZV92ZXJzaW9uICsgXCInIHdoZXJlIGtleSA9ICdkYXRhYmFzZV9jb2RlX3ZlcnNpb24nO1wiXG4gICAgXTtcblxuICAgIHN0YXRpYyBtaWdyYXRpb24yID0gW1xuICAgICAgICBcIkFMVEVSIFRBQkxFIGZlYXR1cmVzIEFERCBzX2lkIElOVCBOVUxMO1wiLFxuICAgICAgICBcIkRST1AgSU5ERVggZmVhdHVyZXNfZmVhdHVyZV9pbmRleDE7XCIsXG4gICAgICAgIFwiRFJPUCBJTkRFWCBmZWF0dXJlc19mZWF0dXJlX2luZGV4MjtcIixcbiAgICAgICAgXCJDUkVBVEUgVEFCTEUgZmVhdHVyZXNhOGQxIChmcF9pZCBURVhULCB4IElOVEVHRVIsIHkgSU5URUdFUiwgZmVhdHVyZSBURVhULCB2YWx1ZSBSRUFMLCBzX2lkIElOVEVHRVIsXCJcbiAgICAgICAgKyBcIiBDT05TVFJBSU5UIGZlYXR1cmVzX2ZwX2lkX3hfeV9mZWF0dXJlX3NfaWRfcGsgUFJJTUFSWSBLRVkgKGZwX2lkLCB4LCB5LCBmZWF0dXJlLCBzX2lkKSk7XCIsXG4gICAgICAgIFwiQ1JFQVRFIFVOSVFVRSBJTkRFWCBmZWF0dXJlc19mZWF0dXJlX2luZGV4MSBPTiBmZWF0dXJlc2E4ZDEgKGZwX2lkLCBmZWF0dXJlLCB4LCB5LCBzX2lkKTtcIixcbiAgICAgICAgXCJJTlNFUlQgSU5UTyBmZWF0dXJlc2E4ZDEoZnBfaWQsIHgsIHksIGZlYXR1cmUsIHZhbHVlLCBzX2lkKSBTRUxFQ1QgZnBfaWQsIHgsIHksIGZlYXR1cmUsIHZhbHVlLCBzX2lkIEZST00gZmVhdHVyZXM7XCIsXG4gICAgICAgIFwiRFJPUCBUQUJMRSBmZWF0dXJlcztcIixcbiAgICAgICAgXCJBTFRFUiBUQUJMRSBmZWF0dXJlc2E4ZDEgUkVOQU1FIFRPIGZlYXR1cmVzO1wiLFxuICAgICAgICBcIkNSRUFURSBJTkRFWCBmZWF0dXJlc19mZWF0dXJlX2luZGV4MiBPTiBmZWF0dXJlcyhmZWF0dXJlKTtcIixcbiAgICAgICAgXCJ1cGRhdGUgc2V0dGluZ3Mgc2V0IHZhbHVlID0gJ1wiICsgRGIuZGF0YWJhc2VfY29kZV92ZXJzaW9uICsgXCInIHdoZXJlIGtleSA9ICdkYXRhYmFzZV9jb2RlX3ZlcnNpb24nO1wiXG4gICAgXTtcblxuICAgIHN0YXRpYyBtaWdyYXRpb24zID0gW1xuICAgICAgICBcImluc2VydCBvciBpZ25vcmUgaW50byBzZXR0aW5ncyB2YWx1ZXMgKCdzY2FuX2lkJywgNjQpO1wiLFxuICAgICAgICBcInVwZGF0ZSBzZXR0aW5ncyBzZXQgdmFsdWUgPSAnXCIgKyBEYi5kYXRhYmFzZV9jb2RlX3ZlcnNpb24gKyBcIicgd2hlcmUga2V5ID0gJ2RhdGFiYXNlX2NvZGVfdmVyc2lvbic7XCJcbiAgICBdO1xuXG4gICAgc3RhdGljIG1pZ3JhdGlvbjQgPSBbXG4gICAgICAgIFwiZHJvcCB0YWJsZSBmZWF0dXJlcztcIixcbiAgICAgICAgXCJDUkVBVEUgVEFCTEUgZmVhdHVyZXMgKGZwX2lkIFRFWFQsIHggSU5URUdFUiwgeSBJTlRFR0VSLCBmZWF0dXJlIFRFWFQsIHZhbHVlIFJFQUwsIFwiXG4gICAgICAgICsgXCIgQ09OU1RSQUlOVCBmZWF0dXJlc19mcF9pZF94X3lfZmVhdHVyZV9wayBQUklNQVJZIEtFWSAoZnBfaWQsIHgsIHksIGZlYXR1cmUpKTtcIixcbiAgICAgICAgXCJ1cGRhdGUgc2V0dGluZ3Mgc2V0IHZhbHVlID0gJ1wiICsgRGIuZGF0YWJhc2VfY29kZV92ZXJzaW9uICsgXCInIHdoZXJlIGtleSA9ICdkYXRhYmFzZV9jb2RlX3ZlcnNpb24nO1wiXG4gICAgXTtcblxuICAgIGNvbnN0cnVjdG9yKGxvZyl7XG4gICAgICAgIHRoaXMubG9nID0gbG9nO1xuICAgICAgICB0aGlzLmRiID0gbmV3IHNxbGl0ZTMuRGF0YWJhc2UoJ2RiL2RiLnNxbGl0ZTMnKTtcbiAgICAgICAgdGhpcy5kYi5jb25maWd1cmUoJ2J1c3lUaW1lb3V0JywgMTUwMDApO1xuICAgICAgICB0aGlzLmRiLnNlcmlhbGl6ZSgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmRiLmV4ZWMoXCJQUkFHTUEgam91cm5hbF9tb2RlID0gV0FMO1wiKTtcbiAgICAgICAgICAgIHRoaXMuZGIuZXhlYyhcIlBSQUdNQSBjYWNoZV9zaXplID0gNDA5NjAwMDtcIik7XG4gICAgICAgICAgICB0aGlzLmRiLmV4ZWMoXCJQUkFHTUEgb3B0aW1pemU7XCIpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoXCJEYi5jb25zdHJ1Y3RvclwiKTtcbiAgICB9XG5cbiAgICBnZXREYXRhYmFzZSgpe1xuICAgICAgICByZXR1cm4gdGhpcy5kYjtcbiAgICB9XG5cbiAgICBkb1VwZ3JhZGUoZGF0YWJhc2VDb2RlVmVyc2lvbikge1xuICAgICAgICB0aGlzLmxvZy5kZWJ1ZyhcIkRiLmRvVXBncmFkZVwiKTtcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgc3dpdGNoKGRhdGFiYXNlQ29kZVZlcnNpb24pe1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgIGRiLnNlcmlhbGl6ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIERiLm1pZ3JhdGlvbjEuZm9yRWFjaCgobWlnKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYi5ydW4obWlnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlVGFibGVzKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICBkYi5zZXJpYWxpemUoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBEYi5taWdyYXRpb24yLmZvckVhY2goKG1pZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGIucnVuKG1pZyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVRhYmxlcygpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgZGIuc2VyaWFsaXplKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgRGIubWlncmF0aW9uMy5mb3JFYWNoKChtaWcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRiLnJ1bihtaWcpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVUYWJsZXMoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgIGRiLnNlcmlhbGl6ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIERiLm1pZ3JhdGlvbjQuZm9yRWFjaCgobWlnKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYi5ydW4obWlnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlVGFibGVzKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIHRoZSBzcWxpdGUgdGFibGVzXG4gICAgICovXG4gICAgY3JlYXRlVGFibGVzKCkge1xuICAgICAgICB0aGlzLmxvZy5kZWJ1ZyhcIkRiLmNyZWF0ZVRhYmxlc1wiKTtcbiAgICAgICAgbGV0IGNyZWF0ZXMgPSBEYi5jcmVhdGVzO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuXG4gICAgICAgIGRiLnNlcmlhbGl6ZSgoKSA9PiB7XG4gICAgICAgICAgICBjcmVhdGVzLmZvckVhY2goZnVuY3Rpb24oY3JlYXRlKXtcbiAgICAgICAgICAgICAgICBkYi5ydW4oY3JlYXRlKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBsZXQgZGF0YWJhc2VDb2RlVmVyc2lvbiA9IDA7XG5cbiAgICAgICAgICAgIGRiLmFsbChcInNlbGVjdCAqIGZyb20gc2V0dGluZ3NcIiwgKGVyciwgcm93cykgPT4ge1xuICAgICAgICAgICAgICAgIHJvd3MuZm9yRWFjaChmdW5jdGlvbihyb3cpe1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2gocm93LmtleSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiZGF0YWJhc2VfY29kZV92ZXJzaW9uXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YWJhc2VDb2RlVmVyc2lvbiA9IE51bWJlcihyb3cudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYoZGF0YWJhc2VDb2RlVmVyc2lvbiA8IERiLmRhdGFiYXNlX2NvZGVfdmVyc2lvbil7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZG9VcGdyYWRlKGRhdGFiYXNlQ29kZVZlcnNpb24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXRTY2FubmVkQ29vcmRzKGZwX2lkLCBjYil7XG4gICAgICAgIHRoaXMubG9nLmRlYnVnKFwiRGIuZ2V0U2Nhbm5lZENvb3Jkc1wiKTtcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgZGIuYWxsKERiLnF1ZXJ5X2dldF9zY2FubmVkX2Nvb3JkcywgZnBfaWQsIGNiKTtcbiAgICB9XG5cbiAgICBnZXRGbG9vclBsYW5zKGNiKSB7XG4gICAgICAgIHRoaXMubG9nLmRlYnVnKFwiRGIuZ2V0Rmxvb3JQbGFuc1wiKTtcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgZGIuYWxsKERiLnF1ZXJ5X2dldF9hbGxfZmxvb3JwbGFucywgY2IpO1xuICAgIH1cblxuICAgIGdldERhdGFiYXNlVmVyc2lvbihjYikge1xuICAgICAgICB0aGlzLmxvZy5kZWJ1ZyhcIkRiLmdldERhdGFiYXNlVmVyc2lvblwiKTtcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgZGIuYWxsKERiLnF1ZXJ5X2dldF9kYXRhYmFzZV92ZXJzaW9uLCBjYik7XG4gICAgfVxuXG4gICAgdXBkYXRlRGF0YWJhc2UoZGF0YSwgY2IpIHtcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoXCJEYi51cGRhdGVEYXRhYmFzZVwiKTtcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgbGV0IHN0bXQgPSBkYi5wcmVwYXJlKERiLnF1ZXJ5X2luc2VydF92ZXJzaW9uKTtcbiAgICAgICAgc3RtdC5ydW4oZGF0YS5kYXRhYmFzZVZlcnNpb24pO1xuICAgICAgICBzdG10LmZpbmFsaXplKCk7XG5cbiAgICAgICAgc3RtdCA9IGRiLnByZXBhcmUoRGIucXVlcnlfdXBkYXRlX3ZlcnNpb24pO1xuICAgICAgICBzdG10LnJ1bihkYXRhLmRhdGFiYXNlVmVyc2lvbik7XG4gICAgICAgIHN0bXQuZmluYWxpemUoKTtcblxuICAgICAgICBpZih0eXBlb2YoZGF0YS5sYXlvdXRfaW1hZ2VzKSAhPSBcInVuZGVmaW5lZFwiICYmIGRhdGEubGF5b3V0X2ltYWdlcy5sZW5ndGggPiAwKXtcbiAgICAgICAgICAgIHN0bXQgPSBkYi5wcmVwYXJlKERiLnF1ZXJ5X2luc2VydF9sYXlvdXQpO1xuICAgICAgICAgICAgbGV0IHVwc3RtdCA9IGRiLnByZXBhcmUoRGIucXVlcnlfdXBkYXRlX2xheW91dCk7XG5cbiAgICAgICAgICAgIGRhdGEubGF5b3V0X2ltYWdlcy5mb3JFYWNoKGZ1bmN0aW9uKGVsKXtcbiAgICAgICAgICAgICAgICBsZXQgaWQgPSBlbC5pZDtcbiAgICAgICAgICAgICAgICBsZXQgZmxvb3JfcGxhbl9uYW1lID0gZWwuZmxvb3JwbGFubmFtZTtcbiAgICAgICAgICAgICAgICBsZXQgc3RyaW5nZGF0YSA9IEpTT04uc3RyaW5naWZ5KGVsKTtcbiAgICAgICAgICAgICAgICBzdG10LnJ1bihpZCwgc3RyaW5nZGF0YSwgZmxvb3JfcGxhbl9uYW1lKTtcbiAgICAgICAgICAgICAgICB1cHN0bXQucnVuKHN0cmluZ2RhdGEsIGZsb29yX3BsYW5fbmFtZSwgaWQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzdG10LmZpbmFsaXplKCk7XG4gICAgICAgICAgICB1cHN0bXQuZmluYWxpemUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNiKCk7XG4gICAgfVxuXG4gICAgc2F2ZVJlYWRpbmdzKHBheWxvYWQsIGNiKXtcbiAgICAgICAgbGV0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBsb2cuZGVidWcoXCJEYi5zYXZlUmVhZGluZ3NcIik7XG5cbiAgICAgICAgbGV0IHN0bXQgPSBkYi5wcmVwYXJlKERiLnF1ZXJ5X2luc2VydF9zY2FuX3Jlc3VsdHMpO1xuICAgICAgICBsZXQgZmluaXNoZWQgPSAwO1xuICAgICAgICBkYi5nZXQoRGIucXVlcnlfZ2V0X3NjYW5faWQsIChlcnIsIHJvdykgPT4ge1xuICAgICAgICAgICAgZGIucnVuKERiLnF1ZXJ5X3VwZGF0ZV9zY2FuX2lkKTtcbiAgICAgICAgICAgIHBheWxvYWQuZm9yRWFjaCgoZWwpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgc19pZCA9IE51bWJlcihyb3cudmFsdWUpO1xuICAgICAgICAgICAgICAgIGxldCBmcF9pZCA9IGVsLmZwX2lkO1xuICAgICAgICAgICAgICAgIGxldCBhcF9pZCA9IGVsLmFwX2lkO1xuICAgICAgICAgICAgICAgIGxldCB4ID0gTnVtYmVyKGVsLngpO1xuICAgICAgICAgICAgICAgIGxldCB5ID0gTnVtYmVyKGVsLnkpO1xuICAgICAgICAgICAgICAgIGxldCB2YWx1ZSA9IE51bWJlcihlbC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgbGV0IG9yaWdfdmFsdWVzID0gZWwub3JpZ192YWx1ZXM7XG4gICAgICAgICAgICAgICAgbGV0IGNyZWF0ZWQgPSBlbC5jcmVhdGVkO1xuICAgICAgICAgICAgICAgIHN0bXQucnVuKHNfaWQsIGZwX2lkLCBhcF9pZCwgeCwgeSwgdmFsdWUsIG9yaWdfdmFsdWVzLCBjcmVhdGVkLCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGZpbmlzaGVkKys7XG4gICAgICAgICAgICAgICAgICAgIGlmKGZpbmlzaGVkID49IHBheWxvYWQubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0bXQuZmluYWxpemUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlS2FsbWFuKGZwX2lkLCBjYik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB1cGRhdGVLYWxtYW4oZnBfaWQsIGNiKXtcbiAgICAgICAgbGV0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBsZXQga2FsbWFuID0ge307XG5cbiAgICAgICAgZGIuYWxsKERiLnF1ZXJ5X2dldF9mb3Jfa2FsbWFuLCBmcF9pZCwgKGVyciwgcm93cykgPT4ge1xuICAgICAgICAgICAgY29uc3QgaW5zZXJ0ID0gZGIucHJlcGFyZShEYi5xdWVyeV9pbnNlcnRfa2FsbWFuX2VzdGltYXRlcyk7XG4gICAgICAgICAgICBjb25zdCB1cGRhdGUgPSBkYi5wcmVwYXJlKERiLnF1ZXJ5X3VwZGF0ZV9rYWxtYW5fZXN0aW1hdGVzKTtcblxuICAgICAgICAgICAgaWYoZXJyKSB7XG4gICAgICAgICAgICAgICAgbG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgZG9uZSA9IDA7XG4gICAgICAgICAgICByb3dzLmZvckVhY2goKHJvdykgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBrID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZihrYWxtYW5bcm93LmZwX2lkICsgcm93LmFwX2lkICsgcm93LnggKyByb3cueV0pID09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAga2FsbWFuW3Jvdy5mcF9pZCArIHJvdy5hcF9pZCArIHJvdy54ICsgcm93LnldID0gbmV3IEthbG1hbkZpbHRlcihyb3cuY2VzdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGsgPSBrYWxtYW5bcm93LmZwX2lkICsgcm93LmFwX2lkICsgcm93LnggKyByb3cueV07XG5cbiAgICAgICAgICAgICAgICBsZXQgdmFsdWVzID0gcm93LnZhbHVlc1xuICAgICAgICAgICAgICAgICAgICAuc3BsaXQoXCIsXCIpXG4gICAgICAgICAgICAgICAgICAgIC5tYXAoKGVsKSA9PiB7IHJldHVybiBOdW1iZXIoZWwpOyB9KTtcblxuICAgICAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCB2YWx1ZXMubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgICAgICAgICBrLmFkZFNhbXBsZSh2YWx1ZXNbaV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpbnNlcnQucnVuKHJvdy5mcF9pZCwgcm93LmFwX2lkLCByb3cueCwgcm93LnksIGsuZ2V0RXN0aW1hdGUoKSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB1cGRhdGUucnVuKGsuZ2V0RXN0aW1hdGUoKSwgcm93LmZwX2lkLCByb3cuYXBfaWQsIHJvdy54LCByb3cueSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoZG9uZSA+PSByb3dzLmxlbmd0aCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zZXJ0LmZpbmFsaXplKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlLmZpbmFsaXplKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGIuc2VyaWFsaXplKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGIucnVuKFwiZGVsZXRlIGZyb20gZmVhdHVyZXMgd2hlcmUgZnBfaWQgPSA/XCIsIGZwX2lkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGIucnVuKERiLnF1ZXJ5X3VwZGF0ZV9mZWF0dXJlcywgZnBfaWQsIGZwX2lkLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5cbm1vZHVsZS5leHBvcnRzID0gRGI7Il19
//# sourceMappingURL=Db.js.map
