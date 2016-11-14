;(function($, registry, classes){

    var Grid = function(container){
        registry.debug ? console.debug(arguments.callee.name) : '';
        this.container = container;
        //Grab and save our canvas
        this.canvas = $("#builder_canvas")[0];
        this.canvas_context = this.canvas.getContext('2d');
        this.overlay = $("#builder_canvas_overlay")[0];
        this.overlay_context = this.overlay.getContext('2d');
    };

    Grid.prototype.redraw = function() {
        registry.debug ? console.debug(arguments.callee.name) : '';
    };

    Grid.prototype.resetZoom = function() {
        registry.debug ? console.debug(arguments.callee.name) : '';
    };

    classes.Grid = Grid ;
})(jQuery, registry, registry.classes);