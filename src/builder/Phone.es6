import ImageAsset from './ImageAsset';

class Phone extends ImageAsset {

    constructor(container: Main, x, y, id, particles = [], neighbors = [], clusters = [], large_clusters = []){
        super(container, x, y, id, ImageAsset.Phone, particles, neighbors, clusters, large_clusters);
    }

    draw(){
        if(this.container.grid.showParticles) {
            super.drawParticles();
            super.drawNeighbors();
            super.drawClusters();
        }
        if(this.container.grid.showWeights) {
            super.drawNeightborArcs();
        }
        if(this.container.grid.showLines) {
            super.drawNeighborLines();
        }
        if(this.container.grid.showWeights) {
            super.drawNeighborText();
        }
        super.drawImage("images/phone.png",  this.x, this.y);
    }
}

export default Phone;