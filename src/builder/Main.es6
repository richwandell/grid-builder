import $ from 'jquery';
import Registry from './Registry';
import Grid from './Grid';
import Db from './Db';
import LayoutManager from './LayoutManager';
import ContextMenu from './ContextMenu';

let classes = Registry.classes;
let debug = Registry.console.debug;

class Main{
    /**
     *
     */
    constructor(){
        debug("Main.constructor");
        this.android = typeof(Android) != "undefined";
        let isNode = (typeof process !== "undefined" && typeof require !== "undefined");
        this.nodeWebkit = false;

        //Is this Node.js?
        if(isNode) {
            //If so, test for Node-Webkit
            try {
                this.nodeWebkit = (typeof require('nw.gui') !== "undefined");
            } catch(e) {
                this.nodeWebkit = false;
            }
        }

        this.grid = new Grid(this);
        this.db = new Db(this);
        this.layout = new LayoutManager(this);
        this.contextMenu = new ContextMenu(this);
        this.setupEvents();

        if(this.nodeWebkit){
            process.mainModule.exports.register(this);
        }
    }

    /**
     * Creates event handlers
     */
    setupEvents(){
        debug("Main.setupEvents");

        //First setup layout events
        $("#builder_image_input").change((event) => {
            this.layout.imageChanged(event);
        });
        $("#builder_select_existing").change((event) => {
            this.layout.selectChanged(event);
        });
        $("#builder_vgrid_spaces, #builder_hgrid_spaces").change((event) => {
            this.layout.spacesChanged(event);
        });
        let bngs = $("#builder_named_grid_spaces");
        bngs.on("click", "tr", (event) => {
            this.layout.selectGridFromList(event);
        });
        bngs.on("mouseenter", "tr", (event) => {
            this.layout.hoverGridFromList(event);
        });
        bngs.on("mouseleave", "tr", (event) => {
            this.layout.removeHoverGridFromList(event);
        });
        bngs.on("click", "tr ul", (event) => {
            this.layout.toggleSpaceDisplay(event);
        });
        $("#save_floorplan").click((event) => {
            this.layout.saveFloorplan(event);
        });
        $("#builder_add_spaces").click((event) => {
            this.layout.addSpace(event);
        });

        //Next setup grid events
        $(".builder_zoom_in").click((event) => {
            this.grid.zoomIn(event);
        });
        $(".builder_zoom_out").click((event) => {
            this.grid.zoomOut(event);
        });
        $("#builder_grid_color").change((event) => {
            this.grid.setGridVars({"grid_color": $("#builder_grid_color").val()});
            this.grid.redraw(event);
        });

        $(this.grid.getOverlay()).off();
        $(this.grid.getOverlay()).on({
            "mousedown": (event) =>{
                this.grid.overlayMouseDown(event);
            },
            "mouseup": (event) => {
                this.grid.overlayMouseUp(event);
            },
            "mousemove": (event) => {
                this.grid.overlayMouseMove(event);
            },
            "click": (event) => {
                this.grid.overlayClicked(event);
            },
            "touchstart": (event) => {
                this.grid.overlayTouchStart(event);
            },
            "touchmove": (event) => {
                this.grid.overlayTouchMove(event);
            },
            "touchend": (event) => {
                this.grid.overlayTouchEnd(event);
            }
        });

        $(".builder_clear_selection").click((event) => {
            this.grid.clearMultiSelection(event);
        });

        $("#builder_delete_existing").click((event) => {
            this.db.deleteExisting(event);
        });

        $("#builder_download").click((event) => {
            this.downloadFloorplan(event);
        });
    }

    /**
     * Downloads the floorplan to a .json file
     * @param event
     */
    downloadFloorplan(event) {
        debug("Main.downloadFloorplan");

        let id = parseInt($("#builder_select_existing").val());
        this.db.loadFloorplan(id, (event) => {
            let data = event.target.result;
            let element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(data)));
            element.setAttribute('download', "fplan-" + data.id + ".json");

            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        });
    }

    /**
     *
     * @param {Object} fp The floorplan coming from android
     */
    loadFloorPlan(fp) {
        debug("Main.loadFloorPlan");
        if(this.android){
            this.floorPlan = JSON.parse(Android.getData2(Number(fp)));
            this.db.addFloorPlan(this.floorPlan);
            this.layout.displayFloorplan(this.floorPlan.id);
        }
    }

}

const m = new Main();
window.loadFloorPlan = function(fp){
    m.loadFloorPlan(fp);
};