var ssdp = require("./Ssdp.js");
var rest = require("./RestServer.js");

ssdp.startBroadcast();
var r = new rest();
r.startServer();
