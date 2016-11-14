var dgram = require('dgram'),
    fs = require("fs"),
    builder = false,
    exports = {},
    console = {};

console.log = function(message){
    var st;
    try{
        st = JSON.stringify(message);
    }catch(e){
        st = message;
    }
    fs.writeFileSync("log", "[INFO] " + st + "\n");
};

console.error = function(message){
    var st;
    try{
        st = JSON.stringify(message);
    }catch(e){
        st = message;
    }
    fs.writeFileSync("log", "[ERROR] " + st + "\n");
};

function getServerIp() {

    var os = require('os');
    var ifaces = os.networkInterfaces();
    var values = Object.keys(ifaces).map(function(name) {
        return ifaces[name];
    });
    values = [].concat.apply([], values).filter(function(val){
        return val.family == 'IPv4' && val.internal == false;
    });

    return values.length ? values[0].address : '0.0.0.0';
}



exports.register = function(b){
    builder = b;
};

exports.startBroadcast = function () {
    function socket() {
        var os = require('os');
        var ifaces = os.networkInterfaces();
        var server = dgram.createSocket("udp4");

        server.on('listening', function () {
            console.log("listening");
            server.setBroadcast(true);
            server.setMulticastTTL(128);
            server.addMembership('239.255.255.250');
            setInterval(broadcastNew, 10000);
            broadcastNew();
        });
        server.bind();

        function broadcastNew() {
            var message = new Buffer(JSON.stringify({
                "ip": getServerIp(),
                "id": Math.random()
            }));
            server.send(message, 0, message.length, 8000, "239.255.255.250");
            console.log("Broadcasting");
        }
    }

    function ssdp() {
        var Server = require('node-ssdp').Server,
            server = new Server({
                location: 'http://' + getServerIp() + ":8888/devicedescription.xml"
            });

        server.addUSN('upnp:rootdevice');
        server.addUSN('urn:schemas-upnp-org:device:MediaServer:1');
        server.addUSN('urn:schemas-upnp-org:service:ContentDirectory:1');
        server.addUSN('urn:schemas-upnp-org:service:ConnectionManager:1');

        server.on('advertise-alive', function (headers) {
            console.log(headers);
        });

        server.on('advertise-bye', function (headers) {
            console.log(headers);
        });

        // start the server
        server.start();
        process.on('exit', function () {
            console.log("exit");
            server.stop() // advertise shutting down and stop listening
        });
    }

    function web(){
        var http = require("http"),
            url = require("url"),
            path = require("path"),
            port = 8888;
        var uuid = require('uuid');
        var id = uuid.v4();

        try {
            var oldUUID = fs.readFileSync(".uuid", "utf8");
            id = oldUUID;
        }catch(e){
            fs.writeFileSync(".uuid", id);
        }

        http.createServer(function(request, response) {
            var uri = url.parse(request.url).pathname,
                filename = path.join(process.cwd(), uri);

            if(uri == "/devicedescription.xml"){
                fs.readFile(filename, "binary", function(err, file) {
                    if(err) {
                        response.writeHead(500, {"Content-Type": "text/plain"});
                        response.write(err + "\n");
                        response.end();
                        return;
                    }
                    file = file.replace(/\{\{UDN\}\}/, "uuid:" + id);
                    file = file.replace(/\{\{END\}\}/, "http://" + getServerIp() + ":8888/rest/");
                    response.writeHead(200);
                    response.write(file, "binary");
                    response.end();
                });
            }else if(uri == "/icon24.png"){
                fs.readFile(filename, "binary", function(err, file) {
                    if(err) {
                        response.writeHead(500, {"Content-Type": "text/plain"});
                        response.write(err + "\n");
                        response.end();
                        return;
                    }
                    response.writeHead(200, {"Content-Type": "image/png"});
                    response.write(file, "binary");
                    response.end();
                });
            }else if(uri == "/rest/get/floorplans"){
                builder.builderGetFloorPlans(function(event){
                    response.writeHead(200, {"Content-Type": "application/javascript"});
                    response.write(JSON.stringify(event.target.result));
                    response.end();
                });
            }
        }).listen(parseInt(port, 10));
    }

    ssdp();
    //socket();
    web();
};
// exports.startBroadcast();
module.exports = exports;
