import RestServer from './RestServer';
const WsServer = require('websocket').server;
const http = require('http');


class WebSocketServer {

    constructor(log: Log, restServer: RestServer){
        this.log = log;
        this.connections = [];
        this.restServer = restServer;
    }

    send(message){
        this.connections.forEach((conn) => {
            conn.sendUTF(JSON.stringify(message));
        });
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
        connection.cid = this.connections.length;
        this.connections.push(connection);
        this.log.log("Connection Accepted");

        connection.on('message', (message) => {
            this.onConnectionMessage(connection, message);
        });

        connection.on('close', (reasonCode, description) => {
            this.log.debug((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
            this.removeDisconnected();
        });

        connection.sendUTF(JSON.stringify({'action': 'HI'}));
    }

    removeDisconnected() {
        let dis = Infinity;
        for(let i = 0; i < this.connections.length; i++){
            if(this.connections.closeEventEmitted){
                dis = i;
            }
        }
        if(dis < Infinity) {
            this.connections = this.connections.splice(dis, 1);
        }
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