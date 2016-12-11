var exports = {};
var fs = require('fs');
var pjson = require('../package.json');

var Console = function(filename){
    this.filename = filename;
};

Console.prototype.log = function(message){
    var st;
    try{
        st = JSON.stringify(message);
    }catch(e){
        st = message;
    }
    fs.appendFile(pjson.builder_log_folder + "/" + this.filename, "[INFO] " + st + "\n", function(){});
};

Console.prototype.error = function(message){
    var st;
    try{
        st = JSON.stringify(message);
    }catch(e){
        st = message;
    }
    fs.appendFile(pjson.builder_log_folder + "/" + this.filename, "[ERROR] " + st + "\n", function(){});
};

Console.prototype.debug = function(message){
    var st;
    try{
        st = JSON.stringify(message);
    }catch(e){
        st = message;
    }
    fs.appendFile(pjson.builder_log_folder + "/" + this.filename, "[DEBUG] " + st + "\n", function(){});
};

module.exports = Console;