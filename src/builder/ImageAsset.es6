import Main from './Main';

class ImageAsset {

    static images = {};

    static Phone = Symbol.for("phone");

    static Macbook = Symbol.for("macbook");

    constructor(container: Main, x, y, id, type: Symbol, particles = []){
        this.container = container;
        this.x = x;
        this.y = y;
        this.id = id;
        this.type = type;
        this.particles = particles;
        if(ImageAsset.images[type] === undefined){
            ImageAsset.images[type] = {
                asset: document.createElement("img"),
                loaded: false
            }
        }
    }

    drawImage(image: string){
        const ctx = this.container.grid.canvas_context;
        let img = ImageAsset.images[this.type];
        if(img.loaded){
            let [x, y] = this.container.grid.getCanvasCoordinates(this.x, this.y);
            ctx.drawImage(img.asset, x, y);
            return;
        }
        img.asset.src = image;
        img.asset.onload = (event) => {
            let [x, y] = this.container.grid.getCanvasCoordinates(this.x, this.y);
            ctx.drawImage(img.asset, x, y);
            img.loaded = true;
        };
    }

    drawParticles(){
        const ctx = this.container.grid.overlay_context;
        this.particles.forEach((p) => {
            let [x, y, w, h] = this.container.grid.getCanvasCoordinates(p.x, p.y);
            ctx.fillStyle = "brown";
            ctx.fillRect(
                x,
                y,
                w,
                h
            );
        });
    }

}

export default ImageAsset;