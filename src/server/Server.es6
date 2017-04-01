import Ssdp from './Ssdp';
import RestServer from './RestServer';
import WebSocketServer from './WebSocketServer';

const upnp = new Ssdp();
upnp.startBroadcast();

const rest = new RestServer();
rest.startServer();

const socket = new WebSocketServer(rest.getLog(), rest.getServer());
socket.startServer();