var exports = {};
var fs = require('fs');

var Log = function(options){
    var that = this;
    this.options = {
        filename: "log.log",
        filesize: 1000000,
        logfolder: "log",
        numfiles: 3
    };
    for (var attrname in options) {
        if(this.options.hasOwnProperty(attrname)){
            this.options[attrname] = options[attrname];
        }
    }
    this.fullpath = this.options.logfolder + "/" + this.options.filename;
    this.existingFiles = [];
    var dir = this.options.logfolder;
    var files = fs.readdirSync(dir);
    var filename = this.options.filename;

    files.forEach(function(file){
        if(file.indexOf(filename) > -1){
            that.existingFiles.push(file);
        }
    });

    fs.appendFile(this.fullpath, "[INFO] log file opened \n", function(){
        fs.watch(that.fullpath, function(eventType, filename){
            that.rotate(eventType, filename);
        });
    });
};

Log.prototype.rotate = function(eventType, filename){
    if(eventType == "change"){
        var filesize = this.options.filesize;
        var numFiles = this.existingFiles.length - 1;
        var that = this;
        fs.stat(that.fullpath, function(err, stats){
            if(stats.size >= filesize){
                console.log("should rotate");
                for(var x = 0; x < that.existingFiles.length; x++){
                    var existingFile = that.existingFiles[x];
                    if(existingFile != that.options.filename){
                        var newName = that.fullpath + "." + (x + 1);
                        fs.rename(that.options.logfolder + "/" + existingFile, newName, function(){});
                    }
                }
                fs.writeFileSync(that.fullpath + ".0", fs.readFileSync(that.fullpath));
                that.existingFiles.push(that.fullpath + "." + numFiles);
                var rand = Math.random();
                fs.writeFileSync(that.fullpath, "file rotated: [" + rand + "]");
                if(numFiles >= that.options.numfiles){
                    fs.unlink(that.fullpath + "." + (that.existingFiles.length - 1), function(){
                        that.existingFiles.pop();
                    });
                }
            }
        });
    }
};

Log.prototype.log = function(message){
    var st;
    try{
        st = JSON.stringify(message);
    }catch(e){
        st = message;
    }
    fs.appendFile(this.fullpath, "[INFO] " + st + "\n", function(){});
};

Log.prototype.error = function(message){
    var st;
    try{
        st = JSON.stringify(message);
    }catch(e){
        st = message;
    }
    fs.appendFile(this.fullpath, "[ERROR] " + st + "\n", function(){});
};

Log.prototype.debug = function(message){
    var st;
    try{
        st = JSON.stringify(message);
    }catch(e){
        st = message;
    }
    fs.appendFile(this.fullpath, "[DEBUG] " + st + "\n", function(){});
};

module.exports = Log;