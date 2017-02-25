"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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
        key: "doUpgrade",
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
        key: "createTables",
        value: function createTables(log) {
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
        key: "getFloorPlans",
        value: function getFloorPlans(cb) {
            this.log.debug("Db.getFloorPlans");
            var db = this.db;
            db.all(Db.query_get_all_floorplans, cb);
        }
    }, {
        key: "getDatabaseVersion",
        value: function getDatabaseVersion(cb) {
            this.log.debug("Db.getDatabaseVersion");
            var db = this.db;
            db.all(Db.query_get_database_version, cb);
        }
    }, {
        key: "updateDatabase",
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
        key: "saveReadings",
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
Db.creates = ["CREATE TABLE if not exists layout_images (id TEXT PRIMARY KEY, layout_image TEXT);", "CREATE UNIQUE INDEX if not exists layout_images_id_uindex ON layout_images (id);",

/**
 * Create the settings table with default settings
 */
"create table if not exists settings (key TEXT PRIMARY KEY, value TEXT);", "create unique index if not exists settings_key on settings (key);", "insert or ignore into settings (key, value) values ('database_version', 0);", "insert or ignore into settings (key, value) values ('database_code_version', 0);",

/**
 * ap_id = access point id
 * fp_id = floorplan id
 */
"CREATE TABLE if not exists scan_results " + "(s_id INTEGER, fp_id TEXT, ap_id TEXT, x INTEGER, " + "y INTEGER, value REAL, orig_values TEXT, created TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL, " + "PRIMARY KEY (s_id, fp_id, ap_id), " + "CONSTRAINT scan_results_layout_images_id_fk FOREIGN KEY (fp_id) REFERENCES layout_images (id));", "create index if not exists x_and_y on scan_results (x, y);"];
Db.drops = ["drop table if exists layout_images;", "drop table if exists settings;", "drop table if exists scan_results;"];
Db.migration1 = ["ALTER TABLE scan_results ADD created TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;", "update settings set val = '" + Db.database_code_version + "' where key = 'database_code_version';"];


module.exports = Db;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRiLmVzNiJdLCJuYW1lcyI6WyJzcWxpdGUzIiwicmVxdWlyZSIsInZlcmJvc2UiLCJEYiIsImxvZyIsImRiIiwiRGF0YWJhc2UiLCJkZWJ1ZyIsImRhdGFiYXNlQ29kZVZlcnNpb24iLCJzZXJpYWxpemUiLCJtaWdyYXRpb24xIiwiZm9yRWFjaCIsIm1pZyIsInJ1biIsImNyZWF0ZXMiLCJjcmVhdGUiLCJkYXRhYmFzZVZlcnNpb24iLCJhbGwiLCJlcnIiLCJyb3dzIiwicm93Iiwia2V5IiwiTnVtYmVyIiwidmFsdWUiLCJkYXRhYmFzZV9jb2RlX3ZlcnNpb24iLCJkb1VwZ3JhZGUiLCJjYiIsInF1ZXJ5X2dldF9hbGxfZmxvb3JwbGFucyIsInF1ZXJ5X2dldF9kYXRhYmFzZV92ZXJzaW9uIiwiZGF0YSIsInN0bXQiLCJwcmVwYXJlIiwicXVlcnlfaW5zZXJ0X3ZlcnNpb24iLCJmaW5hbGl6ZSIsInF1ZXJ5X3VwZGF0ZV92ZXJzaW9uIiwibGF5b3V0X2ltYWdlcyIsImxlbmd0aCIsInF1ZXJ5X2luc2VydF9sYXlvdXQiLCJ1cHN0bXQiLCJxdWVyeV91cGRhdGVfbGF5b3V0IiwiZWwiLCJpZCIsInN0cmluZ2RhdGEiLCJKU09OIiwic3RyaW5naWZ5IiwicGF5bG9hZCIsInF1ZXJ5X2luc2VydF9zY2FuX3Jlc3VsdHMiLCJzX2lkIiwiZnBfaWQiLCJhcF9pZCIsIngiLCJ5Iiwib3JpZ192YWx1ZXMiLCJjcmVhdGVkIiwiZHJvcHMiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxJQUFJQSxVQUFVQyxRQUFRLFNBQVIsRUFBbUJDLE9BQW5CLEVBQWQ7O0lBRU1DLEU7QUE4Q0YsZ0JBQVlDLEdBQVosRUFBZ0I7QUFBQTs7QUFDWixhQUFLQSxHQUFMLEdBQVdBLEdBQVg7QUFDQSxhQUFLQyxFQUFMLEdBQVUsSUFBSUwsUUFBUU0sUUFBWixDQUFxQixZQUFyQixDQUFWO0FBQ0EsYUFBS0YsR0FBTCxDQUFTRyxLQUFULENBQWUsZ0JB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LEUsQ0FHS3dCLHdCLEdBQTJCLDZCO0FBSGhDeEIsRSxDQUlLeUIsMEIsR0FBNkIsNEQ7QUFKbEN6QixFLENBS0s2QixvQixHQUF1QixnRTtBQUw1QjdCLEUsQ0FNSytCLG9CLEdBQXVCLCtEO0FBTjVCL0IsRSxDQU9La0MsbUIsR0FBc0Isb0Q7QUFQM0JsQyxFLENBUUtvQyxtQixHQUFzQix5RDtBQVIzQnBDLEUsQ0FTSzJDLHlCLEdBQTRCLHFFO0FBVGpDM0MsRSxDQVdLVyxPLEdBQVUsQ0FDYixvRkFEYSxFQUViLGtGQUZhOztBQUliOzs7QUFHQSx5RUFQYSxFQVFiLG1FQVJhLEVBU2IsNkVBVGEsRUFVYixrRkFWYTs7QUFZYjs7OztBQUlBLDZDQUNBLG9EQURBLEdBRUEsaUdBRkEsR0FHQSxvQ0FIQSxHQUlBLGlHQXBCYSxFQXFCYiw0REFyQmEsQztBQVhmWCxFLENBbUNLbUQsSyxHQUFRLENBQ1gscUNBRFcsRUFFWCxnQ0FGVyxFQUdYLG9DQUhXLEM7QUFuQ2JuRCxFLENBeUNLTyxVLEdBQWEsQ0FDaEIsb0ZBRGdCLEVBRWhCLGdDQUFnQ1AsR0FBR3FCLHFCQUFuQyxHQUEyRCx3Q0FGM0MsQzs7O0FBNEh4QitCLE9BQU9DLE9BQVAsR0FBaUJyRCxFQUFqQiIsImZpbGUiOiJEYi5qcyIsInNvdXJjZXNDb250ZW50IjpbImxldCBzcWxpdGUzID0gcmVxdWlyZSgnc3FsaXRlMycpLnZlcmJvc2UoKTtcblxuY2xhc3MgRGIge1xuXG4gICAgc3RhdGljIGRhdGFiYXNlX2NvZGVfdmVyc2lvbiA9IDA7XG4gICAgc3RhdGljIHF1ZXJ5X2dldF9hbGxfZmxvb3JwbGFucyA9IFwic2VsZWN0ICogZnJvbSBsYXlvdXRfaW1hZ2VzXCI7XG4gICAgc3RhdGljIHF1ZXJ5X2dldF9kYXRhYmFzZV92ZXJzaW9uID0gXCJzZWxlY3QgdmFsdWUgZnJvbSBzZXR0aW5ncyB3aGVyZSBrZXkgPSAnZGF0YWJhc2VfdmVyc2lvbic7XCI7XG4gICAgc3RhdGljIHF1ZXJ5X2luc2VydF92ZXJzaW9uID0gXCJpbnNlcnQgb3IgaWdub3JlIGludG8gc2V0dGluZ3MgdmFsdWVzICgnZGF0YWJhc2VfdmVyc2lvbicsID8pO1wiO1xuICAgIHN0YXRpYyBxdWVyeV91cGRhdGVfdmVyc2lvbiA9IFwidXBkYXRlIHNldHRpbmdzIHNldCB2YWx1ZSA9ID8gd2hlcmUga2V5ID0gJ2RhdGFiYXNlX3ZlcnNpb24nO1wiO1xuICAgIHN0YXRpYyBxdWVyeV9pbnNlcnRfbGF5b3V0ID0gXCJpbnNlcnQgb3IgaWdub3JlIGludG8gbGF5b3V0X2ltYWdlcyB2YWx1ZXMgKD8sID8pO1wiO1xuICAgIHN0YXRpYyBxdWVyeV91cGRhdGVfbGF5b3V0ID0gXCJ1cGRhdGUgbGF5b3V0X2ltYWdlcyBzZXQgbGF5b3V0X2ltYWdlID0gPyB3aGVyZSBpZCA9ID87XCI7XG4gICAgc3RhdGljIHF1ZXJ5X2luc2VydF9zY2FuX3Jlc3VsdHMgPSBcImluc2VydCBvciBpZ25vcmUgaW50byBzY2FuX3Jlc3VsdHMgdmFsdWVzICg/LCA/LCA/LCA/LCA/LCA/LCA/LCA/KTtcIjtcblxuICAgIHN0YXRpYyBjcmVhdGVzID0gW1xuICAgICAgICBcIkNSRUFURSBUQUJMRSBpZiBub3QgZXhpc3RzIGxheW91dF9pbWFnZXMgKGlkIFRFWFQgUFJJTUFSWSBLRVksIGxheW91dF9pbWFnZSBURVhUKTtcIixcbiAgICAgICAgXCJDUkVBVEUgVU5JUVVFIElOREVYIGlmIG5vdCBleGlzdHMgbGF5b3V0X2ltYWdlc19pZF91aW5kZXggT04gbGF5b3V0X2ltYWdlcyAoaWQpO1wiLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDcmVhdGUgdGhlIHNldHRpbmdzIHRhYmxlIHdpdGggZGVmYXVsdCBzZXR0aW5nc1xuICAgICAgICAgKi9cbiAgICAgICAgXCJjcmVhdGUgdGFibGUgaWYgbm90IGV4aXN0cyBzZXR0aW5ncyAoa2V5IFRFWFQgUFJJTUFSWSBLRVksIHZhbHVlIFRFWFQpO1wiLFxuICAgICAgICBcImNyZWF0ZSB1bmlxdWUgaW5kZXggaWYgbm90IGV4aXN0cyBzZXR0aW5nc19rZXkgb24gc2V0dGluZ3MgKGtleSk7XCIsXG4gICAgICAgIFwiaW5zZXJ0IG9yIGlnbm9yZSBpbnRvIHNldHRpbmdzIChrZXksIHZhbHVlKSB2YWx1ZXMgKCdkYXRhYmFzZV92ZXJzaW9uJywgMCk7XCIsXG4gICAgICAgIFwiaW5zZXJ0IG9yIGlnbm9yZSBpbnRvIHNldHRpbmdzIChrZXksIHZhbHVlKSB2YWx1ZXMgKCdkYXRhYmFzZV9jb2RlX3ZlcnNpb24nLCAwKTtcIixcblxuICAgICAgICAvKipcbiAgICAgICAgICogYXBfaWQgPSBhY2Nlc3MgcG9pbnQgaWRcbiAgICAgICAgICogZnBfaWQgPSBmbG9vcnBsYW4gaWRcbiAgICAgICAgICovXG4gICAgICAgIFwiQ1JFQVRFIFRBQkxFIGlmIG5vdCBleGlzdHMgc2Nhbl9yZXN1bHRzIFwiICtcbiAgICAgICAgXCIoc19pZCBJTlRFR0VSLCBmcF9pZCBURVhULCBhcF9pZCBURVhULCB4IElOVEVHRVIsIFwiICtcbiAgICAgICAgXCJ5IElOVEVHRVIsIHZhbHVlIFJFQUwsIG9yaWdfdmFsdWVzIFRFWFQsIGNyZWF0ZWQgVElNRVNUQU1QIERFRkFVTFQgQ1VSUkVOVF9USU1FU1RBTVAgTk9UIE5VTEwsIFwiICtcbiAgICAgICAgXCJQUklNQVJZIEtFWSAoc19pZCwgZnBfaWQsIGFwX2lkKSwgXCIgK1xuICAgICAgICBcIkNPTlNUUkFJTlQgc2Nhbl9yZXN1bHRzX2xheW91dF9pbWFnZXNfaWRfZmsgRk9SRUlHTiBLRVkgKGZwX2lkKSBSRUZFUkVOQ0VTIGxheW91dF9pbWFnZXMgKGlkKSk7XCIsXG4gICAgICAgIFwiY3JlYXRlIGluZGV4IGlmIG5vdCBleGlzdHMgeF9hbmRfeSBvbiBzY2FuX3Jlc3VsdHMgKHgsIHkpO1wiXG4gICAgXTtcblxuICAgIHN0YXRpYyBkcm9wcyA9IFtcbiAgICAgICAgXCJkcm9wIHRhYmxlIGlmIGV4aXN0cyBsYXlvdXRfaW1hZ2VzO1wiLFxuICAgICAgICBcImRyb3AgdGFibGUgaWYgZXhpc3RzIHNldHRpbmdzO1wiLFxuICAgICAgICBcImRyb3AgdGFibGUgaWYgZXhpc3RzIHNjYW5fcmVzdWx0cztcIlxuICAgIF07XG5cbiAgICBzdGF0aWMgbWlncmF0aW9uMSA9IFtcbiAgICAgICAgXCJBTFRFUiBUQUJMRSBzY2FuX3Jlc3VsdHMgQUREIGNyZWF0ZWQgVElNRVNUQU1QIERFRkFVTFQgQ1VSUkVOVF9USU1FU1RBTVAgTk9UIE5VTEw7XCIsXG4gICAgICAgIFwidXBkYXRlIHNldHRpbmdzIHNldCB2YWwgPSAnXCIgKyBEYi5kYXRhYmFzZV9jb2RlX3ZlcnNpb24gKyBcIicgd2hlcmUga2V5ID0gJ2RhdGFiYXNlX2NvZGVfdmVyc2lvbic7XCJcbiAgICBdO1xuXG4gICAgY29uc3RydWN0b3IobG9nKXtcbiAgICAgICAgdGhpcy5sb2cgPSBsb2c7XG4gICAgICAgIHRoaXMuZGIgPSBuZXcgc3FsaXRlMy5EYXRhYmFzZSgnZGIuc3FsaXRlMycpO1xuICAgICAgICB0aGlzLmxvZy5kZWJ1ZyhcIkRiLmNvbnN0cnVjdG9yXCIpO1xuICAgIH1cblxuICAgIGRvVXBncmFkZShkYXRhYmFzZUNvZGVWZXJzaW9uKSB7XG4gICAgICAgIHRoaXMubG9nLmRlYnVnKFwiRGIuZG9VcGdyYWRlXCIpO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBzd2l0Y2goZGF0YWJhc2VDb2RlVmVyc2lvbil7XG4gICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgZGIuc2VyaWFsaXplKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBEYi5taWdyYXRpb24xLmZvckVhY2goZnVuY3Rpb24obWlnKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRiLnJ1bihtaWcpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgdGhlIHNxbGl0ZSB0YWJsZXNcbiAgICAgKi9cbiAgICBjcmVhdGVUYWJsZXMobG9nKSB7XG4gICAgICAgIHRoaXMubG9nLmRlYnVnKFwiRGIuY3JlYXRlVGFibGVzXCIpO1xuICAgICAgICBsZXQgY3JlYXRlcyA9IERiLmNyZWF0ZXM7XG4gICAgICAgIGxldCBkYiA9IHRoaXMuZGI7XG5cbiAgICAgICAgZGIuc2VyaWFsaXplKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY3JlYXRlcy5mb3JFYWNoKGZ1bmN0aW9uKGNyZWF0ZSl7XG4gICAgICAgICAgICAgICAgZGIucnVuKGNyZWF0ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IGRhdGFiYXNlVmVyc2lvbiA9IDA7XG4gICAgICAgIGxldCBkYXRhYmFzZUNvZGVWZXJzaW9uID0gMDtcblxuICAgICAgICBkYi5hbGwoXCJzZWxlY3QgKiBmcm9tIHNldHRpbmdzXCIsIChlcnIsIHJvd3MpID0+IHtcbiAgICAgICAgICAgIHJvd3MuZm9yRWFjaChmdW5jdGlvbihyb3cpe1xuICAgICAgICAgICAgICAgIHN3aXRjaChyb3cua2V5KXtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcImRhdGFiYXNlX3ZlcnNpb25cIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFiYXNlVmVyc2lvbiA9IE51bWJlcihyb3cudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcImRhdGFiYXNlX2NvZGVfdmVyc2lvblwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YWJhc2VDb2RlVmVyc2lvbiA9IE51bWJlcihyb3cudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZihkYXRhYmFzZUNvZGVWZXJzaW9uIDwgRGIuZGF0YWJhc2VfY29kZV92ZXJzaW9uKXtcbiAgICAgICAgICAgICAgICB0aGlzLmRvVXBncmFkZShkYXRhYmFzZUNvZGVWZXJzaW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0Rmxvb3JQbGFucyhjYikge1xuICAgICAgICB0aGlzLmxvZy5kZWJ1ZyhcIkRiLmdldEZsb29yUGxhbnNcIik7XG4gICAgICAgIGxldCBkYiA9IHRoaXMuZGI7XG4gICAgICAgIGRiLmFsbChEYi5xdWVyeV9nZXRfYWxsX2Zsb29ycGxhbnMsIGNiKTtcbiAgICB9XG5cbiAgICBnZXREYXRhYmFzZVZlcnNpb24oY2IpIHtcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoXCJEYi5nZXREYXRhYmFzZVZlcnNpb25cIik7XG4gICAgICAgIGxldCBkYiA9IHRoaXMuZGI7XG4gICAgICAgIGRiLmFsbChEYi5xdWVyeV9nZXRfZGF0YWJhc2VfdmVyc2lvbiwgY2IpO1xuICAgIH1cblxuICAgIHVwZGF0ZURhdGFiYXNlKGRhdGEsIGNiKSB7XG4gICAgICAgIHRoaXMubG9nLmRlYnVnKFwiRGIudXBkYXRlRGF0YWJhc2VcIik7XG4gICAgICAgIGxldCBkYiA9IHRoaXMuZGI7XG4gICAgICAgIGxldCBzdG10ID0gZGIucHJlcGFyZShEYi5xdWVyeV9pbnNlcnRfdmVyc2lvbik7XG4gICAgICAgIHN0bXQucnVuKGRhdGEuZGF0YWJhc2VWZXJzaW9uKTtcbiAgICAgICAgc3RtdC5maW5hbGl6ZSgpO1xuXG4gICAgICAgIHN0bXQgPSBkYi5wcmVwYXJlKERiLnF1ZXJ5X3VwZGF0ZV92ZXJzaW9uKTtcbiAgICAgICAgc3RtdC5ydW4oZGF0YS5kYXRhYmFzZVZlcnNpb24pO1xuICAgICAgICBzdG10LmZpbmFsaXplKCk7XG5cbiAgICAgICAgaWYodHlwZW9mKGRhdGEubGF5b3V0X2ltYWdlcykgIT0gXCJ1bmRlZmluZWRcIiAmJiBkYXRhLmxheW91dF9pbWFnZXMubGVuZ3RoID4gMCl7XG4gICAgICAgICAgICBzdG10ID0gZGIucHJlcGFyZShEYi5xdWVyeV9pbnNlcnRfbGF5b3V0KTtcbiAgICAgICAgICAgIGxldCB1cHN0bXQgPSBkYi5wcmVwYXJlKERiLnF1ZXJ5X3VwZGF0ZV9sYXlvdXQpO1xuXG4gICAgICAgICAgICBkYXRhLmxheW91dF9pbWFnZXMuZm9yRWFjaChmdW5jdGlvbihlbCl7XG4gICAgICAgICAgICAgICAgbGV0IGlkID0gZWwuaWQ7XG4gICAgICAgICAgICAgICAgbGV0IHN0cmluZ2RhdGEgPSBKU09OLnN0cmluZ2lmeShlbCk7XG4gICAgICAgICAgICAgICAgc3RtdC5ydW4oaWQsIHN0cmluZ2RhdGEpO1xuICAgICAgICAgICAgICAgIHVwc3RtdC5ydW4oc3RyaW5nZGF0YSwgaWQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzdG10LmZpbmFsaXplKCk7XG4gICAgICAgICAgICB1cHN0bXQuZmluYWxpemUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNiKCk7XG4gICAgfVxuXG4gICAgc2F2ZVJlYWRpbmdzKHBheWxvYWQsIGNiKXtcbiAgICAgICAgbGV0IGxvZyA9IHRoaXMubG9nO1xuICAgICAgICBsZXQgZGIgPSB0aGlzLmRiO1xuICAgICAgICBsb2cuZGVidWcoXCJEYi5zYXZlUmVhZGluZ3NcIik7XG5cbiAgICAgICAgbGV0IHN0bXQgPSBkYi5wcmVwYXJlKERiLnF1ZXJ5X2luc2VydF9zY2FuX3Jlc3VsdHMpO1xuXG4gICAgICAgIHBheWxvYWQuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgICAgIGxldCBzX2lkID0gTnVtYmVyKGVsLnNfaWQpO1xuICAgICAgICAgICAgbGV0IGZwX2lkID0gZWwuZnBfaWQ7XG4gICAgICAgICAgICBsZXQgYXBfaWQgPSBlbC5hcF9pZDtcbiAgICAgICAgICAgIGxldCB4ID0gTnVtYmVyKGVsLngpO1xuICAgICAgICAgICAgbGV0IHkgPSBOdW1iZXIoZWwueSk7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSBOdW1iZXIoZWwudmFsdWUpO1xuICAgICAgICAgICAgbGV0IG9yaWdfdmFsdWVzID0gZWwub3JpZ192YWx1ZXM7XG4gICAgICAgICAgICBsZXQgY3JlYXRlZCA9IGVsLmNyZWF0ZWQ7XG4gICAgICAgICAgICBzdG10LnJ1bihzX2lkLCBmcF9pZCwgYXBfaWQsIHgsIHksIHZhbHVlLCBvcmlnX3ZhbHVlcywgY3JlYXRlZCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHN0bXQuZmluYWxpemUoKTtcbiAgICB9XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBEYjsiXX0=
//# sourceMappingURL=Db.js.map
