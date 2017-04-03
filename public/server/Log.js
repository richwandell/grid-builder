"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

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
            debug: true,
            timestamp: true
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
        var dt = this.getDateTime();
        fs.appendFile(this.fullpath, "[INFO][" + dt + "] log file opened \n", function () {
            _this.watcher = fs.watch(_this.fullpath, function (eventType, filename) {
                _this.rotate(eventType, filename);
            });
        });
    }

    _createClass(Log, [{
        key: "getDateTime",
        value: function getDateTime() {
            var _split = (new Date() + "").split("GMT"),
                _split2 = _slicedToArray(_split, 2),
                date = _split2[0],
                crap = _split2[1];

            return date.trim();
        }
    }, {
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
            var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "INFO";
            var json = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

            var st = void 0;
            if (json) {
                st = this.makeMessage(message);
            } else {
                st = message;
            }
            var fst = "[" + level + "]";
            if (this.options.timestamp) {
                var dt = this.getDateTime();
                fst += "[" + dt + "]";
            }
            fst += " ";

            fst += st;
            fs.appendFile(this.fullpath, fst + "\n", function () {});
        }
    }, {
        key: "error",
        value: function error(message) {
            var st = this.makeMessage(message);
            this.log(st, "ERROR", false);
        }
    }, {
        key: "debug",
        value: function debug(message) {
            if (!this.options.debug) return;
            var st = this.makeMessage(message);
            this.log(st, "DEBUG", false);
        }
    }, {
        key: "makeMessage",
        value: function makeMessage(message) {
            if (typeof message === "string") {
                return message;
            }
            var st = void 0;
            try {
                st = JSON.stringify(message);
            } catch (e) {
                st = message;
            }
            return st;
        }
    }]);

    return Log;
}();

