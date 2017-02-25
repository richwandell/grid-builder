;(function($, registry) {
    var classes = registry.classes;
    var InvalidArgumentException = classes.InvalidArgumentException;
    var debug = registry.console.debug;

    var ContextMenu = function(container){
        debug("ContextMenu");
        this.container = container;
        if (typeof require == "function") {
            this.gui = require('nw.gui');
            this.setupMenu();
        }
    };

    ContextMenu.prototype.setupMenu = function(){
        // Create an empty menu
        var gui = this.gui;
        var win = gui.Window.get();
        var that = this;


        //Setup menubar
        var menubar = new gui.Menu({
            type: 'menubar'
        });

        var sub1 = new gui.Menu();
        sub1.append(new gui.MenuItem({
            label: 'Import Floorplan',
            click: function () {
                alert("import floorplan");
            }
        }));

        sub1.append(new gui.MenuItem({
            label: 'Export Floorplan',
            click: function () {
                alert("export floorplan");
            }
        }));



        menubar.createMacBuiltin("your-app-name", {
            hideEdit: true,
            hideWindow: true
        });
        menubar.append(new gui.MenuItem({
            label: 'File',
            submenu: sub1
        }));
        win.menu = menubar;


        //Setup context menu
        var menu = new gui.Menu();
        // Add a item and bind a callback to item
        menu.append(new gui.MenuItem({
            label: 'Clear Selection',
            click: function (event) {
                that.container.grid.clearMultiSelection(event);
            }
        }));

        // Popup as context menu
        $("#builder_canvas_overlay").on('contextmenu', function (ev) {
            ev.preventDefault();
            // Popup at place you click
            menu.popup(ev.clientX, ev.clientY);
            return false;
        });


        //
        // // add a click event to an existing menuItem
        // menu.items[0].click = function () {
        //     console.log("CLICK");
        // };
        this.menu = menu;
        this.win = win;
        this.menubar = menubar;
    };

    classes.ContextMenu = ContextMenu;

})(jQuery, registry);