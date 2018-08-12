import Main from './Main';

class ImageAsset {

    static ANIMATING = 0;

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
        this.animating = false;
        this.oldX = 0;
        this.oldY = 0;
        this.tickX = 0;
        this.tickY = 0;
        this.isTheAnimator = false;
        this.rotation = 0;
        if(ImageAsset.images[type] === undefined){
            ImageAsset.images[type] = {
                asset: document.createElement("img"),
                loaded: false
            }
        }
    }

    setRotation(rot) {
        this.rotation = rot;
    }

    stopAnimation(){
        if (this.animating) {
            ImageAsset.ANIMATING--;
        }
    }

    setAnimationFrom(x: number, y: number) {
        if(ImageAsset.ANIMATING === 0) {
            this.isTheAnimator = true;
        }
        ImageAsset.ANIMATING++;
        this.animating = true;
        this.oldX = x;
        this.oldY = y;
        this.tickX = 0;
        this.tickY = 0;
    }

    drawAnimation(ctx, img) {
        let x, y, w, h;
        const imgWidth = img.asset.width;
        const imgHeight = img.asset.height;
        if (this.animating) {

            [x, y, w, h] = this.container.grid.getCanvasCoordinates(this.oldX, this.oldY);
            let [newX, newY] = this.container.grid.getCanvasCoordinates(this.x, this.y);
            let stop = 0;
            if (x < newX && (x + this.tickX < newX)) {
                this.tickX += 1;
            } else if (x > newX && (x + this.tickX > newX)) {
                this.tickX -= 1;
            } else {
                stop++;
            }

            if (y < newY && (y + this.tickY < newY)) {
                this.tickY += 1;
            } else if (y > newY && (y + this.tickY > newY)) {
                this.tickY -= 1;
            } else {
                stop++;
            }

            x += this.tickX;
            y += this.tickY;

            if (stop >= 2) {
                this.animating = false;
                ImageAsset.ANIMATING--;
                this.isTheAnimator = false;
                this.tickX = 0;
                this.tickY = 0;
            }

        } else {
            [x, y, w, h] = this.container.grid.getCanvasCoordinates(this.x, this.y);
        }

        let tx = (x + w / 2) - (imgWidth / 2);
        let ty = (y + h / 2) - (imgHeight / 2);

        ctx.translate(tx, ty);
        ctx.rotate(this.rotation);

        ctx.drawImage(img.asset, 0, 0);

        ctx.rotate(-this.rotation);
        ctx.translate(-tx, -ty);




        if (this.animating) {
            if (ImageAsset.ANIMATING === 1 || this.isTheAnimator) {
                this.isTheAnimator = true;
                setTimeout(() => {
                    this.container.grid.redraw();
                }, 10);
            }
        }
    }

    drawImage(image: string){
        const ctx = this.container.grid.canvas_context;
        let img = ImageAsset.images[this.type];
        if(img.loaded){
            this.drawAnimation(ctx, img);

            return;
        }
        img.asset.src = image;
        img.asset.onload = (event) => {
            this.drawAnimation(ctx, img);
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

    drawNeightborArcs(){
        const ctx = this.container.grid.overlay_context;
        this.neighbors.forEach((p) => {
            let [x, y, w, h] = this.container.grid.getCanvasCoordinates(p.x, p.y);
            ctx.beginPath();
            const weight = Math.abs(((200 - p.weight) / 200) * 80);
            ctx.arc(x + w / 2, y + h / 2, weight, 0, 2*Math.PI);
            ctx.stroke();
        });
    }

    drawNeighborLines(){
        const ctx = this.container.grid.overlay_context;
        this.neighbors.forEach((p) => {
            let [x, y, w, h] = this.container.grid.getCanvasCoordinates(p.x, p.y);
            let [rx, ry] = this.container.grid.getCanvasCoordinates(this.x, this.y);

            ctx.beginPath();
            ctx.moveTo(rx + w / 2, ry + h / 2);
            ctx.lineTo(x + w / 2, y + h / 2);
            ctx.stroke();
        });
    }

    drawNeighborText(){
        const ctx = this.container.grid.canvas_context;
        const ctx1 = this.container.grid.overlay_context;
        this.neighbors.forEach((p) => {
            let [x, y, w, h] = this.container.grid.getCanvasCoordinates(p.x, p.y);
            ctx.fillStyle = "black";
            ctx.font = "10px Arial";
            ctx.fillText(Math.round(p.weight * 100) / 100, x + 5, y + h - 10);

            ctx1.fillStyle = "black";
            ctx1.font = "10px Arial";
            ctx1.fillText(Math.round(p.weight * 100) / 100, x + 5, y + h - 10);
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