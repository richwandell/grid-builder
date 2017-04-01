'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _KalmanFilter = require('./KalmanFilter');

var _KalmanFilter2 = _interopRequireDefault(_KalmanFilter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var sqlite3 = require('sqlite3').verbose();

var Db = function () {
    function Db(log) {
        _classCallCheck(this, Db);

        this.log = log;
        this.db = new sqlite3.Database('db.sqlite3');
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
            var _this = this;

            this.log.debug("Db.doUpgrade");
            var db = this.db;
            switch (databaseCodeVersion) {
                case 0:
                    db.serialize(function () {
                        Db.migration1.forEach(function (mig) {
                            db.run(mig);
                        });
                        _this.createTables();
                    });
                    break;

                case 1:
                    db.serialize(function () {
                        Db.migration2.forEach(function (mig) {
                            db.run(mig);
                        });
                        _this.createTables();
                    });
                    break;

                case 2:
                    db.serialize(function () {
                        Db.migration3.forEach(function (mig) {
                            db.run(mig);
                        });
                        _this.createTables();
                    });
                    break;

                case 3:
                    db.serialize(function () {
                        Db.migration4.forEach(function (mig) {
                            db.run(mig);
                        });
                        _this.createTables();
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
            var _this2 = this;

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
                        _this2.doUpgrade(databaseCodeVersion);
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
            var _this3 = this;

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
                            _this3.updateKalman(fp_id);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvRGIuZXM2Il0sIm5hbWVzIjpbInNxbGl0ZTMiLCJyZXF1aXJlIiwidmVyYm9zZSIsIkRiIiwibG9nIiwiZGIiLCJEYXRhYmFzZSIsImRlYnVnIiwiZGF0YWJhc2VDb2RlVmVyc2lvbiIsInNlcmlhbGl6ZSIsIm1pZ3JhdGlvbjEiLCJmb3JFYWNoIiwibWlnIiwicnVuIiwiY3JlYXRlVGFibGVzIiwibWlncmF0aW9uMiIsIm1pZ3JhdGlvbjMiLCJtaWdyYXRpb240IiwiY3JlYXRlcyIsImNyZWF0ZSIsImFsbCIsImVyciIsInJvd3MiLCJyb3ciLCJrZXkiLCJOdW1iZXIiLCJ2YWx1ZSIsImRhdGFiYXNlX2NvZGVfdmVyc2lvbiIsImRvVXBncmFkZSIsImZwX2lkIiwiY2IiLCJxdWVyeV9nZXRfc2Nhbm5lZF9jb29yZHMiLCJxdWVyeV9nZXRfYWxsX2Zsb29ycGxhbnMiLCJxdWVyeV9nZXRfZGF0YWJhc2VfdmVyc2lvbiIsImRhdGEiLCJzdG10IiwicHJlcGFyZSIsInF1ZXJ5X2luc2VydF92ZXJzaW9uIiwiZGF0YWJhc2VWZXJzaW9uIiwiZmluYWxpemUiLCJxdWVyeV91cGRhdGVfdmVyc2lvbiIsImxheW91dF9pbWFnZXMiLCJsZW5ndGgiLCJxdWVyeV9pbnNlcnRfbGF5b3V0IiwidXBzdG10IiwicXVlcnlfdXBkYXRlX2xheW91dCIsImVsIiwiaWQiLCJmbG9vcl9wbGFuX25hbWUiLCJmbG9vcnBsYW5uYW1lIiwic3RyaW5nZGF0YSIsIkpTT04iLCJzdHJpbmdpZnkiLCJwYXlsb2FkIiwicXVlcnlfaW5zZXJ0X3NjYW5fcmVzdWx0cyIsImZpbmlzaGVkIiwiZ2V0IiwicXVlcnlfZ2V0X3NjYW5faWQiLCJxdWVyeV91cGRhdGVfc2Nhbl9pZCIsInNfaWQiLCJhcF9pZCIsIngiLCJ5Iiwib3JpZ192YWx1ZXMiLCJjcmVhdGVkIiwidXBkYXRlS2FsbWFuIiwia2FsbWFuIiwicXVlcnlfZ2V0X2Zvcl9rYWxtYW4iLCJpbnNlcnQiLCJxdWVyeV9pbnNlcnRfa2FsbWFuX2VzdGltYXRlcyIsInVwZGF0ZSIsInF1ZXJ5X3VwZGF0ZV9rYWxtYW5fZXN0aW1hdGVzIiwiZXJyb3IiLCJkb25lIiwiayIsImNlc3QiLCJ2YWx1ZXMiLCJzcGxpdCIsIm1hcCIsImkiLCJhZGRTYW1wbGUiLCJnZXRFc3RpbWF0ZSIsInF1ZXJ5X3VwZGF0ZV9mZWF0dXJlcyIsInF1ZXJ5X2dldF9zY2FuX3Jlc3VsdHMiLCJxdWVyeV91cGRhdGVfb2xkZXN0X2ZlYXR1cmVzIiwicXVlcnlfZ2V0X2ZlYXR1cmVzIiwicXVlcnlfZ2V0X21pbl9zaWQiLCJkcm9wcyIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTs7Ozs7Ozs7QUFFQSxJQUFJQSxVQUFVQyxRQUFRLFNBQVIsRUFBbUJDLE9BQW5CLEVBQWQ7O0lBRU1DLEU7QUE0R0YsZ0JBQVlDLEdBQVosRUFBZ0I7QUFBQTs7QUFDWixhQUFLQSxHQUFMLEdBQVdBLEdBQVg7QUFDQSxhQUFLQyxFQUFMLEdBQVUsSUFBSUwsUUFBUU0sUUFBWixDQUFxQixZQUFyQixDQUFWO0FBQ0EsYUFBS0YsR0FBTCxDQUFTRyxLQUFULENBQWUsZ0JBQWY7QUFDSDs7OztzQ0FFWTtBQUNULG1CQUFPLEtBQUtGLEVBQVo7QUFDSDs7O2tDQUVTRyxtQixFQUFxQjtBQUFBOztBQUMzQixpQkFBS0osR0FBTCxDQUFTRyxLQUFULENBQWUsY0FBZjtBQUNBLGdCQUFJRixLQUFLLEtBQUtBLEVBQWQ7QUFDQSxvQkFBT0csbUJBQVA7QUFDSSxxQkFBSyxDQUFMO0FBQ0lILHVCQUFHSSxTQUFILENBQWEsWUFBTTtBQUNmTiwyQkFBR08sVUFBSCxDQUFjQyxPQUFkLENBQXNCLFVBQUNDLEdBQUQsRUFBUztBQUMzQlAsK0JBQUdRLEdBQUgsQ0FBT0QsR0FBUDtBQUNILHlCQUZEO0FBR0EsOEJBQUtFLFlBQUw7QUFDSCxxQkFMRDtBQU1BOztBQUVKLHFCQUFLLENBQUw7QUFDSVQsdUJBQUdJLFNBQUgsQ0FBYSxZQUFNO0FB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QixzQkFEZ0IsRUFFaEIsd0ZBQ0UsZ0ZBSGMsRUFJaEIsa0NBQWtDZCxHQUFHd0IscUJBQXJDLEdBQTZELHdDQUo3QyxDOzs7QUFxTnhCNkQsT0FBT0MsT0FBUCxHQUFpQnRGLEVBQWpCIiwiZmlsZSI6IkRiLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEthbG1hbkZpbHRlciBmcm9tICcuL0thbG1hbkZpbHRlcic7XG5cbmxldCBzcWxpdGUzID0gcmVxdWlyZSgnc3FsaXRlMycpLnZlcmJvc2UoKTtcblxuY2xhc3MgRGIge1xuXG4gICAgc3RhdGljIGRhdGFiYXNlX2NvZGVfdmVyc2lvbiA9IDQ7XG4gICAgc3RhdGljIHF1ZXJ5X2dldF9hbGxfZmxvb3JwbGFucyA9IFwic2VsZWN0ICogZnJvbSBsYXlvdXRfaW1hZ2VzXCI7XG4gICAgc3RhdGljIHF1ZXJ5X2dldF9kYXRhYmFzZV92ZXJzaW9uID0gXCJzZWxlY3QgdmFsdWUgZnJvbSBzZXR0aW5ncyB3aGVyZSBrZXkgPSAnZGF0YWJhc2VfdmVyc2lvbic7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X2luc2VydF92ZXJzaW9uID0gXCJpbnNlcnQgb3IgaWdub3JlIGludG8gc2V0dGluZ3MgdmFsdWVzICgnZGF0YWJhc2VfdmVyc2lvbicsID8pO1wiO1xuICAgIHN0YXRpYyBxdWVyeV91cGRhdGVfdmVyc2lvbiA9IFwidXBkYXRlIHNldHRpbmdzIHNldCB2YWx1ZSA9ID8gd2hlcmUga2V5ID0gJ2RhdGFiYXNlX3ZlcnNpb24nO1wiO1xuICAgIHN0YXRpYyBxdWVyeV9pbnNlcnRfbGF5b3V0ID0gXCJpbnNlcnQgb3IgaWdub3JlIGludG8gbGF5b3V0X2ltYWdlcyB2YWx1ZXMgKD8sID8sID8pO1wiO1xuICAgIHN0YXRpYyBxdWVyeV91cGRhdGVfbGF5b3V0ID0gXCJ1cGRhdGUgbGF5b3V0X2ltYWdlcyBzZXQgbGF5b3V0X2ltYWdlID0gPywgZmxvb3JfcGxhbl9uYW1lID0gPyB3aGVyZSBpZCA9ID87XCI7XG4gICAgc3RhdGljIHF1ZXJ5X2luc2VydF9zY2FuX3Jlc3VsdHMgPSBcImluc2VydCBpbnRvIHNjYW5fcmVzdWx0cyB2YWx1ZXMgKD8sID8sID8sID8sID8sID8sID8sID8pO1wiO1xuICAgIHN0YXRpYyBxdWVyeV9nZXRfc2Nhbl9yZXN1bHRzID0gXCJzZWxlY3QgKiBmcm9tIHNjYW5fcmVzdWx0cztcIjtcbiAgICBzdGF0aWMgcXVlcnlfZ2V0X2Zvcl9rYWxtYW4gPSBcIlNFTEVDVCBzLmZwX2lkLCBzLmFwX2lkLCBzLngsIHMueSwgXCJcbiAgICArIFwiZ3JvdXBfY29uY2F0KHMudmFsdWUpIGB2YWx1ZXNgLCBcIlxuICAgICsgXCJjYXNlIHdoZW4gay5rYWxtYW4gaXMgbnVsbCB0aGVuIGF2ZyhzLnZhbHVlKSBlbHNlIGsua2FsbWFuIGVuZCBgY2VzdGAsIFwiXG4gICAgKyBcImsua2FsbWFuIEZST00gc2Nhbl9yZXN1bHRzIHMgbGVmdCBqb2luIFwiXG4gICAgKyBcImthbG1hbl9lc3RpbWF0ZXMgayBvbiBzLmZwX2lkID0gay5mcF9pZCBhbmQgcy5hcF9pZCA9IGsuYXBfaWQgYW5kIHMueCA9IGsueCBhbmQgcy55ID0gay55IFwiXG4gICAgKyBcIiB3aGVyZSBzLmZwX2lkID0gPyBHUk9VUCBCWSBzLmZwX2lkLCBzLmFwX2lkLCBzLngsIHMueTtcIjtcbiAgICBzdGF0aWMgcXVlcnlfaW5zZXJ0X2thbG1hbl9lc3RpbWF0ZXMgPSBcImluc2VydCBvciBpZ25vcmUgaW50byBrYWxtYW5fZXN0aW1hdGVzIHZhbHVlcyAoPywgPywgPywgPywgPyk7XCJcbiAgICBzdGF0aWMgcXVlcnlfdXBkYXRlX2thbG1hbl9lc3RpbWF0ZXMgPSBcInVwZGF0ZSBrYWxtYW5fZXN0aW1hdGVzIHNldCBrYWxtYW4gPSA/IHdoZXJlIGZwX2lkID0gPyBhbmQgYXBfaWQgPSA/IGFuZCBcIlxuICAgICsgXCIgeCA9ID8gYW5kIHkgPSA/O1wiO1xuICAgIHN0YXRpYyBxdWVyeV91cGRhdGVfZmVhdHVyZXMgPSBcImluc2VydCBpbnRvIGZlYXR1cmVzIFwiXG4gICAgKyBcIiBzZWxlY3Qgay5mcF9pZCwgay54LCBrLnksIGsuYXBfaWQgfHwgazEuYXBfaWQgYXMgZmVhdHVyZSwgYWJzKGsua2FsbWFuIC0gazEua2FsbWFuKSBhcyB2YWx1ZSBcIlxuICAgICsgXCIgZnJvbSBrYWxtYW5fZXN0aW1hdGVzIGsgam9pbiBrYWxtYW5fZXN0aW1hdGVzIGsxIG9uIGsuZnBfaWQgPSBrMS5mcF9pZCBhbmQgay54ID0gazEueCBhbmQgay55ID0gazEueSBcIlxuICAgICsgXCIgd2hlcmUgay5rYWxtYW4gIT0gMCBhbmQgazEua2FsbWFuICE9IDA7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X3VwZGF0ZV9vbGRlc3RfZmVhdHVyZXMgPSBcInNlbGVjdCBrLmZwX2lkLCBrLngsIGsueSwgay5hcF9pZCB8fCBrMS5hcF9pZCBhcyBmZWF0dXJlLCBcIlxuICAgICsgXCIgYWJzKGsua2FsbWFuIC0gazEua2FsbWFuKSBhcyB2YWx1ZSwgOnNjYW5faWQ6IHNfaWQgZnJvbSBrYWxtYW5fZXN0aW1hdGVzIGsgam9pbiBcIlxuICAgICsgXCIga2FsbWFuX2VzdGltYXRlcyBrMSBvbiBrLmZwX2lkID0gazEuZnBfaWQgYW5kIGsueCA9IGsxLnggYW5kIGsueSA9IGsxLnkgYW5kIGsuYXBfaWQgPCBrMS5hcF9pZCB3aGVyZVwiXG4gICAgKyBcIiBrLmthbG1hbiAhPSAwIGFuZCBrMS5rYWxtYW4gIT0gMCBhbmQgay5mcF9pZCA9ID8gYW5kIGsxLmZwX2lkID0gPztcIjtcbiAgICBzdGF0aWMgcXVlcnlfZ2V0X2ZlYXR1cmVzID0gXCJzZWxlY3QgZi4qLCBhYnModmFsdWUgLSA6ZmVhdHVyZV92YWx1ZTopIGRpZmYgZnJvbSBmZWF0dXJlcyBmIFwiXG4gICAgKyBcIiB3aGVyZSBmLmZlYXR1cmUgPSA/IGFuZCBmLmZwX2lkID0gPyBvcmRlciBieSBkaWZmIGFzYztcIjtcbiAgICBzdGF0aWMgcXVlcnlfZ2V0X3NjYW5uZWRfY29vcmRzID0gXCJzZWxlY3QgY291bnQoKikgYXMgbnVtX2ZlYXR1cmVzLCB4LCB5IGZyb20gZmVhdHVyZXMgd2hlcmUgZnBfaWQgPSA/IFwiXG4gICAgKyBcIiBncm91cCBieSB4LCB5O1wiO1xuICAgIHN0YXRpYyBxdWVyeV9nZXRfbWluX3NpZCA9IFwic2VsZWN0IG1pbihzX2lkKSBmcm9tIGZlYXR1cmVzIHdoZXJlIGZwX2lkID0gP1wiO1xuICAgIHN0YXRpYyBxdWVyeV9nZXRfc2Nhbl9pZCA9IFwic2VsZWN0IHZhbHVlICsgMSBhcyB2YWx1ZSBmcm9tIHNldHRpbmdzIHdoZXJlIGtleSA9ICdzY2FuX2lkJztcIjtcbiAgICBzdGF0aWMgcXVlcnlfdXBkYXRlX3NjYW5faWQgPSBcInVwZGF0ZSBzZXR0aW5ncyBzZXQgdmFsdWUgPSB2YWx1ZSArIDEgd2hlcmUga2V5ID0gJ3NjYW5faWQnO1wiO1xuXG4gICAgc3RhdGljIGNyZWF0ZXMgPSBbXG4gICAgICAgIFwiQ1JFQVRFIFRBQkxFIGlmIG5vdCBleGlzdHMgbGF5b3V0X2ltYWdlcyAoaWQgVEVYVCBQUklNQVJZIEtFWSwgbGF5b3V0X2ltYWdlIFRFWFQpO1wiLFxuICAgICAgICBcIkNSRUFURSBVTklRVUUgSU5ERVggaWYgbm90IGV4aXN0cyBsYXlvdXRfaW1hZ2VzX2lkX3VpbmRleCBPTiBsYXlvdXRfaW1hZ2VzIChpZCk7XCIsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENyZWF0ZSB0aGUgc2V0dGluZ3MgdGFibGUgd2l0aCBkZWZhdWx0IHNldHRpbmdzXG4gICAgICAgICAqL1xuICAgICAgICBcImNyZWF0ZSB0YWJsZSBpZiBub3QgZXhpc3RzIHNldHRpbmdzIChrZXkgVEVYVCBQUklNQVJZIEtFWSwgdmFsdWUgVEVYVCk7XCIsXG4gICAgICAgIFwiY3JlYXRlIHVuaXF1ZSBpbmRleCBpZiBub3QgZXhpc3RzIHNldHRpbmdzX2tleSBvbiBzZXR0aW5ncyAoa2V5KTtcIixcbiAgICAgICAgXCJpbnNlcnQgb3IgaWdub3JlIGludG8gc2V0dGluZ3MgKGtleSwgdmFsdWUpIHZhbHVlcyAoJ2RhdGFiYXNlX3ZlcnNpb24nLCAwKTtcIixcbiAgICAgICAgXCJpbnNlcnQgb3IgaWdub3JlIGludG8gc2V0dGluZ3MgKGtleSwgdmFsdWUpIHZhbHVlcyAoJ2RhdGFiYXNlX2NvZGVfdmVyc2lvbicsIDApO1wiLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBhcF9pZCA9IGFjY2VzcyBwb2ludCBpZFxuICAgICAgICAgKiBmcF9pZCA9IGZsb29ycGxhbiBpZFxuICAgICAgICAgKi9cbiAgICAgICAgXCJDUkVBVEUgVEFCTEUgaWYgbm90IGV4aXN0cyBzY2FuX3Jlc3VsdHMgXCIgK1xuICAgICAgICBcIihzX2lkIElOVEVHRVIsIGZwX2lkIFRFWFQsIGFwX2lkIFRFWFQsIHggSU5URUdFUiwgXCIgK1xuICAgICAgICBcInkgSU5URUdFUiwgdmFsdWUgUkVBTCwgb3JpZ192YWx1ZXMgVEVYVCwgY3JlYXRlZCBUSU1FU1RBTVAgREVGQVVMVCBDVVJSRU5UX1RJTUVTVEFNUCBOT1QgTlVMTCwgXCIgK1xuICAgICAgICBcIlBSSU1BUlkgS0VZIChzX2lkLCBmcF9pZCwgYXBfaWQpLCBcIiArXG4gICAgICAgIFwiQ09OU1RSQUlOVCBzY2FuX3Jlc3VsdHNfbGF5b3V0X2ltYWdlc19pZF9mayBGT1JFSUdOIEtFWSAoZnBfaWQpIFJFRkVSRU5DRVMgbGF5b3V0X2ltYWdlcyAoaWQpKTtcIixcbiAgICAgICAgXCJjcmVhdGUgaW5kZXggaWYgbm90IGV4aXN0cyB4X2FuZF95IG9uIHNjYW5fcmVzdWx0cyAoeCwgeSk7XCIsXG5cbiAgICAgICAgXCJDUkVBVEUgVEFCTEUgaWYgbm90IGV4aXN0cyBrYWxtYW5fZXN0aW1hdGVzIChmcF9pZCBURVhULCBhcF9pZCBURVhULCB4IElOVEVHRVIsIFwiXG4gICAgICAgICsgXCJ5IElOVEVHRVIsIGthbG1hbiBSRUFMLCBcIlxuICAgICAgICArIFwiQ09OU1RSQUlOVCBrYWxtYW5fZXN0aW1hdGVzX2ZwX2lkX2FwX2lkX3hfeV9wayBQUklNQVJZIEtFWSAoZnBfaWQsIGFwX2lkLCB4LCB5KSxcIlxuICAgICAgICArIFwiRk9SRUlHTiBLRVkgKGFwX2lkLCBmcF9pZCwgeCwgeSkgUkVGRVJFTkNFUyBzY2FuX3Jlc3VsdHMgKGFwX2lkLCBmcF9pZCwgeCwgeSkgT04gREVMRVRFIENBU0NBREUpXCIsXG5cbiAgICAgICAgXCJDUkVBVEUgVEFCTEUgaWYgbm90IGV4aXN0cyBmZWF0dXJlcyAoZnBfaWQgVEVYVCwgeCBJTlRFR0VSLCB5IElOVEVHRVIsIGZlYXR1cmUgVEVYVCwgdmFsdWUgUkVBTCwgXCJcbiAgICAgICAgKyBcIiBDT05TVFJBSU5UIGZlYXR1cmVzX2ZwX2lkX3hfeV9mZWF0dXJlX3BrIFBSSU1BUlkgS0VZIChmcF9pZCwgeCwgeSwgZmVhdHVyZSkpO1wiLFxuICAgICAgICBcIkNSRUFURSBVTklRVUUgSU5ERVggaWYgbm90IGV4aXN0cyBmZWF0dXJlc19mZWF0dXJlX2luZGV4MSBPTiBmZWF0dXJlcyhmcF9pZCxmZWF0dXJlLHgseSk7XCIsXG4gICAgICAgIFwiQ1JFQVRFIElOREVYIGlmIG5vdCBleGlzdHMgZmVhdHVyZXNfZmVhdHVyZV9pbmRleDIgT04gZmVhdHVyZXMoZmVhdHVyZSk7XCJcbiAgICBdO1xuXG4gICAgc3RhdGljIGRyb3BzID0gW1xuICAgICAgICBcImRyb3AgdGFibGUgaWYgZXhpc3RzIGxheW91dF9pbWFnZXM7XCIsXG4gICAgICAgIFwiZHJvcCB0YWJsZSBpZiBleGlzdHMgc2V0dGluZ3M7XCIsXG4gICAgICAgIFwiZHJvcCB0YWJsZSBpZiBleGlzdHMgc2Nhbl9yZXN1bHRzO1wiLFxuICAgICAgICBcImRyb3AgdGFibGUgaWYgZXhpc3RzIGthbG1hbl9lc3RpbWF0ZXM7XCJcbiAgICBdO1xuXG4gICAgc3RhdGljIG1pZ3JhdGlvbjEgPSBbXG4gICAgICAgIFwiQUxURVIgVEFCTEUgbGF5b3V0X2ltYWdlcyBBREQgZmxvb3JfcGxhbl9uYW1lIFRFWFQgTlVMTDtcIixcbiAgICAgICAgXCJ1cGRhdGUgc2V0dGluZ3Mgc2V0IHZhbHVlID0gJ1wiICsgRGIuZGF0YWJhc2VfY29kZV92ZXJzaW9uICsgXCInIHdoZXJlIGtleSA9ICdkYXRhYmFzZV9jb2RlX3ZlcnNpb24nO1wiXG4gICAgXTtcblxuICAgIHN0YXRpYyBtaWdyYXRpb24yID0gW1xuICAgICAgICBcIkFMVEVSIFRBQkxFIGZlYXR1cmVzIEFERCBzX2lkIElOVCBOVUxMO1wiLFxuICAgICAgICBcIkRST1AgSU5ERVggZmVhdHVyZXNfZmVhdHVyZV9pbmRleDE7XCIsXG4gICAgICAgIFwiRFJPUCBJTkRFWCBmZWF0dXJlc19mZWF0dXJlX2luZGV4MjtcIixcbiAgICAgICAgXCJDUkVBVEUgVEFCTEUgZmVhdHVyZXNhOGQxIChmcF9pZCBURVhULCB4IElOVEVHRVIsIHkgSU5URUdFUiwgZmVhdHVyZSBURVhULCB2YWx1ZSBSRUFMLCBzX2lkIElOVEVHRVIsXCJcbiAgICAgICAgKyBcIiBDT05TVFJBSU5UIGZlYXR1cmVzX2ZwX2lkX3hfeV9mZWF0dXJlX3NfaWRfcGsgUFJJTUFSWSBLRVkgKGZwX2lkLCB4LCB5LCBmZWF0dXJlLCBzX2lkKSk7XCIsXG4gICAgICAgIFwiQ1JFQVRFIFVOSVFVRSBJTkRFWCBmZWF0dXJlc19mZWF0dXJlX2luZGV4MSBPTiBmZWF0dXJlc2E4ZDEgKGZwX2lkLCBmZWF0dXJlLCB4LCB5LCBzX2lkKTtcIixcbiAgICAgICAgXCJJTlNFUlQgSU5UTyBmZWF0dXJlc2E4ZDEoZnBfaWQsIHgsIHksIGZlYXR1cmUsIHZhbHVlLCBzX2lkKSBTRUxFQ1QgZnBfaWQsIHgsIHksIGZlYXR1cmUsIHZhbHVlLCBzX2lkIEZST00gZmVhdHVyZXM7XCIsXG4gICAgICAgIFwiRFJPUCBUQUJMRSBmZWF0dXJlcztcIixcbiAgICAgICAgXCJBTFRFUiBUQUJMRSBmZWF0dXJlc2E4ZDEgUkVOQU1FIFRPIGZlYXR1cmVzO1wiLFxuICAgICAgICBcIkNSRUFURSBJTkRFWCBmZWF0dXJlc19mZWF0dXJlX2luZGV4MiBPTiBmZWF0dXJlcyhmZWF0dXJlKTtcIixcbiAgICAgICAgXCJ1cGRhdGUgc2V0dGluZ3Mgc2V0IHZhbHVlID0gJ1wiICsgRGIuZGF0YWJhc2VfY29kZV92ZXJzaW9uICsgXCInIHdoZXJlIGtleSA9ICdkYXRhYmFzZV9jb2RlX3ZlcnNpb24nO1wiXG4gICAgXTtcblxuICAgIHN0YXRpYyBtaWdyYXRpb24zID0gW1xuICAgICAgICBcImluc2VydCBvciBpZ25vcmUgaW50byBzZXR0aW5ncyB2YWx1ZXMgKCdzY2FuX2lkJywgNjQpO1wiLFxuICAgICAgICBcInVwZGF0ZSBzZXR0aW5ncyBzZXQgdmFsdWUgPSAnXCIgKyBEYi5kYXRhYmFzZV9jb2RlX3ZlcnNpb24gKyBcIicgd2hlcmUga2V5ID0gJ2RhdGFiYXNlX2NvZGVfdmVyc2lvbic7XCJcbiAgICBdO1xuXG4gICAgc3RhdGljIG1pZ3JhdGlvbjQgPSBbXG4gICAgICAgIFwiZHJvcCB0YWJsZSBmZWF0dXJlcztcIixcbiAgICAgICAgXCJDUkVBVEUgVEFCTEUgZmVhdHVyZXMgKGZwX2lkIFRFWFQsIHggSU5URUdFUiwgeSBJTlRFR0VSLCBmZWF0dXJlIFRFWFQsIHZhbHVlIFJFQUwsIFwiXG4gICAgICAgICsgXCIgQ09OU1RSQUlOVCBmZWF0dXJlc19mcF9pZF94X3lfZmVhdHVyZV9wayBQUklNQVJZIEtFWSAoZnBfaWQsIHgsIHksIGZlYXR1cmUpKTtcIixcbiAgICAgICAgXCJ1cGRhdGUgc2V0dGluZ3Mgc2V0IHZhbHVlID0gJ1wiICsgRGIuZGF0YWJhc2VfY29kZV92ZXJzaW9uICsgXCInIHdoZXJlIGtleSA9ICdkYXRhYmFzZV9jb2RlX3ZlcnNpb24nO1wiXG4gICAgXTtcblxuICAgIGNvbnN0cnVjdG9yKGxvZyl7XG4gICAgICAgIHRoaXMubG9nID0gbG9nO1xuICAgICAgICB0aGlzLmRiID0gbmV3IHNxbGl0ZTMuRGF0YWJhc2UoJ2RiLnNxbGl0ZTMnKTtcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoXCJEYi5jb25zdHJ1Y3RvclwiKTtcbiAgICB9XG5cbiAgICBnZXREYXRhYmFzZSgpe1xuICAgICAgICByZXR1cm4gdGhpcy5kYjtcbiAgICB9XG5cbiAgICBkb1VwZ3JhZGUoZGF0YWJhc2VDb2RlVmVyc2lvbikge1xuICAgICAgICB0aGlzLmxvZy5kZWJ1ZyhcIkRiLmRvVXBncmFkZVwiKTtcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgc3dpdGNoKGRhdGFiYXNlQ29kZVZlcnNpb24pe1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgIGRiLnNlcmlhbGl6ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIERiLm1pZ3JhdGlvbjEuZm9yRWFjaCgobWlnKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYi5ydW4obWlnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlVGFibGVzKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICBkYi5zZXJpYWxpemUoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBEYi5taWdyYXRpb24yLmZvckVhY2goKG1pZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGIucnVuKG1pZyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVRhYmxlcygpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgZGIuc2VyaWFsaXplKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgRGIubWlncmF0aW9uMy5mb3JFYWNoKChtaWcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRiLnJ1bihtaWcpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVUYWJsZXMoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgIGRiLnNlcmlhbGl6ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIERiLm1pZ3JhdGlvbjQuZm9yRWFjaCgobWlnKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYi5ydW4obWlnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlVGFibGVzKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIHRoZSBzcWxpdGUgdGFibGVzXG4gICAgICovXG4gICAgY3JlYXRlVGFibGVzKCkge1xuICAgICAgICB0aGlzLmxvZy5kZWJ1ZyhcIkRiLmNyZWF0ZVRhYmxlc1wiKTtcbiAgICAgICAgbGV0IGNyZWF0ZXMgPSBEYi5jcmVhdGVzO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuXG4gICAgICAgIGRiLnNlcmlhbGl6ZSgoKSA9PiB7XG4gICAgICAgICAgICBjcmVhdGVzLmZvckVhY2goZnVuY3Rpb24oY3JlYXRlKXtcbiAgICAgICAgICAgICAgICBkYi5ydW4oY3JlYXRlKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBsZXQgZGF0YWJhc2VDb2RlVmVyc2lvbiA9IDA7XG5cbiAgICAgICAgICAgIGRiLmFsbChcInNlbGVjdCAqIGZyb20gc2V0dGluZ3NcIiwgKGVyciwgcm93cykgPT4ge1xuICAgICAgICAgICAgICAgIHJvd3MuZm9yRWFjaChmdW5jdGlvbihyb3cpe1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2gocm93LmtleSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiZGF0YWJhc2VfY29kZV92ZXJzaW9uXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YWJhc2VDb2RlVmVyc2lvbiA9IE51bWJlcihyb3cudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYoZGF0YWJhc2VDb2RlVmVyc2lvbiA8IERiLmRhdGFiYXNlX2NvZGVfdmVyc2lvbil7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZG9VcGdyYWRlKGRhdGFiYXNlQ29kZVZlcnNpb24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXRTY2FubmVkQ29vcmRzKGZwX2lkLCBjYil7XG4gICAgICAgIHRoaXMubG9nLmRlYnVnKFwiRGIuZ2V0U2Nhbm5lZENvb3Jkc1wiKTtcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgZGIuYWxsKERiLnF1ZXJ5X2dldF9zY2FubmVkX2Nvb3JkcywgZnBfaWQsIGNiKTtcbiAgICB9XG5cbiAgICBnZXRGbG9vclBsYW5zKGNiKSB7XG4gICAgICAgIHRoaXMubG9nLmRlYnVnKFwiRGIuZ2V0Rmxvb3JQbGFuc1wiKTtcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgZGIuYWxsKERiLnF1ZXJ5X2dldF9hbGxfZmxvb3JwbGFucywgY2IpO1xuICAgIH1cblxuICAgIGdldERhdGFiYXNlVmVyc2lvbihjYikge1xuICAgICAgICB0aGlzLmxvZy5kZWJ1ZyhcIkRiLmdldERhdGFiYXNlVmVyc2lvblwiKTtcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgZGIuYWxsKERiLnF1ZXJ5X2dldF9kYXRhYmFzZV92ZXJzaW9uLCBjYik7XG4gICAgfVxuXG4gICAgdXBkYXRlRGF0YWJhc2UoZGF0YSwgY2IpIHtcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoXCJEYi51cGRhdGVEYXRhYmFzZVwiKTtcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgbGV0IHN0bXQgPSBkYi5wcmVwYXJlKERiLnF1ZXJ5X2luc2VydF92ZXJzaW9uKTtcbiAgICAgICAgc3RtdC5ydW4oZGF0YS5kYXRhYmFzZVZlcnNpb24pO1xuICAgICAgICBzdG10LmZpbmFsaXplKCk7XG5cbiAgICAgICAgc3RtdCA9IGRiLnByZXBhcmUoRGIucXVlcnlfdXBkYXRlX3ZlcnNpb24pO1xuICAgICAgICBzdG10LnJ1bihkYXRhLmRhdGFiYXNlVmVyc2lvbik7XG4gICAgICAgIHN0bXQuZmluYWxpemUoKTtcblxuICAgICAgICBpZih0eXBlb2YoZGF0YS5sYXlvdXRfaW1hZ2VzKSAhPSBcInVuZGVmaW5lZFwiICYmIGRhdGEubGF5b3V0X2ltYWdlcy5sZW5ndGggPiAwKXtcbiAgICAgICAgICAgIHN0bXQgPSBkYi5wcmVwYXJlKERiLnF1ZXJ5X2luc2VydF9sYXlvdXQpO1xuICAgICAgICAgICAgbGV0IHVwc3RtdCA9IGRiLnByZXBhcmUoRGIucXVlcnlfdXBkYXRlX2xheW91dCk7XG5cbiAgICAgICAgICAgIGRhdGEubGF5b3V0X2ltYWdlcy5mb3JFYWNoKGZ1bmN0aW9uKGVsKXtcbiAgICAgICAgICAgICAgICBsZXQgaWQgPSBlbC5pZDtcbiAgICAgICAgICAgICAgICBsZXQgZmxvb3JfcGxhbl9uYW1lID0gZWwuZmxvb3JwbGFubmFtZTtcbiAgICAgICAgICAgICAgICBsZXQgc3RyaW5nZGF0YSA9IEpTT04uc3RyaW5naWZ5KGVsKTtcbiAgICAgICAgICAgICAgICBzdG10LnJ1bihpZCwgc3RyaW5nZGF0YSwgZmxvb3JfcGxhbl9uYW1lKTtcbiAgICAgICAgICAgICAgICB1cHN0bXQucnVuKHN0cmluZ2RhdGEsIGZsb29yX3BsYW5fbmFtZSwgaWQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzdG10LmZpbmFsaXplKCk7XG4gICAgICAgICAgICB1cHN0bXQuZmluYWxpemUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNiKCk7XG4gICAgfVxuXG4gICAgc2F2ZVJlYWRpbmdzKHBheWxvYWQsIGNiKXtcbiAgICAgICAgbGV0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBsb2cuZGVidWcoXCJEYi5zYXZlUmVhZGluZ3NcIik7XG5cbiAgICAgICAgbGV0IHN0bXQgPSBkYi5wcmVwYXJlKERiLnF1ZXJ5X2luc2VydF9zY2FuX3Jlc3VsdHMpO1xuICAgICAgICBsZXQgZmluaXNoZWQgPSAwO1xuICAgICAgICBkYi5nZXQoRGIucXVlcnlfZ2V0X3NjYW5faWQsIChlcnIsIHJvdykgPT4ge1xuICAgICAgICAgICAgZGIucnVuKERiLnF1ZXJ5X3VwZGF0ZV9zY2FuX2lkKTtcbiAgICAgICAgICAgIHBheWxvYWQuZm9yRWFjaCgoZWwpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgc19pZCA9IE51bWJlcihyb3cudmFsdWUpO1xuICAgICAgICAgICAgICAgIGxldCBmcF9pZCA9IGVsLmZwX2lkO1xuICAgICAgICAgICAgICAgIGxldCBhcF9pZCA9IGVsLmFwX2lkO1xuICAgICAgICAgICAgICAgIGxldCB4ID0gTnVtYmVyKGVsLngpO1xuICAgICAgICAgICAgICAgIGxldCB5ID0gTnVtYmVyKGVsLnkpO1xuICAgICAgICAgICAgICAgIGxldCB2YWx1ZSA9IE51bWJlcihlbC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgbGV0IG9yaWdfdmFsdWVzID0gZWwub3JpZ192YWx1ZXM7XG4gICAgICAgICAgICAgICAgbGV0IGNyZWF0ZWQgPSBlbC5jcmVhdGVkO1xuICAgICAgICAgICAgICAgIHN0bXQucnVuKHNfaWQsIGZwX2lkLCBhcF9pZCwgeCwgeSwgdmFsdWUsIG9yaWdfdmFsdWVzLCBjcmVhdGVkLCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGZpbmlzaGVkKys7XG4gICAgICAgICAgICAgICAgICAgIGlmKGZpbmlzaGVkID49IHBheWxvYWQubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0bXQuZmluYWxpemUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlS2FsbWFuKGZwX2lkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHVwZGF0ZUthbG1hbihmcF9pZCl7XG4gICAgICAgIGxldCBsb2cgPSB0aGlzLmxvZztcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgbGV0IGthbG1hbiA9IHt9O1xuXG4gICAgICAgIGRiLmFsbChEYi5xdWVyeV9nZXRfZm9yX2thbG1hbiwgZnBfaWQsIChlcnIsIHJvd3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGluc2VydCA9IGRiLnByZXBhcmUoRGIucXVlcnlfaW5zZXJ0X2thbG1hbl9lc3RpbWF0ZXMpO1xuICAgICAgICAgICAgY29uc3QgdXBkYXRlID0gZGIucHJlcGFyZShEYi5xdWVyeV91cGRhdGVfa2FsbWFuX2VzdGltYXRlcyk7XG5cbiAgICAgICAgICAgIGlmKGVycikge1xuICAgICAgICAgICAgICAgIGxvZy5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IGRvbmUgPSAwO1xuICAgICAgICAgICAgcm93cy5mb3JFYWNoKChyb3cpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgayA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2Yoa2FsbWFuW3Jvdy5mcF9pZCArIHJvdy5hcF9pZCArIHJvdy54ICsgcm93LnldKSA9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGthbG1hbltyb3cuZnBfaWQgKyByb3cuYXBfaWQgKyByb3cueCArIHJvdy55XSA9IG5ldyBLYWxtYW5GaWx0ZXIocm93LmNlc3QpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBrID0ga2FsbWFuW3Jvdy5mcF9pZCArIHJvdy5hcF9pZCArIHJvdy54ICsgcm93LnldO1xuXG4gICAgICAgICAgICAgICAgbGV0IHZhbHVlcyA9IHJvdy52YWx1ZXNcbiAgICAgICAgICAgICAgICAgICAgLnNwbGl0KFwiLFwiKVxuICAgICAgICAgICAgICAgICAgICAubWFwKChlbCkgPT4geyByZXR1cm4gTnVtYmVyKGVsKTsgfSk7XG5cbiAgICAgICAgICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgdmFsdWVzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgICAgICAgICAgay5hZGRTYW1wbGUodmFsdWVzW2ldKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaW5zZXJ0LnJ1bihyb3cuZnBfaWQsIHJvdy5hcF9pZCwgcm93LngsIHJvdy55LCBrLmdldEVzdGltYXRlKCksICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlLnJ1bihrLmdldEVzdGltYXRlKCksIHJvdy5mcF9pZCwgcm93LmFwX2lkLCByb3cueCwgcm93LnksICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGRvbmUgPj0gcm93cy5sZW5ndGgpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc2VydC5maW5hbGl6ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZS5maW5hbGl6ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRiLnNlcmlhbGl6ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRiLnJ1bihcImRlbGV0ZSBmcm9tIGZlYXR1cmVzIHdoZXJlIGZwX2lkID0gP1wiLCBmcF9pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRiLnJ1bihEYi5xdWVyeV91cGRhdGVfZmVhdHVyZXMsIGZwX2lkLCBmcF9pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IERiOyJdfQ==
//# sourceMappingURL=Db.js.map
