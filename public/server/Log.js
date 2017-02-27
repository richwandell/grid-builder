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
            _this.watcher = fs.watch(_this.fullpath, function (eventType, filename) {
                _this.rotate(eventType, filename);
            });
        });
    }

    _createClass(Log, [{
        key: "close",
        value: function close() {
            this.watcher.close();
        }
    }, {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkxvZy5lczYiXSwibmFtZXMiOlsiZnMiLCJyZXF1aXJlIiwiTG9nIiwib3B0aW9ucyIsImZpbGVuYW1lIiwiZmlsZXNpemUiLCJsb2dmb2xkZXIiLCJudW1maWxlcyIsImRlYnVnIiwiYXR0cm5hbWUiLCJoYXNPd25Qcm9wZXJ0eSIsImZ1bGxwYXRoIiwiZXhpc3RpbmdGaWxlcyIsImRpciIsImZpbGVzIiwicmVhZGRpclN5bmMiLCJmb3JFYWNoIiwiZmlsZSIsImluZGV4T2YiLCJwdXNoIiwiYXBwZW5kRmlsZSIsIndhdGNoZXIiLCJ3YXRjaCIsImV2ZW50VHlwZSIsInJvdGF0ZSIsImNsb3NlIiwibnVtRmlsZXMiLCJsZW5ndGgiLCJzdGF0IiwiZXJyIiwic3RhdHMiLCJzaXplIiwiY29uc29sZSIsImxvZyIsIngiLCJleGlzdGluZ0ZpbGUiLCJuZXdOYW1lIiwicmVuYW1lIiwid3JpdGVGaWxlU3luYyIsInJlYWRGaWxlU3luYyIsInJhbmQiLCJNYXRoIiwicmFuZG9tIiwidW5saW5rIiwicG9wIiwibWVzc2FnZSIsInN0IiwiSlNPTiIsInN0cmluZ2lmeSIsImUiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxJQUFNQSxLQUFLQyxRQUFRLElBQVIsQ0FBWDs7SUFFTUMsRztBQUVGLGlCQUFZQyxPQUFaLEVBQW9CO0FBQUE7O0FBQUE7O0FBQ2hCLGFBQUtBLE9BQUwsR0FBZTtBQUNYQyxzQkFBVSxTQURDO0FBRVhDLHNCQUFVLE9BRkM7QUFHWEMsdUJBQVcsS0FIQTtBQUlYQyxzQkFBVSxDQUpDO0FBS1hDLG1CQUFPO0FBTEksU0FBZjtBQU9BLGFBQUssSUFBSUMsUUFBVCxJQUFxQk4sT0FBckIsRUFBOEI7QUFDMUIsZ0JBQUcsS0FBS0EsT0FBTCxDQUFhTyxjQUFiLENBQTRCRCxRQUE1QixDQUFILEVBQXlDO0FBQ3JDLHFCQUFLTixPQUFMLENBQWFNLFFBQWIsSUFBeUJOLFFBQVFNLFFBQVIsQ0FBekI7QUFDSDtBQUNK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SDtBQUNKO0FBQ0osaUJBcEJEO0FBcUJIO0FBQ0o7Ozs0QkFFR0MsTyxFQUFRO0FBQ1IsZ0JBQUlDLFdBQUo7QUFDQSxnQkFBRztBQUNDQSxxQkFBS0MsS0FBS0MsU0FBTCxDQUFlSCxPQUFmLENBQUw7QUFDSCxhQUZELENBRUMsT0FBTUksQ0FBTixFQUFRO0FBQ0xILHFCQUFLRCxPQUFMO0FBQ0g7QUFDRDdDLGVBQUdvQixVQUFILENBQWMsS0FBS1QsUUFBbkIsRUFBNkIsWUFBWW1DLEVBQVosR0FBaUIsSUFBOUMsRUFBb0QsWUFBVSxDQUFFLENBQWhFO0FBQ0g7Ozs4QkFFS0QsTyxFQUFRO0FBQ1YsZ0JBQUlDLFdBQUo7QUFDQSxnQkFBRztBQUNDQSxxQkFBS0MsS0FBS0MsU0FBTCxDQUFlSCxPQUFmLENBQUw7QUFDSCxhQUZELENBRUMsT0FBTUksQ0FBTixFQUFRO0FBQ0xILHFCQUFLRCxPQUFMO0FBQ0g7QUFDRDdDLGVBQUdvQixVQUFILENBQWMsS0FBS1QsUUFBbkIsRUFBNkIsYUFBYW1DLEVBQWIsR0FBa0IsSUFBL0MsRUFBcUQsWUFBVSxDQUFFLENBQWpFO0FBQ0g7Ozs4QkFFS0QsTyxFQUFRO0FBQ1YsZ0JBQUcsQ0FBQyxLQUFLMUMsT0FBTCxDQUFhSyxLQUFqQixFQUF3QjtBQUN4QixnQkFBSXNDLFdBQUo7QUFDQSxnQkFBRztBQUNDQSxxQkFBS0MsS0FBS0MsU0FBTCxDQUFlSCxPQUFmLENBQUw7QUFDSCxhQUZELENBRUMsT0FBTUksQ0FBTixFQUFRO0FBQ0xILHFCQUFLRCxPQUFMO0FBQ0g7QUFDRDdDLGVBQUdvQixVQUFILENBQWMsS0FBS1QsUUFBbkIsRUFBNkIsYUFBYW1DLEVBQWIsR0FBa0IsSUFBL0MsRUFBcUQsWUFBVSxDQUFFLENBQWpFO0FBQ0g7Ozs7OztBQUlMSSxPQUFPQyxPQUFQLEdBQWlCakQsR0FBakIiLCJmaWxlIjoiTG9nLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuXG5jbGFzcyBMb2cge1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucyl7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IHtcbiAgICAgICAgICAgIGZpbGVuYW1lOiBcImxvZy5sb2dcIixcbiAgICAgICAgICAgIGZpbGVzaXplOiAxMDAwMDAwLFxuICAgICAgICAgICAgbG9nZm9sZGVyOiBcImxvZ1wiLFxuICAgICAgICAgICAgbnVtZmlsZXM6IDMsXG4gICAgICAgICAgICBkZWJ1ZzogdHJ1ZVxuICAgICAgICB9O1xuICAgICAgICBmb3IgKGxldCBhdHRybmFtZSBpbiBvcHRpb25zKSB7XG4gICAgICAgICAgICBpZih0aGlzLm9wdGlvbnMuaGFzT3duUHJvcGVydHkoYXR0cm5hbWUpKXtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnNbYXR0cm5hbWVdID0gb3B0aW9uc1thdHRybmFtZV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5mdWxscGF0aCA9IHRoaXMub3B0aW9ucy5sb2dmb2xkZXIgKyBcIi9cIiArIHRoaXMub3B0aW9ucy5maWxlbmFtZTtcbiAgICAgICAgdGhpcy5leGlzdGluZ0ZpbGVzID0gW107XG4gICAgICAgIGNvbnN0IGRpciA9IHRoaXMub3B0aW9ucy5sb2dmb2xkZXI7XG4gICAgICAgIGNvbnN0IGZpbGVzID0gZnMucmVhZGRpclN5bmMoZGlyKTtcbiAgICAgICAgY29uc3QgZmlsZW5hbWUgPSB0aGlzLm9wdGlvbnMuZmlsZW5hbWU7XG5cbiAgICAgICAgZmlsZXMuZm9yRWFjaCgoZmlsZSkgPT4ge1xuICAgICAgICAgICAgaWYoZmlsZS5pbmRleE9mKGZpbGVuYW1lKSA+IC0xKXtcbiAgICAgICAgICAgICAgICB0aGlzLmV4aXN0aW5nRmlsZXMucHVzaChmaWxlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgZnMuYXBwZW5kRmlsZSh0aGlzLmZ1bGxwYXRoLCBcIltJTkZPXSBsb2cgZmlsZSBvcGVuZWQgXFxuXCIsICgpID0+e1xuICAgICAgICAgICAgdGhpcy53YXRjaGVyID0gZnMud2F0Y2godGhpcy5mdWxscGF0aCwgKGV2ZW50VHlwZSwgZmlsZW5hbWUpID0+e1xuICAgICAgICAgICAgICAgIHRoaXMucm90YXRlKGV2ZW50VHlwZSwgZmlsZW5hbWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGNsb3NlKCl7XG4gICAgICAgIHRoaXMud2F0Y2hlci5jbG9zZSgpO1xuICAgIH1cblxuICAgIHJvdGF0ZShldmVudFR5cGUsIGZpbGVuYW1lKSB7XG4gICAgICAgIGlmKGV2ZW50VHlwZSA9PSBcImNoYW5nZVwiKXtcbiAgICAgICAgICAgIGNvbnN0IGZpbGVzaXplID0gdGhpcy5vcHRpb25zLmZpbGVzaXplO1xuICAgICAgICAgICAgY29uc3QgbnVtRmlsZXMgPSB0aGlzLmV4aXN0aW5nRmlsZXMubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgIGZzLnN0YXQodGhpcy5mdWxscGF0aCwgKGVyciwgc3RhdHMpID0+IHtcbiAgICAgICAgICAgICAgICBpZihzdGF0cy5zaXplID49IGZpbGVzaXplKXtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJzaG91bGQgcm90YXRlXCIpO1xuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IHggPSAwOyB4IDwgdGhpcy5leGlzdGluZ0ZpbGVzLmxlbmd0aDsgeCsrKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBleGlzdGluZ0ZpbGUgPSB0aGlzLmV4aXN0aW5nRmlsZXNbeF07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihleGlzdGluZ0ZpbGUgIT0gdGhpcy5vcHRpb25zLmZpbGVuYW1lKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbmV3TmFtZSA9IHRoaXMuZnVsbHBhdGggKyBcIi5cIiArICh4ICsgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnMucmVuYW1lKHRoaXMub3B0aW9ucy5sb2dmb2xkZXIgKyBcIi9cIiArIGV4aXN0aW5nRmlsZSwgbmV3TmFtZSwgZnVuY3Rpb24oKXt9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKHRoaXMuZnVsbHBhdGggKyBcIi4wXCIsIGZzLnJlYWRGaWxlU3luYyh0aGlzLmZ1bGxwYXRoKSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXhpc3RpbmdGaWxlcy5wdXNoKHRoaXMuZnVsbHBhdGggKyBcIi5cIiArIG51bUZpbGVzKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJhbmQgPSBNYXRoLnJhbmRvbSgpO1xuICAgICAgICAgICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKHRoaXMuZnVsbHBhdGgsIFwiZmlsZSByb3RhdGVkOiBbXCIgKyByYW5kICsgXCJdXCIpO1xuICAgICAgICAgICAgICAgICAgICBpZihudW1GaWxlcyA+PSB0aGlzLm9wdGlvbnMubnVtZmlsZXMpe1xuICAgICAgICAgICAgICAgICAgICAgICAgZnMudW5saW5rKHRoaXMuZnVsbHBhdGggKyBcIi5cIiArICh0aGlzLmV4aXN0aW5nRmlsZXMubGVuZ3RoIC0gMSksICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmV4aXN0aW5nRmlsZXMucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbG9nKG1lc3NhZ2Upe1xuICAgICAgICBsZXQgc3Q7XG4gICAgICAgIHRyeXtcbiAgICAgICAgICAgIHN0ID0gSlNPTi5zdHJpbmdpZnkobWVzc2FnZSk7XG4gICAgICAgIH1jYXRjaChlKXtcbiAgICAgICAgICAgIHN0ID0gbWVzc2FnZTtcbiAgICAgICAgfVxuICAgICAgICBmcy5hcHBlbmRGaWxlKHRoaXMuZnVsbHBhdGgsIFwiW0lORk9dIFwiICsgc3QgKyBcIlxcblwiLCBmdW5jdGlvbigpe30pO1xuICAgIH1cblxuICAgIGVycm9yKG1lc3NhZ2Upe1xuICAgICAgICBsZXQgc3Q7XG4gICAgICAgIHRyeXtcbiAgICAgICAgICAgIHN0ID0gSlNPTi5zdHJpbmdpZnkobWVzc2FnZSk7XG4gICAgICAgIH1jYXRjaChlKXtcbiAgICAgICAgICAgIHN0ID0gbWVzc2FnZTtcbiAgICAgICAgfVxuICAgICAgICBmcy5hcHBlbmRGaWxlKHRoaXMuZnVsbHBhdGgsIFwiW0VSUk9SXSBcIiArIHN0ICsgXCJcXG5cIiwgZnVuY3Rpb24oKXt9KTtcbiAgICB9XG5cbiAgICBkZWJ1ZyhtZXNzYWdlKXtcbiAgICAgICAgaWYoIXRoaXMub3B0aW9ucy5kZWJ1ZykgcmV0dXJuO1xuICAgICAgICBsZXQgc3Q7XG4gICAgICAgIHRyeXtcbiAgICAgICAgICAgIHN0ID0gSlNPTi5zdHJpbmdpZnkobWVzc2FnZSk7XG4gICAgICAgIH1jYXRjaChlKXtcbiAgICAgICAgICAgIHN0ID0gbWVzc2FnZTtcbiAgICAgICAgfVxuICAgICAgICBmcy5hcHBlbmRGaWxlKHRoaXMuZnVsbHBhdGgsIFwiW0RFQlVHXSBcIiArIHN0ICsgXCJcXG5cIiwgZnVuY3Rpb24oKXt9KTtcbiAgICB9XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBMb2c7Il19
//# sourceMappingURL=Log.js.map
