import Registry from './Registry';
import Phone from './Phone';
import Macbook from './Macbook';

let debug = Registry.console.debug;
let superDebug = Registry.console.superDebug;

class LocalizationFinishedHandler {

    constructor(container: Main) {
        this.container = container;
    }

    onLocalize(data) {
        debug("LocalizationFinishedHandler.onLocalize");
        const id = data.id, guess = data.guess, type = data.type, particles = data.particles,
            neighbors = data.neighbors, clusters = data.clusters;

        switch(type){
            case "PHONE":
                const ph = new Phone(this.container, guess[0], guess[1], id, particles, neighbors, clusters);
                this.container.grid.setPhone(ph);
                break;

            case "COMPUTER":
                const co = new Macbook(this.container, guess[0], guess[1], id, particles, neighbors, clusters);
                this.container.grid.setComputer(co);
                break;
        }
        this.container.grid.redraw();
    }
}

export default LocalizationFinishedHandler;