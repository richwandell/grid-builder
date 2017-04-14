'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _KalmanFilter = require('./KalmanFilter');

var _KalmanFilter2 = _interopRequireDefault(_KalmanFilter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var sqlite3 = require('sqlite3').verbose();

var Db = function () {
    function Db(log) {
        var _this = this;

        var database = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "db.sqlite3";

        _classCallCheck(this, Db);

        this.log = log;
        this.log.debug("Db.constructor");

        this.db = new sqlite3.cached.Database('db/' + database);
        this.db.serialize(function () {
            _this.db.exec("PRAGMA journal_mode = WAL;");
            _this.db.exec("PRAGMA cache_size = 4096000;");
            _this.db.exec("PRAGMA optimize;");
            _this.db.exec("PRAGMA busy_timeout = 150000;");
        });
        this.featuresCache = {};
    }

    _createClass(Db, [{
        key: 'clearFeaturesCache',
        value: function clearFeaturesCache(fp_id) {
            this.featuresCache[fp_id] = undefined;
        }

        /**
         *
         * @param fp_id
         */

    }, {
        key: 'createFeaturesCache',
        value: function createFeaturesCache(fp_id) {
            var _this2 = this;

            return new Promise(function (resolve, reject) {

                if (_this2.featuresCache[fp_id] !== undefined) {
                    resolve();
                    return;
                }
                _this2.db.all("select * from features where fp_id = ?;", fp_id, function (err, rows) {
                    if (err) {
                        reject();
                        return;
                    }
                    var length = rows.length;
                    var fp_id = void 0,
                        x = void 0,
                        y = void 0,
                        feature = void 0,
                        value = void 0;
                    for (var i = 0; i < length; i++) {
                        fp_id = rows[i].fp_id;
                        x = rows[i].x;
                        y = rows[i].y;
                        feature = rows[i].feature;
                        value = rows[i].value;
                        if (_this2.featuresCache[fp_id] === undefined) {
                            _this2.featuresCache[fp_id] = {};
                        }
                        var coord = x + "_" + y;
                        if (_this2.featuresCache[fp_id][coord] === undefined) {
                            _this2.featuresCache[fp_id][coord] = {};
                        }

                        _this2.featuresCache[fp_id][coord][feature] = value;
                    }
                    _this2.log.log("Features Cache created: " + JSON.stringify(Object.keys(_this2.featuresCache)));
                    if (resolve) {
                        resolve();
                    }
                });
            });
        }
    }, {
        key: 'getFeaturesCache',
        value: function getFeaturesCache(fp_id) {
            if (this.featuresCache[fp_id] === undefined) {
                return false;
            }
            return this.featuresCache[fp_id];
        }
    }, {
        key: 'getFeatureValue',
        value: function getFeatureValue(fp_id, coord, feature) {
            if (this.featuresCache[fp_id] === undefined) {
                return false;
            }
            if (this.featuresCache[fp_id][coord] === undefined) {
                return false;
            }
            if (this.featuresCache[fp_id][coord][feature] === undefined) {
                return false;
            }
            return this.featuresCache[fp_id][coord][feature];
        }
    }, {
        key: 'getFeatureNumber',
        value: function getFeatureNumber(fp_id, coord) {
            var fp = void 0,
                c = void 0;
            if (this.featuresCache[fp_id] === undefined) {
                return 1;
            }
            fp = this.featuresCache[fp_id];
            if (fp[coord] === undefined) {
                return 1;
            }
            c = fp[coord];
            var keys = Object.keys(c);
            return keys.length;
        }
    }, {
        key: 'getDatabase',
        value: function getDatabase() {
            return this.db;
        }
    }, {
        key: 'doUpgrade',
        value: function doUpgrade(db, databaseCodeVersion, cb) {
            var _this3 = this;

            this.log.debug("Db.doUpgrade");

            switch (databaseCodeVersion) {
                case 0:
                    db.serialize(function () {
                        Db.migration1.forEach(function (mig) {
                            db.run(mig);
                        });
                        _this3.createTables(db, cb);
                    });
                    break;

                case 1:
                    db.serialize(function () {
                        Db.migration2.forEach(function (mig) {
                            db.run(mig);
                        });
                        _this3.createTables(db, cb);
                    });
                    break;

                case 2:
                    db.serialize(function () {
                        Db.migration3.forEach(function (mig) {
                            db.run(mig);
                        });
                        _this3.createTables(db, cb);
                    });
                    break;

                case 3:
                    db.serialize(function () {
                        Db.migration4.forEach(function (mig) {
                            db.run(mig);
                        });
                        _this3.createTables(db, cb);
                    });
                    break;

                case 4:
                    db.serialize(function () {
                        Db.migration5.forEach(function (mig) {
                            db.run(mig);
                        });
                        _this3.createTables(db, cb);
                    });
                    break;
            }
        }
    }, {
        key: 'createTables',
        value: function createTables(db, cb) {
            var _this4 = this;

            this.log.debug("Db.createTables");
            var creates = Db.creates;

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
                        _this4.doUpgrade(db, databaseCodeVersion, cb);
                    } else {
                        if (cb) {
                            cb();
                        }
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
            var _this5 = this;

            var log = this.log;
            var db = this.db;
            log.debug("Db.saveReadings");

            var stmt = db.prepare(Db.query_insert_scan_results);
            var finished = 0;
            var xy = [];
            payload.forEach(function (el) {
                db.get(Db.query_get_scan_id, function (err, row) {
                    db.run(Db.query_update_scan_id, function () {
                        var s_id = Number(row.value);
                        var fp_id = el.fp_id;
                        var ap_id = el.ap_id;
                        var x = Number(el.x);
                        var y = Number(el.y);
                        var key = x + "_" + y;
                        if (xy.indexOf(key) === -1) {
                            xy.push(key);
                        }
                        var value = Number(el.value);
                        var orig_values = el.orig_values;
                        var created = el.created;
                        stmt.run(s_id, fp_id, ap_id, x, y, value, orig_values, created, function (err) {
                            finished++;
                            if (finished >= payload.length) {
                                stmt.finalize();
                                xy.forEach(function (coord, i) {
                                    var call = i === xy.length - 1 ? cb : function () {};

                                    var _coord$split = coord.split("_"),
                                        _coord$split2 = _slicedToArray(_coord$split, 2),
                                        x = _coord$split2[0],
                                        y = _coord$split2[1];

                                    _this5.updateKalman(fp_id, Number(x), Number(y), call);
                                });
                            }
                        });
                    });
                });
            });
        }
    }, {
        key: 'updateKalman',
        value: function updateKalman(fp_id, x, y, cb) {
            var _this6 = this;

            var log = this.log;
            var db = this.db;
            var kalman = {};

            db.all(Db.query_get_for_kalman, fp_id, x, y, function (err, rows) {
                var insert = db.prepare(Db.query_insert_kalman_estimates);
                var update = db.prepare(Db.query_update_kalman_estimates);

                if (err) {
                    log.error(err);
                    return;
                }

                var done = 0;
                rows.forEach(function (row) {
                    var k = false;
                    if (kalman[row.fp_id + row.ap_id + row.x + row.y] === undefined) {
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
                                _this6.log.log("Finished inserts and updates");
                                insert.finalize();
                                update.finalize();
                                db.serialize(function () {
                                    db.run("delete from features where fp_id = ? and x = ? and y = ?", fp_id, row.x, row.y);
                                    db.run(Db.query_update_features, fp_id, fp_id, row.x, row.x, row.y, row.y, function () {
                                        cb(fp_id);
                                        _this6.log.log("Finished updating features");
                                    });
                                });
                            }
                        });
                    });
                });
            });
        }
    }, {
        key: 'reindex',
        value: function reindex() {
            var _this7 = this;

            var db = this.db;
            var log = this.log;
            log.log("Starting Indexing");
            db.all("select fp_id, x, y from scan_results GROUP BY fp_id, x, y;", function (err, rows) {
                rows.forEach(function (row, i) {
                    var fp_id = row.fp_id;
                    var x = row.x;
                    var y = row.y;
                    var call = i === rows.length - 1 ? function () {
                        console.log("should close");
                        _this7.log.close();
                        _this7.db.close();
                    } : function () {};
                    _this7.updateKalman(fp_id, x, y, call);
                });
            });
        }
    }]);

    return Db;
}();

