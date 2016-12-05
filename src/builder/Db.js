;(function ($, registry) {
    var classes = registry.classes;
    var InvalidArgumentException = classes.InvalidArgumentException;
    var debug = registry.console.debug;
    /**
     * Db class handles all database transactions for IndexedDB
     *
     * @constructor
     * @param {Main} container
     */
    var Db = function (container) {
        debug(arguments.callee.name);
        this.container = container;
        this.databaseVersion = 9;
        this.requestDatabase();
    };

    Db.prototype.requestDatabase = function(version){
        var that = this;
        //Request our db and set event handlers
        var dbrequest = window.indexedDB.open("BuilderDatabase", this.databaseVersion);
        dbrequest.onupgradeneeded = function(event) {
            debug("Db.onupgradeneeded");
            that.database = event.target.result;
            if (event.oldVersion == 0){
                that.database.createObjectStore("layout_images", {keyPath: "id", autoIncrement: true});
            }
        };
        dbrequest.onsuccess = function(event){
            debug("Db.onsuccess");
            that.database = event.target.result;
            that.syncWithServer();
        };
    };

    Db.prototype.syncWithServer = function(){
        var that = this;
        this.getServerVersion(function(res){
            console.log(res);
            if(typeof(res.databaseVersion) != "undefined" && res.databaseVersion < that.databaseVersion){
                that.sendUpdates();
            } else {
                that.getUpdates();
            }
        });
    };

    Db.prototype.getUpdates = function(){
        var that = this;
        $.ajax({
            url: "http://localhost:8888/rest/floorplans",
            method: "get",
            dataType: "json",
            success: function(res){
                var count = res.length;
                var done = 0;

                $.each(res, function(key, val){
                    var data = JSON.parse(val.layout_image);
                    data.id = parseInt(data.id);
                    data.hgrid_spaces = parseInt(data.hgrid_spaces);
                    data.vgrid_spaces = parseInt(data.vgrid_spaces);
                    $.each(data.grid, function(key, val){
                        if(val === ""){
                            delete data.grid[key];
                        }
                        $.each(val, function(_key, _val){
                            if(_val === ""){
                                delete data.grid[key][_key];
                            }
                        });
                    });
                    var t = that.database.transaction(["layout_images"], "readwrite")
                        .objectStore("layout_images")
                        .add(data);
                    t.onsuccess = function(){
                        console.log("hi");
                        done++;
                        if(done >= count){
                            that.reloadFromDb();
                        }
                    };
                    t.onerror = function(){
                        done++;
                        if(done >= count){
                            that.reloadFromDb();
                        }
                    }
                });
            }
        });
    };

    Db.prototype.getServerVersion = function(cb){
        var that = this;
        $.ajax({
            "url": "http://localhost:8888/rest/databaseVersion",
            "method": "get",
            "dataType": "json",
            success: function(res){
                cb.apply(that, arguments);
            },
            error: function(res){
                that.reloadFromDb();
            }
        });
    };

    Db.prototype.sendUpdates = function(){
        var that = this;
        var req = that.database.transaction(["layout_images"], "readwrite")
            .objectStore("layout_images")
            .getAll();
        req.onsuccess = function(event){
            $.ajax({
                url: "http://localhost:8888/rest/updateDatabase",
                method: "post",
                dataType: "json",
                data: {
                    databaseVersion: that.databaseVersion,
                    layout_images: event.target.result
                },
                success: function(res){
                    console.log(res);
                }
            });
        };
    };

    Db.prototype.addLayoutImage = function(data, cb) {
        debug("Db.addLayoutImage");
        var t = this.database.transaction(["layout_images"], "readwrite")
            .objectStore("layout_images")
            .add(data);
        var that = this;
        t.onsuccess = function(event){
            cb.apply(that, arguments);
        };
    };

    /**
     * Reads all images from the IndexedDB database and calls the LayoutManager resetFromDb method
     * @param {Number|Event} [id]
     */
    Db.prototype.reloadFromDb = function(id){
        debug("Db.reloadFromDb");
        if(isNaN(id)){
            id = null;
        }
        var that = this;
        $("#builder_select_existing").html("");
        var req = this.database.transaction(["layout_images"], "readwrite")
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
        debug("Db.loadFloorplan");
        var t = this.database.transaction(["layout_images"], "readwrite")
            .objectStore("layout_images")
            .get(Number(id));
        var that = this;
        t.onsuccess = function(event){
            cb.apply(that, arguments);
        };
    };
    /**
     *
     * @param event
     */
    Db.prototype.deleteExisting = function(event) {
        debug("Db.deleteExisting");
        var id = parseInt($("#builder_select_existing").val());
        var t = this.database.transaction(["layout_images"], "readwrite")
            .objectStore("layout_images")
            .delete(id);
        var that = this;
        t.onsuccess = function(event){
            that.reloadFromDb();
        };
    };

    Db.prototype.saveFloorplan = function(vars) {
        debug("Db.saveFloorplan");
        if(typeof(vars) != "object"){
            throw new InvalidArgumentException("saveFloorplan requires an object parameter");
        }
        if(typeof(vars["id"]) != "number"){
            throw new InvalidArgumentException("saveFloorplan missing id");
        }
        var os = this.database.transaction(["layout_images"], "readwrite")
            .objectStore("layout_images");
        var req = os.get(vars["id"]);

        req.onsuccess = function(event){
            var data = event.target.result;
            $.each(vars, function(key, value){
                data[key] = value;
            });
            var requp = os.put(data);
            requp.onsuccess = function(event){
                $("#builder_title").css({
                    "background": "darkseagreen"
                });
                setTimeout(function(){
                    $("#builder_title").css({
                        "background": "white"
                    });
                }, 2000);
            };
        };
    };

    classes.Db = Db;
})(jQuery, registry);

