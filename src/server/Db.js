var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('db.sqlite3');

var query_get_all_floorplans = "select * from layout_images";
var query_get_database_version = "select value from settings where key = 'database_version';";
var query_insert_version = "insert or ignore into settings values ('database_version', ?);";
var query_update_version = "update settings set value = ? where key = 'database_version';";
var query_insert_layout = "insert or ignore into layout_images values (?, ?);";

module.exports = {
    /**
     * Creates the sqlite tables
     */
    createTables: function() {

        var creates = [
            "CREATE TABLE if not exists layout_images (id INTEGER PRIMARY KEY, layout_image TEXT);" +
            "CREATE UNIQUE INDEX if not exists layout_images_id_uindex ON layout_images (id);",
            "create table if not exists settings (key TEXT PRIMARY KEY, value TEXT);",
            "create unique index if not exists settings_key on settings (key);"
        ];
        db.serialize(function() {
            creates.forEach(function(create){
                db.run(create);
            });
        });
    },
    getFloorPlans: function(cb) {
        db.all(query_get_all_floorplans, cb);
    },
    getDatabaseVersion: function(cb) {
        db.all(query_get_database_version, cb);
    },
    updateDatabase: function(data, cb) {
        var stmt = db.prepare(query_insert_version);
        stmt.run(data.databaseVersion);
        stmt.finalize();

        stmt = db.prepare(query_update_version);
        stmt.run(data.databaseVersion);
        stmt.finalize();

        if(typeof(data.layout_images) != "undefined" && data.layout_images.length > 0){
            stmt = db.prepare(query_insert_layout);
            data.layout_images.forEach(function(el){
                var id = el.id;
                var stringdata = JSON.stringify(el);
                stmt.run(id, stringdata);
            });
            stmt.finalize();
        }

        cb();
    }
};