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
        var menu = new gui.Menu();
        var win = gui.Window.get();
        var menubar = new gui.Menu({type: 'menubar', label: 'Grid Builder'});
        var that = this;


        // Add a item and bind a callback to item
        menu.append(new gui.MenuItem({
            label: 'Clear Selection',
            click: function (event) {
                that.container.grid.clearMultiSelection(event);
            }
        }));

        // Popup as context menu
        $("body").on('contextmenu', function (ev) {
            ev.preventDefault();
            // Popup at place you click
            menu.popup(ev.clientX, ev.clientY);
            return false;
        });

        // Create a menuitem
        var sub1 = new gui.Menu();
        sub1.append(new gui.MenuItem({
            label: 'Broadcast',
            click: function () {
                process.mainModule.exports.startBroadcast();
            }
        }));
        //
        // // You can have submenu!
        menubar.append(new gui.MenuItem({label: 'Sub1', submenu: sub1}));
        //
        // //assign the menubar to window menu
        win.menu = menubar;
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