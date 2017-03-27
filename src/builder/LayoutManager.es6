import $ from 'jquery';
import Registry from './Registry';


let debug = Registry.console.debug;
let superDebug = Registry.console.superDebug;

class LayoutManager {

    constructor(container){
        debug("LayoutManager.constructor");
        this.container = container;
        this.floorplanId = false;

        let window_width = $(window).width();
        let window_height = $(window).height();
        let top_row_height = $("#top_row").height();
        $("#builder_canvas_container").css("maxWidth", window_width);
        $("#builder_canvas_container, #builder_container_container").height(window_height - top_row_height);


        let handle_down = false;
        $(window).on({
            "mousedown": function(event){
                if($(event.target).is("#resize_handle")){
                    handle_down = true;
                }
            },
            "mousemove": function(event){
                if(handle_down){
                    let mouse_x = event.clientX;
                    $("#builder_canvas_container_container").width(mouse_x - 25);
                    let window_width = $(window).width();
                    $("#builder_container_container").width(window_width - mouse_x - 20);
                }
            },
            "mouseup": function(){
                handle_down = false;
            }
        });

        let handle_down_top = false;
        $(window).on({
            "mousedown": function(event){
                if($(event.target).is("#resize_handle_top")){
                    handle_down_top = true;
                }
            },
            "mousemove": function(event){
                if(handle_down_top){
                    let mouse_y = event.clientY + 10;
                    $("#top_row").height(mouse_y);
                    let window_height = $(window).height();
                    $("#builder_canvas_container, #builder_container_container").height(window_height - mouse_y);
                }
            },
            "mouseup": function(){
                handle_down_top = false;
            }
        });

        $(window).resize(this.adjustLayout);
    }

    /**
     * We are using a dynamic layout that is readjusted based on window resize event
     */
    adjustLayout(){
        let window_width = $(window).width();
        let window_height = $(window).height();
        let top_row_height = $("#top_row").height();
        $("#builder_canvas_container").css("maxWidth", window_width);
        $("#builder_canvas_container, #builder_container_container").height(window_height - top_row_height);
    }

    /**
     *
     * @param {String} name
     */
    setFloorplanName(name) {
        debug("LayoutManager.setFloorplanName");
        if(name){
            $("#top_row .page-header small").text(name);
            $("#builder_floorplan_name").val(name);
        }else{
            $("#builder_floorplan_name").val("");
            $("#top_row .page-header small").text("");
        }
    }

    resetFromDb(event, id){
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
    }

    displayFloorplan(id){
        debug("LayoutManager.displayFloorplan");
        let that = this;
        that.floorplanId = id;
        this.container.db.loadFloorplan(id, function (event) {
            that.setImageName(event.target.result.name);
            that.setFloorplanName(event.target.result.floorplanname);
            that.container.grid.setHandVSpace(event.target.result.hgrid_spaces, event.target.result.vgrid_spaces);
            let image = document.createElement("img");
            image.src = event.target.result.image;
            image.onload = function (event) {
                that.imageLoaded(image);
            };
            let grid_color = "#a8fb8b";
            if(typeof(event.target.result.grid_color) != "undefined"){
                grid_color = event.target.result.grid_color;
            }
            that.container.grid.setGridColor(grid_color);
            that.container.grid.setGridVars({
                "full_grid": event.target.result.grid
            });
            that.container.grid.setImageString(event.target.result.image);
            if(event.target.result.rotation){
                that.container.compass.setRotation(event.target.result.rotation);
            }

            that.drawFloorPlan();
        });
    }

    imageLoaded(img) {
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
    }

    setImageName(name) {
        debug("LayoutManager.setImageName");
        this.container.grid.setGridVars({"image_name": name});
        $("#builder_table caption#builder_title").html(name);
    }

