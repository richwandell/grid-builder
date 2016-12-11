var express = require('express');
var bodyParser = require('body-parser');
var pjson = require('../package.json');
var log = require('./Log.js');
var db = require('./Db.js');
var fs = require('fs');
var Utils = require('./Utils.js');
var uuid = require('uuid');
var id = uuid.v4();

log = new log("rest.log");

try {
    var oldUUID = fs.readFileSync(".uuid", "utf8");
    id = oldUUID;
}catch(e){
    fs.writeFileSync(".uuid", id);
}

var RestServer = function(){
    this.app = express();
    this.app.use(bodyParser.json({limit: '50mb'}));
    this.app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
    this.app.use('/builder', express.static('dist'))
};

RestServer.prototype.startServer = function () {
    db.createTables();
    var app = this.app;

    app.get('/rest/databaseVersion', function(req, res){
        log.log("/rest/databaseVersion");
        res.header("Access-Control-Allow-Origin", "*");
        res.header('Content-Type', 'application/javascript');
        db.getDatabaseVersion(function(err, rows){
            if(rows.length > 0){
                res.send({databaseVersion: rows[0].value, success: true});
            }else{
                res.send({databaseVersion: 0, success: true});
            }
        });
    });

    app.post('/rest/updateDatabase', function(req, res){
        log.log("/rest/updateDatabase");
        res.header("Access-Control-Allow-Origin", "*");
        res.header('Content-Type', 'application/javascript');
        log.log(req.body);
        var data = req.body;
        var cleanData = {};
        var error = false;
        if(typeof(data.databaseVersion) != "undefined"){
            if(!isNaN(data.databaseVersion)){
                cleanData.databaseVersion = data.databaseVersion;
            }else{
                error = true;
            }
            if(typeof(data.layout_images) != "undefined"){
                if(data.layout_images.length > 0){
                    cleanData.layout_images = data.layout_images;
                }else{
                    error = true;
                }
            }else{
                error = true;
            }
        }else{
            error = true;
        }

        if(!error){
            db.updateDatabase(cleanData, function(err, rows){
                res.send({success: true});
            });
        }else{
            res.send({success: false});
        }

        log.log(req.body);
    });

    app.get('/devicedescription.xml', function (req, res) {
        log.log("devicedescription.xml");
        fs.readFile('devicedescription.xml', "binary", function (err, file) {
            if (err) {
                res.header("Content-Type", "text/plain");
                res.status(500).send(err);
                return;
            }
            file = file.replace(/\{\{UDN\}\}/, "uuid:" + id);
            file = file.replace(/\{\{END\}\}/, "http://" + Utils.getServerIp() + ":8888/rest/");
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Content-Type", "text/xml");
            res.send(file);
        });
    });

    app.get("/icon24.png", function(req, res) {
        log.log("icon24.png");
        res.header("Access-Control-Allow-Origin", "*");
        res.sendFile(process.cwd() + '/src/icon24.png');
    });

    app.get("/rest/floorplans", function(req, res){
        log.log("/rest/floorplans");
        res.header("Access-Control-Allow-Origin", "*");
        res.header('Content-Type', 'application/javascript');
        db.getFloorPlans(function(err, rows){
            res.send(rows);
        });
    });

    app.listen(pjson.builder_rest_port, function () {
        log.log('Server Started')
    });
};

module.exports = RestServer;