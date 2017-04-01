import Phone from './Phone';

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
                this.onLocalize(data.id, data.guess);
                break;
        }
    }

    onSocketOpen(event) {
        console.log(event);
    }

    onLocalize(id, guess){
        const ph = new Phone(this.container, guess[0], guess[1], id);
        this.container.grid.setPhone(ph);
        this.container.grid.redraw();
    }
}

export default WebSocketClient;
