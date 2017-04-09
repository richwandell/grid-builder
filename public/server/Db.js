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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvRGIuZXM2Il0sIm5hbWVzIjpbInNxbGl0ZTMiLCJyZXF1aXJlIiwidmVyYm9zZSIsIkRiIiwibG9nIiwiZGF0YWJhc2UiLCJkZWJ1ZyIsImRiIiwiY2FjaGVkIiwiRGF0YWJhc2UiLCJzZXJpYWxpemUiLCJleGVjIiwiZmVhdHVyZXNDYWNoZSIsImZwX2lkIiwidW5kZWZpbmVkIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJhbGwiLCJlcnIiLCJyb3dzIiwibGVuZ3RoIiwieCIsInkiLCJmZWF0dXJlIiwidmFsdWUiLCJpIiwiY29vcmQiLCJKU09OIiwic3RyaW5naWZ5IiwiT2JqZWN0Iiwia2V5cyIsImZwIiwiYyIsImRhdGFiYXNlQ29kZVZlcnNpb24iLCJjYiIsIm1pZ3JhdGlvbjEiLCJmb3JFYWNoIiwibWlnIiwicnVuIiwiY3JlYXRlVGFibGVzIiwibWlncmF0aW9uMiIsIm1pZ3JhdGlvbjMiLCJtaWdyYXRpb240IiwibWlncmF0aW9uNSIsImNyZWF0ZXMiLCJjcmVhdGUiLCJyb3ciLCJrZXkiLCJOdW1iZXIiLCJkYXRhYmFzZV9jb2RlX3ZlcnNpb24iLCJkb1VwZ3JhZGUiLCJxdWVyeV9nZXRfc2Nhbm5lZF9jb29yZHMiLCJxdWVyeV9nZXRfYWxsX2Zsb29ycGxhbnMiLCJkYXRhIiwic3RtdCIsInByZXBhcmUiLCJxdWVyeV9pbnNlcnRfdmVyc2lvbiIsImRhdGFiYXNlVmVyc2lvbiIsImZpbmFsaXplIiwicXVlcnlfdXBkYXRlX3ZlcnNpb24iLCJsYXlvdXRfaW1hZ2VzIiwicXVlcnlfaW5zZXJ0X2xheW91dCIsInVwc3RtdCIsInF1ZXJ5X3VwZGF0ZV9sYXlvdXQiLCJlbCIsImlkIiwiZmxvb3JfcGxhbl9uYW1lIiwiZmxvb3JwbGFubmFtZSIsInN0cmluZ2RhdGEiLCJwYXlsb2FkIiwicXVlcnlfaW5zZXJ0X3NjYW5fcmVzdWx0cyIsImZpbmlzaGVkIiwieHkiLCJnZXQiLCJxdWVyeV9nZXRfc2Nhbl9pZCIsInF1ZXJ5X3VwZGF0ZV9zY2FuX2lkIiwic19pZCIsImFwX2lkIiwiaW5kZXhPZiIsInB1c2giLCJvcmlnX3ZhbHVlcyIsImNyZWF0ZWQiLCJjYWxsIiwic3BsaXQiLCJ1cGRhdGVLYWxtYW4iLCJrYWxtYW4iLCJxdWVyeV9nZXRfZm9yX2thbG1hbiIsImluc2VydCIsInF1ZXJ5X2luc2VydF9rYWxtYW5fZXN0aW1hdGVzIiwidXBkYXRlIiwicXVlcnlfdXBkYXRlX2thbG1hbl9lc3RpbWF0ZXMiLCJlcnJvciIsImRvbmUiLCJrIiwiY2VzdCIsInZhbHVlcyIsIm1hcCIsImFkZFNhbXBsZSIsImdldEVzdGltYXRlIiwicXVlcnlfdXBkYXRlX2ZlYXR1cmVzIiwiY29uc29sZSIsImNsb3NlIiwicXVlcnlfZ2V0X2RhdGFiYXNlX3ZlcnNpb24iLCJxdWVyeV9nZXRfc2Nhbl9yZXN1bHRzIiwicXVlcnlfdXBkYXRlX29sZGVzdF9mZWF0dXJlcyIsInF1ZXJ5X2dldF9mZWF0dXJlcyIsInF1ZXJ5X2dldF9taW5fc2lkIiwiZHJvcHMiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7Ozs7Ozs7QUFFQSxJQUFJQSxVQUFVQyxRQUFRLFNBQVIsRUFBbUJDLE9BQW5CLEVBQWQ7O0lBRU1DLEU7QUFpSEYsZ0JBQVlDLEdBQVosRUFBeUM7QUFBQTs7QUFBQSxZQUF4QkMsUUFBd0IsdUVBQWIsWUFBYTs7QUFBQTs7QUFDckMsYUFBS0QsR0FBTCxHQUFXQSxHQUFYO0FBQ0EsYUFBS0EsR0FBTCxDQUFTRSxLQUFULENBQWUsZ0JBQWY7O0FBRUEsYUFBS0MsRUFBTCxHQUFVLElBQUlQLFFBQVFRLE1BQVIsQ0FBZUMsUUFBbkIsU0FBa0NKLFFBQWxDLENBQVY7QUFDQSxhQUFLRSxFQUFMLENBQVFHLFNBQVIsQ0FBa0IsWUFBTTtBQUNwQixrQkFBS0gsRUFBTCxDQUFRSSxJQUFSLENBQWEsNEJBQWI7QUFDQSxrQkFBS0osRUFBTCxDQUFRSSxJQUFSLENBQWEsOEJBQWI7QUFDQSxrQkFBS0osRUFBTCxDQUFRSSxJQUFSLENBQWEsa0JBQWI7QUFDQSxrQkFBS0osRUFBTCxDQUFRSSxJQUFSLENBQWEsK0JBQWI7QUFDSCxTQUxEO0FBTUEsYUFBS0MsYUFBTCxHQUFxQixFQUFyQjtBQUNIOzs7OzJDQUVrQkMsSyxFQUFNO0FBQ3JCLGlCQUFLRCxhQUFMLENBQW1CQyxLQUFuQixJQUE0QkMsU0FBNUI7QUFDSDs7QUFFRDs7Ozs7Ozs0Q0FJb0JELEssRUFBTTtBQUFBOztBQUN0QixtQkFBTyxJQUFJRSxPQUFKLENBQVksVUFBQ0MsT0FBRCxFQUFVQyxNQUFWLEVBQXFCO0FBQ3BDLG9CQUFHLE9BQUtMLGFBQUwsQ0FBbUJDLEtBQW5CLE1BQThCQyxTQUFqQyxFQUE0QztBQUN4Q0U7QUFDQTtBQUNIO0FBQ0QsdUJBQUtULEVBQUwsQ0FBUVcsR0FBUixDQUFZLHlDQUFaLEVBQXVETCxLQUF2RCxFQUE4RCxVQUFDTSxHQUFELEVBQU1DLElBQU4sRUFBZTtBQUN6RSx3QkFBSUQsR0FBSixFQUFTO0FBQ0xGO0FBQ0E7QUFDSDtBQUNELHdCQUFNSSxTQUFTRCxLQUFLQyxNQUFwQjtBQUNBLHdCQUFJUixjQUFKO0FBQUEsd0JBQVdTLFVBQVg7QUFBQSx3QkFBY0MsVUFBZDtBQUFBLHdCQUFpQkMsZ0JBQWpCO0FBQUEsd0JBQTBCQyxjQUExQjtBQUNBLHlCQUFLLElBQUlDLElBQUksQ0FBYixFQUFnQkEsSUFBSUwsTUFBcEIsRUFBNEJLLEdBQTVCLEVBQWlDO0FBQzdCYixnQ0FBUU8sS0FBS00sQ0FBTCxFQUFRYixLQUFoQjtBQUNBUyw0QkFBSUYsS0FBS00sQ0FBTCxFQUFRSixDQUFaO0FBQ0FDLDRCQUFJSCxLQUFLTSxDQUFMLEVBQVFILENBQVo7QUFDQUMsa0NBQVVKLEtBQUtNLENBQUwsRUFBUUYsT0FBbEI7QUFDQUMsZ0NBQVFMLEtBQUtNLENBQUwsRUFBUUQsS0FBaEI7QUFDQSw0QkFBSSxPQUFLYixhQUFMLENBQW1CQyxLQUFuQixNQUE4QkMsU0FBbEMsRUFBNkM7QUFDekMsbUNBQUtGLGFBQUwsQ0FBbUJDLEtBQW5CLElBQTRCLEVBQTVCO0FBQ0g7QUFDRCw0QkFBSWMsUUFBUUwsSUFBSSxHQUFKLEdBQVVDLENBQXRCO0FBQ0EsNEJBQUksT0FBS1gsYUFBTCxDQUFtQkMsS0FBbkIsRUFBMEJjLEtBQTFCLE1BQXFDYixTQUF6QyxFQUFvRDtBQUNoRCxtQ0FBS0YsYUFBTCxDQUFtQkMsS0FBbkIsRUFBMEJjLEtBQTFCLElBQW1DLEVBQW5DO0FBQ0g7O0FBRUQsK0JBQUtmLGFBQUwsQ0FBbUJDLEtBQW5CLEVBQTBCYyxLQUExQixFQUFpQ0gsT0FBakMsSUFBNENDLEtBQTVDO0FBQ0g7QUFDRCwyQkFBS3JCLEdBQUwsQ0FBU0EsR0FBVCxDQUFhLDZCQUE2QndCLEtBQUtDLFNBQUwsQ0FBZUMsT0FBT0MsSUFBUCxDQUFZLE9BQUtuQixhQUFqQixDQUFmLENBQTFDO0FBQ0Esd0JBQUlJLE9BQUosRUFBYTtBQUNUQTtBQUNIO0FBQ0osaUJBM0JEO0FBNEJILGFBakNNLENBQVA7QUFrQ0g7Ozt5Q0FFZ0JILEssRUFBTTtBQUNuQixnQkFBRyxLQUFLRCxhQUFMLENBQW1CQyxLQUFuQixNQUE4QkMsU0FBakMsRUFBMkM7QUFDdkMsdUJBQU8sS0FBUDtBQUNIO0FBQ0QsbUJBQU8sS0FBS0YsYUFBTCxDQUFtQkMsS0FBbkIsQ0FBUDtBQUNIOzs7d0NBRWVBLEssRUFBT2MsSyxFQUFPSCxPLEVBQVE7QUFDbEMsZ0JBQUcsS0FBS1osYUFBTCxDQUFtQkMsS0FBbkIsTUFBOEJDLFNBQWpDLEVBQTJDO0FBQ3ZDLHVCQUFPLEtBQVA7QUFDSDtBQUNELGdCQUFHLEtBQUtGLGFBQUwsQ0FBbUJDLEtBQW5CLEVBQTBCYyxLQUExQixNQUFxQ2IsU0FBeEMsRUFBa0Q7QUFDOUMsdUJBQU8sS0FBUDtBQUNIO0FBQ0QsZ0JBQUcsS0FBS0YsYUFBTCxDQUFtQkMsS0FBbkIsRUFBMEJjLEtBQTFCLEVBQWlDSCxPQUFqQyxNQUE4Q1YsU0FBakQsRUFBMkQ7QUFDdkQsdUJBQU8sS0FBUDtBQUNIO0FBQ0QsbUJBQU8sS0FBS0YsYUFBTCxDQUFtQkMsS0FBbkIsRUFBMEJjLEtBQTFCLEVBQWlDSCxPQUFqQyxDQUFQO0FBQ0g7Ozt5Q0FFZ0JYLEssRUFBT2MsSyxFQUFPO0FBQzNCLGdCQUFJSyxXQUFKO0FBQUEsZ0JBQVFDLFVBQVI7QUFDQSxnQkFBRyxLQUFLckIsYUFBTCxDQUFtQkMsS0FBbkIsTUFBOEJDLFNBQWpDLEVBQTJDO0FBQ3ZDLHVCQUFPLENBQVA7QUFDSDtBQUNEa0IsaUJBQUssS0FBS3BCLGFBQUwsQ0FBbUJDLEtBQW5CLENBQUw7QUFDQSxnQkFBR21CLEdBQUdMLEtBQUgsTUFBY2IsU0FBakIsRUFBMkI7QUFDdkIsdUJBQU8sQ0FBUDtBQUNIO0FBQ0RtQixnQkFBSUQsR0FBR0wsS0FBSCxDQUFKO0FBQ0EsZ0JBQU1JLE9BQU9ELE9BQU9DLElBQVAsQ0FBWUUsQ0FBWixDQUFiO0FBQ0EsbUJBQU9GLEtBQUtWLE1BQVo7QUFDSDs7O3NDQUVZO0FBQ1QsbUJBQU8sS0FBS2QsRUFBWjtBQUNIOzs7a0NBRVNBLEUsRUFBSTJCLG1CLEVBQXFCQyxFLEVBQUk7QUFBQTs7QUFDbkMsaUJBQUsvQixHQUFMLENBQVNFLEtBQVQsQ0FBZSxjQUFmOztBQUVBLG9CQUFPNEIsbUJBQVA7QUFDSSxxQkFBSyxDQUFMO0FBQ0kzQix1QkFBR0csU0FBSCxDQUFhLFlBQU07QUFDZlAsMkJBQUdpQyxVQUFILENBQWNDLE9BQWQsQ0FBc0IsVUFBQ0MsR0FBRCxFQUFTO0FBQzNCL0IsK0JBQUdnQyxHQUFILENBQU9ELEdBQVA7QUFDSCx5QkFGRDtBQUdBLCtCQUFLRSxZQUFMLENBQWtCakMsRUFBbEIsRUFBc0I0QixFQUF0QjtBQUNILHFCQUxEO0FBTUE7O0FBRUoscUJBQUssQ0FBTDtBQUNJNUIsdUJBQUdHLFNBQUgsQ0FBYSxZQUFNO0FBQ2ZQLDJCQUFHc0MsVUFBSCxDQUFjSixPQUFkLENBQXNCLFVBQUNDLEdBQUQsRUFBUztBQUMzQi9CLCtCQUFHZ0MsR0FBSCxDQUFPRCxHQUFQO0FBQ0gseUJBRkQ7QUFHQSwrQkFBS0UsWUFBTCxDQUFrQmpDLEVBQWxCLEVBQXNCNEIsRUFBdEI7QUFDSCxxQkFMRDtBQU1BOztBQUVKLHFCQUFLLENBQUw7QUFDSTVCLHVCQUFHRyxTQUFILENBQWEsWUFBTTtBQUNmUCwyQkFBR3VDLFVBQUgsQ0FBY0wsT0FBZCxDQUFzQixVQUFDQyxHQUFELEVBQVM7QUFDM0IvQiwrQkFBR2dDLEdBQUgsQ0FBT0QsR0FBUDtBQUNILHlCQUZEO0FBR0EsK0JBQUtFLFlBQUwsQ0FBa0JqQyxFQUFsQixFQUFzQjRCLEVBQXRCO0FBQ0gscUJBTEQ7QUFNQTs7QUFFSixxQkFBSyxDQUFMO0FBQ0k1Qix1QkFBR0csU0FBSCxDQUFhLFlBQU07QUFDZlAsMkJBQUd3QyxVQUFILENBQWNOLE9BQWQsQ0FBc0IsVUFBQ0MsR0FBRCxFQUFTO0FBQzNCL0IsK0JBQUdnQyxHQUFILENBQU9ELEdBQVA7QUFDSCx5QkFGRDtBQUdBLCtCQUFLRSxZQUFMLENBQWtCakMsRUFBbEIsRUFBc0I0QixFQUF0QjtBQUNILHFCQUxEO0FBTUE7O0FBRUoscUJBQUssQ0FBTDtBQUNJNUIsdUJBQUdHLFNBQUgsQ0FBYSxZQUFNO0FBQ2ZQLDJCQUFHeUMsVUFBSCxDQUFjUCxPQUFkLENBQXNCLFVBQUNDLEdBQUQsRUFBUztBQUMzQi9CLCtCQUFHZ0MsR0FBSCxDQUFPRCxHQUFQO0FBQ0gseUJBRkQ7QUFHQSwrQkFBS0UsWUFBTCxDQUFrQmpDLEVBQWxCLEVBQXNCNEIsRUFBdEI7QUFDSCxxQkFMRDtBQU1BO0FBNUNSO0FBOENIOzs7cUNBRVk1QixFLEVBQUk0QixFLEVBQUk7QUFBQTs7QUFDakIsaUJBQUsvQixHQUFMLENBQVNFLEtBQVQsQ0FBZSxpQkFBZjtBQUNBLGdCQUFJdUMsVUFBVTFDLEdBQUcwQyxPQUFqQjs7QUFFQXRDLGVBQUdHLFNBQUgsQ0FBYSxZQUFNO0FBQ2ZtQyx3QkFBUVIsT0FBUixDQUFnQixVQUFTUyxNQUFULEVBQWdCO0FBQzVCdkMsdUJBQUdnQyxHQUFILENBQU9PLE1BQVA7QUFDSCxpQkFGRDs7QUFJQSxvQkFBSVosc0JBQXNCLENBQTFCOztBQUVBM0IsbUJBQUdXLEdBQUgsQ0FBTyx3QkFBUCxFQUFpQyxVQUFDQyxHQUFELEVBQU1DLElBQU4sRUFBZTtBQUM1Q0EseUJBQUtpQixPQUFMLENBQWEsVUFBU1UsR0FBVCxFQUFhO0FBQ3RCLGdDQUFPQSxJQUFJQyxHQUFYO0FBQ0ksaUNBQUssdUJBQUw7QUFDSWQsc0RBQXNCZSxPQUFPRixJQUFJdEIsS0FBWCxDQUF0QjtBQUNBO0FBSFI7QUFLSCxxQkFORDtBQU9BLHdCQUFHUyxzQkFBc0IvQixHQUFHK0MscUJBQTVCLEVBQWtEO0FBQzlDLCtCQUFLQyxTQUFMLENBQWU1QyxFQUFmLEVBQW1CMkIsbUJBQW5CLEVBQXdDQyxFQUF4QztBQUNILHFCQUZELE1BRUs7QUFDRCw0QkFBR0EsRUFBSCxFQUFPO0FBQ0hBO0FBQ0g7QUFDSjtBQUNKLGlCQWZEO0FBZ0JILGFBdkJEO0FBd0JIOzs7eUNBRWdCdEIsSyxFQUFPc0IsRSxFQUFHO0FBQ3ZCLGlCQUFLL0IsR0FBTCxDQUFTRSxLQUFULENBQWUscUJBQWY7QUFDQSxnQkFBSUMsS0FBSyxLQUFLQSxFQUFkO0FBQ0FBLGVBQUdXLEdBQUgsQ0FBT2YsR0FBR2lELHdCQUFWLEVBQW9DdkMsS0FBcEMsRUFBMkNzQixFQUEzQztBQUNIOzs7c0NBRWFBLEUsRUFBSTtBQUNkLGlCQUFLL0IsR0FBTCxDQUFTRSxLQUFULENBQWUsa0JBQWY7QUFDQSxnQkFBSUMsS0FBSyxLQUFLQSxFQUFkO0FBQ0FBLGVBQUdXLEdBQUgsQ0FBT2YsR0FBR2tELHdCQUFWLEVBQW9DbEIsRUFBcEM7QUFDSDs7O3VDQUVjbUIsSSxFQUFNbkIsRSxFQUFJO0FBQ3JCLGlCQUFLL0IsR0FBTCxDQUFTRSxLQUFULENBQWUsbUJBQWY7QUFDQSxnQkFBSUMsS0FBSyxLQUFLQSxFQUFkO0FBQ0EsZ0JBQUlnRCxPQUFPaEQsR0FBR2lELE9BQUgsQ0FBV3JELEdBQUdzRCxvQkFBZCxDQUFYO0FBQ0FGLGlCQUFLaEIsR0FBTCxDQUFTZSxLQUFLSSxlQUFkO0FBQ0FILGlCQUFLSSxRQUFMOztBQUVBSixtQkFBT2hELEdBQUdpRCxPQUFILENBQVdyRCxHQUFHeUQsb0JBQWQsQ0FBUDtBQUNBTCxpQkFBS2hCLEdBQUwsQ0FBU2UsS0FBS0ksZUFBZDtBQUNBSCxpQkFBS0ksUUFBTDs7QUFFQSxnQkFBRyxPQUFPTCxLQUFLTyxhQUFaLElBQThCLFdBQTlCLElBQTZDUCxLQUFLTyxhQUFMLENBQW1CeEMsTUFBbkIsR0FBNEIsQ0FBNUUsRUFBOEU7QUFDMUVrQyx1QkFBT2hELEdBQUdpRCxPQUFILENBQVdyRCxHQUFHMkQsbUJBQWQsQ0FBUDtBQUNBLG9CQUFJQyxTQUFTeEQsR0FBR2lELE9BQUgsQ0FBV3JELEdBQUc2RCxtQkFBZCxDQUFiOztBQUVBVixxQkFBS08sYUFBTCxDQUFtQnhCLE9BQW5CLENBQTJCLFVBQVM0QixFQUFULEVBQVk7QUFDbkMsd0JBQUlDLEtBQUtELEdBQUdDLEVBQVo7QUFDQSx3QkFBSUMsa0JBQWtCRixHQUFHRyxhQUF6QjtBQUNBLHdCQUFJQyxhQUFhekMsS0FBS0MsU0FBTCxDQUFlb0MsRUFBZixDQUFqQjtBQUNBVix5QkFBS2hCLEdBQUwsQ0FBUzJCLEVBQVQsRUFBYUcsVUFBYixFQUF5QkYsZUFBekI7QUFDQUosMkJBQU94QixHQUFQLENBQVc4QixVQUFYLEVBQXVCRixlQUF2QixFQUF3Q0QsRUFBeEM7QUFDSCxpQkFORDtBQU9BWCxxQkFBS0ksUUFBTDtBQUNBSSx1QkFBT0osUUFBUDtBQUNIOztBQUVEeEI7QUFDSDs7O3FDQUVZbUMsTyxFQUFTbkMsRSxFQUFHO0FBQUE7O0FBQ3JCLGdCQUFJL0IsTUFBTSxLQUFLQSxHQUFmO0FBQ0EsZ0JBQUlHLEtBQUssS0FBS0EsRUFBZDtBQUNBSCxnQkFBSUUsS0FBSixDQUFVLGlCQUFWOztBQUVBLGdCQUFJaUQsT0FBT2hELEdBQUdpRCxPQUFILENBQVdyRCxHQUFHb0UseUJBQWQsQ0FBWDtBQUNBLGdCQUFJQyxXQUFXLENBQWY7QUFDQSxnQkFBSUMsS0FBSyxFQUFUO0FBQ0FILG9CQUFRakMsT0FBUixDQUFnQixVQUFDNEIsRUFBRCxFQUFRO0FBQ3BCMUQsbUJBQUdtRSxHQUFILENBQU92RSxHQUFHd0UsaUJBQVYsRUFBNkIsVUFBQ3hELEdBQUQsRUFBTTRCLEdBQU4sRUFBYztBQUN2Q3hDLHVCQUFHZ0MsR0FBSCxDQUFPcEMsR0FBR3lFLG9CQUFWLEVBQWdDLFlBQU07QUFDbEMsNEJBQU1DLE9BQU81QixPQUFPRixJQUFJdEIsS0FBWCxDQUFiO0FBQ0EsNEJBQU1aLFFBQVFvRCxHQUFHcEQsS0FBakI7QUFDQSw0QkFBTWlFLFFBQVFiLEdBQUdhLEtBQWpCO0FBQ0EsNEJBQU14RCxJQUFJMkIsT0FBT2dCLEdBQUczQyxDQUFWLENBQVY7QUFDQSw0QkFBTUMsSUFBSTBCLE9BQU9nQixHQUFHMUMsQ0FBVixDQUFWO0FBQ0EsNEJBQU15QixNQUFNMUIsSUFBSSxHQUFKLEdBQVVDLENBQXRCO0FBQ0EsNEJBQUdrRCxHQUFHTSxPQUFILENBQVcvQixHQUFYLE1BQW9CLENBQUMsQ0FBeEIsRUFBMkI7QUFDdkJ5QiwrQkFBR08sSUFBSCxDQUFRaEMsR0FBUjtBQUNIO0FBQ0QsNEJBQU12QixRQUFRd0IsT0FBT2dCLEdBQUd4QyxLQUFWLENBQWQ7QUFDQSw0QkFBTXdELGNBQWNoQixHQUFHZ0IsV0FBdkI7QUFDQSw0QkFBTUMsVUFBVWpCLEdBQUdpQixPQUFuQjtBQUNBM0IsNkJBQUtoQixHQUFMLENBQVNzQyxJQUFULEVBQWVoRSxLQUFmLEVBQXNCaUUsS0FBdEIsRUFBNkJ4RCxDQUE3QixFQUFnQ0MsQ0FBaEMsRUFBbUNFLEtBQW5DLEVBQTBDd0QsV0FBMUMsRUFBdURDLE9BQXZELEVBQWdFLFVBQUMvRCxHQUFELEVBQVM7QUFDckVxRDtBQUNBLGdDQUFJQSxZQUFZRixRQUFRakQsTUFBeEIsRUFBZ0M7QUFDNUJrQyxxQ0FBS0ksUUFBTDtBQUNBYyxtQ0FBR3BDLE9BQUgsQ0FBVyxVQUFDVixLQUFELEVBQVFELENBQVIsRUFBYztBQUNyQix3Q0FBTXlELE9BQU96RCxNQUFPK0MsR0FBR3BELE1BQUgsR0FBVyxDQUFsQixHQUF1QmMsRUFBdkIsR0FBNEIsWUFBTSxDQUFFLENBQWpEOztBQURxQix1REFFTlIsTUFBTXlELEtBQU4sQ0FBWSxHQUFaLENBRk07QUFBQTtBQUFBLHdDQUVkOUQsQ0FGYztBQUFBLHdDQUVYQyxDQUZXOztBQUdyQiwyQ0FBSzhELFlBQUwsQ0FBa0J4RSxLQUFsQixFQUF5Qm9DLE9BQU8zQixDQUFQLENBQXpCLEVBQW9DMkIsT0FBTzFCLENBQVAsQ0FBcEMsRUFBK0M0RCxJQUEvQztBQUNILGlDQUpEO0FBS0g7QUFDSix5QkFWRDtBQVdILHFCQXhCRDtBQXlCSCxpQkExQkQ7QUEyQkgsYUE1QkQ7QUE2Qkg7OztxQ0FFWXRFLEssRUFBT1MsQyxFQUFHQyxDLEVBQUdZLEUsRUFBRztBQUFBOztBQUN6QixnQkFBSS9CLE1BQU0sS0FBS0EsR0FBZjtBQUNBLGdCQUFJRyxLQUFLLEtBQUtBLEVBQWQ7QUFDQSxnQkFBSStFLFNBQVMsRUFBYjs7QUFFQS9FLGVBQUdXLEdBQUgsQ0FBT2YsR0FBR29GLG9CQUFWLEVBQWdDMUUsS0FBaEMsRUFBdUNTLENBQXZDLEVBQTBDQyxDQUExQyxFQUE2QyxVQUFDSixHQUFELEVBQU1DLElBQU4sRUFBZTtBQUN4RCxvQkFBTW9FLFNBQVNqRixHQUFHaUQsT0FBSCxDQUFXckQsR0FBR3NGLDZCQUFkLENBQWY7QUFDQSxvQkFBTUMsU0FBU25GLEdBQUdpRCxPQUFILENBQVdyRCxHQUFHd0YsNkJBQWQsQ0FBZjs7QUFFQSxvQkFBSXhFLEdBQUosRUFBUztBQUNMZix3QkFBSXdGLEtBQUosQ0FBVXpFLEdBQVY7QUFDQTtBQUNIOztBQUVELG9CQUFJMEUsT0FBTyxDQUFYO0FBQ0F6RSxxQkFBS2lCLE9BQUwsQ0FBYSxVQUFDVSxHQUFELEVBQVM7QUFDbEIsd0JBQUkrQyxJQUFJLEtBQVI7QUFDQSx3QkFBSVIsT0FBT3ZDLElBQUlsQyxLQUFKLEdBQVlrQyxJQUFJK0IsS0FBaEIsR0FBd0IvQixJQUFJekIsQ0FBNUIsR0FBZ0N5QixJQUFJeEIsQ0FBM0MsTUFBa0RULFNBQXRELEVBQWlFO0FBQzdEd0UsK0JBQU92QyxJQUFJbEMsS0FBSixHQUFZa0MsSUFBSStCLEtBQWhCLEdBQXdCL0IsSUFBSXpCLENBQTVCLEdBQWdDeUIsSUFBSXhCLENBQTNDLElBQWdELDJCQUFpQndCLElBQUlnRCxJQUFyQixDQUFoRDtBQUNIO0FBQ0RELHdCQUFJUixPQUFPdkMsSUFBSWxDLEtBQUosR0FBWWtDLElBQUkrQixLQUFoQixHQUF3Qi9CLElBQUl6QixDQUE1QixHQUFnQ3lCLElBQUl4QixDQUEzQyxDQUFKOztBQUVBLHdCQUFJeUUsU0FBU2pELElBQUlpRCxNQUFKLENBQ1JaLEtBRFEsQ0FDRixHQURFLEVBRVJhLEdBRlEsQ0FFSixVQUFDaEMsRUFBRCxFQUFRO0FBQUUsK0JBQU9oQixPQUFPZ0IsRUFBUCxDQUFQO0FBQW9CLHFCQUYxQixDQUFiOztBQUlBLHlCQUFJLElBQUl2QyxJQUFJLENBQVosRUFBZUEsSUFBSXNFLE9BQU8zRSxNQUExQixFQUFrQ0ssR0FBbEMsRUFBc0M7QUFDbENvRSwwQkFBRUksU0FBRixDQUFZRixPQUFPdEUsQ0FBUCxDQUFaO0FBQ0g7QUFDRDhELDJCQUFPakQsR0FBUCxDQUFXUSxJQUFJbEMsS0FBZixFQUFzQmtDLElBQUkrQixLQUExQixFQUFpQy9CLElBQUl6QixDQUFyQyxFQUF3Q3lCLElBQUl4QixDQUE1QyxFQUErQ3VFLEVBQUVLLFdBQUYsRUFBL0MsRUFBZ0UsWUFBTTtBQUNsRVQsK0JBQU9uRCxHQUFQLENBQVd1RCxFQUFFSyxXQUFGLEVBQVgsRUFBNEJwRCxJQUFJbEMsS0FBaEMsRUFBdUNrQyxJQUFJK0IsS0FBM0MsRUFBa0QvQixJQUFJekIsQ0FBdEQsRUFBeUR5QixJQUFJeEIsQ0FBN0QsRUFBZ0UsWUFBTTtBQUNsRXNFO0FBQ0EsZ0NBQUdBLFFBQVF6RSxLQUFLQyxNQUFoQixFQUF1QjtBQUNuQix1Q0FBS2pCLEdBQUwsQ0FBU0EsR0FBVCxDQUFhLDhCQUFiO0FBQ0FvRix1Q0FBTzdCLFFBQVA7QUFDQStCLHVDQUFPL0IsUUFBUDtBQUNBcEQsbUNBQUdHLFNBQUgsQ0FBYSxZQUFNO0FBQ2ZILHVDQUFHZ0MsR0FBSCxDQUFPLDBEQUFQLEVBQW1FMUIsS0FBbkUsRUFBMEVrQyxJQUFJekIsQ0FBOUUsRUFBaUZ5QixJQUFJeEIsQ0FBckY7QUFDQWhCLHVDQUFHZ0MsR0FBSCxDQUFPcEMsR0FBR2lHLHFCQUFWLEVBQWlDdkYsS0FBakMsRUFBd0NBLEtBQXhDLEVBQStDa0MsSUFBSXpCLENBQW5ELEVBQXNEeUIsSUFBSXpCLENBQTFELEVBQTZEeUIsSUFBSXhCLENBQWpFLEVBQW9Fd0IsSUFBSXhCLENBQXhFLEVBQTJFLFlBQU07QUFDN0VZLDJDQUFHdEIsS0FBSDtBQUNBLCtDQUFLVCxHQUFMLENBQVNBLEdBQVQsQ0FBYSw0QkFBYjtBQUNILHFDQUhEO0FBSUgsaUNBTkQ7QUFPSDtBQUNKLHlCQWREO0FBZUgscUJBaEJEO0FBaUJILGlCQS9CRDtBQWdDSCxhQTFDRDtBQTJDSDs7O2tDQUVRO0FBQUE7O0FBQ0wsZ0JBQUlHLEtBQUssS0FBS0EsRUFBZDtBQUNBLGdCQUFJSCxNQUFNLEtBQUtBLEdBQWY7QUFDQUEsZ0JBQUlBLEdBQUosQ0FBUSxtQkFBUjtBQUNBRyxlQUFHVyxHQUFILENBQU8sNERBQVAsRUFBcUUsVUFBQ0MsR0FBRCxFQUFNQyxJQUFOLEVBQWU7QUFDaEZBLHFCQUFLaUIsT0FBTCxDQUFhLFVBQUNVLEdBQUQsRUFBTXJCLENBQU4sRUFBWTtBQUNyQix3QkFBTWIsUUFBUWtDLElBQUlsQyxLQUFsQjtBQUNBLHdCQUFNUyxJQUFJeUIsSUFBSXpCLENBQWQ7QUFDQSx3QkFBTUMsSUFBSXdCLElBQUl4QixDQUFkO0FBQ0Esd0JBQU00RCxPQUFPekQsTUFBT04sS0FBS0MsTUFBTCxHQUFhLENBQXBCLEdBQXlCLFlBQU07QUFDeENnRixnQ0FBUWpHLEdBQVIsQ0FBWSxjQUFaO0FBQ0EsK0JBQUtBLEdBQUwsQ0FBU2tHLEtBQVQ7QUFDQSwrQkFBSy9GLEVBQUwsQ0FBUStGLEtBQVI7QUFDSCxxQkFKWSxHQUlULFlBQU0sQ0FBRSxDQUpaO0FBS0EsMkJBQUtqQixZQUFMLENBQWtCeEUsS0FBbEIsRUFBeUJTLENBQXpCLEVBQTRCQyxDQUE1QixFQUErQjRELElBQS9CO0FBQ0gsaUJBVkQ7QUFXSCxhQVpEO0FBYUg7Ozs7OztBQXRiQ2hGLEUsQ0FFSytDLHFCLEdBQXdCLEM7QUFGN0IvQyxFLENBR0trRCx3QixHQUEyQiw2QjtBQUhoQ2xELEUsQ0FJS29HLDBCLEdBQTZCLDREO0FBSmxDcEcsRSxDQUtLc0Qsb0IsR0FBdUIsZ0U7QUFMNUJ0RCxFLENBTUt5RCxvQixHQUF1QiwrRDtBQU41QnpELEUsQ0FPSzJELG1CLEdBQXNCLHVEO0FBUDNCM0QsRSxDQVFLNkQsbUIsR0FBc0IsOEU7QUFSM0I3RCxFLENBU0tvRSx5QixHQUE0QiwyRDtBQVRqQ3BFLEUsQ0FVS3FHLHNCLEdBQXlCLDZCO0FBVjlCckcsRSxDQVdLb0Ysb0IsR0FBdUIsd0NBQzVCLGtDQUQ0QixHQUU1Qix5RUFGNEIsR0FHNUIseUNBSDRCLEdBSTVCLDRGQUo0QixHQUs1QixrRztBQWhCQXBGLEUsQ0FpQktzRiw2QixHQUFnQyxnRTtBQWpCckN0RixFLENBa0JLd0YsNkIsR0FBZ0MsOEVBQ3JDLG1CO0FBbkJBeEYsRSxDQW9CS2lHLHFCLEdBQXdCLDBCQUM3QixnR0FENkIsR0FFN0IsdUdBRjZCLEdBRzdCLHNHO0FBdkJBakcsRSxDQXdCS3NHLDRCLEdBQStCLCtEQUNwQyxtRkFEb0MsR0FFcEMsdUdBRm9DLEdBR3BDLHFFO0FBM0JBdEcsRSxDQTRCS3VHLGtCLEdBQXFCLG1FQUMxQix5RDtBQTdCQXZHLEUsQ0E4QktpRCx3QixHQUEyQix5RUFDaEMsaUI7QUEvQkFqRCxFLENBZ0NLd0csaUIsR0FBb0IsZ0Q7QUFoQ3pCeEcsRSxDQWlDS3dFLGlCLEdBQW9CLGdFO0FBakN6QnhFLEUsQ0FrQ0t5RSxvQixHQUF1Qiw4RDtBQWxDNUJ6RSxFLENBb0NLMEMsTyxHQUFVLENBQ2Isb0ZBRGEsRUFFYixrRkFGYTs7QUFJYjs7O0FBR0EseUVBUGEsRUFRYixtRUFSYSxFQVNiLDZFQVRhLEVBVWIsa0ZBVmE7O0FBWWI7Ozs7QUFJQSw2Q0FDQSxvREFEQSxHQUVBLGlHQUZBLEdBR0Esb0NBSEEsR0FJQSxpR0FwQmEsRUFxQmIsNERBckJhLEVBdUJiLHFGQUNFLDBCQURGLEdBRUUsa0ZBRkYsR0FHRSxrR0ExQlcsRUE0QmIsc0dBQ0UsZ0ZBN0JXLEVBOEJiLDJGQTlCYSxFQStCYiwwRUEvQmEsQztBQXBDZjFDLEUsQ0FzRUt5RyxLLEdBQVEsQ0FDWCxxQ0FEVyxFQUVYLGdDQUZXLEVBR1gsb0NBSFcsRUFJWCx3Q0FKVyxDO0FBdEViekcsRSxDQTZFS2lDLFUsR0FBYSxDQUNoQiwwREFEZ0IsRUFFaEIsa0NBQWtDakMsR0FBRytDLHFCQUFyQyxHQUE2RCx3Q0FGN0MsQztBQTdFbEIvQyxFLENBa0ZLc0MsVSxHQUFhLENBQ2hCLHlDQURnQixFQUVoQixxQ0FGZ0IsRUFHaEIscUNBSGdCLEVBSWhCLHlHQUNFLDJGQUxjLEVBTWhCLDJGQU5nQixFQU9oQixxSEFQZ0IsRUFRaEIsc0JBUmdCLEVBU2hCLDhDQVRnQixFQVVoQiw0REFWZ0IsRUFXaEIsa0NBQWtDdEMsR0FBRytDLHFCQUFyQyxHQUE2RCx3Q0FYN0MsQztBQWxGbEIvQyxFLENBZ0dLdUMsVSxHQUFhLENBQ2hCLHdEQURnQixFQUVoQixrQ0FBa0N2QyxHQUFHK0MscUJBQXJDLEdBQTZELHdDQUY3QyxDO0FBaEdsQi9DLEUsQ0FxR0t3QyxVLEdBQWEsQ0FDaEIsc0JBRGdCLEVBRWhCLHdGQUNFLGdGQUhjLEVBSWhCLGtDQUFrQ3hDLEdBQUcrQyxxQkFBckMsR0FBNkQsd0NBSjdDLEM7QUFyR2xCL0MsRSxDQTRHS3lDLFUsR0FBYSxDQUNoQiw4RUFEZ0IsRUFFaEIsa0NBQWtDekMsR0FBRytDLHFCQUFyQyxHQUE2RCx3Q0FGN0MsQzs7O0FBOFV4QjJELE9BQU9DLE9BQVAsR0FBaUIzRyxFQUFqQiIsImZpbGUiOiJEYi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBLYWxtYW5GaWx0ZXIgZnJvbSAnLi9LYWxtYW5GaWx0ZXInO1xuXG5sZXQgc3FsaXRlMyA9IHJlcXVpcmUoJ3NxbGl0ZTMnKS52ZXJib3NlKCk7XG5cbmNsYXNzIERiIHtcblxuICAgIHN0YXRpYyBkYXRhYmFzZV9jb2RlX3ZlcnNpb24gPSA1O1xuICAgIHN0YXRpYyBxdWVyeV9nZXRfYWxsX2Zsb29ycGxhbnMgPSBcInNlbGVjdCAqIGZyb20gbGF5b3V0X2ltYWdlc1wiO1xuICAgIHN0YXRpYyBxdWVyeV9nZXRfZGF0YWJhc2VfdmVyc2lvbiA9IFwic2VsZWN0IHZhbHVlIGZyb20gc2V0dGluZ3Mgd2hlcmUga2V5ID0gJ2RhdGFiYXNlX3ZlcnNpb24nO1wiO1xuICAgIHN0YXRpYyBxdWVyeV9pbnNlcnRfdmVyc2lvbiA9IFwiaW5zZXJ0IG9yIGlnbm9yZSBpbnRvIHNldHRpbmdzIHZhbHVlcyAoJ2RhdGFiYXNlX3ZlcnNpb24nLCA/KTtcIjtcbiAgICBzdGF0aWMgcXVlcnlfdXBkYXRlX3ZlcnNpb24gPSBcInVwZGF0ZSBzZXR0aW5ncyBzZXQgdmFsdWUgPSA/IHdoZXJlIGtleSA9ICdkYXRhYmFzZV92ZXJzaW9uJztcIjtcbiAgICBzdGF0aWMgcXVlcnlfaW5zZXJ0X2xheW91dCA9IFwiaW5zZXJ0IG9yIGlnbm9yZSBpbnRvIGxheW91dF9pbWFnZXMgdmFsdWVzICg/LCA/LCA/KTtcIjtcbiAgICBzdGF0aWMgcXVlcnlfdXBkYXRlX2xheW91dCA9IFwidXBkYXRlIGxheW91dF9pbWFnZXMgc2V0IGxheW91dF9pbWFnZSA9ID8sIGZsb29yX3BsYW5fbmFtZSA9ID8gd2hlcmUgaWQgPSA/O1wiO1xuICAgIHN0YXRpYyBxdWVyeV9pbnNlcnRfc2Nhbl9yZXN1bHRzID0gXCJpbnNlcnQgaW50byBzY2FuX3Jlc3VsdHMgdmFsdWVzICg/LCA/LCA/LCA/LCA/LCA/LCA/LCA/KTtcIjtcbiAgICBzdGF0aWMgcXVlcnlfZ2V0X3NjYW5fcmVzdWx0cyA9IFwic2VsZWN0ICogZnJvbSBzY2FuX3Jlc3VsdHM7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X2dldF9mb3Jfa2FsbWFuID0gXCJTRUxFQ1Qgcy5mcF9pZCwgcy5hcF9pZCwgcy54LCBzLnksIFwiXG4gICAgKyBcImdyb3VwX2NvbmNhdChzLnZhbHVlKSBgdmFsdWVzYCwgXCJcbiAgICArIFwiY2FzZSB3aGVuIGsua2FsbWFuIGlzIG51bGwgdGhlbiBhdmcocy52YWx1ZSkgZWxzZSBrLmthbG1hbiBlbmQgYGNlc3RgLCBcIlxuICAgICsgXCJrLmthbG1hbiBGUk9NIHNjYW5fcmVzdWx0cyBzIGxlZnQgam9pbiBcIlxuICAgICsgXCJrYWxtYW5fZXN0aW1hdGVzIGsgb24gcy5mcF9pZCA9IGsuZnBfaWQgYW5kIHMuYXBfaWQgPSBrLmFwX2lkIGFuZCBzLnggPSBrLnggYW5kIHMueSA9IGsueSBcIlxuICAgICsgXCIgd2hlcmUgcy5mcF9pZCA9ID8gYW5kIHMudmFsdWUgIT0gMCBhbmQgcy54ID0gPyBhbmQgcy55ID0gPyBHUk9VUCBCWSBzLmZwX2lkLCBzLmFwX2lkLCBzLngsIHMueTtcIjtcbiAgICBzdGF0aWMgcXVlcnlfaW5zZXJ0X2thbG1hbl9lc3RpbWF0ZXMgPSBcImluc2VydCBvciBpZ25vcmUgaW50byBrYWxtYW5fZXN0aW1hdGVzIHZhbHVlcyAoPywgPywgPywgPywgPyk7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X3VwZGF0ZV9rYWxtYW5fZXN0aW1hdGVzID0gXCJ1cGRhdGUga2FsbWFuX2VzdGltYXRlcyBzZXQga2FsbWFuID0gPyB3aGVyZSBmcF9pZCA9ID8gYW5kIGFwX2lkID0gPyBhbmQgXCJcbiAgICArIFwiIHggPSA/IGFuZCB5ID0gPztcIjtcbiAgICBzdGF0aWMgcXVlcnlfdXBkYXRlX2ZlYXR1cmVzID0gXCJpbnNlcnQgaW50byBmZWF0dXJlcyBcIlxuICAgICsgXCIgc2VsZWN0IGsuZnBfaWQsIGsueCwgay55LCBrLmFwX2lkIHx8IGsxLmFwX2lkIGFzIGZlYXR1cmUsIGFicyhrLmthbG1hbiAtIGsxLmthbG1hbikgYXMgdmFsdWUgXCJcbiAgICArIFwiIGZyb20ga2FsbWFuX2VzdGltYXRlcyBrIGpvaW4ga2FsbWFuX2VzdGltYXRlcyBrMSBvbiBrLmZwX2lkID0gazEuZnBfaWQgYW5kIGsueCA9IGsxLnggYW5kIGsueSA9IGsxLnlcIlxuICAgICsgXCIgd2hlcmUgdmFsdWUgIT0gMCBhbmQgay5mcF9pZCA9ID8gYW5kIGsxLmZwX2lkID0gPyBhbmQgay54ID0gPyBhbmQgazEueCA9ID8gYW5kIGsueSA9ID8gYW5kIGsxLnkgPSA/XCI7XG4gICAgc3RhdGljIHF1ZXJ5X3VwZGF0ZV9vbGRlc3RfZmVhdHVyZXMgPSBcInNlbGVjdCBrLmZwX2lkLCBrLngsIGsueSwgay5hcF9pZCB8fCBrMS5hcF9pZCBhcyBmZWF0dXJlLCBcIlxuICAgICsgXCIgYWJzKGsua2FsbWFuIC0gazEua2FsbWFuKSBhcyB2YWx1ZSwgOnNjYW5faWQ6IHNfaWQgZnJvbSBrYWxtYW5fZXN0aW1hdGVzIGsgam9pbiBcIlxuICAgICsgXCIga2FsbWFuX2VzdGltYXRlcyBrMSBvbiBrLmZwX2lkID0gazEuZnBfaWQgYW5kIGsueCA9IGsxLnggYW5kIGsueSA9IGsxLnkgYW5kIGsuYXBfaWQgPCBrMS5hcF9pZCB3aGVyZVwiXG4gICAgKyBcIiBrLmthbG1hbiAhPSAwIGFuZCBrMS5rYWxtYW4gIT0gMCBhbmQgay5mcF9pZCA9ID8gYW5kIGsxLmZwX2lkID0gPztcIjtcbiAgICBzdGF0aWMgcXVlcnlfZ2V0X2ZlYXR1cmVzID0gXCJzZWxlY3QgZi4qLCBhYnModmFsdWUgLSA6ZmVhdHVyZV92YWx1ZTopIGRpZmYgZnJvbSBmZWF0dXJlcyBmIFwiXG4gICAgKyBcIiB3aGVyZSBmLmZlYXR1cmUgPSA/IGFuZCBmLmZwX2lkID0gPyBvcmRlciBieSBkaWZmIGFzYztcIjtcbiAgICBzdGF0aWMgcXVlcnlfZ2V0X3NjYW5uZWRfY29vcmRzID0gXCJzZWxlY3QgY291bnQoKikgYXMgbnVtX2ZlYXR1cmVzLCB4LCB5IGZyb20gZmVhdHVyZXMgd2hlcmUgZnBfaWQgPSA/IFwiXG4gICAgKyBcIiBncm91cCBieSB4LCB5O1wiO1xuICAgIHN0YXRpYyBxdWVyeV9nZXRfbWluX3NpZCA9IFwic2VsZWN0IG1pbihzX2lkKSBmcm9tIGZlYXR1cmVzIHdoZXJlIGZwX2lkID0gP1wiO1xuICAgIHN0YXRpYyBxdWVyeV9nZXRfc2Nhbl9pZCA9IFwic2VsZWN0IHZhbHVlICsgMSBhcyB2YWx1ZSBmcm9tIHNldHRpbmdzIHdoZXJlIGtleSA9ICdzY2FuX2lkJztcIjtcbiAgICBzdGF0aWMgcXVlcnlfdXBkYXRlX3NjYW5faWQgPSBcInVwZGF0ZSBzZXR0aW5ncyBzZXQgdmFsdWUgPSB2YWx1ZSArIDEgd2hlcmUga2V5ID0gJ3NjYW5faWQnO1wiO1xuXG4gICAgc3RhdGljIGNyZWF0ZXMgPSBbXG4gICAgICAgIFwiQ1JFQVRFIFRBQkxFIGlmIG5vdCBleGlzdHMgbGF5b3V0X2ltYWdlcyAoaWQgVEVYVCBQUklNQVJZIEtFWSwgbGF5b3V0X2ltYWdlIFRFWFQpO1wiLFxuICAgICAgICBcIkNSRUFURSBVTklRVUUgSU5ERVggaWYgbm90IGV4aXN0cyBsYXlvdXRfaW1hZ2VzX2lkX3VpbmRleCBPTiBsYXlvdXRfaW1hZ2VzIChpZCk7XCIsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENyZWF0ZSB0aGUgc2V0dGluZ3MgdGFibGUgd2l0aCBkZWZhdWx0IHNldHRpbmdzXG4gICAgICAgICAqL1xuICAgICAgICBcImNyZWF0ZSB0YWJsZSBpZiBub3QgZXhpc3RzIHNldHRpbmdzIChrZXkgVEVYVCBQUklNQVJZIEtFWSwgdmFsdWUgVEVYVCk7XCIsXG4gICAgICAgIFwiY3JlYXRlIHVuaXF1ZSBpbmRleCBpZiBub3QgZXhpc3RzIHNldHRpbmdzX2tleSBvbiBzZXR0aW5ncyAoa2V5KTtcIixcbiAgICAgICAgXCJpbnNlcnQgb3IgaWdub3JlIGludG8gc2V0dGluZ3MgKGtleSwgdmFsdWUpIHZhbHVlcyAoJ2RhdGFiYXNlX3ZlcnNpb24nLCAwKTtcIixcbiAgICAgICAgXCJpbnNlcnQgb3IgaWdub3JlIGludG8gc2V0dGluZ3MgKGtleSwgdmFsdWUpIHZhbHVlcyAoJ2RhdGFiYXNlX2NvZGVfdmVyc2lvbicsIDApO1wiLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBhcF9pZCA9IGFjY2VzcyBwb2ludCBpZFxuICAgICAgICAgKiBmcF9pZCA9IGZsb29ycGxhbiBpZFxuICAgICAgICAgKi9cbiAgICAgICAgXCJDUkVBVEUgVEFCTEUgaWYgbm90IGV4aXN0cyBzY2FuX3Jlc3VsdHMgXCIgK1xuICAgICAgICBcIihzX2lkIElOVEVHRVIsIGZwX2lkIFRFWFQsIGFwX2lkIFRFWFQsIHggSU5URUdFUiwgXCIgK1xuICAgICAgICBcInkgSU5URUdFUiwgdmFsdWUgUkVBTCwgb3JpZ192YWx1ZXMgVEVYVCwgY3JlYXRlZCBUSU1FU1RBTVAgREVGQVVMVCBDVVJSRU5UX1RJTUVTVEFNUCBOT1QgTlVMTCwgXCIgK1xuICAgICAgICBcIlBSSU1BUlkgS0VZIChzX2lkLCBmcF9pZCwgYXBfaWQpLCBcIiArXG4gICAgICAgIFwiQ09OU1RSQUlOVCBzY2FuX3Jlc3VsdHNfbGF5b3V0X2ltYWdlc19pZF9mayBGT1JFSUdOIEtFWSAoZnBfaWQpIFJFRkVSRU5DRVMgbGF5b3V0X2ltYWdlcyAoaWQpKTtcIixcbiAgICAgICAgXCJjcmVhdGUgaW5kZXggaWYgbm90IGV4aXN0cyB4X2FuZF95IG9uIHNjYW5fcmVzdWx0cyAoeCwgeSk7XCIsXG5cbiAgICAgICAgXCJDUkVBVEUgVEFCTEUgaWYgbm90IGV4aXN0cyBrYWxtYW5fZXN0aW1hdGVzIChmcF9pZCBURVhULCBhcF9pZCBURVhULCB4IElOVEVHRVIsIFwiXG4gICAgICAgICsgXCJ5IElOVEVHRVIsIGthbG1hbiBSRUFMLCBcIlxuICAgICAgICArIFwiQ09OU1RSQUlOVCBrYWxtYW5fZXN0aW1hdGVzX2ZwX2lkX2FwX2lkX3hfeV9wayBQUklNQVJZIEtFWSAoZnBfaWQsIGFwX2lkLCB4LCB5KSxcIlxuICAgICAgICArIFwiRk9SRUlHTiBLRVkgKGFwX2lkLCBmcF9pZCwgeCwgeSkgUkVGRVJFTkNFUyBzY2FuX3Jlc3VsdHMgKGFwX2lkLCBmcF9pZCwgeCwgeSkgT04gREVMRVRFIENBU0NBREUpXCIsXG5cbiAgICAgICAgXCJDUkVBVEUgVEFCTEUgaWYgbm90IGV4aXN0cyBmZWF0dXJlcyAoZnBfaWQgVEVYVCwgeCBJTlRFR0VSLCB5IElOVEVHRVIsIGZlYXR1cmUgVEVYVCwgdmFsdWUgUkVBTCwgXCJcbiAgICAgICAgKyBcIiBDT05TVFJBSU5UIGZlYXR1cmVzX2ZwX2lkX3hfeV9mZWF0dXJlX3BrIFBSSU1BUlkgS0VZIChmcF9pZCwgeCwgeSwgZmVhdHVyZSkpO1wiLFxuICAgICAgICBcIkNSRUFURSBVTklRVUUgSU5ERVggaWYgbm90IGV4aXN0cyBmZWF0dXJlc19mZWF0dXJlX2luZGV4MSBPTiBmZWF0dXJlcyhmcF9pZCxmZWF0dXJlLHgseSk7XCIsXG4gICAgICAgIFwiQ1JFQVRFIElOREVYIGlmIG5vdCBleGlzdHMgZmVhdHVyZXNfZmVhdHVyZV9pbmRleDIgT04gZmVhdHVyZXMoZmVhdHVyZSk7XCJcbiAgICBdO1xuXG4gICAgc3RhdGljIGRyb3BzID0gW1xuICAgICAgICBcImRyb3AgdGFibGUgaWYgZXhpc3RzIGxheW91dF9pbWFnZXM7XCIsXG4gICAgICAgIFwiZHJvcCB0YWJsZSBpZiBleGlzdHMgc2V0dGluZ3M7XCIsXG4gICAgICAgIFwiZHJvcCB0YWJsZSBpZiBleGlzdHMgc2Nhbl9yZXN1bHRzO1wiLFxuICAgICAgICBcImRyb3AgdGFibGUgaWYgZXhpc3RzIGthbG1hbl9lc3RpbWF0ZXM7XCJcbiAgICBdO1xuXG4gICAgc3RhdGljIG1pZ3JhdGlvbjEgPSBbXG4gICAgICAgIFwiQUxURVIgVEFCTEUgbGF5b3V0X2ltYWdlcyBBREQgZmxvb3JfcGxhbl9uYW1lIFRFWFQgTlVMTDtcIixcbiAgICAgICAgXCJ1cGRhdGUgc2V0dGluZ3Mgc2V0IHZhbHVlID0gJ1wiICsgRGIuZGF0YWJhc2VfY29kZV92ZXJzaW9uICsgXCInIHdoZXJlIGtleSA9ICdkYXRhYmFzZV9jb2RlX3ZlcnNpb24nO1wiXG4gICAgXTtcblxuICAgIHN0YXRpYyBtaWdyYXRpb24yID0gW1xuICAgICAgICBcIkFMVEVSIFRBQkxFIGZlYXR1cmVzIEFERCBzX2lkIElOVCBOVUxMO1wiLFxuICAgICAgICBcIkRST1AgSU5ERVggZmVhdHVyZXNfZmVhdHVyZV9pbmRleDE7XCIsXG4gICAgICAgIFwiRFJPUCBJTkRFWCBmZWF0dXJlc19mZWF0dXJlX2luZGV4MjtcIixcbiAgICAgICAgXCJDUkVBVEUgVEFCTEUgZmVhdHVyZXNhOGQxIChmcF9pZCBURVhULCB4IElOVEVHRVIsIHkgSU5URUdFUiwgZmVhdHVyZSBURVhULCB2YWx1ZSBSRUFMLCBzX2lkIElOVEVHRVIsXCJcbiAgICAgICAgKyBcIiBDT05TVFJBSU5UIGZlYXR1cmVzX2ZwX2lkX3hfeV9mZWF0dXJlX3NfaWRfcGsgUFJJTUFSWSBLRVkgKGZwX2lkLCB4LCB5LCBmZWF0dXJlLCBzX2lkKSk7XCIsXG4gICAgICAgIFwiQ1JFQVRFIFVOSVFVRSBJTkRFWCBmZWF0dXJlc19mZWF0dXJlX2luZGV4MSBPTiBmZWF0dXJlc2E4ZDEgKGZwX2lkLCBmZWF0dXJlLCB4LCB5LCBzX2lkKTtcIixcbiAgICAgICAgXCJJTlNFUlQgSU5UTyBmZWF0dXJlc2E4ZDEoZnBfaWQsIHgsIHksIGZlYXR1cmUsIHZhbHVlLCBzX2lkKSBTRUxFQ1QgZnBfaWQsIHgsIHksIGZlYXR1cmUsIHZhbHVlLCBzX2lkIEZST00gZmVhdHVyZXM7XCIsXG4gICAgICAgIFwiRFJPUCBUQUJMRSBmZWF0dXJlcztcIixcbiAgICAgICAgXCJBTFRFUiBUQUJMRSBmZWF0dXJlc2E4ZDEgUkVOQU1FIFRPIGZlYXR1cmVzO1wiLFxuICAgICAgICBcIkNSRUFURSBJTkRFWCBmZWF0dXJlc19mZWF0dXJlX2luZGV4MiBPTiBmZWF0dXJlcyhmZWF0dXJlKTtcIixcbiAgICAgICAgXCJ1cGRhdGUgc2V0dGluZ3Mgc2V0IHZhbHVlID0gJ1wiICsgRGIuZGF0YWJhc2VfY29kZV92ZXJzaW9uICsgXCInIHdoZXJlIGtleSA9ICdkYXRhYmFzZV9jb2RlX3ZlcnNpb24nO1wiXG4gICAgXTtcblxuICAgIHN0YXRpYyBtaWdyYXRpb24zID0gW1xuICAgICAgICBcImluc2VydCBvciBpZ25vcmUgaW50byBzZXR0aW5ncyB2YWx1ZXMgKCdzY2FuX2lkJywgNjQpO1wiLFxuICAgICAgICBcInVwZGF0ZSBzZXR0aW5ncyBzZXQgdmFsdWUgPSAnXCIgKyBEYi5kYXRhYmFzZV9jb2RlX3ZlcnNpb24gKyBcIicgd2hlcmUga2V5ID0gJ2RhdGFiYXNlX2NvZGVfdmVyc2lvbic7XCJcbiAgICBdO1xuXG4gICAgc3RhdGljIG1pZ3JhdGlvbjQgPSBbXG4gICAgICAgIFwiZHJvcCB0YWJsZSBmZWF0dXJlcztcIixcbiAgICAgICAgXCJDUkVBVEUgVEFCTEUgZmVhdHVyZXMgKGZwX2lkIFRFWFQsIHggSU5URUdFUiwgeSBJTlRFR0VSLCBmZWF0dXJlIFRFWFQsIHZhbHVlIFJFQUwsIFwiXG4gICAgICAgICsgXCIgQ09OU1RSQUlOVCBmZWF0dXJlc19mcF9pZF94X3lfZmVhdHVyZV9wayBQUklNQVJZIEtFWSAoZnBfaWQsIHgsIHksIGZlYXR1cmUpKTtcIixcbiAgICAgICAgXCJ1cGRhdGUgc2V0dGluZ3Mgc2V0IHZhbHVlID0gJ1wiICsgRGIuZGF0YWJhc2VfY29kZV92ZXJzaW9uICsgXCInIHdoZXJlIGtleSA9ICdkYXRhYmFzZV9jb2RlX3ZlcnNpb24nO1wiXG4gICAgXTtcblxuICAgIHN0YXRpYyBtaWdyYXRpb241ID0gW1xuICAgICAgICBcIkNSRUFURSBJTkRFWCBpZiBub3QgZXhpc3RzIHNjYW5fcmVzdWx0c19mcF9pZF9pbmRleCBPTiBzY2FuX3Jlc3VsdHMgKGZwX2lkKTtcIixcbiAgICAgICAgXCJ1cGRhdGUgc2V0dGluZ3Mgc2V0IHZhbHVlID0gJ1wiICsgRGIuZGF0YWJhc2VfY29kZV92ZXJzaW9uICsgXCInIHdoZXJlIGtleSA9ICdkYXRhYmFzZV9jb2RlX3ZlcnNpb24nO1wiXG4gICAgXTtcblxuICAgIGNvbnN0cnVjdG9yKGxvZywgZGF0YWJhc2UgPSBcImRiLnNxbGl0ZTNcIil7XG4gICAgICAgIHRoaXMubG9nID0gbG9nO1xuICAgICAgICB0aGlzLmxvZy5kZWJ1ZyhcIkRiLmNvbnN0cnVjdG9yXCIpO1xuXG4gICAgICAgIHRoaXMuZGIgPSBuZXcgc3FsaXRlMy5jYWNoZWQuRGF0YWJhc2UoYGRiLyR7ZGF0YWJhc2V9YCk7XG4gICAgICAgIHRoaXMuZGIuc2VyaWFsaXplKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZGIuZXhlYyhcIlBSQUdNQSBqb3VybmFsX21vZGUgPSBXQUw7XCIpO1xuICAgICAgICAgICAgdGhpcy5kYi5leGVjKFwiUFJBR01BIGNhY2hlX3NpemUgPSA0MDk2MDAwO1wiKTtcbiAgICAgICAgICAgIHRoaXMuZGIuZXhlYyhcIlBSQUdNQSBvcHRpbWl6ZTtcIik7XG4gICAgICAgICAgICB0aGlzLmRiLmV4ZWMoXCJQUkFHTUEgYnVzeV90aW1lb3V0ID0gMTUwMDAwO1wiKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZmVhdHVyZXNDYWNoZSA9IHt9O1xuICAgIH1cblxuICAgIGNsZWFyRmVhdHVyZXNDYWNoZShmcF9pZCl7XG4gICAgICAgIHRoaXMuZmVhdHVyZXNDYWNoZVtmcF9pZF0gPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZnBfaWRcbiAgICAgKi9cbiAgICBjcmVhdGVGZWF0dXJlc0NhY2hlKGZwX2lkKXtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGlmKHRoaXMuZmVhdHVyZXNDYWNoZVtmcF9pZF0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmRiLmFsbChcInNlbGVjdCAqIGZyb20gZmVhdHVyZXMgd2hlcmUgZnBfaWQgPSA/O1wiLCBmcF9pZCwgKGVyciwgcm93cykgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgbGVuZ3RoID0gcm93cy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgbGV0IGZwX2lkLCB4LCB5LCBmZWF0dXJlLCB2YWx1ZTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGZwX2lkID0gcm93c1tpXS5mcF9pZDtcbiAgICAgICAgICAgICAgICAgICAgeCA9IHJvd3NbaV0ueDtcbiAgICAgICAgICAgICAgICAgICAgeSA9IHJvd3NbaV0ueTtcbiAgICAgICAgICAgICAgICAgICAgZmVhdHVyZSA9IHJvd3NbaV0uZmVhdHVyZTtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSByb3dzW2ldLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5mZWF0dXJlc0NhY2hlW2ZwX2lkXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZlYXR1cmVzQ2FjaGVbZnBfaWRdID0ge307XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvb3JkID0geCArIFwiX1wiICsgeTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZmVhdHVyZXNDYWNoZVtmcF9pZF1bY29vcmRdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZmVhdHVyZXNDYWNoZVtmcF9pZF1bY29vcmRdID0ge307XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmZlYXR1cmVzQ2FjaGVbZnBfaWRdW2Nvb3JkXVtmZWF0dXJlXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmxvZy5sb2coXCJGZWF0dXJlcyBDYWNoZSBjcmVhdGVkOiBcIiArIEpTT04uc3RyaW5naWZ5KE9iamVjdC5rZXlzKHRoaXMuZmVhdHVyZXNDYWNoZSkpKTtcbiAgICAgICAgICAgICAgICBpZiAocmVzb2x2ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldEZlYXR1cmVzQ2FjaGUoZnBfaWQpe1xuICAgICAgICBpZih0aGlzLmZlYXR1cmVzQ2FjaGVbZnBfaWRdID09PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZlYXR1cmVzQ2FjaGVbZnBfaWRdO1xuICAgIH1cblxuICAgIGdldEZlYXR1cmVWYWx1ZShmcF9pZCwgY29vcmQsIGZlYXR1cmUpe1xuICAgICAgICBpZih0aGlzLmZlYXR1cmVzQ2FjaGVbZnBfaWRdID09PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmKHRoaXMuZmVhdHVyZXNDYWNoZVtmcF9pZF1bY29vcmRdID09PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmKHRoaXMuZmVhdHVyZXNDYWNoZVtmcF9pZF1bY29vcmRdW2ZlYXR1cmVdID09PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZlYXR1cmVzQ2FjaGVbZnBfaWRdW2Nvb3JkXVtmZWF0dXJlXTtcbiAgICB9XG5cbiAgICBnZXRGZWF0dXJlTnVtYmVyKGZwX2lkLCBjb29yZCkge1xuICAgICAgICBsZXQgZnAsIGM7XG4gICAgICAgIGlmKHRoaXMuZmVhdHVyZXNDYWNoZVtmcF9pZF0gPT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgfVxuICAgICAgICBmcCA9IHRoaXMuZmVhdHVyZXNDYWNoZVtmcF9pZF07XG4gICAgICAgIGlmKGZwW2Nvb3JkXSA9PT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9XG4gICAgICAgIGMgPSBmcFtjb29yZF07XG4gICAgICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhjKTtcbiAgICAgICAgcmV0dXJuIGtleXMubGVuZ3RoO1xuICAgIH1cblxuICAgIGdldERhdGFiYXNlKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmRiO1xuICAgIH1cblxuICAgIGRvVXBncmFkZShkYiwgZGF0YWJhc2VDb2RlVmVyc2lvbiwgY2IpIHtcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoXCJEYi5kb1VwZ3JhZGVcIik7XG5cbiAgICAgICAgc3dpdGNoKGRhdGFiYXNlQ29kZVZlcnNpb24pe1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgIGRiLnNlcmlhbGl6ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIERiLm1pZ3JhdGlvbjEuZm9yRWFjaCgobWlnKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYi5ydW4obWlnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlVGFibGVzKGRiLCBjYik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICBkYi5zZXJpYWxpemUoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBEYi5taWdyYXRpb24yLmZvckVhY2goKG1pZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGIucnVuKG1pZyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVRhYmxlcyhkYiwgY2IpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgZGIuc2VyaWFsaXplKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgRGIubWlncmF0aW9uMy5mb3JFYWNoKChtaWcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRiLnJ1bihtaWcpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVUYWJsZXMoZGIsIGNiKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgIGRiLnNlcmlhbGl6ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIERiLm1pZ3JhdGlvbjQuZm9yRWFjaCgobWlnKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYi5ydW4obWlnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlVGFibGVzKGRiLCBjYik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICBkYi5zZXJpYWxpemUoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBEYi5taWdyYXRpb241LmZvckVhY2goKG1pZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGIucnVuKG1pZyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVRhYmxlcyhkYiwgY2IpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY3JlYXRlVGFibGVzKGRiLCBjYikge1xuICAgICAgICB0aGlzLmxvZy5kZWJ1ZyhcIkRiLmNyZWF0ZVRhYmxlc1wiKTtcbiAgICAgICAgbGV0IGNyZWF0ZXMgPSBEYi5jcmVhdGVzO1xuXG4gICAgICAgIGRiLnNlcmlhbGl6ZSgoKSA9PiB7XG4gICAgICAgICAgICBjcmVhdGVzLmZvckVhY2goZnVuY3Rpb24oY3JlYXRlKXtcbiAgICAgICAgICAgICAgICBkYi5ydW4oY3JlYXRlKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBsZXQgZGF0YWJhc2VDb2RlVmVyc2lvbiA9IDA7XG5cbiAgICAgICAgICAgIGRiLmFsbChcInNlbGVjdCAqIGZyb20gc2V0dGluZ3NcIiwgKGVyciwgcm93cykgPT4ge1xuICAgICAgICAgICAgICAgIHJvd3MuZm9yRWFjaChmdW5jdGlvbihyb3cpe1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2gocm93LmtleSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiZGF0YWJhc2VfY29kZV92ZXJzaW9uXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YWJhc2VDb2RlVmVyc2lvbiA9IE51bWJlcihyb3cudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYoZGF0YWJhc2VDb2RlVmVyc2lvbiA8IERiLmRhdGFiYXNlX2NvZGVfdmVyc2lvbil7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZG9VcGdyYWRlKGRiLCBkYXRhYmFzZUNvZGVWZXJzaW9uLCBjYik7XG4gICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgIGlmKGNiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYigpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldFNjYW5uZWRDb29yZHMoZnBfaWQsIGNiKXtcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoXCJEYi5nZXRTY2FubmVkQ29vcmRzXCIpO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBkYi5hbGwoRGIucXVlcnlfZ2V0X3NjYW5uZWRfY29vcmRzLCBmcF9pZCwgY2IpO1xuICAgIH1cblxuICAgIGdldEZsb29yUGxhbnMoY2IpIHtcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoXCJEYi5nZXRGbG9vclBsYW5zXCIpO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBkYi5hbGwoRGIucXVlcnlfZ2V0X2FsbF9mbG9vcnBsYW5zLCBjYik7XG4gICAgfVxuXG4gICAgdXBkYXRlRGF0YWJhc2UoZGF0YSwgY2IpIHtcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoXCJEYi51cGRhdGVEYXRhYmFzZVwiKTtcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgbGV0IHN0bXQgPSBkYi5wcmVwYXJlKERiLnF1ZXJ5X2luc2VydF92ZXJzaW9uKTtcbiAgICAgICAgc3RtdC5ydW4oZGF0YS5kYXRhYmFzZVZlcnNpb24pO1xuICAgICAgICBzdG10LmZpbmFsaXplKCk7XG5cbiAgICAgICAgc3RtdCA9IGRiLnByZXBhcmUoRGIucXVlcnlfdXBkYXRlX3ZlcnNpb24pO1xuICAgICAgICBzdG10LnJ1bihkYXRhLmRhdGFiYXNlVmVyc2lvbik7XG4gICAgICAgIHN0bXQuZmluYWxpemUoKTtcblxuICAgICAgICBpZih0eXBlb2YoZGF0YS5sYXlvdXRfaW1hZ2VzKSAhPSBcInVuZGVmaW5lZFwiICYmIGRhdGEubGF5b3V0X2ltYWdlcy5sZW5ndGggPiAwKXtcbiAgICAgICAgICAgIHN0bXQgPSBkYi5wcmVwYXJlKERiLnF1ZXJ5X2luc2VydF9sYXlvdXQpO1xuICAgICAgICAgICAgbGV0IHVwc3RtdCA9IGRiLnByZXBhcmUoRGIucXVlcnlfdXBkYXRlX2xheW91dCk7XG5cbiAgICAgICAgICAgIGRhdGEubGF5b3V0X2ltYWdlcy5mb3JFYWNoKGZ1bmN0aW9uKGVsKXtcbiAgICAgICAgICAgICAgICBsZXQgaWQgPSBlbC5pZDtcbiAgICAgICAgICAgICAgICBsZXQgZmxvb3JfcGxhbl9uYW1lID0gZWwuZmxvb3JwbGFubmFtZTtcbiAgICAgICAgICAgICAgICBsZXQgc3RyaW5nZGF0YSA9IEpTT04uc3RyaW5naWZ5KGVsKTtcbiAgICAgICAgICAgICAgICBzdG10LnJ1bihpZCwgc3RyaW5nZGF0YSwgZmxvb3JfcGxhbl9uYW1lKTtcbiAgICAgICAgICAgICAgICB1cHN0bXQucnVuKHN0cmluZ2RhdGEsIGZsb29yX3BsYW5fbmFtZSwgaWQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzdG10LmZpbmFsaXplKCk7XG4gICAgICAgICAgICB1cHN0bXQuZmluYWxpemUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNiKCk7XG4gICAgfVxuXG4gICAgc2F2ZVJlYWRpbmdzKHBheWxvYWQsIGNiKXtcbiAgICAgICAgbGV0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBsb2cuZGVidWcoXCJEYi5zYXZlUmVhZGluZ3NcIik7XG5cbiAgICAgICAgbGV0IHN0bXQgPSBkYi5wcmVwYXJlKERiLnF1ZXJ5X2luc2VydF9zY2FuX3Jlc3VsdHMpO1xuICAgICAgICBsZXQgZmluaXNoZWQgPSAwO1xuICAgICAgICBsZXQgeHkgPSBbXTtcbiAgICAgICAgcGF5bG9hZC5mb3JFYWNoKChlbCkgPT4ge1xuICAgICAgICAgICAgZGIuZ2V0KERiLnF1ZXJ5X2dldF9zY2FuX2lkLCAoZXJyLCByb3cpID0+IHtcbiAgICAgICAgICAgICAgICBkYi5ydW4oRGIucXVlcnlfdXBkYXRlX3NjYW5faWQsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc19pZCA9IE51bWJlcihyb3cudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmcF9pZCA9IGVsLmZwX2lkO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBhcF9pZCA9IGVsLmFwX2lkO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB4ID0gTnVtYmVyKGVsLngpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB5ID0gTnVtYmVyKGVsLnkpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSB4ICsgXCJfXCIgKyB5O1xuICAgICAgICAgICAgICAgICAgICBpZih4eS5pbmRleE9mKGtleSkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4eS5wdXNoKGtleSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBOdW1iZXIoZWwudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBvcmlnX3ZhbHVlcyA9IGVsLm9yaWdfdmFsdWVzO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjcmVhdGVkID0gZWwuY3JlYXRlZDtcbiAgICAgICAgICAgICAgICAgICAgc3RtdC5ydW4oc19pZCwgZnBfaWQsIGFwX2lkLCB4LCB5LCB2YWx1ZSwgb3JpZ192YWx1ZXMsIGNyZWF0ZWQsIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbmlzaGVkKys7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmluaXNoZWQgPj0gcGF5bG9hZC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdG10LmZpbmFsaXplKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeHkuZm9yRWFjaCgoY29vcmQsIGkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2FsbCA9IGkgPT09ICh4eS5sZW5ndGggLTEpID8gY2IgOiAoKSA9PiB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgW3gsIHldID0gY29vcmQuc3BsaXQoXCJfXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUthbG1hbihmcF9pZCwgTnVtYmVyKHgpLCBOdW1iZXIoeSksIGNhbGwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB1cGRhdGVLYWxtYW4oZnBfaWQsIHgsIHksIGNiKXtcbiAgICAgICAgbGV0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBsZXQga2FsbWFuID0ge307XG5cbiAgICAgICAgZGIuYWxsKERiLnF1ZXJ5X2dldF9mb3Jfa2FsbWFuLCBmcF9pZCwgeCwgeSwgKGVyciwgcm93cykgPT4ge1xuICAgICAgICAgICAgY29uc3QgaW5zZXJ0ID0gZGIucHJlcGFyZShEYi5xdWVyeV9pbnNlcnRfa2FsbWFuX2VzdGltYXRlcyk7XG4gICAgICAgICAgICBjb25zdCB1cGRhdGUgPSBkYi5wcmVwYXJlKERiLnF1ZXJ5X3VwZGF0ZV9rYWxtYW5fZXN0aW1hdGVzKTtcblxuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGxvZy5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IGRvbmUgPSAwO1xuICAgICAgICAgICAgcm93cy5mb3JFYWNoKChyb3cpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgayA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmIChrYWxtYW5bcm93LmZwX2lkICsgcm93LmFwX2lkICsgcm93LnggKyByb3cueV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBrYWxtYW5bcm93LmZwX2lkICsgcm93LmFwX2lkICsgcm93LnggKyByb3cueV0gPSBuZXcgS2FsbWFuRmlsdGVyKHJvdy5jZXN0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgayA9IGthbG1hbltyb3cuZnBfaWQgKyByb3cuYXBfaWQgKyByb3cueCArIHJvdy55XTtcblxuICAgICAgICAgICAgICAgIGxldCB2YWx1ZXMgPSByb3cudmFsdWVzXG4gICAgICAgICAgICAgICAgICAgIC5zcGxpdChcIixcIilcbiAgICAgICAgICAgICAgICAgICAgLm1hcCgoZWwpID0+IHsgcmV0dXJuIE51bWJlcihlbCk7IH0pO1xuXG4gICAgICAgICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHZhbHVlcy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICAgICAgICAgIGsuYWRkU2FtcGxlKHZhbHVlc1tpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGluc2VydC5ydW4ocm93LmZwX2lkLCByb3cuYXBfaWQsIHJvdy54LCByb3cueSwgay5nZXRFc3RpbWF0ZSgpLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZS5ydW4oay5nZXRFc3RpbWF0ZSgpLCByb3cuZnBfaWQsIHJvdy5hcF9pZCwgcm93LngsIHJvdy55LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb25lKys7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihkb25lID49IHJvd3MubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZy5sb2coXCJGaW5pc2hlZCBpbnNlcnRzIGFuZCB1cGRhdGVzXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc2VydC5maW5hbGl6ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZS5maW5hbGl6ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRiLnNlcmlhbGl6ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRiLnJ1bihcImRlbGV0ZSBmcm9tIGZlYXR1cmVzIHdoZXJlIGZwX2lkID0gPyBhbmQgeCA9ID8gYW5kIHkgPSA/XCIsIGZwX2lkLCByb3cueCwgcm93LnkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYi5ydW4oRGIucXVlcnlfdXBkYXRlX2ZlYXR1cmVzLCBmcF9pZCwgZnBfaWQsIHJvdy54LCByb3cueCwgcm93LnksIHJvdy55LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYihmcF9pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZy5sb2coXCJGaW5pc2hlZCB1cGRhdGluZyBmZWF0dXJlc1wiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlaW5kZXgoKXtcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgbGV0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBsb2cubG9nKFwiU3RhcnRpbmcgSW5kZXhpbmdcIik7XG4gICAgICAgIGRiLmFsbChcInNlbGVjdCBmcF9pZCwgeCwgeSBmcm9tIHNjYW5fcmVzdWx0cyBHUk9VUCBCWSBmcF9pZCwgeCwgeTtcIiwgKGVyciwgcm93cykgPT4ge1xuICAgICAgICAgICAgcm93cy5mb3JFYWNoKChyb3csIGkpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBmcF9pZCA9IHJvdy5mcF9pZDtcbiAgICAgICAgICAgICAgICBjb25zdCB4ID0gcm93Lng7XG4gICAgICAgICAgICAgICAgY29uc3QgeSA9IHJvdy55O1xuICAgICAgICAgICAgICAgIGNvbnN0IGNhbGwgPSBpID09PSAocm93cy5sZW5ndGggLTEpID8gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInNob3VsZCBjbG9zZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2cuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYi5jbG9zZSgpO1xuICAgICAgICAgICAgICAgIH0gOiAoKSA9PiB7fTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUthbG1hbihmcF9pZCwgeCwgeSwgY2FsbCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5cbm1vZHVsZS5leHBvcnRzID0gRGI7Il19
//# sourceMappingURL=Db.js.map