Db.database_code_version = 5;
Db.query_get_all_floorplans = "select * from layout_images";
Db.query_get_database_version = "select value from settings where key = 'database_version';";
Db.query_insert_version = "insert or ignore into settings values ('database_version', ?);";
Db.query_update_version = "update settings set value = ? where key = 'database_version';";
Db.query_insert_layout = "insert or ignore into layout_images values (?, ?, ?);";
Db.query_update_layout = "update layout_images set layout_image = ?, floor_plan_name = ? where id = ?;";
Db.query_insert_scan_results = "insert into scan_results values (?, ?, ?, ?, ?, ?, ?, ?);";
Db.query_get_scan_results = "select * from scan_results;";
Db.query_get_for_kalman = "SELECT s.fp_id, s.ap_id, s.x, s.y, " + "group_concat(s.value) `values`, " + "case when k.kalman is null then avg(s.value) else k.kalman end `cest`, " + "k.kalman FROM scan_results s left join " + "kalman_estimates k on s.fp_id = k.fp_id and s.ap_id = k.ap_id and s.x = k.x and s.y = k.y " + " where s.fp_id = ? and s.value != 0 and s.x = ? and s.y = ? GROUP BY s.fp_id, s.ap_id, s.x, s.y;";
Db.query_insert_kalman_estimates = "insert or ignore into kalman_estimates values (?, ?, ?, ?, ?);";
Db.query_update_kalman_estimates = "update kalman_estimates set kalman = ? where fp_id = ? and ap_id = ? and " + " x = ? and y = ?;";
Db.query_update_features = "insert into features " + " select k.fp_id, k.x, k.y, k.ap_id || k1.ap_id as feature, abs(k.kalman - k1.kalman) as value " + " from kalman_estimates k join kalman_estimates k1 on k.fp_id = k1.fp_id and k.x = k1.x and k.y = k1.y" + " where value != 0 and k.fp_id = ? and k1.fp_id = ? and k.x = ? and k1.x = ? and k.y = ? and k1.y = ?";
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
Db.migration5 = ["CREATE INDEX if not exists scan_results_fp_id_index ON scan_results (fp_id);", "update settings set value = '" + Db.database_code_version + "' where key = 'database_code_version';"];


