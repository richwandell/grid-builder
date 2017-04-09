import Main from './Main';

class ImageAsset {

    static images = {};

    static Phone = Symbol.for("phone");

    static Macbook = Symbol.for("macbook");

    static COLORS = ['red', 'green', 'blue', 'purple', '#ff8282'];

    constructor(container: Main, x, y, id, type: Symbol, particles = [], neighbors = [], clusters = []){
        this.container = container;
        this.x = x;
        this.y = y;
        this.id = id;
        this.type = type;
        this.particles = particles;
        this.neighbors = neighbors;
        this.clusters = clusters;
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
            ctx.fillStyle = ImageAsset.COLORS[0];
            ctx.fillRect(
                x,
                y,
                w,
                h
            );
        });
    }

    drawNeighbors(){
        const ctx = this.container.grid.overlay_context;
        this.neighbors.forEach((p) => {
            let [x, y, w, h] = this.container.grid.getCanvasCoordinates(p.x, p.y);
            ctx.fillStyle = ImageAsset.COLORS[1];
            ctx.fillRect(
                x,
                y,
                w,
                h
            );
        });
    }

    drawClusters(){
        const ctx = this.container.grid.overlay_context;
        this.clusters.forEach((clu, i) => {
            clu.forEach((p) => {
                let [x, y, w, h] = this.container.grid.getCanvasCoordinates(p[0], p[1]);
                ctx.fillStyle = ImageAsset.COLORS[2 + i];
                ctx.fillRect(
                    x,
                    y,
                    w,
                    h
                );
            });
        });
    }

}

export default ImageAsset;