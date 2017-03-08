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
            this.log.debug("Db.doUpgrade");
            var db = this.db;
            switch (databaseCodeVersion) {
                case 0:
                    db.serialize(function () {
                        Db.migration1.forEach(function (mig) {
                            db.run(mig);
                        });
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
            var _this = this;

            this.log.debug("Db.createTables");
            var creates = Db.creates;
            var db = this.db;

            db.serialize(function () {
                creates.forEach(function (create) {
                    db.run(create);
                });
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
                    _this.doUpgrade(databaseCodeVersion);
                }
            });
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
            var log = this.log;
            var db = this.db;
            log.debug("Db.saveReadings");

            var stmt = db.prepare(Db.query_insert_scan_results);

            payload.forEach(function (el) {
                var s_id = Number(el.s_id);
                var fp_id = el.fp_id;
                var ap_id = el.ap_id;
                var x = Number(el.x);
                var y = Number(el.y);
                var value = Number(el.value);
                var orig_values = el.orig_values;
                var created = el.created;
                stmt.run(s_id, fp_id, ap_id, x, y, value, orig_values, created);
            });

            stmt.finalize();
            this.updateKalman();
        }
    }, {
        key: 'updateKalman',
        value: function updateKalman() {
            var log = this.log;
            var db = this.db;
            var kalman = {};

            db.all(Db.query_get_for_kalman, function (err, rows) {
                var insert = db.prepare(Db.query_insert_kalman_estimates);
                var update = db.prepare(Db.query_update_kalman_estimates);
                log.log(err);
                if (err) return;

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
                                db.exec("delete from features", function () {
                                    db.exec(Db.query_update_features);
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

Db.database_code_version = 1;
Db.query_get_all_floorplans = "select * from layout_images";
Db.query_get_database_version = "select value from settings where key = 'database_version';";
Db.query_insert_version = "insert or ignore into settings values ('database_version', ?);";
Db.query_update_version = "update settings set value = ? where key = 'database_version';";
Db.query_insert_layout = "insert or ignore into layout_images values (?, ?, ?);";
Db.query_update_layout = "update layout_images set layout_image = ?, floor_plan_name = ? where id = ?;";
Db.query_insert_scan_results = "insert or ignore into scan_results values (?, ?, ?, ?, ?, ?, ?, ?);";
Db.query_get_scan_results = "select * from scan_results;";
Db.query_get_for_kalman = "SELECT s.fp_id, s.ap_id, s.x, s.y, " + "group_concat(s.value) `values`, " + "case when k.kalman is null then avg(s.value) else k.kalman end `cest`, " + "k.kalman FROM scan_results s left join " + "kalman_estimates k on s.fp_id = k.fp_id and s.ap_id = k.ap_id and s.x = k.x and s.y = k.y " + "GROUP BY s.fp_id, s.ap_id, s.x, s.y;";
Db.query_insert_kalman_estimates = "insert or ignore into kalman_estimates values (?, ?, ?, ?, ?);";
Db.query_update_kalman_estimates = "update kalman_estimates set kalman = ? where fp_id = ? and ap_id = ? and " + " x = ? and y = ?;";
Db.query_update_features = "insert into features " + " select k.fp_id, k.x, k.y, k.ap_id || k1.ap_id as feature, abs(k.kalman - k1.kalman) as value " + " from kalman_estimates k join kalman_estimates k1 on k.fp_id = k1.fp_id and k.x = k1.x and k.y = k1.y " + " where k.kalman != 0 and k1.kalman != 0;";
Db.query_get_features = "select f.*, abs(value - :feature_value:) diff from features f " + " where f.feature = ? and f.fp_id = ? order by diff asc;";
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


module.exports = Db;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRiLmVzNiJdLCJuYW1lcyI6WyJzcWxpdGUzIiwicmVxdWlyZSIsInZlcmJvc2UiLCJEYiIsImxvZyIsImRiIiwiRGF0YWJhc2UiLCJkZWJ1ZyIsImRhdGFiYXNlQ29kZVZlcnNpb24iLCJzZXJpYWxpemUiLCJtaWdyYXRpb24xIiwiZm9yRWFjaCIsIm1pZyIsInJ1biIsImNyZWF0ZXMiLCJjcmVhdGUiLCJhbGwiLCJlcnIiLCJyb3dzIiwicm93Iiwia2V5IiwiTnVtYmVyIiwidmFsdWUiLCJkYXRhYmFzZV9jb2RlX3ZlcnNpb24iLCJkb1VwZ3JhZGUiLCJjYiIsInF1ZXJ5X2dldF9hbGxfZmxvb3JwbGFucyIsInF1ZXJ5X2dldF9kYXRhYmFzZV92ZXJzaW9uIiwiZGF0YSIsInN0bXQiLCJwcmVwYXJlIiwicXVlcnlfaW5zZXJ0X3ZlcnNpb24iLCJkYXRhYmFzZVZlcnNpb24iLCJmaW5hbGl6ZSIsInF1ZXJ5X3VwZGF0ZV92ZXJzaW9uIiwibGF5b3V0X2ltYWdlcyIsImxlbmd0aCIsInF1ZXJ5X2luc2VydF9sYXlvdXQiLCJ1cHN0bXQiLCJxdWVyeV91cGRhdGVfbGF5b3V0IiwiZWwiLCJpZCIsImZsb29yX3BsYW5fbmFtZSIsImZsb29ycGxhbm5hbWUiLCJzdHJpbmdkYXRhIiwiSlNPTiIsInN0cmluZ2lmeSIsInBheWxvYWQiLCJxdWVyeV9pbnNlcnRfc2Nhbl9yZXN1bHRzIiwic19pZCIsImZwX2lkIiwiYXBfaWQiLCJ4IiwieSIsIm9yaWdfdmFsdWVzIiwiY3JlYXRlZCIsInVwZGF0ZUthbG1hbiIsImthbG1hbiIsInF1ZXJ5X2dldF9mb3Jfa2FsbWFuIiwiaW5zZXJ0IiwicXVlcnlfaW5zZXJ0X2thbG1hbl9lc3RpbWF0ZXMiLCJ1cGRhdGUiLCJxdWVyeV91cGRhdGVfa2FsbWFuX2VzdGltYXRlcyIsImRvbmUiLCJrIiwiY2VzdCIsInZhbHVlcyIsInNwbGl0IiwibWFwIiwiaSIsImFkZFNhbXBsZSIsImdldEVzdGltYXRlIiwiZXhlYyIsInF1ZXJ5X3VwZGF0ZV9mZWF0dXJlcyIsInF1ZXJ5X2dldF9zY2FuX3Jlc3VsdHMiLCJxdWVyeV9nZXRfZmVhdHVyZXMiLCJkcm9wcyIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTs7Ozs7Ozs7QUFFQSxJQUFJQSxVQUFVQyxRQUFRLFNBQVIsRUFBbUJDLE9BQW5CLEVBQWQ7O0lBRU1DLEU7QUF5RUYsZ0JBQVlDLEdBQVosRUFBZ0I7QUFBQTs7QUFDWixhQUFLQSxHQUFMLEdBQVdBLEdBQVg7QUFDQSxhQUFLQyxFQUFMLEdBQVUsSUFBSUwsUUFBUU0sUUFBWixDQUFxQixZQUFyQixDQUFWO0FBQ0EsYUFBS0YsR0FBTCxDQUFTRyxLQUFULENBQWUsZ0JBQWY7QUFDSDs7OztzQ0FFWTtBQUNULG1CQUFPLEtBQUtGLEVBQVo7QUFDSDs7O2tDQUVTRyxtQixFQUFxQjtBQUMzQixpQkFBS0osR0FBTCxDQUFTRyxLQUFULENBQWUsY0FBZjtBQUNBLGdCQUFJRixLQUFLLEtBQUtBLEVBQWQ7QUFDQSxvQkFBT0csbUJBQVA7QUFDSSxxQkFBSyxDQUFMO0FBQ0lILHVCQUFHSSxTQUFILENBQWEsWUFBVztBQUNwQk4sMkJBQUdPLFVBQUgsQ0FBY0MsT0FBZCxDQUFzQixVQUFTQyxHQUFULEVBQWE7QUFDL0JQLCtCQUFHUSxHQUFILENBQU9ELEdBQVA7QUFDSCx5QkFGRDtBQUdILHFCQUpEO0FBS0E7QUFQUjtBQVNIOztBQUVEOzs7Ozs7dUNBR2U7QUFBQTs7QUFDWCxpQkFBS1IsR0FBTCxDQUFTRyxLQUFULENBQWUsaUJBQWY7QUFDQSxnQkFBSU8sVUFBVVgsR0FBR1csT0FBakI7QUFDQSxnQkFBSVQsS0FBSyxLQUFLQSxFQUFkOztBQUVBQSxlQUFHSSxTQUFILENBQWEsWUFBVztBQUNwQkssd0JBQVFILE9BQVIsQ0FBZ0IsVUFBU0ksTUFBVCxFQUFnQjtBQUM1QlYsdUJBQUdRLEdBQUgsQ0FBT0UsTUFBUDtBQUNILGlCQUZEO0FBR0gsYUFKRDs7QUFNQSxnQkFBSVAsc0JBQXNCLENBQTFCOztBQUVBSCxlQUFHVyxHQUFILENBQU8sd0JBQVAsRUFBaUMsVUFBQ0MsR0FBRCxFQUFNQyxJQUFOLEVBQWU7QUFDNUNBLHFCQUFLUCxPQUFMLENBQWEsVUFBU1EsR0FBVCxFQUFhO0FBQ3RCLDRCQUFPQSxJQUFJQyxHQUFYO0FBQ0ksNkJBQUssdUJBQUw7QUFDSVosa0RBQXNCYSxPQUFPRixJQUFJRyxLQUFYLENBQXRCO0FBQ0E7QUFIUjtBQUtILGlCQU5EO0FBT0Esb0JBQUdkLHNCQUFzQkwsR0FBR29CLHFCQUE1QixFQUFrRDtBQUM5QywwQkFBS0MsU0FBTCxDQUFlaEIsbUJBQWY7QUFDSDtBQUNKLGFBWEQ7QUFZSDs7O3NDQUVhaUIsRSxFQUFJO0FBQ2QsaUJBQUtyQixHQUFMLENBQVNHLEtBQVQsQ0FBZSxrQkFBZjtBQUNBLGdCQUFJRixLQUFLLEtBQUtBLEVBQWQ7QUFDQUEsZUFBR1csR0FBSCxDQUFPYixHQUFHdUIsd0JBQVYsRUFBb0NELEVBQXBDO0FBQ0g7OzsyQ0FFa0JBLEUsRUFBSTtBQUNuQixpQkFBS3JCLEdBQUwsQ0FBU0csS0FBVCxDQUFlLHVCQUFmO0FBQ0EsZ0JBQUlGLEtBQUssS0FBS0EsRUFBZDtBQUNBQSxlQUFHVyxHQUFILENBQU9iLEdBQUd3QiwwQkFBVixFQUFzQ0YsRUFBdEM7QUFDSDs7O3VDQUVjRyxJLEVBQU1ILEUsRUFBSTtBQUNyQixpQkFBS3JCLEdBQUwsQ0FBU0csS0FBVCxDQUFlLG1CQUFmO0FBQ0EsZ0JBQUlGLEtBQUssS0FBS0EsRUFBZDtBQUNBLGdCQUFJd0IsT0FBT3hCLEdBQUd5QixPQUFILENBQVczQixHQUFHNEIsb0JBQWQsQ0FBWDtBQUNBRixpQkFBS2hCLEdBQUwsQ0FBU2UsS0FBS0ksZUFBZDtBQUNBSCxpQkFBS0ksUUFBTDs7QUFFQUosbUJBQU94QixHQUFHeUIsT0FBSCxDQUFXM0IsR0FBRytCLG9CQUFkLENBQVA7QUFDQUwsaUJBQUtoQixHQUFMLENBQVNlLEtBQUtJLGVBQWQ7QUFDQUgsaUJBQUtJLFFBQUw7O0FBRUEsZ0JBQUcsT0FBT0wsS0FBS08sYUFBWixJQUE4QixXQUE5QixJQUE2Q1AsS0FBS08sYUFBTCxDQUFtQkMsTUFBbkIsR0FBNEIsQ0FBNUUsRUFBOEU7QUFDMUVQLHVCQUFPeEIsR0FBR3lCLE9BQUgsQ0FBVzNCLEdBQUdrQyxtQkFBZCxDQUFQO0FBQ0Esb0JBQUlDLFNBQVNqQyxHQUFHeUIsT0FBSCxDQUFXM0IsR0FBR29DLG1CQUFkLENBQWI7O0FBRUFYLHFCQUFLTyxhQUFMLENBQW1CeEIsT0FBbkIsQ0FBMkIsVUFBUzZCLEVBQVQsRUFBWTtBQUNuQyx3QkFBSUMsS0FBS0QsR0FBR0MsRUFBWjtBQUNBLHdCQUFJQyxrQkFBa0JGLEdBQUdHLGFBQXpCO0FBQ0Esd0JBQUlDLGFBQWFDLEtBQUtDLFNBQUwsQ0FBZU4sRUFBZixDQUFqQjtBQUNBWCx5QkFBS2hCLEdBQUwsQ0FBUzRCLEVBQVQsRUFBYUcsVUFBYixFQUF5QkYsZUFBekI7QUFDQUosMkJBQU96QixHQUFQLENBQVcrQixVQUFYLEVBQXVCRixlQUF2QixFQUF3Q0QsRUFBeEM7QUFDSCxpQkFORDtBQU9BWixxQkFBS0ksUUFBTDtBQUNBSyx1QkFBT0wsUUFBUDtBQUNIOztBQUVEUjtBQUNIOzs7cUNBRVlzQixPLEVBQVN0QixFLEVBQUc7QUFDckIsZ0JBQUlyQixNQUFNLEtBQUtBLEdBQWY7QUFDQSxnQkFBSUMsS0FBSyxLQUFLQSxFQUFkO0FBQ0FELGdCQUFJRyxLQUFKLENBQVUsaUJBQVY7O0FBRUEsZ0JBQUlzQixPQUFPeEIsR0FBR3lCLE9BQUgsQ0FBVzNCLEdBQUc2Qyx5QkFBZCxDQUFYOztBQUVBRCxvQkFBUXBDLE9BQVIsQ0FBZ0IsVUFBQzZCLEVBQUQsRUFBUTtBQUNwQixvQkFBSVMsT0FBTzVCLE9BQU9tQixHQUFHUyxJQUFWLENBQVg7QUFDQSxvQkFBSUMsUUFBUVYsR0FBR1UsS0FBZjtBQUNBLG9CQUFJQyxRQUFRWCxHQUFHVyxLQUFmO0FBQ0Esb0JBQUlDLElBQUkvQixPQUFPbUIsR0FBR1ksQ0FBVixDQUFSO0FBQ0Esb0JBQUlDLElBQUloQyxPQUFPbUIsR0FBR2EsQ0FBVixDQUFSO0FBQ0Esb0JBQUkvQixRQUFRRCxPQUFPbUIsR0FBR2xCLEtBQVYsQ0FBWjtBQUNBLG9CQUFJZ0MsY0FBY2QsR0FBR2MsV0FBckI7QUFDQSxvQkFBSUMsVUFBVWYsR0FBR2UsT0FBakI7QUFDQTFCLHFCQUFLaEIsR0FBTCxDQUFTb0MsSUFBVCxFQUFlQyxLQUFmLEVBQXNCQyxLQUF0QixFQUE2QkMsQ0FBN0IsRUFBZ0NDLENBQWhDLEVBQW1DL0IsS0FBbkMsRUFBMENnQyxXQUExQyxFQUF1REMsT0FBdkQ7QUFDSCxhQVZEOztBQVlBMUIsaUJBQUtJLFFBQUw7QUFDQSxpQkFBS3VCLFlBQUw7QUFDSDs7O3VDQUVhO0FBQ1YsZ0JBQUlwRCxNQUFNLEtBQUtBLEdBQWY7QUFDQSxnQkFBSUMsS0FBSyxLQUFLQSxFQUFkO0FBQ0EsZ0JBQUlvRCxTQUFTLEVBQWI7O0FBRUFwRCxlQUFHVyxHQUFILENBQU9iLEdBQUd1RCxvQkFBVixFQUFnQyxVQUFDekMsR0FBRCxFQUFNQyxJQUFOLEVBQWU7QUFDM0Msb0JBQU15QyxTQUFTdEQsR0FBR3lCLE9BQUgsQ0FBVzNCLEdBQUd5RCw2QkFBZCxDQUFmO0FBQ0Esb0JBQU1DLFNBQVN4RCxHQUFHeUIsT0FBSCxDQUFXM0IsR0FBRzJELDZCQUFkLENBQWY7QUFDQTFELG9CQUFJQSxHQUFKLENBQVFhLEdBQVI7QUFDQSxvQkFBR0EsR0FBSCxFQUFROztBQUVSLG9CQUFJOEMsT0FBTyxDQUFYO0FBQ0E3QyxxQkFBS1AsT0FBTCxDQUFhLFVBQUNRLEdBQUQsRUFBUztBQUNsQix3QkFBSTZDLElBQUksS0FBUjtBQUNBLHdCQUFJLE9BQU9QLE9BQU90QyxJQUFJK0IsS0FBSixHQUFZL0IsSUFBSWdDLEtBQWhCLEdBQXdCaEMsSUFBSWlDLENBQTVCLEdBQWdDakMsSUFBSWtDLENBQTNDLENBQVAsSUFBeUQsV0FBN0QsRUFBMEU7QUFDdEVJLCtCQUFPdEMsSUFBSStCLEtBQUosR0FBWS9CLElBQUlnQyxLQUFoQixHQUF3QmhDLElBQUlpQyxDQUE1QixHQUFnQ2pDLElBQUlrQyxDQUEzQyxJQUFnRCwyQkFBaUJsQyxJQUFJOEMsSUFBckIsQ0FBaEQ7QUFDSDtBQUNERCx3QkFBSVAsT0FBT3RDLElBQUkrQixLQUFKLEdBQVkvQixJQUFJZ0MsS0FBaEIsR0FBd0JoQyxJQUFJaUMsQ0FBNUIsR0FBZ0NqQyxJQUFJa0MsQ0FBM0MsQ0FBSjs7QUFFQSx3QkFBSWEsU0FBUy9DLElBQUkrQyxNQUFKLENBQ1JDLEtBRFEsQ0FDRixHQURFLEVBRVJDLEdBRlEsQ0FFSixVQUFDNUIsRUFBRCxFQUFRO0FBQUUsK0JBQU9uQixPQUFPbUIsRUFBUCxDQUFQO0FBQW9CLHFCQUYxQixDQUFiOztBQUlBLHlCQUFJLElBQUk2QixJQUFJLENBQVosRUFBZUEsSUFBSUgsT0FBTzlCLE1BQTFCLEVBQWtDaUMsR0FBbEMsRUFBc0M7QUFDbENMLDBCQUFFTSxTQUFGLENBQVlKLE9BQU9HLENBQVAsQ0FBWjtBQUNIO0FBQ0RWLDJCQUFPOUMsR0FBUCxDQUFXTSxJQUFJK0IsS0FBZixFQUFzQi9CLElBQUlnQyxLQUExQixFQUFpQ2hDLElBQUlpQyxDQUFyQyxFQUF3Q2pDLElBQUlrQyxDQUE1QyxFQUErQ1csRUFBRU8sV0FBRixFQUEvQyxFQUFnRSxZQUFNO0FBQ2xFViwrQkFBT2hELEdBQVAsQ0FBV21ELEVBQUVPLFdBQUYsRUFBWCxFQUE0QnBELElBQUkrQixLQUFoQyxFQUF1Qy9CLElBQUlnQyxLQUEzQyxFQUFrRGhDLElBQUlpQyxDQUF0RCxFQUF5RGpDLElBQUlrQyxDQUE3RCxFQUFnRSxZQUFNO0FBQ2xFVTtBQUNBLGdDQUFHQSxRQUFRN0MsS0FBS2tCLE1BQWhCLEVBQXVCO0FBQ25CdUIsdUNBQU8xQixRQUFQO0FBQ0E0Qix1Q0FBTzVCLFFBQVA7QUFDQTVCLG1DQUFHbUUsSUFBSCxDQUFRLHNCQUFSLEVBQWdDLFlBQU07QUFDbENuRSx1Q0FBR21FLElBQUgsQ0FBUXJFLEdBQUdzRSxxQkFBWDtBQUNILGlDQUZEO0FBR0g7QUFDSix5QkFURDtBQVVILHFCQVhEO0FBWUgsaUJBMUJEO0FBMkJILGFBbENEO0FBbUNIOzs7Ozs7QUF2T0N0RSxFLENBRUtvQixxQixHQUF3QixDO0FBRjdCcEIsRSxDQUdLdUIsd0IsR0FBMkIsNkI7QUFIaEN2QixFLENBSUt3QiwwQixHQUE2Qiw0RDtBQUpsQ3hCLEUsQ0FLSzRCLG9CLEdBQXVCLGdFO0FBTDVCNUIsRSxDQU1LK0Isb0IsR0FBdUIsK0Q7QUFONUIvQixFLENBT0trQyxtQixHQUFzQix1RDtBQVAzQmxDLEUsQ0FRS29DLG1CLEdBQXNCLDhFO0FBUjNCcEMsRSxDQVNLNkMseUIsR0FBNEIscUU7QUFUakM3QyxFLENBVUt1RSxzQixHQUF5Qiw2QjtBQVY5QnZFLEUsQ0FXS3VELG9CLEdBQXVCLHdDQUM1QixrQ0FENEIsR0FFNUIseUVBRjRCLEdBRzVCLHlDQUg0QixHQUk1Qiw0RkFKNEIsR0FLNUIsc0M7QUFoQkF2RCxFLENBaUJLeUQsNkIsR0FBZ0MsZ0U7QUFqQnJDekQsRSxDQWtCSzJELDZCLEdBQWdDLDhFQUNyQyxtQjtBQW5CQTNELEUsQ0FvQktzRSxxQixHQUF3QiwwQkFDN0IsZ0dBRDZCLEdBRTdCLHdHQUY2QixHQUc3QiwwQztBQXZCQXRFLEUsQ0F3Qkt3RSxrQixHQUFxQixtRUFDMUIseUQ7QUF6QkF4RSxFLENBMkJLVyxPLEdBQVUsQ0FDYixvRkFEYSxFQUViLGtGQUZhOztBQUliOzs7QUFHQSx5RUFQYSxFQVFiLG1FQVJhLEVBU2IsNkVBVGEsRUFVYixrRkFWYTs7QUFZYjs7OztBQUlBLDZDQUNBLG9EQURBLEdBRUEsaUdBRkEsR0FHQSxvQ0FIQSxHQUlBLGlHQXBCYSxFQXFCYiw0REFyQmEsRUF1QmIscUZBQ0UsMEJBREYsR0FFRSxrRkFGRixHQUdFLGtHQTFCVyxFQTRCYixzR0FDRSxnRkE3QlcsRUE4QmIsMkZBOUJhLEVBK0JiLDBFQS9CYSxDO0FBM0JmWCxFLENBNkRLeUUsSyxHQUFRLENBQ1gscUNBRFcsRUFFWCxnQ0FGVyxFQUdYLG9DQUhXLEVBSVgsd0NBSlcsQztBQTdEYnpFLEUsQ0FvRUtPLFUsR0FBYSxDQUNoQiwwREFEZ0IsRUFFaEIsa0NBQWtDUCxHQUFHb0IscUJBQXJDLEdBQTZELHdDQUY3QyxDOzs7QUF1S3hCc0QsT0FBT0MsT0FBUCxHQUFpQjNFLEVBQWpCIiwiZmlsZSI6IkRiLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEthbG1hbkZpbHRlciBmcm9tICcuL0thbG1hbkZpbHRlcic7XG5cbmxldCBzcWxpdGUzID0gcmVxdWlyZSgnc3FsaXRlMycpLnZlcmJvc2UoKTtcblxuY2xhc3MgRGIge1xuXG4gICAgc3RhdGljIGRhdGFiYXNlX2NvZGVfdmVyc2lvbiA9IDE7XG4gICAgc3RhdGljIHF1ZXJ5X2dldF9hbGxfZmxvb3JwbGFucyA9IFwic2VsZWN0ICogZnJvbSBsYXlvdXRfaW1hZ2VzXCI7XG4gICAgc3RhdGljIHF1ZXJ5X2dldF9kYXRhYmFzZV92ZXJzaW9uID0gXCJzZWxlY3QgdmFsdWUgZnJvbSBzZXR0aW5ncyB3aGVyZSBrZXkgPSAnZGF0YWJhc2VfdmVyc2lvbic7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X2luc2VydF92ZXJzaW9uID0gXCJpbnNlcnQgb3IgaWdub3JlIGludG8gc2V0dGluZ3MgdmFsdWVzICgnZGF0YWJhc2VfdmVyc2lvbicsID8pO1wiO1xuICAgIHN0YXRpYyBxdWVyeV91cGRhdGVfdmVyc2lvbiA9IFwidXBkYXRlIHNldHRpbmdzIHNldCB2YWx1ZSA9ID8gd2hlcmUga2V5ID0gJ2RhdGFiYXNlX3ZlcnNpb24nO1wiO1xuICAgIHN0YXRpYyBxdWVyeV9pbnNlcnRfbGF5b3V0ID0gXCJpbnNlcnQgb3IgaWdub3JlIGludG8gbGF5b3V0X2ltYWdlcyB2YWx1ZXMgKD8sID8sID8pO1wiO1xuICAgIHN0YXRpYyBxdWVyeV91cGRhdGVfbGF5b3V0ID0gXCJ1cGRhdGUgbGF5b3V0X2ltYWdlcyBzZXQgbGF5b3V0X2ltYWdlID0gPywgZmxvb3JfcGxhbl9uYW1lID0gPyB3aGVyZSBpZCA9ID87XCI7XG4gICAgc3RhdGljIHF1ZXJ5X2luc2VydF9zY2FuX3Jlc3VsdHMgPSBcImluc2VydCBvciBpZ25vcmUgaW50byBzY2FuX3Jlc3VsdHMgdmFsdWVzICg/LCA/LCA/LCA/LCA/LCA/LCA/LCA/KTtcIjtcbiAgICBzdGF0aWMgcXVlcnlfZ2V0X3NjYW5fcmVzdWx0cyA9IFwic2VsZWN0ICogZnJvbSBzY2FuX3Jlc3VsdHM7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X2dldF9mb3Jfa2FsbWFuID0gXCJTRUxFQ1Qgcy5mcF9pZCwgcy5hcF9pZCwgcy54LCBzLnksIFwiXG4gICAgKyBcImdyb3VwX2NvbmNhdChzLnZhbHVlKSBgdmFsdWVzYCwgXCJcbiAgICArIFwiY2FzZSB3aGVuIGsua2FsbWFuIGlzIG51bGwgdGhlbiBhdmcocy52YWx1ZSkgZWxzZSBrLmthbG1hbiBlbmQgYGNlc3RgLCBcIlxuICAgICsgXCJrLmthbG1hbiBGUk9NIHNjYW5fcmVzdWx0cyBzIGxlZnQgam9pbiBcIlxuICAgICsgXCJrYWxtYW5fZXN0aW1hdGVzIGsgb24gcy5mcF9pZCA9IGsuZnBfaWQgYW5kIHMuYXBfaWQgPSBrLmFwX2lkIGFuZCBzLnggPSBrLnggYW5kIHMueSA9IGsueSBcIlxuICAgICsgXCJHUk9VUCBCWSBzLmZwX2lkLCBzLmFwX2lkLCBzLngsIHMueTtcIjtcbiAgICBzdGF0aWMgcXVlcnlfaW5zZXJ0X2thbG1hbl9lc3RpbWF0ZXMgPSBcImluc2VydCBvciBpZ25vcmUgaW50byBrYWxtYW5fZXN0aW1hdGVzIHZhbHVlcyAoPywgPywgPywgPywgPyk7XCJcbiAgICBzdGF0aWMgcXVlcnlfdXBkYXRlX2thbG1hbl9lc3RpbWF0ZXMgPSBcInVwZGF0ZSBrYWxtYW5fZXN0aW1hdGVzIHNldCBrYWxtYW4gPSA/IHdoZXJlIGZwX2lkID0gPyBhbmQgYXBfaWQgPSA/IGFuZCBcIlxuICAgICsgXCIgeCA9ID8gYW5kIHkgPSA/O1wiO1xuICAgIHN0YXRpYyBxdWVyeV91cGRhdGVfZmVhdHVyZXMgPSBcImluc2VydCBpbnRvIGZlYXR1cmVzIFwiXG4gICAgKyBcIiBzZWxlY3Qgay5mcF9pZCwgay54LCBrLnksIGsuYXBfaWQgfHwgazEuYXBfaWQgYXMgZmVhdHVyZSwgYWJzKGsua2FsbWFuIC0gazEua2FsbWFuKSBhcyB2YWx1ZSBcIlxuICAgICsgXCIgZnJvbSBrYWxtYW5fZXN0aW1hdGVzIGsgam9pbiBrYWxtYW5fZXN0aW1hdGVzIGsxIG9uIGsuZnBfaWQgPSBrMS5mcF9pZCBhbmQgay54ID0gazEueCBhbmQgay55ID0gazEueSBcIlxuICAgICsgXCIgd2hlcmUgay5rYWxtYW4gIT0gMCBhbmQgazEua2FsbWFuICE9IDA7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X2dldF9mZWF0dXJlcyA9IFwic2VsZWN0IGYuKiwgYWJzKHZhbHVlIC0gOmZlYXR1cmVfdmFsdWU6KSBkaWZmIGZyb20gZmVhdHVyZXMgZiBcIlxuICAgICsgXCIgd2hlcmUgZi5mZWF0dXJlID0gPyBhbmQgZi5mcF9pZCA9ID8gb3JkZXIgYnkgZGlmZiBhc2M7XCI7XG5cbiAgICBzdGF0aWMgY3JlYXRlcyA9IFtcbiAgICAgICAgXCJDUkVBVEUgVEFCTEUgaWYgbm90IGV4aXN0cyBsYXlvdXRfaW1hZ2VzIChpZCBURVhUIFBSSU1BUlkgS0VZLCBsYXlvdXRfaW1hZ2UgVEVYVCk7XCIsXG4gICAgICAgIFwiQ1JFQVRFIFVOSVFVRSBJTkRFWCBpZiBub3QgZXhpc3RzIGxheW91dF9pbWFnZXNfaWRfdWluZGV4IE9OIGxheW91dF9pbWFnZXMgKGlkKTtcIixcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ3JlYXRlIHRoZSBzZXR0aW5ncyB0YWJsZSB3aXRoIGRlZmF1bHQgc2V0dGluZ3NcbiAgICAgICAgICovXG4gICAgICAgIFwiY3JlYXRlIHRhYmxlIGlmIG5vdCBleGlzdHMgc2V0dGluZ3MgKGtleSBURVhUIFBSSU1BUlkgS0VZLCB2YWx1ZSBURVhUKTtcIixcbiAgICAgICAgXCJjcmVhdGUgdW5pcXVlIGluZGV4IGlmIG5vdCBleGlzdHMgc2V0dGluZ3Nfa2V5IG9uIHNldHRpbmdzIChrZXkpO1wiLFxuICAgICAgICBcImluc2VydCBvciBpZ25vcmUgaW50byBzZXR0aW5ncyAoa2V5LCB2YWx1ZSkgdmFsdWVzICgnZGF0YWJhc2VfdmVyc2lvbicsIDApO1wiLFxuICAgICAgICBcImluc2VydCBvciBpZ25vcmUgaW50byBzZXR0aW5ncyAoa2V5LCB2YWx1ZSkgdmFsdWVzICgnZGF0YWJhc2VfY29kZV92ZXJzaW9uJywgMCk7XCIsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGFwX2lkID0gYWNjZXNzIHBvaW50IGlkXG4gICAgICAgICAqIGZwX2lkID0gZmxvb3JwbGFuIGlkXG4gICAgICAgICAqL1xuICAgICAgICBcIkNSRUFURSBUQUJMRSBpZiBub3QgZXhpc3RzIHNjYW5fcmVzdWx0cyBcIiArXG4gICAgICAgIFwiKHNfaWQgSU5URUdFUiwgZnBfaWQgVEVYVCwgYXBfaWQgVEVYVCwgeCBJTlRFR0VSLCBcIiArXG4gICAgICAgIFwieSBJTlRFR0VSLCB2YWx1ZSBSRUFMLCBvcmlnX3ZhbHVlcyBURVhULCBjcmVhdGVkIFRJTUVTVEFNUCBERUZBVUxUIENVUlJFTlRfVElNRVNUQU1QIE5PVCBOVUxMLCBcIiArXG4gICAgICAgIFwiUFJJTUFSWSBLRVkgKHNfaWQsIGZwX2lkLCBhcF9pZCksIFwiICtcbiAgICAgICAgXCJDT05TVFJBSU5UIHNjYW5fcmVzdWx0c19sYXlvdXRfaW1hZ2VzX2lkX2ZrIEZPUkVJR04gS0VZIChmcF9pZCkgUkVGRVJFTkNFUyBsYXlvdXRfaW1hZ2VzIChpZCkpO1wiLFxuICAgICAgICBcImNyZWF0ZSBpbmRleCBpZiBub3QgZXhpc3RzIHhfYW5kX3kgb24gc2Nhbl9yZXN1bHRzICh4LCB5KTtcIixcblxuICAgICAgICBcIkNSRUFURSBUQUJMRSBpZiBub3QgZXhpc3RzIGthbG1hbl9lc3RpbWF0ZXMgKGZwX2lkIFRFWFQsIGFwX2lkIFRFWFQsIHggSU5URUdFUiwgXCJcbiAgICAgICAgKyBcInkgSU5URUdFUiwga2FsbWFuIFJFQUwsIFwiXG4gICAgICAgICsgXCJDT05TVFJBSU5UIGthbG1hbl9lc3RpbWF0ZXNfZnBfaWRfYXBfaWRfeF95X3BrIFBSSU1BUlkgS0VZIChmcF9pZCwgYXBfaWQsIHgsIHkpLFwiXG4gICAgICAgICsgXCJGT1JFSUdOIEtFWSAoYXBfaWQsIGZwX2lkLCB4LCB5KSBSRUZFUkVOQ0VTIHNjYW5fcmVzdWx0cyAoYXBfaWQsIGZwX2lkLCB4LCB5KSBPTiBERUxFVEUgQ0FTQ0FERSlcIixcblxuICAgICAgICBcIkNSRUFURSBUQUJMRSBpZiBub3QgZXhpc3RzIGZlYXR1cmVzIChmcF9pZCBURVhULCB4IElOVEVHRVIsIHkgSU5URUdFUiwgZmVhdHVyZSBURVhULCB2YWx1ZSBSRUFMLCBcIlxuICAgICAgICArIFwiIENPTlNUUkFJTlQgZmVhdHVyZXNfZnBfaWRfeF95X2ZlYXR1cmVfcGsgUFJJTUFSWSBLRVkgKGZwX2lkLCB4LCB5LCBmZWF0dXJlKSk7XCIsXG4gICAgICAgIFwiQ1JFQVRFIFVOSVFVRSBJTkRFWCBpZiBub3QgZXhpc3RzIGZlYXR1cmVzX2ZlYXR1cmVfaW5kZXgxIE9OIGZlYXR1cmVzKGZwX2lkLGZlYXR1cmUseCx5KTtcIixcbiAgICAgICAgXCJDUkVBVEUgSU5ERVggaWYgbm90IGV4aXN0cyBmZWF0dXJlc19mZWF0dXJlX2luZGV4MiBPTiBmZWF0dXJlcyhmZWF0dXJlKTtcIlxuICAgIF07XG5cbiAgICBzdGF0aWMgZHJvcHMgPSBbXG4gICAgICAgIFwiZHJvcCB0YWJsZSBpZiBleGlzdHMgbGF5b3V0X2ltYWdlcztcIixcbiAgICAgICAgXCJkcm9wIHRhYmxlIGlmIGV4aXN0cyBzZXR0aW5ncztcIixcbiAgICAgICAgXCJkcm9wIHRhYmxlIGlmIGV4aXN0cyBzY2FuX3Jlc3VsdHM7XCIsXG4gICAgICAgIFwiZHJvcCB0YWJsZSBpZiBleGlzdHMga2FsbWFuX2VzdGltYXRlcztcIlxuICAgIF07XG5cbiAgICBzdGF0aWMgbWlncmF0aW9uMSA9IFtcbiAgICAgICAgXCJBTFRFUiBUQUJMRSBsYXlvdXRfaW1hZ2VzIEFERCBmbG9vcl9wbGFuX25hbWUgVEVYVCBOVUxMO1wiLFxuICAgICAgICBcInVwZGF0ZSBzZXR0aW5ncyBzZXQgdmFsdWUgPSAnXCIgKyBEYi5kYXRhYmFzZV9jb2RlX3ZlcnNpb24gKyBcIicgd2hlcmUga2V5ID0gJ2RhdGFiYXNlX2NvZGVfdmVyc2lvbic7XCJcbiAgICBdO1xuXG4gICAgY29uc3RydWN0b3IobG9nKXtcbiAgICAgICAgdGhpcy5sb2cgPSBsb2c7XG4gICAgICAgIHRoaXMuZGIgPSBuZXcgc3FsaXRlMy5EYXRhYmFzZSgnZGIuc3FsaXRlMycpO1xuICAgICAgICB0aGlzLmxvZy5kZWJ1ZyhcIkRiLmNvbnN0cnVjdG9yXCIpO1xuICAgIH1cblxuICAgIGdldERhdGFiYXNlKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmRiO1xuICAgIH1cblxuICAgIGRvVXBncmFkZShkYXRhYmFzZUNvZGVWZXJzaW9uKSB7XG4gICAgICAgIHRoaXMubG9nLmRlYnVnKFwiRGIuZG9VcGdyYWRlXCIpO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBzd2l0Y2goZGF0YWJhc2VDb2RlVmVyc2lvbil7XG4gICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgZGIuc2VyaWFsaXplKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBEYi5taWdyYXRpb24xLmZvckVhY2goZnVuY3Rpb24obWlnKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRiLnJ1bihtaWcpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgdGhlIHNxbGl0ZSB0YWJsZXNcbiAgICAgKi9cbiAgICBjcmVhdGVUYWJsZXMoKSB7XG4gICAgICAgIHRoaXMubG9nLmRlYnVnKFwiRGIuY3JlYXRlVGFibGVzXCIpO1xuICAgICAgICBsZXQgY3JlYXRlcyA9IERiLmNyZWF0ZXM7XG4gICAgICAgIGxldCBkYiA9IHRoaXMuZGI7XG5cbiAgICAgICAgZGIuc2VyaWFsaXplKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY3JlYXRlcy5mb3JFYWNoKGZ1bmN0aW9uKGNyZWF0ZSl7XG4gICAgICAgICAgICAgICAgZGIucnVuKGNyZWF0ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IGRhdGFiYXNlQ29kZVZlcnNpb24gPSAwO1xuXG4gICAgICAgIGRiLmFsbChcInNlbGVjdCAqIGZyb20gc2V0dGluZ3NcIiwgKGVyciwgcm93cykgPT4ge1xuICAgICAgICAgICAgcm93cy5mb3JFYWNoKGZ1bmN0aW9uKHJvdyl7XG4gICAgICAgICAgICAgICAgc3dpdGNoKHJvdy5rZXkpe1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiZGF0YWJhc2VfY29kZV92ZXJzaW9uXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhYmFzZUNvZGVWZXJzaW9uID0gTnVtYmVyKHJvdy52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmKGRhdGFiYXNlQ29kZVZlcnNpb24gPCBEYi5kYXRhYmFzZV9jb2RlX3ZlcnNpb24pe1xuICAgICAgICAgICAgICAgIHRoaXMuZG9VcGdyYWRlKGRhdGFiYXNlQ29kZVZlcnNpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXRGbG9vclBsYW5zKGNiKSB7XG4gICAgICAgIHRoaXMubG9nLmRlYnVnKFwiRGIuZ2V0Rmxvb3JQbGFuc1wiKTtcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgZGIuYWxsKERiLnF1ZXJ5X2dldF9hbGxfZmxvb3JwbGFucywgY2IpO1xuICAgIH1cblxuICAgIGdldERhdGFiYXNlVmVyc2lvbihjYikge1xuICAgICAgICB0aGlzLmxvZy5kZWJ1ZyhcIkRiLmdldERhdGFiYXNlVmVyc2lvblwiKTtcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgZGIuYWxsKERiLnF1ZXJ5X2dldF9kYXRhYmFzZV92ZXJzaW9uLCBjYik7XG4gICAgfVxuXG4gICAgdXBkYXRlRGF0YWJhc2UoZGF0YSwgY2IpIHtcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoXCJEYi51cGRhdGVEYXRhYmFzZVwiKTtcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgbGV0IHN0bXQgPSBkYi5wcmVwYXJlKERiLnF1ZXJ5X2luc2VydF92ZXJzaW9uKTtcbiAgICAgICAgc3RtdC5ydW4oZGF0YS5kYXRhYmFzZVZlcnNpb24pO1xuICAgICAgICBzdG10LmZpbmFsaXplKCk7XG5cbiAgICAgICAgc3RtdCA9IGRiLnByZXBhcmUoRGIucXVlcnlfdXBkYXRlX3ZlcnNpb24pO1xuICAgICAgICBzdG10LnJ1bihkYXRhLmRhdGFiYXNlVmVyc2lvbik7XG4gICAgICAgIHN0bXQuZmluYWxpemUoKTtcblxuICAgICAgICBpZih0eXBlb2YoZGF0YS5sYXlvdXRfaW1hZ2VzKSAhPSBcInVuZGVmaW5lZFwiICYmIGRhdGEubGF5b3V0X2ltYWdlcy5sZW5ndGggPiAwKXtcbiAgICAgICAgICAgIHN0bXQgPSBkYi5wcmVwYXJlKERiLnF1ZXJ5X2luc2VydF9sYXlvdXQpO1xuICAgICAgICAgICAgbGV0IHVwc3RtdCA9IGRiLnByZXBhcmUoRGIucXVlcnlfdXBkYXRlX2xheW91dCk7XG5cbiAgICAgICAgICAgIGRhdGEubGF5b3V0X2ltYWdlcy5mb3JFYWNoKGZ1bmN0aW9uKGVsKXtcbiAgICAgICAgICAgICAgICBsZXQgaWQgPSBlbC5pZDtcbiAgICAgICAgICAgICAgICBsZXQgZmxvb3JfcGxhbl9uYW1lID0gZWwuZmxvb3JwbGFubmFtZTtcbiAgICAgICAgICAgICAgICBsZXQgc3RyaW5nZGF0YSA9IEpTT04uc3RyaW5naWZ5KGVsKTtcbiAgICAgICAgICAgICAgICBzdG10LnJ1bihpZCwgc3RyaW5nZGF0YSwgZmxvb3JfcGxhbl9uYW1lKTtcbiAgICAgICAgICAgICAgICB1cHN0bXQucnVuKHN0cmluZ2RhdGEsIGZsb29yX3BsYW5fbmFtZSwgaWQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzdG10LmZpbmFsaXplKCk7XG4gICAgICAgICAgICB1cHN0bXQuZmluYWxpemUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNiKCk7XG4gICAgfVxuXG4gICAgc2F2ZVJlYWRpbmdzKHBheWxvYWQsIGNiKXtcbiAgICAgICAgbGV0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBsb2cuZGVidWcoXCJEYi5zYXZlUmVhZGluZ3NcIik7XG5cbiAgICAgICAgbGV0IHN0bXQgPSBkYi5wcmVwYXJlKERiLnF1ZXJ5X2luc2VydF9zY2FuX3Jlc3VsdHMpO1xuXG4gICAgICAgIHBheWxvYWQuZm9yRWFjaCgoZWwpID0+IHtcbiAgICAgICAgICAgIGxldCBzX2lkID0gTnVtYmVyKGVsLnNfaWQpO1xuICAgICAgICAgICAgbGV0IGZwX2lkID0gZWwuZnBfaWQ7XG4gICAgICAgICAgICBsZXQgYXBfaWQgPSBlbC5hcF9pZDtcbiAgICAgICAgICAgIGxldCB4ID0gTnVtYmVyKGVsLngpO1xuICAgICAgICAgICAgbGV0IHkgPSBOdW1iZXIoZWwueSk7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSBOdW1iZXIoZWwudmFsdWUpO1xuICAgICAgICAgICAgbGV0IG9yaWdfdmFsdWVzID0gZWwub3JpZ192YWx1ZXM7XG4gICAgICAgICAgICBsZXQgY3JlYXRlZCA9IGVsLmNyZWF0ZWQ7XG4gICAgICAgICAgICBzdG10LnJ1bihzX2lkLCBmcF9pZCwgYXBfaWQsIHgsIHksIHZhbHVlLCBvcmlnX3ZhbHVlcywgY3JlYXRlZCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHN0bXQuZmluYWxpemUoKTtcbiAgICAgICAgdGhpcy51cGRhdGVLYWxtYW4oKTtcbiAgICB9XG5cbiAgICB1cGRhdGVLYWxtYW4oKXtcbiAgICAgICAgbGV0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBsZXQga2FsbWFuID0ge307XG5cbiAgICAgICAgZGIuYWxsKERiLnF1ZXJ5X2dldF9mb3Jfa2FsbWFuLCAoZXJyLCByb3dzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpbnNlcnQgPSBkYi5wcmVwYXJlKERiLnF1ZXJ5X2luc2VydF9rYWxtYW5fZXN0aW1hdGVzKTtcbiAgICAgICAgICAgIGNvbnN0IHVwZGF0ZSA9IGRiLnByZXBhcmUoRGIucXVlcnlfdXBkYXRlX2thbG1hbl9lc3RpbWF0ZXMpO1xuICAgICAgICAgICAgbG9nLmxvZyhlcnIpO1xuICAgICAgICAgICAgaWYoZXJyKSByZXR1cm47XG5cbiAgICAgICAgICAgIGxldCBkb25lID0gMDtcbiAgICAgICAgICAgIHJvd3MuZm9yRWFjaCgocm93KSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGsgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mKGthbG1hbltyb3cuZnBfaWQgKyByb3cuYXBfaWQgKyByb3cueCArIHJvdy55XSkgPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgICAgICBrYWxtYW5bcm93LmZwX2lkICsgcm93LmFwX2lkICsgcm93LnggKyByb3cueV0gPSBuZXcgS2FsbWFuRmlsdGVyKHJvdy5jZXN0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgayA9IGthbG1hbltyb3cuZnBfaWQgKyByb3cuYXBfaWQgKyByb3cueCArIHJvdy55XTtcblxuICAgICAgICAgICAgICAgIGxldCB2YWx1ZXMgPSByb3cudmFsdWVzXG4gICAgICAgICAgICAgICAgICAgIC5zcGxpdChcIixcIilcbiAgICAgICAgICAgICAgICAgICAgLm1hcCgoZWwpID0+IHsgcmV0dXJuIE51bWJlcihlbCk7IH0pO1xuXG4gICAgICAgICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHZhbHVlcy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICAgICAgICAgIGsuYWRkU2FtcGxlKHZhbHVlc1tpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGluc2VydC5ydW4ocm93LmZwX2lkLCByb3cuYXBfaWQsIHJvdy54LCByb3cueSwgay5nZXRFc3RpbWF0ZSgpLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZS5ydW4oay5nZXRFc3RpbWF0ZSgpLCByb3cuZnBfaWQsIHJvdy5hcF9pZCwgcm93LngsIHJvdy55LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb25lKys7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihkb25lID49IHJvd3MubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnNlcnQuZmluYWxpemUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGUuZmluYWxpemUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYi5leGVjKFwiZGVsZXRlIGZyb20gZmVhdHVyZXNcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYi5leGVjKERiLnF1ZXJ5X3VwZGF0ZV9mZWF0dXJlcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IERiOyJdfQ==
//# sourceMappingURL=Db.js.map
