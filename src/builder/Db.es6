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
    constructor(container, DSN){
        debug("Db.constructor");
        this.DSN = DSN;
        this.container = container;
        this.databaseVersion = 11;
        this.database_version = 0;
        this.needsSettings = false;
        this.androidFpDatabase = [];
        this.allFpIds = [];
        this.layoutImages = [];
        if(!this.container.android){
            this.connectToDb();
        }
    }

    saveFloorplan(state, cb) {
        debug("Db.saveFloorplan");
        if(!state){
            state = this.container.state.getState();
        }
        this.replaceMemoryIfExists(state);
        $.ajax({
            url: this.DSN + "/rest/updateDatabase",
            dataType: "json",
            type: "post",
            data: {layout_images: [state]},
            success: (res) => {
                console.log(res);
                if(cb){
                    cb.apply(this, {
                        target:{
                            result: state
                        }
                    });
                }
            },
            error: (res) => {
                console.error(res);
            }
        });
    }

    replaceMemoryIfExists(state){
        for(let i = 0; i < this.layoutImages; i++){
            if(this.layoutImages[i].id == state.id){
                this.layoutImages = this.layoutImages.splice(i, 1);
                this.layoutImages.push(state);
                break;
            }
        }
        this.layoutImages.push(state);
    }

    connectToDb(){
        $.ajax({
            url: this.DSN + "/rest/alive",
            dataType: "json",
            type: "get",
            success: (res) => {
                this.syncWithServer();
            },
            error: (res) => {
                console.error(res);
            }
        });
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


    deleteExistingLayouts() {
        this.layoutImages = [];
    }


    syncWithServer() {
        debug("Db.syncWithServer");
        this.deleteExistingLayouts();
        this.getUpdates();
    }

    getUpdates() {
        debug("Db.getUpdates");
        $.ajax({
            url: this.DSN + "/rest/floorplans",
            method: "get",
            dataType: "json",
            success: (res) => {
                let count = res.length;
                let done = 0;
                let that = this;
                $.each(res, function(key, val){
                    let data = val.layout_image;
                    data.id = String(val.id);
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
                    that.layoutImages.push(data);
                });
                that.reloadFromDb();
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
        this.saveFloorplan(data)
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
        that.container.layout.resetFromDb({
            target:{
                result: that.layoutImages
            }
        });
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
            let event = {target: {}};
            that.layoutImages.forEach(function(item){
                if(item.id == id){
                    event.target.result = item;
                }
            });
            cb.apply(that, [event]);
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
}

export default Db;