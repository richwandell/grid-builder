import Phone from './Phone';
import Macbook from './Macbook';

class WebSocketClient {

    constructor(container: Main, url, protocols){
        this.container = container;
        this.socket = new WebSocket(url, protocols);

        this.socket.onopen = (event) => {
            this.onSocketOpen(event);
        };

        this.socket.onmessage = (event) => {
            this.onMessage(event);
        };
    }

    onMessage(event) {
        const data = JSON.parse(event.data);
        if(!data.action) return;
        switch(data.action){
            case "LOCALIZE":
                this.onLocalize(data);
                break;

            case "NEW_READING":
                this.container.grid.updateScannedArea();
                break;
        }
    }

    onSocketOpen(event) {
        console.log(event);
    }

    onLocalize(data) {
        const id = data.id, guess = data.guess, type = data.type, particles = data.particles;
        switch(type){
            case "PHONE":
                const ph = new Phone(this.container, guess[0], guess[1], id, particles);
                this.container.grid.setPhone(ph);
                break;

            case "COMPUTER":
                const co = new Macbook(this.container, guess[0], guess[1], id, particles);
                this.container.grid.setComputer(co);
                break;
        }
        this.container.grid.redraw();
    }
}

export default WebSocketClient;
