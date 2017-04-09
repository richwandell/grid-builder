import ImageAsset from './ImageAsset';

class Macbook extends ImageAsset {

    constructor(container: Main, x, y, id, particles = [], neighbors = [], clusters = []){
        super(container, x, y, id, ImageAsset.Macbook, particles, neighbors, clusters);
    }

    draw(){
        super.drawParticles();
        super.drawNeighbors();
        super.drawClusters();
        super.drawImage("images/macbook.png", this.x, this.y);
    }
}

export default Macbook;