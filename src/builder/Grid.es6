import $ from 'jquery';
import Registry from './Registry';
import InvalidArgumentException from './CustomExceptions';
import Phone from './Phone';
import Macbook from './Macbook';

let debug = Registry.console.debug;
let superDebug = Registry.console.superDebug;

class Grid{

    constructor(container){
        debug("Grid.constructor");
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
        this.imageString = "";

        this.full_grid = [];
        this.multi_selected_grid = [];
        this.selected_grid = [];
        this.hover_grid = [];
        this.fp_grid = [];
        this.scanned_grid = [];
        this.vgrid_spaces = parseInt($("#builder_vgrid_spaces").val());
        this.hgrid_spaces = parseInt($("#builder_hgrid_spaces").val());
        this.grid_color = $("#builder_grid_color").val();

        this.grid_lines_enabled = true;
        this.mouse_down = false;
        this.m_x_start = false;
        this.m_y_start = false;
        this.touch_cx = false;
        this.touch_cy = false;
        this.show_scanned_area = false;
        this.phones = [];
        this.phoneIds = [];
        this.computers = [];
        this.computerIds = [];
    }

    setPhone(phone: Phone){
        let index = this.phoneIds.indexOf(phone.id);

        if (index === 0) {
            this.phones.shift();
            this.phoneIds.shift();
        } else if(index > -1) {
            this.phones = this.phones.splice(index, 1);
            this.phoneIds = this.phoneIds.splice(index, 1);
        }

        this.phones.push(phone);
        this.phoneIds.push(phone.id);
    }

    setComputer(comp: Macbook){
        const index = this.computerIds.indexOf(comp.id);
        if (index === 0) {
            this.computers.shift();
            this.computerIds.shift();
        } else if(index > -1) {
            this.computers = this.computers.splice(index, 1);
            this.computerIds = this.computerIds.splice(index, 1);
        }

        this.computers.push(comp);
        this.computerIds.push(comp.id);
    }

    updateScannedArea(area){

        let u = (res) => {
            let tmp_grid = [];
            res.forEach(function(row){
                if(typeof(tmp_grid[row.x]) == "undefined"){
                    tmp_grid[row.x] = [];
                }
                tmp_grid[row.x][row.y] = row.num_features;
            });
            this.scanned_grid = tmp_grid;
            this.show_scanned_area = true;
            this.redraw();
        };

        if(area){
            u(area);
        }else{
            this.container.db.getScannedCoords(this.container.state.getId(), u);
        }
    }

    toggleScannedArea(event){
        if(this.show_scanned_area == false){
            this.updateScannedArea();
        }else{
            this.show_scanned_area = false;
            this.redraw();
        }
    }

    setImageString(image){
        this.imageString = image;
    }

    getImageString(){
        return this.imageString;
    }

    overlayTouchEnd(event) {
        if(this.touch_cx && this.touch_cy) {
            let xy = this.clickCanvas(this.touch_cx, this.touch_cy);
        }
    }

    overlayTouchMove(event) {
        this.touch_cx = false;
        this.touch_cy = false;
    }

    overlayTouchStart(event) {
        let c = this.canvas.getContext('2d');
        let rect = this.canvas.getBoundingClientRect();
        let touch = event.touches[0];
        let thex = touch.clientX;
        let they = touch.clientY;
        let cx = (thex - rect.left);
        let cy = (they - rect.top);
        this.touch_cx = cx;
        this.touch_cy = cy;
    }

    /**
     *
     * @returns {Array}
     */
    getFullGrid() {
        if(typeof(this.full_grid) != "undefined") {
            return this.full_grid;
        }
        return [];
    }

    getImageName() {
        return this.image_name;
    }

    getOverlay() {
        return this.overlay;
    }

    getMultiSelectedGrid() {
        return this.multi_selected_grid;
    }

    getHGridSpaces() {
        return this.hgrid_spaces;
    }

    getVGridSpaces() {
        return this.vgrid_spaces;
    }

    getGridColor() {
        return this.grid_color;
    }

    setGridColor(color) {
        debug("Grid.setGridColor");
        this.grid_color = color;
        $("#builder_grid_color").val(color);
    }

    clearMultiSelection(event) {
        debug("Grid.clearMultiSelection");
        this.multi_selected_grid = [];
        this.selected_grid = [];
        this.redraw();
    }

