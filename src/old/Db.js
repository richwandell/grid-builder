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
        debug("Db.constructor");
        this.container = container;
        this.databaseVersion = 11;
        this.database_version = 0;
        this.needsSettings = false;
        this.androidFpDatabase = [];
        this.allFpIds = [];
        if(!this.container.android){
            this.requestDatabase();
        }
    };

    Db.prototype.addFloorPlan = function(fp){
        debug("Db.addFloorPlan");
        if(typeof(fp.id) == "undefined") return false;
        if(this.allFpIds.indexOf(fp.id) > -1){
            this.androidFpDatabase[this.allFpIds.indexOf(fp.id)] = fp;
        }else{
            this.androidFpDatabase.push(fp);
            this.allFpIds.push(fp.id);
        }
    };

    Db.prototype.updateDatabaseVersion = function(version){
        var that = this;
        var os = that.database.transaction(["settings"], "readwrite")
            .objectStore("settings");

        var req = os.get(1);

        req.onsuccess = function(event){
            var settings = event.target.result;
            settings.database_version = version;
            that.database_version = version;
            os.put(settings);
        };
    };

    Db.prototype.requestDatabase = function(version){
        debug("Db.requestDatabase");
        var that = this;
        //Request our db and set event handlers
        var dbrequest = window.indexedDB.open("BuilderDatabase", this.databaseVersion);
        dbrequest.onupgradeneeded = function(event) {
            debug("Db.onupgradeneeded");

            that.database = event.target.result;

            if(!that.database.objectStoreNames.contains("layout_images")){
                that.database.createObjectStore("layout_images", {keyPath: "id"});
            }

            if(!that.database.objectStoreNames.contains("settings")){
                that.database.createObjectStore("settings", {keyPath: "id", autoIncrement: true});
                that.needsSettings = true;
            }
        };
        dbrequest.onsuccess = function(event){
            debug("Db.onsuccess");
            that.database = event.target.result;

            if(that.needsSettings){
                var t = that.database.transaction(["settings"], "readwrite")
                    .objectStore("settings")
                    .add({
                        "database_version": that.database_version
                    });
                t.onsuccess = function(event){
                    that.syncWithServer();
                };
            }else{
                that.syncWithServer();
            }
        };
    };

    Db.prototype.syncWithServer = function(){
        debug("Db.syncWithServer");
        var that = this;
        this.getServerVersion(function(res){
            var os = that.database.transaction(["settings"], "readwrite")
                .objectStore("settings");
            var req = os.get(1);
            req.onsuccess = function(event){
                var dbv = event.target.result.database_version + that.databaseVersion;
                that.database_version = event.target.result.database_version;
                var resdb = typeof(res.databaseVersion) != "undefined" ? parseInt(res.databaseVersion) : dbv;

                if(dbv == resdb){
                    that.reloadFromDb();
                }else if(resdb < dbv){
                    that.sendUpdates();
                } else {
                    that.updateDatabaseVersion(resdb - that.databaseVersion);
                    that.getUpdates();
                }
            };
        });
    };

    Db.prototype.getUpdates = function(){
        debug("Db.getUpdates");
        var that = this;
        $.ajax({
            url: "http://localhost:8888/rest/floorplans",
            method: "get",
            dataType: "json",
            success: function(res){
                var count = res.length;
                var done = 0;

                $.each(res, function(key, val){
                    var data = val.layout_image;
                    data.id = String(data.id);
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
        debug("Db.getServerVersion");
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
        debug("Db.sendUpdates");
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
                    databaseVersion: that.databaseVersion + that.database_version,
                    layout_images: event.target.result
                },
                success: function(res){
                    if(res.success){
                        that.reloadFromDb();
                    }
                }
            });
        };
    };

    Db.prototype.sendOneUpdate = function(layout_image){
        var that = this;
        $.ajax({
            url: "http://localhost:8888/rest/updateDatabase",
            method: "post",
            dataType: "json",
            data: {
                databaseVersion: that.databaseVersion + that.database_version,
                layout_images: [layout_image]
            },
            success: function(res){
                if(res.success){
                    console.log(res);
                }
            }
        });
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
        var that = this;
        if(this.container.android){
            var index = this.allFpIds.indexOf(id);
            if(index > -1){
                var fp = this.androidFpDatabase[index].layout_image;
                var event = {
                    target: {
                        result: fp
                    }
                };
                return cb.apply(that, [event]);
            }
        }else {
            var t = this.database.transaction(["layout_images"], "readwrite")
                .objectStore("layout_images")
                .get(String(id));

            t.onsuccess = function (event) {
                cb.apply(that, arguments);
            };
        }
    };
    /**
     *
     * @param event
     */
    Db.prototype.deleteExisting = function(event) {
        debug("Db.deleteExisting");
        var id = $("#builder_select_existing").val();
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
        if(typeof(vars["id"]) != "string"){
            throw new InvalidArgumentException("saveFloorplan missing id");
        }
        var os = this.database.transaction(["layout_images"], "readwrite")
            .objectStore("layout_images");
        var req = os.get(vars["id"]);
        var that = this;

        req.onsuccess = function(event){
            var data = event.target.result;
            $.each(vars, function(key, value){
                data[key] = value;
            });
            var requp = os.put(data);
            requp.onsuccess = function(event){
                var os = that.database.transaction(["settings"], "readwrite")
                    .objectStore("settings");
                var req = os.get(1);
                req.onsuccess = function(event){
                    var settings = event.target.result;
                    settings.database_version++;
                    that.database_version++;
                    os.put(settings);
                    that.sendOneUpdate(data);
                };
            };
        };
    };

    classes.Db = Db;
})(jQuery, registry);

