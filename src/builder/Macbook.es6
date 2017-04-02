class Macbook {

    static img = document.createElement("img");

    constructor(container: Main, x, y, id){
        this.container = container;
        this.x = x;
        this.y = y;
        this.id = id;
    }

    draw(){
        const ctx = this.container.grid.canvas_context;
        let img = Macbook.img;
        img.src = "images/macbook.png";
        img.onload = (event) => {
            let [x, y] = this.container.grid.getCanvasCoordinates(this.x, this.y);
            ctx.drawImage(img, x, y);
        };
    }
}

export default Macbook;