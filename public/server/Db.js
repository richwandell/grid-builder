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
        this.log.debug("Db.constructor");

        this.db = new sqlite3.cached.Database('db/db.sqlite3');
        this.db.serialize(function () {
            _this.db.exec("PRAGMA journal_mode = WAL;");
            _this.db.exec("PRAGMA cache_size = 4096000;");
            _this.db.exec("PRAGMA optimize;");
            _this.db.exec("PRAGMA busy_timeout = 15000;");
        });
        this.mdb = new sqlite3.Database(":memory:");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvRGIuZXM2Il0sIm5hbWVzIjpbInNxbGl0ZTMiLCJyZXF1aXJlIiwidmVyYm9zZSIsIkRiIiwibG9nIiwiZGVidWciLCJkYiIsImNhY2hlZCIsIkRhdGFiYXNlIiwic2VyaWFsaXplIiwiZXhlYyIsIm1kYiIsImRhdGFiYXNlQ29kZVZlcnNpb24iLCJtaWdyYXRpb24xIiwiZm9yRWFjaCIsIm1pZyIsInJ1biIsImNyZWF0ZVRhYmxlcyIsIm1pZ3JhdGlvbjIiLCJtaWdyYXRpb24zIiwibWlncmF0aW9uNCIsImNyZWF0ZXMiLCJjcmVhdGUiLCJhbGwiLCJlcnIiLCJyb3dzIiwicm93Iiwia2V5IiwiTnVtYmVyIiwidmFsdWUiLCJkYXRhYmFzZV9jb2RlX3ZlcnNpb24iLCJkb1VwZ3JhZGUiLCJmcF9pZCIsImNiIiwicXVlcnlfZ2V0X3NjYW5uZWRfY29vcmRzIiwicXVlcnlfZ2V0X2FsbF9mbG9vcnBsYW5zIiwicXVlcnlfZ2V0X2RhdGFiYXNlX3ZlcnNpb24iLCJkYXRhIiwic3RtdCIsInByZXBhcmUiLCJxdWVyeV9pbnNlcnRfdmVyc2lvbiIsImRhdGFiYXNlVmVyc2lvbiIsImZpbmFsaXplIiwicXVlcnlfdXBkYXRlX3ZlcnNpb24iLCJsYXlvdXRfaW1hZ2VzIiwibGVuZ3RoIiwicXVlcnlfaW5zZXJ0X2xheW91dCIsInVwc3RtdCIsInF1ZXJ5X3VwZGF0ZV9sYXlvdXQiLCJlbCIsImlkIiwiZmxvb3JfcGxhbl9uYW1lIiwiZmxvb3JwbGFubmFtZSIsInN0cmluZ2RhdGEiLCJKU09OIiwic3RyaW5naWZ5IiwicGF5bG9hZCIsInF1ZXJ5X2luc2VydF9zY2FuX3Jlc3VsdHMiLCJmaW5pc2hlZCIsImdldCIsInF1ZXJ5X2dldF9zY2FuX2lkIiwicXVlcnlfdXBkYXRlX3NjYW5faWQiLCJzX2lkIiwiYXBfaWQiLCJ4IiwieSIsIm9yaWdfdmFsdWVzIiwiY3JlYXRlZCIsInVwZGF0ZUthbG1hbiIsImthbG1hbiIsInF1ZXJ5X2dldF9mb3Jfa2FsbWFuIiwiaW5zZXJ0IiwicXVlcnlfaW5zZXJ0X2thbG1hbl9lc3RpbWF0ZXMiLCJ1cGRhdGUiLCJxdWVyeV91cGRhdGVfa2FsbWFuX2VzdGltYXRlcyIsImVycm9yIiwiZG9uZSIsImsiLCJjZXN0IiwidmFsdWVzIiwic3BsaXQiLCJtYXAiLCJpIiwiYWRkU2FtcGxlIiwiZ2V0RXN0aW1hdGUiLCJxdWVyeV91cGRhdGVfZmVhdHVyZXMiLCJxdWVyeV9nZXRfc2Nhbl9yZXN1bHRzIiwicXVlcnlfdXBkYXRlX29sZGVzdF9mZWF0dXJlcyIsInF1ZXJ5X2dldF9mZWF0dXJlcyIsInF1ZXJ5X2dldF9taW5fc2lkIiwiZHJvcHMiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7Ozs7Ozs7O0FBRUEsSUFBSUEsVUFBVUMsUUFBUSxTQUFSLEVBQW1CQyxPQUFuQixFQUFkOztJQUVNQyxFO0FBNEdGLGdCQUFZQyxHQUFaLEVBQWdCO0FBQUE7O0FBQUE7O0FBQ1osYUFBS0EsR0FBTCxHQUFXQSxHQUFYO0FBQ0EsYUFBS0EsR0FBTCxDQUFTQyxLQUFULENBQWUsZ0JBQWY7O0FBRUEsYUFBS0MsRUFBTCxHQUFVLElBQUlOLFFBQVFPLE1BQVIsQ0FBZUMsUUFBbkIsQ0FBNEIsZUFBNUIsQ0FBVjtBQUNBLGFBQUtGLEVBQUwsQ0FBUUcsU0FBUixDQUFrQixZQUFNO0FBQ3BCLGtCQUFLSCxFQUFMLENBQVFJLElBQVIsQ0FBYSw0QkFBYjtBQUNBLGtCQUFLSixFQUFMLENBQVFJLElBQVIsQ0FBYSw4QkFBYjtBQUNBLGtCQUFLSixFQUFMLENBQVFJLElBQVIsQ0FBYSxrQkFBYjtBQUNBLGtCQUFLSixFQUFMLENBQVFJLElBQVIsQ0FBYSw4QkFBYjtBQUNILFNBTEQ7QUFNQSxhQUFLQyxHQUFMLEdBQVcsSUFBSVgsUUFBUVEsUUFBWixDQUFxQixVQUFyQixDQUFYO0FBQ0g7Ozs7c0NBRVk7QUFDVCxtQkFBTyxLQUFLRixFQUFaO0FBQ0g7OztrQ0FFU00sbUIsRUFBcUI7QUFBQTs7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LFUsR0FBYSxDQUNoQiwwREFEZ0IsRUFFaEIsa0NBQWtDVixHQUFHMkIscUJBQXJDLEdBQTZELHdDQUY3QyxDO0FBN0VsQjNCLEUsQ0FrRktlLFUsR0FBYSxDQUNoQix5Q0FEZ0IsRUFFaEIscUNBRmdCLEVBR2hCLHFDQUhnQixFQUloQix5R0FDRSwyRkFMYyxFQU1oQiwyRkFOZ0IsRUFPaEIscUhBUGdCLEVBUWhCLHNCQVJnQixFQVNoQiw4Q0FUZ0IsRUFVaEIsNERBVmdCLEVBV2hCLGtDQUFrQ2YsR0FBRzJCLHFCQUFyQyxHQUE2RCx3Q0FYN0MsQztBQWxGbEIzQixFLENBZ0dLZ0IsVSxHQUFhLENBQ2hCLHdEQURnQixFQUVoQixrQ0FBa0NoQixHQUFHMkIscUJBQXJDLEdBQTZELHdDQUY3QyxDO0FBaEdsQjNCLEUsQ0FxR0tpQixVLEdBQWEsQ0FDaEIsc0JBRGdCLEVBRWhCLHdGQUNFLGdGQUhjLEVBSWhCLGtDQUFrQ2pCLEdBQUcyQixxQkFBckMsR0FBNkQsd0NBSjdDLEM7OztBQStOeEI2RCxPQUFPQyxPQUFQLEdBQWlCekYsRUFBakIiLCJmaWxlIjoiRGIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgS2FsbWFuRmlsdGVyIGZyb20gJy4vS2FsbWFuRmlsdGVyJztcblxubGV0IHNxbGl0ZTMgPSByZXF1aXJlKCdzcWxpdGUzJykudmVyYm9zZSgpO1xuXG5jbGFzcyBEYiB7XG5cbiAgICBzdGF0aWMgZGF0YWJhc2VfY29kZV92ZXJzaW9uID0gNDtcbiAgICBzdGF0aWMgcXVlcnlfZ2V0X2FsbF9mbG9vcnBsYW5zID0gXCJzZWxlY3QgKiBmcm9tIGxheW91dF9pbWFnZXNcIjtcbiAgICBzdGF0aWMgcXVlcnlfZ2V0X2RhdGFiYXNlX3ZlcnNpb24gPSBcInNlbGVjdCB2YWx1ZSBmcm9tIHNldHRpbmdzIHdoZXJlIGtleSA9ICdkYXRhYmFzZV92ZXJzaW9uJztcIjtcbiAgICBzdGF0aWMgcXVlcnlfaW5zZXJ0X3ZlcnNpb24gPSBcImluc2VydCBvciBpZ25vcmUgaW50byBzZXR0aW5ncyB2YWx1ZXMgKCdkYXRhYmFzZV92ZXJzaW9uJywgPyk7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X3VwZGF0ZV92ZXJzaW9uID0gXCJ1cGRhdGUgc2V0dGluZ3Mgc2V0IHZhbHVlID0gPyB3aGVyZSBrZXkgPSAnZGF0YWJhc2VfdmVyc2lvbic7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X2luc2VydF9sYXlvdXQgPSBcImluc2VydCBvciBpZ25vcmUgaW50byBsYXlvdXRfaW1hZ2VzIHZhbHVlcyAoPywgPywgPyk7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X3VwZGF0ZV9sYXlvdXQgPSBcInVwZGF0ZSBsYXlvdXRfaW1hZ2VzIHNldCBsYXlvdXRfaW1hZ2UgPSA/LCBmbG9vcl9wbGFuX25hbWUgPSA/IHdoZXJlIGlkID0gPztcIjtcbiAgICBzdGF0aWMgcXVlcnlfaW5zZXJ0X3NjYW5fcmVzdWx0cyA9IFwiaW5zZXJ0IGludG8gc2Nhbl9yZXN1bHRzIHZhbHVlcyAoPywgPywgPywgPywgPywgPywgPywgPyk7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X2dldF9zY2FuX3Jlc3VsdHMgPSBcInNlbGVjdCAqIGZyb20gc2Nhbl9yZXN1bHRzO1wiO1xuICAgIHN0YXRpYyBxdWVyeV9nZXRfZm9yX2thbG1hbiA9IFwiU0VMRUNUIHMuZnBfaWQsIHMuYXBfaWQsIHMueCwgcy55LCBcIlxuICAgICsgXCJncm91cF9jb25jYXQocy52YWx1ZSkgYHZhbHVlc2AsIFwiXG4gICAgKyBcImNhc2Ugd2hlbiBrLmthbG1hbiBpcyBudWxsIHRoZW4gYXZnKHMudmFsdWUpIGVsc2Ugay5rYWxtYW4gZW5kIGBjZXN0YCwgXCJcbiAgICArIFwiay5rYWxtYW4gRlJPTSBzY2FuX3Jlc3VsdHMgcyBsZWZ0IGpvaW4gXCJcbiAgICArIFwia2FsbWFuX2VzdGltYXRlcyBrIG9uIHMuZnBfaWQgPSBrLmZwX2lkIGFuZCBzLmFwX2lkID0gay5hcF9pZCBhbmQgcy54ID0gay54IGFuZCBzLnkgPSBrLnkgXCJcbiAgICArIFwiIHdoZXJlIHMuZnBfaWQgPSA/IEdST1VQIEJZIHMuZnBfaWQsIHMuYXBfaWQsIHMueCwgcy55O1wiO1xuICAgIHN0YXRpYyBxdWVyeV9pbnNlcnRfa2FsbWFuX2VzdGltYXRlcyA9IFwiaW5zZXJ0IG9yIGlnbm9yZSBpbnRvIGthbG1hbl9lc3RpbWF0ZXMgdmFsdWVzICg/LCA/LCA/LCA/LCA/KTtcIjtcbiAgICBzdGF0aWMgcXVlcnlfdXBkYXRlX2thbG1hbl9lc3RpbWF0ZXMgPSBcInVwZGF0ZSBrYWxtYW5fZXN0aW1hdGVzIHNldCBrYWxtYW4gPSA/IHdoZXJlIGZwX2lkID0gPyBhbmQgYXBfaWQgPSA/IGFuZCBcIlxuICAgICsgXCIgeCA9ID8gYW5kIHkgPSA/O1wiO1xuICAgIHN0YXRpYyBxdWVyeV91cGRhdGVfZmVhdHVyZXMgPSBcImluc2VydCBpbnRvIGZlYXR1cmVzIFwiXG4gICAgKyBcIiBzZWxlY3Qgay5mcF9pZCwgay54LCBrLnksIGsuYXBfaWQgfHwgazEuYXBfaWQgYXMgZmVhdHVyZSwgYWJzKGsua2FsbWFuIC0gazEua2FsbWFuKSBhcyB2YWx1ZSBcIlxuICAgICsgXCIgZnJvbSBrYWxtYW5fZXN0aW1hdGVzIGsgam9pbiBrYWxtYW5fZXN0aW1hdGVzIGsxIG9uIGsuZnBfaWQgPSBrMS5mcF9pZCBhbmQgay54ID0gazEueCBhbmQgay55ID0gazEueVwiXG4gICAgKyBcIiB3aGVyZSB2YWx1ZSAhPSAwIGFuZCBrLmZwX2lkID0gPyBhbmQgazEuZnBfaWQgPSA/XCI7XG4gICAgc3RhdGljIHF1ZXJ5X3VwZGF0ZV9vbGRlc3RfZmVhdHVyZXMgPSBcInNlbGVjdCBrLmZwX2lkLCBrLngsIGsueSwgay5hcF9pZCB8fCBrMS5hcF9pZCBhcyBmZWF0dXJlLCBcIlxuICAgICsgXCIgYWJzKGsua2FsbWFuIC0gazEua2FsbWFuKSBhcyB2YWx1ZSwgOnNjYW5faWQ6IHNfaWQgZnJvbSBrYWxtYW5fZXN0aW1hdGVzIGsgam9pbiBcIlxuICAgICsgXCIga2FsbWFuX2VzdGltYXRlcyBrMSBvbiBrLmZwX2lkID0gazEuZnBfaWQgYW5kIGsueCA9IGsxLnggYW5kIGsueSA9IGsxLnkgYW5kIGsuYXBfaWQgPCBrMS5hcF9pZCB3aGVyZVwiXG4gICAgKyBcIiBrLmthbG1hbiAhPSAwIGFuZCBrMS5rYWxtYW4gIT0gMCBhbmQgay5mcF9pZCA9ID8gYW5kIGsxLmZwX2lkID0gPztcIjtcbiAgICBzdGF0aWMgcXVlcnlfZ2V0X2ZlYXR1cmVzID0gXCJzZWxlY3QgZi4qLCBhYnModmFsdWUgLSA6ZmVhdHVyZV92YWx1ZTopIGRpZmYgZnJvbSBmZWF0dXJlcyBmIFwiXG4gICAgKyBcIiB3aGVyZSBmLmZlYXR1cmUgPSA/IGFuZCBmLmZwX2lkID0gPyBvcmRlciBieSBkaWZmIGFzYztcIjtcbiAgICBzdGF0aWMgcXVlcnlfZ2V0X3NjYW5uZWRfY29vcmRzID0gXCJzZWxlY3QgY291bnQoKikgYXMgbnVtX2ZlYXR1cmVzLCB4LCB5IGZyb20gZmVhdHVyZXMgd2hlcmUgZnBfaWQgPSA/IFwiXG4gICAgKyBcIiBncm91cCBieSB4LCB5O1wiO1xuICAgIHN0YXRpYyBxdWVyeV9nZXRfbWluX3NpZCA9IFwic2VsZWN0IG1pbihzX2lkKSBmcm9tIGZlYXR1cmVzIHdoZXJlIGZwX2lkID0gP1wiO1xuICAgIHN0YXRpYyBxdWVyeV9nZXRfc2Nhbl9pZCA9IFwic2VsZWN0IHZhbHVlICsgMSBhcyB2YWx1ZSBmcm9tIHNldHRpbmdzIHdoZXJlIGtleSA9ICdzY2FuX2lkJztcIjtcbiAgICBzdGF0aWMgcXVlcnlfdXBkYXRlX3NjYW5faWQgPSBcInVwZGF0ZSBzZXR0aW5ncyBzZXQgdmFsdWUgPSB2YWx1ZSArIDEgd2hlcmUga2V5ID0gJ3NjYW5faWQnO1wiO1xuXG4gICAgc3RhdGljIGNyZWF0ZXMgPSBbXG4gICAgICAgIFwiQ1JFQVRFIFRBQkxFIGlmIG5vdCBleGlzdHMgbGF5b3V0X2ltYWdlcyAoaWQgVEVYVCBQUklNQVJZIEtFWSwgbGF5b3V0X2ltYWdlIFRFWFQpO1wiLFxuICAgICAgICBcIkNSRUFURSBVTklRVUUgSU5ERVggaWYgbm90IGV4aXN0cyBsYXlvdXRfaW1hZ2VzX2lkX3VpbmRleCBPTiBsYXlvdXRfaW1hZ2VzIChpZCk7XCIsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENyZWF0ZSB0aGUgc2V0dGluZ3MgdGFibGUgd2l0aCBkZWZhdWx0IHNldHRpbmdzXG4gICAgICAgICAqL1xuICAgICAgICBcImNyZWF0ZSB0YWJsZSBpZiBub3QgZXhpc3RzIHNldHRpbmdzIChrZXkgVEVYVCBQUklNQVJZIEtFWSwgdmFsdWUgVEVYVCk7XCIsXG4gICAgICAgIFwiY3JlYXRlIHVuaXF1ZSBpbmRleCBpZiBub3QgZXhpc3RzIHNldHRpbmdzX2tleSBvbiBzZXR0aW5ncyAoa2V5KTtcIixcbiAgICAgICAgXCJpbnNlcnQgb3IgaWdub3JlIGludG8gc2V0dGluZ3MgKGtleSwgdmFsdWUpIHZhbHVlcyAoJ2RhdGFiYXNlX3ZlcnNpb24nLCAwKTtcIixcbiAgICAgICAgXCJpbnNlcnQgb3IgaWdub3JlIGludG8gc2V0dGluZ3MgKGtleSwgdmFsdWUpIHZhbHVlcyAoJ2RhdGFiYXNlX2NvZGVfdmVyc2lvbicsIDApO1wiLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBhcF9pZCA9IGFjY2VzcyBwb2ludCBpZFxuICAgICAgICAgKiBmcF9pZCA9IGZsb29ycGxhbiBpZFxuICAgICAgICAgKi9cbiAgICAgICAgXCJDUkVBVEUgVEFCTEUgaWYgbm90IGV4aXN0cyBzY2FuX3Jlc3VsdHMgXCIgK1xuICAgICAgICBcIihzX2lkIElOVEVHRVIsIGZwX2lkIFRFWFQsIGFwX2lkIFRFWFQsIHggSU5URUdFUiwgXCIgK1xuICAgICAgICBcInkgSU5URUdFUiwgdmFsdWUgUkVBTCwgb3JpZ192YWx1ZXMgVEVYVCwgY3JlYXRlZCBUSU1FU1RBTVAgREVGQVVMVCBDVVJSRU5UX1RJTUVTVEFNUCBOT1QgTlVMTCwgXCIgK1xuICAgICAgICBcIlBSSU1BUlkgS0VZIChzX2lkLCBmcF9pZCwgYXBfaWQpLCBcIiArXG4gICAgICAgIFwiQ09OU1RSQUlOVCBzY2FuX3Jlc3VsdHNfbGF5b3V0X2ltYWdlc19pZF9mayBGT1JFSUdOIEtFWSAoZnBfaWQpIFJFRkVSRU5DRVMgbGF5b3V0X2ltYWdlcyAoaWQpKTtcIixcbiAgICAgICAgXCJjcmVhdGUgaW5kZXggaWYgbm90IGV4aXN0cyB4X2FuZF95IG9uIHNjYW5fcmVzdWx0cyAoeCwgeSk7XCIsXG5cbiAgICAgICAgXCJDUkVBVEUgVEFCTEUgaWYgbm90IGV4aXN0cyBrYWxtYW5fZXN0aW1hdGVzIChmcF9pZCBURVhULCBhcF9pZCBURVhULCB4IElOVEVHRVIsIFwiXG4gICAgICAgICsgXCJ5IElOVEVHRVIsIGthbG1hbiBSRUFMLCBcIlxuICAgICAgICArIFwiQ09OU1RSQUlOVCBrYWxtYW5fZXN0aW1hdGVzX2ZwX2lkX2FwX2lkX3hfeV9wayBQUklNQVJZIEtFWSAoZnBfaWQsIGFwX2lkLCB4LCB5KSxcIlxuICAgICAgICArIFwiRk9SRUlHTiBLRVkgKGFwX2lkLCBmcF9pZCwgeCwgeSkgUkVGRVJFTkNFUyBzY2FuX3Jlc3VsdHMgKGFwX2lkLCBmcF9pZCwgeCwgeSkgT04gREVMRVRFIENBU0NBREUpXCIsXG5cbiAgICAgICAgXCJDUkVBVEUgVEFCTEUgaWYgbm90IGV4aXN0cyBmZWF0dXJlcyAoZnBfaWQgVEVYVCwgeCBJTlRFR0VSLCB5IElOVEVHRVIsIGZlYXR1cmUgVEVYVCwgdmFsdWUgUkVBTCwgXCJcbiAgICAgICAgKyBcIiBDT05TVFJBSU5UIGZlYXR1cmVzX2ZwX2lkX3hfeV9mZWF0dXJlX3BrIFBSSU1BUlkgS0VZIChmcF9pZCwgeCwgeSwgZmVhdHVyZSkpO1wiLFxuICAgICAgICBcIkNSRUFURSBVTklRVUUgSU5ERVggaWYgbm90IGV4aXN0cyBmZWF0dXJlc19mZWF0dXJlX2luZGV4MSBPTiBmZWF0dXJlcyhmcF9pZCxmZWF0dXJlLHgseSk7XCIsXG4gICAgICAgIFwiQ1JFQVRFIElOREVYIGlmIG5vdCBleGlzdHMgZmVhdHVyZXNfZmVhdHVyZV9pbmRleDIgT04gZmVhdHVyZXMoZmVhdHVyZSk7XCJcbiAgICBdO1xuXG4gICAgc3RhdGljIGRyb3BzID0gW1xuICAgICAgICBcImRyb3AgdGFibGUgaWYgZXhpc3RzIGxheW91dF9pbWFnZXM7XCIsXG4gICAgICAgIFwiZHJvcCB0YWJsZSBpZiBleGlzdHMgc2V0dGluZ3M7XCIsXG4gICAgICAgIFwiZHJvcCB0YWJsZSBpZiBleGlzdHMgc2Nhbl9yZXN1bHRzO1wiLFxuICAgICAgICBcImRyb3AgdGFibGUgaWYgZXhpc3RzIGthbG1hbl9lc3RpbWF0ZXM7XCJcbiAgICBdO1xuXG4gICAgc3RhdGljIG1pZ3JhdGlvbjEgPSBbXG4gICAgICAgIFwiQUxURVIgVEFCTEUgbGF5b3V0X2ltYWdlcyBBREQgZmxvb3JfcGxhbl9uYW1lIFRFWFQgTlVMTDtcIixcbiAgICAgICAgXCJ1cGRhdGUgc2V0dGluZ3Mgc2V0IHZhbHVlID0gJ1wiICsgRGIuZGF0YWJhc2VfY29kZV92ZXJzaW9uICsgXCInIHdoZXJlIGtleSA9ICdkYXRhYmFzZV9jb2RlX3ZlcnNpb24nO1wiXG4gICAgXTtcblxuICAgIHN0YXRpYyBtaWdyYXRpb24yID0gW1xuICAgICAgICBcIkFMVEVSIFRBQkxFIGZlYXR1cmVzIEFERCBzX2lkIElOVCBOVUxMO1wiLFxuICAgICAgICBcIkRST1AgSU5ERVggZmVhdHVyZXNfZmVhdHVyZV9pbmRleDE7XCIsXG4gICAgICAgIFwiRFJPUCBJTkRFWCBmZWF0dXJlc19mZWF0dXJlX2luZGV4MjtcIixcbiAgICAgICAgXCJDUkVBVEUgVEFCTEUgZmVhdHVyZXNhOGQxIChmcF9pZCBURVhULCB4IElOVEVHRVIsIHkgSU5URUdFUiwgZmVhdHVyZSBURVhULCB2YWx1ZSBSRUFMLCBzX2lkIElOVEVHRVIsXCJcbiAgICAgICAgKyBcIiBDT05TVFJBSU5UIGZlYXR1cmVzX2ZwX2lkX3hfeV9mZWF0dXJlX3NfaWRfcGsgUFJJTUFSWSBLRVkgKGZwX2lkLCB4LCB5LCBmZWF0dXJlLCBzX2lkKSk7XCIsXG4gICAgICAgIFwiQ1JFQVRFIFVOSVFVRSBJTkRFWCBmZWF0dXJlc19mZWF0dXJlX2luZGV4MSBPTiBmZWF0dXJlc2E4ZDEgKGZwX2lkLCBmZWF0dXJlLCB4LCB5LCBzX2lkKTtcIixcbiAgICAgICAgXCJJTlNFUlQgSU5UTyBmZWF0dXJlc2E4ZDEoZnBfaWQsIHgsIHksIGZlYXR1cmUsIHZhbHVlLCBzX2lkKSBTRUxFQ1QgZnBfaWQsIHgsIHksIGZlYXR1cmUsIHZhbHVlLCBzX2lkIEZST00gZmVhdHVyZXM7XCIsXG4gICAgICAgIFwiRFJPUCBUQUJMRSBmZWF0dXJlcztcIixcbiAgICAgICAgXCJBTFRFUiBUQUJMRSBmZWF0dXJlc2E4ZDEgUkVOQU1FIFRPIGZlYXR1cmVzO1wiLFxuICAgICAgICBcIkNSRUFURSBJTkRFWCBmZWF0dXJlc19mZWF0dXJlX2luZGV4MiBPTiBmZWF0dXJlcyhmZWF0dXJlKTtcIixcbiAgICAgICAgXCJ1cGRhdGUgc2V0dGluZ3Mgc2V0IHZhbHVlID0gJ1wiICsgRGIuZGF0YWJhc2VfY29kZV92ZXJzaW9uICsgXCInIHdoZXJlIGtleSA9ICdkYXRhYmFzZV9jb2RlX3ZlcnNpb24nO1wiXG4gICAgXTtcblxuICAgIHN0YXRpYyBtaWdyYXRpb24zID0gW1xuICAgICAgICBcImluc2VydCBvciBpZ25vcmUgaW50byBzZXR0aW5ncyB2YWx1ZXMgKCdzY2FuX2lkJywgNjQpO1wiLFxuICAgICAgICBcInVwZGF0ZSBzZXR0aW5ncyBzZXQgdmFsdWUgPSAnXCIgKyBEYi5kYXRhYmFzZV9jb2RlX3ZlcnNpb24gKyBcIicgd2hlcmUga2V5ID0gJ2RhdGFiYXNlX2NvZGVfdmVyc2lvbic7XCJcbiAgICBdO1xuXG4gICAgc3RhdGljIG1pZ3JhdGlvbjQgPSBbXG4gICAgICAgIFwiZHJvcCB0YWJsZSBmZWF0dXJlcztcIixcbiAgICAgICAgXCJDUkVBVEUgVEFCTEUgZmVhdHVyZXMgKGZwX2lkIFRFWFQsIHggSU5URUdFUiwgeSBJTlRFR0VSLCBmZWF0dXJlIFRFWFQsIHZhbHVlIFJFQUwsIFwiXG4gICAgICAgICsgXCIgQ09OU1RSQUlOVCBmZWF0dXJlc19mcF9pZF94X3lfZmVhdHVyZV9wayBQUklNQVJZIEtFWSAoZnBfaWQsIHgsIHksIGZlYXR1cmUpKTtcIixcbiAgICAgICAgXCJ1cGRhdGUgc2V0dGluZ3Mgc2V0IHZhbHVlID0gJ1wiICsgRGIuZGF0YWJhc2VfY29kZV92ZXJzaW9uICsgXCInIHdoZXJlIGtleSA9ICdkYXRhYmFzZV9jb2RlX3ZlcnNpb24nO1wiXG4gICAgXTtcblxuICAgIGNvbnN0cnVjdG9yKGxvZyl7XG4gICAgICAgIHRoaXMubG9nID0gbG9nO1xuICAgICAgICB0aGlzLmxvZy5kZWJ1ZyhcIkRiLmNvbnN0cnVjdG9yXCIpO1xuXG4gICAgICAgIHRoaXMuZGIgPSBuZXcgc3FsaXRlMy5jYWNoZWQuRGF0YWJhc2UoJ2RiL2RiLnNxbGl0ZTMnKTtcbiAgICAgICAgdGhpcy5kYi5zZXJpYWxpemUoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5kYi5leGVjKFwiUFJBR01BIGpvdXJuYWxfbW9kZSA9IFdBTDtcIik7XG4gICAgICAgICAgICB0aGlzLmRiLmV4ZWMoXCJQUkFHTUEgY2FjaGVfc2l6ZSA9IDQwOTYwMDA7XCIpO1xuICAgICAgICAgICAgdGhpcy5kYi5leGVjKFwiUFJBR01BIG9wdGltaXplO1wiKTtcbiAgICAgICAgICAgIHRoaXMuZGIuZXhlYyhcIlBSQUdNQSBidXN5X3RpbWVvdXQgPSAxNTAwMDtcIik7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLm1kYiA9IG5ldyBzcWxpdGUzLkRhdGFiYXNlKFwiOm1lbW9yeTpcIik7XG4gICAgfVxuXG4gICAgZ2V0RGF0YWJhc2UoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGI7XG4gICAgfVxuXG4gICAgZG9VcGdyYWRlKGRhdGFiYXNlQ29kZVZlcnNpb24pIHtcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoXCJEYi5kb1VwZ3JhZGVcIik7XG4gICAgICAgIGxldCBkYiA9IHRoaXMuZGI7XG4gICAgICAgIHN3aXRjaChkYXRhYmFzZUNvZGVWZXJzaW9uKXtcbiAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICBkYi5zZXJpYWxpemUoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBEYi5taWdyYXRpb24xLmZvckVhY2goKG1pZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGIucnVuKG1pZyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVRhYmxlcygpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgZGIuc2VyaWFsaXplKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgRGIubWlncmF0aW9uMi5mb3JFYWNoKChtaWcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRiLnJ1bihtaWcpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVUYWJsZXMoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIGRiLnNlcmlhbGl6ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIERiLm1pZ3JhdGlvbjMuZm9yRWFjaCgobWlnKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYi5ydW4obWlnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlVGFibGVzKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICBkYi5zZXJpYWxpemUoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBEYi5taWdyYXRpb240LmZvckVhY2goKG1pZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGIucnVuKG1pZyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVRhYmxlcygpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyB0aGUgc3FsaXRlIHRhYmxlc1xuICAgICAqL1xuICAgIGNyZWF0ZVRhYmxlcygpIHtcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoXCJEYi5jcmVhdGVUYWJsZXNcIik7XG4gICAgICAgIGxldCBjcmVhdGVzID0gRGIuY3JlYXRlcztcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcblxuICAgICAgICBkYi5zZXJpYWxpemUoKCkgPT4ge1xuICAgICAgICAgICAgY3JlYXRlcy5mb3JFYWNoKGZ1bmN0aW9uKGNyZWF0ZSl7XG4gICAgICAgICAgICAgICAgZGIucnVuKGNyZWF0ZSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgbGV0IGRhdGFiYXNlQ29kZVZlcnNpb24gPSAwO1xuXG4gICAgICAgICAgICBkYi5hbGwoXCJzZWxlY3QgKiBmcm9tIHNldHRpbmdzXCIsIChlcnIsIHJvd3MpID0+IHtcbiAgICAgICAgICAgICAgICByb3dzLmZvckVhY2goZnVuY3Rpb24ocm93KXtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoKHJvdy5rZXkpe1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcImRhdGFiYXNlX2NvZGVfdmVyc2lvblwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFiYXNlQ29kZVZlcnNpb24gPSBOdW1iZXIocm93LnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmKGRhdGFiYXNlQ29kZVZlcnNpb24gPCBEYi5kYXRhYmFzZV9jb2RlX3ZlcnNpb24pe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRvVXBncmFkZShkYXRhYmFzZUNvZGVWZXJzaW9uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0U2Nhbm5lZENvb3JkcyhmcF9pZCwgY2Ipe1xuICAgICAgICB0aGlzLmxvZy5kZWJ1ZyhcIkRiLmdldFNjYW5uZWRDb29yZHNcIik7XG4gICAgICAgIGxldCBkYiA9IHRoaXMuZGI7XG4gICAgICAgIGRiLmFsbChEYi5xdWVyeV9nZXRfc2Nhbm5lZF9jb29yZHMsIGZwX2lkLCBjYik7XG4gICAgfVxuXG4gICAgZ2V0Rmxvb3JQbGFucyhjYikge1xuICAgICAgICB0aGlzLmxvZy5kZWJ1ZyhcIkRiLmdldEZsb29yUGxhbnNcIik7XG4gICAgICAgIGxldCBkYiA9IHRoaXMuZGI7XG4gICAgICAgIGRiLmFsbChEYi5xdWVyeV9nZXRfYWxsX2Zsb29ycGxhbnMsIGNiKTtcbiAgICB9XG5cbiAgICBnZXREYXRhYmFzZVZlcnNpb24oY2IpIHtcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoXCJEYi5nZXREYXRhYmFzZVZlcnNpb25cIik7XG4gICAgICAgIGxldCBkYiA9IHRoaXMuZGI7XG4gICAgICAgIGRiLmFsbChEYi5xdWVyeV9nZXRfZGF0YWJhc2VfdmVyc2lvbiwgY2IpO1xuICAgIH1cblxuICAgIHVwZGF0ZURhdGFiYXNlKGRhdGEsIGNiKSB7XG4gICAgICAgIHRoaXMubG9nLmRlYnVnKFwiRGIudXBkYXRlRGF0YWJhc2VcIik7XG4gICAgICAgIGxldCBkYiA9IHRoaXMuZGI7XG4gICAgICAgIGxldCBzdG10ID0gZGIucHJlcGFyZShEYi5xdWVyeV9pbnNlcnRfdmVyc2lvbik7XG4gICAgICAgIHN0bXQucnVuKGRhdGEuZGF0YWJhc2VWZXJzaW9uKTtcbiAgICAgICAgc3RtdC5maW5hbGl6ZSgpO1xuXG4gICAgICAgIHN0bXQgPSBkYi5wcmVwYXJlKERiLnF1ZXJ5X3VwZGF0ZV92ZXJzaW9uKTtcbiAgICAgICAgc3RtdC5ydW4oZGF0YS5kYXRhYmFzZVZlcnNpb24pO1xuICAgICAgICBzdG10LmZpbmFsaXplKCk7XG5cbiAgICAgICAgaWYodHlwZW9mKGRhdGEubGF5b3V0X2ltYWdlcykgIT0gXCJ1bmRlZmluZWRcIiAmJiBkYXRhLmxheW91dF9pbWFnZXMubGVuZ3RoID4gMCl7XG4gICAgICAgICAgICBzdG10ID0gZGIucHJlcGFyZShEYi5xdWVyeV9pbnNlcnRfbGF5b3V0KTtcbiAgICAgICAgICAgIGxldCB1cHN0bXQgPSBkYi5wcmVwYXJlKERiLnF1ZXJ5X3VwZGF0ZV9sYXlvdXQpO1xuXG4gICAgICAgICAgICBkYXRhLmxheW91dF9pbWFnZXMuZm9yRWFjaChmdW5jdGlvbihlbCl7XG4gICAgICAgICAgICAgICAgbGV0IGlkID0gZWwuaWQ7XG4gICAgICAgICAgICAgICAgbGV0IGZsb29yX3BsYW5fbmFtZSA9IGVsLmZsb29ycGxhbm5hbWU7XG4gICAgICAgICAgICAgICAgbGV0IHN0cmluZ2RhdGEgPSBKU09OLnN0cmluZ2lmeShlbCk7XG4gICAgICAgICAgICAgICAgc3RtdC5ydW4oaWQsIHN0cmluZ2RhdGEsIGZsb29yX3BsYW5fbmFtZSk7XG4gICAgICAgICAgICAgICAgdXBzdG10LnJ1bihzdHJpbmdkYXRhLCBmbG9vcl9wbGFuX25hbWUsIGlkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc3RtdC5maW5hbGl6ZSgpO1xuICAgICAgICAgICAgdXBzdG10LmZpbmFsaXplKCk7XG4gICAgICAgIH1cblxuICAgICAgICBjYigpO1xuICAgIH1cblxuICAgIHNhdmVSZWFkaW5ncyhwYXlsb2FkLCBjYil7XG4gICAgICAgIGxldCBsb2cgPSB0aGlzLmxvZztcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgbG9nLmRlYnVnKFwiRGIuc2F2ZVJlYWRpbmdzXCIpO1xuXG4gICAgICAgIGxldCBzdG10ID0gZGIucHJlcGFyZShEYi5xdWVyeV9pbnNlcnRfc2Nhbl9yZXN1bHRzKTtcbiAgICAgICAgbGV0IGZpbmlzaGVkID0gMDtcbiAgICAgICAgZGIuZ2V0KERiLnF1ZXJ5X2dldF9zY2FuX2lkLCAoZXJyLCByb3cpID0+IHtcbiAgICAgICAgICAgIGRiLnJ1bihEYi5xdWVyeV91cGRhdGVfc2Nhbl9pZCk7XG4gICAgICAgICAgICBwYXlsb2FkLmZvckVhY2goKGVsKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHNfaWQgPSBOdW1iZXIocm93LnZhbHVlKTtcbiAgICAgICAgICAgICAgICBsZXQgZnBfaWQgPSBlbC5mcF9pZDtcbiAgICAgICAgICAgICAgICBsZXQgYXBfaWQgPSBlbC5hcF9pZDtcbiAgICAgICAgICAgICAgICBsZXQgeCA9IE51bWJlcihlbC54KTtcbiAgICAgICAgICAgICAgICBsZXQgeSA9IE51bWJlcihlbC55KTtcbiAgICAgICAgICAgICAgICBsZXQgdmFsdWUgPSBOdW1iZXIoZWwudmFsdWUpO1xuICAgICAgICAgICAgICAgIGxldCBvcmlnX3ZhbHVlcyA9IGVsLm9yaWdfdmFsdWVzO1xuICAgICAgICAgICAgICAgIGxldCBjcmVhdGVkID0gZWwuY3JlYXRlZDtcbiAgICAgICAgICAgICAgICBzdG10LnJ1bihzX2lkLCBmcF9pZCwgYXBfaWQsIHgsIHksIHZhbHVlLCBvcmlnX3ZhbHVlcywgY3JlYXRlZCwgKGVycikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBmaW5pc2hlZCsrO1xuICAgICAgICAgICAgICAgICAgICBpZihmaW5pc2hlZCA+PSBwYXlsb2FkLmxlbmd0aCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdG10LmZpbmFsaXplKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUthbG1hbihmcF9pZCwgY2IpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdXBkYXRlS2FsbWFuKGZwX2lkLCBjYil7XG4gICAgICAgIGxldCBsb2cgPSB0aGlzLmxvZztcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgbGV0IGthbG1hbiA9IHt9O1xuXG4gICAgICAgIGRiLmFsbChEYi5xdWVyeV9nZXRfZm9yX2thbG1hbiwgZnBfaWQsIChlcnIsIHJvd3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGluc2VydCA9IGRiLnByZXBhcmUoRGIucXVlcnlfaW5zZXJ0X2thbG1hbl9lc3RpbWF0ZXMpO1xuICAgICAgICAgICAgY29uc3QgdXBkYXRlID0gZGIucHJlcGFyZShEYi5xdWVyeV91cGRhdGVfa2FsbWFuX2VzdGltYXRlcyk7XG5cbiAgICAgICAgICAgIGlmKGVycikge1xuICAgICAgICAgICAgICAgIGxvZy5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IGRvbmUgPSAwO1xuICAgICAgICAgICAgcm93cy5mb3JFYWNoKChyb3cpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgayA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2Yoa2FsbWFuW3Jvdy5mcF9pZCArIHJvdy5hcF9pZCArIHJvdy54ICsgcm93LnldKSA9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGthbG1hbltyb3cuZnBfaWQgKyByb3cuYXBfaWQgKyByb3cueCArIHJvdy55XSA9IG5ldyBLYWxtYW5GaWx0ZXIocm93LmNlc3QpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBrID0ga2FsbWFuW3Jvdy5mcF9pZCArIHJvdy5hcF9pZCArIHJvdy54ICsgcm93LnldO1xuXG4gICAgICAgICAgICAgICAgbGV0IHZhbHVlcyA9IHJvdy52YWx1ZXNcbiAgICAgICAgICAgICAgICAgICAgLnNwbGl0KFwiLFwiKVxuICAgICAgICAgICAgICAgICAgICAubWFwKChlbCkgPT4geyByZXR1cm4gTnVtYmVyKGVsKTsgfSk7XG5cbiAgICAgICAgICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgdmFsdWVzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgICAgICAgICAgay5hZGRTYW1wbGUodmFsdWVzW2ldKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaW5zZXJ0LnJ1bihyb3cuZnBfaWQsIHJvdy5hcF9pZCwgcm93LngsIHJvdy55LCBrLmdldEVzdGltYXRlKCksICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlLnJ1bihrLmdldEVzdGltYXRlKCksIHJvdy5mcF9pZCwgcm93LmFwX2lkLCByb3cueCwgcm93LnksICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGRvbmUgPj0gcm93cy5sZW5ndGgpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc2VydC5maW5hbGl6ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZS5maW5hbGl6ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRiLnNlcmlhbGl6ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRiLnJ1bihcImRlbGV0ZSBmcm9tIGZlYXR1cmVzIHdoZXJlIGZwX2lkID0gP1wiLCBmcF9pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRiLnJ1bihEYi5xdWVyeV91cGRhdGVfZmVhdHVyZXMsIGZwX2lkLCBmcF9pZCwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2IoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IERiOyJdfQ==
//# sourceMappingURL=Db.js.map
