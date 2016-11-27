var express = require('express');
var app = express();
var pjson = require('../../package.json');
var log = require('./Log.js');
var db = require('./Db.js');
var fs = require('fs');
var Utils = require('./Utils.js');
var uuid = require('uuid');
var id = uuid.v4();

try {
    var oldUUID = fs.readFileSync(".uuid", "utf8");
    id = oldUUID;
}catch(e){
    fs.writeFileSync(".uuid", id);
}

var RestServer = {
    startServer: function () {
        db.createTables();

        app.get('/devicedescription.xml', function (req, res) {
            fs.readFile('devicedescription.xml', "binary", function (err, file) {
                if (err) {
                    res.header("Content-Type", "text/plain");
                    res.status(500).send(err);
                    return;
                }
                file = file.replace(/\{\{UDN\}\}/, "uuid:" + id);
                file = file.replace(/\{\{END\}\}/, "http://" + Utils.getServerIp() + ":8888/rest/");
                res.header("Content-Type", "text/xml");
                res.send(file);
            });
        });

        app.get("/icon24.png", function(req, res) {
            res.sendFile(process.cwd() + '/src/icon24.png');
        });

        app.get("/rest/floorplans", function(req, res){
            res.header('Content-Type', 'application/javascript');
            db.getFloorPlans(function(err, rows){
                res.send(rows);
            });
        });

        app.listen(pjson.builder_rest_port, function () {
            log.log('Server Started')
        });
    }
};

module.exports = RestServer;