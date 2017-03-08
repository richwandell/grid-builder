import $ from 'jquery';

class Compass {

    constructor(container){
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

    getRotation(){
        return this.rotation;
    }

    adjustRotation(diff){
        this.rotation += diff;
        this.compass.css("transform", "rotate(" + -this.rotation + "deg)");
    }
}

export default Compass;