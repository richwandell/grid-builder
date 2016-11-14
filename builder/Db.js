;(function ($, registry, classes) {
    /**
     * Db class handles all database transactions for IndexedDB
     *
     * @constructor
     * @param {Main} container
     */
    var Db = function (container) {
        registry.debug ? console.debug(arguments.callee.name) : '';
        this.container = container;
        //Request our db and set event handlers
        var dbrequest = window.indexedDB.open("BuilderDatabase", 6);
        dbrequest.onupgradeneeded = this.dbonupgradeneeded;
        dbrequest.onsuccess = this.dbonsuccess;
        dbrequest.onerror = this.dbonerror;
    };

    Db.prototype.addLayoutImage = function(data, cb) {
        var t = this.database.transaction(["layout_images"], "readwrite")
            .objectStore("layout_images")
            .add(data);
        t.onsuccess = cb;
    };

    Db.prototype.onupgradeneeded = function (event) {
        debug ? console.debug(arguments.callee.name) : '';
        this.database = event.target.result;
        this.database.createObjectStore("layout_images", {keyPath: "id", autoIncrement: true});
    };

    Db.prototype.onsuccess = function (event) {
        debug ? console.debug(arguments.callee.name) : '';
        this.database = event.target.result;

        this.reloadFromDb();

        if (typeof process != "undefined") {
            if (process.mainModule) {
                process.mainModule.exports.register(the_builder);
            }
        }
    };
    /**
     * Reads all images from the IndexedDB database and calls the LayoutManager resetFromDb method
     * @param {Number} [id]
     */
    Db.prototype.reloadFromDb = function(id){
        debug ? console.debug(arguments.callee.name) : '';
        var that = this;
        $("#builder_select_existing").html("");
        var req = database.transaction(["layout_images"], "readwrite")
            .objectStore("layout_images")
            .getAll();
        req.onsuccess = function(event){
            that.container.layout.resetFromDb(event, id);
        };
    };
    /**
     *
     * @param {Number} id
     * @param {function} cb
     */
    Db.prototype.loadFloorplan = function(id, cb){
        var t = database.transaction(["layout_images"], "readwrite")
            .objectStore("layout_images")
            .get(Number(id));
        t.onsuccess = cb;
    };

    classes.Db = Db;
})(jQuery, registry, registry.classes);

