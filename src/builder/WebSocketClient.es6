class WebSocketClient {

    constructor(url, protocols){
        this.socket = new WebSocket(url, protocols);

        this.socket.onopen = (event) => {
            this.onSocketOpen(event);
        };
    }

    onSocketOpen(event) {
        console.log(event);
    }
}

export default WebSocketClient;
