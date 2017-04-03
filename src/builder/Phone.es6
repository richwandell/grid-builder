import ImageAsset from './ImageAsset';

class Phone extends ImageAsset {

    constructor(container: Main, x, y, id, particles = []){
        super(container, x, y, id, ImageAsset.Phone, particles);
    }

    draw(){
        super.drawImage("images/phone.png",  this.x, this.y);
    }
}

export default Phone;