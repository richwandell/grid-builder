;(function($, registry){

    var classes = registry.classes;
    var InvalidArgumentException = classes.InvalidArgumentException;
    var debug = registry.console.debug;
    var superDebug = registry.console.superDebug;

    var Grid = function(container){
        debug(arguments.callee.name);
        this.container = container;


        //Grab and save our canvas
        this.canvas = $("#builder_canvas")[0];
        this.canvas_context = this.canvas.getContext('2d');
        this.overlay = $("#builder_canvas_overlay")[0];
        this.overlay_context = this.overlay.getContext('2d');

        //Setup image properties
        this.image_width = 0;
        this.image_height = 0;
        this.image = null;
        this.image_name = "";

        this.full_grid = [];
        this.multi_selected_grid = [];
        this.selected_grid = [];
        this.hover_grid = [];
        this.vgrid_spaces = parseInt($("#builder_vgrid_spaces").val());
        this.hgrid_spaces = parseInt($("#builder_hgrid_spaces").val());
        this.grid_color = $("#builder_grid_color").val();

        this.grid_lines_enabled = true;
        this.mouse_down = false;
        this.m_x_start = false;
        this.m_y_start = false;
    };

    Grid.prototype.getFullGrid = function() {
        return this.full_grid;
    };

    Grid.prototype.getImageName = function() {
        return this.image_name;
    };

    Grid.prototype.getOverlay = function() {
        return this.overlay;
    };

    Grid.prototype.getMultiSelectedGrid = function() {
        return this.multi_selected_grid;
    };

    Grid.prototype.getHGridSpaces = function() {
        return this.hgrid_spaces;
    };

    Grid.prototype.getVGridSpaces = function() {
        return this.vgrid_spaces;
    };

    Grid.prototype.getGridColor = function() {
        return this.grid_color;
    };

    Grid.prototype.setGridColor = function(color) {
        debug("Grid.setGridColor");
        this.grid_color = color;
        $("#builder_grid_color").val(color);
    };

    Grid.prototype.clearMultiSelection = function(event) {
        debug("Grid.clearMultiSelection");
        this.multi_selected_grid = [];
        this.selected_grid = [];
        this.redraw();
    };

    Grid.prototype.redraw = function() {
        debug("Grid.redraw");
        this.drawGrid();
    };

    Grid.prototype.resetZoom = function() {
        debug("Grid.resetZoom");
        var w = this.canvas.width;
        var h = this.canvas.height;
        var css = {
            "width": parseInt(w)  + "px",
            "height": parseInt(h) + "px"
        };
        $(this.canvas).css(css);
        $(this.overlay).css(css);
    };

    Grid.prototype.setGridVars = function(vars) {
        debug("Grid.setGridVars");
        if(typeof(vars) == "object"){
            var that = this;
            $.each(vars, function(key, value){
                if(typeof(that[key]) != "undefined"){
                    that[key] = value;
                }
            });
            return true;
        }
        throw new InvalidArgumentException("setGridVars requires an object parameter");
    };

    Grid.prototype.setHandVSpace = function(hspace, vspace) {
        debug("Grid.setHandVSpace");
        this.hgrid_spaces = hspace;
        this.vgrid_spaces = vspace;
        $("#builder_hgrid_spaces").val(hspace);
        $("#builder_vgrid_spaces").val(vspace);
    };

    Grid.prototype.setHoverGrid = function(x, y, data) {
        debug(arguments.callee.name);
        if(!this.hover_grid[x]) {
            this.hover_grid[x] = [];
        }
        this.hover_grid[x][y] = data;
    };

    Grid.prototype.zoomIn = function(event) {
        debug("Grid.zoomIn");
        var cw = $(this.canvas).css("width");
        var ch = $(this.canvas).css("height");
        var css = {
            "width": parseInt(cw) * 1.1 + "px",
            "height": parseInt(ch) * 1.1 + "px"
        };
        $(this.canvas).css(css);
        $(this.overlay).css(css);
    };

    Grid.prototype.zoomOut = function(event) {
        debug("Grid.zoomOut");
        var cw = $(this.canvas).css("width");
        var ch = $(this.canvas).css("height");
        var css = {
            "width": parseInt(cw) * .9 + "px",
            "height": parseInt(ch) * .9 + "px"
        };
        $(this.canvas).css(css);
        $(this.overlay).css(css);
    };

    Grid.prototype.overlayClicked = function(event) {
        debug("Grid.overlayClicked");
        var results = this.getCanvasMouseXandY(event);
        this.clickCanvas(results[0], results[1]);
    };

    Grid.prototype.overlayMouseDown = function(event) {
        superDebug("Grid.overlayMouseDown");
        this.mouse_down = true;
        var results = this.getCanvasMouseXandY(event);

        this.m_x_start = results[0];
        this.m_y_start = results[1];
        $(this.canvas).css("opacity", ".7");
        $(this.overlay).css("opacity", "1");
    };

    Grid.prototype.overlayMouseUp = function(event) {
        superDebug("Grid.overlayMouseUp");
        this.mouse_down = false;
        $(this.canvas).css("opacity", "1");
        $(this.overlay).css("opacity", ".5");
        var results = this.getCanvasMouseXandY(event);
        var start = this.getGridXandY(this.m_x_start, this.m_y_start);
        var end = this.getGridXandY(results[0], results[1]);

        var sx, ex;
        if(start[0] > end[0]) {
            sx = end[0];
            ex = start[0];
        }else{
            sx = start[0];
            ex = end[0];
        }
        var sy, ey;
        if(start[1] > end[1]){
            sy = end[1];
            ey = start[1];
        }else{
            sy = start[1];
            ey = end[1];
        }
        for(var x = sx; x <= ex; x++){
            for(var y = sy; y <= ey; y++){
                if(!this.multi_selected_grid[x]){
                    this.multi_selected_grid[x] = [];
                }
                this.multi_selected_grid[x][y] = "";
            }
        }
    };

    Grid.prototype.overlayMouseMove = function(event) {
        superDebug("Grid.overlayMouseMove");
        if(this.mouse_down){
            var results = this.getCanvasMouseXandY(event);
            this.drawBox(this.m_x_start, this.m_y_start, results[0], results[1]);
        }
    };

    Grid.prototype.drawBox = function(sx, sy, ex, ey) {
        debug("Grid.drawBox");
        this.drawGrid();
        var xl = ex - sx, yl = ey - sy;
        this.overlay_context.rect(sx, sy, xl, yl);
        this.overlay_context.stroke();
    };

    Grid.prototype.getCanvasMouseXandY = function(event) {
        debug("Grid.getCanvasMouseXandY");
        var c = this.canvas_context;
        var wi = c.canvas.width;
        var he = c.canvas.height;
        var rect = this.canvas.getBoundingClientRect();
        var thex = event.clientX;
        var they = event.clientY;
        var cx = (thex - rect.left) / (rect.right-rect.left) * wi;
        var cy = (they - rect.top) / (rect.bottom-rect.top) * he;
        return [cx, cy];
    };

    Grid.prototype.clickCanvas = function(cx, cy) {
        debug("Grid.clickCanvas");
        var results = this.getGridXandY(cx, cy);
        var x = results[0], y = results[1];
        var n = $("#builder_selected_box_name").val();
        if(this.full_grid[x]){
            if(this.full_grid[x][y] || this.full_grid[x][y] === ""){
                n = this.full_grid[x][y];
            }
        }
        this.container.layout.setSelectedGrid(x, y, n);
        this.redraw();
        return [x, y];
    };

    Grid.prototype.getGridXandY = function(cx, cy) {
        var c = this.canvas_context;
        var wi = c.canvas.width;
        var he = c.canvas.height;
        var h = this.hgrid_spaces;
        var v = this.vgrid_spaces;
        var xsize = wi / h;
        var x = Math.floor(cx / xsize);
        var ysize = he / v;
        var y = Math.floor(cy / ysize);
        return [x, y];
    };

    Grid.prototype.drawGrid = function() {
        debug("Grid.drawGrid");

        var c = this.canvas_context;
        c.canvas.width = this.image_width;
        c.canvas.height = this.image_height;
        c.drawImage(this.image, 1, 1, this.image_width, this.image_height);

        var co = this.overlay_context;
        co.canvas.width = this.image_width;
        co.canvas.height = this.image_height;

        var wi = c.canvas.width;
        var he = c.canvas.height;

        var ho = this.hgrid_spaces;
        var vi = this.vgrid_spaces;
        var i = 0;

        var color = this.grid_color;

        var full_grid = this.full_grid;
        var selected_grid = this.selected_grid;
        var hover_grid = this.hover_grid;
        var multi_selected_grid = this.multi_selected_grid;

        if (this.grid_lines_enabled){
            for (i = 0; i < vi; i++) {
                c.moveTo(0, (he / vi) * i);
                c.lineTo(wi, (he / vi) * i);
                c.strokeStyle = color;
                c.stroke();
            }
        }

        for(i = 0; i < ho; i++){
            if(this.grid_lines_enabled) {
                c.moveTo((wi / ho) * i, 0);
                c.lineTo((wi / ho) * i, he);
                c.strokeStyle = color;
                c.stroke();
            }

            if(full_grid[i] || full_grid[i] === ""){
                for(var y = 0; y < full_grid[i].length; y++){
                    if(full_grid[i][y] || full_grid[i][y] === ""){
                        co.fillStyle = "red";
                        co.fillRect(
                            (wi / ho) * i,
                            (he / vi) * y,
                            (wi / ho),
                            (he / vi)
                        );
                    }
                }
            }

            if(selected_grid[i] || selected_grid[i] === ""){
                for(var y = 0; y < selected_grid[i].length; y++){
                    if(selected_grid[i][y] || selected_grid[i][y] === ""){
                        c.fillStyle = "green";
                        c.fillRect(
                            (wi / ho) * i,
                            (he / vi) * y,
                            (wi / ho),
                            (he / vi)
                        );
                    }
                }
            }

            if(hover_grid[i] || hover_grid[i] === ""){
                for(var y = 0; y < hover_grid[i].length; y++){
                    if(hover_grid[i][y] || hover_grid[i][y] === ""){
                        co.fillStyle = "gold";
                        co.fillRect(
                            (wi / ho) * i,
                            (he / vi) * y,
                            (wi / ho),
                            (he / vi)
                        );
                    }
                }
            }

            if(multi_selected_grid[i] || multi_selected_grid[i] === ""){
                for(var y = 0; y < multi_selected_grid[i].length; y++){
                    if(multi_selected_grid[i][y] || multi_selected_grid[i][y] === ""){
                        co.fillStyle = "blue";
                        co.fillRect(
                            (wi / ho) * i,
                            (he / vi) * y,
                            (wi / ho),
                            (he / vi)
                        );
                    }
                }
            }
        }
    };

    classes.Grid = Grid ;
})(jQuery, registry);