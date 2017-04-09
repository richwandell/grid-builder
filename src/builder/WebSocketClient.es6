import Registry from './Registry';
import LocalizationFinishedHandler from './LocalizationFinishedHandler';

let debug = Registry.console.debug;
let superDebug = Registry.console.superDebug;

class WebSocketClient extends LocalizationFinishedHandler {

    constructor(container: Main, url, protocols) {
        super(container);
        debug("WebSocketClient.constructor");
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
        debug("WebSocketClient.onSocketOpen");
    }
}

export default WebSocketClient;