exports.default = Log;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvTG9nLmVzNiJdLCJuYW1lcyI6WyJmcyIsInJlcXVpcmUiLCJMb2ciLCJvcHRpb25zIiwiZmlsZW5hbWUiLCJmaWxlc2l6ZSIsImxvZ2ZvbGRlciIsIm51bWZpbGVzIiwiZGVidWciLCJ0aW1lc3RhbXAiLCJhdHRybmFtZSIsImhhc093blByb3BlcnR5IiwiZnVsbHBhdGgiLCJleGlzdGluZ0ZpbGVzIiwiZGlyIiwiZmlsZXMiLCJyZWFkZGlyU3luYyIsImZvckVhY2giLCJmaWxlIiwiaW5kZXhPZiIsInB1c2giLCJkdCIsImdldERhdGVUaW1lIiwiYXBwZW5kRmlsZSIsIndhdGNoZXIiLCJ3YXRjaCIsImV2ZW50VHlwZSIsInJvdGF0ZSIsIkRhdGUiLCJzcGxpdCIsImRhdGUiLCJjcmFwIiwidHJpbSIsImNsb3NlIiwibnVtRmlsZXMiLCJsZW5ndGgiLCJzdGF0IiwiZXJyIiwic3RhdHMiLCJzaXplIiwiY29uc29sZSIsImxvZyIsIngiLCJleGlzdGluZ0ZpbGUiLCJuZXdOYW1lIiwicmVuYW1lIiwid3JpdGVGaWxlU3luYyIsInJlYWRGaWxlU3luYyIsInJhbmQiLCJNYXRoIiwicmFuZG9tIiwidW5saW5rIiwicG9wIiwibWVzc2FnZSIsImxldmVsIiwianNvbiIsInN0IiwibWFrZU1lc3NhZ2UiLCJmc3QiLCJKU09OIiwic3RyaW5naWZ5IiwiZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsSUFBTUEsS0FBS0MsUUFBUSxJQUFSLENBQVg7O0lBRU1DLEc7QUFFRixpQkFBWUMsT0FBWixFQUFvQjtBQUFBOztBQUFBOztBQUNoQixhQUFLQSxPQUFMLEdBQWU7QUFDWEMsc0JBQVUsU0FEQztBQUVYQyxzQkFBVSxPQUZDO0FBR1hDLHVCQUFXLEtBSEE7QUFJWEMsc0JBQVUsQ0FKQztBQUtYQyxtQkFBTyxJQUxJO0FBTVhDLHVCQUFXO0FBTkEsU0FBZjtBQVFBLGFBQUssSUFBSUMsUUFBVCxJQUFxQlAsT0FBckIsRUFB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Ozs7OEJBRUtILE8sRUFBUTtBQUNWLGdCQUFHLENBQUMsS0FBS2xELE9BQUwsQ0FBYUssS0FBakIsRUFBd0I7QUFDeEIsZ0JBQU1nRCxLQUFLLEtBQUtDLFdBQUwsQ0FBaUJKLE9BQWpCLENBQVg7QUFDQSxpQkFBS1osR0FBTCxDQUFTZSxFQUFULEVBQWEsT0FBYixFQUFzQixLQUF0QjtBQUNIOzs7b0NBRVdILE8sRUFBUTtBQUNoQixnQkFBRyxPQUFPQSxPQUFQLEtBQW9CLFFBQXZCLEVBQWdDO0FBQzVCLHVCQUFPQSxPQUFQO0FBQ0g7QUFDRCxnQkFBSUcsV0FBSjtBQUNBLGdCQUFHO0FBQ0NBLHFCQUFLRyxLQUFLQyxTQUFMLENBQWVQLE9BQWYsQ0FBTDtBQUNILGFBRkQsQ0FFQyxPQUFNUSxDQUFOLEVBQVE7QUFDTEwscUJBQUtILE9BQUw7QUFDSDtBQUNELG1CQUFPRyxFQUFQO0FBQ0g7Ozs7OztrQkFJVXRELEciLCJmaWxlIjoiTG9nLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuXG5jbGFzcyBMb2cge1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucyl7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IHtcbiAgICAgICAgICAgIGZpbGVuYW1lOiBcImxvZy5sb2dcIixcbiAgICAgICAgICAgIGZpbGVzaXplOiAxMDAwMDAwLFxuICAgICAgICAgICAgbG9nZm9sZGVyOiBcImxvZ1wiLFxuICAgICAgICAgICAgbnVtZmlsZXM6IDMsXG4gICAgICAgICAgICBkZWJ1ZzogdHJ1ZSxcbiAgICAgICAgICAgIHRpbWVzdGFtcDogdHJ1ZVxuICAgICAgICB9O1xuICAgICAgICBmb3IgKGxldCBhdHRybmFtZSBpbiBvcHRpb25zKSB7XG4gICAgICAgICAgICBpZih0aGlzLm9wdGlvbnMuaGFzT3duUHJvcGVydHkoYXR0cm5hbWUpKXtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnNbYXR0cm5hbWVdID0gb3B0aW9uc1thdHRybmFtZV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5mdWxscGF0aCA9IHRoaXMub3B0aW9ucy5sb2dmb2xkZXIgKyBcIi9cIiArIHRoaXMub3B0aW9ucy5maWxlbmFtZTtcbiAgICAgICAgdGhpcy5leGlzdGluZ0ZpbGVzID0gW107XG4gICAgICAgIGNvbnN0IGRpciA9IHRoaXMub3B0aW9ucy5sb2dmb2xkZXI7XG4gICAgICAgIGNvbnN0IGZpbGVzID0gZnMucmVhZGRpclN5bmMoZGlyKTtcbiAgICAgICAgY29uc3QgZmlsZW5hbWUgPSB0aGlzLm9wdGlvbnMuZmlsZW5hbWU7XG5cbiAgICAgICAgZmlsZXMuZm9yRWFjaCgoZmlsZSkgPT4ge1xuICAgICAgICAgICAgaWYoZmlsZS5pbmRleE9mKGZpbGVuYW1lKSA+IC0xKXtcbiAgICAgICAgICAgICAgICB0aGlzLmV4aXN0aW5nRmlsZXMucHVzaChmaWxlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGR0ID0gdGhpcy5nZXREYXRlVGltZSgpO1xuICAgICAgICBmcy5hcHBlbmRGaWxlKHRoaXMuZnVsbHBhdGgsIGBbSU5GT11bJHtkdH1dIGxvZyBmaWxlIG9wZW5lZCBcXG5gLCAoKSA9PntcbiAgICAgICAgICAgIHRoaXMud2F0Y2hlciA9IGZzLndhdGNoKHRoaXMuZnVsbHBhdGgsIChldmVudFR5cGUsIGZpbGVuYW1lKSA9PntcbiAgICAgICAgICAgICAgICB0aGlzLnJvdGF0ZShldmVudFR5cGUsIGZpbGVuYW1lKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXREYXRlVGltZSgpe1xuICAgICAgICBsZXQgW2RhdGUsIGNyYXBdID0gKG5ldyBEYXRlKCkgKyBcIlwiKS5zcGxpdChcIkdNVFwiKTtcbiAgICAgICAgcmV0dXJuIGRhdGUudHJpbSgpO1xuICAgIH1cblxuICAgIGNsb3NlKCl7XG4gICAgICAgIHRoaXMud2F0Y2hlci5jbG9zZSgpO1xuICAgIH1cblxuICAgIHJvdGF0ZShldmVudFR5cGUsIGZpbGVuYW1lKSB7XG4gICAgICAgIGlmKGV2ZW50VHlwZSA9PSBcImNoYW5nZVwiKXtcbiAgICAgICAgICAgIGNvbnN0IGZpbGVzaXplID0gdGhpcy5vcHRpb25zLmZpbGVzaXplO1xuICAgICAgICAgICAgY29uc3QgbnVtRmlsZXMgPSB0aGlzLmV4aXN0aW5nRmlsZXMubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgIGZzLnN0YXQodGhpcy5mdWxscGF0aCwgKGVyciwgc3RhdHMpID0+IHtcbiAgICAgICAgICAgICAgICBpZihzdGF0cy5zaXplID49IGZpbGVzaXplKXtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJzaG91bGQgcm90YXRlXCIpO1xuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IHggPSAwOyB4IDwgdGhpcy5leGlzdGluZ0ZpbGVzLmxlbmd0aDsgeCsrKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBleGlzdGluZ0ZpbGUgPSB0aGlzLmV4aXN0aW5nRmlsZXNbeF07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihleGlzdGluZ0ZpbGUgIT0gdGhpcy5vcHRpb25zLmZpbGVuYW1lKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbmV3TmFtZSA9IHRoaXMuZnVsbHBhdGggKyBcIi5cIiArICh4ICsgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnMucmVuYW1lKHRoaXMub3B0aW9ucy5sb2dmb2xkZXIgKyBcIi9cIiArIGV4aXN0aW5nRmlsZSwgbmV3TmFtZSwgZnVuY3Rpb24oKXt9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKHRoaXMuZnVsbHBhdGggKyBcIi4wXCIsIGZzLnJlYWRGaWxlU3luYyh0aGlzLmZ1bGxwYXRoKSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXhpc3RpbmdGaWxlcy5wdXNoKHRoaXMuZnVsbHBhdGggKyBcIi5cIiArIG51bUZpbGVzKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJhbmQgPSBNYXRoLnJhbmRvbSgpO1xuICAgICAgICAgICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKHRoaXMuZnVsbHBhdGgsIFwiZmlsZSByb3RhdGVkOiBbXCIgKyByYW5kICsgXCJdXCIpO1xuICAgICAgICAgICAgICAgICAgICBpZihudW1GaWxlcyA+PSB0aGlzLm9wdGlvbnMubnVtZmlsZXMpe1xuICAgICAgICAgICAgICAgICAgICAgICAgZnMudW5saW5rKHRoaXMuZnVsbHBhdGggKyBcIi5cIiArICh0aGlzLmV4aXN0aW5nRmlsZXMubGVuZ3RoIC0gMSksICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmV4aXN0aW5nRmlsZXMucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbG9nKG1lc3NhZ2UsIGxldmVsID0gXCJJTkZPXCIsIGpzb24gPSB0cnVlKXtcbiAgICAgICAgbGV0IHN0O1xuICAgICAgICBpZihqc29uKSB7XG4gICAgICAgICAgICBzdCA9IHRoaXMubWFrZU1lc3NhZ2UobWVzc2FnZSk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgc3QgPSBtZXNzYWdlO1xuICAgICAgICB9XG4gICAgICAgIGxldCBmc3QgPSBgWyR7bGV2ZWx9XWA7XG4gICAgICAgIGlmKHRoaXMub3B0aW9ucy50aW1lc3RhbXApe1xuICAgICAgICAgICAgbGV0IGR0ID0gdGhpcy5nZXREYXRlVGltZSgpO1xuICAgICAgICAgICAgZnN0ICs9IGBbJHtkdH1dYDtcbiAgICAgICAgfVxuICAgICAgICBmc3QgKz0gXCIgXCI7XG5cbiAgICAgICAgZnN0ICs9IHN0O1xuICAgICAgICBmcy5hcHBlbmRGaWxlKHRoaXMuZnVsbHBhdGgsIGZzdCArIFwiXFxuXCIsIGZ1bmN0aW9uKCl7fSk7XG4gICAgfVxuXG4gICAgZXJyb3IobWVzc2FnZSl7XG4gICAgICAgIGNvbnN0IHN0ID0gdGhpcy5tYWtlTWVzc2FnZShtZXNzYWdlKTtcbiAgICAgICAgdGhpcy5sb2coc3QsIFwiRVJST1JcIiwgZmFsc2UpO1xuICAgIH1cblxuICAgIGRlYnVnKG1lc3NhZ2Upe1xuICAgICAgICBpZighdGhpcy5vcHRpb25zLmRlYnVnKSByZXR1cm47XG4gICAgICAgIGNvbnN0IHN0ID0gdGhpcy5tYWtlTWVzc2FnZShtZXNzYWdlKTtcbiAgICAgICAgdGhpcy5sb2coc3QsIFwiREVCVUdcIiwgZmFsc2UpO1xuICAgIH1cblxuICAgIG1ha2VNZXNzYWdlKG1lc3NhZ2Upe1xuICAgICAgICBpZih0eXBlb2YobWVzc2FnZSkgPT09IFwic3RyaW5nXCIpe1xuICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2U7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHN0O1xuICAgICAgICB0cnl7XG4gICAgICAgICAgICBzdCA9IEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpO1xuICAgICAgICB9Y2F0Y2goZSl7XG4gICAgICAgICAgICBzdCA9IG1lc3NhZ2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0O1xuICAgIH1cbn1cblxuXG5leHBvcnQgZGVmYXVsdCBMb2c7Il19
//# sourceMappingURL=Log.js.map
