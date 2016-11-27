;(function($, registry, classes, objs) {

    var Main = function() {
        registry.debug ? console.debug(arguments.callee.name) : '';

        this.grid = new classes.Grid(this);
        this.db = new classes.Db(this);
        this.layout = new classes.LayoutManager(this);
        this.setupEvents();
    };

    Main.prototype.setupEvents = function() {
        //Setup events for elements
        $("#builder_image_input").change(this.layout.imageChanged);
        $("#builder_select_existing").change(this.layout.selectChanged);
        $("#builder_zoom_in").click(this.grid.zoomIn);
        $("#builder_zoom_out").click(this.grid.zoomOut);
        $("#builder_delete_existing").click(this.db.deleteExisting);
        $("#builder_vgrid_spaces, #builder_hgrid_spaces").change(this.layout.spacesChanged);
        $("#builder_add_spaces").click(addSpace);
        $("#builder_grid_color").change(redraw);
        var bngs = $("#builder_named_grid_spaces");
        bngs.on("click", "tr", selectGridFromList);
        bngs.on("mouseenter", "tr", hoverGridFromList);
        bngs.on("mouseleave", "tr", removeHoverGridFromList);
        bngs.on("click", "tr ul", toggleSpaceDisplay);
        $("#save_floorplan").click(saveFloorplan);
        $("#builder_download").click(downloadFloorplan);

        $(overlay).on({
            "mousedown": overlayMouseDown,
            "mouseup": overlayMouseUp,
            "mousemove": overlayMouseMove,
            "click": overlayClicked
        });
    };

    classes.Main = Main;
    objs.Main = [new Main()];
})(jQuery, registry, registry.classes, registry.objs);