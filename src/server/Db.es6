let sqlite3 = require('sqlite3').verbose();

class Db {

    static database_code_version = 0;
    static query_get_all_floorplans = "select * from layout_images";
    static query_get_database_version = "select value from settings where key = 'database_version';";
    static query_insert_version = "insert or ignore into settings values ('database_version', ?);";
    static query_update_version = "update settings set value = ? where key = 'database_version';";
    static query_insert_layout = "insert or ignore into layout_images values (?, ?);";
    static query_update_layout = "update layout_images set layout_image = ? where id = ?;";
    static query_insert_scan_results = "insert or ignore into scan_results values (?, ?, ?, ?, ?, ?, ?, ?);";

    static creates = [
        "CREATE TABLE if not exists layout_images (id TEXT PRIMARY KEY, layout_image TEXT);",
        "CREATE UNIQUE INDEX if not exists layout_images_id_uindex ON layout_images (id);",

        /**
         * Create the settings table with default settings
         */
        "create table if not exists settings (key TEXT PRIMARY KEY, value TEXT);",
        "create unique index if not exists settings_key on settings (key);",
        "insert or ignore into settings (key, value) values ('database_version', 0);",
        "insert or ignore into settings (key, value) values ('database_code_version', 0);",

        /**
         * ap_id = access point id
         * fp_id = floorplan id
         */
        "CREATE TABLE if not exists scan_results " +
        "(s_id INTEGER, fp_id TEXT, ap_id TEXT, x INTEGER, " +
        "y INTEGER, value REAL, orig_values TEXT, created TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL, " +
        "PRIMARY KEY (s_id, fp_id, ap_id), " +
        "CONSTRAINT scan_results_layout_images_id_fk FOREIGN KEY (fp_id) REFERENCES layout_images (id));",
        "create index if not exists x_and_y on scan_results (x, y);"
    ];

    static drops = [
        "drop table if exists layout_images;",
        "drop table if exists settings;",
        "drop table if exists scan_results;"
    ];

    static migration1 = [
        "ALTER TABLE scan_results ADD created TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;",
        "update settings set val = '" + Db.database_code_version + "' where key = 'database_code_version';"
    ];

    constructor(log){
        this.log = log;
        this.db = new sqlite3.Database('db.sqlite3');
        this.log.debug("Db.constructor");
    }

    doUpgrade(databaseCodeVersion) {
        this.log.debug("Db.doUpgrade");
        let db = this.db;
        switch(databaseCodeVersion){
            case 0:
                db.serialize(function() {
                    Db.migration1.forEach(function(mig){
                        db.run(mig);
                    });
                });
                break;
        }
    }

    /**
     * Creates the sqlite tables
     */
    createTables(log) {
        this.log.debug("Db.createTables");
        let creates = Db.creates;
        let db = this.db;

        db.serialize(function() {
            creates.forEach(function(create){
                db.run(create);
            });
        });

        let databaseVersion = 0;
        let databaseCodeVersion = 0;

        db.all("select * from settings", (err, rows) => {
            rows.forEach(function(row){
                switch(row.key){
                    case "database_version":
                        databaseVersion = Number(row.value);
                        break;

                    case "database_code_version":
                        databaseCodeVersion = Number(row.value);
                        break;
                }
            });
            if(databaseCodeVersion < Db.database_code_version){
                this.doUpgrade(databaseCodeVersion);
            }
        });
    }

    getFloorPlans(cb) {
        this.log.debug("Db.getFloorPlans");
        let db = this.db;
        db.all(Db.query_get_all_floorplans, cb);
    }

    getDatabaseVersion(cb) {
        this.log.debug("Db.getDatabaseVersion");
        let db = this.db;
        db.all(Db.query_get_database_version, cb);
    }

    updateDatabase(data, cb) {
        this.log.debug("Db.updateDatabase");
        let db = this.db;
        let stmt = db.prepare(Db.query_insert_version);
        stmt.run(data.databaseVersion);
        stmt.finalize();

        stmt = db.prepare(Db.query_update_version);
        stmt.run(data.databaseVersion);
        stmt.finalize();

        if(typeof(data.layout_images) != "undefined" && data.layout_images.length > 0){
            stmt = db.prepare(Db.query_insert_layout);
            let upstmt = db.prepare(Db.query_update_layout);

            data.layout_images.forEach(function(el){
                let id = el.id;
                let stringdata = JSON.stringify(el);
                stmt.run(id, stringdata);
                upstmt.run(stringdata, id);
            });
            stmt.finalize();
            upstmt.finalize();
        }

        cb();
    }

    saveReadings(payload, cb){
        let log = this.log;
        let db = this.db;
        log.debug("Db.saveReadings");

        let stmt = db.prepare(Db.query_insert_scan_results);

        payload.forEach(function (el) {
            let s_id = Number(el.s_id);
            let fp_id = el.fp_id;
            let ap_id = el.ap_id;
            let x = Number(el.x);
            let y = Number(el.y);
            let value = Number(el.value);
            let orig_values = el.orig_values;
            let created = el.created;
            stmt.run(s_id, fp_id, ap_id, x, y, value, orig_values, created);
        });

        stmt.finalize();
    }
}


module.exports = Db;