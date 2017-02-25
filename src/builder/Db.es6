import $ from 'jquery';
import Registry from './Registry';
import InvalidArgumentException from './CustomExceptions';

let debug = Registry.console.debug;
let superDebug = Registry.console.superDebug;

class Db {
    /**
     * Db class handles all database transactions for IndexedDB
     *
     * @constructor
     * @param {Main} container
     */
    constructor(container){
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
    }

    addFloorPlan(fp) {
        debug("Db.addFloorPlan");
        if(typeof(fp.id) == "undefined") return false;
        if(this.allFpIds.indexOf(fp.id) > -1){
            this.androidFpDatabase[this.allFpIds.indexOf(fp.id)] = fp;
        }else{
            this.androidFpDatabase.push(fp);
            this.allFpIds.push(fp.id);
        }
    }

    updateDatabaseVersion(version) {
        let os = that.database.transaction(["settings"], "readwrite")
            .objectStore("settings");

        let req = os.get(1);

        req.onsuccess = (event) => {
            let settings = event.target.result;
            settings.database_version = version;
            this.database_version = version;
            os.put(settings);
        };
    }

    requestDatabase(version) {
        debug("Db.requestDatabase");
        //Request our db and set event handlers
        let dbrequest = window.indexedDB.open("BuilderDatabase", this.databaseVersion);
        dbrequest.onupgradeneeded = (event) => {
            debug("Db.onupgradeneeded");

            this.database = event.target.result;

            if(!this.database.objectStoreNames.contains("layout_images")){
                this.database.createObjectStore("layout_images", {keyPath: "id"});
            }

            if(!this.database.objectStoreNames.contains("settings")){
                this.database.createObjectStore("settings", {keyPath: "id", autoIncrement: true});
                this.needsSettings = true;
            }
        };
        dbrequest.onsuccess = (event) => {
            debug("Db.onsuccess");
            this.database = event.target.result;

            if(this.needsSettings){
                let t = this.database.transaction(["settings"], "readwrite")
                    .objectStore("settings")
                    .add({
                        "database_version": this.database_version
                    });
                t.onsuccess = (event) => {
                    this.syncWithServer();
                };
            }else{
                this.syncWithServer();
            }
        }
    }

    syncWithServer() {
        debug("Db.syncWithServer");
        this.getServerVersion((res) => {
            let os = this.database.transaction(["settings"], "readwrite")
                .objectStore("settings");
            let req = os.get(1);
            req.onsuccess = (event) => {
                let dbv = event.target.result.database_version + this.databaseVersion;
                this.database_version = event.target.result.database_version;
                let resdb = typeof(res.databaseVersion) != "undefined" ? parseInt(res.databaseVersion) : dbv;

                if(dbv == resdb){
                    this.reloadFromDb();
                }else if(resdb < dbv){
                    this.sendUpdates();
                } else {
                    this.updateDatabaseVersion(resdb - this.databaseVersion);
                    this.getUpdates();
                }
            };
        });
    }

    getUpdates() {
        debug("Db.getUpdates");
        $.ajax({
            url: "http://localhost:8888/rest/floorplans",
            method: "get",
            dataType: "json",
            success: (res) => {
                let count = res.length;
                let done = 0;
                let that = this;
                $.each(res, function(key, val){
                    let data = val.layout_image;
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
                    let t = that.database.transaction(["layout_images"], "readwrite")
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
    }

    getServerVersion(cb) {
        debug("Db.getServerVersion");
        $.ajax({
            "url": "http://localhost:8888/rest/databaseVersion",
            "method": "get",
            "dataType": "json",
            success: (res) => {
                cb.apply(this, arguments);
            },
            error: (res) => {
                this.reloadFromDb();
            }
        });
    }

    sendUpdates() {
        debug("Db.sendUpdates");
        let that = this;
        let req = that.database.transaction(["layout_images"], "readwrite")
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
    }

    sendOneUpdate(layout_image) {
        let that = this;
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
    }

    addLayoutImage(data, cb) {
        debug("Db.addLayoutImage");
        let t = this.database.transaction(["layout_images"], "readwrite")
            .objectStore("layout_images")
            .add(data);
        let that = this;
        t.onsuccess = function(event){
            cb.apply(that, arguments);
        };
    }

    /**
     * Reads all images from the IndexedDB database and calls the LayoutManager resetFromDb method
     * @param {Number|Event} [id]
     */
    reloadFromDb(id) {
        debug("Db.reloadFromDb");
        if(isNaN(id)){
            id = null;
        }
        let that = this;
        $("#builder_select_existing").html("");
        let req = this.database.transaction(["layout_images"], "readwrite")
            .objectStore("layout_images")
            .getAll();
        req.onsuccess = function(event){
            that.container.layout.resetFromDb(event, id);
        };
    }

    /**
     *
     * @param {Number} id
     * @param {function} cb
     */
    loadFloorplan(id, cb) {
        debug("Db.loadFloorplan");
        let that = this;
        if(this.container.android){
            let index = this.allFpIds.indexOf(id);
            if(index > -1){
                let fp = this.androidFpDatabase[index].layout_image;
                let event = {
                    target: {
                        result: fp
                    }
                };
                return cb.apply(that, [event]);
            }
        }else {
            let t = this.database.transaction(["layout_images"], "readwrite")
                .objectStore("layout_images")
                .get(String(id));

            t.onsuccess = function (event) {
                cb.apply(that, arguments);
            };
        }
    }

    /**
     *
     * @param event
     */
    deleteExisting(event) {
        debug("Db.deleteExisting");
        let id = $("#builder_select_existing").val();
        let t = this.database.transaction(["layout_images"], "readwrite")
            .objectStore("layout_images")
            .delete(id);
        let that = this;
        t.onsuccess = function(event){
            that.reloadFromDb();
        };
    }

    saveFloorplan(vars) {
        debug("Db.saveFloorplan");
        if(typeof(vars) != "object"){
            throw new InvalidArgumentException("saveFloorplan requires an object parameter");
        }
        if(typeof(vars["id"]) != "string"){
            throw new InvalidArgumentException("saveFloorplan missing id");
        }
        let os = this.database.transaction(["layout_images"], "readwrite")
            .objectStore("layout_images");
        let req = os.get(vars["id"]);
        let that = this;

        req.onsuccess = function(event){
            let data = event.target.result;
            $.each(vars, function(key, value){
                data[key] = value;
            });
            let requp = os.put(data);
            requp.onsuccess = function(event){
                let os = that.database.transaction(["settings"], "readwrite")
                    .objectStore("settings");
                let req = os.get(1);
                req.onsuccess = function(event){
                    let settings = event.target.result;
                    settings.database_version++;
                    that.database_version++;
                    os.put(settings);
                    that.sendOneUpdate(data);
                };
            };
        };
    }
}

export default Db;