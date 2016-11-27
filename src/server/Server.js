var ssdp = require("./Ssdp.js");
var rest = require("./RestServer.js");

ssdp.startBroadcast();
rest.startServer();
