const fs = require('fs');

class Log {

    constructor(options){
        this.options = {
            filename: "log.log",
            filesize: 1000000,
            logfolder: "log",
            numfiles: 3,
            debug: true,
            timestamp: true
        };
        for (let attrname in options) {
            if(this.options.hasOwnProperty(attrname)){
                this.options[attrname] = options[attrname];
            }
        }
        this.fullpath = this.options.logfolder + "/" + this.options.filename;
        this.existingFiles = [];
        const dir = this.options.logfolder;
        const files = fs.readdirSync(dir);
        const filename = this.options.filename;

        files.forEach((file) => {
            if(file.indexOf(filename) > -1){
                this.existingFiles.push(file);
            }
        });
        const dt = this.getDateTime();
        fs.appendFile(this.fullpath, `[INFO][${dt}] log file opened \n`, () =>{
            this.watcher = fs.watch(this.fullpath, (eventType, filename) =>{
                this.rotate(eventType, filename);
            });
        });
    }

    getDateTime(){
        let [date, crap] = (new Date() + "").split("GMT");
        return date.trim();
    }

    close(){
        this.watcher.close();
    }

    rotate(eventType, filename) {
        if(eventType == "change"){
            const filesize = this.options.filesize;
            const numFiles = this.existingFiles.length - 1;
            fs.stat(this.fullpath, (err, stats) => {
                if(stats.size >= filesize){
                    console.log("should rotate");
                    for(let x = 0; x < this.existingFiles.length; x++){
                        let existingFile = this.existingFiles[x];
                        if(existingFile != this.options.filename){
                            let newName = this.fullpath + "." + (x + 1);
                            fs.rename(this.options.logfolder + "/" + existingFile, newName, function(){});
                        }
                    }
                    fs.writeFileSync(this.fullpath + ".0", fs.readFileSync(this.fullpath));
                    this.existingFiles.push(this.fullpath + "." + numFiles);
                    let rand = Math.random();
                    fs.writeFileSync(this.fullpath, "file rotated: [" + rand + "]");
                    if(numFiles >= this.options.numfiles){
                        fs.unlink(this.fullpath + "." + (this.existingFiles.length - 1), () => {
                            this.existingFiles.pop();
                        });
                    }
                }
            });
        }
    }

    log(message, level = "INFO", json = true){
        let st;
        if(json) {
            st = this.makeMessage(message);
        }else{
            st = message;
        }
        let fst = `[${level}]`;
        if(this.options.timestamp){
            let dt = this.getDateTime();
            fst += `[${dt}]`;
        }
        fst += " ";

        fst += st;
        fs.appendFile(this.fullpath, fst + "\n", function(){});
    }

    error(message){
        const st = this.makeMessage(message);
        this.log(st, "ERROR", false);
    }

    debug(message){
        if(!this.options.debug) return;
        const st = this.makeMessage(message);
        this.log(st, "DEBUG", false);
    }

    makeMessage(message){
        if(typeof(message) === "string"){
            return message;
        }
        let st;
        try{
            st = JSON.stringify(message);
        }catch(e){
            st = message;
        }
        return st;
    }
}


export default Log;