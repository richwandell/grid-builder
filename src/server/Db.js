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
            var _this2 = this;

            var log = this.log;
            var db = this.db;
            log.debug("Db.saveReadings");

            var stmt = db.prepare(Db.query_insert_scan_results);
            var finished = 0;
            payload.forEach(function (el) {
                var s_id = Number(el.s_id);
                var fp_id = el.fp_id;
                var ap_id = el.ap_id;
                var x = Number(el.x);
                var y = Number(el.y);
                var value = Number(el.value);
                var orig_values = el.orig_values;
                var created = el.created;
                stmt.run(s_id, fp_id, ap_id, x, y, value, orig_values, created, function () {
                    finished++;
                    if (finished >= payload.length) {
                        _this2.updateKalman(fp_id);
                    }
                });
            });

            stmt.finalize();
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
                                db.run("delete from features where fp_id = ?", fp_id, function () {
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

Db.database_code_version = 1;
Db.query_get_all_floorplans = "select * from layout_images";
Db.query_get_database_version = "select value from settings where key = 'database_version';";
Db.query_insert_version = "insert or ignore into settings values ('database_version', ?);";
Db.query_update_version = "update settings set value = ? where key = 'database_version';";
Db.query_insert_layout = "insert or ignore into layout_images values (?, ?, ?);";
Db.query_update_layout = "update layout_images set layout_image = ?, floor_plan_name = ? where id = ?;";
Db.query_insert_scan_results = "insert or ignore into scan_results values (?, ?, ?, ?, ?, ?, ?, ?);";
Db.query_get_scan_results = "select * from scan_results;";
Db.query_get_for_kalman = "SELECT s.fp_id, s.ap_id, s.x, s.y, " + "group_concat(s.value) `values`, " + "case when k.kalman is null then avg(s.value) else k.kalman end `cest`, " + "k.kalman FROM scan_results s left join " + "kalman_estimates k on s.fp_id = k.fp_id and s.ap_id = k.ap_id and s.x = k.x and s.y = k.y " + " where s.fp_id = ? GROUP BY s.fp_id, s.ap_id, s.x, s.y;";
Db.query_insert_kalman_estimates = "insert or ignore into kalman_estimates values (?, ?, ?, ?, ?);";
Db.query_update_kalman_estimates = "update kalman_estimates set kalman = ? where fp_id = ? and ap_id = ? and " + " x = ? and y = ?;";
Db.query_update_features = "insert into features " + " select k.fp_id, k.x, k.y, k.ap_id || k1.ap_id as feature, abs(k.kalman - k1.kalman) as value " + " from kalman_estimates k join kalman_estimates k1 on k.fp_id = k1.fp_id and k.x = k1.x and k.y = k1.y and k.ap_id < k1.ap_id" + " where k.kalman != 0 and k1.kalman != 0 and k.fp_id = ? and k1.fp_id = ?";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRiLmVzNiJdLCJuYW1lcyI6WyJzcWxpdGUzIiwicmVxdWlyZSIsInZlcmJvc2UiLCJEYiIsImxvZyIsImRiIiwiRGF0YWJhc2UiLCJkZWJ1ZyIsImRhdGFiYXNlQ29kZVZlcnNpb24iLCJzZXJpYWxpemUiLCJtaWdyYXRpb24xIiwiZm9yRWFjaCIsIm1pZyIsInJ1biIsImNyZWF0ZXMiLCJjcmVhdGUiLCJhbGwiLCJlcnIiLCJyb3dzIiwicm93Iiwia2V5IiwiTnVtYmVyIiwidmFsdWUiLCJkYXRhYmFzZV9jb2RlX3ZlcnNpb24iLCJkb1VwZ3JhZGUiLCJjYiIsInF1ZXJ5X2dldF9hbGxfZmxvb3JwbGFucyIsInF1ZXJ5X2dldF9kYXRhYmFzZV92ZXJzaW9uIiwiZGF0YSIsInN0bXQiLCJwcmVwYXJlIiwicXVlcnlfaW5zZXJ0X3ZlcnNpb24iLCJkYXRhYmFzZVZlcnNpb24iLCJmaW5hbGl6ZSIsInF1ZXJ5X3VwZGF0ZV92ZXJzaW9uIiwibGF5b3V0X2ltYWdlcyIsImxlbmd0aCIsInF1ZXJ5X2luc2VydF9sYXlvdXQiLCJ1cHN0bXQiLCJxdWVyeV91cGRhdGVfbGF5b3V0IiwiZWwiLCJpZCIsImZsb29yX3BsYW5fbmFtZSIsImZsb29ycGxhbm5hbWUiLCJzdHJpbmdkYXRhIiwiSlNPTiIsInN0cmluZ2lmeSIsInBheWxvYWQiLCJxdWVyeV9pbnNlcnRfc2Nhbl9yZXN1bHRzIiwiZmluaXNoZWQiLCJzX2lkIiwiZnBfaWQiLCJhcF9pZCIsIngiLCJ5Iiwib3JpZ192YWx1ZXMiLCJjcmVhdGVkIiwidXBkYXRlS2FsbWFuIiwia2FsbWFuIiwicXVlcnlfZ2V0X2Zvcl9rYWxtYW4iLCJpbnNlcnQiLCJxdWVyeV9pbnNlcnRfa2FsbWFuX2VzdGltYXRlcyIsInVwZGF0ZSIsInF1ZXJ5X3VwZGF0ZV9rYWxtYW5fZXN0aW1hdGVzIiwiZG9uZSIsImsiLCJjZXN0IiwidmFsdWVzIiwic3BsaXQiLCJtYXAiLCJpIiwiYWRkU2FtcGxlIiwiZ2V0RXN0aW1hdGUiLCJxdWVyeV91cGRhdGVfZmVhdHVyZXMiLCJxdWVyeV9nZXRfc2Nhbl9yZXN1bHRzIiwicXVlcnlfZ2V0X2ZlYXR1cmVzIiwiZHJvcHMiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7Ozs7Ozs7O0FBRUEsSUFBSUEsVUFBVUMsUUFBUSxTQUFSLEVBQW1CQyxPQUFuQixFQUFkOztJQUVNQyxFO0FBeUVGLGdCQUFZQyxHQUFaLEVBQWdCO0FBQUE7O0FBQ1osYUFBS0EsR0FBTCxHQUFXQSxHQUFYO0FBQ0EsYUFBS0MsRUFBTCxHQUFVLElBQUlMLFFBQVFNLFFBQVosQ0FBcUIsWUFBckIsQ0FBVjtBQUNBLGFBQUtGLEdBQUwsQ0FBU0csS0FBVCxDQUFlLGdCQUFmO0FBQ0g7Ozs7c0NBRVk7QUFDVCxtQkFBTyxLQUFLRixFQUFaO0FBQ0g7OztrQ0FFU0csbUIsRUFBcUI7QUFDM0IsaUJBQUtKLEdBQUwsQ0FBU0csS0FBVCxDQUFlLGNBQWY7QUFDQSxnQkFBSUYsS0FBSyxLQUFLQSxFQUFkO0FBQ0Esb0JBQU9HLG1CQUFQO0FBQ0kscUJBQUssQ0FBTDtBQUNJSCx1QkFBR0ksU0FBSCxDQUFhLFlBQVc7QUFDcEJOLDJCQUFHTyxVQUFILENBQWNDLE9BQWQsQ0FBc0IsVUFBU0MsR0FBVCxFQUFhO0FBQy9CUCwrQkFBR1EsR0FBSCxDQUFPRCxHQUFQO0FBQ0gseUJBRkQ7QUFHSCxxQkFKRDtBQUtBO0FBUFI7QUFTSDs7QUFFRDs7Ozs7O3VDQUdlO0FBQUE7O0FBQ1gsaUJBQUtSLEdBQUwsQ0FBU0csS0FBVCxDQUFlLGlCQUFmO0FBQ0EsZ0JBQUlPLFVBQVVYLEdBQUdXLE9BQWpCO0FBQ0EsZ0JBQUlULEtBQUssS0FBS0EsRUFBZDs7QUFFQUEsZUFBR0ksU0FBSCxDQUFhLFlBQU07QUFDZkssd0JBQVFILE9BQVIsQ0FBZ0IsVUFBU0ksTUFBVCxFQUFnQjtBQUM1QlYsdUJBQUdRLEdBQUgsQ0FBT0UsTUFBUDtBQUNILGlCQUZEOztBQUlBLG9CQUFJUCxzQkFBc0IsQ0FBMUI7O0FBRUFILG1C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LHFGQUNFLDBCQURGLEdBRUUsa0ZBRkYsR0FHRSxrR0ExQlcsRUE0QmIsc0dBQ0UsZ0ZBN0JXLEVBOEJiLDJGQTlCYSxFQStCYiwwRUEvQmEsQztBQTNCZlgsRSxDQTZES3lFLEssR0FBUSxDQUNYLHFDQURXLEVBRVgsZ0NBRlcsRUFHWCxvQ0FIVyxFQUlYLHdDQUpXLEM7QUE3RGJ6RSxFLENBb0VLTyxVLEdBQWEsQ0FDaEIsMERBRGdCLEVBRWhCLGtDQUFrQ1AsR0FBR29CLHFCQUFyQyxHQUE2RCx3Q0FGN0MsQzs7O0FBNEt4QnNELE9BQU9DLE9BQVAsR0FBaUIzRSxFQUFqQiIsImZpbGUiOiJEYi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBLYWxtYW5GaWx0ZXIgZnJvbSAnLi9LYWxtYW5GaWx0ZXInO1xuXG5sZXQgc3FsaXRlMyA9IHJlcXVpcmUoJ3NxbGl0ZTMnKS52ZXJib3NlKCk7XG5cbmNsYXNzIERiIHtcblxuICAgIHN0YXRpYyBkYXRhYmFzZV9jb2RlX3ZlcnNpb24gPSAxO1xuICAgIHN0YXRpYyBxdWVyeV9nZXRfYWxsX2Zsb29ycGxhbnMgPSBcInNlbGVjdCAqIGZyb20gbGF5b3V0X2ltYWdlc1wiO1xuICAgIHN0YXRpYyBxdWVyeV9nZXRfZGF0YWJhc2VfdmVyc2lvbiA9IFwic2VsZWN0IHZhbHVlIGZyb20gc2V0dGluZ3Mgd2hlcmUga2V5ID0gJ2RhdGFiYXNlX3ZlcnNpb24nO1wiO1xuICAgIHN0YXRpYyBxdWVyeV9pbnNlcnRfdmVyc2lvbiA9IFwiaW5zZXJ0IG9yIGlnbm9yZSBpbnRvIHNldHRpbmdzIHZhbHVlcyAoJ2RhdGFiYXNlX3ZlcnNpb24nLCA/KTtcIjtcbiAgICBzdGF0aWMgcXVlcnlfdXBkYXRlX3ZlcnNpb24gPSBcInVwZGF0ZSBzZXR0aW5ncyBzZXQgdmFsdWUgPSA/IHdoZXJlIGtleSA9ICdkYXRhYmFzZV92ZXJzaW9uJztcIjtcbiAgICBzdGF0aWMgcXVlcnlfaW5zZXJ0X2xheW91dCA9IFwiaW5zZXJ0IG9yIGlnbm9yZSBpbnRvIGxheW91dF9pbWFnZXMgdmFsdWVzICg/LCA/LCA/KTtcIjtcbiAgICBzdGF0aWMgcXVlcnlfdXBkYXRlX2xheW91dCA9IFwidXBkYXRlIGxheW91dF9pbWFnZXMgc2V0IGxheW91dF9pbWFnZSA9ID8sIGZsb29yX3BsYW5fbmFtZSA9ID8gd2hlcmUgaWQgPSA/O1wiO1xuICAgIHN0YXRpYyBxdWVyeV9pbnNlcnRfc2Nhbl9yZXN1bHRzID0gXCJpbnNlcnQgb3IgaWdub3JlIGludG8gc2Nhbl9yZXN1bHRzIHZhbHVlcyAoPywgPywgPywgPywgPywgPywgPywgPyk7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X2dldF9zY2FuX3Jlc3VsdHMgPSBcInNlbGVjdCAqIGZyb20gc2Nhbl9yZXN1bHRzO1wiO1xuICAgIHN0YXRpYyBxdWVyeV9nZXRfZm9yX2thbG1hbiA9IFwiU0VMRUNUIHMuZnBfaWQsIHMuYXBfaWQsIHMueCwgcy55LCBcIlxuICAgICsgXCJncm91cF9jb25jYXQocy52YWx1ZSkgYHZhbHVlc2AsIFwiXG4gICAgKyBcImNhc2Ugd2hlbiBrLmthbG1hbiBpcyBudWxsIHRoZW4gYXZnKHMudmFsdWUpIGVsc2Ugay5rYWxtYW4gZW5kIGBjZXN0YCwgXCJcbiAgICArIFwiay5rYWxtYW4gRlJPTSBzY2FuX3Jlc3VsdHMgcyBsZWZ0IGpvaW4gXCJcbiAgICArIFwia2FsbWFuX2VzdGltYXRlcyBrIG9uIHMuZnBfaWQgPSBrLmZwX2lkIGFuZCBzLmFwX2lkID0gay5hcF9pZCBhbmQgcy54ID0gay54IGFuZCBzLnkgPSBrLnkgXCJcbiAgICArIFwiIHdoZXJlIHMuZnBfaWQgPSA/IEdST1VQIEJZIHMuZnBfaWQsIHMuYXBfaWQsIHMueCwgcy55O1wiO1xuICAgIHN0YXRpYyBxdWVyeV9pbnNlcnRfa2FsbWFuX2VzdGltYXRlcyA9IFwiaW5zZXJ0IG9yIGlnbm9yZSBpbnRvIGthbG1hbl9lc3RpbWF0ZXMgdmFsdWVzICg/LCA/LCA/LCA/LCA/KTtcIlxuICAgIHN0YXRpYyBxdWVyeV91cGRhdGVfa2FsbWFuX2VzdGltYXRlcyA9IFwidXBkYXRlIGthbG1hbl9lc3RpbWF0ZXMgc2V0IGthbG1hbiA9ID8gd2hlcmUgZnBfaWQgPSA/IGFuZCBhcF9pZCA9ID8gYW5kIFwiXG4gICAgKyBcIiB4ID0gPyBhbmQgeSA9ID87XCI7XG4gICAgc3RhdGljIHF1ZXJ5X3VwZGF0ZV9mZWF0dXJlcyA9IFwiaW5zZXJ0IGludG8gZmVhdHVyZXMgXCJcbiAgICArIFwiIHNlbGVjdCBrLmZwX2lkLCBrLngsIGsueSwgay5hcF9pZCB8fCBrMS5hcF9pZCBhcyBmZWF0dXJlLCBhYnMoay5rYWxtYW4gLSBrMS5rYWxtYW4pIGFzIHZhbHVlIFwiXG4gICAgKyBcIiBmcm9tIGthbG1hbl9lc3RpbWF0ZXMgayBqb2luIGthbG1hbl9lc3RpbWF0ZXMgazEgb24gay5mcF9pZCA9IGsxLmZwX2lkIGFuZCBrLnggPSBrMS54IGFuZCBrLnkgPSBrMS55IGFuZCBrLmFwX2lkIDwgazEuYXBfaWRcIlxuICAgICsgXCIgd2hlcmUgay5rYWxtYW4gIT0gMCBhbmQgazEua2FsbWFuICE9IDAgYW5kIGsuZnBfaWQgPSA/IGFuZCBrMS5mcF9pZCA9ID9cIjtcbiAgICBzdGF0aWMgcXVlcnlfZ2V0X2ZlYXR1cmVzID0gXCJzZWxlY3QgZi4qLCBhYnModmFsdWUgLSA6ZmVhdHVyZV92YWx1ZTopIGRpZmYgZnJvbSBmZWF0dXJlcyBmIFwiXG4gICAgKyBcIiB3aGVyZSBmLmZlYXR1cmUgPSA/IGFuZCBmLmZwX2lkID0gPyBvcmRlciBieSBkaWZmIGFzYztcIjtcblxuICAgIHN0YXRpYyBjcmVhdGVzID0gW1xuICAgICAgICBcIkNSRUFURSBUQUJMRSBpZiBub3QgZXhpc3RzIGxheW91dF9pbWFnZXMgKGlkIFRFWFQgUFJJTUFSWSBLRVksIGxheW91dF9pbWFnZSBURVhUKTtcIixcbiAgICAgICAgXCJDUkVBVEUgVU5JUVVFIElOREVYIGlmIG5vdCBleGlzdHMgbGF5b3V0X2ltYWdlc19pZF91aW5kZXggT04gbGF5b3V0X2ltYWdlcyAoaWQpO1wiLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDcmVhdGUgdGhlIHNldHRpbmdzIHRhYmxlIHdpdGggZGVmYXVsdCBzZXR0aW5nc1xuICAgICAgICAgKi9cbiAgICAgICAgXCJjcmVhdGUgdGFibGUgaWYgbm90IGV4aXN0cyBzZXR0aW5ncyAoa2V5IFRFWFQgUFJJTUFSWSBLRVksIHZhbHVlIFRFWFQpO1wiLFxuICAgICAgICBcImNyZWF0ZSB1bmlxdWUgaW5kZXggaWYgbm90IGV4aXN0cyBzZXR0aW5nc19rZXkgb24gc2V0dGluZ3MgKGtleSk7XCIsXG4gICAgICAgIFwiaW5zZXJ0IG9yIGlnbm9yZSBpbnRvIHNldHRpbmdzIChrZXksIHZhbHVlKSB2YWx1ZXMgKCdkYXRhYmFzZV92ZXJzaW9uJywgMCk7XCIsXG4gICAgICAgIFwiaW5zZXJ0IG9yIGlnbm9yZSBpbnRvIHNldHRpbmdzIChrZXksIHZhbHVlKSB2YWx1ZXMgKCdkYXRhYmFzZV9jb2RlX3ZlcnNpb24nLCAwKTtcIixcblxuICAgICAgICAvKipcbiAgICAgICAgICogYXBfaWQgPSBhY2Nlc3MgcG9pbnQgaWRcbiAgICAgICAgICogZnBfaWQgPSBmbG9vcnBsYW4gaWRcbiAgICAgICAgICovXG4gICAgICAgIFwiQ1JFQVRFIFRBQkxFIGlmIG5vdCBleGlzdHMgc2Nhbl9yZXN1bHRzIFwiICtcbiAgICAgICAgXCIoc19pZCBJTlRFR0VSLCBmcF9pZCBURVhULCBhcF9pZCBURVhULCB4IElOVEVHRVIsIFwiICtcbiAgICAgICAgXCJ5IElOVEVHRVIsIHZhbHVlIFJFQUwsIG9yaWdfdmFsdWVzIFRFWFQsIGNyZWF0ZWQgVElNRVNUQU1QIERFRkFVTFQgQ1VSUkVOVF9USU1FU1RBTVAgTk9UIE5VTEwsIFwiICtcbiAgICAgICAgXCJQUklNQVJZIEtFWSAoc19pZCwgZnBfaWQsIGFwX2lkKSwgXCIgK1xuICAgICAgICBcIkNPTlNUUkFJTlQgc2Nhbl9yZXN1bHRzX2xheW91dF9pbWFnZXNfaWRfZmsgRk9SRUlHTiBLRVkgKGZwX2lkKSBSRUZFUkVOQ0VTIGxheW91dF9pbWFnZXMgKGlkKSk7XCIsXG4gICAgICAgIFwiY3JlYXRlIGluZGV4IGlmIG5vdCBleGlzdHMgeF9hbmRfeSBvbiBzY2FuX3Jlc3VsdHMgKHgsIHkpO1wiLFxuXG4gICAgICAgIFwiQ1JFQVRFIFRBQkxFIGlmIG5vdCBleGlzdHMga2FsbWFuX2VzdGltYXRlcyAoZnBfaWQgVEVYVCwgYXBfaWQgVEVYVCwgeCBJTlRFR0VSLCBcIlxuICAgICAgICArIFwieSBJTlRFR0VSLCBrYWxtYW4gUkVBTCwgXCJcbiAgICAgICAgKyBcIkNPTlNUUkFJTlQga2FsbWFuX2VzdGltYXRlc19mcF9pZF9hcF9pZF94X3lfcGsgUFJJTUFSWSBLRVkgKGZwX2lkLCBhcF9pZCwgeCwgeSksXCJcbiAgICAgICAgKyBcIkZPUkVJR04gS0VZIChhcF9pZCwgZnBfaWQsIHgsIHkpIFJFRkVSRU5DRVMgc2Nhbl9yZXN1bHRzIChhcF9pZCwgZnBfaWQsIHgsIHkpIE9OIERFTEVURSBDQVNDQURFKVwiLFxuXG4gICAgICAgIFwiQ1JFQVRFIFRBQkxFIGlmIG5vdCBleGlzdHMgZmVhdHVyZXMgKGZwX2lkIFRFWFQsIHggSU5URUdFUiwgeSBJTlRFR0VSLCBmZWF0dXJlIFRFWFQsIHZhbHVlIFJFQUwsIFwiXG4gICAgICAgICsgXCIgQ09OU1RSQUlOVCBmZWF0dXJlc19mcF9pZF94X3lfZmVhdHVyZV9wayBQUklNQVJZIEtFWSAoZnBfaWQsIHgsIHksIGZlYXR1cmUpKTtcIixcbiAgICAgICAgXCJDUkVBVEUgVU5JUVVFIElOREVYIGlmIG5vdCBleGlzdHMgZmVhdHVyZXNfZmVhdHVyZV9pbmRleDEgT04gZmVhdHVyZXMoZnBfaWQsZmVhdHVyZSx4LHkpO1wiLFxuICAgICAgICBcIkNSRUFURSBJTkRFWCBpZiBub3QgZXhpc3RzIGZlYXR1cmVzX2ZlYXR1cmVfaW5kZXgyIE9OIGZlYXR1cmVzKGZlYXR1cmUpO1wiXG4gICAgXTtcblxuICAgIHN0YXRpYyBkcm9wcyA9IFtcbiAgICAgICAgXCJkcm9wIHRhYmxlIGlmIGV4aXN0cyBsYXlvdXRfaW1hZ2VzO1wiLFxuICAgICAgICBcImRyb3AgdGFibGUgaWYgZXhpc3RzIHNldHRpbmdzO1wiLFxuICAgICAgICBcImRyb3AgdGFibGUgaWYgZXhpc3RzIHNjYW5fcmVzdWx0cztcIixcbiAgICAgICAgXCJkcm9wIHRhYmxlIGlmIGV4aXN0cyBrYWxtYW5fZXN0aW1hdGVzO1wiXG4gICAgXTtcblxuICAgIHN0YXRpYyBtaWdyYXRpb24xID0gW1xuICAgICAgICBcIkFMVEVSIFRBQkxFIGxheW91dF9pbWFnZXMgQUREIGZsb29yX3BsYW5fbmFtZSBURVhUIE5VTEw7XCIsXG4gICAgICAgIFwidXBkYXRlIHNldHRpbmdzIHNldCB2YWx1ZSA9ICdcIiArIERiLmRhdGFiYXNlX2NvZGVfdmVyc2lvbiArIFwiJyB3aGVyZSBrZXkgPSAnZGF0YWJhc2VfY29kZV92ZXJzaW9uJztcIlxuICAgIF07XG5cbiAgICBjb25zdHJ1Y3Rvcihsb2cpe1xuICAgICAgICB0aGlzLmxvZyA9IGxvZztcbiAgICAgICAgdGhpcy5kYiA9IG5ldyBzcWxpdGUzLkRhdGFiYXNlKCdkYi5zcWxpdGUzJyk7XG4gICAgICAgIHRoaXMubG9nLmRlYnVnKFwiRGIuY29uc3RydWN0b3JcIik7XG4gICAgfVxuXG4gICAgZ2V0RGF0YWJhc2UoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGI7XG4gICAgfVxuXG4gICAgZG9VcGdyYWRlKGRhdGFiYXNlQ29kZVZlcnNpb24pIHtcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoXCJEYi5kb1VwZ3JhZGVcIik7XG4gICAgICAgIGxldCBkYiA9IHRoaXMuZGI7XG4gICAgICAgIHN3aXRjaChkYXRhYmFzZUNvZGVWZXJzaW9uKXtcbiAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICBkYi5zZXJpYWxpemUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIERiLm1pZ3JhdGlvbjEuZm9yRWFjaChmdW5jdGlvbihtaWcpe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGIucnVuKG1pZyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyB0aGUgc3FsaXRlIHRhYmxlc1xuICAgICAqL1xuICAgIGNyZWF0ZVRhYmxlcygpIHtcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoXCJEYi5jcmVhdGVUYWJsZXNcIik7XG4gICAgICAgIGxldCBjcmVhdGVzID0gRGIuY3JlYXRlcztcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcblxuICAgICAgICBkYi5zZXJpYWxpemUoKCkgPT4ge1xuICAgICAgICAgICAgY3JlYXRlcy5mb3JFYWNoKGZ1bmN0aW9uKGNyZWF0ZSl7XG4gICAgICAgICAgICAgICAgZGIucnVuKGNyZWF0ZSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgbGV0IGRhdGFiYXNlQ29kZVZlcnNpb24gPSAwO1xuXG4gICAgICAgICAgICBkYi5hbGwoXCJzZWxlY3QgKiBmcm9tIHNldHRpbmdzXCIsIChlcnIsIHJvd3MpID0+IHtcbiAgICAgICAgICAgICAgICByb3dzLmZvckVhY2goZnVuY3Rpb24ocm93KXtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoKHJvdy5rZXkpe1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcImRhdGFiYXNlX2NvZGVfdmVyc2lvblwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFiYXNlQ29kZVZlcnNpb24gPSBOdW1iZXIocm93LnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmKGRhdGFiYXNlQ29kZVZlcnNpb24gPCBEYi5kYXRhYmFzZV9jb2RlX3ZlcnNpb24pe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRvVXBncmFkZShkYXRhYmFzZUNvZGVWZXJzaW9uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0Rmxvb3JQbGFucyhjYikge1xuICAgICAgICB0aGlzLmxvZy5kZWJ1ZyhcIkRiLmdldEZsb29yUGxhbnNcIik7XG4gICAgICAgIGxldCBkYiA9IHRoaXMuZGI7XG4gICAgICAgIGRiLmFsbChEYi5xdWVyeV9nZXRfYWxsX2Zsb29ycGxhbnMsIGNiKTtcbiAgICB9XG5cbiAgICBnZXREYXRhYmFzZVZlcnNpb24oY2IpIHtcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoXCJEYi5nZXREYXRhYmFzZVZlcnNpb25cIik7XG4gICAgICAgIGxldCBkYiA9IHRoaXMuZGI7XG4gICAgICAgIGRiLmFsbChEYi5xdWVyeV9nZXRfZGF0YWJhc2VfdmVyc2lvbiwgY2IpO1xuICAgIH1cblxuICAgIHVwZGF0ZURhdGFiYXNlKGRhdGEsIGNiKSB7XG4gICAgICAgIHRoaXMubG9nLmRlYnVnKFwiRGIudXBkYXRlRGF0YWJhc2VcIik7XG4gICAgICAgIGxldCBkYiA9IHRoaXMuZGI7XG4gICAgICAgIGxldCBzdG10ID0gZGIucHJlcGFyZShEYi5xdWVyeV9pbnNlcnRfdmVyc2lvbik7XG4gICAgICAgIHN0bXQucnVuKGRhdGEuZGF0YWJhc2VWZXJzaW9uKTtcbiAgICAgICAgc3RtdC5maW5hbGl6ZSgpO1xuXG4gICAgICAgIHN0bXQgPSBkYi5wcmVwYXJlKERiLnF1ZXJ5X3VwZGF0ZV92ZXJzaW9uKTtcbiAgICAgICAgc3RtdC5ydW4oZGF0YS5kYXRhYmFzZVZlcnNpb24pO1xuICAgICAgICBzdG10LmZpbmFsaXplKCk7XG5cbiAgICAgICAgaWYodHlwZW9mKGRhdGEubGF5b3V0X2ltYWdlcykgIT0gXCJ1bmRlZmluZWRcIiAmJiBkYXRhLmxheW91dF9pbWFnZXMubGVuZ3RoID4gMCl7XG4gICAgICAgICAgICBzdG10ID0gZGIucHJlcGFyZShEYi5xdWVyeV9pbnNlcnRfbGF5b3V0KTtcbiAgICAgICAgICAgIGxldCB1cHN0bXQgPSBkYi5wcmVwYXJlKERiLnF1ZXJ5X3VwZGF0ZV9sYXlvdXQpO1xuXG4gICAgICAgICAgICBkYXRhLmxheW91dF9pbWFnZXMuZm9yRWFjaChmdW5jdGlvbihlbCl7XG4gICAgICAgICAgICAgICAgbGV0IGlkID0gZWwuaWQ7XG4gICAgICAgICAgICAgICAgbGV0IGZsb29yX3BsYW5fbmFtZSA9IGVsLmZsb29ycGxhbm5hbWU7XG4gICAgICAgICAgICAgICAgbGV0IHN0cmluZ2RhdGEgPSBKU09OLnN0cmluZ2lmeShlbCk7XG4gICAgICAgICAgICAgICAgc3RtdC5ydW4oaWQsIHN0cmluZ2RhdGEsIGZsb29yX3BsYW5fbmFtZSk7XG4gICAgICAgICAgICAgICAgdXBzdG10LnJ1bihzdHJpbmdkYXRhLCBmbG9vcl9wbGFuX25hbWUsIGlkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc3RtdC5maW5hbGl6ZSgpO1xuICAgICAgICAgICAgdXBzdG10LmZpbmFsaXplKCk7XG4gICAgICAgIH1cblxuICAgICAgICBjYigpO1xuICAgIH1cblxuICAgIHNhdmVSZWFkaW5ncyhwYXlsb2FkLCBjYil7XG4gICAgICAgIGxldCBsb2cgPSB0aGlzLmxvZztcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgbG9nLmRlYnVnKFwiRGIuc2F2ZVJlYWRpbmdzXCIpO1xuXG4gICAgICAgIGxldCBzdG10ID0gZGIucHJlcGFyZShEYi5xdWVyeV9pbnNlcnRfc2Nhbl9yZXN1bHRzKTtcbiAgICAgICAgbGV0IGZpbmlzaGVkID0gMDtcbiAgICAgICAgcGF5bG9hZC5mb3JFYWNoKChlbCkgPT4ge1xuICAgICAgICAgICAgbGV0IHNfaWQgPSBOdW1iZXIoZWwuc19pZCk7XG4gICAgICAgICAgICBsZXQgZnBfaWQgPSBlbC5mcF9pZDtcbiAgICAgICAgICAgIGxldCBhcF9pZCA9IGVsLmFwX2lkO1xuICAgICAgICAgICAgbGV0IHggPSBOdW1iZXIoZWwueCk7XG4gICAgICAgICAgICBsZXQgeSA9IE51bWJlcihlbC55KTtcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IE51bWJlcihlbC52YWx1ZSk7XG4gICAgICAgICAgICBsZXQgb3JpZ192YWx1ZXMgPSBlbC5vcmlnX3ZhbHVlcztcbiAgICAgICAgICAgIGxldCBjcmVhdGVkID0gZWwuY3JlYXRlZDtcbiAgICAgICAgICAgIHN0bXQucnVuKHNfaWQsIGZwX2lkLCBhcF9pZCwgeCwgeSwgdmFsdWUsIG9yaWdfdmFsdWVzLCBjcmVhdGVkLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZmluaXNoZWQrKztcbiAgICAgICAgICAgICAgICBpZihmaW5pc2hlZCA+PSBwYXlsb2FkLmxlbmd0aCl7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlS2FsbWFuKGZwX2lkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc3RtdC5maW5hbGl6ZSgpO1xuXG4gICAgfVxuXG4gICAgdXBkYXRlS2FsbWFuKGZwX2lkKXtcbiAgICAgICAgbGV0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBsZXQga2FsbWFuID0ge307XG5cbiAgICAgICAgZGIuYWxsKERiLnF1ZXJ5X2dldF9mb3Jfa2FsbWFuLCBmcF9pZCwgKGVyciwgcm93cykgPT4ge1xuICAgICAgICAgICAgY29uc3QgaW5zZXJ0ID0gZGIucHJlcGFyZShEYi5xdWVyeV9pbnNlcnRfa2FsbWFuX2VzdGltYXRlcyk7XG4gICAgICAgICAgICBjb25zdCB1cGRhdGUgPSBkYi5wcmVwYXJlKERiLnF1ZXJ5X3VwZGF0ZV9rYWxtYW5fZXN0aW1hdGVzKTtcbiAgICAgICAgICAgIGxvZy5sb2coZXJyKTtcbiAgICAgICAgICAgIGlmKGVycikgcmV0dXJuO1xuXG4gICAgICAgICAgICBsZXQgZG9uZSA9IDA7XG4gICAgICAgICAgICByb3dzLmZvckVhY2goKHJvdykgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBrID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZihrYWxtYW5bcm93LmZwX2lkICsgcm93LmFwX2lkICsgcm93LnggKyByb3cueV0pID09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAga2FsbWFuW3Jvdy5mcF9pZCArIHJvdy5hcF9pZCArIHJvdy54ICsgcm93LnldID0gbmV3IEthbG1hbkZpbHRlcihyb3cuY2VzdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGsgPSBrYWxtYW5bcm93LmZwX2lkICsgcm93LmFwX2lkICsgcm93LnggKyByb3cueV07XG5cbiAgICAgICAgICAgICAgICBsZXQgdmFsdWVzID0gcm93LnZhbHVlc1xuICAgICAgICAgICAgICAgICAgICAuc3BsaXQoXCIsXCIpXG4gICAgICAgICAgICAgICAgICAgIC5tYXAoKGVsKSA9PiB7IHJldHVybiBOdW1iZXIoZWwpOyB9KTtcblxuICAgICAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCB2YWx1ZXMubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgICAgICAgICBrLmFkZFNhbXBsZSh2YWx1ZXNbaV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpbnNlcnQucnVuKHJvdy5mcF9pZCwgcm93LmFwX2lkLCByb3cueCwgcm93LnksIGsuZ2V0RXN0aW1hdGUoKSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB1cGRhdGUucnVuKGsuZ2V0RXN0aW1hdGUoKSwgcm93LmZwX2lkLCByb3cuYXBfaWQsIHJvdy54LCByb3cueSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoZG9uZSA+PSByb3dzLmxlbmd0aCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zZXJ0LmZpbmFsaXplKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlLmZpbmFsaXplKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGIucnVuKFwiZGVsZXRlIGZyb20gZmVhdHVyZXMgd2hlcmUgZnBfaWQgPSA/XCIsIGZwX2lkLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRiLnJ1bihEYi5xdWVyeV91cGRhdGVfZmVhdHVyZXMsIGZwX2lkLCBmcF9pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IERiOyJdfQ==
//# sourceMappingURL=Db.js.map
