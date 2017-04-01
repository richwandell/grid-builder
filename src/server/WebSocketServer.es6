const WsServer = require('websocket').server;
const http = require('http');


class WebSocketServer {

    constructor(log: Log, restServer: RestServer){
        this.log = log;
        this.connections = [];
        this.restServer = restServer;
    }

    startServer(){
        this.server = new WsServer({
            httpServer: this.restServer,
            autoAcceptConnections: false
        });

        this.server.on('request', (request) => {
            try {
                this.onRequest(request);
            }catch(e){
                this.log.error(e.message);
            }
        });
    }

    onRequest(request) {
        let connection = request.accept('echo-protocol', request.origin);
        this.connections.push(connection);
        this.log.log("Connection Accepted");

        connection.on('message', (message) => {
            this.onConnectionMessage(connection, message);
        });

        connection.on('close', (reasonCode, description) => {
            this.log.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
        });

        connection.sendUTF(JSON.stringify({'action': 'HI'}));
    }

    onConnectionMessage(connection, message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            connection.sendUTF(message.utf8Data);
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    }
}

export default WebSocketServer;