    redraw() {
        debug("Grid.redraw");
        this.drawGrid();
    }

    resetZoom() {
        debug("Grid.resetZoom");
        let w = this.canvas.width;
        let h = this.canvas.height;
        let css = {
            "width": parseInt(w)  + "px",
            "height": parseInt(h) + "px"
        };
        $(this.canvas).css(css);
        $(this.overlay).css(css);
    }

    setGridVars(vars) {
        debug("Grid.setGridVars");
        if(typeof(vars) == "object"){
            let that = this;
            $.each(vars, function(key, value){
                if(typeof(that[key]) != "undefined"){
                    that[key] = value;
                }
            });
            return true;
        }
        throw new InvalidArgumentException("setGridVars requires an object parameter");
    }

    setHandVSpace(hspace, vspace) {
        debug("Grid.setHandVSpace");
        this.hgrid_spaces = hspace;
        this.vgrid_spaces = vspace;
        $("#builder_hgrid_spaces").val(hspace);
        $("#builder_vgrid_spaces").val(vspace);
    }

    setHoverGrid(x, y, data) {
        debug("Grid.setHoverGrid");
        if(!this.hover_grid[x]) {
            this.hover_grid[x] = [];
        }
        this.hover_grid[x][y] = data;
    }

    zoomIn(event) {
        debug("Grid.zoomIn");
        let cw = $(this.canvas).css("width");
        let ch = $(this.canvas).css("height");
        let css = {
            "width": parseInt(cw) * 1.1 + "px",
            "height": parseInt(ch) * 1.1 + "px"
        };
        $(this.canvas).css(css);
        $(this.overlay).css(css);
        if(this.container.android){
            let size = this.getCurrentSize();
            Android.setCurrentSize(parseInt(size[0]), parseInt(size[1]));
        }
    }

    getCurrentSize(){
        return [$(this.canvas).css("width"), $(this.canvas).css("height")];
    }

    zoomOut(event) {
        debug("Grid.zoomOut");
        let cw = $(this.canvas).css("width");
        let ch = $(this.canvas).css("height");
        let css = {
            "width": parseInt(cw) * .9 + "px",
            "height": parseInt(ch) * .9 + "px"
        };
        $(this.canvas).css(css);
        $(this.overlay).css(css);
        if(this.container.android){
            let size = this.getCurrentSize();
            Android.setCurrentSize(parseInt(size[0]), parseInt(size[1]));
        }
    }

    overlayClicked(event) {
        debug("Grid.overlayClicked");
        let results = this.getCanvasMouseXandY(event);
        this.clickCanvas(results[0], results[1]);
    }

    overlayMouseDown(event) {
        superDebug("Grid.overlayMouseDown");
        this.mouse_down = true;
        let results = this.getCanvasMouseXandY(event);

        this.m_x_start = results[0];
        this.m_y_start = results[1];
        $(this.canvas).css("opacity", ".7");
        $(this.overlay).css("opacity", "1");
    }

    overlayMouseUp(event) {
        superDebug("Grid.overlayMouseUp");
        this.mouse_down = false;
        $(this.canvas).css("opacity", "1");
        $(this.overlay).css("opacity", ".5");
        let results = this.getCanvasMouseXandY(event);
        let start = this.getGridXandY(this.m_x_start, this.m_y_start);
        let end = this.getGridXandY(results[0], results[1]);

        let sx, ex;
        if(start[0] > end[0]) {
            sx = end[0];
            ex = start[0];
        }else{
            sx = start[0];
            ex = end[0];
        }
        let sy, ey;
        if(start[1] > end[1]){
            sy = end[1];
            ey = start[1];
        }else{
            sy = start[1];
            ey = end[1];
        }
        for(let x = sx; x <= ex; x++){
            for(let y = sy; y <= ey; y++){
                if(!this.multi_selected_grid[x]){
                    this.multi_selected_grid[x] = [];
                }
                this.multi_selected_grid[x][y] = "";
            }
        }
    }

    overlayMouseMove(event) {
        superDebug("Grid.overlayMouseMove");
        if(this.mouse_down){
            let results = this.getCanvasMouseXandY(event);
            this.drawBox(this.m_x_start, this.m_y_start, results[0], results[1]);
        }
    }