module.exports = Db;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvRGIuZXM2Il0sIm5hbWVzIjpbInNxbGl0ZTMiLCJyZXF1aXJlIiwidmVyYm9zZSIsIkRiIiwibG9nIiwiZGF0YWJhc2UiLCJkZWJ1ZyIsImRiIiwiY2FjaGVkIiwiRGF0YWJhc2UiLCJzZXJpYWxpemUiLCJleGVjIiwiZmVhdHVyZXNDYWNoZSIsImZwX2lkIiwidW5kZWZpbmVkIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJhbGwiLCJlcnIiLCJyb3dzIiwibGVuZ3RoIiwieCIsInkiLCJmZWF0dXJlIiwidmFsdWUiLCJpIiwiY29vcmQiLCJKU09OIiwic3RyaW5naWZ5IiwiT2JqZWN0Iiwia2V5cyIsImZwIiwiYyIsImRhdGFiYXNlQ29kZVZlcnNpb24iLCJjYiIsIm1pZ3JhdGlvbjEiLCJmb3JFYWNoIiwibWlnIiwicnVuIiwiY3JlYXRlVGFibGVzIiwibWlncmF0aW9uMiIsIm1pZ3JhdGlvbjMiLCJtaWdyYXRpb240IiwibWlncmF0aW9uNSIsImNyZWF0ZXMiLCJjcmVhdGUiLCJyb3ciLCJrZXkiLCJOdW1iZXIiLCJkYXRhYmFzZV9jb2RlX3ZlcnNpb24iLCJkb1VwZ3JhZGUiLCJxdWVyeV9nZXRfc2Nhbm5lZF9jb29yZHMiLCJxdWVyeV9nZXRfYWxsX2Zsb29ycGxhbnMiLCJkYXRhIiwic3RtdCIsInByZXBhcmUiLCJxdWVyeV9pbnNlcnRfdmVyc2lvbiIsImRhdGFiYXNlVmVyc2lvbiIsImZpbmFsaXplIiwicXVlcnlfdXBkYXRlX3ZlcnNpb24iLCJsYXlvdXRfaW1hZ2VzIiwicXVlcnlfaW5zZXJ0X2xheW91dCIsInVwc3RtdCIsInF1ZXJ5X3VwZGF0ZV9sYXlvdXQiLCJlbCIsImlkIiwiZmxvb3JfcGxhbl9uYW1lIiwiZmxvb3JwbGFubmFtZSIsInN0cmluZ2RhdGEiLCJwYXlsb2FkIiwicXVlcnlfaW5zZXJ0X3NjYW5fcmVzdWx0cyIsImZpbmlzaGVkIiwieHkiLCJnZXQiLCJxdWVyeV9nZXRfc2Nhbl9pZCIsInF1ZXJ5X3VwZGF0ZV9zY2FuX2lkIiwic19pZCIsImFwX2lkIiwiaW5kZXhPZiIsInB1c2giLCJvcmlnX3ZhbHVlcyIsImNyZWF0ZWQiLCJjYWxsIiwic3BsaXQiLCJ1cGRhdGVLYWxtYW4iLCJrYWxtYW4iLCJxdWVyeV9nZXRfZm9yX2thbG1hbiIsImluc2VydCIsInF1ZXJ5X2luc2VydF9rYWxtYW5fZXN0aW1hdGVzIiwidXBkYXRlIiwicXVlcnlfdXBkYXRlX2thbG1hbl9lc3RpbWF0ZXMiLCJlcnJvciIsImRvbmUiLCJrIiwiY2VzdCIsInZhbHVlcyIsIm1hcCIsImFkZFNhbXBsZSIsImdldEVzdGltYXRlIiwicXVlcnlfdXBkYXRlX2ZlYXR1cmVzIiwiY29uc29sZSIsImNsb3NlIiwicXVlcnlfZ2V0X2RhdGFiYXNlX3ZlcnNpb24iLCJxdWVyeV9nZXRfc2Nhbl9yZXN1bHRzIiwicXVlcnlfdXBkYXRlX29sZGVzdF9mZWF0dXJlcyIsInF1ZXJ5X2dldF9mZWF0dXJlcyIsInF1ZXJ5X2dldF9taW5fc2lkIiwiZHJvcHMiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7Ozs7Ozs7QUFFQSxJQUFJQSxVQUFVQyxRQUFRLFNBQVIsRUFBbUJDLE9BQW5CLEVBQWQ7O0lBRU1DLEU7QUFpSEYsZ0JBQVlDLEdBQVosRUFBeUM7QUFBQTs7QUFBQSxZQUF4QkMsUUFBd0IsdUVBQWIsWUFBYTs7QUFBQTs7QUFDckMsYUFBS0QsR0FBTCxHQUFXQSxHQUFYO0FBQ0EsYUFBS0EsR0FBTCxDQUFTRSxLQUFULENBQWUsZ0JBQWY7O0FBRUEsYUFBS0MsRUFBTCxHQUFVLElBQUlQLFFBQVFRLE1BQVIsQ0FBZUMsUUFBbkIsU0FBa0NKLFFBQWxDLENBQVY7QUFDQSxhQUFLRSxFQUFMLENBQVFHLFNBQVIsQ0FBa0IsWUFBTTtBQUNwQixrQkFBS0gsRUFBTCxDQUFRSSxJQUFSLENBQWEsNEJBQWI7QUFDQSxrQkFBS0osRUFBTCxDQUFRSSxJQUFSLENBQWEsOEJBQWI7QUFDQSxrQkFB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OztBQVliOzs7O0FBSUEsNkNBQ0Esb0RBREEsR0FFQSxpR0FGQSxHQUdBLG9DQUhBLEdBSUEsaUdBcEJhLEVBcUJiLDREQXJCYSxFQXVCYixxRkFDRSwwQkFERixHQUVFLGtGQUZGLEdBR0Usa0dBMUJXLEVBNEJiLHNHQUNFLGdGQTdCVyxFQThCYiwyRkE5QmEsRUErQmIsMEVBL0JhLEM7QUFwQ2YxQyxFLENBc0VLeUcsSyxHQUFRLENBQ1gscUNBRFcsRUFFWCxnQ0FGVyxFQUdYLG9DQUhXLEVBSVgsd0NBSlcsQztBQXRFYnpHLEUsQ0E2RUtpQyxVLEdBQWEsQ0FDaEIsMERBRGdCLEVBRWhCLGtDQUFrQ2pDLEdBQUcrQyxxQkFBckMsR0FBNkQsd0NBRjdDLEM7QUE3RWxCL0MsRSxDQWtGS3NDLFUsR0FBYSxDQUNoQix5Q0FEZ0IsRUFFaEIscUNBRmdCLEVBR2hCLHFDQUhnQixFQUloQix5R0FDRSwyRkFMYyxFQU1oQiwyRkFOZ0IsRUFPaEIscUhBUGdCLEVBUWhCLHNCQVJnQixFQVNoQiw4Q0FUZ0IsRUFVaEIsNERBVmdCLEVBV2hCLGtDQUFrQ3RDLEdBQUcrQyxxQkFBckMsR0FBNkQsd0NBWDdDLEM7QUFsRmxCL0MsRSxDQWdHS3VDLFUsR0FBYSxDQUNoQix3REFEZ0IsRUFFaEIsa0NBQWtDdkMsR0FBRytDLHFCQUFyQyxHQUE2RCx3Q0FGN0MsQztBQWhHbEIvQyxFLENBcUdLd0MsVSxHQUFhLENBQ2hCLHNCQURnQixFQUVoQix3RkFDRSxnRkFIYyxFQUloQixrQ0FBa0N4QyxHQUFHK0MscUJBQXJDLEdBQTZELHdDQUo3QyxDO0FBckdsQi9DLEUsQ0E0R0t5QyxVLEdBQWEsQ0FDaEIsOEVBRGdCLEVBRWhCLGtDQUFrQ3pDLEdBQUcrQyxxQkFBckMsR0FBNkQsd0NBRjdDLEM7OztBQStVeEIyRCxPQUFPQyxPQUFQLEdBQWlCM0csRUFBakIiLCJmaWxlIjoiRGIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgS2FsbWFuRmlsdGVyIGZyb20gJy4vS2FsbWFuRmlsdGVyJztcblxubGV0IHNxbGl0ZTMgPSByZXF1aXJlKCdzcWxpdGUzJykudmVyYm9zZSgpO1xuXG5jbGFzcyBEYiB7XG5cbiAgICBzdGF0aWMgZGF0YWJhc2VfY29kZV92ZXJzaW9uID0gNTtcbiAgICBzdGF0aWMgcXVlcnlfZ2V0X2FsbF9mbG9vcnBsYW5zID0gXCJzZWxlY3QgKiBmcm9tIGxheW91dF9pbWFnZXNcIjtcbiAgICBzdGF0aWMgcXVlcnlfZ2V0X2RhdGFiYXNlX3ZlcnNpb24gPSBcInNlbGVjdCB2YWx1ZSBmcm9tIHNldHRpbmdzIHdoZXJlIGtleSA9ICdkYXRhYmFzZV92ZXJzaW9uJztcIjtcbiAgICBzdGF0aWMgcXVlcnlfaW5zZXJ0X3ZlcnNpb24gPSBcImluc2VydCBvciBpZ25vcmUgaW50byBzZXR0aW5ncyB2YWx1ZXMgKCdkYXRhYmFzZV92ZXJzaW9uJywgPyk7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X3VwZGF0ZV92ZXJzaW9uID0gXCJ1cGRhdGUgc2V0dGluZ3Mgc2V0IHZhbHVlID0gPyB3aGVyZSBrZXkgPSAnZGF0YWJhc2VfdmVyc2lvbic7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X2luc2VydF9sYXlvdXQgPSBcImluc2VydCBvciBpZ25vcmUgaW50byBsYXlvdXRfaW1hZ2VzIHZhbHVlcyAoPywgPywgPyk7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X3VwZGF0ZV9sYXlvdXQgPSBcInVwZGF0ZSBsYXlvdXRfaW1hZ2VzIHNldCBsYXlvdXRfaW1hZ2UgPSA/LCBmbG9vcl9wbGFuX25hbWUgPSA/IHdoZXJlIGlkID0gPztcIjtcbiAgICBzdGF0aWMgcXVlcnlfaW5zZXJ0X3NjYW5fcmVzdWx0cyA9IFwiaW5zZXJ0IGludG8gc2Nhbl9yZXN1bHRzIHZhbHVlcyAoPywgPywgPywgPywgPywgPywgPywgPyk7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X2dldF9zY2FuX3Jlc3VsdHMgPSBcInNlbGVjdCAqIGZyb20gc2Nhbl9yZXN1bHRzO1wiO1xuICAgIHN0YXRpYyBxdWVyeV9nZXRfZm9yX2thbG1hbiA9IFwiU0VMRUNUIHMuZnBfaWQsIHMuYXBfaWQsIHMueCwgcy55LCBcIlxuICAgICsgXCJncm91cF9jb25jYXQocy52YWx1ZSkgYHZhbHVlc2AsIFwiXG4gICAgKyBcImNhc2Ugd2hlbiBrLmthbG1hbiBpcyBudWxsIHRoZW4gYXZnKHMudmFsdWUpIGVsc2Ugay5rYWxtYW4gZW5kIGBjZXN0YCwgXCJcbiAgICArIFwiay5rYWxtYW4gRlJPTSBzY2FuX3Jlc3VsdHMgcyBsZWZ0IGpvaW4gXCJcbiAgICArIFwia2FsbWFuX2VzdGltYXRlcyBrIG9uIHMuZnBfaWQgPSBrLmZwX2lkIGFuZCBzLmFwX2lkID0gay5hcF9pZCBhbmQgcy54ID0gay54IGFuZCBzLnkgPSBrLnkgXCJcbiAgICArIFwiIHdoZXJlIHMuZnBfaWQgPSA/IGFuZCBzLnZhbHVlICE9IDAgYW5kIHMueCA9ID8gYW5kIHMueSA9ID8gR1JPVVAgQlkgcy5mcF9pZCwgcy5hcF9pZCwgcy54LCBzLnk7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X2luc2VydF9rYWxtYW5fZXN0aW1hdGVzID0gXCJpbnNlcnQgb3IgaWdub3JlIGludG8ga2FsbWFuX2VzdGltYXRlcyB2YWx1ZXMgKD8sID8sID8sID8sID8pO1wiO1xuICAgIHN0YXRpYyBxdWVyeV91cGRhdGVfa2FsbWFuX2VzdGltYXRlcyA9IFwidXBkYXRlIGthbG1hbl9lc3RpbWF0ZXMgc2V0IGthbG1hbiA9ID8gd2hlcmUgZnBfaWQgPSA/IGFuZCBhcF9pZCA9ID8gYW5kIFwiXG4gICAgKyBcIiB4ID0gPyBhbmQgeSA9ID87XCI7XG4gICAgc3RhdGljIHF1ZXJ5X3VwZGF0ZV9mZWF0dXJlcyA9IFwiaW5zZXJ0IGludG8gZmVhdHVyZXMgXCJcbiAgICArIFwiIHNlbGVjdCBrLmZwX2lkLCBrLngsIGsueSwgay5hcF9pZCB8fCBrMS5hcF9pZCBhcyBmZWF0dXJlLCBhYnMoay5rYWxtYW4gLSBrMS5rYWxtYW4pIGFzIHZhbHVlIFwiXG4gICAgKyBcIiBmcm9tIGthbG1hbl9lc3RpbWF0ZXMgayBqb2luIGthbG1hbl9lc3RpbWF0ZXMgazEgb24gay5mcF9pZCA9IGsxLmZwX2lkIGFuZCBrLnggPSBrMS54IGFuZCBrLnkgPSBrMS55XCJcbiAgICArIFwiIHdoZXJlIHZhbHVlICE9IDAgYW5kIGsuZnBfaWQgPSA/IGFuZCBrMS5mcF9pZCA9ID8gYW5kIGsueCA9ID8gYW5kIGsxLnggPSA/IGFuZCBrLnkgPSA/IGFuZCBrMS55ID0gP1wiO1xuICAgIHN0YXRpYyBxdWVyeV91cGRhdGVfb2xkZXN0X2ZlYXR1cmVzID0gXCJzZWxlY3Qgay5mcF9pZCwgay54LCBrLnksIGsuYXBfaWQgfHwgazEuYXBfaWQgYXMgZmVhdHVyZSwgXCJcbiAgICArIFwiIGFicyhrLmthbG1hbiAtIGsxLmthbG1hbikgYXMgdmFsdWUsIDpzY2FuX2lkOiBzX2lkIGZyb20ga2FsbWFuX2VzdGltYXRlcyBrIGpvaW4gXCJcbiAgICArIFwiIGthbG1hbl9lc3RpbWF0ZXMgazEgb24gay5mcF9pZCA9IGsxLmZwX2lkIGFuZCBrLnggPSBrMS54IGFuZCBrLnkgPSBrMS55IGFuZCBrLmFwX2lkIDwgazEuYXBfaWQgd2hlcmVcIlxuICAgICsgXCIgay5rYWxtYW4gIT0gMCBhbmQgazEua2FsbWFuICE9IDAgYW5kIGsuZnBfaWQgPSA/IGFuZCBrMS5mcF9pZCA9ID87XCI7XG4gICAgc3RhdGljIHF1ZXJ5X2dldF9mZWF0dXJlcyA9IFwic2VsZWN0IGYuKiwgYWJzKHZhbHVlIC0gOmZlYXR1cmVfdmFsdWU6KSBkaWZmIGZyb20gZmVhdHVyZXMgZiBcIlxuICAgICsgXCIgd2hlcmUgZi5mZWF0dXJlID0gPyBhbmQgZi5mcF9pZCA9ID8gb3JkZXIgYnkgZGlmZiBhc2M7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X2dldF9zY2FubmVkX2Nvb3JkcyA9IFwic2VsZWN0IGNvdW50KCopIGFzIG51bV9mZWF0dXJlcywgeCwgeSBmcm9tIGZlYXR1cmVzIHdoZXJlIGZwX2lkID0gPyBcIlxuICAgICsgXCIgZ3JvdXAgYnkgeCwgeTtcIjtcbiAgICBzdGF0aWMgcXVlcnlfZ2V0X21pbl9zaWQgPSBcInNlbGVjdCBtaW4oc19pZCkgZnJvbSBmZWF0dXJlcyB3aGVyZSBmcF9pZCA9ID9cIjtcbiAgICBzdGF0aWMgcXVlcnlfZ2V0X3NjYW5faWQgPSBcInNlbGVjdCB2YWx1ZSArIDEgYXMgdmFsdWUgZnJvbSBzZXR0aW5ncyB3aGVyZSBrZXkgPSAnc2Nhbl9pZCc7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X3VwZGF0ZV9zY2FuX2lkID0gXCJ1cGRhdGUgc2V0dGluZ3Mgc2V0IHZhbHVlID0gdmFsdWUgKyAxIHdoZXJlIGtleSA9ICdzY2FuX2lkJztcIjtcblxuICAgIHN0YXRpYyBjcmVhdGVzID0gW1xuICAgICAgICBcIkNSRUFURSBUQUJMRSBpZiBub3QgZXhpc3RzIGxheW91dF9pbWFnZXMgKGlkIFRFWFQgUFJJTUFSWSBLRVksIGxheW91dF9pbWFnZSBURVhUKTtcIixcbiAgICAgICAgXCJDUkVBVEUgVU5JUVVFIElOREVYIGlmIG5vdCBleGlzdHMgbGF5b3V0X2ltYWdlc19pZF91aW5kZXggT04gbGF5b3V0X2ltYWdlcyAoaWQpO1wiLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDcmVhdGUgdGhlIHNldHRpbmdzIHRhYmxlIHdpdGggZGVmYXVsdCBzZXR0aW5nc1xuICAgICAgICAgKi9cbiAgICAgICAgXCJjcmVhdGUgdGFibGUgaWYgbm90IGV4aXN0cyBzZXR0aW5ncyAoa2V5IFRFWFQgUFJJTUFSWSBLRVksIHZhbHVlIFRFWFQpO1wiLFxuICAgICAgICBcImNyZWF0ZSB1bmlxdWUgaW5kZXggaWYgbm90IGV4aXN0cyBzZXR0aW5nc19rZXkgb24gc2V0dGluZ3MgKGtleSk7XCIsXG4gICAgICAgIFwiaW5zZXJ0IG9yIGlnbm9yZSBpbnRvIHNldHRpbmdzIChrZXksIHZhbHVlKSB2YWx1ZXMgKCdkYXRhYmFzZV92ZXJzaW9uJywgMCk7XCIsXG4gICAgICAgIFwiaW5zZXJ0IG9yIGlnbm9yZSBpbnRvIHNldHRpbmdzIChrZXksIHZhbHVlKSB2YWx1ZXMgKCdkYXRhYmFzZV9jb2RlX3ZlcnNpb24nLCAwKTtcIixcblxuICAgICAgICAvKipcbiAgICAgICAgICogYXBfaWQgPSBhY2Nlc3MgcG9pbnQgaWRcbiAgICAgICAgICogZnBfaWQgPSBmbG9vcnBsYW4gaWRcbiAgICAgICAgICovXG4gICAgICAgIFwiQ1JFQVRFIFRBQkxFIGlmIG5vdCBleGlzdHMgc2Nhbl9yZXN1bHRzIFwiICtcbiAgICAgICAgXCIoc19pZCBJTlRFR0VSLCBmcF9pZCBURVhULCBhcF9pZCBURVhULCB4IElOVEVHRVIsIFwiICtcbiAgICAgICAgXCJ5IElOVEVHRVIsIHZhbHVlIFJFQUwsIG9yaWdfdmFsdWVzIFRFWFQsIGNyZWF0ZWQgVElNRVNUQU1QIERFRkFVTFQgQ1VSUkVOVF9USU1FU1RBTVAgTk9UIE5VTEwsIFwiICtcbiAgICAgICAgXCJQUklNQVJZIEtFWSAoc19pZCwgZnBfaWQsIGFwX2lkKSwgXCIgK1xuICAgICAgICBcIkNPTlNUUkFJTlQgc2Nhbl9yZXN1bHRzX2xheW91dF9pbWFnZXNfaWRfZmsgRk9SRUlHTiBLRVkgKGZwX2lkKSBSRUZFUkVOQ0VTIGxheW91dF9pbWFnZXMgKGlkKSk7XCIsXG4gICAgICAgIFwiY3JlYXRlIGluZGV4IGlmIG5vdCBleGlzdHMgeF9hbmRfeSBvbiBzY2FuX3Jlc3VsdHMgKHgsIHkpO1wiLFxuXG4gICAgICAgIFwiQ1JFQVRFIFRBQkxFIGlmIG5vdCBleGlzdHMga2FsbWFuX2VzdGltYXRlcyAoZnBfaWQgVEVYVCwgYXBfaWQgVEVYVCwgeCBJTlRFR0VSLCBcIlxuICAgICAgICArIFwieSBJTlRFR0VSLCBrYWxtYW4gUkVBTCwgXCJcbiAgICAgICAgKyBcIkNPTlNUUkFJTlQga2FsbWFuX2VzdGltYXRlc19mcF9pZF9hcF9pZF94X3lfcGsgUFJJTUFSWSBLRVkgKGZwX2lkLCBhcF9pZCwgeCwgeSksXCJcbiAgICAgICAgKyBcIkZPUkVJR04gS0VZIChhcF9pZCwgZnBfaWQsIHgsIHkpIFJFRkVSRU5DRVMgc2Nhbl9yZXN1bHRzIChhcF9pZCwgZnBfaWQsIHgsIHkpIE9OIERFTEVURSBDQVNDQURFKVwiLFxuXG4gICAgICAgIFwiQ1JFQVRFIFRBQkxFIGlmIG5vdCBleGlzdHMgZmVhdHVyZXMgKGZwX2lkIFRFWFQsIHggSU5URUdFUiwgeSBJTlRFR0VSLCBmZWF0dXJlIFRFWFQsIHZhbHVlIFJFQUwsIFwiXG4gICAgICAgICsgXCIgQ09OU1RSQUlOVCBmZWF0dXJlc19mcF9pZF94X3lfZmVhdHVyZV9wayBQUklNQVJZIEtFWSAoZnBfaWQsIHgsIHksIGZlYXR1cmUpKTtcIixcbiAgICAgICAgXCJDUkVBVEUgVU5JUVVFIElOREVYIGlmIG5vdCBleGlzdHMgZmVhdHVyZXNfZmVhdHVyZV9pbmRleDEgT04gZmVhdHVyZXMoZnBfaWQsZmVhdHVyZSx4LHkpO1wiLFxuICAgICAgICBcIkNSRUFURSBJTkRFWCBpZiBub3QgZXhpc3RzIGZlYXR1cmVzX2ZlYXR1cmVfaW5kZXgyIE9OIGZlYXR1cmVzKGZlYXR1cmUpO1wiXG4gICAgXTtcblxuICAgIHN0YXRpYyBkcm9wcyA9IFtcbiAgICAgICAgXCJkcm9wIHRhYmxlIGlmIGV4aXN0cyBsYXlvdXRfaW1hZ2VzO1wiLFxuICAgICAgICBcImRyb3AgdGFibGUgaWYgZXhpc3RzIHNldHRpbmdzO1wiLFxuICAgICAgICBcImRyb3AgdGFibGUgaWYgZXhpc3RzIHNjYW5fcmVzdWx0cztcIixcbiAgICAgICAgXCJkcm9wIHRhYmxlIGlmIGV4aXN0cyBrYWxtYW5fZXN0aW1hdGVzO1wiXG4gICAgXTtcblxuICAgIHN0YXRpYyBtaWdyYXRpb24xID0gW1xuICAgICAgICBcIkFMVEVSIFRBQkxFIGxheW91dF9pbWFnZXMgQUREIGZsb29yX3BsYW5fbmFtZSBURVhUIE5VTEw7XCIsXG4gICAgICAgIFwidXBkYXRlIHNldHRpbmdzIHNldCB2YWx1ZSA9ICdcIiArIERiLmRhdGFiYXNlX2NvZGVfdmVyc2lvbiArIFwiJyB3aGVyZSBrZXkgPSAnZGF0YWJhc2VfY29kZV92ZXJzaW9uJztcIlxuICAgIF07XG5cbiAgICBzdGF0aWMgbWlncmF0aW9uMiA9IFtcbiAgICAgICAgXCJBTFRFUiBUQUJMRSBmZWF0dXJlcyBBREQgc19pZCBJTlQgTlVMTDtcIixcbiAgICAgICAgXCJEUk9QIElOREVYIGZlYXR1cmVzX2ZlYXR1cmVfaW5kZXgxO1wiLFxuICAgICAgICBcIkRST1AgSU5ERVggZmVhdHVyZXNfZmVhdHVyZV9pbmRleDI7XCIsXG4gICAgICAgIFwiQ1JFQVRFIFRBQkxFIGZlYXR1cmVzYThkMSAoZnBfaWQgVEVYVCwgeCBJTlRFR0VSLCB5IElOVEVHRVIsIGZlYXR1cmUgVEVYVCwgdmFsdWUgUkVBTCwgc19pZCBJTlRFR0VSLFwiXG4gICAgICAgICsgXCIgQ09OU1RSQUlOVCBmZWF0dXJlc19mcF9pZF94X3lfZmVhdHVyZV9zX2lkX3BrIFBSSU1BUlkgS0VZIChmcF9pZCwgeCwgeSwgZmVhdHVyZSwgc19pZCkpO1wiLFxuICAgICAgICBcIkNSRUFURSBVTklRVUUgSU5ERVggZmVhdHVyZXNfZmVhdHVyZV9pbmRleDEgT04gZmVhdHVyZXNhOGQxIChmcF9pZCwgZmVhdHVyZSwgeCwgeSwgc19pZCk7XCIsXG4gICAgICAgIFwiSU5TRVJUIElOVE8gZmVhdHVyZXNhOGQxKGZwX2lkLCB4LCB5LCBmZWF0dXJlLCB2YWx1ZSwgc19pZCkgU0VMRUNUIGZwX2lkLCB4LCB5LCBmZWF0dXJlLCB2YWx1ZSwgc19pZCBGUk9NIGZlYXR1cmVzO1wiLFxuICAgICAgICBcIkRST1AgVEFCTEUgZmVhdHVyZXM7XCIsXG4gICAgICAgIFwiQUxURVIgVEFCTEUgZmVhdHVyZXNhOGQxIFJFTkFNRSBUTyBmZWF0dXJlcztcIixcbiAgICAgICAgXCJDUkVBVEUgSU5ERVggZmVhdHVyZXNfZmVhdHVyZV9pbmRleDIgT04gZmVhdHVyZXMoZmVhdHVyZSk7XCIsXG4gICAgICAgIFwidXBkYXRlIHNldHRpbmdzIHNldCB2YWx1ZSA9ICdcIiArIERiLmRhdGFiYXNlX2NvZGVfdmVyc2lvbiArIFwiJyB3aGVyZSBrZXkgPSAnZGF0YWJhc2VfY29kZV92ZXJzaW9uJztcIlxuICAgIF07XG5cbiAgICBzdGF0aWMgbWlncmF0aW9uMyA9IFtcbiAgICAgICAgXCJpbnNlcnQgb3IgaWdub3JlIGludG8gc2V0dGluZ3MgdmFsdWVzICgnc2Nhbl9pZCcsIDY0KTtcIixcbiAgICAgICAgXCJ1cGRhdGUgc2V0dGluZ3Mgc2V0IHZhbHVlID0gJ1wiICsgRGIuZGF0YWJhc2VfY29kZV92ZXJzaW9uICsgXCInIHdoZXJlIGtleSA9ICdkYXRhYmFzZV9jb2RlX3ZlcnNpb24nO1wiXG4gICAgXTtcblxuICAgIHN0YXRpYyBtaWdyYXRpb240ID0gW1xuICAgICAgICBcImRyb3AgdGFibGUgZmVhdHVyZXM7XCIsXG4gICAgICAgIFwiQ1JFQVRFIFRBQkxFIGZlYXR1cmVzIChmcF9pZCBURVhULCB4IElOVEVHRVIsIHkgSU5URUdFUiwgZmVhdHVyZSBURVhULCB2YWx1ZSBSRUFMLCBcIlxuICAgICAgICArIFwiIENPTlNUUkFJTlQgZmVhdHVyZXNfZnBfaWRfeF95X2ZlYXR1cmVfcGsgUFJJTUFSWSBLRVkgKGZwX2lkLCB4LCB5LCBmZWF0dXJlKSk7XCIsXG4gICAgICAgIFwidXBkYXRlIHNldHRpbmdzIHNldCB2YWx1ZSA9ICdcIiArIERiLmRhdGFiYXNlX2NvZGVfdmVyc2lvbiArIFwiJyB3aGVyZSBrZXkgPSAnZGF0YWJhc2VfY29kZV92ZXJzaW9uJztcIlxuICAgIF07XG5cbiAgICBzdGF0aWMgbWlncmF0aW9uNSA9IFtcbiAgICAgICAgXCJDUkVBVEUgSU5ERVggaWYgbm90IGV4aXN0cyBzY2FuX3Jlc3VsdHNfZnBfaWRfaW5kZXggT04gc2Nhbl9yZXN1bHRzIChmcF9pZCk7XCIsXG4gICAgICAgIFwidXBkYXRlIHNldHRpbmdzIHNldCB2YWx1ZSA9ICdcIiArIERiLmRhdGFiYXNlX2NvZGVfdmVyc2lvbiArIFwiJyB3aGVyZSBrZXkgPSAnZGF0YWJhc2VfY29kZV92ZXJzaW9uJztcIlxuICAgIF07XG5cbiAgICBjb25zdHJ1Y3Rvcihsb2csIGRhdGFiYXNlID0gXCJkYi5zcWxpdGUzXCIpe1xuICAgICAgICB0aGlzLmxvZyA9IGxvZztcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoXCJEYi5jb25zdHJ1Y3RvclwiKTtcblxuICAgICAgICB0aGlzLmRiID0gbmV3IHNxbGl0ZTMuY2FjaGVkLkRhdGFiYXNlKGBkYi8ke2RhdGFiYXNlfWApO1xuICAgICAgICB0aGlzLmRiLnNlcmlhbGl6ZSgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmRiLmV4ZWMoXCJQUkFHTUEgam91cm5hbF9tb2RlID0gV0FMO1wiKTtcbiAgICAgICAgICAgIHRoaXMuZGIuZXhlYyhcIlBSQUdNQSBjYWNoZV9zaXplID0gNDA5NjAwMDtcIik7XG4gICAgICAgICAgICB0aGlzLmRiLmV4ZWMoXCJQUkFHTUEgb3B0aW1pemU7XCIpO1xuICAgICAgICAgICAgdGhpcy5kYi5leGVjKFwiUFJBR01BIGJ1c3lfdGltZW91dCA9IDE1MDAwMDtcIik7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmZlYXR1cmVzQ2FjaGUgPSB7fTtcbiAgICB9XG5cbiAgICBjbGVhckZlYXR1cmVzQ2FjaGUoZnBfaWQpe1xuICAgICAgICB0aGlzLmZlYXR1cmVzQ2FjaGVbZnBfaWRdID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIGZwX2lkXG4gICAgICovXG4gICAgY3JlYXRlRmVhdHVyZXNDYWNoZShmcF9pZCl7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZmVhdHVyZXNDYWNoZVtmcF9pZF0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmRiLmFsbChcInNlbGVjdCAqIGZyb20gZmVhdHVyZXMgd2hlcmUgZnBfaWQgPSA/O1wiLCBmcF9pZCwgKGVyciwgcm93cykgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgbGVuZ3RoID0gcm93cy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgbGV0IGZwX2lkLCB4LCB5LCBmZWF0dXJlLCB2YWx1ZTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGZwX2lkID0gcm93c1tpXS5mcF9pZDtcbiAgICAgICAgICAgICAgICAgICAgeCA9IHJvd3NbaV0ueDtcbiAgICAgICAgICAgICAgICAgICAgeSA9IHJvd3NbaV0ueTtcbiAgICAgICAgICAgICAgICAgICAgZmVhdHVyZSA9IHJvd3NbaV0uZmVhdHVyZTtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSByb3dzW2ldLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5mZWF0dXJlc0NhY2hlW2ZwX2lkXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZlYXR1cmVzQ2FjaGVbZnBfaWRdID0ge307XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvb3JkID0geCArIFwiX1wiICsgeTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZmVhdHVyZXNDYWNoZVtmcF9pZF1bY29vcmRdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZmVhdHVyZXNDYWNoZVtmcF9pZF1bY29vcmRdID0ge307XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmZlYXR1cmVzQ2FjaGVbZnBfaWRdW2Nvb3JkXVtmZWF0dXJlXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmxvZy5sb2coXCJGZWF0dXJlcyBDYWNoZSBjcmVhdGVkOiBcIiArIEpTT04uc3RyaW5naWZ5KE9iamVjdC5rZXlzKHRoaXMuZmVhdHVyZXNDYWNoZSkpKTtcbiAgICAgICAgICAgICAgICBpZiAocmVzb2x2ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldEZlYXR1cmVzQ2FjaGUoZnBfaWQpe1xuICAgICAgICBpZih0aGlzLmZlYXR1cmVzQ2FjaGVbZnBfaWRdID09PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZlYXR1cmVzQ2FjaGVbZnBfaWRdO1xuICAgIH1cblxuICAgIGdldEZlYXR1cmVWYWx1ZShmcF9pZCwgY29vcmQsIGZlYXR1cmUpe1xuICAgICAgICBpZih0aGlzLmZlYXR1cmVzQ2FjaGVbZnBfaWRdID09PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmKHRoaXMuZmVhdHVyZXNDYWNoZVtmcF9pZF1bY29vcmRdID09PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmKHRoaXMuZmVhdHVyZXNDYWNoZVtmcF9pZF1bY29vcmRdW2ZlYXR1cmVdID09PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZlYXR1cmVzQ2FjaGVbZnBfaWRdW2Nvb3JkXVtmZWF0dXJlXTtcbiAgICB9XG5cbiAgICBnZXRGZWF0dXJlTnVtYmVyKGZwX2lkLCBjb29yZCkge1xuICAgICAgICBsZXQgZnAsIGM7XG4gICAgICAgIGlmKHRoaXMuZmVhdHVyZXNDYWNoZVtmcF9pZF0gPT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgfVxuICAgICAgICBmcCA9IHRoaXMuZmVhdHVyZXNDYWNoZVtmcF9pZF07XG4gICAgICAgIGlmKGZwW2Nvb3JkXSA9PT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9XG4gICAgICAgIGMgPSBmcFtjb29yZF07XG4gICAgICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhjKTtcbiAgICAgICAgcmV0dXJuIGtleXMubGVuZ3RoO1xuICAgIH1cblxuICAgIGdldERhdGFiYXNlKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmRiO1xuICAgIH1cblxuICAgIGRvVXBncmFkZShkYiwgZGF0YWJhc2VDb2RlVmVyc2lvbiwgY2IpIHtcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoXCJEYi5kb1VwZ3JhZGVcIik7XG5cbiAgICAgICAgc3dpdGNoKGRhdGFiYXNlQ29kZVZlcnNpb24pe1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgIGRiLnNlcmlhbGl6ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIERiLm1pZ3JhdGlvbjEuZm9yRWFjaCgobWlnKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYi5ydW4obWlnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlVGFibGVzKGRiLCBjYik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICBkYi5zZXJpYWxpemUoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBEYi5taWdyYXRpb24yLmZvckVhY2goKG1pZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGIucnVuKG1pZyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVRhYmxlcyhkYiwgY2IpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgZGIuc2VyaWFsaXplKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgRGIubWlncmF0aW9uMy5mb3JFYWNoKChtaWcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRiLnJ1bihtaWcpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVUYWJsZXMoZGIsIGNiKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgIGRiLnNlcmlhbGl6ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIERiLm1pZ3JhdGlvbjQuZm9yRWFjaCgobWlnKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYi5ydW4obWlnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlVGFibGVzKGRiLCBjYik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICBkYi5zZXJpYWxpemUoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBEYi5taWdyYXRpb241LmZvckVhY2goKG1pZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGIucnVuKG1pZyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVRhYmxlcyhkYiwgY2IpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY3JlYXRlVGFibGVzKGRiLCBjYikge1xuICAgICAgICB0aGlzLmxvZy5kZWJ1ZyhcIkRiLmNyZWF0ZVRhYmxlc1wiKTtcbiAgICAgICAgbGV0IGNyZWF0ZXMgPSBEYi5jcmVhdGVzO1xuXG4gICAgICAgIGRiLnNlcmlhbGl6ZSgoKSA9PiB7XG4gICAgICAgICAgICBjcmVhdGVzLmZvckVhY2goZnVuY3Rpb24oY3JlYXRlKXtcbiAgICAgICAgICAgICAgICBkYi5ydW4oY3JlYXRlKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBsZXQgZGF0YWJhc2VDb2RlVmVyc2lvbiA9IDA7XG5cbiAgICAgICAgICAgIGRiLmFsbChcInNlbGVjdCAqIGZyb20gc2V0dGluZ3NcIiwgKGVyciwgcm93cykgPT4ge1xuICAgICAgICAgICAgICAgIHJvd3MuZm9yRWFjaChmdW5jdGlvbihyb3cpe1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2gocm93LmtleSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiZGF0YWJhc2VfY29kZV92ZXJzaW9uXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YWJhc2VDb2RlVmVyc2lvbiA9IE51bWJlcihyb3cudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYoZGF0YWJhc2VDb2RlVmVyc2lvbiA8IERiLmRhdGFiYXNlX2NvZGVfdmVyc2lvbil7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZG9VcGdyYWRlKGRiLCBkYXRhYmFzZUNvZGVWZXJzaW9uLCBjYik7XG4gICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgIGlmKGNiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYigpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldFNjYW5uZWRDb29yZHMoZnBfaWQsIGNiKXtcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoXCJEYi5nZXRTY2FubmVkQ29vcmRzXCIpO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBkYi5hbGwoRGIucXVlcnlfZ2V0X3NjYW5uZWRfY29vcmRzLCBmcF9pZCwgY2IpO1xuICAgIH1cblxuICAgIGdldEZsb29yUGxhbnMoY2IpIHtcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoXCJEYi5nZXRGbG9vclBsYW5zXCIpO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBkYi5hbGwoRGIucXVlcnlfZ2V0X2FsbF9mbG9vcnBsYW5zLCBjYik7XG4gICAgfVxuXG4gICAgdXBkYXRlRGF0YWJhc2UoZGF0YSwgY2IpIHtcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoXCJEYi51cGRhdGVEYXRhYmFzZVwiKTtcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgbGV0IHN0bXQgPSBkYi5wcmVwYXJlKERiLnF1ZXJ5X2luc2VydF92ZXJzaW9uKTtcbiAgICAgICAgc3RtdC5ydW4oZGF0YS5kYXRhYmFzZVZlcnNpb24pO1xuICAgICAgICBzdG10LmZpbmFsaXplKCk7XG5cbiAgICAgICAgc3RtdCA9IGRiLnByZXBhcmUoRGIucXVlcnlfdXBkYXRlX3ZlcnNpb24pO1xuICAgICAgICBzdG10LnJ1bihkYXRhLmRhdGFiYXNlVmVyc2lvbik7XG4gICAgICAgIHN0bXQuZmluYWxpemUoKTtcblxuICAgICAgICBpZih0eXBlb2YoZGF0YS5sYXlvdXRfaW1hZ2VzKSAhPSBcInVuZGVmaW5lZFwiICYmIGRhdGEubGF5b3V0X2ltYWdlcy5sZW5ndGggPiAwKXtcbiAgICAgICAgICAgIHN0bXQgPSBkYi5wcmVwYXJlKERiLnF1ZXJ5X2luc2VydF9sYXlvdXQpO1xuICAgICAgICAgICAgbGV0IHVwc3RtdCA9IGRiLnByZXBhcmUoRGIucXVlcnlfdXBkYXRlX2xheW91dCk7XG5cbiAgICAgICAgICAgIGRhdGEubGF5b3V0X2ltYWdlcy5mb3JFYWNoKGZ1bmN0aW9uKGVsKXtcbiAgICAgICAgICAgICAgICBsZXQgaWQgPSBlbC5pZDtcbiAgICAgICAgICAgICAgICBsZXQgZmxvb3JfcGxhbl9uYW1lID0gZWwuZmxvb3JwbGFubmFtZTtcbiAgICAgICAgICAgICAgICBsZXQgc3RyaW5nZGF0YSA9IEpTT04uc3RyaW5naWZ5KGVsKTtcbiAgICAgICAgICAgICAgICBzdG10LnJ1bihpZCwgc3RyaW5nZGF0YSwgZmxvb3JfcGxhbl9uYW1lKTtcbiAgICAgICAgICAgICAgICB1cHN0bXQucnVuKHN0cmluZ2RhdGEsIGZsb29yX3BsYW5fbmFtZSwgaWQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzdG10LmZpbmFsaXplKCk7XG4gICAgICAgICAgICB1cHN0bXQuZmluYWxpemUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNiKCk7XG4gICAgfVxuXG4gICAgc2F2ZVJlYWRpbmdzKHBheWxvYWQsIGNiKXtcbiAgICAgICAgbGV0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBsb2cuZGVidWcoXCJEYi5zYXZlUmVhZGluZ3NcIik7XG5cbiAgICAgICAgbGV0IHN0bXQgPSBkYi5wcmVwYXJlKERiLnF1ZXJ5X2luc2VydF9zY2FuX3Jlc3VsdHMpO1xuICAgICAgICBsZXQgZmluaXNoZWQgPSAwO1xuICAgICAgICBsZXQgeHkgPSBbXTtcbiAgICAgICAgcGF5bG9hZC5mb3JFYWNoKChlbCkgPT4ge1xuICAgICAgICAgICAgZGIuZ2V0KERiLnF1ZXJ5X2dldF9zY2FuX2lkLCAoZXJyLCByb3cpID0+IHtcbiAgICAgICAgICAgICAgICBkYi5ydW4oRGIucXVlcnlfdXBkYXRlX3NjYW5faWQsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc19pZCA9IE51bWJlcihyb3cudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmcF9pZCA9IGVsLmZwX2lkO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBhcF9pZCA9IGVsLmFwX2lkO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB4ID0gTnVtYmVyKGVsLngpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB5ID0gTnVtYmVyKGVsLnkpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSB4ICsgXCJfXCIgKyB5O1xuICAgICAgICAgICAgICAgICAgICBpZih4eS5pbmRleE9mKGtleSkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4eS5wdXNoKGtleSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBOdW1iZXIoZWwudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBvcmlnX3ZhbHVlcyA9IGVsLm9yaWdfdmFsdWVzO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjcmVhdGVkID0gZWwuY3JlYXRlZDtcbiAgICAgICAgICAgICAgICAgICAgc3RtdC5ydW4oc19pZCwgZnBfaWQsIGFwX2lkLCB4LCB5LCB2YWx1ZSwgb3JpZ192YWx1ZXMsIGNyZWF0ZWQsIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbmlzaGVkKys7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmluaXNoZWQgPj0gcGF5bG9hZC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdG10LmZpbmFsaXplKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeHkuZm9yRWFjaCgoY29vcmQsIGkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2FsbCA9IGkgPT09ICh4eS5sZW5ndGggLTEpID8gY2IgOiAoKSA9PiB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgW3gsIHldID0gY29vcmQuc3BsaXQoXCJfXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUthbG1hbihmcF9pZCwgTnVtYmVyKHgpLCBOdW1iZXIoeSksIGNhbGwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB1cGRhdGVLYWxtYW4oZnBfaWQsIHgsIHksIGNiKXtcbiAgICAgICAgbGV0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBsZXQga2FsbWFuID0ge307XG5cbiAgICAgICAgZGIuYWxsKERiLnF1ZXJ5X2dldF9mb3Jfa2FsbWFuLCBmcF9pZCwgeCwgeSwgKGVyciwgcm93cykgPT4ge1xuICAgICAgICAgICAgY29uc3QgaW5zZXJ0ID0gZGIucHJlcGFyZShEYi5xdWVyeV9pbnNlcnRfa2FsbWFuX2VzdGltYXRlcyk7XG4gICAgICAgICAgICBjb25zdCB1cGRhdGUgPSBkYi5wcmVwYXJlKERiLnF1ZXJ5X3VwZGF0ZV9rYWxtYW5fZXN0aW1hdGVzKTtcblxuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGxvZy5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IGRvbmUgPSAwO1xuICAgICAgICAgICAgcm93cy5mb3JFYWNoKChyb3cpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgayA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmIChrYWxtYW5bcm93LmZwX2lkICsgcm93LmFwX2lkICsgcm93LnggKyByb3cueV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBrYWxtYW5bcm93LmZwX2lkICsgcm93LmFwX2lkICsgcm93LnggKyByb3cueV0gPSBuZXcgS2FsbWFuRmlsdGVyKHJvdy5jZXN0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgayA9IGthbG1hbltyb3cuZnBfaWQgKyByb3cuYXBfaWQgKyByb3cueCArIHJvdy55XTtcblxuICAgICAgICAgICAgICAgIGxldCB2YWx1ZXMgPSByb3cudmFsdWVzXG4gICAgICAgICAgICAgICAgICAgIC5zcGxpdChcIixcIilcbiAgICAgICAgICAgICAgICAgICAgLm1hcCgoZWwpID0+IHsgcmV0dXJuIE51bWJlcihlbCk7IH0pO1xuXG4gICAgICAgICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHZhbHVlcy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICAgICAgICAgIGsuYWRkU2FtcGxlKHZhbHVlc1tpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGluc2VydC5ydW4ocm93LmZwX2lkLCByb3cuYXBfaWQsIHJvdy54LCByb3cueSwgay5nZXRFc3RpbWF0ZSgpLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZS5ydW4oay5nZXRFc3RpbWF0ZSgpLCByb3cuZnBfaWQsIHJvdy5hcF9pZCwgcm93LngsIHJvdy55LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb25lKys7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihkb25lID49IHJvd3MubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZy5sb2coXCJGaW5pc2hlZCBpbnNlcnRzIGFuZCB1cGRhdGVzXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc2VydC5maW5hbGl6ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZS5maW5hbGl6ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRiLnNlcmlhbGl6ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRiLnJ1bihcImRlbGV0ZSBmcm9tIGZlYXR1cmVzIHdoZXJlIGZwX2lkID0gPyBhbmQgeCA9ID8gYW5kIHkgPSA/XCIsIGZwX2lkLCByb3cueCwgcm93LnkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYi5ydW4oRGIucXVlcnlfdXBkYXRlX2ZlYXR1cmVzLCBmcF9pZCwgZnBfaWQsIHJvdy54LCByb3cueCwgcm93LnksIHJvdy55LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYihmcF9pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZy5sb2coXCJGaW5pc2hlZCB1cGRhdGluZyBmZWF0dXJlc1wiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlaW5kZXgoKXtcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgbGV0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBsb2cubG9nKFwiU3RhcnRpbmcgSW5kZXhpbmdcIik7XG4gICAgICAgIGRiLmFsbChcInNlbGVjdCBmcF9pZCwgeCwgeSBmcm9tIHNjYW5fcmVzdWx0cyBHUk9VUCBCWSBmcF9pZCwgeCwgeTtcIiwgKGVyciwgcm93cykgPT4ge1xuICAgICAgICAgICAgcm93cy5mb3JFYWNoKChyb3csIGkpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBmcF9pZCA9IHJvdy5mcF9pZDtcbiAgICAgICAgICAgICAgICBjb25zdCB4ID0gcm93Lng7XG4gICAgICAgICAgICAgICAgY29uc3QgeSA9IHJvdy55O1xuICAgICAgICAgICAgICAgIGNvbnN0IGNhbGwgPSBpID09PSAocm93cy5sZW5ndGggLTEpID8gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInNob3VsZCBjbG9zZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2cuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYi5jbG9zZSgpO1xuICAgICAgICAgICAgICAgIH0gOiAoKSA9PiB7fTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUthbG1hbihmcF9pZCwgeCwgeSwgY2FsbCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5cbm1vZHVsZS5leHBvcnRzID0gRGI7Il19
//# sourceMappingURL=Db.js.map
