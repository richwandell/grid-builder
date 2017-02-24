"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require('fs');

var Log = function () {
    function Log(options) {
        var _this = this;

        _classCallCheck(this, Log);

        this.options = {
            filename: "log.log",
            filesize: 1000000,
            logfolder: "log",
            numfiles: 3,
            debug: true
        };
        for (var attrname in options) {
            if (this.options.hasOwnProperty(attrname)) {
                this.options[attrname] = options[attrname];
            }
        }
        this.fullpath = this.options.logfolder + "/" + this.options.filename;
        this.existingFiles = [];
        var dir = this.options.logfolder;
        var files = fs.readdirSync(dir);
        var filename = this.options.filename;

        files.forEach(function (file) {
            if (file.indexOf(filename) > -1) {
                _this.existingFiles.push(file);
            }
        });

        fs.appendFile(this.fullpath, "[INFO] log file opened \n", function () {
            fs.watch(_this.fullpath, function (eventType, filename) {
                _this.rotate(eventType, filename);
            });
        });
    }

    _createClass(Log, [{
        key: "rotate",
        value: function rotate(eventType, filename) {
            var _this2 = this;

            if (eventType == "change") {
                var filesize = this.options.filesize;
                var numFiles = this.existingFiles.length - 1;
                fs.stat(this.fullpath, function (err, stats) {
                    if (stats.size >= filesize) {
                        console.log("should rotate");
                        for (var x = 0; x < _this2.existingFiles.length; x++) {
                            var existingFile = _this2.existingFiles[x];
                            if (existingFile != _this2.options.filename) {
                                var newName = _this2.fullpath + "." + (x + 1);
                                fs.rename(_this2.options.logfolder + "/" + existingFile, newName, function () {});
                            }
                        }
                        fs.writeFileSync(_this2.fullpath + ".0", fs.readFileSync(_this2.fullpath));
                        _this2.existingFiles.push(_this2.fullpath + "." + numFiles);
                        var rand = Math.random();
                        fs.writeFileSync(_this2.fullpath, "file rotated: [" + rand + "]");
                        if (numFiles >= _this2.options.numfiles) {
                            fs.unlink(_this2.fullpath + "." + (_this2.existingFiles.length - 1), function () {
                                _this2.existingFiles.pop();
                            });
                        }
                    }
                });
            }
        }
    }, {
        key: "log",
        value: function log(message) {
            var st = void 0;
            try {
                st = JSON.stringify(message);
            } catch (e) {
                st = message;
            }
            fs.appendFile(this.fullpath, "[INFO] " + st + "\n", function () {});
        }
    }, {
        key: "error",
        value: function error(message) {
            var st = void 0;
            try {
                st = JSON.stringify(message);
            } catch (e) {
                st = message;
            }
            fs.appendFile(this.fullpath, "[ERROR] " + st + "\n", function () {});
        }
    }, {
        key: "debug",
        value: function debug(message) {
            if (!this.options.debug) return;
            var st = void 0;
            try {
                st = JSON.stringify(message);
            } catch (e) {
                st = message;
            }
            fs.appendFile(this.fullpath, "[DEBUG] " + st + "\n", function () {});
        }
    }]);

    return Log;
}();

module.exports = Log;
//# sourceMappingURL=Log.js.map
