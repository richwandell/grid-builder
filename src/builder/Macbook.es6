import ImageAsset from './ImageAsset';

class Macbook extends ImageAsset {

    constructor(container: Main, x, y, id, particles){
        super(container, x, y, id, ImageAsset.Macbook, particles);
    }

    draw(){
        super.drawParticles();
        super.drawImage("images/macbook.png", this.x, this.y);
    }
}

export default Macbook;