    /**
     * Event handler fired when the #builder_image_input upload box is changed
     * This function will read from the file upload input box and create a FileReader object and generate a dataURL
     * out of it.
     *
     * The function will then call the addLayoutImage method in the Db class.
     *
     * @param event
     */
    imageChanged(event) {
        debug("LayoutManager.imageChanged");

        let input = event.target;
        let reader = new FileReader();
        let that = this;
        reader.onload = function() {
            let dataURL = reader.result;
            let imageObj = new Image();
            imageObj.src = dataURL;
            imageObj.onload = function(){
                that.setImageName(input.files[0].name);
                that.container.db.saveFloorplan({
                    "id": md5(dataURL),
                    "name": that.container.grid.getImageName(),
                    "image": dataURL,
                    "grid": [],
                    "hgrid_spaces": that.container.grid.getHGridSpaces(),
                    "vgrid_spaces": that.container.grid.getVGridSpaces(),
                    "grid_color": that.container.grid.getGridColor(),
                    "rotation": 0
                }, that.container.db.reloadFromDb);
            };

        };
        reader.readAsDataURL(input.files[0]);
    }

    spacesChanged(event) {
        debug("LayoutManager.spacesChanged");
        this.container.grid.setGridVars({
            "hgrid_spaces": $("#builder_hgrid_spaces").val(),
            "vgrid_spaces": $("#builder_vgrid_spaces").val()
        });
        this.imageLoaded();
    }

    addSpace(event){
        debug("LayoutManager.addSpace");
        let name = $("#builder_selected_box_name").val();
        let multi_selected_grid = this.container.grid.getMultiSelectedGrid();
        let full_grid = this.container.grid.getFullGrid();
        for(let i = 0; i < multi_selected_grid.length; i++){
            if(multi_selected_grid[i]){
                if(!full_grid[i]){
                    full_grid[i] = [];
                }
                for(let y = 0; y < multi_selected_grid[i].length; y++){
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
    }

    drawFloorPlan(){
        debug("LayoutManager.drawFloorPlan");
        $("#builder_named_grid_spaces").html("");
        let names = {};
        let full_grid = this.container.grid.getFullGrid();
        for(let x = 0; x < full_grid.length; x++){
            if(full_grid[x]){
                for(let y = 0; y < full_grid[x].length; y++){
                    if(full_grid[x][y] || full_grid[x][y] === ""){
                        let name = full_grid[x][y];
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
            let left = "<td class='bngs_name'>" + k + "</td>";
            let right = "<td><ul>";
            for(let i = 0; i < v.length; i++){
                right += "<li data-x='" + v[i][0] + "' data-y='" + v[i][1] + "'>" +
                    "X: " + v[i][0] + " Y: " + v[i][1] +
                    "</li>";
            }
            right += "</ul></td>";
            $("#builder_named_grid_spaces").append("<tr>" + left + right + "</tr>");
        });
        if(this.container.android){
            this.container.grid.toggleScannedArea();
        }
    }

    selectGridFromList(event) {
        debug("LayoutManager.selectGridFromList");
        // var x = $(event.target).data("x");
        // var y = $(event.target).data("y");
        let name = $(event.currentTarget).find(".bngs_name").text();

        let x, y;
        $.each($(event.currentTarget).find("li"), function(i, o){
            x = $(o).data("x");
            y = $(o).data("y");
        });
        this.setSelectedGrid(x, y, name);
        this.container.grid.redraw();
    }

    setSelectedGrid(x, y, data) {
        debug("LayoutManager.setSelectedGrid");
        let selected_grid = [];
        selected_grid[x] = [];
        selected_grid[x][y] = data;
        this.container.grid.setGridVars({"selected_grid": selected_grid});
        $("#builder_selected_box").show();
        $("#builder_selected_box_coords").html("x: " + x + " y: " + y);
        $("#builder_selected_box_name").val(data);
    }

    hoverGridFromList(event) {
        debug("LayoutManager.hoverGridFromList");
        this.container.grid.setGridVars({"hover_grid": []});
        let that = this;
        $.each($(event.currentTarget).find("li"), function(i, o){
            let x = $(o).data("x");
            let y = $(o).data("y");
            that.container.grid.setHoverGrid(x, y, name);
        });

        this.container.grid.redraw();
    }

    removeHoverGridFromList(event) {
        debug("LayoutManager.removeHoverGridFromList");
        this.container.grid.setGridVars({"hover_grid": []});
        this.container.grid.redraw();
    }

    selectChanged(event) {
        debug("LayoutManager.selectChanged");
        this.displayFloorplan(event.target.value);
    }

    toggleSpaceDisplay(event) {
        debug("LayoutManager.toggleSpaceDisplay");
        $(event.currentTarget).toggleClass("builder_space_list_open");
    }


}

export default LayoutManager;