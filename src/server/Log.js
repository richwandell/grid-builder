var exports = {};
var fs = require('fs');
var pjson = require('../../package.json');

exports.log = function(message){
    var st;
    try{
        st = JSON.stringify(message);
    }catch(e){
        st = message;
    }
    fs.appendFile(pjson.builder_log_folder + "/ssdp.log", "[INFO] " + st + "\n", function(){});
};

exports.error = function(message){
    var st;
    try{
        st = JSON.stringify(message);
    }catch(e){
        st = message;
    }
    fs.appendFile(pjson.builder_log_folder + "/ssdp.log", "[ERROR] " + st + "\n", function(){});
};

exports.debug = function(message){
    var st;
    try{
        st = JSON.stringify(message);
    }catch(e){
        st = message;
    }
    fs.appendFile(pjson.builder_log_folder + "/ssdp.log", "[DEBUG] " + st + "\n", function(){});
};

module.exports = exports;