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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkxvZy5lczYiXSwibmFtZXMiOlsiZnMiLCJyZXF1aXJlIiwiTG9nIiwib3B0aW9ucyIsImZpbGVuYW1lIiwiZmlsZXNpemUiLCJsb2dmb2xkZXIiLCJudW1maWxlcyIsImRlYnVnIiwiYXR0cm5hbWUiLCJoYXNPd25Qcm9wZXJ0eSIsImZ1bGxwYXRoIiwiZXhpc3RpbmdGaWxlcyIsImRpciIsImZpbGVzIiwicmVhZGRpclN5bmMiLCJmb3JFYWNoIiwiZmlsZSIsImluZGV4T2YiLCJwdXNoIiwiYXBwZW5kRmlsZSIsIndhdGNoIiwiZXZlbnRUeXBlIiwicm90YXRlIiwibnVtRmlsZXMiLCJsZW5ndGgiLCJzdGF0IiwiZXJyIiwic3RhdHMiLCJzaXplIiwiY29uc29sZSIsImxvZyIsIngiLCJleGlzdGluZ0ZpbGUiLCJuZXdOYW1lIiwicmVuYW1lIiwid3JpdGVGaWxlU3luYyIsInJlYWRGaWxlU3luYyIsInJhbmQiLCJNYXRoIiwicmFuZG9tIiwidW5saW5rIiwicG9wIiwibWVzc2FnZSIsInN0IiwiSlNPTiIsInN0cmluZ2lmeSIsImUiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxJQUFNQSxLQUFLQyxRQUFRLElBQVIsQ0FBWDs7SUFFTUMsRztBQUVGLGlCQUFZQyxPQUFaLEVBQW9CO0FBQUE7O0FBQUE7O0FBQ2hCLGFBQUtBLE9BQUwsR0FBZTtBQUNYQyxzQkFBVSxTQURDO0FBRVhDLHNCQUFVLE9BRkM7QUFHWEMsdUJBQVcsS0FIQTtBQUlYQyxzQkFBVSxDQUpDO0FBS1hDLG1CQUFPO0FBTEksU0FBZjtBQU9BLGFBQUssSUFBSUMsUUFBVCxJQUFxQk4sT0FBckIsRUFBOEI7QUFDMUIsZ0JBQUcsS0FBS0EsT0FBTCxDQUFhTyxjQUFiLENBQTRCRCxRQUE1QixDQUFILEVBQXlDO0FBQ3JDLHFCQUFLTixPQUFMLENBQWFNLFFBQWIsSUFBeUJOLFFBQVFNLFFBQVIsQ0FBekI7QUFDSDtBQUNKO0FBQ0QsYUFBS0UsUUFBTCxH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QUtDLEtBQUtDLFNBQUwsQ0FBZUgsT0FBZixDQUFMO0FBQ0gsYUFGRCxDQUVDLE9BQU1JLENBQU4sRUFBUTtBQUNMSCxxQkFBS0QsT0FBTDtBQUNIO0FBQ0QzQyxlQUFHb0IsVUFBSCxDQUFjLEtBQUtULFFBQW5CLEVBQTZCLFlBQVlpQyxFQUFaLEdBQWlCLElBQTlDLEVBQW9ELFlBQVUsQ0FBRSxDQUFoRTtBQUNIOzs7OEJBRUtELE8sRUFBUTtBQUNWLGdCQUFJQyxXQUFKO0FBQ0EsZ0JBQUc7QUFDQ0EscUJBQUtDLEtBQUtDLFNBQUwsQ0FBZUgsT0FBZixDQUFMO0FBQ0gsYUFGRCxDQUVDLE9BQU1JLENBQU4sRUFBUTtBQUNMSCxxQkFBS0QsT0FBTDtBQUNIO0FBQ0QzQyxlQUFHb0IsVUFBSCxDQUFjLEtBQUtULFFBQW5CLEVBQTZCLGFBQWFpQyxFQUFiLEdBQWtCLElBQS9DLEVBQXFELFlBQVUsQ0FBRSxDQUFqRTtBQUNIOzs7OEJBRUtELE8sRUFBUTtBQUNWLGdCQUFHLENBQUMsS0FBS3hDLE9BQUwsQ0FBYUssS0FBakIsRUFBd0I7QUFDeEIsZ0JBQUlvQyxXQUFKO0FBQ0EsZ0JBQUc7QUFDQ0EscUJBQUtDLEtBQUtDLFNBQUwsQ0FBZUgsT0FBZixDQUFMO0FBQ0gsYUFGRCxDQUVDLE9BQU1JLENBQU4sRUFBUTtBQUNMSCxxQkFBS0QsT0FBTDtBQUNIO0FBQ0QzQyxlQUFHb0IsVUFBSCxDQUFjLEtBQUtULFFBQW5CLEVBQTZCLGFBQWFpQyxFQUFiLEdBQWtCLElBQS9DLEVBQXFELFlBQVUsQ0FBRSxDQUFqRTtBQUNIOzs7Ozs7QUFJTEksT0FBT0MsT0FBUCxHQUFpQi9DLEdBQWpCIiwiZmlsZSI6IkxvZy5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcblxuY2xhc3MgTG9nIHtcblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpe1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSB7XG4gICAgICAgICAgICBmaWxlbmFtZTogXCJsb2cubG9nXCIsXG4gICAgICAgICAgICBmaWxlc2l6ZTogMTAwMDAwMCxcbiAgICAgICAgICAgIGxvZ2ZvbGRlcjogXCJsb2dcIixcbiAgICAgICAgICAgIG51bWZpbGVzOiAzLFxuICAgICAgICAgICAgZGVidWc6IHRydWVcbiAgICAgICAgfTtcbiAgICAgICAgZm9yIChsZXQgYXR0cm5hbWUgaW4gb3B0aW9ucykge1xuICAgICAgICAgICAgaWYodGhpcy5vcHRpb25zLmhhc093blByb3BlcnR5KGF0dHJuYW1lKSl7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zW2F0dHJuYW1lXSA9IG9wdGlvbnNbYXR0cm5hbWVdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuZnVsbHBhdGggPSB0aGlzLm9wdGlvbnMubG9nZm9sZGVyICsgXCIvXCIgKyB0aGlzLm9wdGlvbnMuZmlsZW5hbWU7XG4gICAgICAgIHRoaXMuZXhpc3RpbmdGaWxlcyA9IFtdO1xuICAgICAgICBjb25zdCBkaXIgPSB0aGlzLm9wdGlvbnMubG9nZm9sZGVyO1xuICAgICAgICBjb25zdCBmaWxlcyA9IGZzLnJlYWRkaXJTeW5jKGRpcik7XG4gICAgICAgIGNvbnN0IGZpbGVuYW1lID0gdGhpcy5vcHRpb25zLmZpbGVuYW1lO1xuXG4gICAgICAgIGZpbGVzLmZvckVhY2goKGZpbGUpID0+IHtcbiAgICAgICAgICAgIGlmKGZpbGUuaW5kZXhPZihmaWxlbmFtZSkgPiAtMSl7XG4gICAgICAgICAgICAgICAgdGhpcy5leGlzdGluZ0ZpbGVzLnB1c2goZmlsZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZzLmFwcGVuZEZpbGUodGhpcy5mdWxscGF0aCwgXCJbSU5GT10gbG9nIGZpbGUgb3BlbmVkIFxcblwiLCAoKSA9PntcbiAgICAgICAgICAgIGZzLndhdGNoKHRoaXMuZnVsbHBhdGgsIChldmVudFR5cGUsIGZpbGVuYW1lKSA9PntcbiAgICAgICAgICAgICAgICB0aGlzLnJvdGF0ZShldmVudFR5cGUsIGZpbGVuYW1lKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByb3RhdGUoZXZlbnRUeXBlLCBmaWxlbmFtZSkge1xuICAgICAgICBpZihldmVudFR5cGUgPT0gXCJjaGFuZ2VcIil7XG4gICAgICAgICAgICBjb25zdCBmaWxlc2l6ZSA9IHRoaXMub3B0aW9ucy5maWxlc2l6ZTtcbiAgICAgICAgICAgIGNvbnN0IG51bUZpbGVzID0gdGhpcy5leGlzdGluZ0ZpbGVzLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICBmcy5zdGF0KHRoaXMuZnVsbHBhdGgsIChlcnIsIHN0YXRzKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYoc3RhdHMuc2l6ZSA+PSBmaWxlc2l6ZSl7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwic2hvdWxkIHJvdGF0ZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yKGxldCB4ID0gMDsgeCA8IHRoaXMuZXhpc3RpbmdGaWxlcy5sZW5ndGg7IHgrKyl7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZXhpc3RpbmdGaWxlID0gdGhpcy5leGlzdGluZ0ZpbGVzW3hdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoZXhpc3RpbmdGaWxlICE9IHRoaXMub3B0aW9ucy5maWxlbmFtZSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG5ld05hbWUgPSB0aGlzLmZ1bGxwYXRoICsgXCIuXCIgKyAoeCArIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZzLnJlbmFtZSh0aGlzLm9wdGlvbnMubG9nZm9sZGVyICsgXCIvXCIgKyBleGlzdGluZ0ZpbGUsIG5ld05hbWUsIGZ1bmN0aW9uKCl7fSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyh0aGlzLmZ1bGxwYXRoICsgXCIuMFwiLCBmcy5yZWFkRmlsZVN5bmModGhpcy5mdWxscGF0aCkpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmV4aXN0aW5nRmlsZXMucHVzaCh0aGlzLmZ1bGxwYXRoICsgXCIuXCIgKyBudW1GaWxlcyk7XG4gICAgICAgICAgICAgICAgICAgIGxldCByYW5kID0gTWF0aC5yYW5kb20oKTtcbiAgICAgICAgICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyh0aGlzLmZ1bGxwYXRoLCBcImZpbGUgcm90YXRlZDogW1wiICsgcmFuZCArIFwiXVwiKTtcbiAgICAgICAgICAgICAgICAgICAgaWYobnVtRmlsZXMgPj0gdGhpcy5vcHRpb25zLm51bWZpbGVzKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZzLnVubGluayh0aGlzLmZ1bGxwYXRoICsgXCIuXCIgKyAodGhpcy5leGlzdGluZ0ZpbGVzLmxlbmd0aCAtIDEpLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5leGlzdGluZ0ZpbGVzLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGxvZyhtZXNzYWdlKXtcbiAgICAgICAgbGV0IHN0O1xuICAgICAgICB0cnl7XG4gICAgICAgICAgICBzdCA9IEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpO1xuICAgICAgICB9Y2F0Y2goZSl7XG4gICAgICAgICAgICBzdCA9IG1lc3NhZ2U7XG4gICAgICAgIH1cbiAgICAgICAgZnMuYXBwZW5kRmlsZSh0aGlzLmZ1bGxwYXRoLCBcIltJTkZPXSBcIiArIHN0ICsgXCJcXG5cIiwgZnVuY3Rpb24oKXt9KTtcbiAgICB9XG5cbiAgICBlcnJvcihtZXNzYWdlKXtcbiAgICAgICAgbGV0IHN0O1xuICAgICAgICB0cnl7XG4gICAgICAgICAgICBzdCA9IEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpO1xuICAgICAgICB9Y2F0Y2goZSl7XG4gICAgICAgICAgICBzdCA9IG1lc3NhZ2U7XG4gICAgICAgIH1cbiAgICAgICAgZnMuYXBwZW5kRmlsZSh0aGlzLmZ1bGxwYXRoLCBcIltFUlJPUl0gXCIgKyBzdCArIFwiXFxuXCIsIGZ1bmN0aW9uKCl7fSk7XG4gICAgfVxuXG4gICAgZGVidWcobWVzc2FnZSl7XG4gICAgICAgIGlmKCF0aGlzLm9wdGlvbnMuZGVidWcpIHJldHVybjtcbiAgICAgICAgbGV0IHN0O1xuICAgICAgICB0cnl7XG4gICAgICAgICAgICBzdCA9IEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpO1xuICAgICAgICB9Y2F0Y2goZSl7XG4gICAgICAgICAgICBzdCA9IG1lc3NhZ2U7XG4gICAgICAgIH1cbiAgICAgICAgZnMuYXBwZW5kRmlsZSh0aGlzLmZ1bGxwYXRoLCBcIltERUJVR10gXCIgKyBzdCArIFwiXFxuXCIsIGZ1bmN0aW9uKCl7fSk7XG4gICAgfVxufVxuXG5cbm1vZHVsZS5leHBvcnRzID0gTG9nOyJdfQ==
//# sourceMappingURL=Log.js.map
