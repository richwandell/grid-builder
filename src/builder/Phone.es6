class Phone {

    static img = document.createElement("img");

    constructor(container: Main, x, y, id){
        this.container = container;
        this.x = x;
        this.y = y;
        this.id = id;
    }

    draw(){
        const ctx = this.container.grid.canvas_context;
        let img = Phone.img;
        img.src = "phone.png";
        img.onload = (event) => {
            let [x, y] = this.container.grid.getCanvasCoordinates(this.x, this.y);
            ctx.drawImage(img, x, y);
        };
    }
}

export default Phone;