import ImageAsset from './ImageAsset';

class Phone extends ImageAsset {

    constructor(container: Main, x, y, id, particles = [], neighbors = [], clusters = []){
        super(container, x, y, id, ImageAsset.Phone, particles, neighbors, clusters);
    }

    draw(){
        super.drawParticles();
        super.drawNeighbors();
        super.drawClusters();
        super.drawImage("images/phone.png",  this.x, this.y);
    }
}

export default Phone;