;(function ($) {
    function loadMenu() {
        console.log = console.error;
        // Load native UI library
        var gui = require('nw.gui');

        // Create an empty menu
        var menu = new gui.Menu();

        // Add a item and bind a callback to item
        menu.append(new gui.MenuItem({
            label: 'Clear Selection',
            click: function () {
                window.builderClearSelection();
            }
        }));

        // Popup as context menu
        $("body").on('contextmenu', function (ev) {
            ev.preventDefault();
            // Popup at place you click
            menu.popup(ev.clientX, ev.clientY);
            return false;
        });

        // Get the current window
        var win = gui.Window.get();

        // Create a menubar for window menu
        var menubar = new gui.Menu({type: 'menubar', label: 'Grid Builder'});


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
    }

    if (typeof require == "function") {
        loadMenu();
    }

})(jQuery);