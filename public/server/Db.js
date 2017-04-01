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
                            _this4.updateKalman(fp_id);
                        }
                    });
                });
            });
        }
    }, {
        key: 'updateKalman',
        value: function updateKalman(fp_id) {
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
                                    db.run(Db.query_update_features, fp_id, fp_id);
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
Db.query_update_features = "insert into features " + " select k.fp_id, k.x, k.y, k.ap_id || k1.ap_id as feature, abs(k.kalman - k1.kalman) as value " + " from kalman_estimates k join kalman_estimates k1 on k.fp_id = k1.fp_id and k.x = k1.x and k.y = k1.y " + " where k.kalman != 0 and k1.kalman != 0;";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvRGIuZXM2Il0sIm5hbWVzIjpbInNxbGl0ZTMiLCJyZXF1aXJlIiwidmVyYm9zZSIsIkRiIiwibG9nIiwiZGIiLCJEYXRhYmFzZSIsImNvbmZpZ3VyZSIsInNlcmlhbGl6ZSIsImV4ZWMiLCJkZWJ1ZyIsImRhdGFiYXNlQ29kZVZlcnNpb24iLCJtaWdyYXRpb24xIiwiZm9yRWFjaCIsIm1pZyIsInJ1biIsImNyZWF0ZVRhYmxlcyIsIm1pZ3JhdGlvbjIiLCJtaWdyYXRpb24zIiwibWlncmF0aW9uNCIsImNyZWF0ZXMiLCJjcmVhdGUiLCJhbGwiLCJlcnIiLCJyb3dzIiwicm93Iiwia2V5IiwiTnVtYmVyIiwidmFsdWUiLCJkYXRhYmFzZV9jb2RlX3ZlcnNpb24iLCJkb1VwZ3JhZGUiLCJmcF9pZCIsImNiIiwicXVlcnlfZ2V0X3NjYW5uZWRfY29vcmRzIiwicXVlcnlfZ2V0X2FsbF9mbG9vcnBsYW5zIiwicXVlcnlfZ2V0X2RhdGFiYXNlX3ZlcnNpb24iLCJkYXRhIiwic3RtdCIsInByZXBhcmUiLCJxdWVyeV9pbnNlcnRfdmVyc2lvbiIsImRhdGFiYXNlVmVyc2lvbiIsImZpbmFsaXplIiwicXVlcnlfdXBkYXRlX3ZlcnNpb24iLCJsYXlvdXRfaW1hZ2VzIiwibGVuZ3RoIiwicXVlcnlfaW5zZXJ0X2xheW91dCIsInVwc3RtdCIsInF1ZXJ5X3VwZGF0ZV9sYXlvdXQiLCJlbCIsImlkIiwiZmxvb3JfcGxhbl9uYW1lIiwiZmxvb3JwbGFubmFtZSIsInN0cmluZ2RhdGEiLCJKU09OIiwic3RyaW5naWZ5IiwicGF5bG9hZCIsInF1ZXJ5X2luc2VydF9zY2FuX3Jlc3VsdHMiLCJmaW5pc2hlZCIsImdldCIsInF1ZXJ5X2dldF9zY2FuX2lkIiwicXVlcnlfdXBkYXRlX3NjYW5faWQiLCJzX2lkIiwiYXBfaWQiLCJ4IiwieSIsIm9yaWdfdmFsdWVzIiwiY3JlYXRlZCIsInVwZGF0ZUthbG1hbiIsImthbG1hbiIsInF1ZXJ5X2dldF9mb3Jfa2FsbWFuIiwiaW5zZXJ0IiwicXVlcnlfaW5zZXJ0X2thbG1hbl9lc3RpbWF0ZXMiLCJ1cGRhdGUiLCJxdWVyeV91cGRhdGVfa2FsbWFuX2VzdGltYXRlcyIsImVycm9yIiwiZG9uZSIsImsiLCJjZXN0IiwidmFsdWVzIiwic3BsaXQiLCJtYXAiLCJpIiwiYWRkU2FtcGxlIiwiZ2V0RXN0aW1hdGUiLCJxdWVyeV91cGRhdGVfZmVhdHVyZXMiLCJxdWVyeV9nZXRfc2Nhbl9yZXN1bHRzIiwicXVlcnlfdXBkYXRlX29sZGVzdF9mZWF0dXJlcyIsInF1ZXJ5X2dldF9mZWF0dXJlcyIsInF1ZXJ5X2dldF9taW5fc2lkIiwiZHJvcHMiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7Ozs7Ozs7O0FBRUEsSUFBSUEsVUFBVUMsUUFBUSxTQUFSLEVBQW1CQyxPQUFuQixFQUFkOztJQUVNQyxFO0FBNEdGLGdCQUFZQyxHQUFaLEVBQWdCO0FBQUE7O0FBQUE7O0FBQ1osYUFBS0EsR0FBTCxHQUFXQSxHQUFYO0FBQ0EsYUFBS0MsRUFBTCxHQUFVLElBQUlMLFFBQVFNLFFBQVosQ0FBcUIsZUFBckIsQ0FBVjtBQUNBLGFBQUtELEVBQUwsQ0FBUUUsU0FBUixDQUFrQixhQUFsQixFQUFpQyxLQUFqQztBQUNBLGFBQUtGLEVBQUwsQ0FBUUcsU0FBUixDQUFrQixZQUFNO0FBQ3BCLGtCQUFLSCxFQUFMLENBQVFJLElBQVIsQ0FBYSw0QkFBYjtBQUNBLGtCQUFLSixFQUFMLENBQVFJLElBQVIsQ0FBYSw4QkFBYjtBQUNBLGtCQUFLSixFQUFMLENBQVFJLElBQVIsQ0FBYSxrQkFBYjtBQUNILFNBSkQ7QUFLQSxhQUFLTCxHQUFMLENBQVNNLEtBQVQsQ0FBZSxnQkFBZjtBQUNIOzs7O3NDQUVZO0FBQ1QsbUJBQU8sS0FBS0wsRUFBWjtBQUNIOzs7a0NBRVNNLG1CLEVBQXFCO0FBQUE7O0FBQzNCLGlCQUFLUCxHQUFMLENBQVNNLEtBQVQsQ0FBZSxjQUFmO0FBQ0EsZ0JBQUlMLEtBQUssS0FB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Z0IsRUFHaEIscUNBSGdCLEVBSWhCLHlHQUNFLDJGQUxjLEVBTWhCLDJGQU5nQixFQU9oQixxSEFQZ0IsRUFRaEIsc0JBUmdCLEVBU2hCLDhDQVRnQixFQVVoQiw0REFWZ0IsRUFXaEIsa0NBQWtDZCxHQUFHMEIscUJBQXJDLEdBQTZELHdDQVg3QyxDO0FBbEZsQjFCLEUsQ0FnR0tlLFUsR0FBYSxDQUNoQix3REFEZ0IsRUFFaEIsa0NBQWtDZixHQUFHMEIscUJBQXJDLEdBQTZELHdDQUY3QyxDO0FBaEdsQjFCLEUsQ0FxR0tnQixVLEdBQWEsQ0FDaEIsc0JBRGdCLEVBRWhCLHdGQUNFLGdGQUhjLEVBSWhCLGtDQUFrQ2hCLEdBQUcwQixxQkFBckMsR0FBNkQsd0NBSjdDLEM7OztBQTJOeEI2RCxPQUFPQyxPQUFQLEdBQWlCeEYsRUFBakIiLCJmaWxlIjoiRGIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgS2FsbWFuRmlsdGVyIGZyb20gJy4vS2FsbWFuRmlsdGVyJztcblxubGV0IHNxbGl0ZTMgPSByZXF1aXJlKCdzcWxpdGUzJykudmVyYm9zZSgpO1xuXG5jbGFzcyBEYiB7XG5cbiAgICBzdGF0aWMgZGF0YWJhc2VfY29kZV92ZXJzaW9uID0gNDtcbiAgICBzdGF0aWMgcXVlcnlfZ2V0X2FsbF9mbG9vcnBsYW5zID0gXCJzZWxlY3QgKiBmcm9tIGxheW91dF9pbWFnZXNcIjtcbiAgICBzdGF0aWMgcXVlcnlfZ2V0X2RhdGFiYXNlX3ZlcnNpb24gPSBcInNlbGVjdCB2YWx1ZSBmcm9tIHNldHRpbmdzIHdoZXJlIGtleSA9ICdkYXRhYmFzZV92ZXJzaW9uJztcIjtcbiAgICBzdGF0aWMgcXVlcnlfaW5zZXJ0X3ZlcnNpb24gPSBcImluc2VydCBvciBpZ25vcmUgaW50byBzZXR0aW5ncyB2YWx1ZXMgKCdkYXRhYmFzZV92ZXJzaW9uJywgPyk7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X3VwZGF0ZV92ZXJzaW9uID0gXCJ1cGRhdGUgc2V0dGluZ3Mgc2V0IHZhbHVlID0gPyB3aGVyZSBrZXkgPSAnZGF0YWJhc2VfdmVyc2lvbic7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X2luc2VydF9sYXlvdXQgPSBcImluc2VydCBvciBpZ25vcmUgaW50byBsYXlvdXRfaW1hZ2VzIHZhbHVlcyAoPywgPywgPyk7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X3VwZGF0ZV9sYXlvdXQgPSBcInVwZGF0ZSBsYXlvdXRfaW1hZ2VzIHNldCBsYXlvdXRfaW1hZ2UgPSA/LCBmbG9vcl9wbGFuX25hbWUgPSA/IHdoZXJlIGlkID0gPztcIjtcbiAgICBzdGF0aWMgcXVlcnlfaW5zZXJ0X3NjYW5fcmVzdWx0cyA9IFwiaW5zZXJ0IGludG8gc2Nhbl9yZXN1bHRzIHZhbHVlcyAoPywgPywgPywgPywgPywgPywgPywgPyk7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X2dldF9zY2FuX3Jlc3VsdHMgPSBcInNlbGVjdCAqIGZyb20gc2Nhbl9yZXN1bHRzO1wiO1xuICAgIHN0YXRpYyBxdWVyeV9nZXRfZm9yX2thbG1hbiA9IFwiU0VMRUNUIHMuZnBfaWQsIHMuYXBfaWQsIHMueCwgcy55LCBcIlxuICAgICsgXCJncm91cF9jb25jYXQocy52YWx1ZSkgYHZhbHVlc2AsIFwiXG4gICAgKyBcImNhc2Ugd2hlbiBrLmthbG1hbiBpcyBudWxsIHRoZW4gYXZnKHMudmFsdWUpIGVsc2Ugay5rYWxtYW4gZW5kIGBjZXN0YCwgXCJcbiAgICArIFwiay5rYWxtYW4gRlJPTSBzY2FuX3Jlc3VsdHMgcyBsZWZ0IGpvaW4gXCJcbiAgICArIFwia2FsbWFuX2VzdGltYXRlcyBrIG9uIHMuZnBfaWQgPSBrLmZwX2lkIGFuZCBzLmFwX2lkID0gay5hcF9pZCBhbmQgcy54ID0gay54IGFuZCBzLnkgPSBrLnkgXCJcbiAgICArIFwiIHdoZXJlIHMuZnBfaWQgPSA/IEdST1VQIEJZIHMuZnBfaWQsIHMuYXBfaWQsIHMueCwgcy55O1wiO1xuICAgIHN0YXRpYyBxdWVyeV9pbnNlcnRfa2FsbWFuX2VzdGltYXRlcyA9IFwiaW5zZXJ0IG9yIGlnbm9yZSBpbnRvIGthbG1hbl9lc3RpbWF0ZXMgdmFsdWVzICg/LCA/LCA/LCA/LCA/KTtcIlxuICAgIHN0YXRpYyBxdWVyeV91cGRhdGVfa2FsbWFuX2VzdGltYXRlcyA9IFwidXBkYXRlIGthbG1hbl9lc3RpbWF0ZXMgc2V0IGthbG1hbiA9ID8gd2hlcmUgZnBfaWQgPSA/IGFuZCBhcF9pZCA9ID8gYW5kIFwiXG4gICAgKyBcIiB4ID0gPyBhbmQgeSA9ID87XCI7XG4gICAgc3RhdGljIHF1ZXJ5X3VwZGF0ZV9mZWF0dXJlcyA9IFwiaW5zZXJ0IGludG8gZmVhdHVyZXMgXCJcbiAgICArIFwiIHNlbGVjdCBrLmZwX2lkLCBrLngsIGsueSwgay5hcF9pZCB8fCBrMS5hcF9pZCBhcyBmZWF0dXJlLCBhYnMoay5rYWxtYW4gLSBrMS5rYWxtYW4pIGFzIHZhbHVlIFwiXG4gICAgKyBcIiBmcm9tIGthbG1hbl9lc3RpbWF0ZXMgayBqb2luIGthbG1hbl9lc3RpbWF0ZXMgazEgb24gay5mcF9pZCA9IGsxLmZwX2lkIGFuZCBrLnggPSBrMS54IGFuZCBrLnkgPSBrMS55IFwiXG4gICAgKyBcIiB3aGVyZSBrLmthbG1hbiAhPSAwIGFuZCBrMS5rYWxtYW4gIT0gMDtcIjtcbiAgICBzdGF0aWMgcXVlcnlfdXBkYXRlX29sZGVzdF9mZWF0dXJlcyA9IFwic2VsZWN0IGsuZnBfaWQsIGsueCwgay55LCBrLmFwX2lkIHx8IGsxLmFwX2lkIGFzIGZlYXR1cmUsIFwiXG4gICAgKyBcIiBhYnMoay5rYWxtYW4gLSBrMS5rYWxtYW4pIGFzIHZhbHVlLCA6c2Nhbl9pZDogc19pZCBmcm9tIGthbG1hbl9lc3RpbWF0ZXMgayBqb2luIFwiXG4gICAgKyBcIiBrYWxtYW5fZXN0aW1hdGVzIGsxIG9uIGsuZnBfaWQgPSBrMS5mcF9pZCBhbmQgay54ID0gazEueCBhbmQgay55ID0gazEueSBhbmQgay5hcF9pZCA8IGsxLmFwX2lkIHdoZXJlXCJcbiAgICArIFwiIGsua2FsbWFuICE9IDAgYW5kIGsxLmthbG1hbiAhPSAwIGFuZCBrLmZwX2lkID0gPyBhbmQgazEuZnBfaWQgPSA/O1wiO1xuICAgIHN0YXRpYyBxdWVyeV9nZXRfZmVhdHVyZXMgPSBcInNlbGVjdCBmLiosIGFicyh2YWx1ZSAtIDpmZWF0dXJlX3ZhbHVlOikgZGlmZiBmcm9tIGZlYXR1cmVzIGYgXCJcbiAgICArIFwiIHdoZXJlIGYuZmVhdHVyZSA9ID8gYW5kIGYuZnBfaWQgPSA/IG9yZGVyIGJ5IGRpZmYgYXNjO1wiO1xuICAgIHN0YXRpYyBxdWVyeV9nZXRfc2Nhbm5lZF9jb29yZHMgPSBcInNlbGVjdCBjb3VudCgqKSBhcyBudW1fZmVhdHVyZXMsIHgsIHkgZnJvbSBmZWF0dXJlcyB3aGVyZSBmcF9pZCA9ID8gXCJcbiAgICArIFwiIGdyb3VwIGJ5IHgsIHk7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X2dldF9taW5fc2lkID0gXCJzZWxlY3QgbWluKHNfaWQpIGZyb20gZmVhdHVyZXMgd2hlcmUgZnBfaWQgPSA/XCI7XG4gICAgc3RhdGljIHF1ZXJ5X2dldF9zY2FuX2lkID0gXCJzZWxlY3QgdmFsdWUgKyAxIGFzIHZhbHVlIGZyb20gc2V0dGluZ3Mgd2hlcmUga2V5ID0gJ3NjYW5faWQnO1wiO1xuICAgIHN0YXRpYyBxdWVyeV91cGRhdGVfc2Nhbl9pZCA9IFwidXBkYXRlIHNldHRpbmdzIHNldCB2YWx1ZSA9IHZhbHVlICsgMSB3aGVyZSBrZXkgPSAnc2Nhbl9pZCc7XCI7XG5cbiAgICBzdGF0aWMgY3JlYXRlcyA9IFtcbiAgICAgICAgXCJDUkVBVEUgVEFCTEUgaWYgbm90IGV4aXN0cyBsYXlvdXRfaW1hZ2VzIChpZCBURVhUIFBSSU1BUlkgS0VZLCBsYXlvdXRfaW1hZ2UgVEVYVCk7XCIsXG4gICAgICAgIFwiQ1JFQVRFIFVOSVFVRSBJTkRFWCBpZiBub3QgZXhpc3RzIGxheW91dF9pbWFnZXNfaWRfdWluZGV4IE9OIGxheW91dF9pbWFnZXMgKGlkKTtcIixcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ3JlYXRlIHRoZSBzZXR0aW5ncyB0YWJsZSB3aXRoIGRlZmF1bHQgc2V0dGluZ3NcbiAgICAgICAgICovXG4gICAgICAgIFwiY3JlYXRlIHRhYmxlIGlmIG5vdCBleGlzdHMgc2V0dGluZ3MgKGtleSBURVhUIFBSSU1BUlkgS0VZLCB2YWx1ZSBURVhUKTtcIixcbiAgICAgICAgXCJjcmVhdGUgdW5pcXVlIGluZGV4IGlmIG5vdCBleGlzdHMgc2V0dGluZ3Nfa2V5IG9uIHNldHRpbmdzIChrZXkpO1wiLFxuICAgICAgICBcImluc2VydCBvciBpZ25vcmUgaW50byBzZXR0aW5ncyAoa2V5LCB2YWx1ZSkgdmFsdWVzICgnZGF0YWJhc2VfdmVyc2lvbicsIDApO1wiLFxuICAgICAgICBcImluc2VydCBvciBpZ25vcmUgaW50byBzZXR0aW5ncyAoa2V5LCB2YWx1ZSkgdmFsdWVzICgnZGF0YWJhc2VfY29kZV92ZXJzaW9uJywgMCk7XCIsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGFwX2lkID0gYWNjZXNzIHBvaW50IGlkXG4gICAgICAgICAqIGZwX2lkID0gZmxvb3JwbGFuIGlkXG4gICAgICAgICAqL1xuICAgICAgICBcIkNSRUFURSBUQUJMRSBpZiBub3QgZXhpc3RzIHNjYW5fcmVzdWx0cyBcIiArXG4gICAgICAgIFwiKHNfaWQgSU5URUdFUiwgZnBfaWQgVEVYVCwgYXBfaWQgVEVYVCwgeCBJTlRFR0VSLCBcIiArXG4gICAgICAgIFwieSBJTlRFR0VSLCB2YWx1ZSBSRUFMLCBvcmlnX3ZhbHVlcyBURVhULCBjcmVhdGVkIFRJTUVTVEFNUCBERUZBVUxUIENVUlJFTlRfVElNRVNUQU1QIE5PVCBOVUxMLCBcIiArXG4gICAgICAgIFwiUFJJTUFSWSBLRVkgKHNfaWQsIGZwX2lkLCBhcF9pZCksIFwiICtcbiAgICAgICAgXCJDT05TVFJBSU5UIHNjYW5fcmVzdWx0c19sYXlvdXRfaW1hZ2VzX2lkX2ZrIEZPUkVJR04gS0VZIChmcF9pZCkgUkVGRVJFTkNFUyBsYXlvdXRfaW1hZ2VzIChpZCkpO1wiLFxuICAgICAgICBcImNyZWF0ZSBpbmRleCBpZiBub3QgZXhpc3RzIHhfYW5kX3kgb24gc2Nhbl9yZXN1bHRzICh4LCB5KTtcIixcblxuICAgICAgICBcIkNSRUFURSBUQUJMRSBpZiBub3QgZXhpc3RzIGthbG1hbl9lc3RpbWF0ZXMgKGZwX2lkIFRFWFQsIGFwX2lkIFRFWFQsIHggSU5URUdFUiwgXCJcbiAgICAgICAgKyBcInkgSU5URUdFUiwga2FsbWFuIFJFQUwsIFwiXG4gICAgICAgICsgXCJDT05TVFJBSU5UIGthbG1hbl9lc3RpbWF0ZXNfZnBfaWRfYXBfaWRfeF95X3BrIFBSSU1BUlkgS0VZIChmcF9pZCwgYXBfaWQsIHgsIHkpLFwiXG4gICAgICAgICsgXCJGT1JFSUdOIEtFWSAoYXBfaWQsIGZwX2lkLCB4LCB5KSBSRUZFUkVOQ0VTIHNjYW5fcmVzdWx0cyAoYXBfaWQsIGZwX2lkLCB4LCB5KSBPTiBERUxFVEUgQ0FTQ0FERSlcIixcblxuICAgICAgICBcIkNSRUFURSBUQUJMRSBpZiBub3QgZXhpc3RzIGZlYXR1cmVzIChmcF9pZCBURVhULCB4IElOVEVHRVIsIHkgSU5URUdFUiwgZmVhdHVyZSBURVhULCB2YWx1ZSBSRUFMLCBcIlxuICAgICAgICArIFwiIENPTlNUUkFJTlQgZmVhdHVyZXNfZnBfaWRfeF95X2ZlYXR1cmVfcGsgUFJJTUFSWSBLRVkgKGZwX2lkLCB4LCB5LCBmZWF0dXJlKSk7XCIsXG4gICAgICAgIFwiQ1JFQVRFIFVOSVFVRSBJTkRFWCBpZiBub3QgZXhpc3RzIGZlYXR1cmVzX2ZlYXR1cmVfaW5kZXgxIE9OIGZlYXR1cmVzKGZwX2lkLGZlYXR1cmUseCx5KTtcIixcbiAgICAgICAgXCJDUkVBVEUgSU5ERVggaWYgbm90IGV4aXN0cyBmZWF0dXJlc19mZWF0dXJlX2luZGV4MiBPTiBmZWF0dXJlcyhmZWF0dXJlKTtcIlxuICAgIF07XG5cbiAgICBzdGF0aWMgZHJvcHMgPSBbXG4gICAgICAgIFwiZHJvcCB0YWJsZSBpZiBleGlzdHMgbGF5b3V0X2ltYWdlcztcIixcbiAgICAgICAgXCJkcm9wIHRhYmxlIGlmIGV4aXN0cyBzZXR0aW5ncztcIixcbiAgICAgICAgXCJkcm9wIHRhYmxlIGlmIGV4aXN0cyBzY2FuX3Jlc3VsdHM7XCIsXG4gICAgICAgIFwiZHJvcCB0YWJsZSBpZiBleGlzdHMga2FsbWFuX2VzdGltYXRlcztcIlxuICAgIF07XG5cbiAgICBzdGF0aWMgbWlncmF0aW9uMSA9IFtcbiAgICAgICAgXCJBTFRFUiBUQUJMRSBsYXlvdXRfaW1hZ2VzIEFERCBmbG9vcl9wbGFuX25hbWUgVEVYVCBOVUxMO1wiLFxuICAgICAgICBcInVwZGF0ZSBzZXR0aW5ncyBzZXQgdmFsdWUgPSAnXCIgKyBEYi5kYXRhYmFzZV9jb2RlX3ZlcnNpb24gKyBcIicgd2hlcmUga2V5ID0gJ2RhdGFiYXNlX2NvZGVfdmVyc2lvbic7XCJcbiAgICBdO1xuXG4gICAgc3RhdGljIG1pZ3JhdGlvbjIgPSBbXG4gICAgICAgIFwiQUxURVIgVEFCTEUgZmVhdHVyZXMgQUREIHNfaWQgSU5UIE5VTEw7XCIsXG4gICAgICAgIFwiRFJPUCBJTkRFWCBmZWF0dXJlc19mZWF0dXJlX2luZGV4MTtcIixcbiAgICAgICAgXCJEUk9QIElOREVYIGZlYXR1cmVzX2ZlYXR1cmVfaW5kZXgyO1wiLFxuICAgICAgICBcIkNSRUFURSBUQUJMRSBmZWF0dXJlc2E4ZDEgKGZwX2lkIFRFWFQsIHggSU5URUdFUiwgeSBJTlRFR0VSLCBmZWF0dXJlIFRFWFQsIHZhbHVlIFJFQUwsIHNfaWQgSU5URUdFUixcIlxuICAgICAgICArIFwiIENPTlNUUkFJTlQgZmVhdHVyZXNfZnBfaWRfeF95X2ZlYXR1cmVfc19pZF9wayBQUklNQVJZIEtFWSAoZnBfaWQsIHgsIHksIGZlYXR1cmUsIHNfaWQpKTtcIixcbiAgICAgICAgXCJDUkVBVEUgVU5JUVVFIElOREVYIGZlYXR1cmVzX2ZlYXR1cmVfaW5kZXgxIE9OIGZlYXR1cmVzYThkMSAoZnBfaWQsIGZlYXR1cmUsIHgsIHksIHNfaWQpO1wiLFxuICAgICAgICBcIklOU0VSVCBJTlRPIGZlYXR1cmVzYThkMShmcF9pZCwgeCwgeSwgZmVhdHVyZSwgdmFsdWUsIHNfaWQpIFNFTEVDVCBmcF9pZCwgeCwgeSwgZmVhdHVyZSwgdmFsdWUsIHNfaWQgRlJPTSBmZWF0dXJlcztcIixcbiAgICAgICAgXCJEUk9QIFRBQkxFIGZlYXR1cmVzO1wiLFxuICAgICAgICBcIkFMVEVSIFRBQkxFIGZlYXR1cmVzYThkMSBSRU5BTUUgVE8gZmVhdHVyZXM7XCIsXG4gICAgICAgIFwiQ1JFQVRFIElOREVYIGZlYXR1cmVzX2ZlYXR1cmVfaW5kZXgyIE9OIGZlYXR1cmVzKGZlYXR1cmUpO1wiLFxuICAgICAgICBcInVwZGF0ZSBzZXR0aW5ncyBzZXQgdmFsdWUgPSAnXCIgKyBEYi5kYXRhYmFzZV9jb2RlX3ZlcnNpb24gKyBcIicgd2hlcmUga2V5ID0gJ2RhdGFiYXNlX2NvZGVfdmVyc2lvbic7XCJcbiAgICBdO1xuXG4gICAgc3RhdGljIG1pZ3JhdGlvbjMgPSBbXG4gICAgICAgIFwiaW5zZXJ0IG9yIGlnbm9yZSBpbnRvIHNldHRpbmdzIHZhbHVlcyAoJ3NjYW5faWQnLCA2NCk7XCIsXG4gICAgICAgIFwidXBkYXRlIHNldHRpbmdzIHNldCB2YWx1ZSA9ICdcIiArIERiLmRhdGFiYXNlX2NvZGVfdmVyc2lvbiArIFwiJyB3aGVyZSBrZXkgPSAnZGF0YWJhc2VfY29kZV92ZXJzaW9uJztcIlxuICAgIF07XG5cbiAgICBzdGF0aWMgbWlncmF0aW9uNCA9IFtcbiAgICAgICAgXCJkcm9wIHRhYmxlIGZlYXR1cmVzO1wiLFxuICAgICAgICBcIkNSRUFURSBUQUJMRSBmZWF0dXJlcyAoZnBfaWQgVEVYVCwgeCBJTlRFR0VSLCB5IElOVEVHRVIsIGZlYXR1cmUgVEVYVCwgdmFsdWUgUkVBTCwgXCJcbiAgICAgICAgKyBcIiBDT05TVFJBSU5UIGZlYXR1cmVzX2ZwX2lkX3hfeV9mZWF0dXJlX3BrIFBSSU1BUlkgS0VZIChmcF9pZCwgeCwgeSwgZmVhdHVyZSkpO1wiLFxuICAgICAgICBcInVwZGF0ZSBzZXR0aW5ncyBzZXQgdmFsdWUgPSAnXCIgKyBEYi5kYXRhYmFzZV9jb2RlX3ZlcnNpb24gKyBcIicgd2hlcmUga2V5ID0gJ2RhdGFiYXNlX2NvZGVfdmVyc2lvbic7XCJcbiAgICBdO1xuXG4gICAgY29uc3RydWN0b3IobG9nKXtcbiAgICAgICAgdGhpcy5sb2cgPSBsb2c7XG4gICAgICAgIHRoaXMuZGIgPSBuZXcgc3FsaXRlMy5EYXRhYmFzZSgnZGIvZGIuc3FsaXRlMycpO1xuICAgICAgICB0aGlzLmRiLmNvbmZpZ3VyZSgnYnVzeVRpbWVvdXQnLCAxNTAwMCk7XG4gICAgICAgIHRoaXMuZGIuc2VyaWFsaXplKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZGIuZXhlYyhcIlBSQUdNQSBqb3VybmFsX21vZGUgPSBXQUw7XCIpO1xuICAgICAgICAgICAgdGhpcy5kYi5leGVjKFwiUFJBR01BIGNhY2hlX3NpemUgPSA0MDk2MDAwO1wiKTtcbiAgICAgICAgICAgIHRoaXMuZGIuZXhlYyhcIlBSQUdNQSBvcHRpbWl6ZTtcIik7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmxvZy5kZWJ1ZyhcIkRiLmNvbnN0cnVjdG9yXCIpO1xuICAgIH1cblxuICAgIGdldERhdGFiYXNlKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmRiO1xuICAgIH1cblxuICAgIGRvVXBncmFkZShkYXRhYmFzZUNvZGVWZXJzaW9uKSB7XG4gICAgICAgIHRoaXMubG9nLmRlYnVnKFwiRGIuZG9VcGdyYWRlXCIpO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBzd2l0Y2goZGF0YWJhc2VDb2RlVmVyc2lvbil7XG4gICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgZGIuc2VyaWFsaXplKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgRGIubWlncmF0aW9uMS5mb3JFYWNoKChtaWcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRiLnJ1bihtaWcpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVUYWJsZXMoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgIGRiLnNlcmlhbGl6ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIERiLm1pZ3JhdGlvbjIuZm9yRWFjaCgobWlnKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYi5ydW4obWlnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlVGFibGVzKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICBkYi5zZXJpYWxpemUoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBEYi5taWdyYXRpb24zLmZvckVhY2goKG1pZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGIucnVuKG1pZyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVRhYmxlcygpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgZGIuc2VyaWFsaXplKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgRGIubWlncmF0aW9uNC5mb3JFYWNoKChtaWcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRiLnJ1bihtaWcpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVUYWJsZXMoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgdGhlIHNxbGl0ZSB0YWJsZXNcbiAgICAgKi9cbiAgICBjcmVhdGVUYWJsZXMoKSB7XG4gICAgICAgIHRoaXMubG9nLmRlYnVnKFwiRGIuY3JlYXRlVGFibGVzXCIpO1xuICAgICAgICBsZXQgY3JlYXRlcyA9IERiLmNyZWF0ZXM7XG4gICAgICAgIGxldCBkYiA9IHRoaXMuZGI7XG5cbiAgICAgICAgZGIuc2VyaWFsaXplKCgpID0+IHtcbiAgICAgICAgICAgIGNyZWF0ZXMuZm9yRWFjaChmdW5jdGlvbihjcmVhdGUpe1xuICAgICAgICAgICAgICAgIGRiLnJ1bihjcmVhdGUpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGxldCBkYXRhYmFzZUNvZGVWZXJzaW9uID0gMDtcblxuICAgICAgICAgICAgZGIuYWxsKFwic2VsZWN0ICogZnJvbSBzZXR0aW5nc1wiLCAoZXJyLCByb3dzKSA9PiB7XG4gICAgICAgICAgICAgICAgcm93cy5mb3JFYWNoKGZ1bmN0aW9uKHJvdyl7XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaChyb3cua2V5KXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJkYXRhYmFzZV9jb2RlX3ZlcnNpb25cIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhYmFzZUNvZGVWZXJzaW9uID0gTnVtYmVyKHJvdy52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZihkYXRhYmFzZUNvZGVWZXJzaW9uIDwgRGIuZGF0YWJhc2VfY29kZV92ZXJzaW9uKXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kb1VwZ3JhZGUoZGF0YWJhc2VDb2RlVmVyc2lvbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldFNjYW5uZWRDb29yZHMoZnBfaWQsIGNiKXtcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoXCJEYi5nZXRTY2FubmVkQ29vcmRzXCIpO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBkYi5hbGwoRGIucXVlcnlfZ2V0X3NjYW5uZWRfY29vcmRzLCBmcF9pZCwgY2IpO1xuICAgIH1cblxuICAgIGdldEZsb29yUGxhbnMoY2IpIHtcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoXCJEYi5nZXRGbG9vclBsYW5zXCIpO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBkYi5hbGwoRGIucXVlcnlfZ2V0X2FsbF9mbG9vcnBsYW5zLCBjYik7XG4gICAgfVxuXG4gICAgZ2V0RGF0YWJhc2VWZXJzaW9uKGNiKSB7XG4gICAgICAgIHRoaXMubG9nLmRlYnVnKFwiRGIuZ2V0RGF0YWJhc2VWZXJzaW9uXCIpO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBkYi5hbGwoRGIucXVlcnlfZ2V0X2RhdGFiYXNlX3ZlcnNpb24sIGNiKTtcbiAgICB9XG5cbiAgICB1cGRhdGVEYXRhYmFzZShkYXRhLCBjYikge1xuICAgICAgICB0aGlzLmxvZy5kZWJ1ZyhcIkRiLnVwZGF0ZURhdGFiYXNlXCIpO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBsZXQgc3RtdCA9IGRiLnByZXBhcmUoRGIucXVlcnlfaW5zZXJ0X3ZlcnNpb24pO1xuICAgICAgICBzdG10LnJ1bihkYXRhLmRhdGFiYXNlVmVyc2lvbik7XG4gICAgICAgIHN0bXQuZmluYWxpemUoKTtcblxuICAgICAgICBzdG10ID0gZGIucHJlcGFyZShEYi5xdWVyeV91cGRhdGVfdmVyc2lvbik7XG4gICAgICAgIHN0bXQucnVuKGRhdGEuZGF0YWJhc2VWZXJzaW9uKTtcbiAgICAgICAgc3RtdC5maW5hbGl6ZSgpO1xuXG4gICAgICAgIGlmKHR5cGVvZihkYXRhLmxheW91dF9pbWFnZXMpICE9IFwidW5kZWZpbmVkXCIgJiYgZGF0YS5sYXlvdXRfaW1hZ2VzLmxlbmd0aCA+IDApe1xuICAgICAgICAgICAgc3RtdCA9IGRiLnByZXBhcmUoRGIucXVlcnlfaW5zZXJ0X2xheW91dCk7XG4gICAgICAgICAgICBsZXQgdXBzdG10ID0gZGIucHJlcGFyZShEYi5xdWVyeV91cGRhdGVfbGF5b3V0KTtcblxuICAgICAgICAgICAgZGF0YS5sYXlvdXRfaW1hZ2VzLmZvckVhY2goZnVuY3Rpb24oZWwpe1xuICAgICAgICAgICAgICAgIGxldCBpZCA9IGVsLmlkO1xuICAgICAgICAgICAgICAgIGxldCBmbG9vcl9wbGFuX25hbWUgPSBlbC5mbG9vcnBsYW5uYW1lO1xuICAgICAgICAgICAgICAgIGxldCBzdHJpbmdkYXRhID0gSlNPTi5zdHJpbmdpZnkoZWwpO1xuICAgICAgICAgICAgICAgIHN0bXQucnVuKGlkLCBzdHJpbmdkYXRhLCBmbG9vcl9wbGFuX25hbWUpO1xuICAgICAgICAgICAgICAgIHVwc3RtdC5ydW4oc3RyaW5nZGF0YSwgZmxvb3JfcGxhbl9uYW1lLCBpZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHN0bXQuZmluYWxpemUoKTtcbiAgICAgICAgICAgIHVwc3RtdC5maW5hbGl6ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgY2IoKTtcbiAgICB9XG5cbiAgICBzYXZlUmVhZGluZ3MocGF5bG9hZCwgY2Ipe1xuICAgICAgICBsZXQgbG9nID0gdGhpcy5sb2c7XG4gICAgICAgIGxldCBkYiA9IHRoaXMuZGI7XG4gICAgICAgIGxvZy5kZWJ1ZyhcIkRiLnNhdmVSZWFkaW5nc1wiKTtcblxuICAgICAgICBsZXQgc3RtdCA9IGRiLnByZXBhcmUoRGIucXVlcnlfaW5zZXJ0X3NjYW5fcmVzdWx0cyk7XG4gICAgICAgIGxldCBmaW5pc2hlZCA9IDA7XG4gICAgICAgIGRiLmdldChEYi5xdWVyeV9nZXRfc2Nhbl9pZCwgKGVyciwgcm93KSA9PiB7XG4gICAgICAgICAgICBkYi5ydW4oRGIucXVlcnlfdXBkYXRlX3NjYW5faWQpO1xuICAgICAgICAgICAgcGF5bG9hZC5mb3JFYWNoKChlbCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBzX2lkID0gTnVtYmVyKHJvdy52YWx1ZSk7XG4gICAgICAgICAgICAgICAgbGV0IGZwX2lkID0gZWwuZnBfaWQ7XG4gICAgICAgICAgICAgICAgbGV0IGFwX2lkID0gZWwuYXBfaWQ7XG4gICAgICAgICAgICAgICAgbGV0IHggPSBOdW1iZXIoZWwueCk7XG4gICAgICAgICAgICAgICAgbGV0IHkgPSBOdW1iZXIoZWwueSk7XG4gICAgICAgICAgICAgICAgbGV0IHZhbHVlID0gTnVtYmVyKGVsLnZhbHVlKTtcbiAgICAgICAgICAgICAgICBsZXQgb3JpZ192YWx1ZXMgPSBlbC5vcmlnX3ZhbHVlcztcbiAgICAgICAgICAgICAgICBsZXQgY3JlYXRlZCA9IGVsLmNyZWF0ZWQ7XG4gICAgICAgICAgICAgICAgc3RtdC5ydW4oc19pZCwgZnBfaWQsIGFwX2lkLCB4LCB5LCB2YWx1ZSwgb3JpZ192YWx1ZXMsIGNyZWF0ZWQsIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZmluaXNoZWQrKztcbiAgICAgICAgICAgICAgICAgICAgaWYoZmluaXNoZWQgPj0gcGF5bG9hZC5sZW5ndGgpe1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RtdC5maW5hbGl6ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVLYWxtYW4oZnBfaWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdXBkYXRlS2FsbWFuKGZwX2lkKXtcbiAgICAgICAgbGV0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBsZXQga2FsbWFuID0ge307XG5cbiAgICAgICAgZGIuYWxsKERiLnF1ZXJ5X2dldF9mb3Jfa2FsbWFuLCBmcF9pZCwgKGVyciwgcm93cykgPT4ge1xuICAgICAgICAgICAgY29uc3QgaW5zZXJ0ID0gZGIucHJlcGFyZShEYi5xdWVyeV9pbnNlcnRfa2FsbWFuX2VzdGltYXRlcyk7XG4gICAgICAgICAgICBjb25zdCB1cGRhdGUgPSBkYi5wcmVwYXJlKERiLnF1ZXJ5X3VwZGF0ZV9rYWxtYW5fZXN0aW1hdGVzKTtcblxuICAgICAgICAgICAgaWYoZXJyKSB7XG4gICAgICAgICAgICAgICAgbG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgZG9uZSA9IDA7XG4gICAgICAgICAgICByb3dzLmZvckVhY2goKHJvdykgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBrID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZihrYWxtYW5bcm93LmZwX2lkICsgcm93LmFwX2lkICsgcm93LnggKyByb3cueV0pID09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAga2FsbWFuW3Jvdy5mcF9pZCArIHJvdy5hcF9pZCArIHJvdy54ICsgcm93LnldID0gbmV3IEthbG1hbkZpbHRlcihyb3cuY2VzdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGsgPSBrYWxtYW5bcm93LmZwX2lkICsgcm93LmFwX2lkICsgcm93LnggKyByb3cueV07XG5cbiAgICAgICAgICAgICAgICBsZXQgdmFsdWVzID0gcm93LnZhbHVlc1xuICAgICAgICAgICAgICAgICAgICAuc3BsaXQoXCIsXCIpXG4gICAgICAgICAgICAgICAgICAgIC5tYXAoKGVsKSA9PiB7IHJldHVybiBOdW1iZXIoZWwpOyB9KTtcblxuICAgICAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCB2YWx1ZXMubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgICAgICAgICBrLmFkZFNhbXBsZSh2YWx1ZXNbaV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpbnNlcnQucnVuKHJvdy5mcF9pZCwgcm93LmFwX2lkLCByb3cueCwgcm93LnksIGsuZ2V0RXN0aW1hdGUoKSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB1cGRhdGUucnVuKGsuZ2V0RXN0aW1hdGUoKSwgcm93LmZwX2lkLCByb3cuYXBfaWQsIHJvdy54LCByb3cueSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoZG9uZSA+PSByb3dzLmxlbmd0aCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zZXJ0LmZpbmFsaXplKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlLmZpbmFsaXplKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGIuc2VyaWFsaXplKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGIucnVuKFwiZGVsZXRlIGZyb20gZmVhdHVyZXMgd2hlcmUgZnBfaWQgPSA/XCIsIGZwX2lkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGIucnVuKERiLnF1ZXJ5X3VwZGF0ZV9mZWF0dXJlcywgZnBfaWQsIGZwX2lkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5cbm1vZHVsZS5leHBvcnRzID0gRGI7Il19
//# sourceMappingURL=Db.js.map
