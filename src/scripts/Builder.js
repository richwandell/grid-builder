;(function($){
    var canvas, overlay, database, debug = true, image_name,
        selected_grid = [], full_grid = [], hover_grid = [], image_width,
        image_height, image, vgrid_spaces, hgrid_spaces, floorplanname, selected_id,
        touch_cx, touch_cy, grid_lines_enabled = true;

    function init(){
        debug ? console.debug(arguments.callee.name) : '';

        //Grab and save our canvas
        canvas = $("#builder_canvas")[0];
        overlay = $("#builder_canvas_overlay")[0];

        $("#builder_canvas_container").css("maxWidth", $(window).width());

        if(builder_mode && builder_mode == 1) {
            //Request our db and set event handlers
            var dbrequest = window.indexedDB.open("BuilderDatabase", 6);
            dbrequest.onupgradeneeded = dbonupgradeneeded;
            dbrequest.onsuccess = dbonsuccess;
            dbrequest.onerror = dbonerror;
        }else if(builder_mode && builder_mode == 2){
            if(typeof Android != "undefined" && Android.getData) {
                var s = Android.getData(1);
                loadBuilderData(JSON.parse(s));
            }else{
                loadBuilderData();
            }
            bindTouchEvents();
            $("#builder_canvas_container").height($(window).height());
            return;
        }


        //Setup events for elements
        $("#builder_image_input").change(imageChanged);
        $("#builder_select_existing").change(selectChanged);
        $("#builder_zoom_in").click(zoomIn);
        $("#builder_zoom_out").click(zoomOut);
        $("#builder_delete_existing").click(deleteExisting);
        $("#builder_vgrid_spaces, #builder_hgrid_spaces").change(spacesChanged);
        $("#builder_add_spaces").click(addSpace);
        $("#builder_grid_color").change(redraw);
        var bngs = $("#builder_named_grid_spaces");
        bngs.on("click", "tr", selectGridFromList);
        bngs.on("mouseenter", "tr", hoverGridFromList);
        bngs.on("mouseleave", "tr", removeHoverGridFromList);
        $("#save_floorplan").click(saveFloorplan);
        $("#builder_download").click(downloadFloorplan);
        $(overlay).click(canvasClicked);
    }

    function showLoader(){
        $("#builder_table").hide();
        $("#builder_loading").show();
    }

    function hideLoader(){
        $("#builder_table").show();
        $("#builder_loading").hide();
    }

    function bindTouchEvents(){
        debug ? console.debug(arguments.callee.name) : '';
        $(overlay).off();
        $(overlay).on({
            "touchstart": function(event){
                var c = canvas.getContext('2d');
                var wi = c.canvas.width;
                var he = c.canvas.height;

                var rect = canvas.getBoundingClientRect();
                var touch = event.touches[0];
                var thex = touch.pageX;
                var they = touch.clientY;
                var cx = (thex - rect.left) / (rect.right-rect.left) * wi;
                var cy = (they - rect.top) * 2;
                touch_cx = cx;
                touch_cy = cy;
            },
            "touchmove": function(event){
                touch_cx = false;
                touch_cy = false;
            },
            "touchend": function(event){
                if(touch_cx && touch_cy) {
                    clickCanvas(touch_cx, touch_cy);
                }
            }
        });
    }

    function builderToggleGridLines(toggle){
        debug ? console.debug(arguments.callee.name) : '';
        grid_lines_enabled = toggle;

        redraw();
        bindTouchEvents();
    }

    window.builderToggleGridLines = builderToggleGridLines;

    function loadBuilderData(bd){
        debug ? console.debug(arguments.callee.name) : '';
        var loadbd = function(bd){
            var i = document.createElement("img");
            i.src = bd.image;
            i.onload = function (event) {
                full_grid = bd.grid;
                image = i;
                image_name = bd.name;
                floorplanname = bd.floorplanname;
                vgrid_spaces = bd.vgrid_spaces;
                hgrid_spaces = bd.hgrid_spaces;
                selected_id = bd.id;

                imageLoaded(image);
            };
        };
        if(bd) {
            loadbd(bd);
        }else{
            var dbrequest = window.indexedDB.open("BuilderDatabase", 6);
            dbrequest.onsuccess = function(event){
                database = event.target.result;
                var os = database.transaction(["layout_images"], "readwrite")
                    .objectStore("layout_images");
                var req = os.openCursor();
                req.onsuccess = function(event){
                    bd = event.target.result.value;
                    loadbd(bd);
                }
            };
        }
    }

    function downloadFloorplan(event){
        debug ? console.debug(arguments.callee.name) : '';
        var id = parseInt($("#builder_select_existing").val());
        var t = database.transaction(["layout_images"], "readwrite")
            .objectStore("layout_images")
            .get(Number(id));
        t.onsuccess = function(event){
            var data = event.target.result;
            var element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(data)));
            element.setAttribute('download', data.floorplanname + ".json");

            element.style.display = 'none';
            document.body.appendChild(element);

            element.click();

            document.body.removeChild(element);
        };
    }

    function saveFloorplan(){
        debug ? console.debug(arguments.callee.name) : '';
        var floorplanname = $("#builder_floorplan_name").val();
        var name = image_name;
        var id = parseInt($("#builder_select_existing").val());
        var hs = parseInt($("#builder_hgrid_spaces").val());
        var vs = parseInt($("#builder_vgrid_spaces").val());
        var os = database.transaction(["layout_images"], "readwrite")
            .objectStore("layout_images");
        var req = os.get(id);
        req.onsuccess = function(event){
            var data = event.target.result;
            data.name = name;
            data.floorplanname = floorplanname;
            data.grid = full_grid;
            data.hgrid_spaces = hs;
            data.vgrid_spaces = vs;
            var requp = os.put(data);
            requp.onsuccess = function(event){
                $("#builder_title").css({
                    "background": "darkseagreen"
                });
                setTimeout(function(){
                    $("#builder_title").css({
                        "background": "white"
                    });
                }, 2000);
            };
        };
    }

    function redraw(){
        debug ? console.debug(arguments.callee.name) : '';
        if(selected_grid.length > 0) {
            $("#builder_selected_box").show();
            var sboxname = selected_grid.filter(function(i){
                return i ? true : false;
            }).map(function(i){
                return i;
            });
        }else{
            $("#builder_selected_box").hide();
        }


        drawGrid();
    }

    function setSelectedGrid(x, y, data){
        debug ? console.debug(arguments.callee.name) : '';
        selected_grid = [];
        selected_grid[x] = [];
        selected_grid[x][y] = data;
        $("#builder_selected_box").show();
        $("#builder_selected_box_coords").html("x: " + x + " y: " + y);
        $("#builder_selected_box_name").val(data);
    }

    function setHoverGrid(x, y, data){
        debug ? console.debug(arguments.callee.name) : '';
        hover_grid = [];
        hover_grid[x] = [];
        hover_grid[x][y] = data;
    }

    function selectGridFromList(event){
        debug ? console.debug(arguments.callee.name) : '';
        var x = $(event.target).data("x");
        var y = $(event.target).data("y");
        var name = $(event.target).text();
        setSelectedGrid(x, y, name);
        redraw();
    }

    function hoverGridFromList(event){
        debug ? console.debug(arguments.callee.name) : '';
        var x = $(event.target).data("x");
        var y = $(event.target).data("y");
        var name = $(event.target).text();
        setHoverGrid(x, y, name);
        redraw();
    }

    function removeHoverGridFromList(event){
        debug ? console.debug(arguments.callee.name) : '';
        hover_grid = [];
        redraw();
    }

    function addSpace(event){
        debug ? console.debug(arguments.callee.name) : '';
        for(var i = 0; i < selected_grid.length; i++){
            if(selected_grid[i]){
                if(!full_grid[i]){
                    full_grid[i] = [];
                }
                var y = 0;
                for(var y = 0; y < selected_grid[i].length; y++){
                    if(selected_grid[i][y] || selected_grid[i][y] === ""){
                        break;
                    }
                }
                var name = $("#builder_selected_box_name").val();
                full_grid[i][y] = name;
            }
        }
        selected_grid = [];
        redraw();
        drawFloorPlan();
    }

    function clickCanvas(cx, cy){
        var c = canvas.getContext('2d');
        var wi = c.canvas.width;
        var he = c.canvas.height;

        var h = parseInt($("#builder_hgrid_spaces").val());
        var v = parseInt($("#builder_vgrid_spaces").val());

        var xsize = wi / h;
        var x = Math.floor(cx / xsize);

        var ysize = he / v;
        var y = Math.floor(cy / ysize);

        var n = $("#builder_selected_box_name").val();
        if(full_grid[x]){
            if(full_grid[x][y] || full_grid[x][y] === ""){
                n = full_grid[x][y];
            }
        }
        setSelectedGrid(x, y, n);
        redraw();
    }

    function canvasClicked(event) {
        debug ? console.debug(arguments.callee.name) : '';
        var c = canvas.getContext('2d');
        var wi = c.canvas.width;
        var he = c.canvas.height;

        var rect = canvas.getBoundingClientRect();
        var thex = event.clientX;
        var they = event.clientY;
        var cx = (thex - rect.left) / (rect.right-rect.left) * wi;
        var cy = (they - rect.top) / (rect.bottom-rect.top) * he;
        clickCanvas(cx, cy);
    }

    function spacesChanged(event){
        debug ? console.debug(arguments.callee.name) : '';
        vgrid_spaces = $("#builder_vgrid_spaces").val();
        hgrid_spaces = $("#builder_hgrid_spaces").val();
        imageLoaded();
    }

    function imageLoaded(img){
        debug ? console.debug(arguments.callee.name) : '';
        if(img){
            image = img;
            image_height = img.height;
            image_width = img.width;
        }
        redraw();
        resetZoom();
    }

    function drawGrid() {
        debug ? console.debug(arguments.callee.name) : '';
        var c = canvas.getContext('2d');
        c.canvas.width = image_width;
        c.canvas.height = image_height;
        c.drawImage(image, 1, 1, image_width, image_height);
        var co = overlay.getContext('2d');
        co.canvas.width = image_width;
        co.canvas.height = image_height;

        var wi = c.canvas.width;
        var he = c.canvas.height;

        var ho = hgrid_spaces;
        var vi = vgrid_spaces;
        var i = 0;

        var color = $("#builder_grid_color").val();

        if (grid_lines_enabled){
            for (i = 0; i < vi; i++) {
                c.moveTo(0, (he / vi) * i);
                c.lineTo(wi, (he / vi) * i);
                c.strokeStyle = color;
                c.stroke();
            }
        }

        for(i = 0; i < ho; i++){
            if(grid_lines_enabled) {
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
                var y = 0;
                for(var j = 0; j < selected_grid[i].length; j++){
                    if(selected_grid[i][j] || selected_grid[i][j] === ""){
                        y = j;
                        break;
                    }
                }
                c.fillStyle = "green";
                c.fillRect(
                    (wi / ho) * i,
                    (he / vi) * y,
                    (wi / ho),
                    (he / vi)
                );
            }

            if(hover_grid[i] || hover_grid[i] === ""){
                var y = 0;
                for(var j = 0; j < hover_grid[i].length; j++){
                    if(hover_grid[i][j] || hover_grid[i][j] === ""){
                        y = j;
                        break;
                    }
                }
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

    function deleteExisting(event){
        debug ? console.debug(arguments.callee.name) : '';
        var id = parseInt($("#builder_select_existing").val());
        var t = database.transaction(["layout_images"], "readwrite")
            .objectStore("layout_images")
            .delete(id);
        t.onsuccess = function(event){
            reloadFromDb();
        };
    }

    function resetZoom(){
        debug ? console.debug(arguments.callee.name) : '';
        var w = canvas.width;
        var h = canvas.height;
        var css = {
            "width": parseInt(w)  + "px",
            "height": parseInt(h) + "px"
        };
        $(canvas).css(css);
        $(overlay).css(css);
    }

    function zoomIn(event){
        debug ? console.debug(arguments.callee.name) : '';
        var cw = $(canvas).css("width");
        var ch = $(canvas).css("height");
        var css = {
            "width": parseInt(cw) * 1.1 + "px",
            "height": parseInt(ch) * 1.1 + "px"
        };
        $(canvas).css(css);
        $(overlay).css(css);
    }

    function zoomOut(event){
        debug ? console.debug(arguments.callee.name) : '';
        var cw = $(canvas).css("width");
        var ch = $(canvas).css("height");
        var css = {
            "width": parseInt(cw) * .9 + "px",
            "height": parseInt(ch) * .9 + "px"
        };
        $(canvas).css(css);
        $(overlay).css(css);
    }

    function setImageName(name){
        debug ? console.debug(arguments.callee.name) : '';
        image_name = name;
        $("#builder_table caption#builder_title").html(name);
    }

    function imageChanged(event){
        debug ? console.debug(arguments.callee.name) : '';

        var input = event.target;
        var reader = new FileReader();
        reader.onload = function() {
            var dataURL = reader.result;
            var imageObj = new Image();
            imageObj.src = dataURL;
            imageObj.onload = function(){
                imageLoaded(imageObj);
            };
            setImageName(input.files[0].name);
            var t = database.transaction(["layout_images"], "readwrite")
                .objectStore("layout_images")
                .add({
                    "name": image_name,
                    "image": dataURL,
                    "grid": []
                });
            t.onsuccess = function(event) {
                reloadFromDb(event.target.result);
            };
        };
        reader.readAsDataURL(input.files[0]);
    }

    function selectChanged(event){
        debug ? console.debug(arguments.callee.name) : '';
        displayFloorplan(event.target.value);
    }

    function setFloorplanName(name){
        debug ? console.debug(arguments.callee.name) : '';
        if(name){
            $("#builder_floorplan_name").val(name);
        }else{
            $("#builder_floorplan_name").val("");
        }
    }

    function displayFloorplan(id) {
        debug ? console.debug(arguments.callee.name) : '';
        var t = database.transaction(["layout_images"], "readwrite")
            .objectStore("layout_images")
            .get(Number(id));
        t.onsuccess = function (event) {
            setImageName(event.target.result.name);
            setFloorplanName(event.target.result.floorplanname);
            setHandVSpace(event.target.result.hgrid_spaces, event.target.result.vgrid_spaces);
            var image = document.createElement("img");
            image.src = event.target.result.image;
            image.onload = function (event) {
                imageLoaded(image);
            };
            full_grid = event.target.result.grid;

            drawFloorPlan();
        }
    }

    function setHandVSpace(hspace, vspace){
        debug ? console.debug(arguments.callee.name) : '';
        hgrid_spaces = hspace;
        vgrid_spaces = vspace;
        $("#builder_hgrid_spaces").val(hspace);
        $("#builder_vgrid_spaces").val(vspace);
    }

    function drawFloorPlan(){
        $("#builder_named_grid_spaces").html("");
        for(var x = 0; x < full_grid.length; x++){
            if(full_grid[x]){
                for(var y = 0; y < full_grid[x].length; y++){
                    if(full_grid[x][y] || full_grid[x][y] === ""){
                        var name = full_grid[x][y];
                        if(name.trim() == ""){
                            name = "no name";
                        }
                        $("#builder_named_grid_spaces").append("<tr>" +
                            "<td data-x='"+ x +"' data-y='" + y + "'>" + name + "</td>" +
                            "<td>X: " + x + " Y: " + y + "</td>" +
                            "</tr>");
                    }
                }
            }
        }
    }

    function reloadFromDb(id){
        debug ? console.debug(arguments.callee.name) : '';
        $("#builder_select_existing").html("");
        var req = database.transaction(["layout_images"], "readwrite")
            .objectStore("layout_images")
            .getAll();
        req.onsuccess = function(event){
            $(event.target.result).each(function(i, el){
                $("#builder_select_existing").append("<option value='" + el.id + "'>" + el.name + "</option>");
            });
            if(id){
                $("#builder_select_existing").val(id);
            }
            if(event.target.result.length > 0){
                displayFloorplan($("#builder_select_existing").val());
            }
        };
    }

    function dbonsuccess(event) {
        debug ? console.debug(arguments.callee.name) : '';
        database = event.target.result;
        reloadFromDb();
    }

    function dbonerror(event) {
        debug ? console.debug(arguments.callee.name) : '';
        console.error(event);
    }

    function dbonupgradeneeded(event){
        debug ? console.debug(arguments.callee.name) : '';
        database = event.target.result;
        var objectStore = database.createObjectStore("layout_images", { keyPath: "id", autoIncrement: true });
    }

    $(function(){
        window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {READ_WRITE: "readwrite"};
        window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
        init();
    });
})(jQuery);