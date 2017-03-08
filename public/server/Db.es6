import KalmanFilter from './KalmanFilter';

let sqlite3 = require('sqlite3').verbose();

class Db {

    static database_code_version = 1;
    static query_get_all_floorplans = "select * from layout_images";
    static query_get_database_version = "select value from settings where key = 'database_version';";
    static query_insert_version = "insert or ignore into settings values ('database_version', ?);";
    static query_update_version = "update settings set value = ? where key = 'database_version';";
    static query_insert_layout = "insert or ignore into layout_images values (?, ?, ?);";
    static query_update_layout = "update layout_images set layout_image = ?, floor_plan_name = ? where id = ?;";
    static query_insert_scan_results = "insert or ignore into scan_results values (?, ?, ?, ?, ?, ?, ?, ?);";
    static query_get_scan_results = "select * from scan_results;";
    static query_get_for_kalman = "SELECT s.fp_id, s.ap_id, s.x, s.y, "
    + "group_concat(s.value) `values`, "
    + "case when k.kalman is null then avg(s.value) else k.kalman end `cest`, "
    + "k.kalman FROM scan_results s left join "
    + "kalman_estimates k on s.fp_id = k.fp_id and s.ap_id = k.ap_id and s.x = k.x and s.y = k.y "
    + "GROUP BY s.fp_id, s.ap_id, s.x, s.y;";
    static query_insert_kalman_estimates = "insert or ignore into kalman_estimates values (?, ?, ?, ?, ?);"
    static query_update_kalman_estimates = "update kalman_estimates set kalman = ? where fp_id = ? and ap_id = ? and "
    + " x = ? and y = ?;";
    static query_update_features = "insert into features "
    + " select k.fp_id, k.x, k.y, k.ap_id || k1.ap_id as feature, abs(k.kalman - k1.kalman) as value "
    + " from kalman_estimates k join kalman_estimates k1 on k.fp_id = k1.fp_id and k.x = k1.x and k.y = k1.y "
    + " where k.kalman != 0 and k1.kalman != 0;";
    static query_get_features = "select f.*, abs(value - :feature_value:) diff from features f "
    + " where f.feature = ? and f.fp_id = ? order by diff asc;";

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
        "create index if not exists x_and_y on scan_results (x, y);",

        "CREATE TABLE if not exists kalman_estimates (fp_id TEXT, ap_id TEXT, x INTEGER, "
        + "y INTEGER, kalman REAL, "
        + "CONSTRAINT kalman_estimates_fp_id_ap_id_x_y_pk PRIMARY KEY (fp_id, ap_id, x, y),"
        + "FOREIGN KEY (ap_id, fp_id, x, y) REFERENCES scan_results (ap_id, fp_id, x, y) ON DELETE CASCADE)",

        "CREATE TABLE if not exists features (fp_id TEXT, x INTEGER, y INTEGER, feature TEXT, value REAL, "
        + " CONSTRAINT features_fp_id_x_y_feature_pk PRIMARY KEY (fp_id, x, y, feature));",
        "CREATE UNIQUE INDEX if not exists features_feature_index1 ON features(fp_id,feature,x,y);",
        "CREATE INDEX if not exists features_feature_index2 ON features(feature);"
    ];

    static drops = [
        "drop table if exists layout_images;",
        "drop table if exists settings;",
        "drop table if exists scan_results;",
        "drop table if exists kalman_estimates;"
    ];

    static migration1 = [
        "ALTER TABLE layout_images ADD floor_plan_name TEXT NULL;",
        "update settings set value = '" + Db.database_code_version + "' where key = 'database_code_version';"
    ];

    constructor(log){
        this.log = log;
        this.db = new sqlite3.Database('db.sqlite3');
        this.log.debug("Db.constructor");
    }

    getDatabase(){
        return this.db;
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
    createTables() {
        this.log.debug("Db.createTables");
        let creates = Db.creates;
        let db = this.db;

        db.serialize(function() {
            creates.forEach(function(create){
                db.run(create);
            });
        });

        let databaseCodeVersion = 0;

        db.all("select * from settings", (err, rows) => {
            rows.forEach(function(row){
                switch(row.key){
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
                let floor_plan_name = el.floorplanname;
                let stringdata = JSON.stringify(el);
                stmt.run(id, stringdata, floor_plan_name);
                upstmt.run(stringdata, floor_plan_name, id);
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

        payload.forEach((el) => {
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
        this.updateKalman();
    }

    updateKalman(){
        let log = this.log;
        let db = this.db;
        let kalman = {};

        db.all(Db.query_get_for_kalman, (err, rows) => {
            const insert = db.prepare(Db.query_insert_kalman_estimates);
            const update = db.prepare(Db.query_update_kalman_estimates);
            log.log(err);
            if(err) return;

            let done = 0;
            rows.forEach((row) => {
                let k = false;
                if (typeof(kalman[row.fp_id + row.ap_id + row.x + row.y]) == "undefined") {
                    kalman[row.fp_id + row.ap_id + row.x + row.y] = new KalmanFilter(row.cest);
                }
                k = kalman[row.fp_id + row.ap_id + row.x + row.y];

                let values = row.values
                    .split(",")
                    .map((el) => { return Number(el); });

                for(let i = 0; i < values.length; i++){
                    k.addSample(values[i]);
                }
                insert.run(row.fp_id, row.ap_id, row.x, row.y, k.getEstimate(), () => {
                    update.run(k.getEstimate(), row.fp_id, row.ap_id, row.x, row.y, () => {
                        done++;
                        if(done >= rows.length){
                            insert.finalize();
                            update.finalize();
                            db.exec("delete from features", () => {
                                db.exec(Db.query_update_features);
                            });
                        }
                    });
                });
            });
        });
    }
}


module.exports = Db;