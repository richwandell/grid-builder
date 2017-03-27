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

Db.database_code_version = 3;
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
Db.query_update_features = "insert into features select s.fp_id, s.x, s.y, s.ap_id || s1.ap_id as feature," + " abs(s.value - s1.value) as value, s.s_id from scan_results s join" + " scan_results s1 on s.fp_id = s1.fp_id and s.x = s1.x and s.y = s1.y and s.ap_id < s1.ap_id" + " and s.s_id = s1.s_id where s.fp_id = ? and s1.fp_id = ?;";
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


module.exports = Db;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRiLmVzNiJdLCJuYW1lcyI6WyJzcWxpdGUzIiwicmVxdWlyZSIsInZlcmJvc2UiLCJEYiIsImxvZyIsImRiIiwiRGF0YWJhc2UiLCJkZWJ1ZyIsImRhdGFiYXNlQ29kZVZlcnNpb24iLCJzZXJpYWxpemUiLCJtaWdyYXRpb24xIiwiZm9yRWFjaCIsIm1pZyIsInJ1biIsImNyZWF0ZVRhYmxlcyIsIm1pZ3JhdGlvbjIiLCJtaWdyYXRpb24zIiwiY3JlYXRlcyIsImNyZWF0ZSIsImFsbCIsImVyciIsInJvd3MiLCJyb3ciLCJrZXkiLCJOdW1iZXIiLCJ2YWx1ZSIsImRhdGFiYXNlX2NvZGVfdmVyc2lvbiIsImRvVXBncmFkZSIsImZwX2lkIiwiY2IiLCJxdWVyeV9nZXRfc2Nhbm5lZF9jb29yZHMiLCJxdWVyeV9nZXRfYWxsX2Zsb29ycGxhbnMiLCJxdWVyeV9nZXRfZGF0YWJhc2VfdmVyc2lvbiIsImRhdGEiLCJzdG10IiwicHJlcGFyZSIsInF1ZXJ5X2luc2VydF92ZXJzaW9uIiwiZGF0YWJhc2VWZXJzaW9uIiwiZmluYWxpemUiLCJxdWVyeV91cGRhdGVfdmVyc2lvbiIsImxheW91dF9pbWFnZXMiLCJsZW5ndGgiLCJxdWVyeV9pbnNlcnRfbGF5b3V0IiwidXBzdG10IiwicXVlcnlfdXBkYXRlX2xheW91dCIsImVsIiwiaWQiLCJmbG9vcl9wbGFuX25hbWUiLCJmbG9vcnBsYW5uYW1lIiwic3RyaW5nZGF0YSIsIkpTT04iLCJzdHJpbmdpZnkiLCJwYXlsb2FkIiwicXVlcnlfaW5zZXJ0X3NjYW5fcmVzdWx0cyIsImZpbmlzaGVkIiwiZ2V0IiwicXVlcnlfZ2V0X3NjYW5faWQiLCJxdWVyeV91cGRhdGVfc2Nhbl9pZCIsInNfaWQiLCJhcF9pZCIsIngiLCJ5Iiwib3JpZ192YWx1ZXMiLCJjcmVhdGVkIiwidXBkYXRlS2FsbWFuIiwia2FsbWFuIiwicXVlcnlfZ2V0X2Zvcl9rYWxtYW4iLCJpbnNlcnQiLCJxdWVyeV9pbnNlcnRfa2FsbWFuX2VzdGltYXRlcyIsInVwZGF0ZSIsInF1ZXJ5X3VwZGF0ZV9rYWxtYW5fZXN0aW1hdGVzIiwiZXJyb3IiLCJkb25lIiwiayIsImNlc3QiLCJ2YWx1ZXMiLCJzcGxpdCIsIm1hcCIsImkiLCJhZGRTYW1wbGUiLCJnZXRFc3RpbWF0ZSIsInF1ZXJ5X3VwZGF0ZV9mZWF0dXJlcyIsInF1ZXJ5X2dldF9zY2FuX3Jlc3VsdHMiLCJxdWVyeV91cGRhdGVfb2xkZXN0X2ZlYXR1cmVzIiwicXVlcnlfZ2V0X2ZlYXR1cmVzIiwicXVlcnlfZ2V0X21pbl9zaWQiLCJkcm9wcyIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTs7Ozs7Ozs7QUFFQSxJQUFJQSxVQUFVQyxRQUFRLFNBQVIsRUFBbUJDLE9BQW5CLEVBQWQ7O0lBRU1DLEU7QUFxR0YsZ0JBQVlDLEdBQVosRUFBZ0I7QUFBQTs7QUFDWixhQUFLQSxHQUFMLEdBQVdBLEdBQVg7QUFDQSxhQUFLQyxFQUFMLEdBQVUsSUFBSUwsUUFBUU0sUUFBWixDQUFxQixZQUFyQixDQUFWO0FBQ0EsYUFBS0YsR0FBTCxDQUFTRyxLQUFULENBQWUsZ0JBQWY7QUFDSDs7OztzQ0FFWTtBQUNULG1CQUFPLEtBQUtGLEVBQVo7QUFDSDs7O2tDQUVTRyxtQixFQUFxQjtBQUFBOztBQUMzQixpQkFBS0osR0FBTCxDQUFTRyxLQUFULENBQWUsY0FBZjtBQUNBLGdCQUFJRixLQUFLLEtBQUtBLEVBQWQ7QUFDQSxvQkFBT0csbUJBQVA7QUFDSSxxQkFBSyxDQUFMO0FBQ0lILHVCQUFHSSxTQUFILENBQWEsWUFBTTtBQUNmTiwyQkFBR08sVUFBSCxDQUFjQyxPQUFkLENBQXNCLFVBQUNDLEdBQUQsRUFBUztBQUMzQlAsK0JBQUdRLEdBQUgsQ0FBT0QsR0FBUDtBQUNILHlCQUZEO0FBR0EsOEJBQUtFLFlBQUw7QUFDSCxxQkFMRDtBQU1BOztBQUVKLHFCQUFLLENBQUw7QUFDSVQsdUJBQUdJLFNBQUgsQ0FBYSxZQUFNO0FBQ2ZOLDJCQUFHWSxVQUFILENBQWNKLE9BQWQsQ0FB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QW9DS2MsTyxHQUFVLENBQ2Isb0ZBRGEsRUFFYixrRkFGYTs7QUFJYjs7O0FBR0EseUVBUGEsRUFRYixtRUFSYSxFQVNiLDZFQVRhLEVBVWIsa0ZBVmE7O0FBWWI7Ozs7QUFJQSw2Q0FDQSxvREFEQSxHQUVBLGlHQUZBLEdBR0Esb0NBSEEsR0FJQSxpR0FwQmEsRUFxQmIsNERBckJhLEVBdUJiLHFGQUNFLDBCQURGLEdBRUUsa0ZBRkYsR0FHRSxrR0ExQlcsRUE0QmIsc0dBQ0UsZ0ZBN0JXLEVBOEJiLDJGQTlCYSxFQStCYiwwRUEvQmEsQztBQXBDZmQsRSxDQXNFS21GLEssR0FBUSxDQUNYLHFDQURXLEVBRVgsZ0NBRlcsRUFHWCxvQ0FIVyxFQUlYLHdDQUpXLEM7QUF0RWJuRixFLENBNkVLTyxVLEdBQWEsQ0FDaEIsMERBRGdCLEVBRWhCLGtDQUFrQ1AsR0FBR3VCLHFCQUFyQyxHQUE2RCx3Q0FGN0MsQztBQTdFbEJ2QixFLENBa0ZLWSxVLEdBQWEsQ0FDaEIseUNBRGdCLEVBRWhCLHFDQUZnQixFQUdoQixxQ0FIZ0IsRUFJaEIseUdBQ0UsMkZBTGMsRUFNaEIsMkZBTmdCLEVBT2hCLHFIQVBnQixFQVFoQixzQkFSZ0IsRUFTaEIsOENBVGdCLEVBVWhCLDREQVZnQixFQVdoQixrQ0FBa0NaLEdBQUd1QixxQkFBckMsR0FBNkQsd0NBWDdDLEM7QUFsRmxCdkIsRSxDQWdHS2EsVSxHQUFhLENBQ2hCLHdEQURnQixFQUVoQixrQ0FBa0NiLEdBQUd1QixxQkFBckMsR0FBNkQsd0NBRjdDLEM7OztBQTBNeEI2RCxPQUFPQyxPQUFQLEdBQWlCckYsRUFBakIiLCJmaWxlIjoiRGIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgS2FsbWFuRmlsdGVyIGZyb20gJy4vS2FsbWFuRmlsdGVyJztcblxubGV0IHNxbGl0ZTMgPSByZXF1aXJlKCdzcWxpdGUzJykudmVyYm9zZSgpO1xuXG5jbGFzcyBEYiB7XG5cbiAgICBzdGF0aWMgZGF0YWJhc2VfY29kZV92ZXJzaW9uID0gMztcbiAgICBzdGF0aWMgcXVlcnlfZ2V0X2FsbF9mbG9vcnBsYW5zID0gXCJzZWxlY3QgKiBmcm9tIGxheW91dF9pbWFnZXNcIjtcbiAgICBzdGF0aWMgcXVlcnlfZ2V0X2RhdGFiYXNlX3ZlcnNpb24gPSBcInNlbGVjdCB2YWx1ZSBmcm9tIHNldHRpbmdzIHdoZXJlIGtleSA9ICdkYXRhYmFzZV92ZXJzaW9uJztcIjtcbiAgICBzdGF0aWMgcXVlcnlfaW5zZXJ0X3ZlcnNpb24gPSBcImluc2VydCBvciBpZ25vcmUgaW50byBzZXR0aW5ncyB2YWx1ZXMgKCdkYXRhYmFzZV92ZXJzaW9uJywgPyk7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X3VwZGF0ZV92ZXJzaW9uID0gXCJ1cGRhdGUgc2V0dGluZ3Mgc2V0IHZhbHVlID0gPyB3aGVyZSBrZXkgPSAnZGF0YWJhc2VfdmVyc2lvbic7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X2luc2VydF9sYXlvdXQgPSBcImluc2VydCBvciBpZ25vcmUgaW50byBsYXlvdXRfaW1hZ2VzIHZhbHVlcyAoPywgPywgPyk7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X3VwZGF0ZV9sYXlvdXQgPSBcInVwZGF0ZSBsYXlvdXRfaW1hZ2VzIHNldCBsYXlvdXRfaW1hZ2UgPSA/LCBmbG9vcl9wbGFuX25hbWUgPSA/IHdoZXJlIGlkID0gPztcIjtcbiAgICBzdGF0aWMgcXVlcnlfaW5zZXJ0X3NjYW5fcmVzdWx0cyA9IFwiaW5zZXJ0IGludG8gc2Nhbl9yZXN1bHRzIHZhbHVlcyAoPywgPywgPywgPywgPywgPywgPywgPyk7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X2dldF9zY2FuX3Jlc3VsdHMgPSBcInNlbGVjdCAqIGZyb20gc2Nhbl9yZXN1bHRzO1wiO1xuICAgIHN0YXRpYyBxdWVyeV9nZXRfZm9yX2thbG1hbiA9IFwiU0VMRUNUIHMuZnBfaWQsIHMuYXBfaWQsIHMueCwgcy55LCBcIlxuICAgICsgXCJncm91cF9jb25jYXQocy52YWx1ZSkgYHZhbHVlc2AsIFwiXG4gICAgKyBcImNhc2Ugd2hlbiBrLmthbG1hbiBpcyBudWxsIHRoZW4gYXZnKHMudmFsdWUpIGVsc2Ugay5rYWxtYW4gZW5kIGBjZXN0YCwgXCJcbiAgICArIFwiay5rYWxtYW4gRlJPTSBzY2FuX3Jlc3VsdHMgcyBsZWZ0IGpvaW4gXCJcbiAgICArIFwia2FsbWFuX2VzdGltYXRlcyBrIG9uIHMuZnBfaWQgPSBrLmZwX2lkIGFuZCBzLmFwX2lkID0gay5hcF9pZCBhbmQgcy54ID0gay54IGFuZCBzLnkgPSBrLnkgXCJcbiAgICArIFwiIHdoZXJlIHMuZnBfaWQgPSA/IEdST1VQIEJZIHMuZnBfaWQsIHMuYXBfaWQsIHMueCwgcy55O1wiO1xuICAgIHN0YXRpYyBxdWVyeV9pbnNlcnRfa2FsbWFuX2VzdGltYXRlcyA9IFwiaW5zZXJ0IG9yIGlnbm9yZSBpbnRvIGthbG1hbl9lc3RpbWF0ZXMgdmFsdWVzICg/LCA/LCA/LCA/LCA/KTtcIlxuICAgIHN0YXRpYyBxdWVyeV91cGRhdGVfa2FsbWFuX2VzdGltYXRlcyA9IFwidXBkYXRlIGthbG1hbl9lc3RpbWF0ZXMgc2V0IGthbG1hbiA9ID8gd2hlcmUgZnBfaWQgPSA/IGFuZCBhcF9pZCA9ID8gYW5kIFwiXG4gICAgKyBcIiB4ID0gPyBhbmQgeSA9ID87XCI7XG4gICAgc3RhdGljIHF1ZXJ5X3VwZGF0ZV9mZWF0dXJlcyA9IFwiaW5zZXJ0IGludG8gZmVhdHVyZXMgc2VsZWN0IHMuZnBfaWQsIHMueCwgcy55LCBzLmFwX2lkIHx8IHMxLmFwX2lkIGFzIGZlYXR1cmUsXCJcbiAgICArIFwiIGFicyhzLnZhbHVlIC0gczEudmFsdWUpIGFzIHZhbHVlLCBzLnNfaWQgZnJvbSBzY2FuX3Jlc3VsdHMgcyBqb2luXCJcbiAgICArIFwiIHNjYW5fcmVzdWx0cyBzMSBvbiBzLmZwX2lkID0gczEuZnBfaWQgYW5kIHMueCA9IHMxLnggYW5kIHMueSA9IHMxLnkgYW5kIHMuYXBfaWQgPCBzMS5hcF9pZFwiXG4gICAgKyBcIiBhbmQgcy5zX2lkID0gczEuc19pZCB3aGVyZSBzLmZwX2lkID0gPyBhbmQgczEuZnBfaWQgPSA/O1wiO1xuICAgIHN0YXRpYyBxdWVyeV91cGRhdGVfb2xkZXN0X2ZlYXR1cmVzID0gXCJzZWxlY3Qgay5mcF9pZCwgay54LCBrLnksIGsuYXBfaWQgfHwgazEuYXBfaWQgYXMgZmVhdHVyZSwgXCJcbiAgICArIFwiIGFicyhrLmthbG1hbiAtIGsxLmthbG1hbikgYXMgdmFsdWUsIDpzY2FuX2lkOiBzX2lkIGZyb20ga2FsbWFuX2VzdGltYXRlcyBrIGpvaW4gXCJcbiAgICArIFwiIGthbG1hbl9lc3RpbWF0ZXMgazEgb24gay5mcF9pZCA9IGsxLmZwX2lkIGFuZCBrLnggPSBrMS54IGFuZCBrLnkgPSBrMS55IGFuZCBrLmFwX2lkIDwgazEuYXBfaWQgd2hlcmVcIlxuICAgICsgXCIgay5rYWxtYW4gIT0gMCBhbmQgazEua2FsbWFuICE9IDAgYW5kIGsuZnBfaWQgPSA/IGFuZCBrMS5mcF9pZCA9ID87XCI7XG4gICAgc3RhdGljIHF1ZXJ5X2dldF9mZWF0dXJlcyA9IFwic2VsZWN0IGYuKiwgYWJzKHZhbHVlIC0gOmZlYXR1cmVfdmFsdWU6KSBkaWZmIGZyb20gZmVhdHVyZXMgZiBcIlxuICAgICsgXCIgd2hlcmUgZi5mZWF0dXJlID0gPyBhbmQgZi5mcF9pZCA9ID8gb3JkZXIgYnkgZGlmZiBhc2M7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X2dldF9zY2FubmVkX2Nvb3JkcyA9IFwic2VsZWN0IGNvdW50KCopIGFzIG51bV9mZWF0dXJlcywgeCwgeSBmcm9tIGZlYXR1cmVzIHdoZXJlIGZwX2lkID0gPyBcIlxuICAgICsgXCIgZ3JvdXAgYnkgeCwgeTtcIjtcbiAgICBzdGF0aWMgcXVlcnlfZ2V0X21pbl9zaWQgPSBcInNlbGVjdCBtaW4oc19pZCkgZnJvbSBmZWF0dXJlcyB3aGVyZSBmcF9pZCA9ID9cIjtcbiAgICBzdGF0aWMgcXVlcnlfZ2V0X3NjYW5faWQgPSBcInNlbGVjdCB2YWx1ZSArIDEgYXMgdmFsdWUgZnJvbSBzZXR0aW5ncyB3aGVyZSBrZXkgPSAnc2Nhbl9pZCc7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X3VwZGF0ZV9zY2FuX2lkID0gXCJ1cGRhdGUgc2V0dGluZ3Mgc2V0IHZhbHVlID0gdmFsdWUgKyAxIHdoZXJlIGtleSA9ICdzY2FuX2lkJztcIjtcblxuICAgIHN0YXRpYyBjcmVhdGVzID0gW1xuICAgICAgICBcIkNSRUFURSBUQUJMRSBpZiBub3QgZXhpc3RzIGxheW91dF9pbWFnZXMgKGlkIFRFWFQgUFJJTUFSWSBLRVksIGxheW91dF9pbWFnZSBURVhUKTtcIixcbiAgICAgICAgXCJDUkVBVEUgVU5JUVVFIElOREVYIGlmIG5vdCBleGlzdHMgbGF5b3V0X2ltYWdlc19pZF91aW5kZXggT04gbGF5b3V0X2ltYWdlcyAoaWQpO1wiLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDcmVhdGUgdGhlIHNldHRpbmdzIHRhYmxlIHdpdGggZGVmYXVsdCBzZXR0aW5nc1xuICAgICAgICAgKi9cbiAgICAgICAgXCJjcmVhdGUgdGFibGUgaWYgbm90IGV4aXN0cyBzZXR0aW5ncyAoa2V5IFRFWFQgUFJJTUFSWSBLRVksIHZhbHVlIFRFWFQpO1wiLFxuICAgICAgICBcImNyZWF0ZSB1bmlxdWUgaW5kZXggaWYgbm90IGV4aXN0cyBzZXR0aW5nc19rZXkgb24gc2V0dGluZ3MgKGtleSk7XCIsXG4gICAgICAgIFwiaW5zZXJ0IG9yIGlnbm9yZSBpbnRvIHNldHRpbmdzIChrZXksIHZhbHVlKSB2YWx1ZXMgKCdkYXRhYmFzZV92ZXJzaW9uJywgMCk7XCIsXG4gICAgICAgIFwiaW5zZXJ0IG9yIGlnbm9yZSBpbnRvIHNldHRpbmdzIChrZXksIHZhbHVlKSB2YWx1ZXMgKCdkYXRhYmFzZV9jb2RlX3ZlcnNpb24nLCAwKTtcIixcblxuICAgICAgICAvKipcbiAgICAgICAgICogYXBfaWQgPSBhY2Nlc3MgcG9pbnQgaWRcbiAgICAgICAgICogZnBfaWQgPSBmbG9vcnBsYW4gaWRcbiAgICAgICAgICovXG4gICAgICAgIFwiQ1JFQVRFIFRBQkxFIGlmIG5vdCBleGlzdHMgc2Nhbl9yZXN1bHRzIFwiICtcbiAgICAgICAgXCIoc19pZCBJTlRFR0VSLCBmcF9pZCBURVhULCBhcF9pZCBURVhULCB4IElOVEVHRVIsIFwiICtcbiAgICAgICAgXCJ5IElOVEVHRVIsIHZhbHVlIFJFQUwsIG9yaWdfdmFsdWVzIFRFWFQsIGNyZWF0ZWQgVElNRVNUQU1QIERFRkFVTFQgQ1VSUkVOVF9USU1FU1RBTVAgTk9UIE5VTEwsIFwiICtcbiAgICAgICAgXCJQUklNQVJZIEtFWSAoc19pZCwgZnBfaWQsIGFwX2lkKSwgXCIgK1xuICAgICAgICBcIkNPTlNUUkFJTlQgc2Nhbl9yZXN1bHRzX2xheW91dF9pbWFnZXNfaWRfZmsgRk9SRUlHTiBLRVkgKGZwX2lkKSBSRUZFUkVOQ0VTIGxheW91dF9pbWFnZXMgKGlkKSk7XCIsXG4gICAgICAgIFwiY3JlYXRlIGluZGV4IGlmIG5vdCBleGlzdHMgeF9hbmRfeSBvbiBzY2FuX3Jlc3VsdHMgKHgsIHkpO1wiLFxuXG4gICAgICAgIFwiQ1JFQVRFIFRBQkxFIGlmIG5vdCBleGlzdHMga2FsbWFuX2VzdGltYXRlcyAoZnBfaWQgVEVYVCwgYXBfaWQgVEVYVCwgeCBJTlRFR0VSLCBcIlxuICAgICAgICArIFwieSBJTlRFR0VSLCBrYWxtYW4gUkVBTCwgXCJcbiAgICAgICAgKyBcIkNPTlNUUkFJTlQga2FsbWFuX2VzdGltYXRlc19mcF9pZF9hcF9pZF94X3lfcGsgUFJJTUFSWSBLRVkgKGZwX2lkLCBhcF9pZCwgeCwgeSksXCJcbiAgICAgICAgKyBcIkZPUkVJR04gS0VZIChhcF9pZCwgZnBfaWQsIHgsIHkpIFJFRkVSRU5DRVMgc2Nhbl9yZXN1bHRzIChhcF9pZCwgZnBfaWQsIHgsIHkpIE9OIERFTEVURSBDQVNDQURFKVwiLFxuXG4gICAgICAgIFwiQ1JFQVRFIFRBQkxFIGlmIG5vdCBleGlzdHMgZmVhdHVyZXMgKGZwX2lkIFRFWFQsIHggSU5URUdFUiwgeSBJTlRFR0VSLCBmZWF0dXJlIFRFWFQsIHZhbHVlIFJFQUwsIFwiXG4gICAgICAgICsgXCIgQ09OU1RSQUlOVCBmZWF0dXJlc19mcF9pZF94X3lfZmVhdHVyZV9wayBQUklNQVJZIEtFWSAoZnBfaWQsIHgsIHksIGZlYXR1cmUpKTtcIixcbiAgICAgICAgXCJDUkVBVEUgVU5JUVVFIElOREVYIGlmIG5vdCBleGlzdHMgZmVhdHVyZXNfZmVhdHVyZV9pbmRleDEgT04gZmVhdHVyZXMoZnBfaWQsZmVhdHVyZSx4LHkpO1wiLFxuICAgICAgICBcIkNSRUFURSBJTkRFWCBpZiBub3QgZXhpc3RzIGZlYXR1cmVzX2ZlYXR1cmVfaW5kZXgyIE9OIGZlYXR1cmVzKGZlYXR1cmUpO1wiXG4gICAgXTtcblxuICAgIHN0YXRpYyBkcm9wcyA9IFtcbiAgICAgICAgXCJkcm9wIHRhYmxlIGlmIGV4aXN0cyBsYXlvdXRfaW1hZ2VzO1wiLFxuICAgICAgICBcImRyb3AgdGFibGUgaWYgZXhpc3RzIHNldHRpbmdzO1wiLFxuICAgICAgICBcImRyb3AgdGFibGUgaWYgZXhpc3RzIHNjYW5fcmVzdWx0cztcIixcbiAgICAgICAgXCJkcm9wIHRhYmxlIGlmIGV4aXN0cyBrYWxtYW5fZXN0aW1hdGVzO1wiXG4gICAgXTtcblxuICAgIHN0YXRpYyBtaWdyYXRpb24xID0gW1xuICAgICAgICBcIkFMVEVSIFRBQkxFIGxheW91dF9pbWFnZXMgQUREIGZsb29yX3BsYW5fbmFtZSBURVhUIE5VTEw7XCIsXG4gICAgICAgIFwidXBkYXRlIHNldHRpbmdzIHNldCB2YWx1ZSA9ICdcIiArIERiLmRhdGFiYXNlX2NvZGVfdmVyc2lvbiArIFwiJyB3aGVyZSBrZXkgPSAnZGF0YWJhc2VfY29kZV92ZXJzaW9uJztcIlxuICAgIF07XG5cbiAgICBzdGF0aWMgbWlncmF0aW9uMiA9IFtcbiAgICAgICAgXCJBTFRFUiBUQUJMRSBmZWF0dXJlcyBBREQgc19pZCBJTlQgTlVMTDtcIixcbiAgICAgICAgXCJEUk9QIElOREVYIGZlYXR1cmVzX2ZlYXR1cmVfaW5kZXgxO1wiLFxuICAgICAgICBcIkRST1AgSU5ERVggZmVhdHVyZXNfZmVhdHVyZV9pbmRleDI7XCIsXG4gICAgICAgIFwiQ1JFQVRFIFRBQkxFIGZlYXR1cmVzYThkMSAoZnBfaWQgVEVYVCwgeCBJTlRFR0VSLCB5IElOVEVHRVIsIGZlYXR1cmUgVEVYVCwgdmFsdWUgUkVBTCwgc19pZCBJTlRFR0VSLFwiXG4gICAgICAgICsgXCIgQ09OU1RSQUlOVCBmZWF0dXJlc19mcF9pZF94X3lfZmVhdHVyZV9zX2lkX3BrIFBSSU1BUlkgS0VZIChmcF9pZCwgeCwgeSwgZmVhdHVyZSwgc19pZCkpO1wiLFxuICAgICAgICBcIkNSRUFURSBVTklRVUUgSU5ERVggZmVhdHVyZXNfZmVhdHVyZV9pbmRleDEgT04gZmVhdHVyZXNhOGQxIChmcF9pZCwgZmVhdHVyZSwgeCwgeSwgc19pZCk7XCIsXG4gICAgICAgIFwiSU5TRVJUIElOVE8gZmVhdHVyZXNhOGQxKGZwX2lkLCB4LCB5LCBmZWF0dXJlLCB2YWx1ZSwgc19pZCkgU0VMRUNUIGZwX2lkLCB4LCB5LCBmZWF0dXJlLCB2YWx1ZSwgc19pZCBGUk9NIGZlYXR1cmVzO1wiLFxuICAgICAgICBcIkRST1AgVEFCTEUgZmVhdHVyZXM7XCIsXG4gICAgICAgIFwiQUxURVIgVEFCTEUgZmVhdHVyZXNhOGQxIFJFTkFNRSBUTyBmZWF0dXJlcztcIixcbiAgICAgICAgXCJDUkVBVEUgSU5ERVggZmVhdHVyZXNfZmVhdHVyZV9pbmRleDIgT04gZmVhdHVyZXMoZmVhdHVyZSk7XCIsXG4gICAgICAgIFwidXBkYXRlIHNldHRpbmdzIHNldCB2YWx1ZSA9ICdcIiArIERiLmRhdGFiYXNlX2NvZGVfdmVyc2lvbiArIFwiJyB3aGVyZSBrZXkgPSAnZGF0YWJhc2VfY29kZV92ZXJzaW9uJztcIlxuICAgIF07XG5cbiAgICBzdGF0aWMgbWlncmF0aW9uMyA9IFtcbiAgICAgICAgXCJpbnNlcnQgb3IgaWdub3JlIGludG8gc2V0dGluZ3MgdmFsdWVzICgnc2Nhbl9pZCcsIDY0KTtcIixcbiAgICAgICAgXCJ1cGRhdGUgc2V0dGluZ3Mgc2V0IHZhbHVlID0gJ1wiICsgRGIuZGF0YWJhc2VfY29kZV92ZXJzaW9uICsgXCInIHdoZXJlIGtleSA9ICdkYXRhYmFzZV9jb2RlX3ZlcnNpb24nO1wiXG4gICAgXTtcblxuICAgIGNvbnN0cnVjdG9yKGxvZyl7XG4gICAgICAgIHRoaXMubG9nID0gbG9nO1xuICAgICAgICB0aGlzLmRiID0gbmV3IHNxbGl0ZTMuRGF0YWJhc2UoJ2RiLnNxbGl0ZTMnKTtcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoXCJEYi5jb25zdHJ1Y3RvclwiKTtcbiAgICB9XG5cbiAgICBnZXREYXRhYmFzZSgpe1xuICAgICAgICByZXR1cm4gdGhpcy5kYjtcbiAgICB9XG5cbiAgICBkb1VwZ3JhZGUoZGF0YWJhc2VDb2RlVmVyc2lvbikge1xuICAgICAgICB0aGlzLmxvZy5kZWJ1ZyhcIkRiLmRvVXBncmFkZVwiKTtcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgc3dpdGNoKGRhdGFiYXNlQ29kZVZlcnNpb24pe1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgIGRiLnNlcmlhbGl6ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIERiLm1pZ3JhdGlvbjEuZm9yRWFjaCgobWlnKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYi5ydW4obWlnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlVGFibGVzKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICBkYi5zZXJpYWxpemUoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBEYi5taWdyYXRpb24yLmZvckVhY2goKG1pZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGIucnVuKG1pZyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVRhYmxlcygpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgZGIuc2VyaWFsaXplKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgRGIubWlncmF0aW9uMy5mb3JFYWNoKChtaWcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRiLnJ1bihtaWcpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVUYWJsZXMoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgdGhlIHNxbGl0ZSB0YWJsZXNcbiAgICAgKi9cbiAgICBjcmVhdGVUYWJsZXMoKSB7XG4gICAgICAgIHRoaXMubG9nLmRlYnVnKFwiRGIuY3JlYXRlVGFibGVzXCIpO1xuICAgICAgICBsZXQgY3JlYXRlcyA9IERiLmNyZWF0ZXM7XG4gICAgICAgIGxldCBkYiA9IHRoaXMuZGI7XG5cbiAgICAgICAgZGIuc2VyaWFsaXplKCgpID0+IHtcbiAgICAgICAgICAgIGNyZWF0ZXMuZm9yRWFjaChmdW5jdGlvbihjcmVhdGUpe1xuICAgICAgICAgICAgICAgIGRiLnJ1bihjcmVhdGUpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGxldCBkYXRhYmFzZUNvZGVWZXJzaW9uID0gMDtcblxuICAgICAgICAgICAgZGIuYWxsKFwic2VsZWN0ICogZnJvbSBzZXR0aW5nc1wiLCAoZXJyLCByb3dzKSA9PiB7XG4gICAgICAgICAgICAgICAgcm93cy5mb3JFYWNoKGZ1bmN0aW9uKHJvdyl7XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaChyb3cua2V5KXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJkYXRhYmFzZV9jb2RlX3ZlcnNpb25cIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhYmFzZUNvZGVWZXJzaW9uID0gTnVtYmVyKHJvdy52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZihkYXRhYmFzZUNvZGVWZXJzaW9uIDwgRGIuZGF0YWJhc2VfY29kZV92ZXJzaW9uKXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kb1VwZ3JhZGUoZGF0YWJhc2VDb2RlVmVyc2lvbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldFNjYW5uZWRDb29yZHMoZnBfaWQsIGNiKXtcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoXCJEYi5nZXRTY2FubmVkQ29vcmRzXCIpO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBkYi5hbGwoRGIucXVlcnlfZ2V0X3NjYW5uZWRfY29vcmRzLCBmcF9pZCwgY2IpO1xuICAgIH1cblxuICAgIGdldEZsb29yUGxhbnMoY2IpIHtcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoXCJEYi5nZXRGbG9vclBsYW5zXCIpO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBkYi5hbGwoRGIucXVlcnlfZ2V0X2FsbF9mbG9vcnBsYW5zLCBjYik7XG4gICAgfVxuXG4gICAgZ2V0RGF0YWJhc2VWZXJzaW9uKGNiKSB7XG4gICAgICAgIHRoaXMubG9nLmRlYnVnKFwiRGIuZ2V0RGF0YWJhc2VWZXJzaW9uXCIpO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBkYi5hbGwoRGIucXVlcnlfZ2V0X2RhdGFiYXNlX3ZlcnNpb24sIGNiKTtcbiAgICB9XG5cbiAgICB1cGRhdGVEYXRhYmFzZShkYXRhLCBjYikge1xuICAgICAgICB0aGlzLmxvZy5kZWJ1ZyhcIkRiLnVwZGF0ZURhdGFiYXNlXCIpO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBsZXQgc3RtdCA9IGRiLnByZXBhcmUoRGIucXVlcnlfaW5zZXJ0X3ZlcnNpb24pO1xuICAgICAgICBzdG10LnJ1bihkYXRhLmRhdGFiYXNlVmVyc2lvbik7XG4gICAgICAgIHN0bXQuZmluYWxpemUoKTtcblxuICAgICAgICBzdG10ID0gZGIucHJlcGFyZShEYi5xdWVyeV91cGRhdGVfdmVyc2lvbik7XG4gICAgICAgIHN0bXQucnVuKGRhdGEuZGF0YWJhc2VWZXJzaW9uKTtcbiAgICAgICAgc3RtdC5maW5hbGl6ZSgpO1xuXG4gICAgICAgIGlmKHR5cGVvZihkYXRhLmxheW91dF9pbWFnZXMpICE9IFwidW5kZWZpbmVkXCIgJiYgZGF0YS5sYXlvdXRfaW1hZ2VzLmxlbmd0aCA+IDApe1xuICAgICAgICAgICAgc3RtdCA9IGRiLnByZXBhcmUoRGIucXVlcnlfaW5zZXJ0X2xheW91dCk7XG4gICAgICAgICAgICBsZXQgdXBzdG10ID0gZGIucHJlcGFyZShEYi5xdWVyeV91cGRhdGVfbGF5b3V0KTtcblxuICAgICAgICAgICAgZGF0YS5sYXlvdXRfaW1hZ2VzLmZvckVhY2goZnVuY3Rpb24oZWwpe1xuICAgICAgICAgICAgICAgIGxldCBpZCA9IGVsLmlkO1xuICAgICAgICAgICAgICAgIGxldCBmbG9vcl9wbGFuX25hbWUgPSBlbC5mbG9vcnBsYW5uYW1lO1xuICAgICAgICAgICAgICAgIGxldCBzdHJpbmdkYXRhID0gSlNPTi5zdHJpbmdpZnkoZWwpO1xuICAgICAgICAgICAgICAgIHN0bXQucnVuKGlkLCBzdHJpbmdkYXRhLCBmbG9vcl9wbGFuX25hbWUpO1xuICAgICAgICAgICAgICAgIHVwc3RtdC5ydW4oc3RyaW5nZGF0YSwgZmxvb3JfcGxhbl9uYW1lLCBpZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHN0bXQuZmluYWxpemUoKTtcbiAgICAgICAgICAgIHVwc3RtdC5maW5hbGl6ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgY2IoKTtcbiAgICB9XG5cbiAgICBzYXZlUmVhZGluZ3MocGF5bG9hZCwgY2Ipe1xuICAgICAgICBsZXQgbG9nID0gdGhpcy5sb2c7XG4gICAgICAgIGxldCBkYiA9IHRoaXMuZGI7XG4gICAgICAgIGxvZy5kZWJ1ZyhcIkRiLnNhdmVSZWFkaW5nc1wiKTtcblxuICAgICAgICBsZXQgc3RtdCA9IGRiLnByZXBhcmUoRGIucXVlcnlfaW5zZXJ0X3NjYW5fcmVzdWx0cyk7XG4gICAgICAgIGxldCBmaW5pc2hlZCA9IDA7XG4gICAgICAgIGRiLmdldChEYi5xdWVyeV9nZXRfc2Nhbl9pZCwgKGVyciwgcm93KSA9PiB7XG4gICAgICAgICAgICBkYi5ydW4oRGIucXVlcnlfdXBkYXRlX3NjYW5faWQpO1xuICAgICAgICAgICAgcGF5bG9hZC5mb3JFYWNoKChlbCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBzX2lkID0gTnVtYmVyKHJvdy52YWx1ZSk7XG4gICAgICAgICAgICAgICAgbGV0IGZwX2lkID0gZWwuZnBfaWQ7XG4gICAgICAgICAgICAgICAgbGV0IGFwX2lkID0gZWwuYXBfaWQ7XG4gICAgICAgICAgICAgICAgbGV0IHggPSBOdW1iZXIoZWwueCk7XG4gICAgICAgICAgICAgICAgbGV0IHkgPSBOdW1iZXIoZWwueSk7XG4gICAgICAgICAgICAgICAgbGV0IHZhbHVlID0gTnVtYmVyKGVsLnZhbHVlKTtcbiAgICAgICAgICAgICAgICBsZXQgb3JpZ192YWx1ZXMgPSBlbC5vcmlnX3ZhbHVlcztcbiAgICAgICAgICAgICAgICBsZXQgY3JlYXRlZCA9IGVsLmNyZWF0ZWQ7XG4gICAgICAgICAgICAgICAgc3RtdC5ydW4oc19pZCwgZnBfaWQsIGFwX2lkLCB4LCB5LCB2YWx1ZSwgb3JpZ192YWx1ZXMsIGNyZWF0ZWQsIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZmluaXNoZWQrKztcbiAgICAgICAgICAgICAgICAgICAgaWYoZmluaXNoZWQgPj0gcGF5bG9hZC5sZW5ndGgpe1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RtdC5maW5hbGl6ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVLYWxtYW4oZnBfaWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdXBkYXRlS2FsbWFuKGZwX2lkKXtcbiAgICAgICAgbGV0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBsZXQga2FsbWFuID0ge307XG5cbiAgICAgICAgZGIuYWxsKERiLnF1ZXJ5X2dldF9mb3Jfa2FsbWFuLCBmcF9pZCwgKGVyciwgcm93cykgPT4ge1xuICAgICAgICAgICAgY29uc3QgaW5zZXJ0ID0gZGIucHJlcGFyZShEYi5xdWVyeV9pbnNlcnRfa2FsbWFuX2VzdGltYXRlcyk7XG4gICAgICAgICAgICBjb25zdCB1cGRhdGUgPSBkYi5wcmVwYXJlKERiLnF1ZXJ5X3VwZGF0ZV9rYWxtYW5fZXN0aW1hdGVzKTtcblxuICAgICAgICAgICAgaWYoZXJyKSB7XG4gICAgICAgICAgICAgICAgbG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgZG9uZSA9IDA7XG4gICAgICAgICAgICByb3dzLmZvckVhY2goKHJvdykgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBrID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZihrYWxtYW5bcm93LmZwX2lkICsgcm93LmFwX2lkICsgcm93LnggKyByb3cueV0pID09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAga2FsbWFuW3Jvdy5mcF9pZCArIHJvdy5hcF9pZCArIHJvdy54ICsgcm93LnldID0gbmV3IEthbG1hbkZpbHRlcihyb3cuY2VzdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGsgPSBrYWxtYW5bcm93LmZwX2lkICsgcm93LmFwX2lkICsgcm93LnggKyByb3cueV07XG5cbiAgICAgICAgICAgICAgICBsZXQgdmFsdWVzID0gcm93LnZhbHVlc1xuICAgICAgICAgICAgICAgICAgICAuc3BsaXQoXCIsXCIpXG4gICAgICAgICAgICAgICAgICAgIC5tYXAoKGVsKSA9PiB7IHJldHVybiBOdW1iZXIoZWwpOyB9KTtcblxuICAgICAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCB2YWx1ZXMubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgICAgICAgICBrLmFkZFNhbXBsZSh2YWx1ZXNbaV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpbnNlcnQucnVuKHJvdy5mcF9pZCwgcm93LmFwX2lkLCByb3cueCwgcm93LnksIGsuZ2V0RXN0aW1hdGUoKSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB1cGRhdGUucnVuKGsuZ2V0RXN0aW1hdGUoKSwgcm93LmZwX2lkLCByb3cuYXBfaWQsIHJvdy54LCByb3cueSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoZG9uZSA+PSByb3dzLmxlbmd0aCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zZXJ0LmZpbmFsaXplKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlLmZpbmFsaXplKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGIuc2VyaWFsaXplKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGIucnVuKFwiZGVsZXRlIGZyb20gZmVhdHVyZXMgd2hlcmUgZnBfaWQgPSA/XCIsIGZwX2lkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGIucnVuKERiLnF1ZXJ5X3VwZGF0ZV9mZWF0dXJlcywgZnBfaWQsIGZwX2lkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5cbm1vZHVsZS5leHBvcnRzID0gRGI7Il19
//# sourceMappingURL=Db.js.map
