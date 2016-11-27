var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('db.sqlite3');

var query_get_all_floorplans = "select * from layout_images";

module.exports = {
    /**
     * Creates the sqlite tables
     */
    createTables: function() {
        var creates = [
            "CREATE TABLE if not exists layout_images (id INTEGER PRIMARY KEY AUTOINCREMENT, layout_image TEXT);" +
            " CREATE UNIQUE INDEX if not exists layout_images_id_uindex ON layout_images (id);"
        ];
        db.serialize(function() {
            creates.forEach(function(create){
                db.run(create);
            });
        });
        db.close();
    },
    getFloorPlans: function(cb) {
        db.all(query_get_all_floorplans, cb);
    }
};