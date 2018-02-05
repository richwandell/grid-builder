'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _KalmanFilter = require('./KalmanFilter');

var _KalmanFilter2 = _interopRequireDefault(_KalmanFilter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var sqlite3 = require('sqlite3').verbose();
var LinearInterpolate = require('everpolate').linear;

var Db = function () {
    function Db(log) {
        var _this = this;

        var database = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "db.sqlite3";

        _classCallCheck(this, Db);

        this.log = log;
        this.log.debug("Db.constructor");

        this.db = new sqlite3.cached.Database('db/' + database);

        this.createTables(this.db, function () {
            _this.db.serialize(function () {
                _this.db.exec("PRAGMA journal_mode = WAL;");
                _this.db.exec("PRAGMA cache_size = 4096000;");
                _this.db.exec("PRAGMA optimize;");
                _this.db.exec("PRAGMA busy_timeout = 150000;");
            });
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
                case 5:
                    db.serialize(function () {
                        Db.migration6.forEach(function (mig) {
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
    }, {
        key: 'interpolate',
        value: function interpolate(fp_id) {
            var _this8 = this;

            this.interpolateX(fp_id).then(function () {
                return _this8.interpolateY(fp_id);
            });
        }
    }, {
        key: 'interpolateX',
        value: function interpolateX(fp_id) {
            var _this9 = this;

            console.log("interpolateX");
            return new Promise(function (resolve, reject) {
                var insert = _this9.db.prepare(Db.query_insert_new_interpolated_feature);
                _this9.db.run("delete from features where fp_id = ? and interpolated = 1;", fp_id, function () {
                    _this9.db.all(Db.query_get_interpolate_count, fp_id, function (err, rows) {
                        var maxFeatureCount = 0;
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;

                        try {
                            var _loop = function _loop() {
                                var row = _step.value;

                                var feature = row.feature;
                                var feature_count = row.feature_count;
                                if (feature_count < maxFeatureCount) {
                                    return 'break';
                                }
                                maxFeatureCount = feature_count;

                                _this9.db.all(Db.query_get_interpolate_individual_feature, feature, fp_id, function (err, rows) {
                                    var rowMap = {};
                                    var _iteratorNormalCompletion2 = true;
                                    var _didIteratorError2 = false;
                                    var _iteratorError2 = undefined;

                                    try {
                                        for (var _iterator2 = rows[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                            var iRow = _step2.value;

                                            if (typeof rowMap[iRow.x] === "undefined") {
                                                rowMap[iRow.x] = [[], []];
                                            }

                                            rowMap[iRow.x][0].push(iRow.y);
                                            rowMap[iRow.x][1].push(iRow.value);
                                        }
                                    } catch (err) {
                                        _didIteratorError2 = true;
                                        _iteratorError2 = err;
                                    } finally {
                                        try {
                                            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                                _iterator2.return();
                                            }
                                        } finally {
                                            if (_didIteratorError2) {
                                                throw _iteratorError2;
                                            }
                                        }
                                    }

                                    var _loop2 = function _loop2(xVal) {
                                        var xVals = rowMap[xVal][0];
                                        var yVals = rowMap[xVal][1];
                                        var unKnownVals = [];
                                        var minVal = Math.min.apply(Math, _toConsumableArray(xVals));
                                        var maxVal = Math.max.apply(Math, _toConsumableArray(xVals));
                                        for (var _i = minVal; _i < maxVal; _i++) {
                                            if (xVals.indexOf(_i) === -1) {
                                                unKnownVals.push(_i);
                                            }
                                        }
                                        var nowKnown = LinearInterpolate(unKnownVals, xVals, yVals);
                                        var i = 0;
                                        var done = 0;
                                        var _iteratorNormalCompletion3 = true;
                                        var _didIteratorError3 = false;
                                        var _iteratorError3 = undefined;

                                        try {
                                            for (var _iterator3 = unKnownVals[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                                var unknownY = _step3.value;

                                                insert.run(fp_id, xVal, unknownY, feature, nowKnown[i], function () {
                                                    done++;
                                                    if (done === nowKnown.length) {
                                                        resolve();
                                                    }
                                                });
                                                i++;
                                            }
                                        } catch (err) {
                                            _didIteratorError3 = true;
                                            _iteratorError3 = err;
                                        } finally {
                                            try {
                                                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                                    _iterator3.return();
                                                }
                                            } finally {
                                                if (_didIteratorError3) {
                                                    throw _iteratorError3;
                                                }
                                            }
                                        }
                                    };

                                    for (var xVal in rowMap) {
                                        _loop2(xVal);
                                    }
                                });
                            };

                            for (var _iterator = rows[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var _ret = _loop();

                                if (_ret === 'break') break;
                            }
                        } catch (err) {
                            _didIteratorError = true;
                            _iteratorError = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion && _iterator.return) {
                                    _iterator.return();
                                }
                            } finally {
                                if (_didIteratorError) {
                                    throw _iteratorError;
                                }
                            }
                        }
                    });
                });
            });
        }
    }, {
        key: 'interpolateY',
        value: function interpolateY(fp_id) {
            var _this10 = this;

            console.log("interpolateY");
            return new Promise(function (resolve, reject) {
                var insert = _this10.db.prepare(Db.query_insert_new_interpolated_feature);
                _this10.db.all(Db.query_get_interpolate_count, fp_id, function (err, rows) {
                    var maxFeatureCount = 0;
                    var _iteratorNormalCompletion4 = true;
                    var _didIteratorError4 = false;
                    var _iteratorError4 = undefined;

                    try {
                        var _loop3 = function _loop3() {
                            var row = _step4.value;

                            var feature = row.feature;
                            var feature_count = row.feature_count;
                            if (feature_count < maxFeatureCount) {
                                return 'break';
                            }
                            maxFeatureCount = feature_count;

                            _this10.db.all(Db.query_get_interpolate_individual_feature, feature, fp_id, function (err, rows) {
                                var rowMap = {};
                                var _iteratorNormalCompletion5 = true;
                                var _didIteratorError5 = false;
                                var _iteratorError5 = undefined;

                                try {
                                    for (var _iterator5 = rows[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                                        var iRow = _step5.value;

                                        if (typeof rowMap[iRow.y] === "undefined") {
                                            rowMap[iRow.y] = [[], []];
                                        }

                                        rowMap[iRow.y][0].push(iRow.x);
                                        rowMap[iRow.y][1].push(iRow.value);
                                    }
                                } catch (err) {
                                    _didIteratorError5 = true;
                                    _iteratorError5 = err;
                                } finally {
                                    try {
                                        if (!_iteratorNormalCompletion5 && _iterator5.return) {
                                            _iterator5.return();
                                        }
                                    } finally {
                                        if (_didIteratorError5) {
                                            throw _iteratorError5;
                                        }
                                    }
                                }

                                var _loop4 = function _loop4(yVal) {
                                    var xVals = rowMap[yVal][0];
                                    var yVals = rowMap[yVal][1];

                                    var unKnownVals = [];
                                    var minVal = Math.min.apply(Math, _toConsumableArray(xVals));
                                    var maxVal = Math.max.apply(Math, _toConsumableArray(xVals));
                                    for (var _i2 = minVal; _i2 < maxVal; _i2++) {
                                        if (xVals.indexOf(_i2) === -1) {
                                            unKnownVals.push(_i2);
                                        }
                                    }
                                    var nowKnown = LinearInterpolate(unKnownVals, xVals, yVals);
                                    var i = 0;
                                    var done = 0;
                                    var _iteratorNormalCompletion6 = true;
                                    var _didIteratorError6 = false;
                                    var _iteratorError6 = undefined;

                                    try {
                                        for (var _iterator6 = unKnownVals[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                                            var unknownX = _step6.value;

                                            insert.run(fp_id, unknownX, yVal, feature, nowKnown[i], function () {
                                                done++;
                                                if (done === nowKnown.length) {
                                                    resolve();
                                                }
                                            });
                                            i++;
                                        }
                                    } catch (err) {
                                        _didIteratorError6 = true;
                                        _iteratorError6 = err;
                                    } finally {
                                        try {
                                            if (!_iteratorNormalCompletion6 && _iterator6.return) {
                                                _iterator6.return();
                                            }
                                        } finally {
                                            if (_didIteratorError6) {
                                                throw _iteratorError6;
                                            }
                                        }
                                    }
                                };

                                for (var yVal in rowMap) {
                                    _loop4(yVal);
                                }
                            });
                        };

                        for (var _iterator4 = rows[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                            var _ret3 = _loop3();

                            if (_ret3 === 'break') break;
                        }
                    } catch (err) {
                        _didIteratorError4 = true;
                        _iteratorError4 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion4 && _iterator4.return) {
                                _iterator4.return();
                            }
                        } finally {
                            if (_didIteratorError4) {
                                throw _iteratorError4;
                            }
                        }
                    }
                });
            });
        }
    }]);

    return Db;
}();

Db.database_code_version = 6;
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
Db.migration6 = ["ALTER TABLE features ADD interpolated INTEGER DEFAULT 0 NOT NULL;", "CREATE INDEX features_interpolated_index ON features (interpolated);", "update settings set value = '" + Db.database_code_version + "' where key = 'database_code_version';"];
Db.query_get_interpolate_count = '\n    SELECT\n      f.feature, count(f.feature) as feature_count\n    from\n      features f\n      join layout_images li on f.fp_id = li.id\n    where\n      li.id = ?      \n    group by\n      f.feature\n    order by\n      feature_count desc\n    ';
Db.query_get_interpolate_individual_feature = '\n    select\n      *\n    from\n      features f\n    where\n      f.feature = ?\n      and fp_id = ?\n    order by\n      f.x asc, f.y asc;\n    ';
Db.query_insert_new_interpolated_feature = '\n    insert into features (fp_id, x, y, feature, value, interpolated)\n    values (?, ?, ?, ?, ?, 1);\n    ';


module.exports = Db;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvRGIuZXM2Il0sIm5hbWVzIjpbInNxbGl0ZTMiLCJyZXF1aXJlIiwidmVyYm9zZSIsIkxpbmVhckludGVycG9sYXRlIiwibGluZWFyIiwiRGIiLCJsb2ciLCJkYXRhYmFzZSIsImRlYnVnIiwiZGIiLCJjYWNoZWQiLCJEYXRhYmFzZSIsImNyZWF0ZVRhYmxlcyIsInNlcmlhbGl6ZSIsImV4ZWMiLCJmZWF0dXJlc0NhY2hlIiwiZnBfaWQiLCJ1bmRlZmluZWQiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImFsbCIsImVyciIsInJvd3MiLCJsZW5ndGgiLCJ4IiwieSIsImZlYXR1cmUiLCJ2YWx1ZSIsImkiLCJjb29yZCIsIkpTT04iLCJzdHJpbmdpZnkiLCJPYmplY3QiLCJrZXlzIiwiZnAiLCJjIiwiZGF0YWJhc2VDb2RlVmVyc2lvbiIsImNiIiwibWlncmF0aW9uMSIsImZvckVhY2giLCJtaWciLCJydW4iLCJtaWdyYXRpb24yIiwibWlncmF0aW9uMyIsIm1pZ3JhdGlvbjQiLCJtaWdyYXRpb241IiwibWlncmF0aW9uNiIsImNyZWF0ZXMiLCJjcmVhdGUiLCJyb3ciLCJrZXkiLCJOdW1iZXIiLCJkYXRhYmFzZV9jb2RlX3ZlcnNpb24iLCJkb1VwZ3JhZGUiLCJxdWVyeV9nZXRfc2Nhbm5lZF9jb29yZHMiLCJxdWVyeV9nZXRfYWxsX2Zsb29ycGxhbnMiLCJkYXRhIiwic3RtdCIsInByZXBhcmUiLCJxdWVyeV9pbnNlcnRfdmVyc2lvbiIsImRhdGFiYXNlVmVyc2lvbiIsImZpbmFsaXplIiwicXVlcnlfdXBkYXRlX3ZlcnNpb24iLCJsYXlvdXRfaW1hZ2VzIiwicXVlcnlfaW5zZXJ0X2xheW91dCIsInVwc3RtdCIsInF1ZXJ5X3VwZGF0ZV9sYXlvdXQiLCJlbCIsImlkIiwiZmxvb3JfcGxhbl9uYW1lIiwiZmxvb3JwbGFubmFtZSIsInN0cmluZ2RhdGEiLCJwYXlsb2FkIiwicXVlcnlfaW5zZXJ0X3NjYW5fcmVzdWx0cyIsImZpbmlzaGVkIiwieHkiLCJnZXQiLCJxdWVyeV9nZXRfc2Nhbl9pZCIsInF1ZXJ5X3VwZGF0ZV9zY2FuX2lkIiwic19pZCIsImFwX2lkIiwiaW5kZXhPZiIsInB1c2giLCJvcmlnX3ZhbHVlcyIsImNyZWF0ZWQiLCJjYWxsIiwic3BsaXQiLCJ1cGRhdGVLYWxtYW4iLCJrYWxtYW4iLCJxdWVyeV9nZXRfZm9yX2thbG1hbiIsImluc2VydCIsInF1ZXJ5X2luc2VydF9rYWxtYW5fZXN0aW1hdGVzIiwidXBkYXRlIiwicXVlcnlfdXBkYXRlX2thbG1hbl9lc3RpbWF0ZXMiLCJlcnJvciIsImRvbmUiLCJrIiwiY2VzdCIsInZhbHVlcyIsIm1hcCIsImFkZFNhbXBsZSIsImdldEVzdGltYXRlIiwicXVlcnlfdXBkYXRlX2ZlYXR1cmVzIiwiY29uc29sZSIsImNsb3NlIiwiaW50ZXJwb2xhdGVYIiwidGhlbiIsImludGVycG9sYXRlWSIsInF1ZXJ5X2luc2VydF9uZXdfaW50ZXJwb2xhdGVkX2ZlYXR1cmUiLCJxdWVyeV9nZXRfaW50ZXJwb2xhdGVfY291bnQiLCJtYXhGZWF0dXJlQ291bnQiLCJmZWF0dXJlX2NvdW50IiwicXVlcnlfZ2V0X2ludGVycG9sYXRlX2luZGl2aWR1YWxfZmVhdHVyZSIsInJvd01hcCIsImlSb3ciLCJ4VmFsIiwieFZhbHMiLCJ5VmFscyIsInVuS25vd25WYWxzIiwibWluVmFsIiwiTWF0aCIsIm1pbiIsIm1heFZhbCIsIm1heCIsIm5vd0tub3duIiwidW5rbm93blkiLCJ5VmFsIiwidW5rbm93blgiLCJxdWVyeV9nZXRfZGF0YWJhc2VfdmVyc2lvbiIsInF1ZXJ5X2dldF9zY2FuX3Jlc3VsdHMiLCJxdWVyeV91cGRhdGVfb2xkZXN0X2ZlYXR1cmVzIiwicXVlcnlfZ2V0X2ZlYXR1cmVzIiwicXVlcnlfZ2V0X21pbl9zaWQiLCJkcm9wcyIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7Ozs7Ozs7O0FBRUEsSUFBSUEsVUFBVUMsUUFBUSxT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Z0IsRUFFaEIsa0NBQWtDbEMsR0FBR2dELHFCQUFyQyxHQUE2RCx3Q0FGN0MsQztBQTdFbEJoRCxFLENBa0ZLc0MsVSxHQUFhLENBQ2hCLHlDQURnQixFQUVoQixxQ0FGZ0IsRUFHaEIscUNBSGdCLEVBSWhCLHlHQUNFLDJGQUxjLEVBTWhCLDJGQU5nQixFQU9oQixxSEFQZ0IsRUFRaEIsc0JBUmdCLEVBU2hCLDhDQVRnQixFQVVoQiw0REFWZ0IsRUFXaEIsa0NBQWtDdEMsR0FBR2dELHFCQUFyQyxHQUE2RCx3Q0FYN0MsQztBQWxGbEJoRCxFLENBZ0dLdUMsVSxHQUFhLENBQ2hCLHdEQURnQixFQUVoQixrQ0FBa0N2QyxHQUFHZ0QscUJBQXJDLEdBQTZELHdDQUY3QyxDO0FBaEdsQmhELEUsQ0FxR0t3QyxVLEdBQWEsQ0FDaEIsc0JBRGdCLEVBRWhCLHdGQUNFLGdGQUhjLEVBSWhCLGtDQUFrQ3hDLEdBQUdnRCxxQkFBckMsR0FBNkQsd0NBSjdDLEM7QUFyR2xCaEQsRSxDQTRHS3lDLFUsR0FBYSxDQUNoQiw4RUFEZ0IsRUFFaEIsa0NBQWtDekMsR0FBR2dELHFCQUFyQyxHQUE2RCx3Q0FGN0MsQztBQTVHbEJoRCxFLENBaUhLMEMsVSxHQUFhLENBQ2hCLG1FQURnQixFQUVoQixzRUFGZ0IsRUFHaEIsa0NBQWtDMUMsR0FBR2dELHFCQUFyQyxHQUE2RCx3Q0FIN0MsQztBQWpIbEJoRCxFLENBMGNLeUcsMkI7QUExY0x6RyxFLENBd2RLNEcsd0M7QUF4ZEw1RyxFLENBb2VLd0cscUM7OztBQTZIWDBCLE9BQU9DLE9BQVAsR0FBaUJuSSxFQUFqQiIsImZpbGUiOiJEYi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBLYWxtYW5GaWx0ZXIgZnJvbSAnLi9LYWxtYW5GaWx0ZXInO1xuXG5sZXQgc3FsaXRlMyA9IHJlcXVpcmUoJ3NxbGl0ZTMnKS52ZXJib3NlKCk7XG5sZXQgTGluZWFySW50ZXJwb2xhdGUgPSByZXF1aXJlKCdldmVycG9sYXRlJykubGluZWFyO1xuXG5jbGFzcyBEYiB7XG5cbiAgICBzdGF0aWMgZGF0YWJhc2VfY29kZV92ZXJzaW9uID0gNjtcbiAgICBzdGF0aWMgcXVlcnlfZ2V0X2FsbF9mbG9vcnBsYW5zID0gXCJzZWxlY3QgKiBmcm9tIGxheW91dF9pbWFnZXNcIjtcbiAgICBzdGF0aWMgcXVlcnlfZ2V0X2RhdGFiYXNlX3ZlcnNpb24gPSBcInNlbGVjdCB2YWx1ZSBmcm9tIHNldHRpbmdzIHdoZXJlIGtleSA9ICdkYXRhYmFzZV92ZXJzaW9uJztcIjtcbiAgICBzdGF0aWMgcXVlcnlfaW5zZXJ0X3ZlcnNpb24gPSBcImluc2VydCBvciBpZ25vcmUgaW50byBzZXR0aW5ncyB2YWx1ZXMgKCdkYXRhYmFzZV92ZXJzaW9uJywgPyk7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X3VwZGF0ZV92ZXJzaW9uID0gXCJ1cGRhdGUgc2V0dGluZ3Mgc2V0IHZhbHVlID0gPyB3aGVyZSBrZXkgPSAnZGF0YWJhc2VfdmVyc2lvbic7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X2luc2VydF9sYXlvdXQgPSBcImluc2VydCBvciBpZ25vcmUgaW50byBsYXlvdXRfaW1hZ2VzIHZhbHVlcyAoPywgPywgPyk7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X3VwZGF0ZV9sYXlvdXQgPSBcInVwZGF0ZSBsYXlvdXRfaW1hZ2VzIHNldCBsYXlvdXRfaW1hZ2UgPSA/LCBmbG9vcl9wbGFuX25hbWUgPSA/IHdoZXJlIGlkID0gPztcIjtcbiAgICBzdGF0aWMgcXVlcnlfaW5zZXJ0X3NjYW5fcmVzdWx0cyA9IFwiaW5zZXJ0IGludG8gc2Nhbl9yZXN1bHRzIHZhbHVlcyAoPywgPywgPywgPywgPywgPywgPywgPyk7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X2dldF9zY2FuX3Jlc3VsdHMgPSBcInNlbGVjdCAqIGZyb20gc2Nhbl9yZXN1bHRzO1wiO1xuICAgIHN0YXRpYyBxdWVyeV9nZXRfZm9yX2thbG1hbiA9IFwiU0VMRUNUIHMuZnBfaWQsIHMuYXBfaWQsIHMueCwgcy55LCBcIlxuICAgICsgXCJncm91cF9jb25jYXQocy52YWx1ZSkgYHZhbHVlc2AsIFwiXG4gICAgKyBcImNhc2Ugd2hlbiBrLmthbG1hbiBpcyBudWxsIHRoZW4gYXZnKHMudmFsdWUpIGVsc2Ugay5rYWxtYW4gZW5kIGBjZXN0YCwgXCJcbiAgICArIFwiay5rYWxtYW4gRlJPTSBzY2FuX3Jlc3VsdHMgcyBsZWZ0IGpvaW4gXCJcbiAgICArIFwia2FsbWFuX2VzdGltYXRlcyBrIG9uIHMuZnBfaWQgPSBrLmZwX2lkIGFuZCBzLmFwX2lkID0gay5hcF9pZCBhbmQgcy54ID0gay54IGFuZCBzLnkgPSBrLnkgXCJcbiAgICArIFwiIHdoZXJlIHMuZnBfaWQgPSA/IGFuZCBzLnZhbHVlICE9IDAgYW5kIHMueCA9ID8gYW5kIHMueSA9ID8gR1JPVVAgQlkgcy5mcF9pZCwgcy5hcF9pZCwgcy54LCBzLnk7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X2luc2VydF9rYWxtYW5fZXN0aW1hdGVzID0gXCJpbnNlcnQgb3IgaWdub3JlIGludG8ga2FsbWFuX2VzdGltYXRlcyB2YWx1ZXMgKD8sID8sID8sID8sID8pO1wiO1xuICAgIHN0YXRpYyBxdWVyeV91cGRhdGVfa2FsbWFuX2VzdGltYXRlcyA9IFwidXBkYXRlIGthbG1hbl9lc3RpbWF0ZXMgc2V0IGthbG1hbiA9ID8gd2hlcmUgZnBfaWQgPSA/IGFuZCBhcF9pZCA9ID8gYW5kIFwiXG4gICAgKyBcIiB4ID0gPyBhbmQgeSA9ID87XCI7XG4gICAgc3RhdGljIHF1ZXJ5X3VwZGF0ZV9mZWF0dXJlcyA9IFwiaW5zZXJ0IGludG8gZmVhdHVyZXMgXCJcbiAgICArIFwiIHNlbGVjdCBrLmZwX2lkLCBrLngsIGsueSwgay5hcF9pZCB8fCBrMS5hcF9pZCBhcyBmZWF0dXJlLCBhYnMoay5rYWxtYW4gLSBrMS5rYWxtYW4pIGFzIHZhbHVlIFwiXG4gICAgKyBcIiBmcm9tIGthbG1hbl9lc3RpbWF0ZXMgayBqb2luIGthbG1hbl9lc3RpbWF0ZXMgazEgb24gay5mcF9pZCA9IGsxLmZwX2lkIGFuZCBrLnggPSBrMS54IGFuZCBrLnkgPSBrMS55XCJcbiAgICArIFwiIHdoZXJlIHZhbHVlICE9IDAgYW5kIGsuZnBfaWQgPSA/IGFuZCBrMS5mcF9pZCA9ID8gYW5kIGsueCA9ID8gYW5kIGsxLnggPSA/IGFuZCBrLnkgPSA/IGFuZCBrMS55ID0gP1wiO1xuICAgIHN0YXRpYyBxdWVyeV91cGRhdGVfb2xkZXN0X2ZlYXR1cmVzID0gXCJzZWxlY3Qgay5mcF9pZCwgay54LCBrLnksIGsuYXBfaWQgfHwgazEuYXBfaWQgYXMgZmVhdHVyZSwgXCJcbiAgICArIFwiIGFicyhrLmthbG1hbiAtIGsxLmthbG1hbikgYXMgdmFsdWUsIDpzY2FuX2lkOiBzX2lkIGZyb20ga2FsbWFuX2VzdGltYXRlcyBrIGpvaW4gXCJcbiAgICArIFwiIGthbG1hbl9lc3RpbWF0ZXMgazEgb24gay5mcF9pZCA9IGsxLmZwX2lkIGFuZCBrLnggPSBrMS54IGFuZCBrLnkgPSBrMS55IGFuZCBrLmFwX2lkIDwgazEuYXBfaWQgd2hlcmVcIlxuICAgICsgXCIgay5rYWxtYW4gIT0gMCBhbmQgazEua2FsbWFuICE9IDAgYW5kIGsuZnBfaWQgPSA/IGFuZCBrMS5mcF9pZCA9ID87XCI7XG4gICAgc3RhdGljIHF1ZXJ5X2dldF9mZWF0dXJlcyA9IFwic2VsZWN0IGYuKiwgYWJzKHZhbHVlIC0gOmZlYXR1cmVfdmFsdWU6KSBkaWZmIGZyb20gZmVhdHVyZXMgZiBcIlxuICAgICsgXCIgd2hlcmUgZi5mZWF0dXJlID0gPyBhbmQgZi5mcF9pZCA9ID8gb3JkZXIgYnkgZGlmZiBhc2M7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X2dldF9zY2FubmVkX2Nvb3JkcyA9IFwic2VsZWN0IGNvdW50KCopIGFzIG51bV9mZWF0dXJlcywgeCwgeSBmcm9tIGZlYXR1cmVzIHdoZXJlIGZwX2lkID0gPyBcIlxuICAgICsgXCIgZ3JvdXAgYnkgeCwgeTtcIjtcbiAgICBzdGF0aWMgcXVlcnlfZ2V0X21pbl9zaWQgPSBcInNlbGVjdCBtaW4oc19pZCkgZnJvbSBmZWF0dXJlcyB3aGVyZSBmcF9pZCA9ID9cIjtcbiAgICBzdGF0aWMgcXVlcnlfZ2V0X3NjYW5faWQgPSBcInNlbGVjdCB2YWx1ZSArIDEgYXMgdmFsdWUgZnJvbSBzZXR0aW5ncyB3aGVyZSBrZXkgPSAnc2Nhbl9pZCc7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X3VwZGF0ZV9zY2FuX2lkID0gXCJ1cGRhdGUgc2V0dGluZ3Mgc2V0IHZhbHVlID0gdmFsdWUgKyAxIHdoZXJlIGtleSA9ICdzY2FuX2lkJztcIjtcblxuICAgIHN0YXRpYyBjcmVhdGVzID0gW1xuICAgICAgICBcIkNSRUFURSBUQUJMRSBpZiBub3QgZXhpc3RzIGxheW91dF9pbWFnZXMgKGlkIFRFWFQgUFJJTUFSWSBLRVksIGxheW91dF9pbWFnZSBURVhUKTtcIixcbiAgICAgICAgXCJDUkVBVEUgVU5JUVVFIElOREVYIGlmIG5vdCBleGlzdHMgbGF5b3V0X2ltYWdlc19pZF91aW5kZXggT04gbGF5b3V0X2ltYWdlcyAoaWQpO1wiLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDcmVhdGUgdGhlIHNldHRpbmdzIHRhYmxlIHdpdGggZGVmYXVsdCBzZXR0aW5nc1xuICAgICAgICAgKi9cbiAgICAgICAgXCJjcmVhdGUgdGFibGUgaWYgbm90IGV4aXN0cyBzZXR0aW5ncyAoa2V5IFRFWFQgUFJJTUFSWSBLRVksIHZhbHVlIFRFWFQpO1wiLFxuICAgICAgICBcImNyZWF0ZSB1bmlxdWUgaW5kZXggaWYgbm90IGV4aXN0cyBzZXR0aW5nc19rZXkgb24gc2V0dGluZ3MgKGtleSk7XCIsXG4gICAgICAgIFwiaW5zZXJ0IG9yIGlnbm9yZSBpbnRvIHNldHRpbmdzIChrZXksIHZhbHVlKSB2YWx1ZXMgKCdkYXRhYmFzZV92ZXJzaW9uJywgMCk7XCIsXG4gICAgICAgIFwiaW5zZXJ0IG9yIGlnbm9yZSBpbnRvIHNldHRpbmdzIChrZXksIHZhbHVlKSB2YWx1ZXMgKCdkYXRhYmFzZV9jb2RlX3ZlcnNpb24nLCAwKTtcIixcblxuICAgICAgICAvKipcbiAgICAgICAgICogYXBfaWQgPSBhY2Nlc3MgcG9pbnQgaWRcbiAgICAgICAgICogZnBfaWQgPSBmbG9vcnBsYW4gaWRcbiAgICAgICAgICovXG4gICAgICAgIFwiQ1JFQVRFIFRBQkxFIGlmIG5vdCBleGlzdHMgc2Nhbl9yZXN1bHRzIFwiICtcbiAgICAgICAgXCIoc19pZCBJTlRFR0VSLCBmcF9pZCBURVhULCBhcF9pZCBURVhULCB4IElOVEVHRVIsIFwiICtcbiAgICAgICAgXCJ5IElOVEVHRVIsIHZhbHVlIFJFQUwsIG9yaWdfdmFsdWVzIFRFWFQsIGNyZWF0ZWQgVElNRVNUQU1QIERFRkFVTFQgQ1VSUkVOVF9USU1FU1RBTVAgTk9UIE5VTEwsIFwiICtcbiAgICAgICAgXCJQUklNQVJZIEtFWSAoc19pZCwgZnBfaWQsIGFwX2lkKSwgXCIgK1xuICAgICAgICBcIkNPTlNUUkFJTlQgc2Nhbl9yZXN1bHRzX2xheW91dF9pbWFnZXNfaWRfZmsgRk9SRUlHTiBLRVkgKGZwX2lkKSBSRUZFUkVOQ0VTIGxheW91dF9pbWFnZXMgKGlkKSk7XCIsXG4gICAgICAgIFwiY3JlYXRlIGluZGV4IGlmIG5vdCBleGlzdHMgeF9hbmRfeSBvbiBzY2FuX3Jlc3VsdHMgKHgsIHkpO1wiLFxuXG4gICAgICAgIFwiQ1JFQVRFIFRBQkxFIGlmIG5vdCBleGlzdHMga2FsbWFuX2VzdGltYXRlcyAoZnBfaWQgVEVYVCwgYXBfaWQgVEVYVCwgeCBJTlRFR0VSLCBcIlxuICAgICAgICArIFwieSBJTlRFR0VSLCBrYWxtYW4gUkVBTCwgXCJcbiAgICAgICAgKyBcIkNPTlNUUkFJTlQga2FsbWFuX2VzdGltYXRlc19mcF9pZF9hcF9pZF94X3lfcGsgUFJJTUFSWSBLRVkgKGZwX2lkLCBhcF9pZCwgeCwgeSksXCJcbiAgICAgICAgKyBcIkZPUkVJR04gS0VZIChhcF9pZCwgZnBfaWQsIHgsIHkpIFJFRkVSRU5DRVMgc2Nhbl9yZXN1bHRzIChhcF9pZCwgZnBfaWQsIHgsIHkpIE9OIERFTEVURSBDQVNDQURFKVwiLFxuXG4gICAgICAgIFwiQ1JFQVRFIFRBQkxFIGlmIG5vdCBleGlzdHMgZmVhdHVyZXMgKGZwX2lkIFRFWFQsIHggSU5URUdFUiwgeSBJTlRFR0VSLCBmZWF0dXJlIFRFWFQsIHZhbHVlIFJFQUwsIFwiXG4gICAgICAgICsgXCIgQ09OU1RSQUlOVCBmZWF0dXJlc19mcF9pZF94X3lfZmVhdHVyZV9wayBQUklNQVJZIEtFWSAoZnBfaWQsIHgsIHksIGZlYXR1cmUpKTtcIixcbiAgICAgICAgXCJDUkVBVEUgVU5JUVVFIElOREVYIGlmIG5vdCBleGlzdHMgZmVhdHVyZXNfZmVhdHVyZV9pbmRleDEgT04gZmVhdHVyZXMoZnBfaWQsZmVhdHVyZSx4LHkpO1wiLFxuICAgICAgICBcIkNSRUFURSBJTkRFWCBpZiBub3QgZXhpc3RzIGZlYXR1cmVzX2ZlYXR1cmVfaW5kZXgyIE9OIGZlYXR1cmVzKGZlYXR1cmUpO1wiXG4gICAgXTtcblxuICAgIHN0YXRpYyBkcm9wcyA9IFtcbiAgICAgICAgXCJkcm9wIHRhYmxlIGlmIGV4aXN0cyBsYXlvdXRfaW1hZ2VzO1wiLFxuICAgICAgICBcImRyb3AgdGFibGUgaWYgZXhpc3RzIHNldHRpbmdzO1wiLFxuICAgICAgICBcImRyb3AgdGFibGUgaWYgZXhpc3RzIHNjYW5fcmVzdWx0cztcIixcbiAgICAgICAgXCJkcm9wIHRhYmxlIGlmIGV4aXN0cyBrYWxtYW5fZXN0aW1hdGVzO1wiXG4gICAgXTtcblxuICAgIHN0YXRpYyBtaWdyYXRpb24xID0gW1xuICAgICAgICBcIkFMVEVSIFRBQkxFIGxheW91dF9pbWFnZXMgQUREIGZsb29yX3BsYW5fbmFtZSBURVhUIE5VTEw7XCIsXG4gICAgICAgIFwidXBkYXRlIHNldHRpbmdzIHNldCB2YWx1ZSA9ICdcIiArIERiLmRhdGFiYXNlX2NvZGVfdmVyc2lvbiArIFwiJyB3aGVyZSBrZXkgPSAnZGF0YWJhc2VfY29kZV92ZXJzaW9uJztcIlxuICAgIF07XG5cbiAgICBzdGF0aWMgbWlncmF0aW9uMiA9IFtcbiAgICAgICAgXCJBTFRFUiBUQUJMRSBmZWF0dXJlcyBBREQgc19pZCBJTlQgTlVMTDtcIixcbiAgICAgICAgXCJEUk9QIElOREVYIGZlYXR1cmVzX2ZlYXR1cmVfaW5kZXgxO1wiLFxuICAgICAgICBcIkRST1AgSU5ERVggZmVhdHVyZXNfZmVhdHVyZV9pbmRleDI7XCIsXG4gICAgICAgIFwiQ1JFQVRFIFRBQkxFIGZlYXR1cmVzYThkMSAoZnBfaWQgVEVYVCwgeCBJTlRFR0VSLCB5IElOVEVHRVIsIGZlYXR1cmUgVEVYVCwgdmFsdWUgUkVBTCwgc19pZCBJTlRFR0VSLFwiXG4gICAgICAgICsgXCIgQ09OU1RSQUlOVCBmZWF0dXJlc19mcF9pZF94X3lfZmVhdHVyZV9zX2lkX3BrIFBSSU1BUlkgS0VZIChmcF9pZCwgeCwgeSwgZmVhdHVyZSwgc19pZCkpO1wiLFxuICAgICAgICBcIkNSRUFURSBVTklRVUUgSU5ERVggZmVhdHVyZXNfZmVhdHVyZV9pbmRleDEgT04gZmVhdHVyZXNhOGQxIChmcF9pZCwgZmVhdHVyZSwgeCwgeSwgc19pZCk7XCIsXG4gICAgICAgIFwiSU5TRVJUIElOVE8gZmVhdHVyZXNhOGQxKGZwX2lkLCB4LCB5LCBmZWF0dXJlLCB2YWx1ZSwgc19pZCkgU0VMRUNUIGZwX2lkLCB4LCB5LCBmZWF0dXJlLCB2YWx1ZSwgc19pZCBGUk9NIGZlYXR1cmVzO1wiLFxuICAgICAgICBcIkRST1AgVEFCTEUgZmVhdHVyZXM7XCIsXG4gICAgICAgIFwiQUxURVIgVEFCTEUgZmVhdHVyZXNhOGQxIFJFTkFNRSBUTyBmZWF0dXJlcztcIixcbiAgICAgICAgXCJDUkVBVEUgSU5ERVggZmVhdHVyZXNfZmVhdHVyZV9pbmRleDIgT04gZmVhdHVyZXMoZmVhdHVyZSk7XCIsXG4gICAgICAgIFwidXBkYXRlIHNldHRpbmdzIHNldCB2YWx1ZSA9ICdcIiArIERiLmRhdGFiYXNlX2NvZGVfdmVyc2lvbiArIFwiJyB3aGVyZSBrZXkgPSAnZGF0YWJhc2VfY29kZV92ZXJzaW9uJztcIlxuICAgIF07XG5cbiAgICBzdGF0aWMgbWlncmF0aW9uMyA9IFtcbiAgICAgICAgXCJpbnNlcnQgb3IgaWdub3JlIGludG8gc2V0dGluZ3MgdmFsdWVzICgnc2Nhbl9pZCcsIDY0KTtcIixcbiAgICAgICAgXCJ1cGRhdGUgc2V0dGluZ3Mgc2V0IHZhbHVlID0gJ1wiICsgRGIuZGF0YWJhc2VfY29kZV92ZXJzaW9uICsgXCInIHdoZXJlIGtleSA9ICdkYXRhYmFzZV9jb2RlX3ZlcnNpb24nO1wiXG4gICAgXTtcblxuICAgIHN0YXRpYyBtaWdyYXRpb240ID0gW1xuICAgICAgICBcImRyb3AgdGFibGUgZmVhdHVyZXM7XCIsXG4gICAgICAgIFwiQ1JFQVRFIFRBQkxFIGZlYXR1cmVzIChmcF9pZCBURVhULCB4IElOVEVHRVIsIHkgSU5URUdFUiwgZmVhdHVyZSBURVhULCB2YWx1ZSBSRUFMLCBcIlxuICAgICAgICArIFwiIENPTlNUUkFJTlQgZmVhdHVyZXNfZnBfaWRfeF95X2ZlYXR1cmVfcGsgUFJJTUFSWSBLRVkgKGZwX2lkLCB4LCB5LCBmZWF0dXJlKSk7XCIsXG4gICAgICAgIFwidXBkYXRlIHNldHRpbmdzIHNldCB2YWx1ZSA9ICdcIiArIERiLmRhdGFiYXNlX2NvZGVfdmVyc2lvbiArIFwiJyB3aGVyZSBrZXkgPSAnZGF0YWJhc2VfY29kZV92ZXJzaW9uJztcIlxuICAgIF07XG5cbiAgICBzdGF0aWMgbWlncmF0aW9uNSA9IFtcbiAgICAgICAgXCJDUkVBVEUgSU5ERVggaWYgbm90IGV4aXN0cyBzY2FuX3Jlc3VsdHNfZnBfaWRfaW5kZXggT04gc2Nhbl9yZXN1bHRzIChmcF9pZCk7XCIsXG4gICAgICAgIFwidXBkYXRlIHNldHRpbmdzIHNldCB2YWx1ZSA9ICdcIiArIERiLmRhdGFiYXNlX2NvZGVfdmVyc2lvbiArIFwiJyB3aGVyZSBrZXkgPSAnZGF0YWJhc2VfY29kZV92ZXJzaW9uJztcIlxuICAgIF07XG5cbiAgICBzdGF0aWMgbWlncmF0aW9uNiA9IFtcbiAgICAgICAgXCJBTFRFUiBUQUJMRSBmZWF0dXJlcyBBREQgaW50ZXJwb2xhdGVkIElOVEVHRVIgREVGQVVMVCAwIE5PVCBOVUxMO1wiLFxuICAgICAgICBcIkNSRUFURSBJTkRFWCBmZWF0dXJlc19pbnRlcnBvbGF0ZWRfaW5kZXggT04gZmVhdHVyZXMgKGludGVycG9sYXRlZCk7XCIsXG4gICAgICAgIFwidXBkYXRlIHNldHRpbmdzIHNldCB2YWx1ZSA9ICdcIiArIERiLmRhdGFiYXNlX2NvZGVfdmVyc2lvbiArIFwiJyB3aGVyZSBrZXkgPSAnZGF0YWJhc2VfY29kZV92ZXJzaW9uJztcIlxuICAgIF07XG5cbiAgICBjb25zdHJ1Y3Rvcihsb2csIGRhdGFiYXNlID0gXCJkYi5zcWxpdGUzXCIpe1xuICAgICAgICB0aGlzLmxvZyA9IGxvZztcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoXCJEYi5jb25zdHJ1Y3RvclwiKTtcblxuICAgICAgICB0aGlzLmRiID0gbmV3IHNxbGl0ZTMuY2FjaGVkLkRhdGFiYXNlKGBkYi8ke2RhdGFiYXNlfWApO1xuXG4gICAgICAgIHRoaXMuY3JlYXRlVGFibGVzKHRoaXMuZGIsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZGIuc2VyaWFsaXplKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmRiLmV4ZWMoXCJQUkFHTUEgam91cm5hbF9tb2RlID0gV0FMO1wiKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRiLmV4ZWMoXCJQUkFHTUEgY2FjaGVfc2l6ZSA9IDQwOTYwMDA7XCIpO1xuICAgICAgICAgICAgICAgIHRoaXMuZGIuZXhlYyhcIlBSQUdNQSBvcHRpbWl6ZTtcIik7XG4gICAgICAgICAgICAgICAgdGhpcy5kYi5leGVjKFwiUFJBR01BIGJ1c3lfdGltZW91dCA9IDE1MDAwMDtcIik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZmVhdHVyZXNDYWNoZSA9IHt9O1xuICAgIH1cblxuICAgIGNsZWFyRmVhdHVyZXNDYWNoZShmcF9pZCl7XG4gICAgICAgIHRoaXMuZmVhdHVyZXNDYWNoZVtmcF9pZF0gPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZnBfaWRcbiAgICAgKi9cbiAgICBjcmVhdGVGZWF0dXJlc0NhY2hlKGZwX2lkKXtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblxuICAgICAgICAgICAgaWYodGhpcy5mZWF0dXJlc0NhY2hlW2ZwX2lkXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZGIuYWxsKFwic2VsZWN0ICogZnJvbSBmZWF0dXJlcyB3aGVyZSBmcF9pZCA9ID87XCIsIGZwX2lkLCAoZXJyLCByb3dzKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBsZW5ndGggPSByb3dzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBsZXQgZnBfaWQsIHgsIHksIGZlYXR1cmUsIHZhbHVlO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgZnBfaWQgPSByb3dzW2ldLmZwX2lkO1xuICAgICAgICAgICAgICAgICAgICB4ID0gcm93c1tpXS54O1xuICAgICAgICAgICAgICAgICAgICB5ID0gcm93c1tpXS55O1xuICAgICAgICAgICAgICAgICAgICBmZWF0dXJlID0gcm93c1tpXS5mZWF0dXJlO1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHJvd3NbaV0udmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmZlYXR1cmVzQ2FjaGVbZnBfaWRdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZmVhdHVyZXNDYWNoZVtmcF9pZF0gPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBsZXQgY29vcmQgPSB4ICsgXCJfXCIgKyB5O1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5mZWF0dXJlc0NhY2hlW2ZwX2lkXVtjb29yZF0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mZWF0dXJlc0NhY2hlW2ZwX2lkXVtjb29yZF0gPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmVhdHVyZXNDYWNoZVtmcF9pZF1bY29vcmRdW2ZlYXR1cmVdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMubG9nLmxvZyhcIkZlYXR1cmVzIENhY2hlIGNyZWF0ZWQ6IFwiICsgSlNPTi5zdHJpbmdpZnkoT2JqZWN0LmtleXModGhpcy5mZWF0dXJlc0NhY2hlKSkpO1xuICAgICAgICAgICAgICAgIGlmIChyZXNvbHZlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0RmVhdHVyZXNDYWNoZShmcF9pZCl7XG4gICAgICAgIGlmKHRoaXMuZmVhdHVyZXNDYWNoZVtmcF9pZF0gPT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmVhdHVyZXNDYWNoZVtmcF9pZF07XG4gICAgfVxuXG4gICAgZ2V0RmVhdHVyZVZhbHVlKGZwX2lkLCBjb29yZCwgZmVhdHVyZSl7XG4gICAgICAgIGlmKHRoaXMuZmVhdHVyZXNDYWNoZVtmcF9pZF0gPT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYodGhpcy5mZWF0dXJlc0NhY2hlW2ZwX2lkXVtjb29yZF0gPT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYodGhpcy5mZWF0dXJlc0NhY2hlW2ZwX2lkXVtjb29yZF1bZmVhdHVyZV0gPT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmVhdHVyZXNDYWNoZVtmcF9pZF1bY29vcmRdW2ZlYXR1cmVdO1xuICAgIH1cblxuICAgIGdldEZlYXR1cmVOdW1iZXIoZnBfaWQsIGNvb3JkKSB7XG4gICAgICAgIGxldCBmcCwgYztcbiAgICAgICAgaWYodGhpcy5mZWF0dXJlc0NhY2hlW2ZwX2lkXSA9PT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9XG4gICAgICAgIGZwID0gdGhpcy5mZWF0dXJlc0NhY2hlW2ZwX2lkXTtcbiAgICAgICAgaWYoZnBbY29vcmRdID09PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgIH1cbiAgICAgICAgYyA9IGZwW2Nvb3JkXTtcbiAgICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKGMpO1xuICAgICAgICByZXR1cm4ga2V5cy5sZW5ndGg7XG4gICAgfVxuXG4gICAgZ2V0RGF0YWJhc2UoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGI7XG4gICAgfVxuXG4gICAgZG9VcGdyYWRlKGRiLCBkYXRhYmFzZUNvZGVWZXJzaW9uLCBjYikge1xuICAgICAgICB0aGlzLmxvZy5kZWJ1ZyhcIkRiLmRvVXBncmFkZVwiKTtcblxuICAgICAgICBzd2l0Y2goZGF0YWJhc2VDb2RlVmVyc2lvbil7XG4gICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgZGIuc2VyaWFsaXplKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgRGIubWlncmF0aW9uMS5mb3JFYWNoKChtaWcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRiLnJ1bihtaWcpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVUYWJsZXMoZGIsIGNiKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgIGRiLnNlcmlhbGl6ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIERiLm1pZ3JhdGlvbjIuZm9yRWFjaCgobWlnKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYi5ydW4obWlnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlVGFibGVzKGRiLCBjYik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICBkYi5zZXJpYWxpemUoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBEYi5taWdyYXRpb24zLmZvckVhY2goKG1pZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGIucnVuKG1pZyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVRhYmxlcyhkYiwgY2IpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgZGIuc2VyaWFsaXplKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgRGIubWlncmF0aW9uNC5mb3JFYWNoKChtaWcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRiLnJ1bihtaWcpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVUYWJsZXMoZGIsIGNiKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgICAgIGRiLnNlcmlhbGl6ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIERiLm1pZ3JhdGlvbjUuZm9yRWFjaCgobWlnKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYi5ydW4obWlnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlVGFibGVzKGRiLCBjYik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDU6XG4gICAgICAgICAgICAgICAgZGIuc2VyaWFsaXplKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgRGIubWlncmF0aW9uNi5mb3JFYWNoKChtaWcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRiLnJ1bihtaWcpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVUYWJsZXMoZGIsIGNiKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNyZWF0ZVRhYmxlcyhkYiwgY2IpIHtcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoXCJEYi5jcmVhdGVUYWJsZXNcIik7XG4gICAgICAgIGxldCBjcmVhdGVzID0gRGIuY3JlYXRlcztcblxuICAgICAgICBkYi5zZXJpYWxpemUoKCkgPT4ge1xuICAgICAgICAgICAgY3JlYXRlcy5mb3JFYWNoKGZ1bmN0aW9uKGNyZWF0ZSl7XG4gICAgICAgICAgICAgICAgZGIucnVuKGNyZWF0ZSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgbGV0IGRhdGFiYXNlQ29kZVZlcnNpb24gPSAwO1xuXG4gICAgICAgICAgICBkYi5hbGwoXCJzZWxlY3QgKiBmcm9tIHNldHRpbmdzXCIsIChlcnIsIHJvd3MpID0+IHtcbiAgICAgICAgICAgICAgICByb3dzLmZvckVhY2goZnVuY3Rpb24ocm93KXtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoKHJvdy5rZXkpe1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcImRhdGFiYXNlX2NvZGVfdmVyc2lvblwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFiYXNlQ29kZVZlcnNpb24gPSBOdW1iZXIocm93LnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmKGRhdGFiYXNlQ29kZVZlcnNpb24gPCBEYi5kYXRhYmFzZV9jb2RlX3ZlcnNpb24pe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRvVXBncmFkZShkYiwgZGF0YWJhc2VDb2RlVmVyc2lvbiwgY2IpO1xuICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICBpZihjYikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2IoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXRTY2FubmVkQ29vcmRzKGZwX2lkLCBjYil7XG4gICAgICAgIHRoaXMubG9nLmRlYnVnKFwiRGIuZ2V0U2Nhbm5lZENvb3Jkc1wiKTtcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgZGIuYWxsKERiLnF1ZXJ5X2dldF9zY2FubmVkX2Nvb3JkcywgZnBfaWQsIGNiKTtcbiAgICB9XG5cbiAgICBnZXRGbG9vclBsYW5zKGNiKSB7XG4gICAgICAgIHRoaXMubG9nLmRlYnVnKFwiRGIuZ2V0Rmxvb3JQbGFuc1wiKTtcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgZGIuYWxsKERiLnF1ZXJ5X2dldF9hbGxfZmxvb3JwbGFucywgY2IpO1xuICAgIH1cblxuICAgIHVwZGF0ZURhdGFiYXNlKGRhdGEsIGNiKSB7XG4gICAgICAgIHRoaXMubG9nLmRlYnVnKFwiRGIudXBkYXRlRGF0YWJhc2VcIik7XG4gICAgICAgIGxldCBkYiA9IHRoaXMuZGI7XG4gICAgICAgIGxldCBzdG10ID0gZGIucHJlcGFyZShEYi5xdWVyeV9pbnNlcnRfdmVyc2lvbik7XG4gICAgICAgIHN0bXQucnVuKGRhdGEuZGF0YWJhc2VWZXJzaW9uKTtcbiAgICAgICAgc3RtdC5maW5hbGl6ZSgpO1xuXG4gICAgICAgIHN0bXQgPSBkYi5wcmVwYXJlKERiLnF1ZXJ5X3VwZGF0ZV92ZXJzaW9uKTtcbiAgICAgICAgc3RtdC5ydW4oZGF0YS5kYXRhYmFzZVZlcnNpb24pO1xuICAgICAgICBzdG10LmZpbmFsaXplKCk7XG5cbiAgICAgICAgaWYodHlwZW9mKGRhdGEubGF5b3V0X2ltYWdlcykgIT0gXCJ1bmRlZmluZWRcIiAmJiBkYXRhLmxheW91dF9pbWFnZXMubGVuZ3RoID4gMCl7XG4gICAgICAgICAgICBzdG10ID0gZGIucHJlcGFyZShEYi5xdWVyeV9pbnNlcnRfbGF5b3V0KTtcbiAgICAgICAgICAgIGxldCB1cHN0bXQgPSBkYi5wcmVwYXJlKERiLnF1ZXJ5X3VwZGF0ZV9sYXlvdXQpO1xuXG4gICAgICAgICAgICBkYXRhLmxheW91dF9pbWFnZXMuZm9yRWFjaChmdW5jdGlvbihlbCl7XG4gICAgICAgICAgICAgICAgbGV0IGlkID0gZWwuaWQ7XG4gICAgICAgICAgICAgICAgbGV0IGZsb29yX3BsYW5fbmFtZSA9IGVsLmZsb29ycGxhbm5hbWU7XG4gICAgICAgICAgICAgICAgbGV0IHN0cmluZ2RhdGEgPSBKU09OLnN0cmluZ2lmeShlbCk7XG4gICAgICAgICAgICAgICAgc3RtdC5ydW4oaWQsIHN0cmluZ2RhdGEsIGZsb29yX3BsYW5fbmFtZSk7XG4gICAgICAgICAgICAgICAgdXBzdG10LnJ1bihzdHJpbmdkYXRhLCBmbG9vcl9wbGFuX25hbWUsIGlkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc3RtdC5maW5hbGl6ZSgpO1xuICAgICAgICAgICAgdXBzdG10LmZpbmFsaXplKCk7XG4gICAgICAgIH1cblxuICAgICAgICBjYigpO1xuICAgIH1cblxuICAgIHNhdmVSZWFkaW5ncyhwYXlsb2FkLCBjYil7XG4gICAgICAgIGxldCBsb2cgPSB0aGlzLmxvZztcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgbG9nLmRlYnVnKFwiRGIuc2F2ZVJlYWRpbmdzXCIpO1xuXG4gICAgICAgIGxldCBzdG10ID0gZGIucHJlcGFyZShEYi5xdWVyeV9pbnNlcnRfc2Nhbl9yZXN1bHRzKTtcbiAgICAgICAgbGV0IGZpbmlzaGVkID0gMDtcbiAgICAgICAgbGV0IHh5ID0gW107XG4gICAgICAgIHBheWxvYWQuZm9yRWFjaCgoZWwpID0+IHtcbiAgICAgICAgICAgIGRiLmdldChEYi5xdWVyeV9nZXRfc2Nhbl9pZCwgKGVyciwgcm93KSA9PiB7XG4gICAgICAgICAgICAgICAgZGIucnVuKERiLnF1ZXJ5X3VwZGF0ZV9zY2FuX2lkLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNfaWQgPSBOdW1iZXIocm93LnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZnBfaWQgPSBlbC5mcF9pZDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYXBfaWQgPSBlbC5hcF9pZDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgeCA9IE51bWJlcihlbC54KTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgeSA9IE51bWJlcihlbC55KTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qga2V5ID0geCArIFwiX1wiICsgeTtcbiAgICAgICAgICAgICAgICAgICAgaWYoeHkuaW5kZXhPZihrZXkpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgeHkucHVzaChrZXkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gTnVtYmVyKGVsLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgb3JpZ192YWx1ZXMgPSBlbC5vcmlnX3ZhbHVlcztcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY3JlYXRlZCA9IGVsLmNyZWF0ZWQ7XG4gICAgICAgICAgICAgICAgICAgIHN0bXQucnVuKHNfaWQsIGZwX2lkLCBhcF9pZCwgeCwgeSwgdmFsdWUsIG9yaWdfdmFsdWVzLCBjcmVhdGVkLCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaW5pc2hlZCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpbmlzaGVkID49IHBheWxvYWQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RtdC5maW5hbGl6ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHh5LmZvckVhY2goKGNvb3JkLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNhbGwgPSBpID09PSAoeHkubGVuZ3RoIC0xKSA/IGNiIDogKCkgPT4ge307XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IFt4LCB5XSA9IGNvb3JkLnNwbGl0KFwiX1wiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVLYWxtYW4oZnBfaWQsIE51bWJlcih4KSwgTnVtYmVyKHkpLCBjYWxsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdXBkYXRlS2FsbWFuKGZwX2lkLCB4LCB5LCBjYil7XG4gICAgICAgIGxldCBsb2cgPSB0aGlzLmxvZztcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgbGV0IGthbG1hbiA9IHt9O1xuXG4gICAgICAgIGRiLmFsbChEYi5xdWVyeV9nZXRfZm9yX2thbG1hbiwgZnBfaWQsIHgsIHksIChlcnIsIHJvd3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGluc2VydCA9IGRiLnByZXBhcmUoRGIucXVlcnlfaW5zZXJ0X2thbG1hbl9lc3RpbWF0ZXMpO1xuICAgICAgICAgICAgY29uc3QgdXBkYXRlID0gZGIucHJlcGFyZShEYi5xdWVyeV91cGRhdGVfa2FsbWFuX2VzdGltYXRlcyk7XG5cbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBsb2cuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBkb25lID0gMDtcbiAgICAgICAgICAgIHJvd3MuZm9yRWFjaCgocm93KSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGsgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAoa2FsbWFuW3Jvdy5mcF9pZCArIHJvdy5hcF9pZCArIHJvdy54ICsgcm93LnldID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAga2FsbWFuW3Jvdy5mcF9pZCArIHJvdy5hcF9pZCArIHJvdy54ICsgcm93LnldID0gbmV3IEthbG1hbkZpbHRlcihyb3cuY2VzdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGsgPSBrYWxtYW5bcm93LmZwX2lkICsgcm93LmFwX2lkICsgcm93LnggKyByb3cueV07XG5cbiAgICAgICAgICAgICAgICBsZXQgdmFsdWVzID0gcm93LnZhbHVlc1xuICAgICAgICAgICAgICAgICAgICAuc3BsaXQoXCIsXCIpXG4gICAgICAgICAgICAgICAgICAgIC5tYXAoKGVsKSA9PiB7IHJldHVybiBOdW1iZXIoZWwpOyB9KTtcblxuICAgICAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCB2YWx1ZXMubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgICAgICAgICBrLmFkZFNhbXBsZSh2YWx1ZXNbaV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpbnNlcnQucnVuKHJvdy5mcF9pZCwgcm93LmFwX2lkLCByb3cueCwgcm93LnksIGsuZ2V0RXN0aW1hdGUoKSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB1cGRhdGUucnVuKGsuZ2V0RXN0aW1hdGUoKSwgcm93LmZwX2lkLCByb3cuYXBfaWQsIHJvdy54LCByb3cueSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoZG9uZSA+PSByb3dzLmxlbmd0aCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2cubG9nKFwiRmluaXNoZWQgaW5zZXJ0cyBhbmQgdXBkYXRlc1wiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnNlcnQuZmluYWxpemUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGUuZmluYWxpemUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYi5zZXJpYWxpemUoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYi5ydW4oXCJkZWxldGUgZnJvbSBmZWF0dXJlcyB3aGVyZSBmcF9pZCA9ID8gYW5kIHggPSA/IGFuZCB5ID0gP1wiLCBmcF9pZCwgcm93LngsIHJvdy55KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGIucnVuKERiLnF1ZXJ5X3VwZGF0ZV9mZWF0dXJlcywgZnBfaWQsIGZwX2lkLCByb3cueCwgcm93LngsIHJvdy55LCByb3cueSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2IoZnBfaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2cubG9nKFwiRmluaXNoZWQgdXBkYXRpbmcgZmVhdHVyZXNcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZWluZGV4KCl7XG4gICAgICAgIGxldCBkYiA9IHRoaXMuZGI7XG4gICAgICAgIGxldCBsb2cgPSB0aGlzLmxvZztcbiAgICAgICAgbG9nLmxvZyhcIlN0YXJ0aW5nIEluZGV4aW5nXCIpO1xuICAgICAgICBkYi5hbGwoXCJzZWxlY3QgZnBfaWQsIHgsIHkgZnJvbSBzY2FuX3Jlc3VsdHMgR1JPVVAgQlkgZnBfaWQsIHgsIHk7XCIsIChlcnIsIHJvd3MpID0+IHtcbiAgICAgICAgICAgIHJvd3MuZm9yRWFjaCgocm93LCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZnBfaWQgPSByb3cuZnBfaWQ7XG4gICAgICAgICAgICAgICAgY29uc3QgeCA9IHJvdy54O1xuICAgICAgICAgICAgICAgIGNvbnN0IHkgPSByb3cueTtcbiAgICAgICAgICAgICAgICBjb25zdCBjYWxsID0gaSA9PT0gKHJvd3MubGVuZ3RoIC0xKSA/ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJzaG91bGQgY2xvc2VcIik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGIuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICB9IDogKCkgPT4ge307XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVLYWxtYW4oZnBfaWQsIHgsIHksIGNhbGwpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHN0YXRpYyBxdWVyeV9nZXRfaW50ZXJwb2xhdGVfY291bnQgPSBgXG4gICAgU0VMRUNUXG4gICAgICBmLmZlYXR1cmUsIGNvdW50KGYuZmVhdHVyZSkgYXMgZmVhdHVyZV9jb3VudFxuICAgIGZyb21cbiAgICAgIGZlYXR1cmVzIGZcbiAgICAgIGpvaW4gbGF5b3V0X2ltYWdlcyBsaSBvbiBmLmZwX2lkID0gbGkuaWRcbiAgICB3aGVyZVxuICAgICAgbGkuaWQgPSA/ICAgICAgXG4gICAgZ3JvdXAgYnlcbiAgICAgIGYuZmVhdHVyZVxuICAgIG9yZGVyIGJ5XG4gICAgICBmZWF0dXJlX2NvdW50IGRlc2NcbiAgICBgO1xuXG4gICAgc3RhdGljIHF1ZXJ5X2dldF9pbnRlcnBvbGF0ZV9pbmRpdmlkdWFsX2ZlYXR1cmUgPSBgXG4gICAgc2VsZWN0XG4gICAgICAqXG4gICAgZnJvbVxuICAgICAgZmVhdHVyZXMgZlxuICAgIHdoZXJlXG4gICAgICBmLmZlYXR1cmUgPSA/XG4gICAgICBhbmQgZnBfaWQgPSA/XG4gICAgb3JkZXIgYnlcbiAgICAgIGYueCBhc2MsIGYueSBhc2M7XG4gICAgYDtcblxuICAgIHN0YXRpYyBxdWVyeV9pbnNlcnRfbmV3X2ludGVycG9sYXRlZF9mZWF0dXJlID0gYFxuICAgIGluc2VydCBpbnRvIGZlYXR1cmVzIChmcF9pZCwgeCwgeSwgZmVhdHVyZSwgdmFsdWUsIGludGVycG9sYXRlZClcbiAgICB2YWx1ZXMgKD8sID8sID8sID8sID8sIDEpO1xuICAgIGA7XG5cbiAgICBpbnRlcnBvbGF0ZShmcF9pZDogU3RyaW5nKSB7XG4gICAgICAgIHRoaXMuaW50ZXJwb2xhdGVYKGZwX2lkKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4gdGhpcy5pbnRlcnBvbGF0ZVkoZnBfaWQpKTtcbiAgICB9XG5cbiAgICBpbnRlcnBvbGF0ZVgoZnBfaWQ6IFN0cmluZykge1xuICAgICAgICBjb25zb2xlLmxvZyhcImludGVycG9sYXRlWFwiKTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGluc2VydCA9IHRoaXMuZGIucHJlcGFyZShEYi5xdWVyeV9pbnNlcnRfbmV3X2ludGVycG9sYXRlZF9mZWF0dXJlKTtcbiAgICAgICAgICAgIHRoaXMuZGIucnVuKFwiZGVsZXRlIGZyb20gZmVhdHVyZXMgd2hlcmUgZnBfaWQgPSA/IGFuZCBpbnRlcnBvbGF0ZWQgPSAxO1wiLCBmcF9pZCwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZGIuYWxsKERiLnF1ZXJ5X2dldF9pbnRlcnBvbGF0ZV9jb3VudCwgZnBfaWQsIChlcnIsIHJvd3MpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1heEZlYXR1cmVDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHJvdyBvZiByb3dzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmZWF0dXJlID0gcm93LmZlYXR1cmU7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmZWF0dXJlX2NvdW50ID0gcm93LmZlYXR1cmVfY291bnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmVhdHVyZV9jb3VudCA8IG1heEZlYXR1cmVDb3VudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4RmVhdHVyZUNvdW50ID0gZmVhdHVyZV9jb3VudDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kYi5hbGwoRGIucXVlcnlfZ2V0X2ludGVycG9sYXRlX2luZGl2aWR1YWxfZmVhdHVyZSwgZmVhdHVyZSwgZnBfaWQsIChlcnIsIHJvd3MpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcm93TWFwID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaVJvdyBvZiByb3dzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2Yocm93TWFwW2lSb3cueF0pID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3dNYXBbaVJvdy54XSA9IFtbXSwgW11dO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm93TWFwW2lSb3cueF1bMF0ucHVzaChpUm93LnkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3dNYXBbaVJvdy54XVsxXS5wdXNoKGlSb3cudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHhWYWwgaW4gcm93TWFwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCB4VmFscyA9IHJvd01hcFt4VmFsXVswXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHlWYWxzID0gcm93TWFwW3hWYWxdWzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgdW5Lbm93blZhbHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1pblZhbCA9IE1hdGgubWluKC4uLnhWYWxzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1heFZhbCA9IE1hdGgubWF4KC4uLnhWYWxzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IG1pblZhbDsgaSA8IG1heFZhbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoeFZhbHMuaW5kZXhPZihpKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bktub3duVmFscy5wdXNoKGkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBub3dLbm93biA9IExpbmVhckludGVycG9sYXRlKHVuS25vd25WYWxzLCB4VmFscywgeVZhbHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkb25lID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yKGxldCB1bmtub3duWSBvZiB1bktub3duVmFscykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zZXJ0LnJ1bihmcF9pZCwgeFZhbCwgdW5rbm93blksIGZlYXR1cmUsIG5vd0tub3duW2ldLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGRvbmUgPT09IG5vd0tub3duLmxlbmd0aCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgaW50ZXJwb2xhdGVZKGZwX2lkOiBTdHJpbmcpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJpbnRlcnBvbGF0ZVlcIik7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpbnNlcnQgPSB0aGlzLmRiLnByZXBhcmUoRGIucXVlcnlfaW5zZXJ0X25ld19pbnRlcnBvbGF0ZWRfZmVhdHVyZSk7XG4gICAgICAgICAgICB0aGlzLmRiLmFsbChEYi5xdWVyeV9nZXRfaW50ZXJwb2xhdGVfY291bnQsIGZwX2lkLCAoZXJyLCByb3dzKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IG1heEZlYXR1cmVDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgcm93IG9mIHJvd3MpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZmVhdHVyZSA9IHJvdy5mZWF0dXJlO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmZWF0dXJlX2NvdW50ID0gcm93LmZlYXR1cmVfY291bnQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmZWF0dXJlX2NvdW50IDwgbWF4RmVhdHVyZUNvdW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBtYXhGZWF0dXJlQ291bnQgPSBmZWF0dXJlX2NvdW50O1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGIuYWxsKERiLnF1ZXJ5X2dldF9pbnRlcnBvbGF0ZV9pbmRpdmlkdWFsX2ZlYXR1cmUsIGZlYXR1cmUsIGZwX2lkLCAoZXJyLCByb3dzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcm93TWFwID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpUm93IG9mIHJvd3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mKHJvd01hcFtpUm93LnldKSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3dNYXBbaVJvdy55XSA9IFtbXSwgW11dO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvd01hcFtpUm93LnldWzBdLnB1c2goaVJvdy54KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3dNYXBbaVJvdy55XVsxXS5wdXNoKGlSb3cudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCB5VmFsIGluIHJvd01hcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCB4VmFscyA9IHJvd01hcFt5VmFsXVswXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgeVZhbHMgPSByb3dNYXBbeVZhbF1bMV07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgdW5Lbm93blZhbHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbWluVmFsID0gTWF0aC5taW4oLi4ueFZhbHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtYXhWYWwgPSBNYXRoLm1heCguLi54VmFscyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IG1pblZhbDsgaSA8IG1heFZhbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh4VmFscy5pbmRleE9mKGkpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5Lbm93blZhbHMucHVzaChpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbm93S25vd24gPSBMaW5lYXJJbnRlcnBvbGF0ZSh1bktub3duVmFscywgeFZhbHMsIHlWYWxzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGRvbmUgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHVua25vd25YIG9mIHVuS25vd25WYWxzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc2VydC5ydW4oZnBfaWQsIHVua25vd25YLCB5VmFsLCBmZWF0dXJlLCBub3dLbm93bltpXSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRvbmUgPT09IG5vd0tub3duLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBEYjsiXX0=
//# sourceMappingURL=Db.js.map
