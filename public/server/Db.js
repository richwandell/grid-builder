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
            _this.db.exec("PRAGMA busy_timeout = 150000;");
        });
        this.featuresCachePromise = new Promise(function (resolve, reject) {
            _this.createTables(_this.db, function () {
                _this.createFeaturesCache(resolve, reject);
            });
        });
    }

    _createClass(Db, [{
        key: 'getStateParticles',
        value: function getStateParticles(id, cb) {
            var db = this.db;
            db.get(Db.query_get_particles, id, function (err, row) {
                var particles = [];
                if (row !== undefined && row.particles !== null) {
                    particles = JSON.parse(row.particles);
                }

                cb(particles);
            });
        }
    }, {
        key: 'setStateParticles',
        value: function setStateParticles(id, particles) {
            var db = this.db;
            var p = JSON.stringify(particles);
            db.serialize(function () {
                db.run(Db.query_insert_particles, id, p);
                db.run(Db.query_update_particles, id, p);
            });
        }
    }, {
        key: 'createFeaturesCache',
        value: function createFeaturesCache(resolve, reject) {
            var _this2 = this;

            this.featuresCache = {};
            this.db.all("select * from features;", function (err, rows) {
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
                    if (typeof _this2.featuresCache[fp_id] == "undefined") {
                        _this2.featuresCache[fp_id] = {};
                    }
                    var coord = x + "_" + y;
                    if (typeof _this2.featuresCache[fp_id][coord] == "undefined") {
                        _this2.featuresCache[fp_id][coord] = {};
                    }

                    _this2.featuresCache[fp_id][coord][feature] = value;
                }
                _this2.log.log("Features Cache created: " + JSON.stringify(Object.keys(_this2.featuresCache)));
                resolve();
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
                        cb();
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
                            _this5.updateKalman(fp_id, cb);
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
Db.query_get_max_min_particles = "select min(x), max(x), min(y), max(y) from features where fp_id = ?;";
Db.query_get_particles = "select particles from particles where id = ?";
Db.query_insert_particles = "insert or ignore into particles values (?, ?);";
Db.query_update_particles = "update particles set particles = ? where id = ?";
Db.creates = ["CREATE TABLE if not exists layout_images (id TEXT PRIMARY KEY, layout_image TEXT);", "CREATE UNIQUE INDEX if not exists layout_images_id_uindex ON layout_images (id);",

/**
 * Create the settings table with default settings
 */
"create table if not exists settings (key TEXT PRIMARY KEY, value TEXT);", "create unique index if not exists settings_key on settings (key);", "insert or ignore into settings (key, value) values ('database_version', 0);", "insert or ignore into settings (key, value) values ('database_code_version', 0);",

/**
 * ap_id = access point id
 * fp_id = floorplan id
 */
"CREATE TABLE if not exists scan_results " + "(s_id INTEGER, fp_id TEXT, ap_id TEXT, x INTEGER, " + "y INTEGER, value REAL, orig_values TEXT, created TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL, " + "PRIMARY KEY (s_id, fp_id, ap_id), " + "CONSTRAINT scan_results_layout_images_id_fk FOREIGN KEY (fp_id) REFERENCES layout_images (id));", "create index if not exists x_and_y on scan_results (x, y);", "CREATE TABLE if not exists kalman_estimates (fp_id TEXT, ap_id TEXT, x INTEGER, " + "y INTEGER, kalman REAL, " + "CONSTRAINT kalman_estimates_fp_id_ap_id_x_y_pk PRIMARY KEY (fp_id, ap_id, x, y)," + "FOREIGN KEY (ap_id, fp_id, x, y) REFERENCES scan_results (ap_id, fp_id, x, y) ON DELETE CASCADE)", "CREATE TABLE if not exists features (fp_id TEXT, x INTEGER, y INTEGER, feature TEXT, value REAL, " + " CONSTRAINT features_fp_id_x_y_feature_pk PRIMARY KEY (fp_id, x, y, feature));", "CREATE UNIQUE INDEX if not exists features_feature_index1 ON features(fp_id,feature,x,y);", "CREATE INDEX if not exists features_feature_index2 ON features(feature);", "CREATE TABLE if not exists particles (id INT PRIMARY KEY NOT NULL, particles TEXT);", "CREATE UNIQUE INDEX if not exists particles_id_uindex ON particles (id);"];
Db.drops = ["drop table if exists layout_images;", "drop table if exists settings;", "drop table if exists scan_results;", "drop table if exists kalman_estimates;"];
Db.migration1 = ["ALTER TABLE layout_images ADD floor_plan_name TEXT NULL;", "update settings set value = '" + Db.database_code_version + "' where key = 'database_code_version';"];
Db.migration2 = ["ALTER TABLE features ADD s_id INT NULL;", "DROP INDEX features_feature_index1;", "DROP INDEX features_feature_index2;", "CREATE TABLE featuresa8d1 (fp_id TEXT, x INTEGER, y INTEGER, feature TEXT, value REAL, s_id INTEGER," + " CONSTRAINT features_fp_id_x_y_feature_s_id_pk PRIMARY KEY (fp_id, x, y, feature, s_id));", "CREATE UNIQUE INDEX features_feature_index1 ON featuresa8d1 (fp_id, feature, x, y, s_id);", "INSERT INTO featuresa8d1(fp_id, x, y, feature, value, s_id) SELECT fp_id, x, y, feature, value, s_id FROM features;", "DROP TABLE features;", "ALTER TABLE featuresa8d1 RENAME TO features;", "CREATE INDEX features_feature_index2 ON features(feature);", "update settings set value = '" + Db.database_code_version + "' where key = 'database_code_version';"];
Db.migration3 = ["insert or ignore into settings values ('scan_id', 64);", "update settings set value = '" + Db.database_code_version + "' where key = 'database_code_version';"];
Db.migration4 = ["drop table features;", "CREATE TABLE features (fp_id TEXT, x INTEGER, y INTEGER, feature TEXT, value REAL, " + " CONSTRAINT features_fp_id_x_y_feature_pk PRIMARY KEY (fp_id, x, y, feature));", "update settings set value = '" + Db.database_code_version + "' where key = 'database_code_version';"];


module.exports = Db;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvRGIuZXM2Il0sIm5hbWVzIjpbInNxbGl0ZTMiLCJyZXF1aXJlIiwidmVyYm9zZSIsIkRiIiwibG9nIiwiZGVidWciLCJkYiIsImNhY2hlZCIsIkRhdGFiYXNlIiwic2VyaWFsaXplIiwiZXhlYyIsImZlYXR1cmVzQ2FjaGVQcm9taXNlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJjcmVhdGVUYWJsZXMiLCJjcmVhdGVGZWF0dXJlc0NhY2hlIiwiaWQiLCJjYiIsImdldCIsInF1ZXJ5X2dldF9wYXJ0aWNsZXMiLCJlcnIiLCJyb3ciLCJwYXJ0aWNsZXMiLCJ1bmRlZmluZWQiLCJKU09OIiwicGFyc2UiLCJwIiwic3RyaW5naWZ5IiwicnVuIiwicXVlcnlfaW5zZXJ0X3BhcnRpY2xlcyIsInF1ZXJ5X3VwZGF0ZV9wYXJ0aWNsZXMiLCJmZWF0dXJlc0NhY2hlIiwiYWxsIiwicm93cyIsImxlbmd0aCIsImZwX2lkIiwieCIsInkiLCJmZWF0dXJlIiwidmFsdWUiLCJpIiwiY29vcmQiLCJPYmplY3QiLCJrZXlzIiwiZGF0YWJhc2VDb2RlVmVyc2lvbiIsIm1pZ3JhdGlvbjEiLCJmb3JFYWNoIiwibWlnIiwibWlncmF0aW9uMiIsIm1pZ3JhdGlvbjMiLCJtaWdyYXRpb240IiwiY3JlYXRlcyIsImNyZWF0ZSIsImtleSIsIk51bWJlciIsImRhdGFiYXNlX2NvZGVfdmVyc2lvbiIsImRvVXBncmFkZSIsInF1ZXJ5X2dldF9zY2FubmVkX2Nvb3JkcyIsInF1ZXJ5X2dldF9hbGxfZmxvb3JwbGFucyIsImRhdGEiLCJzdG10IiwicHJlcGFyZSIsInF1ZXJ5X2luc2VydF92ZXJzaW9uIiwiZGF0YWJhc2VWZXJzaW9uIiwiZmluYWxpemUiLCJxdWVyeV91cGRhdGVfdmVyc2lvbiIsImxheW91dF9pbWFnZXMiLCJxdWVyeV9pbnNlcnRfbGF5b3V0IiwidXBzdG10IiwicXVlcnlfdXBkYXRlX2xheW91dCIsImVsIiwiZmxvb3JfcGxhbl9uYW1lIiwiZmxvb3JwbGFubmFtZSIsInN0cmluZ2RhdGEiLCJwYXlsb2FkIiwicXVlcnlfaW5zZXJ0X3NjYW5fcmVzdWx0cyIsImZpbmlzaGVkIiwicXVlcnlfZ2V0X3NjYW5faWQiLCJxdWVyeV91cGRhdGVfc2Nhbl9pZCIsInNfaWQiLCJhcF9pZCIsIm9yaWdfdmFsdWVzIiwiY3JlYXRlZCIsInVwZGF0ZUthbG1hbiIsImthbG1hbiIsInF1ZXJ5X2dldF9mb3Jfa2FsbWFuIiwiaW5zZXJ0IiwicXVlcnlfaW5zZXJ0X2thbG1hbl9lc3RpbWF0ZXMiLCJ1cGRhdGUiLCJxdWVyeV91cGRhdGVfa2FsbWFuX2VzdGltYXRlcyIsImVycm9yIiwiZG9uZSIsImsiLCJjZXN0IiwidmFsdWVzIiwic3BsaXQiLCJtYXAiLCJhZGRTYW1wbGUiLCJnZXRFc3RpbWF0ZSIsInF1ZXJ5X3VwZGF0ZV9mZWF0dXJlcyIsInF1ZXJ5X2dldF9kYXRhYmFzZV92ZXJzaW9uIiwicXVlcnlfZ2V0X3NjYW5fcmVzdWx0cyIsInF1ZXJ5X3VwZGF0ZV9vbGRlc3RfZmVhdHVyZXMiLCJxdWVyeV9nZXRfZmVhdHVyZXMiLCJxdWVyeV9nZXRfbWluX3NpZCIsInF1ZXJ5X2dldF9tYXhfbWluX3BhcnRpY2xlcyIsImRyb3BzIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBOzs7Ozs7OztBQUVBLElBQUlBLFVBQVVDLFFBQVEsU0FBUixFQUFtQkMsT0FBbkIsRUFBZDs7SUFFTUMsRTtBQWtIRixnQkFBWUMsR0FBWixFQUFnQjtBQUFBOztBQUFBOztBQUNaLGFBQUtBLEdBQUwsR0FBV0EsR0FBWDtBQUNBLGFBQUtBLEdBQUwsQ0FBU0MsS0FBVCxDQUFlLGdCQUFmOztBQUVBLGFBQUtDLEVBQUwsR0FBVSxJQUFJTixRQUFRTyxNQUFSLENBQWVDLFFBQW5CLENBQTRCLGVBQTVCLENBQVY7QUFDQSxhQUFLRixFQUFMLENBQVFHLFNBQVIsQ0FBa0IsWUFBTTtBQUNwQixrQkFBS0gsRUFBTCxDQUFRSSxJQUFSLENB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QixrQ0FBa0MzQyxHQUFHcUQscUJBQXJDLEdBQTZELHdDQUY3QyxDO0FBbkZsQnJELEUsQ0F3Rks4QyxVLEdBQWEsQ0FDaEIseUNBRGdCLEVBRWhCLHFDQUZnQixFQUdoQixxQ0FIZ0IsRUFJaEIseUdBQ0UsMkZBTGMsRUFNaEIsMkZBTmdCLEVBT2hCLHFIQVBnQixFQVFoQixzQkFSZ0IsRUFTaEIsOENBVGdCLEVBVWhCLDREQVZnQixFQVdoQixrQ0FBa0M5QyxHQUFHcUQscUJBQXJDLEdBQTZELHdDQVg3QyxDO0FBeEZsQnJELEUsQ0FzR0srQyxVLEdBQWEsQ0FDaEIsd0RBRGdCLEVBRWhCLGtDQUFrQy9DLEdBQUdxRCxxQkFBckMsR0FBNkQsd0NBRjdDLEM7QUF0R2xCckQsRSxDQTJHS2dELFUsR0FBYSxDQUNoQixzQkFEZ0IsRUFFaEIsd0ZBQ0UsZ0ZBSGMsRUFJaEIsa0NBQWtDaEQsR0FBR3FELHFCQUFyQyxHQUE2RCx3Q0FKN0MsQzs7O0FBa1N4Qm9ELE9BQU9DLE9BQVAsR0FBaUIxRyxFQUFqQiIsImZpbGUiOiJEYi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBLYWxtYW5GaWx0ZXIgZnJvbSAnLi9LYWxtYW5GaWx0ZXInO1xuXG5sZXQgc3FsaXRlMyA9IHJlcXVpcmUoJ3NxbGl0ZTMnKS52ZXJib3NlKCk7XG5cbmNsYXNzIERiIHtcblxuICAgIHN0YXRpYyBkYXRhYmFzZV9jb2RlX3ZlcnNpb24gPSA0O1xuICAgIHN0YXRpYyBxdWVyeV9nZXRfYWxsX2Zsb29ycGxhbnMgPSBcInNlbGVjdCAqIGZyb20gbGF5b3V0X2ltYWdlc1wiO1xuICAgIHN0YXRpYyBxdWVyeV9nZXRfZGF0YWJhc2VfdmVyc2lvbiA9IFwic2VsZWN0IHZhbHVlIGZyb20gc2V0dGluZ3Mgd2hlcmUga2V5ID0gJ2RhdGFiYXNlX3ZlcnNpb24nO1wiO1xuICAgIHN0YXRpYyBxdWVyeV9pbnNlcnRfdmVyc2lvbiA9IFwiaW5zZXJ0IG9yIGlnbm9yZSBpbnRvIHNldHRpbmdzIHZhbHVlcyAoJ2RhdGFiYXNlX3ZlcnNpb24nLCA/KTtcIjtcbiAgICBzdGF0aWMgcXVlcnlfdXBkYXRlX3ZlcnNpb24gPSBcInVwZGF0ZSBzZXR0aW5ncyBzZXQgdmFsdWUgPSA/IHdoZXJlIGtleSA9ICdkYXRhYmFzZV92ZXJzaW9uJztcIjtcbiAgICBzdGF0aWMgcXVlcnlfaW5zZXJ0X2xheW91dCA9IFwiaW5zZXJ0IG9yIGlnbm9yZSBpbnRvIGxheW91dF9pbWFnZXMgdmFsdWVzICg/LCA/LCA/KTtcIjtcbiAgICBzdGF0aWMgcXVlcnlfdXBkYXRlX2xheW91dCA9IFwidXBkYXRlIGxheW91dF9pbWFnZXMgc2V0IGxheW91dF9pbWFnZSA9ID8sIGZsb29yX3BsYW5fbmFtZSA9ID8gd2hlcmUgaWQgPSA/O1wiO1xuICAgIHN0YXRpYyBxdWVyeV9pbnNlcnRfc2Nhbl9yZXN1bHRzID0gXCJpbnNlcnQgaW50byBzY2FuX3Jlc3VsdHMgdmFsdWVzICg/LCA/LCA/LCA/LCA/LCA/LCA/LCA/KTtcIjtcbiAgICBzdGF0aWMgcXVlcnlfZ2V0X3NjYW5fcmVzdWx0cyA9IFwic2VsZWN0ICogZnJvbSBzY2FuX3Jlc3VsdHM7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X2dldF9mb3Jfa2FsbWFuID0gXCJTRUxFQ1Qgcy5mcF9pZCwgcy5hcF9pZCwgcy54LCBzLnksIFwiXG4gICAgKyBcImdyb3VwX2NvbmNhdChzLnZhbHVlKSBgdmFsdWVzYCwgXCJcbiAgICArIFwiY2FzZSB3aGVuIGsua2FsbWFuIGlzIG51bGwgdGhlbiBhdmcocy52YWx1ZSkgZWxzZSBrLmthbG1hbiBlbmQgYGNlc3RgLCBcIlxuICAgICsgXCJrLmthbG1hbiBGUk9NIHNjYW5fcmVzdWx0cyBzIGxlZnQgam9pbiBcIlxuICAgICsgXCJrYWxtYW5fZXN0aW1hdGVzIGsgb24gcy5mcF9pZCA9IGsuZnBfaWQgYW5kIHMuYXBfaWQgPSBrLmFwX2lkIGFuZCBzLnggPSBrLnggYW5kIHMueSA9IGsueSBcIlxuICAgICsgXCIgd2hlcmUgcy5mcF9pZCA9ID8gR1JPVVAgQlkgcy5mcF9pZCwgcy5hcF9pZCwgcy54LCBzLnk7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X2luc2VydF9rYWxtYW5fZXN0aW1hdGVzID0gXCJpbnNlcnQgb3IgaWdub3JlIGludG8ga2FsbWFuX2VzdGltYXRlcyB2YWx1ZXMgKD8sID8sID8sID8sID8pO1wiO1xuICAgIHN0YXRpYyBxdWVyeV91cGRhdGVfa2FsbWFuX2VzdGltYXRlcyA9IFwidXBkYXRlIGthbG1hbl9lc3RpbWF0ZXMgc2V0IGthbG1hbiA9ID8gd2hlcmUgZnBfaWQgPSA/IGFuZCBhcF9pZCA9ID8gYW5kIFwiXG4gICAgKyBcIiB4ID0gPyBhbmQgeSA9ID87XCI7XG4gICAgc3RhdGljIHF1ZXJ5X3VwZGF0ZV9mZWF0dXJlcyA9IFwiaW5zZXJ0IGludG8gZmVhdHVyZXMgXCJcbiAgICArIFwiIHNlbGVjdCBrLmZwX2lkLCBrLngsIGsueSwgay5hcF9pZCB8fCBrMS5hcF9pZCBhcyBmZWF0dXJlLCBhYnMoay5rYWxtYW4gLSBrMS5rYWxtYW4pIGFzIHZhbHVlIFwiXG4gICAgKyBcIiBmcm9tIGthbG1hbl9lc3RpbWF0ZXMgayBqb2luIGthbG1hbl9lc3RpbWF0ZXMgazEgb24gay5mcF9pZCA9IGsxLmZwX2lkIGFuZCBrLnggPSBrMS54IGFuZCBrLnkgPSBrMS55XCJcbiAgICArIFwiIHdoZXJlIHZhbHVlICE9IDAgYW5kIGsuZnBfaWQgPSA/IGFuZCBrMS5mcF9pZCA9ID9cIjtcbiAgICBzdGF0aWMgcXVlcnlfdXBkYXRlX29sZGVzdF9mZWF0dXJlcyA9IFwic2VsZWN0IGsuZnBfaWQsIGsueCwgay55LCBrLmFwX2lkIHx8IGsxLmFwX2lkIGFzIGZlYXR1cmUsIFwiXG4gICAgKyBcIiBhYnMoay5rYWxtYW4gLSBrMS5rYWxtYW4pIGFzIHZhbHVlLCA6c2Nhbl9pZDogc19pZCBmcm9tIGthbG1hbl9lc3RpbWF0ZXMgayBqb2luIFwiXG4gICAgKyBcIiBrYWxtYW5fZXN0aW1hdGVzIGsxIG9uIGsuZnBfaWQgPSBrMS5mcF9pZCBhbmQgay54ID0gazEueCBhbmQgay55ID0gazEueSBhbmQgay5hcF9pZCA8IGsxLmFwX2lkIHdoZXJlXCJcbiAgICArIFwiIGsua2FsbWFuICE9IDAgYW5kIGsxLmthbG1hbiAhPSAwIGFuZCBrLmZwX2lkID0gPyBhbmQgazEuZnBfaWQgPSA/O1wiO1xuICAgIHN0YXRpYyBxdWVyeV9nZXRfZmVhdHVyZXMgPSBcInNlbGVjdCBmLiosIGFicyh2YWx1ZSAtIDpmZWF0dXJlX3ZhbHVlOikgZGlmZiBmcm9tIGZlYXR1cmVzIGYgXCJcbiAgICArIFwiIHdoZXJlIGYuZmVhdHVyZSA9ID8gYW5kIGYuZnBfaWQgPSA/IG9yZGVyIGJ5IGRpZmYgYXNjO1wiO1xuICAgIHN0YXRpYyBxdWVyeV9nZXRfc2Nhbm5lZF9jb29yZHMgPSBcInNlbGVjdCBjb3VudCgqKSBhcyBudW1fZmVhdHVyZXMsIHgsIHkgZnJvbSBmZWF0dXJlcyB3aGVyZSBmcF9pZCA9ID8gXCJcbiAgICArIFwiIGdyb3VwIGJ5IHgsIHk7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X2dldF9taW5fc2lkID0gXCJzZWxlY3QgbWluKHNfaWQpIGZyb20gZmVhdHVyZXMgd2hlcmUgZnBfaWQgPSA/XCI7XG4gICAgc3RhdGljIHF1ZXJ5X2dldF9zY2FuX2lkID0gXCJzZWxlY3QgdmFsdWUgKyAxIGFzIHZhbHVlIGZyb20gc2V0dGluZ3Mgd2hlcmUga2V5ID0gJ3NjYW5faWQnO1wiO1xuICAgIHN0YXRpYyBxdWVyeV91cGRhdGVfc2Nhbl9pZCA9IFwidXBkYXRlIHNldHRpbmdzIHNldCB2YWx1ZSA9IHZhbHVlICsgMSB3aGVyZSBrZXkgPSAnc2Nhbl9pZCc7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X2dldF9tYXhfbWluX3BhcnRpY2xlcyA9IFwic2VsZWN0IG1pbih4KSwgbWF4KHgpLCBtaW4oeSksIG1heCh5KSBmcm9tIGZlYXR1cmVzIHdoZXJlIGZwX2lkID0gPztcIjtcbiAgICBzdGF0aWMgcXVlcnlfZ2V0X3BhcnRpY2xlcyA9IFwic2VsZWN0IHBhcnRpY2xlcyBmcm9tIHBhcnRpY2xlcyB3aGVyZSBpZCA9ID9cIjtcbiAgICBzdGF0aWMgcXVlcnlfaW5zZXJ0X3BhcnRpY2xlcyA9IFwiaW5zZXJ0IG9yIGlnbm9yZSBpbnRvIHBhcnRpY2xlcyB2YWx1ZXMgKD8sID8pO1wiO1xuICAgIHN0YXRpYyBxdWVyeV91cGRhdGVfcGFydGljbGVzID0gXCJ1cGRhdGUgcGFydGljbGVzIHNldCBwYXJ0aWNsZXMgPSA/IHdoZXJlIGlkID0gP1wiO1xuXG4gICAgc3RhdGljIGNyZWF0ZXMgPSBbXG4gICAgICAgIFwiQ1JFQVRFIFRBQkxFIGlmIG5vdCBleGlzdHMgbGF5b3V0X2ltYWdlcyAoaWQgVEVYVCBQUklNQVJZIEtFWSwgbGF5b3V0X2ltYWdlIFRFWFQpO1wiLFxuICAgICAgICBcIkNSRUFURSBVTklRVUUgSU5ERVggaWYgbm90IGV4aXN0cyBsYXlvdXRfaW1hZ2VzX2lkX3VpbmRleCBPTiBsYXlvdXRfaW1hZ2VzIChpZCk7XCIsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENyZWF0ZSB0aGUgc2V0dGluZ3MgdGFibGUgd2l0aCBkZWZhdWx0IHNldHRpbmdzXG4gICAgICAgICAqL1xuICAgICAgICBcImNyZWF0ZSB0YWJsZSBpZiBub3QgZXhpc3RzIHNldHRpbmdzIChrZXkgVEVYVCBQUklNQVJZIEtFWSwgdmFsdWUgVEVYVCk7XCIsXG4gICAgICAgIFwiY3JlYXRlIHVuaXF1ZSBpbmRleCBpZiBub3QgZXhpc3RzIHNldHRpbmdzX2tleSBvbiBzZXR0aW5ncyAoa2V5KTtcIixcbiAgICAgICAgXCJpbnNlcnQgb3IgaWdub3JlIGludG8gc2V0dGluZ3MgKGtleSwgdmFsdWUpIHZhbHVlcyAoJ2RhdGFiYXNlX3ZlcnNpb24nLCAwKTtcIixcbiAgICAgICAgXCJpbnNlcnQgb3IgaWdub3JlIGludG8gc2V0dGluZ3MgKGtleSwgdmFsdWUpIHZhbHVlcyAoJ2RhdGFiYXNlX2NvZGVfdmVyc2lvbicsIDApO1wiLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBhcF9pZCA9IGFjY2VzcyBwb2ludCBpZFxuICAgICAgICAgKiBmcF9pZCA9IGZsb29ycGxhbiBpZFxuICAgICAgICAgKi9cbiAgICAgICAgXCJDUkVBVEUgVEFCTEUgaWYgbm90IGV4aXN0cyBzY2FuX3Jlc3VsdHMgXCIgK1xuICAgICAgICBcIihzX2lkIElOVEVHRVIsIGZwX2lkIFRFWFQsIGFwX2lkIFRFWFQsIHggSU5URUdFUiwgXCIgK1xuICAgICAgICBcInkgSU5URUdFUiwgdmFsdWUgUkVBTCwgb3JpZ192YWx1ZXMgVEVYVCwgY3JlYXRlZCBUSU1FU1RBTVAgREVGQVVMVCBDVVJSRU5UX1RJTUVTVEFNUCBOT1QgTlVMTCwgXCIgK1xuICAgICAgICBcIlBSSU1BUlkgS0VZIChzX2lkLCBmcF9pZCwgYXBfaWQpLCBcIiArXG4gICAgICAgIFwiQ09OU1RSQUlOVCBzY2FuX3Jlc3VsdHNfbGF5b3V0X2ltYWdlc19pZF9mayBGT1JFSUdOIEtFWSAoZnBfaWQpIFJFRkVSRU5DRVMgbGF5b3V0X2ltYWdlcyAoaWQpKTtcIixcbiAgICAgICAgXCJjcmVhdGUgaW5kZXggaWYgbm90IGV4aXN0cyB4X2FuZF95IG9uIHNjYW5fcmVzdWx0cyAoeCwgeSk7XCIsXG5cbiAgICAgICAgXCJDUkVBVEUgVEFCTEUgaWYgbm90IGV4aXN0cyBrYWxtYW5fZXN0aW1hdGVzIChmcF9pZCBURVhULCBhcF9pZCBURVhULCB4IElOVEVHRVIsIFwiXG4gICAgICAgICsgXCJ5IElOVEVHRVIsIGthbG1hbiBSRUFMLCBcIlxuICAgICAgICArIFwiQ09OU1RSQUlOVCBrYWxtYW5fZXN0aW1hdGVzX2ZwX2lkX2FwX2lkX3hfeV9wayBQUklNQVJZIEtFWSAoZnBfaWQsIGFwX2lkLCB4LCB5KSxcIlxuICAgICAgICArIFwiRk9SRUlHTiBLRVkgKGFwX2lkLCBmcF9pZCwgeCwgeSkgUkVGRVJFTkNFUyBzY2FuX3Jlc3VsdHMgKGFwX2lkLCBmcF9pZCwgeCwgeSkgT04gREVMRVRFIENBU0NBREUpXCIsXG5cbiAgICAgICAgXCJDUkVBVEUgVEFCTEUgaWYgbm90IGV4aXN0cyBmZWF0dXJlcyAoZnBfaWQgVEVYVCwgeCBJTlRFR0VSLCB5IElOVEVHRVIsIGZlYXR1cmUgVEVYVCwgdmFsdWUgUkVBTCwgXCJcbiAgICAgICAgKyBcIiBDT05TVFJBSU5UIGZlYXR1cmVzX2ZwX2lkX3hfeV9mZWF0dXJlX3BrIFBSSU1BUlkgS0VZIChmcF9pZCwgeCwgeSwgZmVhdHVyZSkpO1wiLFxuICAgICAgICBcIkNSRUFURSBVTklRVUUgSU5ERVggaWYgbm90IGV4aXN0cyBmZWF0dXJlc19mZWF0dXJlX2luZGV4MSBPTiBmZWF0dXJlcyhmcF9pZCxmZWF0dXJlLHgseSk7XCIsXG4gICAgICAgIFwiQ1JFQVRFIElOREVYIGlmIG5vdCBleGlzdHMgZmVhdHVyZXNfZmVhdHVyZV9pbmRleDIgT04gZmVhdHVyZXMoZmVhdHVyZSk7XCIsXG4gICAgICAgIFwiQ1JFQVRFIFRBQkxFIGlmIG5vdCBleGlzdHMgcGFydGljbGVzIChpZCBJTlQgUFJJTUFSWSBLRVkgTk9UIE5VTEwsIHBhcnRpY2xlcyBURVhUKTtcIixcbiAgICAgICAgXCJDUkVBVEUgVU5JUVVFIElOREVYIGlmIG5vdCBleGlzdHMgcGFydGljbGVzX2lkX3VpbmRleCBPTiBwYXJ0aWNsZXMgKGlkKTtcIlxuICAgIF07XG5cbiAgICBzdGF0aWMgZHJvcHMgPSBbXG4gICAgICAgIFwiZHJvcCB0YWJsZSBpZiBleGlzdHMgbGF5b3V0X2ltYWdlcztcIixcbiAgICAgICAgXCJkcm9wIHRhYmxlIGlmIGV4aXN0cyBzZXR0aW5ncztcIixcbiAgICAgICAgXCJkcm9wIHRhYmxlIGlmIGV4aXN0cyBzY2FuX3Jlc3VsdHM7XCIsXG4gICAgICAgIFwiZHJvcCB0YWJsZSBpZiBleGlzdHMga2FsbWFuX2VzdGltYXRlcztcIlxuICAgIF07XG5cbiAgICBzdGF0aWMgbWlncmF0aW9uMSA9IFtcbiAgICAgICAgXCJBTFRFUiBUQUJMRSBsYXlvdXRfaW1hZ2VzIEFERCBmbG9vcl9wbGFuX25hbWUgVEVYVCBOVUxMO1wiLFxuICAgICAgICBcInVwZGF0ZSBzZXR0aW5ncyBzZXQgdmFsdWUgPSAnXCIgKyBEYi5kYXRhYmFzZV9jb2RlX3ZlcnNpb24gKyBcIicgd2hlcmUga2V5ID0gJ2RhdGFiYXNlX2NvZGVfdmVyc2lvbic7XCJcbiAgICBdO1xuXG4gICAgc3RhdGljIG1pZ3JhdGlvbjIgPSBbXG4gICAgICAgIFwiQUxURVIgVEFCTEUgZmVhdHVyZXMgQUREIHNfaWQgSU5UIE5VTEw7XCIsXG4gICAgICAgIFwiRFJPUCBJTkRFWCBmZWF0dXJlc19mZWF0dXJlX2luZGV4MTtcIixcbiAgICAgICAgXCJEUk9QIElOREVYIGZlYXR1cmVzX2ZlYXR1cmVfaW5kZXgyO1wiLFxuICAgICAgICBcIkNSRUFURSBUQUJMRSBmZWF0dXJlc2E4ZDEgKGZwX2lkIFRFWFQsIHggSU5URUdFUiwgeSBJTlRFR0VSLCBmZWF0dXJlIFRFWFQsIHZhbHVlIFJFQUwsIHNfaWQgSU5URUdFUixcIlxuICAgICAgICArIFwiIENPTlNUUkFJTlQgZmVhdHVyZXNfZnBfaWRfeF95X2ZlYXR1cmVfc19pZF9wayBQUklNQVJZIEtFWSAoZnBfaWQsIHgsIHksIGZlYXR1cmUsIHNfaWQpKTtcIixcbiAgICAgICAgXCJDUkVBVEUgVU5JUVVFIElOREVYIGZlYXR1cmVzX2ZlYXR1cmVfaW5kZXgxIE9OIGZlYXR1cmVzYThkMSAoZnBfaWQsIGZlYXR1cmUsIHgsIHksIHNfaWQpO1wiLFxuICAgICAgICBcIklOU0VSVCBJTlRPIGZlYXR1cmVzYThkMShmcF9pZCwgeCwgeSwgZmVhdHVyZSwgdmFsdWUsIHNfaWQpIFNFTEVDVCBmcF9pZCwgeCwgeSwgZmVhdHVyZSwgdmFsdWUsIHNfaWQgRlJPTSBmZWF0dXJlcztcIixcbiAgICAgICAgXCJEUk9QIFRBQkxFIGZlYXR1cmVzO1wiLFxuICAgICAgICBcIkFMVEVSIFRBQkxFIGZlYXR1cmVzYThkMSBSRU5BTUUgVE8gZmVhdHVyZXM7XCIsXG4gICAgICAgIFwiQ1JFQVRFIElOREVYIGZlYXR1cmVzX2ZlYXR1cmVfaW5kZXgyIE9OIGZlYXR1cmVzKGZlYXR1cmUpO1wiLFxuICAgICAgICBcInVwZGF0ZSBzZXR0aW5ncyBzZXQgdmFsdWUgPSAnXCIgKyBEYi5kYXRhYmFzZV9jb2RlX3ZlcnNpb24gKyBcIicgd2hlcmUga2V5ID0gJ2RhdGFiYXNlX2NvZGVfdmVyc2lvbic7XCJcbiAgICBdO1xuXG4gICAgc3RhdGljIG1pZ3JhdGlvbjMgPSBbXG4gICAgICAgIFwiaW5zZXJ0IG9yIGlnbm9yZSBpbnRvIHNldHRpbmdzIHZhbHVlcyAoJ3NjYW5faWQnLCA2NCk7XCIsXG4gICAgICAgIFwidXBkYXRlIHNldHRpbmdzIHNldCB2YWx1ZSA9ICdcIiArIERiLmRhdGFiYXNlX2NvZGVfdmVyc2lvbiArIFwiJyB3aGVyZSBrZXkgPSAnZGF0YWJhc2VfY29kZV92ZXJzaW9uJztcIlxuICAgIF07XG5cbiAgICBzdGF0aWMgbWlncmF0aW9uNCA9IFtcbiAgICAgICAgXCJkcm9wIHRhYmxlIGZlYXR1cmVzO1wiLFxuICAgICAgICBcIkNSRUFURSBUQUJMRSBmZWF0dXJlcyAoZnBfaWQgVEVYVCwgeCBJTlRFR0VSLCB5IElOVEVHRVIsIGZlYXR1cmUgVEVYVCwgdmFsdWUgUkVBTCwgXCJcbiAgICAgICAgKyBcIiBDT05TVFJBSU5UIGZlYXR1cmVzX2ZwX2lkX3hfeV9mZWF0dXJlX3BrIFBSSU1BUlkgS0VZIChmcF9pZCwgeCwgeSwgZmVhdHVyZSkpO1wiLFxuICAgICAgICBcInVwZGF0ZSBzZXR0aW5ncyBzZXQgdmFsdWUgPSAnXCIgKyBEYi5kYXRhYmFzZV9jb2RlX3ZlcnNpb24gKyBcIicgd2hlcmUga2V5ID0gJ2RhdGFiYXNlX2NvZGVfdmVyc2lvbic7XCJcbiAgICBdO1xuXG4gICAgY29uc3RydWN0b3IobG9nKXtcbiAgICAgICAgdGhpcy5sb2cgPSBsb2c7XG4gICAgICAgIHRoaXMubG9nLmRlYnVnKFwiRGIuY29uc3RydWN0b3JcIik7XG5cbiAgICAgICAgdGhpcy5kYiA9IG5ldyBzcWxpdGUzLmNhY2hlZC5EYXRhYmFzZSgnZGIvZGIuc3FsaXRlMycpO1xuICAgICAgICB0aGlzLmRiLnNlcmlhbGl6ZSgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmRiLmV4ZWMoXCJQUkFHTUEgam91cm5hbF9tb2RlID0gV0FMO1wiKTtcbiAgICAgICAgICAgIHRoaXMuZGIuZXhlYyhcIlBSQUdNQSBjYWNoZV9zaXplID0gNDA5NjAwMDtcIik7XG4gICAgICAgICAgICB0aGlzLmRiLmV4ZWMoXCJQUkFHTUEgb3B0aW1pemU7XCIpO1xuICAgICAgICAgICAgdGhpcy5kYi5leGVjKFwiUFJBR01BIGJ1c3lfdGltZW91dCA9IDE1MDAwMDtcIik7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmZlYXR1cmVzQ2FjaGVQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVUYWJsZXModGhpcy5kYiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlRmVhdHVyZXNDYWNoZShyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldFN0YXRlUGFydGljbGVzKGlkLCBjYil7XG4gICAgICAgIGxldCBkYiA9IHRoaXMuZGI7XG4gICAgICAgIGRiLmdldChEYi5xdWVyeV9nZXRfcGFydGljbGVzLCBpZCwgKGVyciwgcm93KSA9PiB7XG4gICAgICAgICAgICBsZXQgcGFydGljbGVzID0gW107XG4gICAgICAgICAgICBpZihyb3cgIT09IHVuZGVmaW5lZCAmJiByb3cucGFydGljbGVzICE9PSBudWxsKXtcbiAgICAgICAgICAgICAgICBwYXJ0aWNsZXMgPSBKU09OLnBhcnNlKHJvdy5wYXJ0aWNsZXMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjYihwYXJ0aWNsZXMpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzZXRTdGF0ZVBhcnRpY2xlcyhpZCwgcGFydGljbGVzKXtcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgbGV0IHAgPSBKU09OLnN0cmluZ2lmeShwYXJ0aWNsZXMpO1xuICAgICAgICBkYi5zZXJpYWxpemUoKCkgPT4ge1xuICAgICAgICAgICAgZGIucnVuKERiLnF1ZXJ5X2luc2VydF9wYXJ0aWNsZXMsIGlkLCBwKTtcbiAgICAgICAgICAgIGRiLnJ1bihEYi5xdWVyeV91cGRhdGVfcGFydGljbGVzLCBpZCwgcCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGNyZWF0ZUZlYXR1cmVzQ2FjaGUocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICAgICAgdGhpcy5mZWF0dXJlc0NhY2hlID0ge307XG4gICAgICAgIHRoaXMuZGIuYWxsKFwic2VsZWN0ICogZnJvbSBmZWF0dXJlcztcIiwgKGVyciwgcm93cykgPT4ge1xuICAgICAgICAgICAgaWYoZXJyKXtcbiAgICAgICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBsZW5ndGggPSByb3dzLmxlbmd0aDtcbiAgICAgICAgICAgIGxldCBmcF9pZCwgeCwgeSwgZmVhdHVyZSwgdmFsdWU7XG4gICAgICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgICAgIGZwX2lkID0gcm93c1tpXS5mcF9pZDtcbiAgICAgICAgICAgICAgICB4ID0gcm93c1tpXS54O1xuICAgICAgICAgICAgICAgIHkgPSByb3dzW2ldLnk7XG4gICAgICAgICAgICAgICAgZmVhdHVyZSA9IHJvd3NbaV0uZmVhdHVyZTtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHJvd3NbaV0udmFsdWU7XG4gICAgICAgICAgICAgICAgaWYodHlwZW9mKHRoaXMuZmVhdHVyZXNDYWNoZVtmcF9pZF0pID09IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmZlYXR1cmVzQ2FjaGVbZnBfaWRdID0ge307XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxldCBjb29yZCA9IHggKyBcIl9cIiArIHk7XG4gICAgICAgICAgICAgICAgaWYodHlwZW9mKHRoaXMuZmVhdHVyZXNDYWNoZVtmcF9pZF1bY29vcmRdKSA9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmVhdHVyZXNDYWNoZVtmcF9pZF1bY29vcmRdID0ge307XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5mZWF0dXJlc0NhY2hlW2ZwX2lkXVtjb29yZF1bZmVhdHVyZV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubG9nLmxvZyhcIkZlYXR1cmVzIENhY2hlIGNyZWF0ZWQ6IFwiICsgSlNPTi5zdHJpbmdpZnkoT2JqZWN0LmtleXModGhpcy5mZWF0dXJlc0NhY2hlKSkpO1xuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXRGZWF0dXJlc0NhY2hlKGZwX2lkKXtcbiAgICAgICAgaWYodGhpcy5mZWF0dXJlc0NhY2hlW2ZwX2lkXSA9PT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZWF0dXJlc0NhY2hlW2ZwX2lkXTtcbiAgICB9XG5cbiAgICBnZXRGZWF0dXJlVmFsdWUoZnBfaWQsIGNvb3JkLCBmZWF0dXJlKXtcbiAgICAgICAgaWYodGhpcy5mZWF0dXJlc0NhY2hlW2ZwX2lkXSA9PT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZih0aGlzLmZlYXR1cmVzQ2FjaGVbZnBfaWRdW2Nvb3JkXSA9PT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZih0aGlzLmZlYXR1cmVzQ2FjaGVbZnBfaWRdW2Nvb3JkXVtmZWF0dXJlXSA9PT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZWF0dXJlc0NhY2hlW2ZwX2lkXVtjb29yZF1bZmVhdHVyZV07XG4gICAgfVxuXG4gICAgZ2V0RGF0YWJhc2UoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGI7XG4gICAgfVxuXG4gICAgZG9VcGdyYWRlKGRiLCBkYXRhYmFzZUNvZGVWZXJzaW9uLCBjYikge1xuICAgICAgICB0aGlzLmxvZy5kZWJ1ZyhcIkRiLmRvVXBncmFkZVwiKTtcblxuICAgICAgICBzd2l0Y2goZGF0YWJhc2VDb2RlVmVyc2lvbil7XG4gICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgZGIuc2VyaWFsaXplKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgRGIubWlncmF0aW9uMS5mb3JFYWNoKChtaWcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRiLnJ1bihtaWcpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVUYWJsZXMoZGIsIGNiKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgIGRiLnNlcmlhbGl6ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIERiLm1pZ3JhdGlvbjIuZm9yRWFjaCgobWlnKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYi5ydW4obWlnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlVGFibGVzKGRiLCBjYik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICBkYi5zZXJpYWxpemUoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBEYi5taWdyYXRpb24zLmZvckVhY2goKG1pZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGIucnVuKG1pZyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVRhYmxlcyhkYiwgY2IpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgZGIuc2VyaWFsaXplKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgRGIubWlncmF0aW9uNC5mb3JFYWNoKChtaWcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRiLnJ1bihtaWcpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVUYWJsZXMoZGIsIGNiKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNyZWF0ZVRhYmxlcyhkYiwgY2IpIHtcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoXCJEYi5jcmVhdGVUYWJsZXNcIik7XG4gICAgICAgIGxldCBjcmVhdGVzID0gRGIuY3JlYXRlcztcblxuICAgICAgICBkYi5zZXJpYWxpemUoKCkgPT4ge1xuICAgICAgICAgICAgY3JlYXRlcy5mb3JFYWNoKGZ1bmN0aW9uKGNyZWF0ZSl7XG4gICAgICAgICAgICAgICAgZGIucnVuKGNyZWF0ZSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgbGV0IGRhdGFiYXNlQ29kZVZlcnNpb24gPSAwO1xuXG4gICAgICAgICAgICBkYi5hbGwoXCJzZWxlY3QgKiBmcm9tIHNldHRpbmdzXCIsIChlcnIsIHJvd3MpID0+IHtcbiAgICAgICAgICAgICAgICByb3dzLmZvckVhY2goZnVuY3Rpb24ocm93KXtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoKHJvdy5rZXkpe1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcImRhdGFiYXNlX2NvZGVfdmVyc2lvblwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFiYXNlQ29kZVZlcnNpb24gPSBOdW1iZXIocm93LnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmKGRhdGFiYXNlQ29kZVZlcnNpb24gPCBEYi5kYXRhYmFzZV9jb2RlX3ZlcnNpb24pe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRvVXBncmFkZShkYiwgZGF0YWJhc2VDb2RlVmVyc2lvbiwgY2IpO1xuICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICBjYigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXRTY2FubmVkQ29vcmRzKGZwX2lkLCBjYil7XG4gICAgICAgIHRoaXMubG9nLmRlYnVnKFwiRGIuZ2V0U2Nhbm5lZENvb3Jkc1wiKTtcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgZGIuYWxsKERiLnF1ZXJ5X2dldF9zY2FubmVkX2Nvb3JkcywgZnBfaWQsIGNiKTtcbiAgICB9XG5cbiAgICBnZXRGbG9vclBsYW5zKGNiKSB7XG4gICAgICAgIHRoaXMubG9nLmRlYnVnKFwiRGIuZ2V0Rmxvb3JQbGFuc1wiKTtcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgZGIuYWxsKERiLnF1ZXJ5X2dldF9hbGxfZmxvb3JwbGFucywgY2IpO1xuICAgIH1cblxuICAgIHVwZGF0ZURhdGFiYXNlKGRhdGEsIGNiKSB7XG4gICAgICAgIHRoaXMubG9nLmRlYnVnKFwiRGIudXBkYXRlRGF0YWJhc2VcIik7XG4gICAgICAgIGxldCBkYiA9IHRoaXMuZGI7XG4gICAgICAgIGxldCBzdG10ID0gZGIucHJlcGFyZShEYi5xdWVyeV9pbnNlcnRfdmVyc2lvbik7XG4gICAgICAgIHN0bXQucnVuKGRhdGEuZGF0YWJhc2VWZXJzaW9uKTtcbiAgICAgICAgc3RtdC5maW5hbGl6ZSgpO1xuXG4gICAgICAgIHN0bXQgPSBkYi5wcmVwYXJlKERiLnF1ZXJ5X3VwZGF0ZV92ZXJzaW9uKTtcbiAgICAgICAgc3RtdC5ydW4oZGF0YS5kYXRhYmFzZVZlcnNpb24pO1xuICAgICAgICBzdG10LmZpbmFsaXplKCk7XG5cbiAgICAgICAgaWYodHlwZW9mKGRhdGEubGF5b3V0X2ltYWdlcykgIT0gXCJ1bmRlZmluZWRcIiAmJiBkYXRhLmxheW91dF9pbWFnZXMubGVuZ3RoID4gMCl7XG4gICAgICAgICAgICBzdG10ID0gZGIucHJlcGFyZShEYi5xdWVyeV9pbnNlcnRfbGF5b3V0KTtcbiAgICAgICAgICAgIGxldCB1cHN0bXQgPSBkYi5wcmVwYXJlKERiLnF1ZXJ5X3VwZGF0ZV9sYXlvdXQpO1xuXG4gICAgICAgICAgICBkYXRhLmxheW91dF9pbWFnZXMuZm9yRWFjaChmdW5jdGlvbihlbCl7XG4gICAgICAgICAgICAgICAgbGV0IGlkID0gZWwuaWQ7XG4gICAgICAgICAgICAgICAgbGV0IGZsb29yX3BsYW5fbmFtZSA9IGVsLmZsb29ycGxhbm5hbWU7XG4gICAgICAgICAgICAgICAgbGV0IHN0cmluZ2RhdGEgPSBKU09OLnN0cmluZ2lmeShlbCk7XG4gICAgICAgICAgICAgICAgc3RtdC5ydW4oaWQsIHN0cmluZ2RhdGEsIGZsb29yX3BsYW5fbmFtZSk7XG4gICAgICAgICAgICAgICAgdXBzdG10LnJ1bihzdHJpbmdkYXRhLCBmbG9vcl9wbGFuX25hbWUsIGlkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc3RtdC5maW5hbGl6ZSgpO1xuICAgICAgICAgICAgdXBzdG10LmZpbmFsaXplKCk7XG4gICAgICAgIH1cblxuICAgICAgICBjYigpO1xuICAgIH1cblxuICAgIHNhdmVSZWFkaW5ncyhwYXlsb2FkLCBjYil7XG4gICAgICAgIGxldCBsb2cgPSB0aGlzLmxvZztcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgbG9nLmRlYnVnKFwiRGIuc2F2ZVJlYWRpbmdzXCIpO1xuXG4gICAgICAgIGxldCBzdG10ID0gZGIucHJlcGFyZShEYi5xdWVyeV9pbnNlcnRfc2Nhbl9yZXN1bHRzKTtcbiAgICAgICAgbGV0IGZpbmlzaGVkID0gMDtcbiAgICAgICAgZGIuZ2V0KERiLnF1ZXJ5X2dldF9zY2FuX2lkLCAoZXJyLCByb3cpID0+IHtcbiAgICAgICAgICAgIGRiLnJ1bihEYi5xdWVyeV91cGRhdGVfc2Nhbl9pZCk7XG4gICAgICAgICAgICBwYXlsb2FkLmZvckVhY2goKGVsKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHNfaWQgPSBOdW1iZXIocm93LnZhbHVlKTtcbiAgICAgICAgICAgICAgICBsZXQgZnBfaWQgPSBlbC5mcF9pZDtcbiAgICAgICAgICAgICAgICBsZXQgYXBfaWQgPSBlbC5hcF9pZDtcbiAgICAgICAgICAgICAgICBsZXQgeCA9IE51bWJlcihlbC54KTtcbiAgICAgICAgICAgICAgICBsZXQgeSA9IE51bWJlcihlbC55KTtcbiAgICAgICAgICAgICAgICBsZXQgdmFsdWUgPSBOdW1iZXIoZWwudmFsdWUpO1xuICAgICAgICAgICAgICAgIGxldCBvcmlnX3ZhbHVlcyA9IGVsLm9yaWdfdmFsdWVzO1xuICAgICAgICAgICAgICAgIGxldCBjcmVhdGVkID0gZWwuY3JlYXRlZDtcbiAgICAgICAgICAgICAgICBzdG10LnJ1bihzX2lkLCBmcF9pZCwgYXBfaWQsIHgsIHksIHZhbHVlLCBvcmlnX3ZhbHVlcywgY3JlYXRlZCwgKGVycikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBmaW5pc2hlZCsrO1xuICAgICAgICAgICAgICAgICAgICBpZihmaW5pc2hlZCA+PSBwYXlsb2FkLmxlbmd0aCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdG10LmZpbmFsaXplKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUthbG1hbihmcF9pZCwgY2IpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdXBkYXRlS2FsbWFuKGZwX2lkLCBjYil7XG4gICAgICAgIGxldCBsb2cgPSB0aGlzLmxvZztcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgbGV0IGthbG1hbiA9IHt9O1xuXG4gICAgICAgIGRiLmFsbChEYi5xdWVyeV9nZXRfZm9yX2thbG1hbiwgZnBfaWQsIChlcnIsIHJvd3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGluc2VydCA9IGRiLnByZXBhcmUoRGIucXVlcnlfaW5zZXJ0X2thbG1hbl9lc3RpbWF0ZXMpO1xuICAgICAgICAgICAgY29uc3QgdXBkYXRlID0gZGIucHJlcGFyZShEYi5xdWVyeV91cGRhdGVfa2FsbWFuX2VzdGltYXRlcyk7XG5cbiAgICAgICAgICAgIGlmKGVycikge1xuICAgICAgICAgICAgICAgIGxvZy5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IGRvbmUgPSAwO1xuICAgICAgICAgICAgcm93cy5mb3JFYWNoKChyb3cpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgayA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmIChrYWxtYW5bcm93LmZwX2lkICsgcm93LmFwX2lkICsgcm93LnggKyByb3cueV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBrYWxtYW5bcm93LmZwX2lkICsgcm93LmFwX2lkICsgcm93LnggKyByb3cueV0gPSBuZXcgS2FsbWFuRmlsdGVyKHJvdy5jZXN0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgayA9IGthbG1hbltyb3cuZnBfaWQgKyByb3cuYXBfaWQgKyByb3cueCArIHJvdy55XTtcblxuICAgICAgICAgICAgICAgIGxldCB2YWx1ZXMgPSByb3cudmFsdWVzXG4gICAgICAgICAgICAgICAgICAgIC5zcGxpdChcIixcIilcbiAgICAgICAgICAgICAgICAgICAgLm1hcCgoZWwpID0+IHsgcmV0dXJuIE51bWJlcihlbCk7IH0pO1xuXG4gICAgICAgICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHZhbHVlcy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICAgICAgICAgIGsuYWRkU2FtcGxlKHZhbHVlc1tpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGluc2VydC5ydW4ocm93LmZwX2lkLCByb3cuYXBfaWQsIHJvdy54LCByb3cueSwgay5nZXRFc3RpbWF0ZSgpLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZS5ydW4oay5nZXRFc3RpbWF0ZSgpLCByb3cuZnBfaWQsIHJvdy5hcF9pZCwgcm93LngsIHJvdy55LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb25lKys7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihkb25lID49IHJvd3MubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnNlcnQuZmluYWxpemUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGUuZmluYWxpemUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYi5zZXJpYWxpemUoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYi5ydW4oXCJkZWxldGUgZnJvbSBmZWF0dXJlcyB3aGVyZSBmcF9pZCA9ID9cIiwgZnBfaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYi5ydW4oRGIucXVlcnlfdXBkYXRlX2ZlYXR1cmVzLCBmcF9pZCwgZnBfaWQsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNiKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBEYjsiXX0=
//# sourceMappingURL=Db.js.map
