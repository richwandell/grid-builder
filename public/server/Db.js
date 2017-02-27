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

            var databaseVersion = 0;
            var databaseCodeVersion = 0;

            db.all("select * from settings", function (err, rows) {
                rows.forEach(function (row) {
                    switch (row.key) {
                        case "database_version":
                            databaseVersion = Number(row.value);
                            break;

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
                    var stringdata = JSON.stringify(el);
                    stmt.run(id, stringdata);
                    upstmt.run(stringdata, id);
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

Db.database_code_version = 0;
Db.query_get_all_floorplans = "select * from layout_images";
Db.query_get_database_version = "select value from settings where key = 'database_version';";
Db.query_insert_version = "insert or ignore into settings values ('database_version', ?);";
Db.query_update_version = "update settings set value = ? where key = 'database_version';";
Db.query_insert_layout = "insert or ignore into layout_images values (?, ?);";
Db.query_update_layout = "update layout_images set layout_image = ? where id = ?;";
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
Db.migration1 = ["ALTER TABLE scan_results ADD created TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;", "update settings set val = '" + Db.database_code_version + "' where key = 'database_code_version';"];


module.exports = Db;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRiLmVzNiJdLCJuYW1lcyI6WyJzcWxpdGUzIiwicmVxdWlyZSIsInZlcmJvc2UiLCJEYiIsImxvZyIsImRiIiwiRGF0YWJhc2UiLCJkZWJ1ZyIsImRhdGFiYXNlQ29kZVZlcnNpb24iLCJzZXJpYWxpemUiLCJtaWdyYXRpb24xIiwiZm9yRWFjaCIsIm1pZyIsInJ1biIsImNyZWF0ZXMiLCJjcmVhdGUiLCJkYXRhYmFzZVZlcnNpb24iLCJhbGwiLCJlcnIiLCJyb3dzIiwicm93Iiwia2V5IiwiTnVtYmVyIiwidmFsdWUiLCJkYXRhYmFzZV9jb2RlX3ZlcnNpb24iLCJkb1VwZ3JhZGUiLCJjYiIsInF1ZXJ5X2dldF9hbGxfZmxvb3JwbGFucyIsInF1ZXJ5X2dldF9kYXRhYmFzZV92ZXJzaW9uIiwiZGF0YSIsInN0bXQiLCJwcmVwYXJlIiwicXVlcnlfaW5zZXJ0X3ZlcnNpb24iLCJmaW5hbGl6ZSIsInF1ZXJ5X3VwZGF0ZV92ZXJzaW9uIiwibGF5b3V0X2ltYWdlcyIsImxlbmd0aCIsInF1ZXJ5X2luc2VydF9sYXlvdXQiLCJ1cHN0bXQiLCJxdWVyeV91cGRhdGVfbGF5b3V0IiwiZWwiLCJpZCIsInN0cmluZ2RhdGEiLCJKU09OIiwic3RyaW5naWZ5IiwicGF5bG9hZCIsInF1ZXJ5X2luc2VydF9zY2FuX3Jlc3VsdHMiLCJzX2lkIiwiZnBfaWQiLCJhcF9pZCIsIngiLCJ5Iiwib3JpZ192YWx1ZXMiLCJjcmVhdGVkIiwidXBkYXRlS2FsbWFuIiwia2FsbWFuIiwicXVlcnlfZ2V0X2Zvcl9rYWxtYW4iLCJpbnNlcnQiLCJxdWVyeV9pbnNlcnRfa2FsbWFuX2VzdGltYXRlcyIsInVwZGF0ZSIsInF1ZXJ5X3VwZGF0ZV9rYWxtYW5fZXN0aW1hdGVzIiwiZG9uZSIsImsiLCJjZXN0IiwidmFsdWVzIiwic3BsaXQiLCJtYXAiLCJpIiwiYWRkU2FtcGxlIiwiZ2V0RXN0aW1hdGUiLCJleGVjIiwicXVlcnlfdXBkYXRlX2ZlYXR1cmVzIiwicXVlcnlfZ2V0X3NjYW5f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QURnQixFQUVoQixnQ0FBZ0NQLEdBQUdxQixxQkFBbkMsR0FBMkQsd0NBRjNDLEM7OztBQTJLeEJtRCxPQUFPQyxPQUFQLEdBQWlCekUsRUFBakIiLCJmaWxlIjoiRGIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgS2FsbWFuRmlsdGVyIGZyb20gJy4vS2FsbWFuRmlsdGVyJztcblxubGV0IHNxbGl0ZTMgPSByZXF1aXJlKCdzcWxpdGUzJykudmVyYm9zZSgpO1xuXG5jbGFzcyBEYiB7XG5cbiAgICBzdGF0aWMgZGF0YWJhc2VfY29kZV92ZXJzaW9uID0gMDtcbiAgICBzdGF0aWMgcXVlcnlfZ2V0X2FsbF9mbG9vcnBsYW5zID0gXCJzZWxlY3QgKiBmcm9tIGxheW91dF9pbWFnZXNcIjtcbiAgICBzdGF0aWMgcXVlcnlfZ2V0X2RhdGFiYXNlX3ZlcnNpb24gPSBcInNlbGVjdCB2YWx1ZSBmcm9tIHNldHRpbmdzIHdoZXJlIGtleSA9ICdkYXRhYmFzZV92ZXJzaW9uJztcIjtcbiAgICBzdGF0aWMgcXVlcnlfaW5zZXJ0X3ZlcnNpb24gPSBcImluc2VydCBvciBpZ25vcmUgaW50byBzZXR0aW5ncyB2YWx1ZXMgKCdkYXRhYmFzZV92ZXJzaW9uJywgPyk7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X3VwZGF0ZV92ZXJzaW9uID0gXCJ1cGRhdGUgc2V0dGluZ3Mgc2V0IHZhbHVlID0gPyB3aGVyZSBrZXkgPSAnZGF0YWJhc2VfdmVyc2lvbic7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X2luc2VydF9sYXlvdXQgPSBcImluc2VydCBvciBpZ25vcmUgaW50byBsYXlvdXRfaW1hZ2VzIHZhbHVlcyAoPywgPyk7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X3VwZGF0ZV9sYXlvdXQgPSBcInVwZGF0ZSBsYXlvdXRfaW1hZ2VzIHNldCBsYXlvdXRfaW1hZ2UgPSA/IHdoZXJlIGlkID0gPztcIjtcbiAgICBzdGF0aWMgcXVlcnlfaW5zZXJ0X3NjYW5fcmVzdWx0cyA9IFwiaW5zZXJ0IG9yIGlnbm9yZSBpbnRvIHNjYW5fcmVzdWx0cyB2YWx1ZXMgKD8sID8sID8sID8sID8sID8sID8sID8pO1wiO1xuICAgIHN0YXRpYyBxdWVyeV9nZXRfc2Nhbl9yZXN1bHRzID0gXCJzZWxlY3QgKiBmcm9tIHNjYW5fcmVzdWx0cztcIjtcbiAgICBzdGF0aWMgcXVlcnlfZ2V0X2Zvcl9rYWxtYW4gPSBcIlNFTEVDVCBzLmZwX2lkLCBzLmFwX2lkLCBzLngsIHMueSwgXCJcbiAgICArIFwiZ3JvdXBfY29uY2F0KHMudmFsdWUpIGB2YWx1ZXNgLCBcIlxuICAgICsgXCJjYXNlIHdoZW4gay5rYWxtYW4gaXMgbnVsbCB0aGVuIGF2ZyhzLnZhbHVlKSBlbHNlIGsua2FsbWFuIGVuZCBgY2VzdGAsIFwiXG4gICAgKyBcImsua2FsbWFuIEZST00gc2Nhbl9yZXN1bHRzIHMgbGVmdCBqb2luIFwiXG4gICAgKyBcImthbG1hbl9lc3RpbWF0ZXMgayBvbiBzLmZwX2lkID0gay5mcF9pZCBhbmQgcy5hcF9pZCA9IGsuYXBfaWQgYW5kIHMueCA9IGsueCBhbmQgcy55ID0gay55IFwiXG4gICAgKyBcIkdST1VQIEJZIHMuZnBfaWQsIHMuYXBfaWQsIHMueCwgcy55O1wiO1xuICAgIHN0YXRpYyBxdWVyeV9pbnNlcnRfa2FsbWFuX2VzdGltYXRlcyA9IFwiaW5zZXJ0IG9yIGlnbm9yZSBpbnRvIGthbG1hbl9lc3RpbWF0ZXMgdmFsdWVzICg/LCA/LCA/LCA/LCA/KTtcIlxuICAgIHN0YXRpYyBxdWVyeV91cGRhdGVfa2FsbWFuX2VzdGltYXRlcyA9IFwidXBkYXRlIGthbG1hbl9lc3RpbWF0ZXMgc2V0IGthbG1hbiA9ID8gd2hlcmUgZnBfaWQgPSA/IGFuZCBhcF9pZCA9ID8gYW5kIFwiXG4gICAgKyBcIiB4ID0gPyBhbmQgeSA9ID87XCI7XG4gICAgc3RhdGljIHF1ZXJ5X3VwZGF0ZV9mZWF0dXJlcyA9IFwiaW5zZXJ0IGludG8gZmVhdHVyZXMgXCJcbiAgICArIFwiIHNlbGVjdCBrLmZwX2lkLCBrLngsIGsueSwgay5hcF9pZCB8fCBrMS5hcF9pZCBhcyBmZWF0dXJlLCBhYnMoay5rYWxtYW4gLSBrMS5rYWxtYW4pIGFzIHZhbHVlIFwiXG4gICAgKyBcIiBmcm9tIGthbG1hbl9lc3RpbWF0ZXMgayBqb2luIGthbG1hbl9lc3RpbWF0ZXMgazEgb24gay5mcF9pZCA9IGsxLmZwX2lkIGFuZCBrLnggPSBrMS54IGFuZCBrLnkgPSBrMS55IFwiXG4gICAgKyBcIiB3aGVyZSBrLmthbG1hbiAhPSAwIGFuZCBrMS5rYWxtYW4gIT0gMDtcIjtcblxuICAgIHN0YXRpYyBxdWVyeV9nZXRfZmVhdHVyZXMgPSBcInNlbGVjdCBmLiosIGFicyh2YWx1ZSAtIDpmZWF0dXJlX3ZhbHVlOikgZGlmZiBmcm9tIGZlYXR1cmVzIGYgXCJcbiAgICArIFwiIHdoZXJlIGYuZmVhdHVyZSA9ID8gYW5kIGYuZnBfaWQgPSA/IG9yZGVyIGJ5IGRpZmYgYXNjO1wiO1xuXG4gICAgc3RhdGljIGNyZWF0ZXMgPSBbXG4gICAgICAgIFwiQ1JFQVRFIFRBQkxFIGlmIG5vdCBleGlzdHMgbGF5b3V0X2ltYWdlcyAoaWQgVEVYVCBQUklNQVJZIEtFWSwgbGF5b3V0X2ltYWdlIFRFWFQpO1wiLFxuICAgICAgICBcIkNSRUFURSBVTklRVUUgSU5ERVggaWYgbm90IGV4aXN0cyBsYXlvdXRfaW1hZ2VzX2lkX3VpbmRleCBPTiBsYXlvdXRfaW1hZ2VzIChpZCk7XCIsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENyZWF0ZSB0aGUgc2V0dGluZ3MgdGFibGUgd2l0aCBkZWZhdWx0IHNldHRpbmdzXG4gICAgICAgICAqL1xuICAgICAgICBcImNyZWF0ZSB0YWJsZSBpZiBub3QgZXhpc3RzIHNldHRpbmdzIChrZXkgVEVYVCBQUklNQVJZIEtFWSwgdmFsdWUgVEVYVCk7XCIsXG4gICAgICAgIFwiY3JlYXRlIHVuaXF1ZSBpbmRleCBpZiBub3QgZXhpc3RzIHNldHRpbmdzX2tleSBvbiBzZXR0aW5ncyAoa2V5KTtcIixcbiAgICAgICAgXCJpbnNlcnQgb3IgaWdub3JlIGludG8gc2V0dGluZ3MgKGtleSwgdmFsdWUpIHZhbHVlcyAoJ2RhdGFiYXNlX3ZlcnNpb24nLCAwKTtcIixcbiAgICAgICAgXCJpbnNlcnQgb3IgaWdub3JlIGludG8gc2V0dGluZ3MgKGtleSwgdmFsdWUpIHZhbHVlcyAoJ2RhdGFiYXNlX2NvZGVfdmVyc2lvbicsIDApO1wiLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBhcF9pZCA9IGFjY2VzcyBwb2ludCBpZFxuICAgICAgICAgKiBmcF9pZCA9IGZsb29ycGxhbiBpZFxuICAgICAgICAgKi9cbiAgICAgICAgXCJDUkVBVEUgVEFCTEUgaWYgbm90IGV4aXN0cyBzY2FuX3Jlc3VsdHMgXCIgK1xuICAgICAgICBcIihzX2lkIElOVEVHRVIsIGZwX2lkIFRFWFQsIGFwX2lkIFRFWFQsIHggSU5URUdFUiwgXCIgK1xuICAgICAgICBcInkgSU5URUdFUiwgdmFsdWUgUkVBTCwgb3JpZ192YWx1ZXMgVEVYVCwgY3JlYXRlZCBUSU1FU1RBTVAgREVGQVVMVCBDVVJSRU5UX1RJTUVTVEFNUCBOT1QgTlVMTCwgXCIgK1xuICAgICAgICBcIlBSSU1BUlkgS0VZIChzX2lkLCBmcF9pZCwgYXBfaWQpLCBcIiArXG4gICAgICAgIFwiQ09OU1RSQUlOVCBzY2FuX3Jlc3VsdHNfbGF5b3V0X2ltYWdlc19pZF9mayBGT1JFSUdOIEtFWSAoZnBfaWQpIFJFRkVSRU5DRVMgbGF5b3V0X2ltYWdlcyAoaWQpKTtcIixcbiAgICAgICAgXCJjcmVhdGUgaW5kZXggaWYgbm90IGV4aXN0cyB4X2FuZF95IG9uIHNjYW5fcmVzdWx0cyAoeCwgeSk7XCIsXG5cbiAgICAgICAgXCJDUkVBVEUgVEFCTEUgaWYgbm90IGV4aXN0cyBrYWxtYW5fZXN0aW1hdGVzIChmcF9pZCBURVhULCBhcF9pZCBURVhULCB4IElOVEVHRVIsIFwiXG4gICAgICAgICsgXCJ5IElOVEVHRVIsIGthbG1hbiBSRUFMLCBcIlxuICAgICAgICArIFwiQ09OU1RSQUlOVCBrYWxtYW5fZXN0aW1hdGVzX2ZwX2lkX2FwX2lkX3hfeV9wayBQUklNQVJZIEtFWSAoZnBfaWQsIGFwX2lkLCB4LCB5KSxcIlxuICAgICAgICArIFwiRk9SRUlHTiBLRVkgKGFwX2lkLCBmcF9pZCwgeCwgeSkgUkVGRVJFTkNFUyBzY2FuX3Jlc3VsdHMgKGFwX2lkLCBmcF9pZCwgeCwgeSkgT04gREVMRVRFIENBU0NBREUpXCIsXG5cbiAgICAgICAgXCJDUkVBVEUgVEFCTEUgaWYgbm90IGV4aXN0cyBmZWF0dXJlcyAoZnBfaWQgVEVYVCwgeCBJTlRFR0VSLCB5IElOVEVHRVIsIGZlYXR1cmUgVEVYVCwgdmFsdWUgUkVBTCwgXCJcbiAgICAgICAgKyBcIiBDT05TVFJBSU5UIGZlYXR1cmVzX2ZwX2lkX3hfeV9mZWF0dXJlX3BrIFBSSU1BUlkgS0VZIChmcF9pZCwgeCwgeSwgZmVhdHVyZSkpO1wiLFxuICAgICAgICBcIkNSRUFURSBVTklRVUUgSU5ERVggaWYgbm90IGV4aXN0cyBmZWF0dXJlc19mZWF0dXJlX2luZGV4MSBPTiBmZWF0dXJlcyhmcF9pZCxmZWF0dXJlLHgseSk7XCIsXG4gICAgICAgIFwiQ1JFQVRFIElOREVYIGlmIG5vdCBleGlzdHMgZmVhdHVyZXNfZmVhdHVyZV9pbmRleDIgT04gZmVhdHVyZXMoZmVhdHVyZSk7XCJcbiAgICBdO1xuXG4gICAgc3RhdGljIGRyb3BzID0gW1xuICAgICAgICBcImRyb3AgdGFibGUgaWYgZXhpc3RzIGxheW91dF9pbWFnZXM7XCIsXG4gICAgICAgIFwiZHJvcCB0YWJsZSBpZiBleGlzdHMgc2V0dGluZ3M7XCIsXG4gICAgICAgIFwiZHJvcCB0YWJsZSBpZiBleGlzdHMgc2Nhbl9yZXN1bHRzO1wiLFxuICAgICAgICBcImRyb3AgdGFibGUgaWYgZXhpc3RzIGthbG1hbl9lc3RpbWF0ZXM7XCJcbiAgICBdO1xuXG4gICAgc3RhdGljIG1pZ3JhdGlvbjEgPSBbXG4gICAgICAgIFwiQUxURVIgVEFCTEUgc2Nhbl9yZXN1bHRzIEFERCBjcmVhdGVkIFRJTUVTVEFNUCBERUZBVUxUIENVUlJFTlRfVElNRVNUQU1QIE5PVCBOVUxMO1wiLFxuICAgICAgICBcInVwZGF0ZSBzZXR0aW5ncyBzZXQgdmFsID0gJ1wiICsgRGIuZGF0YWJhc2VfY29kZV92ZXJzaW9uICsgXCInIHdoZXJlIGtleSA9ICdkYXRhYmFzZV9jb2RlX3ZlcnNpb24nO1wiXG4gICAgXTtcblxuICAgIGNvbnN0cnVjdG9yKGxvZyl7XG4gICAgICAgIHRoaXMubG9nID0gbG9nO1xuICAgICAgICB0aGlzLmRiID0gbmV3IHNxbGl0ZTMuRGF0YWJhc2UoJ2RiLnNxbGl0ZTMnKTtcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoXCJEYi5jb25zdHJ1Y3RvclwiKTtcbiAgICB9XG5cbiAgICBnZXREYXRhYmFzZSgpe1xuICAgICAgICByZXR1cm4gdGhpcy5kYjtcbiAgICB9XG5cbiAgICBkb1VwZ3JhZGUoZGF0YWJhc2VDb2RlVmVyc2lvbikge1xuICAgICAgICB0aGlzLmxvZy5kZWJ1ZyhcIkRiLmRvVXBncmFkZVwiKTtcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgc3dpdGNoKGRhdGFiYXNlQ29kZVZlcnNpb24pe1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgIGRiLnNlcmlhbGl6ZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgRGIubWlncmF0aW9uMS5mb3JFYWNoKGZ1bmN0aW9uKG1pZyl7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYi5ydW4obWlnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIHRoZSBzcWxpdGUgdGFibGVzXG4gICAgICovXG4gICAgY3JlYXRlVGFibGVzKCkge1xuICAgICAgICB0aGlzLmxvZy5kZWJ1ZyhcIkRiLmNyZWF0ZVRhYmxlc1wiKTtcbiAgICAgICAgbGV0IGNyZWF0ZXMgPSBEYi5jcmVhdGVzO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuXG4gICAgICAgIGRiLnNlcmlhbGl6ZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGNyZWF0ZXMuZm9yRWFjaChmdW5jdGlvbihjcmVhdGUpe1xuICAgICAgICAgICAgICAgIGRiLnJ1bihjcmVhdGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBkYXRhYmFzZVZlcnNpb24gPSAwO1xuICAgICAgICBsZXQgZGF0YWJhc2VDb2RlVmVyc2lvbiA9IDA7XG5cbiAgICAgICAgZGIuYWxsKFwic2VsZWN0ICogZnJvbSBzZXR0aW5nc1wiLCAoZXJyLCByb3dzKSA9PiB7XG4gICAgICAgICAgICByb3dzLmZvckVhY2goZnVuY3Rpb24ocm93KXtcbiAgICAgICAgICAgICAgICBzd2l0Y2gocm93LmtleSl7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJkYXRhYmFzZV92ZXJzaW9uXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhYmFzZVZlcnNpb24gPSBOdW1iZXIocm93LnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJkYXRhYmFzZV9jb2RlX3ZlcnNpb25cIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFiYXNlQ29kZVZlcnNpb24gPSBOdW1iZXIocm93LnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYoZGF0YWJhc2VDb2RlVmVyc2lvbiA8IERiLmRhdGFiYXNlX2NvZGVfdmVyc2lvbil7XG4gICAgICAgICAgICAgICAgdGhpcy5kb1VwZ3JhZGUoZGF0YWJhc2VDb2RlVmVyc2lvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldEZsb29yUGxhbnMoY2IpIHtcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoXCJEYi5nZXRGbG9vclBsYW5zXCIpO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBkYi5hbGwoRGIucXVlcnlfZ2V0X2FsbF9mbG9vcnBsYW5zLCBjYik7XG4gICAgfVxuXG4gICAgZ2V0RGF0YWJhc2VWZXJzaW9uKGNiKSB7XG4gICAgICAgIHRoaXMubG9nLmRlYnVnKFwiRGIuZ2V0RGF0YWJhc2VWZXJzaW9uXCIpO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBkYi5hbGwoRGIucXVlcnlfZ2V0X2RhdGFiYXNlX3ZlcnNpb24sIGNiKTtcbiAgICB9XG5cbiAgICB1cGRhdGVEYXRhYmFzZShkYXRhLCBjYikge1xuICAgICAgICB0aGlzLmxvZy5kZWJ1ZyhcIkRiLnVwZGF0ZURhdGFiYXNlXCIpO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBsZXQgc3RtdCA9IGRiLnByZXBhcmUoRGIucXVlcnlfaW5zZXJ0X3ZlcnNpb24pO1xuICAgICAgICBzdG10LnJ1bihkYXRhLmRhdGFiYXNlVmVyc2lvbik7XG4gICAgICAgIHN0bXQuZmluYWxpemUoKTtcblxuICAgICAgICBzdG10ID0gZGIucHJlcGFyZShEYi5xdWVyeV91cGRhdGVfdmVyc2lvbik7XG4gICAgICAgIHN0bXQucnVuKGRhdGEuZGF0YWJhc2VWZXJzaW9uKTtcbiAgICAgICAgc3RtdC5maW5hbGl6ZSgpO1xuXG4gICAgICAgIGlmKHR5cGVvZihkYXRhLmxheW91dF9pbWFnZXMpICE9IFwidW5kZWZpbmVkXCIgJiYgZGF0YS5sYXlvdXRfaW1hZ2VzLmxlbmd0aCA+IDApe1xuICAgICAgICAgICAgc3RtdCA9IGRiLnByZXBhcmUoRGIucXVlcnlfaW5zZXJ0X2xheW91dCk7XG4gICAgICAgICAgICBsZXQgdXBzdG10ID0gZGIucHJlcGFyZShEYi5xdWVyeV91cGRhdGVfbGF5b3V0KTtcblxuICAgICAgICAgICAgZGF0YS5sYXlvdXRfaW1hZ2VzLmZvckVhY2goZnVuY3Rpb24oZWwpe1xuICAgICAgICAgICAgICAgIGxldCBpZCA9IGVsLmlkO1xuICAgICAgICAgICAgICAgIGxldCBzdHJpbmdkYXRhID0gSlNPTi5zdHJpbmdpZnkoZWwpO1xuICAgICAgICAgICAgICAgIHN0bXQucnVuKGlkLCBzdHJpbmdkYXRhKTtcbiAgICAgICAgICAgICAgICB1cHN0bXQucnVuKHN0cmluZ2RhdGEsIGlkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc3RtdC5maW5hbGl6ZSgpO1xuICAgICAgICAgICAgdXBzdG10LmZpbmFsaXplKCk7XG4gICAgICAgIH1cblxuICAgICAgICBjYigpO1xuICAgIH1cblxuICAgIHNhdmVSZWFkaW5ncyhwYXlsb2FkLCBjYil7XG4gICAgICAgIGxldCBsb2cgPSB0aGlzLmxvZztcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgbG9nLmRlYnVnKFwiRGIuc2F2ZVJlYWRpbmdzXCIpO1xuXG4gICAgICAgIGxldCBzdG10ID0gZGIucHJlcGFyZShEYi5xdWVyeV9pbnNlcnRfc2Nhbl9yZXN1bHRzKTtcblxuICAgICAgICBwYXlsb2FkLmZvckVhY2goKGVsKSA9PiB7XG4gICAgICAgICAgICBsZXQgc19pZCA9IE51bWJlcihlbC5zX2lkKTtcbiAgICAgICAgICAgIGxldCBmcF9pZCA9IGVsLmZwX2lkO1xuICAgICAgICAgICAgbGV0IGFwX2lkID0gZWwuYXBfaWQ7XG4gICAgICAgICAgICBsZXQgeCA9IE51bWJlcihlbC54KTtcbiAgICAgICAgICAgIGxldCB5ID0gTnVtYmVyKGVsLnkpO1xuICAgICAgICAgICAgbGV0IHZhbHVlID0gTnVtYmVyKGVsLnZhbHVlKTtcbiAgICAgICAgICAgIGxldCBvcmlnX3ZhbHVlcyA9IGVsLm9yaWdfdmFsdWVzO1xuICAgICAgICAgICAgbGV0IGNyZWF0ZWQgPSBlbC5jcmVhdGVkO1xuICAgICAgICAgICAgc3RtdC5ydW4oc19pZCwgZnBfaWQsIGFwX2lkLCB4LCB5LCB2YWx1ZSwgb3JpZ192YWx1ZXMsIGNyZWF0ZWQpO1xuICAgICAgICB9KTtcblxuICAgICAgICBzdG10LmZpbmFsaXplKCk7XG4gICAgICAgIHRoaXMudXBkYXRlS2FsbWFuKCk7XG4gICAgfVxuXG4gICAgdXBkYXRlS2FsbWFuKCl7XG4gICAgICAgIGxldCBsb2cgPSB0aGlzLmxvZztcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgbGV0IGthbG1hbiA9IHt9O1xuXG4gICAgICAgIGRiLmFsbChEYi5xdWVyeV9nZXRfZm9yX2thbG1hbiwgKGVyciwgcm93cykgPT4ge1xuICAgICAgICAgICAgY29uc3QgaW5zZXJ0ID0gZGIucHJlcGFyZShEYi5xdWVyeV9pbnNlcnRfa2FsbWFuX2VzdGltYXRlcyk7XG4gICAgICAgICAgICBjb25zdCB1cGRhdGUgPSBkYi5wcmVwYXJlKERiLnF1ZXJ5X3VwZGF0ZV9rYWxtYW5fZXN0aW1hdGVzKTtcbiAgICAgICAgICAgIGxvZy5sb2coZXJyKTtcbiAgICAgICAgICAgIGlmKGVycikgcmV0dXJuO1xuXG4gICAgICAgICAgICBsZXQgZG9uZSA9IDA7XG4gICAgICAgICAgICByb3dzLmZvckVhY2goKHJvdykgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBrID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZihrYWxtYW5bcm93LmZwX2lkICsgcm93LmFwX2lkICsgcm93LnggKyByb3cueV0pID09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAga2FsbWFuW3Jvdy5mcF9pZCArIHJvdy5hcF9pZCArIHJvdy54ICsgcm93LnldID0gbmV3IEthbG1hbkZpbHRlcihyb3cuY2VzdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGsgPSBrYWxtYW5bcm93LmZwX2lkICsgcm93LmFwX2lkICsgcm93LnggKyByb3cueV07XG5cbiAgICAgICAgICAgICAgICBsZXQgdmFsdWVzID0gcm93LnZhbHVlc1xuICAgICAgICAgICAgICAgICAgICAuc3BsaXQoXCIsXCIpXG4gICAgICAgICAgICAgICAgICAgIC5tYXAoKGVsKSA9PiB7IHJldHVybiBOdW1iZXIoZWwpOyB9KTtcblxuICAgICAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCB2YWx1ZXMubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgICAgICAgICBrLmFkZFNhbXBsZSh2YWx1ZXNbaV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpbnNlcnQucnVuKHJvdy5mcF9pZCwgcm93LmFwX2lkLCByb3cueCwgcm93LnksIGsuZ2V0RXN0aW1hdGUoKSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB1cGRhdGUucnVuKGsuZ2V0RXN0aW1hdGUoKSwgcm93LmZwX2lkLCByb3cuYXBfaWQsIHJvdy54LCByb3cueSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoZG9uZSA+PSByb3dzLmxlbmd0aCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zZXJ0LmZpbmFsaXplKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlLmZpbmFsaXplKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGIuZXhlYyhcImRlbGV0ZSBmcm9tIGZlYXR1cmVzXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGIuZXhlYyhEYi5xdWVyeV91cGRhdGVfZmVhdHVyZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBEYjsiXX0=
//# sourceMappingURL=Db.js.map
