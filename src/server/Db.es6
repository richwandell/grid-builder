import KalmanFilter from './KalmanFilter';

let sqlite3 = require('sqlite3').verbose();

class Db {

    static database_code_version = 4;
    static query_get_all_floorplans = "select * from layout_images";
    static query_get_database_version = "select value from settings where key = 'database_version';";
    static query_insert_version = "insert or ignore into settings values ('database_version', ?);";
    static query_update_version = "update settings set value = ? where key = 'database_version';";
    static query_insert_layout = "insert or ignore into layout_images values (?, ?, ?);";
    static query_update_layout = "update layout_images set layout_image = ?, floor_plan_name = ? where id = ?;";
    static query_insert_scan_results = "insert into scan_results values (?, ?, ?, ?, ?, ?, ?, ?);";
    static query_get_scan_results = "select * from scan_results;";
    static query_get_for_kalman = "SELECT s.fp_id, s.ap_id, s.x, s.y, "
    + "group_concat(s.value) `values`, "
    + "case when k.kalman is null then avg(s.value) else k.kalman end `cest`, "
    + "k.kalman FROM scan_results s left join "
    + "kalman_estimates k on s.fp_id = k.fp_id and s.ap_id = k.ap_id and s.x = k.x and s.y = k.y "
    + " where s.fp_id = ? GROUP BY s.fp_id, s.ap_id, s.x, s.y;";
    static query_insert_kalman_estimates = "insert or ignore into kalman_estimates values (?, ?, ?, ?, ?);";
    static query_update_kalman_estimates = "update kalman_estimates set kalman = ? where fp_id = ? and ap_id = ? and "
    + " x = ? and y = ?;";
    static query_update_features = "insert into features "
    + " select k.fp_id, k.x, k.y, k.ap_id || k1.ap_id as feature, abs(k.kalman - k1.kalman) as value "
    + " from kalman_estimates k join kalman_estimates k1 on k.fp_id = k1.fp_id and k.x = k1.x and k.y = k1.y"
    + " where value != 0 and k.fp_id = ? and k1.fp_id = ?";
    static query_update_oldest_features = "select k.fp_id, k.x, k.y, k.ap_id || k1.ap_id as feature, "
    + " abs(k.kalman - k1.kalman) as value, :scan_id: s_id from kalman_estimates k join "
    + " kalman_estimates k1 on k.fp_id = k1.fp_id and k.x = k1.x and k.y = k1.y and k.ap_id < k1.ap_id where"
    + " k.kalman != 0 and k1.kalman != 0 and k.fp_id = ? and k1.fp_id = ?;";
    static query_get_features = "select f.*, abs(value - :feature_value:) diff from features f "
    + " where f.feature = ? and f.fp_id = ? order by diff asc;";
    static query_get_scanned_coords = "select count(*) as num_features, x, y from features where fp_id = ? "
    + " group by x, y;";
    static query_get_min_sid = "select min(s_id) from features where fp_id = ?";
    static query_get_scan_id = "select value + 1 as value from settings where key = 'scan_id';";
    static query_update_scan_id = "update settings set value = value + 1 where key = 'scan_id';";
    static query_get_max_min_particles = "select min(x), max(x), min(y), max(y) from features where fp_id = ?;";
    static query_get_particles = "select particles from particles where id = ?";
    static query_insert_particles = "insert or ignore into particles values (?, ?);";
    static query_update_particles = "update particles set particles = ? where id = ?";

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
        "CREATE INDEX if not exists features_feature_index2 ON features(feature);",
        "CREATE TABLE if not exists particles (id INT PRIMARY KEY NOT NULL, particles TEXT);",
        "CREATE UNIQUE INDEX if not exists particles_id_uindex ON particles (id);"
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

    static migration2 = [
        "ALTER TABLE features ADD s_id INT NULL;",
        "DROP INDEX features_feature_index1;",
        "DROP INDEX features_feature_index2;",
        "CREATE TABLE featuresa8d1 (fp_id TEXT, x INTEGER, y INTEGER, feature TEXT, value REAL, s_id INTEGER,"
        + " CONSTRAINT features_fp_id_x_y_feature_s_id_pk PRIMARY KEY (fp_id, x, y, feature, s_id));",
        "CREATE UNIQUE INDEX features_feature_index1 ON featuresa8d1 (fp_id, feature, x, y, s_id);",
        "INSERT INTO featuresa8d1(fp_id, x, y, feature, value, s_id) SELECT fp_id, x, y, feature, value, s_id FROM features;",
        "DROP TABLE features;",
        "ALTER TABLE featuresa8d1 RENAME TO features;",
        "CREATE INDEX features_feature_index2 ON features(feature);",
        "update settings set value = '" + Db.database_code_version + "' where key = 'database_code_version';"
    ];

    static migration3 = [
        "insert or ignore into settings values ('scan_id', 64);",
        "update settings set value = '" + Db.database_code_version + "' where key = 'database_code_version';"
    ];

    static migration4 = [
        "drop table features;",
        "CREATE TABLE features (fp_id TEXT, x INTEGER, y INTEGER, feature TEXT, value REAL, "
        + " CONSTRAINT features_fp_id_x_y_feature_pk PRIMARY KEY (fp_id, x, y, feature));",
        "update settings set value = '" + Db.database_code_version + "' where key = 'database_code_version';"
    ];

