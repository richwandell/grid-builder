import $ from 'jquery';
import Registry from './Registry';
import Localizer from './Localizer';


let debug = Registry.console.debug;
let superDebug = Registry.console.superDebug;

class ContextMenu {
    constructor(container) {
        debug("ContextMenu");
        this.container = container;
        if(this.container.isNodeWebkit){
            this.gui = GLOBAL_NW_GUI;
            this.scanner = GLOBAL_SCANNER;
            // this.uuid = GLOBAL_UUID;
            // this.fs = GLOBAL_FS;

            // this.id = this.uuid.v4();
            // try {
            //     let oldUUID = this.fs.readFileSync(".uuid", "utf8");
            //     this.id = oldUUID;
            // }catch(e){
            //     this.fs.writeFileSync(".uuid", this.id);
            // }
            // debug(this.id);
            this.setupMenu();
            // this.localizer = new Localizer(this.scanner, this.id, this.container.db.DSN);
        }

    }

    setupMenu(){
        // Create an empty menu
        let gui = this.gui;
        let win = gui.Window.get();
        let that = this;


        //Setup menubar
        let menubar = new gui.Menu({
            type: 'menubar'
        });

        let sub1 = new gui.Menu();
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



        let sub2 = new gui.Menu();

        sub2.append(new gui.MenuItem({
            label: 'Run Localizer',
            click:  () => {
                sub2.items[0].label = 'Stop Localizer';
                if (this.localizer.running) {
                    this.localizer.stop();
                } else {
                    this.localizer.start();
                }
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

        menubar.append(new gui.MenuItem({
            label: 'Run',
            submenu: sub2
        }));


        win.menu = menubar;


        //Setup context menu
        let menu = new gui.Menu();
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
}

export default ContextMenu;