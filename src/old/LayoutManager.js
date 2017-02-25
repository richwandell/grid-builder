;(function($, registry, classes) {
    var debug = registry.console.debug;
    /**
     * LayoutManager class handles interactions with the page layout
     *
     * @param container
     * @constructor
     */
    var L = function(container) {
        debug("LayoutManager.constructor");
        this.container = container;
        this.floorplanId = false;

        var window_width = $(window).width();
        var window_height = $(window).height();
        var top_row_height = $("#top_row").height();
        $("#builder_canvas_container").css("maxWidth", window_width);
        $("#builder_canvas_container, #builder_container_container").height(window_height - top_row_height);


        var handle_down = false;
        $(window).on({
            "mousedown": function(event){
                if($(event.target).is("#resize_handle")){
                    handle_down = true;
                }
            },
            "mousemove": function(event){
                if(handle_down){
                    var mouse_x = event.clientX;
                    $("#builder_canvas_container_container").width(mouse_x - 25);
                    var window_width = $(window).width();
                    $("#builder_container_container").width(window_width - mouse_x - 20);
                }
            },
            "mouseup": function(){
                handle_down = false;
            }
        });

        var handle_down_top = false;
        $(window).on({
            "mousedown": function(event){
                if($(event.target).is("#resize_handle_top")){
                    handle_down_top = true;
                }
            },
            "mousemove": function(event){
                if(handle_down_top){
                    var mouse_y = event.clientY + 10;
                    $("#top_row").height(mouse_y);
                    var window_height = $(window).height();
                    $("#builder_canvas_container, #builder_container_container").height(window_height - mouse_y);
                }
            },
            "mouseup": function(){
                handle_down_top = false;
            }
        });

        $(window).resize(this.adjustLayout);
    };

    /**
     * We are using a dynamic layout that is readjusted based on window resize event
     */
    L.prototype.adjustLayout = function(){
        var window_width = $(window).width();
        var window_height = $(window).height();
        var top_row_height = $("#top_row").height();
        $("#builder_canvas_container").css("maxWidth", window_width);
        $("#builder_canvas_container, #builder_container_container").height(window_height - top_row_height);
    };

    /**
     *
     * @param {String} name
     */
    L.prototype.setFloorplanName = function(name) {
        debug("LayoutManager.setFloorplanName");
        if(name){
            $("#top_row .page-header small").text(name);
            $("#builder_floorplan_name").val(name);
        }else{
            $("#builder_floorplan_name").val("");
            $("#top_row .page-header small").text("");
        }
    };

    L.prototype.resetFromDb  = function(event, id){
        debug("LayoutManager.resetFromDb");
        $(event.target.result).each(function(i, el){
            $("#builder_select_existing").append("<option value='" + el.id + "'>" + el.name + "</option>");
        });
        if(id){
            $("#builder_select_existing").val(id);
        }
        if(event.target.result.length > 0){
            this.displayFloorplan($("#builder_select_existing").val());
        }
    };

    L.prototype.displayFloorplan = function(id){
        debug("LayoutManager.displayFloorplan");
        var that = this;
        that.floorplanId = id;
        this.container.db.loadFloorplan(id, function (event) {
            that.setImageName(event.target.result.name);
            that.setFloorplanName(event.target.result.floorplanname);
            that.container.grid.setHandVSpace(event.target.result.hgrid_spaces, event.target.result.vgrid_spaces);
            var image = document.createElement("img");
            image.src = event.target.result.image;
            image.onload = function (event) {
                that.imageLoaded(image);
            };
            var grid_color = "#a8fb8b";
            if(typeof(event.target.result.grid_color) != "undefined"){
                grid_color = event.target.result.grid_color;
            }
            that.container.grid.setGridColor(grid_color);
            that.container.grid.setGridVars({
                "full_grid": event.target.result.grid
            });

            that.drawFloorPlan();
        });
    };

    L.prototype.imageLoaded = function(img) {
        debug("LayoutManager.imageLoaded");
        if(img){
            this.container.grid.setGridVars({
                "image": img,
                "image_height": img.height,
                "image_width": img.width
            });
        }
        this.container.grid.redraw();
        this.container.grid.resetZoom();
    };

    L.prototype.setImageName = function(name) {
        debug("LayoutManager.setImageName");
        this.container.grid.setGridVars({"image_name": name});
        $("#builder_table caption#builder_title").html(name);
    };
    /**
     * Event handler fired when the #builder_image_input upload box is changed
     * This function will read from the file upload input box and create a FileReader object and generate a dataURL
     * out of it.
     *
     * The function will then call the addLayoutImage method in the Db class.
     *
     * @param event
     */
    L.prototype.imageChanged = function(event) {
        debug("LayoutManager.imageChanged");

        var input = event.target;
        var reader = new FileReader();
        var that = this;
        reader.onload = function() {
            var dataURL = reader.result;
            var imageObj = new Image();
            imageObj.src = dataURL;
            imageObj.onload = function(){
                that.setImageName(input.files[0].name);
                that.container.db.addLayoutImage({
                    "id": md5(dataURL),
                    "name": that.container.grid.getImageName(),
                    "image": dataURL,
                    "grid": [],
                    "hgrid_spaces": that.container.grid.getHGridSpaces(),
                    "vgrid_spaces": that.container.grid.getVGridSpaces(),
                    "grid_color": that.container.grid.getGridColor()
                }, that.container.db.reloadFromDb);
            };

        };
        reader.readAsDataURL(input.files[0]);
    };

    L.prototype.spacesChanged = function(event) {
        debug("LayoutManager.spacesChanged");
        this.container.grid.setGridVars({
            "hgrid_spaces": $("#builder_hgrid_spaces").val(),
            "vgrid_spaces": $("#builder_vgrid_spaces").val()
        });
        this.imageLoaded();
    };

    L.prototype.addSpace = function(event){
        debug("LayoutManager.addSpace");
        var name = $("#builder_selected_box_name").val();
        var multi_selected_grid = this.container.grid.getMultiSelectedGrid();
        var full_grid = this.container.grid.getFullGrid();
        for(var i = 0; i < multi_selected_grid.length; i++){
            if(multi_selected_grid[i]){
                if(!full_grid[i]){
                    full_grid[i] = [];
                }
                for(var y = 0; y < multi_selected_grid[i].length; y++){
                    if(multi_selected_grid[i][y] || multi_selected_grid[i][y] === ""){
                        full_grid[i][y] = name;
                    }
                }
            }
        }
        this.container.grid.setGridVars({
            "full_grid": full_grid,
            "multi_selected_grid": []
        });
        this.container.grid.redraw();
        this.drawFloorPlan();
    };

    L.prototype.drawFloorPlan = function(){
        debug("LayoutManager.drawFloorPlan");
        $("#builder_named_grid_spaces").html("");
        var names = {};
        var full_grid = this.container.grid.getFullGrid();
        for(var x = 0; x < full_grid.length; x++){
            if(full_grid[x]){
                for(var y = 0; y < full_grid[x].length; y++){
                    if(full_grid[x][y] || full_grid[x][y] === ""){
                        var name = full_grid[x][y];
                        if(name.trim() == ""){
                            name = "no name";
                        }
                        if(!names[name]){
                            names[name] = [];
                        }
                        names[name].push([x, y]);
                    }
                }
            }
        }
        $.each(names, function(k, v){
            var left = "<td class='bngs_name'>" + k + "</td>";
            var right = "<td><ul>";
            for(var i = 0; i < v.length; i++){
                right += "<li data-x='" + v[i][0] + "' data-y='" + v[i][1] + "'>" +
                    "X: " + v[i][0] + " Y: " + v[i][1] +
                    "</li>";
            }
            right += "</ul></td>";
            $("#builder_named_grid_spaces").append("<tr>" + left + right + "</tr>");
        });
    };

    L.prototype.selectGridFromList = function(event) {
        debug("LayoutManager.selectGridFromList");
        // var x = $(event.target).data("x");
        // var y = $(event.target).data("y");
        var name = $(event.currentTarget).find(".bngs_name").text();

        var x, y;
        $.each($(event.currentTarget).find("li"), function(i, o){
            x = $(o).data("x");
            y = $(o).data("y");
        });
        this.setSelectedGrid(x, y, name);
        this.container.grid.redraw();
    };

    L.prototype.setSelectedGrid = function(x, y, data) {
        debug("LayoutManager.setSelectedGrid");
        var selected_grid = [];
        selected_grid[x] = [];
        selected_grid[x][y] = data;
        this.container.grid.setGridVars({"selected_grid": selected_grid});
        $("#builder_selected_box").show();
        $("#builder_selected_box_coords").html("x: " + x + " y: " + y);
        $("#builder_selected_box_name").val(data);
    };

    L.prototype.hoverGridFromList = function(event) {
        debug("LayoutManager.hoverGridFromList");
        this.container.grid.setGridVars({"hover_grid": []});
        var that = this;
        $.each($(event.currentTarget).find("li"), function(i, o){
            var x = $(o).data("x");
            var y = $(o).data("y");
            that.container.grid.setHoverGrid(x, y, name);
        });

        this.container.grid.redraw();
    };

    L.prototype.removeHoverGridFromList = function(event) {
        debug("LayoutManager.removeHoverGridFromList");
        this.container.grid.setGridVars({"hover_grid": []});
        this.container.grid.redraw();
    };

    L.prototype.selectChanged = function(event) {
        debug("LayoutManager.selectChanged");
        this.displayFloorplan(event.target.value);
    };

    L.prototype.toggleSpaceDisplay = function(event) {
        debug("LayoutManager.toggleSpaceDisplay");
        $(event.currentTarget).toggleClass("builder_space_list_open");
    };

    L.prototype.saveFloorplan = function() {
        debug("LayoutManager.saveFloorplan");
        var floorplanname = $("#builder_floorplan_name").val();
        this.setFloorplanName(floorplanname);
        var id = $("#builder_select_existing").val();
        var hs = parseInt($("#builder_hgrid_spaces").val());
        var vs = parseInt($("#builder_vgrid_spaces").val());
        var grid_color = $("#builder_grid_color").val();
        this.container.db.saveFloorplan({
            "id": id,
            "name": this.container.grid.getImageName(),
            "grid": this.container.grid.getFullGrid(),
            "hgrid_spaces": hs,
            "vgrid_spaces": vs,
            "floorplanname": floorplanname,
            "grid_color": grid_color
        });
    };

    classes.LayoutManager = L;
})(jQuery, registry, registry.classes);