    constructor(log){
        this.log = log;
        this.log.debug("Db.constructor");

        this.db = new sqlite3.cached.Database('db/db.sqlite3');
        this.db.serialize(() => {
            this.db.exec("PRAGMA journal_mode = WAL;");
            this.db.exec("PRAGMA cache_size = 4096000;");
            this.db.exec("PRAGMA optimize;");
            this.db.exec("PRAGMA busy_timeout = 150000;");
        });
        this.featuresCachePromise = new Promise((resolve, reject) => {
            this.createTables(this.db, () => {
                this.createFeaturesCache(resolve, reject);
            });
        });
    }

    getStateParticles(id, cb){
        let db = this.db;
        db.get(Db.query_get_particles, id, (err, row) => {
            let particles = [];
            if(row !== undefined && row.particles !== null){
                particles = JSON.parse(row.particles);
            }

            cb(particles);
        });
    }

    setStateParticles(id, particles){
        let db = this.db;
        let p = JSON.stringify(particles);
        db.serialize(() => {
            db.run(Db.query_insert_particles, id, p);
            db.run(Db.query_update_particles, id, p);
        });
    }

    createFeaturesCache(resolve, reject){
        this.featuresCache = {};
        this.db.all("select * from features;", (err, rows) => {
            if(err){
                reject();
                return;
            }
            const length = rows.length;
            let fp_id, x, y, feature, value;
            for(let i = 0; i < length; i++){
                fp_id = rows[i].fp_id;
                x = rows[i].x;
                y = rows[i].y;
                feature = rows[i].feature;
                value = rows[i].value;
                if(typeof(this.featuresCache[fp_id]) == "undefined"){
                    this.featuresCache[fp_id] = {};
                }
                let coord = x + "_" + y;
                if(typeof(this.featuresCache[fp_id][coord]) == "undefined") {
                    this.featuresCache[fp_id][coord] = {};
                }

                this.featuresCache[fp_id][coord][feature] = value;
            }
            this.log.log("Features Cache created: " + JSON.stringify(Object.keys(this.featuresCache)));
            resolve();
        });
    }

    getFeaturesCache(fp_id){
        if(this.featuresCache[fp_id] === undefined){
            return false;
        }
        return this.featuresCache[fp_id];
    }

    getFeatureValue(fp_id, coord, feature){
        if(this.featuresCache[fp_id] === undefined){
            return false;
        }
        if(this.featuresCache[fp_id][coord] === undefined){
            return false;
        }
        if(this.featuresCache[fp_id][coord][feature] === undefined){
            return false;
        }
        return this.featuresCache[fp_id][coord][feature];
    }

    getDatabase(){
        return this.db;
    }

    doUpgrade(db, databaseCodeVersion, cb) {
        this.log.debug("Db.doUpgrade");

        switch(databaseCodeVersion){
            case 0:
                db.serialize(() => {
                    Db.migration1.forEach((mig) => {
                        db.run(mig);
                    });
                    this.createTables(db, cb);
                });
                break;

            case 1:
                db.serialize(() => {
                    Db.migration2.forEach((mig) => {
                        db.run(mig);
                    });
                    this.createTables(db, cb);
                });
                break;

            case 2:
                db.serialize(() => {
                    Db.migration3.forEach((mig) => {
                        db.run(mig);
                    });
                    this.createTables(db, cb);
                });
                break;

            case 3:
                db.serialize(() => {
                    Db.migration4.forEach((mig) => {
                        db.run(mig);
                    });
                    this.createTables(db, cb);
                });
                break;
        }
    }

    createTables(db, cb) {
        this.log.debug("Db.createTables");
        let creates = Db.creates;

        db.serialize(() => {
            creates.forEach(function(create){
                db.run(create);
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
                    this.doUpgrade(db, databaseCodeVersion, cb);
                }else{
                    cb();
                }
            });
        });
    }

    getScannedCoords(fp_id, cb){
        this.log.debug("Db.getScannedCoords");
        let db = this.db;
        db.all(Db.query_get_scanned_coords, fp_id, cb);
    }

    getFloorPlans(cb) {
        this.log.debug("Db.getFloorPlans");
        let db = this.db;
        db.all(Db.query_get_all_floorplans, cb);
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
        let finished = 0;
        db.get(Db.query_get_scan_id, (err, row) => {
            db.run(Db.query_update_scan_id);
            payload.forEach((el) => {
                let s_id = Number(row.value);
                let fp_id = el.fp_id;
                let ap_id = el.ap_id;
                let x = Number(el.x);
                let y = Number(el.y);
                let value = Number(el.value);
                let orig_values = el.orig_values;
                let created = el.created;
                stmt.run(s_id, fp_id, ap_id, x, y, value, orig_values, created, (err) => {
                    finished++;
                    if(finished >= payload.length){
                        stmt.finalize();
                        this.updateKalman(fp_id, cb);
                    }
                });
            });
        });
    }

    updateKalman(fp_id, cb){
        let log = this.log;
        let db = this.db;
        let kalman = {};

        db.all(Db.query_get_for_kalman, fp_id, (err, rows) => {
            const insert = db.prepare(Db.query_insert_kalman_estimates);
            const update = db.prepare(Db.query_update_kalman_estimates);

            if(err) {
                log.error(err);
                return;
            }

            let done = 0;
            rows.forEach((row) => {
                let k = false;
                if (kalman[row.fp_id + row.ap_id + row.x + row.y] === undefined) {
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
                            db.serialize(() => {
                                db.run("delete from features where fp_id = ?", fp_id);
                                db.run(Db.query_update_features, fp_id, fp_id, () => {
                                    cb();
                                });
                            });
                        }
                    });
                });
            });
        });
    }
}


module.exports = Db;