import $ from 'jquery';
import Registry from './Registry';
let debug = Registry.console.debug;
let superDebug = Registry.console.superDebug;

class Compass {

    constructor(container){
        debug("Compass.constructor");
        this.compass = $("#compass_image");
        this.rotation = 0;
        this.mouseDown = false;
        this.mouseY = 0;
        this.container = container;

        this.compass.on({
            "mousedown": (event) => {
                this.mouseDown = true;
                this.mouseY = event.pageY;
                console.log(this.mouseY, event);
            },
            "mouseup": (event) => {
                this.mouseDown = false;
                console.log(this.rotation);
            },
            "mouseout": (event) => {
                this.mouseDown = false;
            },
            "mousemove": (event) => {
                if(this.mouseDown) {
                    let diff = this.mouseY - event.pageY;
                    this.mouseY = event.pageY;
                    this.adjustRotation(diff);
                }
            },
            "dragstart": (event) => {
                event.preventDefault();
            }
        });
    }

    setRotation(rotation){
        debug("Compass.setRotation");
        this.rotation = Number(rotation);
        this.compass.css("transform", "rotate(" + -this.rotation + "deg)");
    }

    getRotation(){
        superDebug("Compass.getRotation");
        return this.rotation;
    }

    adjustRotation(diff){
        superDebug("Compass.adjustRotation");
        this.rotation += diff;
        this.compass.css("transform", "rotate(" + -this.rotation + "deg)");
    }
}

export default Compass;