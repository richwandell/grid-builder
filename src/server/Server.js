var Ssdp = require("./Ssdp.js");
var rest = require("./RestServer.js");

var ssdp = new Ssdp();
ssdp.startBroadcast();

var r = new rest();
r.startServer();
