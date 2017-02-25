;(function($, registry, classes, objs) {

    var debug = registry.console.debug;

    var Main = function() {
        debug("Main.constructor");
        this.android = typeof(Android) != "undefined";

        this.grid = new classes.Grid(this);
        this.db = new classes.Db(this);
        this.layout = new classes.LayoutManager(this);
        this.contextMenu = new classes.ContextMenu(this);
        this.setupEvents();
        if(typeof process != "undefined"){
            if(process.mainModule){
                process.mainModule.exports.register(this);
            }
        }
    };

    Main.prototype.setupEvents = function() {
        debug("Main.setupEvents");
        var that = this;

        //First setup layout events
        $("#builder_image_input").change(function(event){
            that.layout.imageChanged(event);
        });
        $("#builder_select_existing").change(function(event){
            that.layout.selectChanged(event);
        });
        $("#builder_vgrid_spaces, #builder_hgrid_spaces").change(function(event){
            that.layout.spacesChanged(event);
        });
        var bngs = $("#builder_named_grid_spaces");
        bngs.on("click", "tr", function(event){
            that.layout.selectGridFromList(event);
        });
        bngs.on("mouseenter", "tr", function(event){
            that.layout.hoverGridFromList(event);
        });
        bngs.on("mouseleave", "tr", function(event){
            that.layout.removeHoverGridFromList(event);
        });
        bngs.on("click", "tr ul", function(event){
            that.layout.toggleSpaceDisplay(event);
        });
        $("#save_floorplan").click(function(event){
            that.layout.saveFloorplan(event);
        });
        $("#builder_add_spaces").click(function(event){
            that.layout.addSpace(event);
        });

        //Next setup grid events
        $(".builder_zoom_in").click(function(event){
            that.grid.zoomIn(event);
        });
        $(".builder_zoom_out").click(function(event){
            that.grid.zoomOut(event);
        });
        $("#builder_grid_color").change(function(event){
            that.grid.setGridVars({"grid_color": $("#builder_grid_color").val()});
            that.grid.redraw(event);
        });

        $(this.grid.getOverlay()).off();
        $(this.grid.getOverlay()).on({
            "mousedown": function(event){
                that.grid.overlayMouseDown(event);
            },
            "mouseup": function(event){
                that.grid.overlayMouseUp(event);
            },
            "mousemove": function(event){
                that.grid.overlayMouseMove(event);
            },
            "click": function(event){
                that.grid.overlayClicked(event);
            },
            "touchstart": function(event){
                that.grid.overlayTouchStart(event);
            },
            "touchmove": function(event){
                that.grid.overlayTouchMove(event);
            },
            "touchend": function(event){
                that.grid.overlayTouchEnd(event);
            }
        });

        $("#builder_clear_selection").click(function(event){
            that.grid.clearMultiSelection(event);
        });

        $("#builder_delete_existing").click(function(event){
            that.db.deleteExisting(event);
        });

        $("#builder_download").click(function(event){
            that.downloadFloorplan(event);
        });
    };

    Main.prototype.downloadFloorplan = function(event) {
        debug("Main.downloadFloorplan");

        var id = parseInt($("#builder_select_existing").val());
        this.db.loadFloorplan(id, function(event){
            var data = event.target.result;
            var element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(data)));
            element.setAttribute('download', "fplan-" + data.id + ".json");

            element.style.display = 'none';
            document.body.appendChild(element);

            element.click();

            document.body.removeChild(element);
        });
    };

    Main.prototype.loadFloorPlan = function(fp){
        debug("Main.loadFloorPlan");
        if(this.android){
            this.floorPlan = JSON.parse(Android.getData2(Number(fp)));
            this.db.addFloorPlan(this.floorPlan);
            this.layout.displayFloorplan(this.floorPlan.id);
        }
    };

    classes.Main = Main;
    objs.Main = [new Main()];
    window.loadFloorPlan = function(fp){
        objs.Main[0].loadFloorPlan(fp);
    };
})(jQuery, registry, registry.classes, registry.objs);