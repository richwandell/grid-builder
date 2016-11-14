;(function($, registry, classes) {
    /**
     * LayoutManager class handles interactions with the page layout
     *
     * @param container
     * @constructor
     */
    var L = function(container) {
        registry.debug ? console.debug(arguments.callee.name) : '';
        this.container = container;
        this.image_name = "";
        $("#builder_canvas_container").css("maxWidth", $(window).width());
    };
    /**
     *
     * @param {String} name
     */
    L.prototype.setFloorplanName = function(name) {
        registry.debug ? console.debug(arguments.callee.name) : '';
        if(name){
            $("#builder_floorplan_name").val(name);
        }else{
            $("#builder_floorplan_name").val("");
        }
    };

    L.prototype.resetFromDb  = function(event, id){
        registry.debug ? console.debug(arguments.callee.name) : '';
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
        debug ? console.debug(arguments.callee.name) : '';
        var that = this;
        this.container.db.loadFloorplan(id, function (event) {
            that.setImageName(event.target.result.name);
            that.setFloorplanName(event.target.result.floorplanname);
            setHandVSpace(event.target.result.hgrid_spaces, event.target.result.vgrid_spaces);
            var image = document.createElement("img");
            image.src = event.target.result.image;
            image.onload = function (event) {
                imageLoaded(image);
            };
            full_grid = event.target.result.grid;

            drawFloorPlan();
        });
    };

    L.prototype.imageLoaded = function(img) {
        registry.debug ? console.debug(arguments.callee.name) : '';
        if(img){
            image = img;
            image_height = img.height;
            image_width = img.width;
        }
        this.container.grid.redraw();
        this.container.grid.resetZoom();
    };

    L.prototype.setImageName = function(name) {
        registry.debug ? console.debug(arguments.callee.name) : '';
        this.image_name = name;
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
        registry.debug ? console.debug(arguments.callee.name) : '';

        var input = event.target;
        var reader = new FileReader();
        var that = this;
        reader.onload = function() {
            var dataURL = reader.result;
            var imageObj = new Image();
            imageObj.src = dataURL;
            imageObj.onload = function(){
                that.imageLoaded(imageObj);
            };
            that.setImageName(input.files[0].name);
            that.container.db.addLayoutImage({
                "name": image_name,
                "image": dataURL,
                "grid": []
            }, that.container.db.reloadFromDb);
        };
        reader.readAsDataURL(input.files[0]);
    };

    classes.LayoutManager = L;
})(jQuery, registry, registry.classes);