    drawBox(sx, sy, ex, ey) {
        debug("Grid.drawBox");
        this.drawGrid();
        let xl = ex - sx, yl = ey - sy;
        this.overlay_context.rect(sx, sy, xl, yl);
        this.overlay_context.stroke();
    }

    getCanvasMouseXandY(event) {
        debug("Grid.getCanvasMouseXandY");
        let c = this.canvas_context;
        let wi = c.canvas.width;
        let he = c.canvas.height;
        let rect = this.canvas.getBoundingClientRect();
        let thex = event.clientX;
        let they = event.clientY;
        let cx = (thex - rect.left) / (rect.right-rect.left) * wi;
        let cy = (they - rect.top) / (rect.bottom-rect.top) * he;
        return [cx, cy];
    }

    clickCanvasXY(x, y){
        let n = $("#builder_selected_box_name").val();
        let full_grid = this.getFullGrid();
        if(full_grid[x]){
            if(full_grid[x][y] || full_grid[x][y] === ""){
                n = full_grid[x][y];
            }
        }
        this.container.layout.setSelectedGrid(x, y, n);
        this.redraw();
        return [x, y];
    }

    clickCanvas(cx, cy) {
        debug("Grid.clickCanvas");
        let results = this.getGridXandY(cx, cy);
        let x = results[0], y = results[1];
        if(this.container.android){
            Android.setSpace(x, y, this.container.layout.floorplanId);
        }
        return this.clickCanvasXY(x, y);
    }

    getGridXandY(cx, cy) {
        let c = this.canvas_context;
        let wi = c.canvas.width;
        let he = c.canvas.height;
        let h = this.hgrid_spaces;
        let v = this.vgrid_spaces;
        let xsize = wi / h;
        let x = Math.floor(cx / xsize);
        let ysize = he / v;
        let y = Math.floor(cy / ysize);
        return [x, y];
    }

    getCanvasCoordinates(x, y){
        let c = this.canvas_context;
        let wi = c.canvas.width;
        let he = c.canvas.height;
        let ho = this.hgrid_spaces;
        let vi = this.vgrid_spaces;
        return [(wi / ho) * x, (he / vi) * y, (wi / ho), (he / vi)];
    }

    drawGrid() {
        debug("Grid.drawGrid");

        let c = this.canvas_context;
        c.canvas.width = this.image_width;
        c.canvas.height = this.image_height;
        c.drawImage(this.image, 1, 1, this.image_width, this.image_height);

        let co = this.overlay_context;
        co.canvas.width = this.image_width;
        co.canvas.height = this.image_height;

        let wi = c.canvas.width;
        let he = c.canvas.height;

        let ho = this.hgrid_spaces;
        let vi = this.vgrid_spaces;
        let i = 0;

        let color = this.grid_color;

        let full_grid = this.getFullGrid();
        let selected_grid = this.selected_grid;
        let hover_grid = this.hover_grid;
        let multi_selected_grid = this.multi_selected_grid;
        let fp_grid = this.fp_grid;
        let scanned_grid = this.scanned_grid;

        let android = this.container.android;

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

            if(!android && (full_grid[i] || full_grid[i] === "")){
                for(let y = 0; y < full_grid[i].length; y++){
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

            if(android && (fp_grid[i] || fp_grid[i] === "")){
                for(let y = 0; y < fp_grid[i].length; y++){
                    if(fp_grid[i][y] || fp_grid[i][y] === ""){
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
                for(let y = 0; y < selected_grid[i].length; y++){
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

            if(!android && (hover_grid[i] || hover_grid[i] === "")){
                for(let y = 0; y < hover_grid[i].length; y++){
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

            if(!android && (multi_selected_grid[i] || multi_selected_grid[i] === "")){
                for(let y = 0; y < multi_selected_grid[i].length; y++){
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

            if(this.show_scanned_area && (scanned_grid[i] || scanned_grid[i] == 0)){
                for(let y = 0; y < scanned_grid[i].length; y++){
                    if(scanned_grid[i][y] || scanned_grid[i][y] == 0){
                        co.fillStyle = "brown";
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

        this.phones.forEach((phone) => {
            phone.draw();
        });

        this.computers.forEach((comp) => {
            comp.draw();
        });
    }
}

export default Grid;