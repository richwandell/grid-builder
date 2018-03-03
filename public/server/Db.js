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
                        value = void 0,
                        maxX = 0,
                        maxY = 0;
                    for (var i = 0; i < length; i++) {
                        fp_id = rows[i].fp_id;
                        x = rows[i].x;
                        y = rows[i].y;
                        if (x > maxX) {
                            maxX = x;
                        }
                        if (y > maxY) {
                            maxY = y;
                        }
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
                    _this2.featuresCache[fp_id]["max_x"] = maxX;
                    _this2.featuresCache[fp_id]["max_y"] = maxY;
                    _this2.log.log("Features Cache created");
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
        key: 'getMaxX',
        value: function getMaxX(fp_id) {
            if (this.featuresCache[fp_id] === undefined) {
                return false;
            }
            return this.featuresCache[fp_id]["max_x"];
        }
    }, {
        key: 'getMaxY',
        value: function getMaxY(fp_id) {
            if (this.featuresCache[fp_id] === undefined) {
                return false;
            }
            return this.featuresCache[fp_id]["max_y"];
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvRGIuZXM2Il0sIm5hbWVzIjpbInNxbGl0ZTMiLCJyZXF1aXJlIiwidmVyYm9zZSIsIkxpbmVhckludGVycG9sYXRlIiwibGluZWFyIiwiRGIiLCJsb2ciLCJkYXRhYmFzZSIsImRlYnVnIiwiZGIiLCJjYWNoZWQiLCJEYXRhYmFzZSIsImNyZWF0ZVRhYmxlcyIsInNlcmlhbGl6ZSIsImV4ZWMiLCJmZWF0dXJlc0NhY2hlIiwiZnBfaWQiLCJ1bmRlZmluZWQiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImFsbCIsImVyciIsInJvd3MiLCJsZW5ndGgiLCJ4IiwieSIsImZlYXR1cmUiLCJ2YWx1ZSIsIm1heFgiLCJtYXhZIiwiaSIsImNvb3JkIiwiZnAiLCJjIiwia2V5cyIsIk9iamVjdCIsImRhdGFiYXNlQ29kZVZlcnNpb24iLCJjYiIsIm1pZ3JhdGlvbjEiLCJmb3JFYWNoIiwibWlnIiwicnVuIiwibWlncmF0aW9uMiIsIm1pZ3JhdGlvbjMiLCJtaWdyYXRpb240IiwibWlncmF0aW9uNSIsIm1pZ3JhdGlvbjYiLCJjcmVhdGVzIiwiY3JlYXRlIiwicm93Iiwia2V5IiwiTnVtYmVyIiwiZGF0YWJhc2VfY29kZV92ZXJzaW9uIiwiZG9VcGdyYWRlIiwicXVlcnlfZ2V0X3NjYW5uZWRfY29vcmRzIiwicXVlcnlfZ2V0X2FsbF9mbG9vcnBsYW5zIiwiZGF0YSIsInN0bXQiLCJwcmVwYXJlIiwicXVlcnlfaW5zZXJ0X3ZlcnNpb24iLCJkYXRhYmFzZVZlcnNpb24iLCJmaW5hbGl6ZSIsInF1ZXJ5X3VwZGF0ZV92ZXJzaW9uIiwibGF5b3V0X2ltYWdlcyIsInF1ZXJ5X2luc2VydF9sYXlvdXQiLCJ1cHN0bXQiLCJxdWVyeV91cGRhdGVfbGF5b3V0IiwiZWwiLCJpZCIsImZsb29yX3BsYW5fbmFtZSIsImZsb29ycGxhbm5hbWUiLCJzdHJpbmdkYXRhIiwiSlNPTiIsInN0cmluZ2lmeSIsInBheWxvYWQiLCJxdWVyeV9pbnNlcnRfc2Nhbl9yZXN1bHRzIiwiZmluaXNoZWQiLCJ4eSIsImdldCIsInF1ZXJ5X2dldF9zY2FuX2lkIiwicXVlcnlfdXBkYXRlX3NjYW5faWQiLCJzX2lkIiwiYXBfaWQiLCJpbmRleE9mIiwicHVzaCIsIm9yaWdfdmFsdWVzIiwiY3JlYXRlZCIsImNhbGwiLCJzcGxpdCIsInVwZGF0ZUthbG1hbiIsImthbG1hbiIsInF1ZXJ5X2dldF9mb3Jfa2FsbWFuIiwiaW5zZXJ0IiwicXVlcnlfaW5zZXJ0X2thbG1hbl9lc3RpbWF0ZXMiLCJ1cGRhdGUiLCJxdWVyeV91cGRhdGVfa2FsbWFuX2VzdGltYXRlcyIsImVycm9yIiwiZG9uZSIsImsiLCJjZXN0IiwidmFsdWVzIiwibWFwIiwiYWRkU2FtcGxlIiwiZ2V0RXN0aW1hdGUiLCJxdWVyeV91cGRhdGVfZmVhdHVyZXMiLCJjb25zb2xlIiwiY2xvc2UiLCJpbnRlcnBvbGF0ZVgiLCJ0aGVuIiwiaW50ZXJwb2xhdGVZIiwicXVlcnlfaW5zZXJ0X25ld19pbnRlcnBvbGF0ZWRfZmVhdHVyZSIsInF1ZXJ5X2dldF9pbnRlcnBvbGF0ZV9jb3VudCIsIm1heEZlYXR1cmVDb3VudCIsImZlYXR1cmVfY291bnQiLCJxdWVyeV9nZXRfaW50ZXJwb2xhdGVfaW5kaXZpZHVhbF9mZWF0dXJlIiwicm93TWFwIiwiaVJvdyIsInhWYWwiLCJ4VmFscyIsInlWYWxzIiwidW5Lbm93blZhbHMiLCJtaW5WYWwiLCJNYXRoIiwibWluIiwibWF4VmFsIiwibWF4Iiwibm93S25vd24iLCJ1bmtub3duWSIsInlWYWwiLCJ1bmtub3duWCIsInF1ZXJ5X2dldF9kYXRhYmFzZV92ZXJzaW9uIiwicXVlcnlfZ2V0X3NjYW5fcmVzdWx0cyIsInF1ZXJ5X3VwZGF0ZV9vbGRlc3RfZmVhdHVyZXMiLCJxdWVyeV9nZXRfZmVhdHVyZXMiLCJxdWVyeV9nZXRfbWluX3NpZCIsImRyb3BzIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7Ozs7Ozs7Ozs7QUFFQSxJQUFJ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RUFJaEIsa0NBQWtDeEMsR0FBR2dELHFCQUFyQyxHQUE2RCx3Q0FKN0MsQztBQXJHbEJoRCxFLENBNEdLeUMsVSxHQUFhLENBQ2hCLDhFQURnQixFQUVoQixrQ0FBa0N6QyxHQUFHZ0QscUJBQXJDLEdBQTZELHdDQUY3QyxDO0FBNUdsQmhELEUsQ0FpSEswQyxVLEdBQWEsQ0FDaEIsbUVBRGdCLEVBRWhCLHNFQUZnQixFQUdoQixrQ0FBa0MxQyxHQUFHZ0QscUJBQXJDLEdBQTZELHdDQUg3QyxDO0FBakhsQmhELEUsQ0FnZUsyRywyQjtBQWhlTDNHLEUsQ0E4ZUs4Ryx3QztBQTllTDlHLEUsQ0EwZkswRyxxQzs7O0FBNkhYMEIsT0FBT0MsT0FBUCxHQUFpQnJJLEVBQWpCIiwiZmlsZSI6IkRiLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEthbG1hbkZpbHRlciBmcm9tICcuL0thbG1hbkZpbHRlcic7XG5cbmxldCBzcWxpdGUzID0gcmVxdWlyZSgnc3FsaXRlMycpLnZlcmJvc2UoKTtcbmxldCBMaW5lYXJJbnRlcnBvbGF0ZSA9IHJlcXVpcmUoJ2V2ZXJwb2xhdGUnKS5saW5lYXI7XG5cbmNsYXNzIERiIHtcblxuICAgIHN0YXRpYyBkYXRhYmFzZV9jb2RlX3ZlcnNpb24gPSA2O1xuICAgIHN0YXRpYyBxdWVyeV9nZXRfYWxsX2Zsb29ycGxhbnMgPSBcInNlbGVjdCAqIGZyb20gbGF5b3V0X2ltYWdlc1wiO1xuICAgIHN0YXRpYyBxdWVyeV9nZXRfZGF0YWJhc2VfdmVyc2lvbiA9IFwic2VsZWN0IHZhbHVlIGZyb20gc2V0dGluZ3Mgd2hlcmUga2V5ID0gJ2RhdGFiYXNlX3ZlcnNpb24nO1wiO1xuICAgIHN0YXRpYyBxdWVyeV9pbnNlcnRfdmVyc2lvbiA9IFwiaW5zZXJ0IG9yIGlnbm9yZSBpbnRvIHNldHRpbmdzIHZhbHVlcyAoJ2RhdGFiYXNlX3ZlcnNpb24nLCA/KTtcIjtcbiAgICBzdGF0aWMgcXVlcnlfdXBkYXRlX3ZlcnNpb24gPSBcInVwZGF0ZSBzZXR0aW5ncyBzZXQgdmFsdWUgPSA/IHdoZXJlIGtleSA9ICdkYXRhYmFzZV92ZXJzaW9uJztcIjtcbiAgICBzdGF0aWMgcXVlcnlfaW5zZXJ0X2xheW91dCA9IFwiaW5zZXJ0IG9yIGlnbm9yZSBpbnRvIGxheW91dF9pbWFnZXMgdmFsdWVzICg/LCA/LCA/KTtcIjtcbiAgICBzdGF0aWMgcXVlcnlfdXBkYXRlX2xheW91dCA9IFwidXBkYXRlIGxheW91dF9pbWFnZXMgc2V0IGxheW91dF9pbWFnZSA9ID8sIGZsb29yX3BsYW5fbmFtZSA9ID8gd2hlcmUgaWQgPSA/O1wiO1xuICAgIHN0YXRpYyBxdWVyeV9pbnNlcnRfc2Nhbl9yZXN1bHRzID0gXCJpbnNlcnQgaW50byBzY2FuX3Jlc3VsdHMgdmFsdWVzICg/LCA/LCA/LCA/LCA/LCA/LCA/LCA/KTtcIjtcbiAgICBzdGF0aWMgcXVlcnlfZ2V0X3NjYW5fcmVzdWx0cyA9IFwic2VsZWN0ICogZnJvbSBzY2FuX3Jlc3VsdHM7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X2dldF9mb3Jfa2FsbWFuID0gXCJTRUxFQ1Qgcy5mcF9pZCwgcy5hcF9pZCwgcy54LCBzLnksIFwiXG4gICAgKyBcImdyb3VwX2NvbmNhdChzLnZhbHVlKSBgdmFsdWVzYCwgXCJcbiAgICArIFwiY2FzZSB3aGVuIGsua2FsbWFuIGlzIG51bGwgdGhlbiBhdmcocy52YWx1ZSkgZWxzZSBrLmthbG1hbiBlbmQgYGNlc3RgLCBcIlxuICAgICsgXCJrLmthbG1hbiBGUk9NIHNjYW5fcmVzdWx0cyBzIGxlZnQgam9pbiBcIlxuICAgICsgXCJrYWxtYW5fZXN0aW1hdGVzIGsgb24gcy5mcF9pZCA9IGsuZnBfaWQgYW5kIHMuYXBfaWQgPSBrLmFwX2lkIGFuZCBzLnggPSBrLnggYW5kIHMueSA9IGsueSBcIlxuICAgICsgXCIgd2hlcmUgcy5mcF9pZCA9ID8gYW5kIHMudmFsdWUgIT0gMCBhbmQgcy54ID0gPyBhbmQgcy55ID0gPyBHUk9VUCBCWSBzLmZwX2lkLCBzLmFwX2lkLCBzLngsIHMueTtcIjtcbiAgICBzdGF0aWMgcXVlcnlfaW5zZXJ0X2thbG1hbl9lc3RpbWF0ZXMgPSBcImluc2VydCBvciBpZ25vcmUgaW50byBrYWxtYW5fZXN0aW1hdGVzIHZhbHVlcyAoPywgPywgPywgPywgPyk7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X3VwZGF0ZV9rYWxtYW5fZXN0aW1hdGVzID0gXCJ1cGRhdGUga2FsbWFuX2VzdGltYXRlcyBzZXQga2FsbWFuID0gPyB3aGVyZSBmcF9pZCA9ID8gYW5kIGFwX2lkID0gPyBhbmQgXCJcbiAgICArIFwiIHggPSA/IGFuZCB5ID0gPztcIjtcbiAgICBzdGF0aWMgcXVlcnlfdXBkYXRlX2ZlYXR1cmVzID0gXCJpbnNlcnQgaW50byBmZWF0dXJlcyBcIlxuICAgICsgXCIgc2VsZWN0IGsuZnBfaWQsIGsueCwgay55LCBrLmFwX2lkIHx8IGsxLmFwX2lkIGFzIGZlYXR1cmUsIGFicyhrLmthbG1hbiAtIGsxLmthbG1hbikgYXMgdmFsdWUgXCJcbiAgICArIFwiIGZyb20ga2FsbWFuX2VzdGltYXRlcyBrIGpvaW4ga2FsbWFuX2VzdGltYXRlcyBrMSBvbiBrLmZwX2lkID0gazEuZnBfaWQgYW5kIGsueCA9IGsxLnggYW5kIGsueSA9IGsxLnlcIlxuICAgICsgXCIgd2hlcmUgdmFsdWUgIT0gMCBhbmQgay5mcF9pZCA9ID8gYW5kIGsxLmZwX2lkID0gPyBhbmQgay54ID0gPyBhbmQgazEueCA9ID8gYW5kIGsueSA9ID8gYW5kIGsxLnkgPSA/XCI7XG4gICAgc3RhdGljIHF1ZXJ5X3VwZGF0ZV9vbGRlc3RfZmVhdHVyZXMgPSBcInNlbGVjdCBrLmZwX2lkLCBrLngsIGsueSwgay5hcF9pZCB8fCBrMS5hcF9pZCBhcyBmZWF0dXJlLCBcIlxuICAgICsgXCIgYWJzKGsua2FsbWFuIC0gazEua2FsbWFuKSBhcyB2YWx1ZSwgOnNjYW5faWQ6IHNfaWQgZnJvbSBrYWxtYW5fZXN0aW1hdGVzIGsgam9pbiBcIlxuICAgICsgXCIga2FsbWFuX2VzdGltYXRlcyBrMSBvbiBrLmZwX2lkID0gazEuZnBfaWQgYW5kIGsueCA9IGsxLnggYW5kIGsueSA9IGsxLnkgYW5kIGsuYXBfaWQgPCBrMS5hcF9pZCB3aGVyZVwiXG4gICAgKyBcIiBrLmthbG1hbiAhPSAwIGFuZCBrMS5rYWxtYW4gIT0gMCBhbmQgay5mcF9pZCA9ID8gYW5kIGsxLmZwX2lkID0gPztcIjtcbiAgICBzdGF0aWMgcXVlcnlfZ2V0X2ZlYXR1cmVzID0gXCJzZWxlY3QgZi4qLCBhYnModmFsdWUgLSA6ZmVhdHVyZV92YWx1ZTopIGRpZmYgZnJvbSBmZWF0dXJlcyBmIFwiXG4gICAgKyBcIiB3aGVyZSBmLmZlYXR1cmUgPSA/IGFuZCBmLmZwX2lkID0gPyBvcmRlciBieSBkaWZmIGFzYztcIjtcbiAgICBzdGF0aWMgcXVlcnlfZ2V0X3NjYW5uZWRfY29vcmRzID0gXCJzZWxlY3QgY291bnQoKikgYXMgbnVtX2ZlYXR1cmVzLCB4LCB5IGZyb20gZmVhdHVyZXMgd2hlcmUgZnBfaWQgPSA/IFwiXG4gICAgKyBcIiBncm91cCBieSB4LCB5O1wiO1xuICAgIHN0YXRpYyBxdWVyeV9nZXRfbWluX3NpZCA9IFwic2VsZWN0IG1pbihzX2lkKSBmcm9tIGZlYXR1cmVzIHdoZXJlIGZwX2lkID0gP1wiO1xuICAgIHN0YXRpYyBxdWVyeV9nZXRfc2Nhbl9pZCA9IFwic2VsZWN0IHZhbHVlICsgMSBhcyB2YWx1ZSBmcm9tIHNldHRpbmdzIHdoZXJlIGtleSA9ICdzY2FuX2lkJztcIjtcbiAgICBzdGF0aWMgcXVlcnlfdXBkYXRlX3NjYW5faWQgPSBcInVwZGF0ZSBzZXR0aW5ncyBzZXQgdmFsdWUgPSB2YWx1ZSArIDEgd2hlcmUga2V5ID0gJ3NjYW5faWQnO1wiO1xuXG4gICAgc3RhdGljIGNyZWF0ZXMgPSBbXG4gICAgICAgIFwiQ1JFQVRFIFRBQkxFIGlmIG5vdCBleGlzdHMgbGF5b3V0X2ltYWdlcyAoaWQgVEVYVCBQUklNQVJZIEtFWSwgbGF5b3V0X2ltYWdlIFRFWFQpO1wiLFxuICAgICAgICBcIkNSRUFURSBVTklRVUUgSU5ERVggaWYgbm90IGV4aXN0cyBsYXlvdXRfaW1hZ2VzX2lkX3VpbmRleCBPTiBsYXlvdXRfaW1hZ2VzIChpZCk7XCIsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENyZWF0ZSB0aGUgc2V0dGluZ3MgdGFibGUgd2l0aCBkZWZhdWx0IHNldHRpbmdzXG4gICAgICAgICAqL1xuICAgICAgICBcImNyZWF0ZSB0YWJsZSBpZiBub3QgZXhpc3RzIHNldHRpbmdzIChrZXkgVEVYVCBQUklNQVJZIEtFWSwgdmFsdWUgVEVYVCk7XCIsXG4gICAgICAgIFwiY3JlYXRlIHVuaXF1ZSBpbmRleCBpZiBub3QgZXhpc3RzIHNldHRpbmdzX2tleSBvbiBzZXR0aW5ncyAoa2V5KTtcIixcbiAgICAgICAgXCJpbnNlcnQgb3IgaWdub3JlIGludG8gc2V0dGluZ3MgKGtleSwgdmFsdWUpIHZhbHVlcyAoJ2RhdGFiYXNlX3ZlcnNpb24nLCAwKTtcIixcbiAgICAgICAgXCJpbnNlcnQgb3IgaWdub3JlIGludG8gc2V0dGluZ3MgKGtleSwgdmFsdWUpIHZhbHVlcyAoJ2RhdGFiYXNlX2NvZGVfdmVyc2lvbicsIDApO1wiLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBhcF9pZCA9IGFjY2VzcyBwb2ludCBpZFxuICAgICAgICAgKiBmcF9pZCA9IGZsb29ycGxhbiBpZFxuICAgICAgICAgKi9cbiAgICAgICAgXCJDUkVBVEUgVEFCTEUgaWYgbm90IGV4aXN0cyBzY2FuX3Jlc3VsdHMgXCIgK1xuICAgICAgICBcIihzX2lkIElOVEVHRVIsIGZwX2lkIFRFWFQsIGFwX2lkIFRFWFQsIHggSU5URUdFUiwgXCIgK1xuICAgICAgICBcInkgSU5URUdFUiwgdmFsdWUgUkVBTCwgb3JpZ192YWx1ZXMgVEVYVCwgY3JlYXRlZCBUSU1FU1RBTVAgREVGQVVMVCBDVVJSRU5UX1RJTUVTVEFNUCBOT1QgTlVMTCwgXCIgK1xuICAgICAgICBcIlBSSU1BUlkgS0VZIChzX2lkLCBmcF9pZCwgYXBfaWQpLCBcIiArXG4gICAgICAgIFwiQ09OU1RSQUlOVCBzY2FuX3Jlc3VsdHNfbGF5b3V0X2ltYWdlc19pZF9mayBGT1JFSUdOIEtFWSAoZnBfaWQpIFJFRkVSRU5DRVMgbGF5b3V0X2ltYWdlcyAoaWQpKTtcIixcbiAgICAgICAgXCJjcmVhdGUgaW5kZXggaWYgbm90IGV4aXN0cyB4X2FuZF95IG9uIHNjYW5fcmVzdWx0cyAoeCwgeSk7XCIsXG5cbiAgICAgICAgXCJDUkVBVEUgVEFCTEUgaWYgbm90IGV4aXN0cyBrYWxtYW5fZXN0aW1hdGVzIChmcF9pZCBURVhULCBhcF9pZCBURVhULCB4IElOVEVHRVIsIFwiXG4gICAgICAgICsgXCJ5IElOVEVHRVIsIGthbG1hbiBSRUFMLCBcIlxuICAgICAgICArIFwiQ09OU1RSQUlOVCBrYWxtYW5fZXN0aW1hdGVzX2ZwX2lkX2FwX2lkX3hfeV9wayBQUklNQVJZIEtFWSAoZnBfaWQsIGFwX2lkLCB4LCB5KSxcIlxuICAgICAgICArIFwiRk9SRUlHTiBLRVkgKGFwX2lkLCBmcF9pZCwgeCwgeSkgUkVGRVJFTkNFUyBzY2FuX3Jlc3VsdHMgKGFwX2lkLCBmcF9pZCwgeCwgeSkgT04gREVMRVRFIENBU0NBREUpXCIsXG5cbiAgICAgICAgXCJDUkVBVEUgVEFCTEUgaWYgbm90IGV4aXN0cyBmZWF0dXJlcyAoZnBfaWQgVEVYVCwgeCBJTlRFR0VSLCB5IElOVEVHRVIsIGZlYXR1cmUgVEVYVCwgdmFsdWUgUkVBTCwgXCJcbiAgICAgICAgKyBcIiBDT05TVFJBSU5UIGZlYXR1cmVzX2ZwX2lkX3hfeV9mZWF0dXJlX3BrIFBSSU1BUlkgS0VZIChmcF9pZCwgeCwgeSwgZmVhdHVyZSkpO1wiLFxuICAgICAgICBcIkNSRUFURSBVTklRVUUgSU5ERVggaWYgbm90IGV4aXN0cyBmZWF0dXJlc19mZWF0dXJlX2luZGV4MSBPTiBmZWF0dXJlcyhmcF9pZCxmZWF0dXJlLHgseSk7XCIsXG4gICAgICAgIFwiQ1JFQVRFIElOREVYIGlmIG5vdCBleGlzdHMgZmVhdHVyZXNfZmVhdHVyZV9pbmRleDIgT04gZmVhdHVyZXMoZmVhdHVyZSk7XCJcbiAgICBdO1xuXG4gICAgc3RhdGljIGRyb3BzID0gW1xuICAgICAgICBcImRyb3AgdGFibGUgaWYgZXhpc3RzIGxheW91dF9pbWFnZXM7XCIsXG4gICAgICAgIFwiZHJvcCB0YWJsZSBpZiBleGlzdHMgc2V0dGluZ3M7XCIsXG4gICAgICAgIFwiZHJvcCB0YWJsZSBpZiBleGlzdHMgc2Nhbl9yZXN1bHRzO1wiLFxuICAgICAgICBcImRyb3AgdGFibGUgaWYgZXhpc3RzIGthbG1hbl9lc3RpbWF0ZXM7XCJcbiAgICBdO1xuXG4gICAgc3RhdGljIG1pZ3JhdGlvbjEgPSBbXG4gICAgICAgIFwiQUxURVIgVEFCTEUgbGF5b3V0X2ltYWdlcyBBREQgZmxvb3JfcGxhbl9uYW1lIFRFWFQgTlVMTDtcIixcbiAgICAgICAgXCJ1cGRhdGUgc2V0dGluZ3Mgc2V0IHZhbHVlID0gJ1wiICsgRGIuZGF0YWJhc2VfY29kZV92ZXJzaW9uICsgXCInIHdoZXJlIGtleSA9ICdkYXRhYmFzZV9jb2RlX3ZlcnNpb24nO1wiXG4gICAgXTtcblxuICAgIHN0YXRpYyBtaWdyYXRpb24yID0gW1xuICAgICAgICBcIkFMVEVSIFRBQkxFIGZlYXR1cmVzIEFERCBzX2lkIElOVCBOVUxMO1wiLFxuICAgICAgICBcIkRST1AgSU5ERVggZmVhdHVyZXNfZmVhdHVyZV9pbmRleDE7XCIsXG4gICAgICAgIFwiRFJPUCBJTkRFWCBmZWF0dXJlc19mZWF0dXJlX2luZGV4MjtcIixcbiAgICAgICAgXCJDUkVBVEUgVEFCTEUgZmVhdHVyZXNhOGQxIChmcF9pZCBURVhULCB4IElOVEVHRVIsIHkgSU5URUdFUiwgZmVhdHVyZSBURVhULCB2YWx1ZSBSRUFMLCBzX2lkIElOVEVHRVIsXCJcbiAgICAgICAgKyBcIiBDT05TVFJBSU5UIGZlYXR1cmVzX2ZwX2lkX3hfeV9mZWF0dXJlX3NfaWRfcGsgUFJJTUFSWSBLRVkgKGZwX2lkLCB4LCB5LCBmZWF0dXJlLCBzX2lkKSk7XCIsXG4gICAgICAgIFwiQ1JFQVRFIFVOSVFVRSBJTkRFWCBmZWF0dXJlc19mZWF0dXJlX2luZGV4MSBPTiBmZWF0dXJlc2E4ZDEgKGZwX2lkLCBmZWF0dXJlLCB4LCB5LCBzX2lkKTtcIixcbiAgICAgICAgXCJJTlNFUlQgSU5UTyBmZWF0dXJlc2E4ZDEoZnBfaWQsIHgsIHksIGZlYXR1cmUsIHZhbHVlLCBzX2lkKSBTRUxFQ1QgZnBfaWQsIHgsIHksIGZlYXR1cmUsIHZhbHVlLCBzX2lkIEZST00gZmVhdHVyZXM7XCIsXG4gICAgICAgIFwiRFJPUCBUQUJMRSBmZWF0dXJlcztcIixcbiAgICAgICAgXCJBTFRFUiBUQUJMRSBmZWF0dXJlc2E4ZDEgUkVOQU1FIFRPIGZlYXR1cmVzO1wiLFxuICAgICAgICBcIkNSRUFURSBJTkRFWCBmZWF0dXJlc19mZWF0dXJlX2luZGV4MiBPTiBmZWF0dXJlcyhmZWF0dXJlKTtcIixcbiAgICAgICAgXCJ1cGRhdGUgc2V0dGluZ3Mgc2V0IHZhbHVlID0gJ1wiICsgRGIuZGF0YWJhc2VfY29kZV92ZXJzaW9uICsgXCInIHdoZXJlIGtleSA9ICdkYXRhYmFzZV9jb2RlX3ZlcnNpb24nO1wiXG4gICAgXTtcblxuICAgIHN0YXRpYyBtaWdyYXRpb24zID0gW1xuICAgICAgICBcImluc2VydCBvciBpZ25vcmUgaW50byBzZXR0aW5ncyB2YWx1ZXMgKCdzY2FuX2lkJywgNjQpO1wiLFxuICAgICAgICBcInVwZGF0ZSBzZXR0aW5ncyBzZXQgdmFsdWUgPSAnXCIgKyBEYi5kYXRhYmFzZV9jb2RlX3ZlcnNpb24gKyBcIicgd2hlcmUga2V5ID0gJ2RhdGFiYXNlX2NvZGVfdmVyc2lvbic7XCJcbiAgICBdO1xuXG4gICAgc3RhdGljIG1pZ3JhdGlvbjQgPSBbXG4gICAgICAgIFwiZHJvcCB0YWJsZSBmZWF0dXJlcztcIixcbiAgICAgICAgXCJDUkVBVEUgVEFCTEUgZmVhdHVyZXMgKGZwX2lkIFRFWFQsIHggSU5URUdFUiwgeSBJTlRFR0VSLCBmZWF0dXJlIFRFWFQsIHZhbHVlIFJFQUwsIFwiXG4gICAgICAgICsgXCIgQ09OU1RSQUlOVCBmZWF0dXJlc19mcF9pZF94X3lfZmVhdHVyZV9wayBQUklNQVJZIEtFWSAoZnBfaWQsIHgsIHksIGZlYXR1cmUpKTtcIixcbiAgICAgICAgXCJ1cGRhdGUgc2V0dGluZ3Mgc2V0IHZhbHVlID0gJ1wiICsgRGIuZGF0YWJhc2VfY29kZV92ZXJzaW9uICsgXCInIHdoZXJlIGtleSA9ICdkYXRhYmFzZV9jb2RlX3ZlcnNpb24nO1wiXG4gICAgXTtcblxuICAgIHN0YXRpYyBtaWdyYXRpb241ID0gW1xuICAgICAgICBcIkNSRUFURSBJTkRFWCBpZiBub3QgZXhpc3RzIHNjYW5fcmVzdWx0c19mcF9pZF9pbmRleCBPTiBzY2FuX3Jlc3VsdHMgKGZwX2lkKTtcIixcbiAgICAgICAgXCJ1cGRhdGUgc2V0dGluZ3Mgc2V0IHZhbHVlID0gJ1wiICsgRGIuZGF0YWJhc2VfY29kZV92ZXJzaW9uICsgXCInIHdoZXJlIGtleSA9ICdkYXRhYmFzZV9jb2RlX3ZlcnNpb24nO1wiXG4gICAgXTtcblxuICAgIHN0YXRpYyBtaWdyYXRpb242ID0gW1xuICAgICAgICBcIkFMVEVSIFRBQkxFIGZlYXR1cmVzIEFERCBpbnRlcnBvbGF0ZWQgSU5URUdFUiBERUZBVUxUIDAgTk9UIE5VTEw7XCIsXG4gICAgICAgIFwiQ1JFQVRFIElOREVYIGZlYXR1cmVzX2ludGVycG9sYXRlZF9pbmRleCBPTiBmZWF0dXJlcyAoaW50ZXJwb2xhdGVkKTtcIixcbiAgICAgICAgXCJ1cGRhdGUgc2V0dGluZ3Mgc2V0IHZhbHVlID0gJ1wiICsgRGIuZGF0YWJhc2VfY29kZV92ZXJzaW9uICsgXCInIHdoZXJlIGtleSA9ICdkYXRhYmFzZV9jb2RlX3ZlcnNpb24nO1wiXG4gICAgXTtcblxuICAgIGNvbnN0cnVjdG9yKGxvZywgZGF0YWJhc2UgPSBcImRiLnNxbGl0ZTNcIil7XG4gICAgICAgIHRoaXMubG9nID0gbG9nO1xuICAgICAgICB0aGlzLmxvZy5kZWJ1ZyhcIkRiLmNvbnN0cnVjdG9yXCIpO1xuXG4gICAgICAgIHRoaXMuZGIgPSBuZXcgc3FsaXRlMy5jYWNoZWQuRGF0YWJhc2UoYGRiLyR7ZGF0YWJhc2V9YCk7XG5cbiAgICAgICAgdGhpcy5jcmVhdGVUYWJsZXModGhpcy5kYiwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5kYi5zZXJpYWxpemUoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZGIuZXhlYyhcIlBSQUdNQSBqb3VybmFsX21vZGUgPSBXQUw7XCIpO1xuICAgICAgICAgICAgICAgIHRoaXMuZGIuZXhlYyhcIlBSQUdNQSBjYWNoZV9zaXplID0gNDA5NjAwMDtcIik7XG4gICAgICAgICAgICAgICAgdGhpcy5kYi5leGVjKFwiUFJBR01BIG9wdGltaXplO1wiKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRiLmV4ZWMoXCJQUkFHTUEgYnVzeV90aW1lb3V0ID0gMTUwMDAwO1wiKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5mZWF0dXJlc0NhY2hlID0ge307XG4gICAgfVxuXG4gICAgY2xlYXJGZWF0dXJlc0NhY2hlKGZwX2lkKXtcbiAgICAgICAgdGhpcy5mZWF0dXJlc0NhY2hlW2ZwX2lkXSA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSBmcF9pZFxuICAgICAqL1xuICAgIGNyZWF0ZUZlYXR1cmVzQ2FjaGUoZnBfaWQpe1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXG4gICAgICAgICAgICBpZih0aGlzLmZlYXR1cmVzQ2FjaGVbZnBfaWRdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5kYi5hbGwoXCJzZWxlY3QgKiBmcm9tIGZlYXR1cmVzIHdoZXJlIGZwX2lkID0gPztcIiwgZnBfaWQsIChlcnIsIHJvd3MpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGxlbmd0aCA9IHJvd3MubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGxldCBmcF9pZCwgeCwgeSwgZmVhdHVyZSwgdmFsdWUsIG1heFggPSAwLCBtYXhZID0gMDtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGZwX2lkID0gcm93c1tpXS5mcF9pZDtcbiAgICAgICAgICAgICAgICAgICAgeCA9IHJvd3NbaV0ueDtcbiAgICAgICAgICAgICAgICAgICAgeSA9IHJvd3NbaV0ueTtcbiAgICAgICAgICAgICAgICAgICAgaWYoeCA+IG1heFgpe1xuICAgICAgICAgICAgICAgICAgICAgICAgbWF4WCA9IHg7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYoeSA+IG1heFkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heFkgPSB5O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZlYXR1cmUgPSByb3dzW2ldLmZlYXR1cmU7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gcm93c1tpXS52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZmVhdHVyZXNDYWNoZVtmcF9pZF0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mZWF0dXJlc0NhY2hlW2ZwX2lkXSA9IHt9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGxldCBjb29yZCA9IHggKyBcIl9cIiArIHk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmZlYXR1cmVzQ2FjaGVbZnBfaWRdW2Nvb3JkXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZlYXR1cmVzQ2FjaGVbZnBfaWRdW2Nvb3JkXSA9IHt9O1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mZWF0dXJlc0NhY2hlW2ZwX2lkXVtjb29yZF1bZmVhdHVyZV0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5mZWF0dXJlc0NhY2hlW2ZwX2lkXVtcIm1heF94XCJdID0gbWF4WDtcbiAgICAgICAgICAgICAgICB0aGlzLmZlYXR1cmVzQ2FjaGVbZnBfaWRdW1wibWF4X3lcIl0gPSBtYXhZO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nLmxvZyhcIkZlYXR1cmVzIENhY2hlIGNyZWF0ZWRcIik7XG4gICAgICAgICAgICAgICAgaWYgKHJlc29sdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXRGZWF0dXJlc0NhY2hlKGZwX2lkKXtcbiAgICAgICAgaWYodGhpcy5mZWF0dXJlc0NhY2hlW2ZwX2lkXSA9PT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZWF0dXJlc0NhY2hlW2ZwX2lkXTtcbiAgICB9XG5cbiAgICBnZXRNYXhYKGZwX2lkKSB7XG4gICAgICAgIGlmKHRoaXMuZmVhdHVyZXNDYWNoZVtmcF9pZF0gPT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmVhdHVyZXNDYWNoZVtmcF9pZF1bXCJtYXhfeFwiXTtcbiAgICB9XG5cbiAgICBnZXRNYXhZKGZwX2lkKSB7XG4gICAgICAgIGlmKHRoaXMuZmVhdHVyZXNDYWNoZVtmcF9pZF0gPT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmVhdHVyZXNDYWNoZVtmcF9pZF1bXCJtYXhfeVwiXTtcbiAgICB9XG5cbiAgICBnZXRGZWF0dXJlVmFsdWUoZnBfaWQsIGNvb3JkLCBmZWF0dXJlKXtcbiAgICAgICAgaWYodGhpcy5mZWF0dXJlc0NhY2hlW2ZwX2lkXSA9PT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZih0aGlzLmZlYXR1cmVzQ2FjaGVbZnBfaWRdW2Nvb3JkXSA9PT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZih0aGlzLmZlYXR1cmVzQ2FjaGVbZnBfaWRdW2Nvb3JkXVtmZWF0dXJlXSA9PT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZWF0dXJlc0NhY2hlW2ZwX2lkXVtjb29yZF1bZmVhdHVyZV07XG4gICAgfVxuXG4gICAgZ2V0RmVhdHVyZU51bWJlcihmcF9pZCwgY29vcmQpIHtcbiAgICAgICAgbGV0IGZwLCBjO1xuICAgICAgICBpZih0aGlzLmZlYXR1cmVzQ2FjaGVbZnBfaWRdID09PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgIH1cbiAgICAgICAgZnAgPSB0aGlzLmZlYXR1cmVzQ2FjaGVbZnBfaWRdO1xuICAgICAgICBpZihmcFtjb29yZF0gPT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgfVxuICAgICAgICBjID0gZnBbY29vcmRdO1xuICAgICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMoYyk7XG4gICAgICAgIHJldHVybiBrZXlzLmxlbmd0aDtcbiAgICB9XG5cbiAgICBnZXREYXRhYmFzZSgpe1xuICAgICAgICByZXR1cm4gdGhpcy5kYjtcbiAgICB9XG5cbiAgICBkb1VwZ3JhZGUoZGIsIGRhdGFiYXNlQ29kZVZlcnNpb24sIGNiKSB7XG4gICAgICAgIHRoaXMubG9nLmRlYnVnKFwiRGIuZG9VcGdyYWRlXCIpO1xuXG4gICAgICAgIHN3aXRjaChkYXRhYmFzZUNvZGVWZXJzaW9uKXtcbiAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICBkYi5zZXJpYWxpemUoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBEYi5taWdyYXRpb24xLmZvckVhY2goKG1pZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGIucnVuKG1pZyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVRhYmxlcyhkYiwgY2IpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgZGIuc2VyaWFsaXplKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgRGIubWlncmF0aW9uMi5mb3JFYWNoKChtaWcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRiLnJ1bihtaWcpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVUYWJsZXMoZGIsIGNiKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIGRiLnNlcmlhbGl6ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIERiLm1pZ3JhdGlvbjMuZm9yRWFjaCgobWlnKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYi5ydW4obWlnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlVGFibGVzKGRiLCBjYik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICBkYi5zZXJpYWxpemUoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBEYi5taWdyYXRpb240LmZvckVhY2goKG1pZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGIucnVuKG1pZyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVRhYmxlcyhkYiwgY2IpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICAgICAgZGIuc2VyaWFsaXplKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgRGIubWlncmF0aW9uNS5mb3JFYWNoKChtaWcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRiLnJ1bihtaWcpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVUYWJsZXMoZGIsIGNiKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNTpcbiAgICAgICAgICAgICAgICBkYi5zZXJpYWxpemUoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBEYi5taWdyYXRpb242LmZvckVhY2goKG1pZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGIucnVuKG1pZyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVRhYmxlcyhkYiwgY2IpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY3JlYXRlVGFibGVzKGRiLCBjYikge1xuICAgICAgICB0aGlzLmxvZy5kZWJ1ZyhcIkRiLmNyZWF0ZVRhYmxlc1wiKTtcbiAgICAgICAgbGV0IGNyZWF0ZXMgPSBEYi5jcmVhdGVzO1xuXG4gICAgICAgIGRiLnNlcmlhbGl6ZSgoKSA9PiB7XG4gICAgICAgICAgICBjcmVhdGVzLmZvckVhY2goZnVuY3Rpb24oY3JlYXRlKXtcbiAgICAgICAgICAgICAgICBkYi5ydW4oY3JlYXRlKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBsZXQgZGF0YWJhc2VDb2RlVmVyc2lvbiA9IDA7XG5cbiAgICAgICAgICAgIGRiLmFsbChcInNlbGVjdCAqIGZyb20gc2V0dGluZ3NcIiwgKGVyciwgcm93cykgPT4ge1xuICAgICAgICAgICAgICAgIHJvd3MuZm9yRWFjaChmdW5jdGlvbihyb3cpe1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2gocm93LmtleSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiZGF0YWJhc2VfY29kZV92ZXJzaW9uXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YWJhc2VDb2RlVmVyc2lvbiA9IE51bWJlcihyb3cudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYoZGF0YWJhc2VDb2RlVmVyc2lvbiA8IERiLmRhdGFiYXNlX2NvZGVfdmVyc2lvbil7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZG9VcGdyYWRlKGRiLCBkYXRhYmFzZUNvZGVWZXJzaW9uLCBjYik7XG4gICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgIGlmKGNiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYigpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldFNjYW5uZWRDb29yZHMoZnBfaWQsIGNiKXtcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoXCJEYi5nZXRTY2FubmVkQ29vcmRzXCIpO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBkYi5hbGwoRGIucXVlcnlfZ2V0X3NjYW5uZWRfY29vcmRzLCBmcF9pZCwgY2IpO1xuICAgIH1cblxuICAgIGdldEZsb29yUGxhbnMoY2IpIHtcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoXCJEYi5nZXRGbG9vclBsYW5zXCIpO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBkYi5hbGwoRGIucXVlcnlfZ2V0X2FsbF9mbG9vcnBsYW5zLCBjYik7XG4gICAgfVxuXG4gICAgdXBkYXRlRGF0YWJhc2UoZGF0YSwgY2IpIHtcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoXCJEYi51cGRhdGVEYXRhYmFzZVwiKTtcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgbGV0IHN0bXQgPSBkYi5wcmVwYXJlKERiLnF1ZXJ5X2luc2VydF92ZXJzaW9uKTtcbiAgICAgICAgc3RtdC5ydW4oZGF0YS5kYXRhYmFzZVZlcnNpb24pO1xuICAgICAgICBzdG10LmZpbmFsaXplKCk7XG5cbiAgICAgICAgc3RtdCA9IGRiLnByZXBhcmUoRGIucXVlcnlfdXBkYXRlX3ZlcnNpb24pO1xuICAgICAgICBzdG10LnJ1bihkYXRhLmRhdGFiYXNlVmVyc2lvbik7XG4gICAgICAgIHN0bXQuZmluYWxpemUoKTtcblxuICAgICAgICBpZih0eXBlb2YoZGF0YS5sYXlvdXRfaW1hZ2VzKSAhPSBcInVuZGVmaW5lZFwiICYmIGRhdGEubGF5b3V0X2ltYWdlcy5sZW5ndGggPiAwKXtcbiAgICAgICAgICAgIHN0bXQgPSBkYi5wcmVwYXJlKERiLnF1ZXJ5X2luc2VydF9sYXlvdXQpO1xuICAgICAgICAgICAgbGV0IHVwc3RtdCA9IGRiLnByZXBhcmUoRGIucXVlcnlfdXBkYXRlX2xheW91dCk7XG5cbiAgICAgICAgICAgIGRhdGEubGF5b3V0X2ltYWdlcy5mb3JFYWNoKGZ1bmN0aW9uKGVsKXtcbiAgICAgICAgICAgICAgICBsZXQgaWQgPSBlbC5pZDtcbiAgICAgICAgICAgICAgICBsZXQgZmxvb3JfcGxhbl9uYW1lID0gZWwuZmxvb3JwbGFubmFtZTtcbiAgICAgICAgICAgICAgICBsZXQgc3RyaW5nZGF0YSA9IEpTT04uc3RyaW5naWZ5KGVsKTtcbiAgICAgICAgICAgICAgICBzdG10LnJ1bihpZCwgc3RyaW5nZGF0YSwgZmxvb3JfcGxhbl9uYW1lKTtcbiAgICAgICAgICAgICAgICB1cHN0bXQucnVuKHN0cmluZ2RhdGEsIGZsb29yX3BsYW5fbmFtZSwgaWQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzdG10LmZpbmFsaXplKCk7XG4gICAgICAgICAgICB1cHN0bXQuZmluYWxpemUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNiKCk7XG4gICAgfVxuXG4gICAgc2F2ZVJlYWRpbmdzKHBheWxvYWQsIGNiKXtcbiAgICAgICAgbGV0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBsb2cuZGVidWcoXCJEYi5zYXZlUmVhZGluZ3NcIik7XG5cbiAgICAgICAgbGV0IHN0bXQgPSBkYi5wcmVwYXJlKERiLnF1ZXJ5X2luc2VydF9zY2FuX3Jlc3VsdHMpO1xuICAgICAgICBsZXQgZmluaXNoZWQgPSAwO1xuICAgICAgICBsZXQgeHkgPSBbXTtcbiAgICAgICAgcGF5bG9hZC5mb3JFYWNoKChlbCkgPT4ge1xuICAgICAgICAgICAgZGIuZ2V0KERiLnF1ZXJ5X2dldF9zY2FuX2lkLCAoZXJyLCByb3cpID0+IHtcbiAgICAgICAgICAgICAgICBkYi5ydW4oRGIucXVlcnlfdXBkYXRlX3NjYW5faWQsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc19pZCA9IE51bWJlcihyb3cudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmcF9pZCA9IGVsLmZwX2lkO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBhcF9pZCA9IGVsLmFwX2lkO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB4ID0gTnVtYmVyKGVsLngpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB5ID0gTnVtYmVyKGVsLnkpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSB4ICsgXCJfXCIgKyB5O1xuICAgICAgICAgICAgICAgICAgICBpZih4eS5pbmRleE9mKGtleSkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4eS5wdXNoKGtleSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBOdW1iZXIoZWwudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBvcmlnX3ZhbHVlcyA9IGVsLm9yaWdfdmFsdWVzO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjcmVhdGVkID0gZWwuY3JlYXRlZDtcbiAgICAgICAgICAgICAgICAgICAgc3RtdC5ydW4oc19pZCwgZnBfaWQsIGFwX2lkLCB4LCB5LCB2YWx1ZSwgb3JpZ192YWx1ZXMsIGNyZWF0ZWQsIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbmlzaGVkKys7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmluaXNoZWQgPj0gcGF5bG9hZC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdG10LmZpbmFsaXplKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeHkuZm9yRWFjaCgoY29vcmQsIGkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2FsbCA9IGkgPT09ICh4eS5sZW5ndGggLTEpID8gY2IgOiAoKSA9PiB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgW3gsIHldID0gY29vcmQuc3BsaXQoXCJfXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUthbG1hbihmcF9pZCwgTnVtYmVyKHgpLCBOdW1iZXIoeSksIGNhbGwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB1cGRhdGVLYWxtYW4oZnBfaWQsIHgsIHksIGNiKXtcbiAgICAgICAgbGV0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBsZXQga2FsbWFuID0ge307XG5cbiAgICAgICAgZGIuYWxsKERiLnF1ZXJ5X2dldF9mb3Jfa2FsbWFuLCBmcF9pZCwgeCwgeSwgKGVyciwgcm93cykgPT4ge1xuICAgICAgICAgICAgY29uc3QgaW5zZXJ0ID0gZGIucHJlcGFyZShEYi5xdWVyeV9pbnNlcnRfa2FsbWFuX2VzdGltYXRlcyk7XG4gICAgICAgICAgICBjb25zdCB1cGRhdGUgPSBkYi5wcmVwYXJlKERiLnF1ZXJ5X3VwZGF0ZV9rYWxtYW5fZXN0aW1hdGVzKTtcblxuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGxvZy5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IGRvbmUgPSAwO1xuICAgICAgICAgICAgcm93cy5mb3JFYWNoKChyb3cpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgayA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmIChrYWxtYW5bcm93LmZwX2lkICsgcm93LmFwX2lkICsgcm93LnggKyByb3cueV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBrYWxtYW5bcm93LmZwX2lkICsgcm93LmFwX2lkICsgcm93LnggKyByb3cueV0gPSBuZXcgS2FsbWFuRmlsdGVyKHJvdy5jZXN0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgayA9IGthbG1hbltyb3cuZnBfaWQgKyByb3cuYXBfaWQgKyByb3cueCArIHJvdy55XTtcblxuICAgICAgICAgICAgICAgIGxldCB2YWx1ZXMgPSByb3cudmFsdWVzXG4gICAgICAgICAgICAgICAgICAgIC5zcGxpdChcIixcIilcbiAgICAgICAgICAgICAgICAgICAgLm1hcCgoZWwpID0+IHsgcmV0dXJuIE51bWJlcihlbCk7IH0pO1xuXG4gICAgICAgICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHZhbHVlcy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICAgICAgICAgIGsuYWRkU2FtcGxlKHZhbHVlc1tpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGluc2VydC5ydW4ocm93LmZwX2lkLCByb3cuYXBfaWQsIHJvdy54LCByb3cueSwgay5nZXRFc3RpbWF0ZSgpLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZS5ydW4oay5nZXRFc3RpbWF0ZSgpLCByb3cuZnBfaWQsIHJvdy5hcF9pZCwgcm93LngsIHJvdy55LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb25lKys7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihkb25lID49IHJvd3MubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZy5sb2coXCJGaW5pc2hlZCBpbnNlcnRzIGFuZCB1cGRhdGVzXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc2VydC5maW5hbGl6ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZS5maW5hbGl6ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRiLnNlcmlhbGl6ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRiLnJ1bihcImRlbGV0ZSBmcm9tIGZlYXR1cmVzIHdoZXJlIGZwX2lkID0gPyBhbmQgeCA9ID8gYW5kIHkgPSA/XCIsIGZwX2lkLCByb3cueCwgcm93LnkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYi5ydW4oRGIucXVlcnlfdXBkYXRlX2ZlYXR1cmVzLCBmcF9pZCwgZnBfaWQsIHJvdy54LCByb3cueCwgcm93LnksIHJvdy55LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYihmcF9pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZy5sb2coXCJGaW5pc2hlZCB1cGRhdGluZyBmZWF0dXJlc1wiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlaW5kZXgoKXtcbiAgICAgICAgbGV0IGRiID0gdGhpcy5kYjtcbiAgICAgICAgbGV0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBsb2cubG9nKFwiU3RhcnRpbmcgSW5kZXhpbmdcIik7XG4gICAgICAgIGRiLmFsbChcInNlbGVjdCBmcF9pZCwgeCwgeSBmcm9tIHNjYW5fcmVzdWx0cyBHUk9VUCBCWSBmcF9pZCwgeCwgeTtcIiwgKGVyciwgcm93cykgPT4ge1xuICAgICAgICAgICAgcm93cy5mb3JFYWNoKChyb3csIGkpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBmcF9pZCA9IHJvdy5mcF9pZDtcbiAgICAgICAgICAgICAgICBjb25zdCB4ID0gcm93Lng7XG4gICAgICAgICAgICAgICAgY29uc3QgeSA9IHJvdy55O1xuICAgICAgICAgICAgICAgIGNvbnN0IGNhbGwgPSBpID09PSAocm93cy5sZW5ndGggLTEpID8gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInNob3VsZCBjbG9zZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2cuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYi5jbG9zZSgpO1xuICAgICAgICAgICAgICAgIH0gOiAoKSA9PiB7fTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUthbG1hbihmcF9pZCwgeCwgeSwgY2FsbCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc3RhdGljIHF1ZXJ5X2dldF9pbnRlcnBvbGF0ZV9jb3VudCA9IGBcbiAgICBTRUxFQ1RcbiAgICAgIGYuZmVhdHVyZSwgY291bnQoZi5mZWF0dXJlKSBhcyBmZWF0dXJlX2NvdW50XG4gICAgZnJvbVxuICAgICAgZmVhdHVyZXMgZlxuICAgICAgam9pbiBsYXlvdXRfaW1hZ2VzIGxpIG9uIGYuZnBfaWQgPSBsaS5pZFxuICAgIHdoZXJlXG4gICAgICBsaS5pZCA9ID8gICAgICBcbiAgICBncm91cCBieVxuICAgICAgZi5mZWF0dXJlXG4gICAgb3JkZXIgYnlcbiAgICAgIGZlYXR1cmVfY291bnQgZGVzY1xuICAgIGA7XG5cbiAgICBzdGF0aWMgcXVlcnlfZ2V0X2ludGVycG9sYXRlX2luZGl2aWR1YWxfZmVhdHVyZSA9IGBcbiAgICBzZWxlY3RcbiAgICAgICpcbiAgICBmcm9tXG4gICAgICBmZWF0dXJlcyBmXG4gICAgd2hlcmVcbiAgICAgIGYuZmVhdHVyZSA9ID9cbiAgICAgIGFuZCBmcF9pZCA9ID9cbiAgICBvcmRlciBieVxuICAgICAgZi54IGFzYywgZi55IGFzYztcbiAgICBgO1xuXG4gICAgc3RhdGljIHF1ZXJ5X2luc2VydF9uZXdfaW50ZXJwb2xhdGVkX2ZlYXR1cmUgPSBgXG4gICAgaW5zZXJ0IGludG8gZmVhdHVyZXMgKGZwX2lkLCB4LCB5LCBmZWF0dXJlLCB2YWx1ZSwgaW50ZXJwb2xhdGVkKVxuICAgIHZhbHVlcyAoPywgPywgPywgPywgPywgMSk7XG4gICAgYDtcblxuICAgIGludGVycG9sYXRlKGZwX2lkOiBTdHJpbmcpIHtcbiAgICAgICAgdGhpcy5pbnRlcnBvbGF0ZVgoZnBfaWQpXG4gICAgICAgICAgICAudGhlbigoKSA9PiB0aGlzLmludGVycG9sYXRlWShmcF9pZCkpO1xuICAgIH1cblxuICAgIGludGVycG9sYXRlWChmcF9pZDogU3RyaW5nKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiaW50ZXJwb2xhdGVYXCIpO1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgaW5zZXJ0ID0gdGhpcy5kYi5wcmVwYXJlKERiLnF1ZXJ5X2luc2VydF9uZXdfaW50ZXJwb2xhdGVkX2ZlYXR1cmUpO1xuICAgICAgICAgICAgdGhpcy5kYi5ydW4oXCJkZWxldGUgZnJvbSBmZWF0dXJlcyB3aGVyZSBmcF9pZCA9ID8gYW5kIGludGVycG9sYXRlZCA9IDE7XCIsIGZwX2lkLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYi5hbGwoRGIucXVlcnlfZ2V0X2ludGVycG9sYXRlX2NvdW50LCBmcF9pZCwgKGVyciwgcm93cykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbWF4RmVhdHVyZUNvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgcm93IG9mIHJvd3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZlYXR1cmUgPSByb3cuZmVhdHVyZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZlYXR1cmVfY291bnQgPSByb3cuZmVhdHVyZV9jb3VudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmZWF0dXJlX2NvdW50IDwgbWF4RmVhdHVyZUNvdW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhGZWF0dXJlQ291bnQgPSBmZWF0dXJlX2NvdW50O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRiLmFsbChEYi5xdWVyeV9nZXRfaW50ZXJwb2xhdGVfaW5kaXZpZHVhbF9mZWF0dXJlLCBmZWF0dXJlLCBmcF9pZCwgKGVyciwgcm93cykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCByb3dNYXAgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpUm93IG9mIHJvd3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZihyb3dNYXBbaVJvdy54XSkgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvd01hcFtpUm93LnhdID0gW1tdLCBbXV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3dNYXBbaVJvdy54XVswXS5wdXNoKGlSb3cueSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvd01hcFtpUm93LnhdWzFdLnB1c2goaVJvdy52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgeFZhbCBpbiByb3dNYXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHhWYWxzID0gcm93TWFwW3hWYWxdWzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgeVZhbHMgPSByb3dNYXBbeFZhbF1bMV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCB1bktub3duVmFscyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbWluVmFsID0gTWF0aC5taW4oLi4ueFZhbHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbWF4VmFsID0gTWF0aC5tYXgoLi4ueFZhbHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gbWluVmFsOyBpIDwgbWF4VmFsOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh4VmFscy5pbmRleE9mKGkpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuS25vd25WYWxzLnB1c2goaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG5vd0tub3duID0gTGluZWFySW50ZXJwb2xhdGUodW5Lbm93blZhbHMsIHhWYWxzLCB5VmFscyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGRvbmUgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IobGV0IHVua25vd25ZIG9mIHVuS25vd25WYWxzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnNlcnQucnVuKGZwX2lkLCB4VmFsLCB1bmtub3duWSwgZmVhdHVyZSwgbm93S25vd25baV0sICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb25lKys7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoZG9uZSA9PT0gbm93S25vd24ubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBpbnRlcnBvbGF0ZVkoZnBfaWQ6IFN0cmluZykge1xuICAgICAgICBjb25zb2xlLmxvZyhcImludGVycG9sYXRlWVwiKTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGluc2VydCA9IHRoaXMuZGIucHJlcGFyZShEYi5xdWVyeV9pbnNlcnRfbmV3X2ludGVycG9sYXRlZF9mZWF0dXJlKTtcbiAgICAgICAgICAgIHRoaXMuZGIuYWxsKERiLnF1ZXJ5X2dldF9pbnRlcnBvbGF0ZV9jb3VudCwgZnBfaWQsIChlcnIsIHJvd3MpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgbWF4RmVhdHVyZUNvdW50ID0gMDtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCByb3cgb2Ygcm93cykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmZWF0dXJlID0gcm93LmZlYXR1cmU7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZlYXR1cmVfY291bnQgPSByb3cuZmVhdHVyZV9jb3VudDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZlYXR1cmVfY291bnQgPCBtYXhGZWF0dXJlQ291bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG1heEZlYXR1cmVDb3VudCA9IGZlYXR1cmVfY291bnQ7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYi5hbGwoRGIucXVlcnlfZ2V0X2ludGVycG9sYXRlX2luZGl2aWR1YWxfZmVhdHVyZSwgZmVhdHVyZSwgZnBfaWQsIChlcnIsIHJvd3MpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCByb3dNYXAgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGlSb3cgb2Ygcm93cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2Yocm93TWFwW2lSb3cueV0pID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvd01hcFtpUm93LnldID0gW1tdLCBbXV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm93TWFwW2lSb3cueV1bMF0ucHVzaChpUm93LngpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvd01hcFtpUm93LnldWzFdLnB1c2goaVJvdy52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHlWYWwgaW4gcm93TWFwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHhWYWxzID0gcm93TWFwW3lWYWxdWzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCB5VmFscyA9IHJvd01hcFt5VmFsXVsxXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCB1bktub3duVmFscyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtaW5WYWwgPSBNYXRoLm1pbiguLi54VmFscyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1heFZhbCA9IE1hdGgubWF4KC4uLnhWYWxzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gbWluVmFsOyBpIDwgbWF4VmFsOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHhWYWxzLmluZGV4T2YoaSkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bktub3duVmFscy5wdXNoKGkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBub3dLbm93biA9IExpbmVhckludGVycG9sYXRlKHVuS25vd25WYWxzLCB4VmFscywgeVZhbHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgZG9uZSA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgdW5rbm93blggb2YgdW5Lbm93blZhbHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zZXJ0LnJ1bihmcF9pZCwgdW5rbm93blgsIHlWYWwsIGZlYXR1cmUsIG5vd0tub3duW2ldLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb25lKys7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZG9uZSA9PT0gbm93S25vd24ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IERiOyJdfQ==
//# sourceMappingURL=Db.js.map
