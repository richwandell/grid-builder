import $ from 'jquery';
import Registry from './Registry';
import Grid from './Grid';
import Db from './Db';
import LayoutManager from './LayoutManager';
import ContextMenu from './ContextMenu';
import InvalidArgumentException from './CustomExceptions';
import Compass from './Compass';
import State from './State';
import WebSocketClient from './WebSocketClient';
import LocalizationFinishedHandler from './LocalizationFinishedHandler';
import Phone from "./Phone";

let debug = Registry.console.debug;
let superDebug = Registry.console.superDebug;

class Main{
    /**
     *
     */
    constructor(){
        debug("Main.constructor");
        if(!REST_PORT || !HOST_NAME || !PROTOCOL){
            throw InvalidArgumentException("Missing PORT HOST or PROTOCOL");
        }
        this.isAndroid = typeof(Android) !== "undefined";
        let isNode = (typeof process !== "undefined" && typeof require !== "undefined");
        this.isNodeWebkit = typeof(GLOBAL_NW) !== "undefined" && GLOBAL_NW;
        this.systemId = SYSTEM_ID;
        this.mode = "FINGERPRINTING";


        this.state = new State(this);
        this.grid = new Grid(this);
        this.db = new Db(this, PROTOCOL + "://" + HOST_NAME + ":" + REST_PORT);
        this.layout = new LayoutManager(this);
        this.contextMenu = new ContextMenu(this);
        this.compass = new Compass(this);
        if (this.isAndroid) {
            this.localizationFinishedHandler = new LocalizationFinishedHandler(this);
        } else {
            this.webSocket = new WebSocketClient(this, "ws://" + HOST_NAME + ":" + WS_PORT, ['echo-protocol']);
            this.localizationFinishedHandler = this.webSocket;
        }

        this.setupEvents();

        if(this.isNodeWebkit){
            console.log("this is node webkit");
        }
    }

    /**
     * Creates event handlers
     */
    setupEvents(){
        debug("Main.setupEvents");

        $("#start_walk").click((e) => {
            this.grid.startWalk(e);
        });

        $("#toggle_steps").click((e) => {
            this.grid.toggleSteps(e);
        });

        $("#toggle_all_options").change((e) => {
            this.grid.toggleAllOptions(e);
        });
        $("#toggle_interpolation").click((e) => {
            this.grid.toggleInterpolation(e);
        });

        $("#toggle_guess_trail").click((e) => {
            this.grid.toggleGuessTrail(e);
        });

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
            this.db.saveFloorplan(event);
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
                if(this.mode === "FINGERPRINTING") {
                    this.grid.overlayMouseDown(event);
                }
            },
            "mouseup": (event) => {
                if(this.mode === "FINGERPRINTING") {
                    this.grid.overlayMouseUp(event);
                }
            },
            "mousemove": (event) => {
                if(this.mode === "FINGERPRINTING") {
                    this.grid.overlayMouseMove(event);
                }
            },
            "click": (event) => {
                if(this.mode === "FINGERPRINTING") {
                    this.grid.overlayClicked(event);
                }
            },
            "touchstart": (event) => {
                if(this.mode === "FINGERPRINTING") {
                    this.grid.overlayTouchStart(event);
                }
            },
            "touchmove": (event) => {
                if(this.mode === "FINGERPRINTING") {
                    this.grid.overlayTouchMove(event);
                }
            },
            "touchend": (event) => {
                if(this.mode === "FINGERPRINTING") {
                    this.grid.overlayTouchEnd(event);
                }
            }
        });

        $("#toggle_scanned_area").click((event) => {
            this.grid.toggleScannedArea(event);
        });

        $(".builder_clear_selection").click((event) => {
            this.grid.clearMultiSelection(event);
        });

        $("#builder_ignore_selected").click((event) => {
            this.grid.saveIgnoreSelected(event);
        });

        $("#builder_delete_existing").click((event) => {
            this.db.deleteExisting(event);
        });

        $("#builder_download").click((event) => {
            this.downloadFloorplan(event);
        });

        $("#toggle_weights").click((event) => {
            this.grid.toggleWeights();
        });

        $("#toggle_particles").click((event) => {
            this.grid.toggleParticles();
        });

        $("#toggle_lines").click((event) => {
            this.grid.toggleLines();
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
        if(this.isAndroid){
            this.floorPlan = JSON.parse(Android.getData2(Number(fp)));
            this.db.addFloorPlan(this.floorPlan);
            this.layout.displayFloorplan(this.floorPlan.id);
        }
    }

    clickCanvasXY(x, y){
        debug("Main.clickCanvasXY");
        if(this.isAndroid){
            this.grid.clickCanvasXY(x, y);
        }
    }

    toggleScannedArea(){
        debug("Main.toggleScannedArea");
        if(this.isAndroid){
            this.grid.toggleScannedArea();
        }
    }

    updateScannedArea(area){
        debug("Main.updateScannedArea");
        if(this.isAndroid){
            this.grid.updateScannedArea(area);
        }
    }

    setPhoneRotation(rot) {
        if(typeof(this.phone) !== "undefined") {
            this.phone.setRotation(rot * (Math.PI / 180));
            this.grid.redraw();
        }
    }

    setLocalizationResult(x, y, id) {
        this.phone = new Phone(this, x, y, id);
        this.grid.setPhone(this.phone);
        this.grid.redraw();
    }

    setMode(mode) {
        this.mode = mode;
    }

}

const m = new Main();
window.loadFloorPlan = function(fp){
    m.loadFloorPlan(fp);
};

window.setLocalizationResult = function(x, y, id){
    m.setLocalizationResult(x, y, id);
};

window.toggleScannedArea = function(){
    m.toggleScannedArea();
};

window.updateScannedArea = function(area){
    const data = JSON.parse(area);
    m.updateScannedArea(data);
};

window.setPhoneRotation = function(rotation) {
    const rot = Number(rotation);
    m.setPhoneRotation(rot);
};

window.setMode = function(mode) {
    m.setMode(mode);
};