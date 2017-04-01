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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRiLmVzNiJdLCJuYW1lcyI6WyJzcWxpdGUzIiwicmVxdWlyZSIsInZlcmJvc2UiLCJEYiIsImxvZyIsImRiIiwiRGF0YWJhc2UiLCJkZWJ1ZyIsImRhdGFiYXNlQ29kZVZlcnNpb24iLCJzZXJpYWxpemUiLCJtaWdyYXRpb24xIiwiZm9yRWFjaCIsIm1pZyIsInJ1biIsImNyZWF0ZVRhYmxlcyIsIm1pZ3JhdGlvbjIiLCJtaWdyYXRpb24zIiwibWlncmF0aW9uNCIsImNyZWF0ZXMiLCJjcmVhdGUiLCJhbGwiLCJlcnIiLCJyb3dzIiwicm93Iiwia2V5IiwiTnVtYmVyIiwidmFsdWUiLCJkYXRhYmFzZV9jb2RlX3ZlcnNpb24iLCJkb1VwZ3JhZGUiLCJmcF9pZCIsImNiIiwicXVlcnlfZ2V0X3NjYW5uZWRfY29vcmRzIiwicXVlcnlfZ2V0X2FsbF9mbG9vcnBsYW5zIiwicXVlcnlfZ2V0X2RhdGFiYXNlX3ZlcnNpb24iLCJkYXRhIiwic3RtdCIsInByZXBhcmUiLCJxdWVyeV9pbnNlcnRfdmVyc2lvbiIsImRhdGFiYXNlVmVyc2lvbiIsImZpbmFsaXplIiwicXVlcnlfdXBkYXRlX3ZlcnNpb24iLCJsYXlvdXRfaW1hZ2VzIiwibGVuZ3RoIiwicXVlcnlfaW5zZXJ0X2xheW91dCIsInVwc3RtdCIsInF1ZXJ5X3VwZGF0ZV9sYXlvdXQiLCJlbCIsImlkIiwiZmxvb3JfcGxhbl9uYW1lIiwiZmxvb3JwbGFubmFtZSIsInN0cmluZ2RhdGEiLCJKU09OIiwic3RyaW5naWZ5IiwicGF5bG9hZCIsInF1ZXJ5X2luc2VydF9zY2FuX3Jlc3VsdHMiLCJmaW5pc2hlZCIsImdldCIsInF1ZXJ5X2dldF9zY2FuX2lkIiwicXVlcnlfdXBkYXRlX3NjYW5faWQiLCJzX2lkIiwiYXBfaWQiLCJ4IiwieSIsIm9yaWdfdmFsdWVzIiwiY3JlYXRlZCIsInVwZGF0ZUthbG1hbiIsImthbG1hbiIsInF1ZXJ5X2dldF9mb3Jfa2FsbWFuIiwiaW5zZXJ0IiwicXVlcnlfaW5zZXJ0X2thbG1hbl9lc3RpbWF0ZXMiLCJ1cGRhdGUiLCJxdWVyeV91cGRhdGVfa2FsbWFuX2VzdGltYXRlcyIsImVycm9yIiwiZG9uZSIsImsiLCJjZXN0IiwidmFsdWVzIiwic3BsaXQiLCJtYXAiLCJpIiwiYWRkU2FtcGxlIiwiZ2V0RXN0aW1hdGUiLCJxdWVyeV91cGRhdGVfZmVhdHVyZXMiLCJxdWVyeV9nZXRfc2Nhbl9yZXN1bHRzIiwicXVlcnlfdXBkYXRlX29sZGVzdF9mZWF0dXJlcyIsInF1ZXJ5X2dldF9mZWF0dXJlcyIsInF1ZXJ5X2dldF9taW5fc2lkIiwiZHJvcHMiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7Ozs7Ozs7O0FBRUEsSUFBSUEsVUFBVUMsUUFBUSxTQUFSLEVBQW1CQyxPQUFuQixFQUFkOztJQUVNQyxFO0FBNEdGLGdCQUFZQyxHQUFaLEVBQWdCO0FBQUE7O0FBQ1osYUFBS0EsR0FBTCxHQUFXQSxHQUFYO0FBQ0EsYUFBS0MsRUFBTCxHQUFVLElBQUlMLFFBQVFNLFFBQVosQ0FBcUIsWUFBckIsQ0FBVjtBQUNBLGFBQUtGLEdBQUwsQ0FBU0csS0FBVCxDQUFlLGdCQUFmO0FBQ0g7Ozs7c0NBRVk7QUFDVCxtQkFBTyxLQUFLRixFQUFaO0FBQ0g7OztrQ0FFU0csbUIsRUFBcUI7QUFBQTs7QUFDM0IsaUJBQUtKLEdBQUwsQ0FBU0csS0FBVCxDQUFlLGNBQWY7QUFDQSxnQkFBSUYsS0FBSyxLQUFLQSxFQUFkO0FBQ0Esb0JBQU9HLG1CQUFQO0FBQ0kscUJBQUssQ0FBTDtBQUNJSCx1QkFBR0ksU0FBSCxDQUFhLFlBQU07QUFDZk4sMkJBQUdPLFVBQUgsQ0FBY0MsT0FBZCxDQUFzQixVQUFDQyxHQUFELEVBQVM7QUFDM0JQLCtCQUFHUSxHQUFILENBQU9ELEdBQVA7QUFDSCx5QkFGRDtBQUdBLDhCQUFLRSxZQUFMO0FBQ0gscUJBTEQ7QUFNQTs7QUFFSixxQkFBSyxDQUFMO0FBQ0lULHVCQUFHSSxTQUFILENBQWEsWUFBTTtBQUNmTiwyQkFBR1ksVUFBSCxD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QUNFLGdGQUhjLEVBSWhCLGtDQUFrQ2QsR0FBR3dCLHFCQUFyQyxHQUE2RCx3Q0FKN0MsQzs7O0FBcU54QjZELE9BQU9DLE9BQVAsR0FBaUJ0RixFQUFqQiIsImZpbGUiOiJEYi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBLYWxtYW5GaWx0ZXIgZnJvbSAnLi9LYWxtYW5GaWx0ZXInO1xuXG5sZXQgc3FsaXRlMyA9IHJlcXVpcmUoJ3NxbGl0ZTMnKS52ZXJib3NlKCk7XG5cbmNsYXNzIERiIHtcblxuICAgIHN0YXRpYyBkYXRhYmFzZV9jb2RlX3ZlcnNpb24gPSA0O1xuICAgIHN0YXRpYyBxdWVyeV9nZXRfYWxsX2Zsb29ycGxhbnMgPSBcInNlbGVjdCAqIGZyb20gbGF5b3V0X2ltYWdlc1wiO1xuICAgIHN0YXRpYyBxdWVyeV9nZXRfZGF0YWJhc2VfdmVyc2lvbiA9IFwic2VsZWN0IHZhbHVlIGZyb20gc2V0dGluZ3Mgd2hlcmUga2V5ID0gJ2RhdGFiYXNlX3ZlcnNpb24nO1wiO1xuICAgIHN0YXRpYyBxdWVyeV9pbnNlcnRfdmVyc2lvbiA9IFwiaW5zZXJ0IG9yIGlnbm9yZSBpbnRvIHNldHRpbmdzIHZhbHVlcyAoJ2RhdGFiYXNlX3ZlcnNpb24nLCA/KTtcIjtcbiAgICBzdGF0aWMgcXVlcnlfdXBkYXRlX3ZlcnNpb24gPSBcInVwZGF0ZSBzZXR0aW5ncyBzZXQgdmFsdWUgPSA/IHdoZXJlIGtleSA9ICdkYXRhYmFzZV92ZXJzaW9uJztcIjtcbiAgICBzdGF0aWMgcXVlcnlfaW5zZXJ0X2xheW91dCA9IFwiaW5zZXJ0IG9yIGlnbm9yZSBpbnRvIGxheW91dF9pbWFnZXMgdmFsdWVzICg/LCA/LCA/KTtcIjtcbiAgICBzdGF0aWMgcXVlcnlfdXBkYXRlX2xheW91dCA9IFwidXBkYXRlIGxheW91dF9pbWFnZXMgc2V0IGxheW91dF9pbWFnZSA9ID8sIGZsb29yX3BsYW5fbmFtZSA9ID8gd2hlcmUgaWQgPSA/O1wiO1xuICAgIHN0YXRpYyBxdWVyeV9pbnNlcnRfc2Nhbl9yZXN1bHRzID0gXCJpbnNlcnQgaW50byBzY2FuX3Jlc3VsdHMgdmFsdWVzICg/LCA/LCA/LCA/LCA/LCA/LCA/LCA/KTtcIjtcbiAgICBzdGF0aWMgcXVlcnlfZ2V0X3NjYW5fcmVzdWx0cyA9IFwic2VsZWN0ICogZnJvbSBzY2FuX3Jlc3VsdHM7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X2dldF9mb3Jfa2FsbWFuID0gXCJTRUxFQ1Qgcy5mcF9pZCwgcy5hcF9pZCwgcy54LCBzLnksIFwiXG4gICAgKyBcImdyb3VwX2NvbmNhdChzLnZhbHVlKSBgdmFsdWVzYCwgXCJcbiAgICArIFwiY2FzZSB3aGVuIGsua2FsbWFuIGlzIG51bGwgdGhlbiBhdmcocy52YWx1ZSkgZWxzZSBrLmthbG1hbiBlbmQgYGNlc3RgLCBcIlxuICAgICsgXCJrLmthbG1hbiBGUk9NIHNjYW5fcmVzdWx0cyBzIGxlZnQgam9pbiBcIlxuICAgICsgXCJrYWxtYW5fZXN0aW1hdGVzIGsgb24gcy5mcF9pZCA9IGsuZnBfaWQgYW5kIHMuYXBfaWQgPSBrLmFwX2lkIGFuZCBzLnggPSBrLnggYW5kIHMueSA9IGsueSBcIlxuICAgICsgXCIgd2hlcmUgcy5mcF9pZCA9ID8gR1JPVVAgQlkgcy5mcF9pZCwgcy5hcF9pZCwgcy54LCBzLnk7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X2luc2VydF9rYWxtYW5fZXN0aW1hdGVzID0gXCJpbnNlcnQgb3IgaWdub3JlIGludG8ga2FsbWFuX2VzdGltYXRlcyB2YWx1ZXMgKD8sID8sID8sID8sID8pO1wiXG4gICAgc3RhdGljIHF1ZXJ5X3VwZGF0ZV9rYWxtYW5fZXN0aW1hdGVzID0gXCJ1cGRhdGUga2FsbWFuX2VzdGltYXRlcyBzZXQga2FsbWFuID0gPyB3aGVyZSBmcF9pZCA9ID8gYW5kIGFwX2lkID0gPyBhbmQgXCJcbiAgICArIFwiIHggPSA/IGFuZCB5ID0gPztcIjtcbiAgICBzdGF0aWMgcXVlcnlfdXBkYXRlX2ZlYXR1cmVzID0gXCJpbnNlcnQgaW50byBmZWF0dXJlcyBcIlxuICAgICsgXCIgc2VsZWN0IGsuZnBfaWQsIGsueCwgay55LCBrLmFwX2lkIHx8IGsxLmFwX2lkIGFzIGZlYXR1cmUsIGFicyhrLmthbG1hbiAtIGsxLmthbG1hbikgYXMgdmFsdWUgXCJcbiAgICArIFwiIGZyb20ga2FsbWFuX2VzdGltYXRlcyBrIGpvaW4ga2FsbWFuX2VzdGltYXRlcyBrMSBvbiBrLmZwX2lkID0gazEuZnBfaWQgYW5kIGsueCA9IGsxLnggYW5kIGsueSA9IGsxLnkgXCJcbiAgICArIFwiIHdoZXJlIGsua2FsbWFuICE9IDAgYW5kIGsxLmthbG1hbiAhPSAwO1wiO1xuICAgIHN0YXRpYyBxdWVyeV91cGRhdGVfb2xkZXN0X2ZlYXR1cmVzID0gXCJzZWxlY3Qgay5mcF9pZCwgay54LCBrLnksIGsuYXBfaWQgfHwgazEuYXBfaWQgYXMgZmVhdHVyZSwgXCJcbiAgICArIFwiIGFicyhrLmthbG1hbiAtIGsxLmthbG1hbikgYXMgdmFsdWUsIDpzY2FuX2lkOiBzX2lkIGZyb20ga2FsbWFuX2VzdGltYXRlcyBrIGpvaW4gXCJcbiAgICArIFwiIGthbG1hbl9lc3RpbWF0ZXMgazEgb24gay5mcF9pZCA9IGsxLmZwX2lkIGFuZCBrLnggPSBrMS54IGFuZCBrLnkgPSBrMS55IGFuZCBrLmFwX2lkIDwgazEuYXBfaWQgd2hlcmVcIlxuICAgICsgXCIgay5rYWxtYW4gIT0gMCBhbmQgazEua2FsbWFuICE9IDAgYW5kIGsuZnBfaWQgPSA/IGFuZCBrMS5mcF9pZCA9ID87XCI7XG4gICAgc3RhdGljIHF1ZXJ5X2dldF9mZWF0dXJlcyA9IFwic2VsZWN0IGYuKiwgYWJzKHZhbHVlIC0gOmZlYXR1cmVfdmFsdWU6KSBkaWZmIGZyb20gZmVhdHVyZXMgZiBcIlxuICAgICsgXCIgd2hlcmUgZi5mZWF0dXJlID0gPyBhbmQgZi5mcF9pZCA9ID8gb3JkZXIgYnkgZGlmZiBhc2M7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X2dldF9zY2FubmVkX2Nvb3JkcyA9IFwic2VsZWN0IGNvdW50KCopIGFzIG51bV9mZWF0dXJlcywgeCwgeSBmcm9tIGZlYXR1cmVzIHdoZXJlIGZwX2lkID0gPyBcIlxuICAgICsgXCIgZ3JvdXAgYnkgeCwgeTtcIjtcbiAgICBzdGF0aWMgcXVlcnlfZ2V0X21pbl9zaWQgPSBcInNlbGVjdCBtaW4oc19pZCkgZnJvbSBmZWF0dXJlcyB3aGVyZSBmcF9pZCA9ID9cIjtcbiAgICBzdGF0aWMgcXVlcnlfZ2V0X3NjYW5faWQgPSBcInNlbGVjdCB2YWx1ZSArIDEgYXMgdmFsdWUgZnJvbSBzZXR0aW5ncyB3aGVyZSBrZXkgPSAnc2Nhbl9pZCc7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X3VwZGF0ZV9zY2FuX2lkID0gXCJ1cGRhdGUgc2V0dGluZ3Mgc2V0IHZhbHVlID0gdmFsdWUgKyAxIHdoZXJlIGtleSA9ICdzY2FuX2lkJztcIjtcblxuICAgIHN0YXRpYyBjcmVhdGVzID0gW1xuICAgICAgICBcIkNSRUFURSBUQUJMRSBpZiBub3QgZXhpc3RzIGxheW91dF9pbWFnZXMgKGlkIFRFWFQgUFJJTUFSWSBLRVksIGxheW91dF9pbWFnZSBURVhUKTtcIixcbiAgICAgICAgXCJDUkVBVEUgVU5JUVVFIElOREVYIGlmIG5vdCBleGlzdHMgbGF5b3V0X2ltYWdlc19pZF91aW5kZXggT04gbGF5b3V0X2ltYWdlcyAoaWQpO1wiLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDcmVhdGUgdGhlIHNldHRpbmdzIHRhYmxlIHdpdGggZGVmYXVsdCBzZXR0aW5nc1xuICAgICAgICAgKi9cbiAgICAgICAgXCJjcmVhdGUgdGFibGUgaWYgbm90IGV4aXN0cyBzZXR0aW5ncyAoa2V5IFRFWFQgUFJJTUFSWSBLRVksIHZhbHVlIFRFWFQpO1wiLFxuICAgICAgICBcImNyZWF0ZSB1bmlxdWUgaW5kZXggaWYgbm90IGV4aXN0cyBzZXR0aW5nc19rZXkgb24gc2V0dGluZ3MgKGtleSk7XCIsXG4gICAgICAgIFwiaW5zZXJ0IG9yIGlnbm9yZSBpbnRvIHNldHRpbmdzIChrZXksIHZhbHVlKSB2YWx1ZXMgKCdkYXRhYmFzZV92ZXJzaW9uJywgMCk7XCIsXG4gICAgICAgIFwiaW5zZXJ0IG9yIGlnbm9yZSBpbnRvIHNldHRpbmdzIChrZXksIHZhbHVlKSB2YWx1ZXMgKCdkYXRhYmFzZV9jb2RlX3ZlcnNpb24nLCAwKTtcIixcblxuICAgICAgICAvKipcbiAgICAgICAgICogYXBfaWQgPSBhY2Nlc3MgcG9pbnQgaWRcbiAgICAgICAgICogZnBfaWQgPSBmbG9vcnBsYW4gaWRcbiAgICAgICAgICovXG4gICAgICAgIFwiQ1JFQVRFIFRBQkxFIGlmIG5vdCBleGlzdHMgc2Nhbl9yZXN1bHRzIFwiICtcbiAgICAgICAgXCIoc19pZCBJTlRFR0VSLCBmcF9pZCBURVhULCBhcF9pZCBURVhULCB4IElOVEVHRVIsIFwiICtcbiAgICAgICAgXCJ5IElOVEVHRVIsIHZhbHVlIFJFQUwsIG9yaWdfdmFsdWVzIFRFWFQsIGNyZWF0ZWQgVElNRVNUQU1QIERFRkFVTFQgQ1VSUkVOVF9USU1FU1RBTVAgTk9UIE5VTEwsIFwiICtcbiAgICAgICAgXCJQUklNQVJZIEtFWSAoc19pZCwgZnBfaWQsIGFwX2lkKSwgXCIgK1xuICAgICAgICBcIkNPTlNUUkFJTlQgc2Nhbl9yZXN1bHRzX2xheW91dF9pbWFnZXNfaWRfZmsgRk9SRUlHTiBLRVkgKGZwX2lkKSBSRUZFUkVOQ0VTIGxheW91dF9pbWFnZXMgKGlkKSk7XCIsXG4gICAgICAgIFwiY3JlYXRlIGluZGV4IGlmIG5vdCBleGlzdHMgeF9hbmRfeSBvbiBzY2FuX3Jlc3VsdHMgKHgsIHkpO1wiLFxuXG4gICAgICAgIFwiQ1JFQVRFIFRBQkxFIGlmIG5vdCBleGlzdHMga2FsbWFuX2VzdGltYXRlcyAoZnBfaWQgVEVYVCwgYXBfaWQgVEVYVCwgeCBJTlRFR0VSLCBcIlxuICAgICAgICArIFwieSBJTlRFR0VSLCBrYWxtYW4gUkVBTCwgXCJcbiAgICAgICAgKyBcIkNPTlNUUkFJTlQga2FsbWFuX2VzdGltYXRlc19mcF9pZF9hcF9pZF94X3lfcGsgUFJJTUFSWSBLRVkgKGZwX2lkLCBhcF9pZCwgeCwgeSksXCJcbiAgICAgICAgKyBcIkZPUkVJR04gS0VZIChhcF9pZCwgZnBfaWQsIHgsIHkpIFJFRkVSRU5DRVMgc2Nhbl9yZXN1bHRzIChhcF9pZCwgZnBfaWQsIHgsIHkpIE9OIERFTEVURSBDQVNDQURFKVwiLFxuXG4gICAgICAgIFwiQ1JFQVRFIFRBQkxFIGlmIG5vdCBleGlzdHMgZmVhdHVyZXMgKGZwX2lkIFRFWFQsIHggSU5URUdFUiwgeSBJTlRFR0VSLCBmZWF0dXJlIFRFWFQsIHZhbHVlIFJFQUwsIFwiXG4gICAgICAgICsgXCIgQ09OU1RSQUlOVCBmZWF0dXJlc19mcF9pZF94X3lfZmVhdHVyZV9wayBQUklNQVJZIEtFWSAoZnBfaWQsIHgsIHksIGZlYXR1cmUpKTtcIixcbiAgICAgICAgXCJDUkVBVEUgVU5JUVVFIElOREVYIGlmIG5vdCBleGlzdHMgZmVhdHVyZXNfZmVhdHVyZV9pbmRleDEgT04gZmVhdHVyZXMoZnBfaWQsZmVhdHVyZSx4LHkpO1wiLFxuICAgICAgICBcIkNSRUFURSBJTkRFWCBpZiBub3QgZXhpc3RzIGZlYXR1cmVzX2ZlYXR1cmVfaW5kZXgyIE9OIGZlYXR1cmVzKGZlYXR1cmUpO1wiXG4gICAgXTtcblxuICAgIHN0YXRpYyBkcm9wcyA9IFtcbiAgICAgICAgXCJkcm9wIHRhYmxlIGlmIGV4aXN0cyBsYXlvdXRfaW1hZ2VzO1wiLFxuICAgICAgICBcImRyb3AgdGFibGUgaWYgZXhpc3RzIHNldHRpbmdzO1wiLFxuICAgICAgICBcImRyb3AgdGFibGUgaWYgZXhpc3RzIHNjYW5fcmVzdWx0cztcIixcbiAgICAgICAgXCJkcm9wIHRhYmxlIGlmIGV4aXN0cyBrYWxtYW5fZXN0aW1hdGVzO1wiXG4gICAgXTtcblxuICAgIHN0YXRpYyBtaWdyYXRpb24xID0gW1xuICAgICAgICBcIkFMVEVSIFRBQkxFIGxheW91dF9pbWFnZXMgQUREIGZsb29yX3BsYW5fbmFtZSBURVhUIE5VTEw7XCIsXG4gICAgICAgIFwidXBkYXRlIHNldHRpbmdzIHNldCB2YWx1ZSA9ICdcIiArIERiLmRhdGFiYXNlX2NvZGVfdmVyc2lvbiArIFwiJyB3aGVyZSBrZXkgPSAnZGF0YWJhc2VfY29kZV92ZXJzaW9uJztcIlxuICAgIF07XG5cbiAgICBzdGF0aWMgbWlncmF0aW9uMiA9IFtcbiAgICAgICAgXCJBTFRFUiBUQUJMRSBmZWF0dXJlcyBBREQgc19pZCBJTlQgTlVMTDtcIixcbiAgICAgICAgXCJEUk9QIElOREVYIGZlYXR1cmVzX2ZlYXR1cmVfaW5kZXgxO1wiLFxuICAgICAgICBcIkRST1AgSU5ERVggZmVhdHVyZXNfZmVhdHVyZV9pbmRleDI7XCIsXG4gICAgICAgIFwiQ1JFQVRFIFRBQkxFIGZlYXR1cmVzYThkMSAoZnBfaWQgVEVYVCwgeCBJTlRFR0VSLCB5IElOVEVHRVIsIGZlYXR1cmUgVEVYVCwgdmFsdWUgUkVBTCwgc19pZCBJTlRFR0VSLFwiXG4gICAgICAgICsgXCIgQ09OU1RSQUlOVCBmZWF0dXJlc19mcF9pZF94X3lfZmVhdHVyZV9zX2lkX3BrIFBSSU1BUlkgS0VZIChmcF9pZCwgeCwgeSwgZmVhdHVyZSwgc19pZCkpO1wiLFxuICAgICAgICBcIkNSRUFURSBVTklRVUUgSU5ERVggZmVhdHVyZXNfZmVhdHVyZV9pbmRleDEgT04gZmVhdHVyZXNhOGQxIChmcF9pZCwgZmVhdHVyZSwgeCwgeSwgc19pZCk7XCIsXG4gICAgICAgIFwiSU5TRVJUIElOVE8gZmVhdHVyZXNhOGQxKGZwX2lkLCB4LCB5LCBmZWF0dXJlLCB2YWx1ZSwgc19pZCkgU0VMRUNUIGZwX2lkLCB4LCB5LCBmZWF0dXJlLCB2YWx1ZSwgc19pZCBGUk9NIGZlYXR1cmVzO1wiLFxuICAgICAgICBcIkRST1AgVEFCTEUgZmVhdHVyZXM7XCIsXG4gICAgICAgIFwiQUxURVIgVEFCTEUgZmVhdHVyZXNhOGQxIFJFTkFNRSBUTyBmZWF0dXJlcztcIixcbiAgICAgICAgXCJDUkVBVEUgSU5ERVggZmVhdHVyZXNfZmVhdHVyZV9pbmRleDIgT04gZmVhdHVyZXMoZmVhdHVyZSk7XCIsXG4gICAgICAgIFwidXBkYXRlIHNldHRpbmdzIHNldCB2YWx1ZSA9ICdcIiArIERiLmRhdGFiYXNlX2NvZGVfdmVyc2lvbiArIFwiJyB3aGVyZSBrZXkgPSAnZGF0YWJhc2VfY29kZV92ZXJzaW9uJztcIlxuICAgIF07XG5cbiAgICBzdGF0aWMgbWlncmF0aW9uMyA9IFtcbiAgICAgICAgXCJpbnNlcnQgb3IgaWdub3JlIGludG8gc2V0dGluZ3MgdmFsdWVzICgnc2Nhbl9pZCcsIDY0KTtcIixcbiAgICAgICAgXCJ1cGRhdGUgc2V0dGluZ3Mgc2V0IHZhbHVlID0gJ1wiICsgRGIuZGF0YWJhc2VfY29kZV92ZXJzaW9uICsgXCInIHdoZXJlIGtleSA9ICdkYXRhYmFzZV9jb2RlX3ZlcnNpb24nO1wiXG4gICAgXTtcblxuICAgIHN0YXRpYyBtaWdyYXRpb240ID0gW1xuICAgICAgICBcImRyb3AgdGFibGUgZmVhdHVyZXM7XCIsXG4gICAgICAgIFwiQ1JFQVRFIFRBQkxFIGZlYXR1cmVzIChmcF9pZCBURVhULCB4IElOVEVHRVIsIHkgSU5URUdFUiwgZmVhdHVyZSBURVhULCB2YWx1ZSBSRUFMLCBcIlxuICAgICAgICArIFwiIENPTlNUUkFJTlQgZmVhdHVyZXNfZnBfaWRfeF95X2ZlYXR1cmVfcGsgUFJJTUFSWSBLRVkgKGZwX2lkLCB4LCB5LCBmZWF0dXJlKSk7XCIsXG4gICAgICAgIFwidXBkYXRlIHNldHRpbmdzIHNldCB2YWx1ZSA9ICdcIiArIERiLmRhdGFiYXNlX2NvZGVfdmVyc2lvbiArIFwiJyB3aGVyZSBrZXkgPSAnZGF0YWJhc2VfY29kZV92ZXJzaW9uJztcIlxuICAgIF07XG5cbiAgICBjb25zdHJ1Y3Rvcihsb2cpe1xuICAgICAgICB0aGlzLmxvZyA9IGxvZztcbiAgICAgICAgdGhpcy5kYiA9IG5ldyBzcWxpdGUzLkRhdGFiYXNlKCdkYi5zcWxpdGUzJyk7XG4gICAgICAgIHRoaXMubG9nLmRlYnVnKFwiRGIuY29uc3RydWN0b3JcIik7XG4gICAgfVxuXG4gICAgZ2V0RGF0YWJhc2UoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGI7XG4gICAgfVxuXG4gICAgZG9VcGdyYWRlKGRhdGFiYXNlQ29kZVZlcnNpb24pIHtcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoXCJEYi5kb1VwZ3JhZGVcIik7XG4gICAgICAgIGxldCBkYiA9IHRoaXMuZGI7XG4gICAgICAgIHN3aXRjaChkYXRhYmFzZUNvZGVWZXJzaW9uKXtcbiAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICBkYi5zZXJpYWxpemUoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBEYi5taWdyYXRpb24xLmZvckVhY2goKG1pZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGIucnVuKG1pZyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVRhYmxlcygpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgZGIuc2VyaWFsaXplKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgRGIubWlncmF0aW9uMi5mb3JFYWNoKChtaWcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRiLnJ1bihtaWcpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVUYWJsZXMoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIGRiLnNlcmlhbGl6ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIERiLm1pZ3JhdGlvbjMuZm9yRWFjaCgobWlnKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYi5ydW4obWlnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlVGFibGVzKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICBkYi5zZXJpYWxpemUoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBEYi5taWdyYXRpb240LmZvckVhY2goKG1pZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGIucnVuKG1pZyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVRhYmxlcygpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyB0aGUgc3FsaXRlIHRhYmxlc1xuICAgICAqL1xuICAgIGNyZWF0ZVRhYmxlcygpIHtcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoXCJEYi5jcmVhdGVUYWJsZXNcIik7XG4gICAgICAgIGxldCBjcmVhdGVzID0gRGIuY3JlYXRlcztcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcblxuICAgICAgICBkYi5zZXJpYWxpemUoKCkgPT4ge1xuICAgICAgICAgICAgY3JlYXRlcy5mb3JFYWNoKGZ1bmN0aW9uKGNyZWF0ZSl7XG4gICAgICAgICAgICAgICAgZGIucnVuKGNyZWF0ZSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgbGV0IGRhdGFiYXNlQ29kZVZlcnNpb24gPSAwO1xuXG4gICAgICAgICAgICBkYi5hbGwoXCJzZWxlY3QgKiBmcm9tIHNldHRpbmdzXCIsIChlcnIsIHJvd3MpID0+IHtcbiAgICAgICAgICAgICAgICByb3dzLmZvckVhY2goZnVuY3Rpb24ocm93KXtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoKHJvdy5rZXkpe1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcImRhdGFiYXNlX2NvZGVfdmVyc2lvblwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFiYXNlQ29kZVZlcnNpb24gPSBOdW1iZXIocm93LnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmKGRhdGFiYXNlQ29kZVZlcnNpb24gPCBEYi5kYXRhYmFzZV9jb2RlX3ZlcnNpb24pe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRvVXBncmFkZShkYXRhYmFzZUNvZGVWZXJzaW9uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0U2Nhbm5lZENvb3JkcyhmcF9pZCwgY2Ipe1xuICAgICAgICB0aGlzLmxvZy5kZWJ1ZyhcIkRiLmdldFNjYW5uZWRDb29yZHNcIik7XG4gICAgICAgIGxldCBkYiA9IHRoaXMuZGI7XG4gICAgICAgIGRiLmFsbChEYi5xdWVyeV9nZXRfc2Nhbm5lZF9jb29yZHMsIGZwX2lkLCBjYik7XG4gICAgfVxuXG4gICAgZ2V0Rmxvb3JQbGFucyhjYikge1xuICAgICAgICB0aGlzLmxvZy5kZWJ1ZyhcIkRiLmdldEZsb29yUGxhbnNcIik7XG4gICAgICAgIGxldCBkYiA9IHRoaXMuZGI7XG4gICAgICAgIGRiLmFsbChEYi5xdWVyeV9nZXRfYWxsX2Zsb29ycGxhbnMsIGNiKTtcbiAgICB9XG5cbiAgICBnZXREYXRhYmFzZVZlcnNpb24oY2IpIHtcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoXCJEYi5nZXREYXRhYmFzZVZlcnNpb25cIik7XG4gICAgICAgIGxldCBkYiA9IHRoaXMuZGI7XG4gICAgICAgIGRiLmFsbChEYi5xdWVyeV9nZXRfZGF0YWJhc2VfdmVyc2lvbiwgY2IpO1xuICAgIH1cblxuICAgIHVwZGF0ZURhdGFiYXNlKGRhdGEsIGNiKSB7XG4gICAgICAgIHRoaXMubG9nLmRlYnVnKFwiRGIudXBkYXRlRGF0YWJhc2VcIik7XG4gICAgICAgIGxldCBkYiA9IHRoaXMuZGI7XG4gICAgICAgIGxldCBzdG10ID0gZGIucHJlcGFyZShEYi5xdWVyeV9pbnNlcnRfdmVyc2lvbik7XG4gICAgICAgIHN0bXQucnVuKGRhdGEuZGF0YWJhc2VWZXJzaW9uKTtcbiAgICAgICAgc3RtdC5maW5hbGl6ZSgpO1xuXG4gICAgICAgIHN0bXQgPSBkYi5wcmVwYXJlKERiLnF1ZXJ5X3VwZGF0ZV92ZXJzaW9uKTtcbiAgICAgICAgc3RtdC5ydW4oZGF0YS5kYXRhYmFzZVZlcnNpb24pO1xuICAgICAgICBzdG10LmZpbmFsaXplKCk7XG5cbiAgICAgICAgaWYodHlwZW9mKGRhdGEubGF5b3V0X2ltYWdlcykgIT0gXCJ1bmRlZmluZWRcIiAmJiBkYXRhLmxheW91dF9pbWFnZXMubGVuZ3RoID4gMCl7XG4gICAgICAgICAgICBzdG10ID0gZGIucHJlcGFyZShEYi5xdWVyeV9pbnNlcnRfbGF5b3V0KTtcbiAgICAgICAgICAgIGxldCB1cHN0bXQgPSBkYi5wcmVwYXJlKERiLnF1ZXJ5X3VwZGF0ZV9sYXlvdXQpO1xuXG4gICAgICAgICAgICBkYXRhLmxheW91dF9pbWFnZXMuZm9yRWFjaChmdW5jdGlvbihlbCl7XG4gICAgICAgICAgICAgICAgbGV0IGlkID0gZWwuaWQ7XG4gICAgICAgICAgICAgICAgbGV0IGZsb29yX3BsYW5fbmFtZSA9IGVsLmZsb29ycGxhbm5hbWU7XG4gICAgICAgICAgICAgICAgbGV0IHN0cmluZ2RhdGEgPSBKU09OLnN0cmluZ2lmeShlbCk7XG4gICAgICAgICAgICAgICAgc3RtdC5ydW4oaWQsIHN0cmluZ2RhdGEsIGZsb29yX3BsYW5fbmFtZSk7XG4gICAgICAgICAgICAgICAgdXBzdG10LnJ1bihzdHJpbmdkYXRhLCBmbG9vcl9wbGFuX25hbWUsIGlkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc3RtdC5maW5hbGl6ZSgpO1xuICAgICAgICAgICAgdXBzdG10LmZpbmFsaXplKCk7XG4gICAgICAgIH1cblxuICAgICAgICBjYigpO1xuICAgIH1cblxuICAgIHNhdmVSZWFkaW5ncyhwYXlsb2FkLCBjYil7XG4gICAgICAgIGxldCBsb2cgPSB0aGlzLmxvZztcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgbG9nLmRlYnVnKFwiRGIuc2F2ZVJlYWRpbmdzXCIpO1xuXG4gICAgICAgIGxldCBzdG10ID0gZGIucHJlcGFyZShEYi5xdWVyeV9pbnNlcnRfc2Nhbl9yZXN1bHRzKTtcbiAgICAgICAgbGV0IGZpbmlzaGVkID0gMDtcbiAgICAgICAgZGIuZ2V0KERiLnF1ZXJ5X2dldF9zY2FuX2lkLCAoZXJyLCByb3cpID0+IHtcbiAgICAgICAgICAgIGRiLnJ1bihEYi5xdWVyeV91cGRhdGVfc2Nhbl9pZCk7XG4gICAgICAgICAgICBwYXlsb2FkLmZvckVhY2goKGVsKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHNfaWQgPSBOdW1iZXIocm93LnZhbHVlKTtcbiAgICAgICAgICAgICAgICBsZXQgZnBfaWQgPSBlbC5mcF9pZDtcbiAgICAgICAgICAgICAgICBsZXQgYXBfaWQgPSBlbC5hcF9pZDtcbiAgICAgICAgICAgICAgICBsZXQgeCA9IE51bWJlcihlbC54KTtcbiAgICAgICAgICAgICAgICBsZXQgeSA9IE51bWJlcihlbC55KTtcbiAgICAgICAgICAgICAgICBsZXQgdmFsdWUgPSBOdW1iZXIoZWwudmFsdWUpO1xuICAgICAgICAgICAgICAgIGxldCBvcmlnX3ZhbHVlcyA9IGVsLm9yaWdfdmFsdWVzO1xuICAgICAgICAgICAgICAgIGxldCBjcmVhdGVkID0gZWwuY3JlYXRlZDtcbiAgICAgICAgICAgICAgICBzdG10LnJ1bihzX2lkLCBmcF9pZCwgYXBfaWQsIHgsIHksIHZhbHVlLCBvcmlnX3ZhbHVlcywgY3JlYXRlZCwgKGVycikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBmaW5pc2hlZCsrO1xuICAgICAgICAgICAgICAgICAgICBpZihmaW5pc2hlZCA+PSBwYXlsb2FkLmxlbmd0aCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdG10LmZpbmFsaXplKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUthbG1hbihmcF9pZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB1cGRhdGVLYWxtYW4oZnBfaWQpe1xuICAgICAgICBsZXQgbG9nID0gdGhpcy5sb2c7XG4gICAgICAgIGxldCBkYiA9IHRoaXMuZGI7XG4gICAgICAgIGxldCBrYWxtYW4gPSB7fTtcblxuICAgICAgICBkYi5hbGwoRGIucXVlcnlfZ2V0X2Zvcl9rYWxtYW4sIGZwX2lkLCAoZXJyLCByb3dzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpbnNlcnQgPSBkYi5wcmVwYXJlKERiLnF1ZXJ5X2luc2VydF9rYWxtYW5fZXN0aW1hdGVzKTtcbiAgICAgICAgICAgIGNvbnN0IHVwZGF0ZSA9IGRiLnByZXBhcmUoRGIucXVlcnlfdXBkYXRlX2thbG1hbl9lc3RpbWF0ZXMpO1xuXG4gICAgICAgICAgICBpZihlcnIpIHtcbiAgICAgICAgICAgICAgICBsb2cuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBkb25lID0gMDtcbiAgICAgICAgICAgIHJvd3MuZm9yRWFjaCgocm93KSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGsgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mKGthbG1hbltyb3cuZnBfaWQgKyByb3cuYXBfaWQgKyByb3cueCArIHJvdy55XSkgPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgICAgICBrYWxtYW5bcm93LmZwX2lkICsgcm93LmFwX2lkICsgcm93LnggKyByb3cueV0gPSBuZXcgS2FsbWFuRmlsdGVyKHJvdy5jZXN0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgayA9IGthbG1hbltyb3cuZnBfaWQgKyByb3cuYXBfaWQgKyByb3cueCArIHJvdy55XTtcblxuICAgICAgICAgICAgICAgIGxldCB2YWx1ZXMgPSByb3cudmFsdWVzXG4gICAgICAgICAgICAgICAgICAgIC5zcGxpdChcIixcIilcbiAgICAgICAgICAgICAgICAgICAgLm1hcCgoZWwpID0+IHsgcmV0dXJuIE51bWJlcihlbCk7IH0pO1xuXG4gICAgICAgICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHZhbHVlcy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICAgICAgICAgIGsuYWRkU2FtcGxlKHZhbHVlc1tpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGluc2VydC5ydW4ocm93LmZwX2lkLCByb3cuYXBfaWQsIHJvdy54LCByb3cueSwgay5nZXRFc3RpbWF0ZSgpLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZS5ydW4oay5nZXRFc3RpbWF0ZSgpLCByb3cuZnBfaWQsIHJvdy5hcF9pZCwgcm93LngsIHJvdy55LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb25lKys7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihkb25lID49IHJvd3MubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnNlcnQuZmluYWxpemUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGUuZmluYWxpemUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYi5zZXJpYWxpemUoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYi5ydW4oXCJkZWxldGUgZnJvbSBmZWF0dXJlcyB3aGVyZSBmcF9pZCA9ID9cIiwgZnBfaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYi5ydW4oRGIucXVlcnlfdXBkYXRlX2ZlYXR1cmVzLCBmcF9pZCwgZnBfaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBEYjsiXX0=
//# sourceMappingURL=Db.js.map
