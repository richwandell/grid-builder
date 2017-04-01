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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvTG9nLmVzNiJdLCJuYW1lcyI6WyJmcyIsInJlcXVpcmUiLCJMb2ciLCJvcHRpb25zIiwiZmlsZW5hbWUiLCJmaWxlc2l6ZSIsImxvZ2ZvbGRlciIsIm51bWZpbGVzIiwiZGVidWciLCJhdHRybmFtZSIsImhhc093blByb3BlcnR5IiwiZnVsbHBhdGgiLCJleGlzdGluZ0ZpbGVzIiwiZGlyIiwiZmlsZXMiLCJyZWFkZGlyU3luYyIsImZvckVhY2giLCJmaWxlIiwiaW5kZXhPZiIsInB1c2giLCJhcHBlbmRGaWxlIiwid2F0Y2hlciIsIndhdGNoIiwiZXZlbnRUeXBlIiwicm90YXRlIiwiY2xvc2UiLCJudW1GaWxlcyIsImxlbmd0aCIsInN0YXQiLCJlcnIiLCJzdGF0cyIsInNpemUiLCJjb25zb2xlIiwibG9nIiwieCIsImV4aXN0aW5nRmlsZSIsIm5ld05hbWUiLCJyZW5hbWUiLCJ3cml0ZUZpbGVTeW5jIiwicmVhZEZpbGVTeW5jIiwicmFuZCIsIk1hdGgiLCJyYW5kb20iLCJ1bmxpbmsiLCJwb3AiLCJtZXNzYWdlIiwic3QiLCJKU09OIiwic3RyaW5naWZ5IiwiZSIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLElBQU1BLEtBQUtDLFFBQVEsSUFBUixDQUFYOztJQUVNQyxHO0FBRUYsaUJBQVlDLE9BQVosRUFBb0I7QUFBQTs7QUFBQTs7QUFDaEIsYUFBS0EsT0FBTCxHQUFlO0FBQ1hDLHNCQUFVLFNBREM7QUFFWEMsc0JBQVUsT0FGQztBQUdYQyx1QkFBVyxLQUhBO0FBSVhDLHNCQUFVLENBSkM7QUFLWEMsbUJBQU87QUFMSSxTQUFmO0FBT0EsYUFBSyxJQUFJQyxRQUFULElBQXFCTixPQUFyQixFQUE4QjtBQUMxQixnQkFBRyxLQUFLQSxPQUFMLENBQWFPLGNBQWIsQ0FBNEJELFFBQTVCLENBQUgsRUFBeUM7QUFDckMscUJBQUtOLE9BQUwsQ0FBYU0sUUFBYixJQUF5Qk4sUUFBUU0sUUFB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bkI7QUFDSCw2QkFGRDtBQUdIO0FBQ0o7QUFDSixpQkFwQkQ7QUFxQkg7QUFDSjs7OzRCQUVHQyxPLEVBQVE7QUFDUixnQkFBSUMsV0FBSjtBQUNBLGdCQUFHO0FBQ0NBLHFCQUFLQyxLQUFLQyxTQUFMLENBQWVILE9BQWYsQ0FBTDtBQUNILGFBRkQsQ0FFQyxPQUFNSSxDQUFOLEVBQVE7QUFDTEgscUJBQUtELE9BQUw7QUFDSDtBQUNEN0MsZUFBR29CLFVBQUgsQ0FBYyxLQUFLVCxRQUFuQixFQUE2QixZQUFZbUMsRUFBWixHQUFpQixJQUE5QyxFQUFvRCxZQUFVLENBQUUsQ0FBaEU7QUFDSDs7OzhCQUVLRCxPLEVBQVE7QUFDVixnQkFBSUMsV0FBSjtBQUNBLGdCQUFHO0FBQ0NBLHFCQUFLQyxLQUFLQyxTQUFMLENBQWVILE9BQWYsQ0FBTDtBQUNILGFBRkQsQ0FFQyxPQUFNSSxDQUFOLEVBQVE7QUFDTEgscUJBQUtELE9BQUw7QUFDSDtBQUNEN0MsZUFBR29CLFVBQUgsQ0FBYyxLQUFLVCxRQUFuQixFQUE2QixhQUFhbUMsRUFBYixHQUFrQixJQUEvQyxFQUFxRCxZQUFVLENBQUUsQ0FBakU7QUFDSDs7OzhCQUVLRCxPLEVBQVE7QUFDVixnQkFBRyxDQUFDLEtBQUsxQyxPQUFMLENBQWFLLEtBQWpCLEVBQXdCO0FBQ3hCLGdCQUFJc0MsV0FBSjtBQUNBLGdCQUFHO0FBQ0NBLHFCQUFLQyxLQUFLQyxTQUFMLENBQWVILE9BQWYsQ0FBTDtBQUNILGFBRkQsQ0FFQyxPQUFNSSxDQUFOLEVBQVE7QUFDTEgscUJBQUtELE9BQUw7QUFDSDtBQUNEN0MsZUFBR29CLFVBQUgsQ0FBYyxLQUFLVCxRQUFuQixFQUE2QixhQUFhbUMsRUFBYixHQUFrQixJQUEvQyxFQUFxRCxZQUFVLENBQUUsQ0FBakU7QUFDSDs7Ozs7O0FBSUxJLE9BQU9DLE9BQVAsR0FBaUJqRCxHQUFqQiIsImZpbGUiOiJMb2cuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5cbmNsYXNzIExvZyB7XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKXtcbiAgICAgICAgdGhpcy5vcHRpb25zID0ge1xuICAgICAgICAgICAgZmlsZW5hbWU6IFwibG9nLmxvZ1wiLFxuICAgICAgICAgICAgZmlsZXNpemU6IDEwMDAwMDAsXG4gICAgICAgICAgICBsb2dmb2xkZXI6IFwibG9nXCIsXG4gICAgICAgICAgICBudW1maWxlczogMyxcbiAgICAgICAgICAgIGRlYnVnOiB0cnVlXG4gICAgICAgIH07XG4gICAgICAgIGZvciAobGV0IGF0dHJuYW1lIGluIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGlmKHRoaXMub3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShhdHRybmFtZSkpe1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9uc1thdHRybmFtZV0gPSBvcHRpb25zW2F0dHJuYW1lXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmZ1bGxwYXRoID0gdGhpcy5vcHRpb25zLmxvZ2ZvbGRlciArIFwiL1wiICsgdGhpcy5vcHRpb25zLmZpbGVuYW1lO1xuICAgICAgICB0aGlzLmV4aXN0aW5nRmlsZXMgPSBbXTtcbiAgICAgICAgY29uc3QgZGlyID0gdGhpcy5vcHRpb25zLmxvZ2ZvbGRlcjtcbiAgICAgICAgY29uc3QgZmlsZXMgPSBmcy5yZWFkZGlyU3luYyhkaXIpO1xuICAgICAgICBjb25zdCBmaWxlbmFtZSA9IHRoaXMub3B0aW9ucy5maWxlbmFtZTtcblxuICAgICAgICBmaWxlcy5mb3JFYWNoKChmaWxlKSA9PiB7XG4gICAgICAgICAgICBpZihmaWxlLmluZGV4T2YoZmlsZW5hbWUpID4gLTEpe1xuICAgICAgICAgICAgICAgIHRoaXMuZXhpc3RpbmdGaWxlcy5wdXNoKGZpbGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBmcy5hcHBlbmRGaWxlKHRoaXMuZnVsbHBhdGgsIFwiW0lORk9dIGxvZyBmaWxlIG9wZW5lZCBcXG5cIiwgKCkgPT57XG4gICAgICAgICAgICB0aGlzLndhdGNoZXIgPSBmcy53YXRjaCh0aGlzLmZ1bGxwYXRoLCAoZXZlbnRUeXBlLCBmaWxlbmFtZSkgPT57XG4gICAgICAgICAgICAgICAgdGhpcy5yb3RhdGUoZXZlbnRUeXBlLCBmaWxlbmFtZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY2xvc2UoKXtcbiAgICAgICAgdGhpcy53YXRjaGVyLmNsb3NlKCk7XG4gICAgfVxuXG4gICAgcm90YXRlKGV2ZW50VHlwZSwgZmlsZW5hbWUpIHtcbiAgICAgICAgaWYoZXZlbnRUeXBlID09IFwiY2hhbmdlXCIpe1xuICAgICAgICAgICAgY29uc3QgZmlsZXNpemUgPSB0aGlzLm9wdGlvbnMuZmlsZXNpemU7XG4gICAgICAgICAgICBjb25zdCBudW1GaWxlcyA9IHRoaXMuZXhpc3RpbmdGaWxlcy5sZW5ndGggLSAxO1xuICAgICAgICAgICAgZnMuc3RhdCh0aGlzLmZ1bGxwYXRoLCAoZXJyLCBzdGF0cykgPT4ge1xuICAgICAgICAgICAgICAgIGlmKHN0YXRzLnNpemUgPj0gZmlsZXNpemUpe1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInNob3VsZCByb3RhdGVcIik7XG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQgeCA9IDA7IHggPCB0aGlzLmV4aXN0aW5nRmlsZXMubGVuZ3RoOyB4Kyspe1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGV4aXN0aW5nRmlsZSA9IHRoaXMuZXhpc3RpbmdGaWxlc1t4XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGV4aXN0aW5nRmlsZSAhPSB0aGlzLm9wdGlvbnMuZmlsZW5hbWUpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBuZXdOYW1lID0gdGhpcy5mdWxscGF0aCArIFwiLlwiICsgKHggKyAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcy5yZW5hbWUodGhpcy5vcHRpb25zLmxvZ2ZvbGRlciArIFwiL1wiICsgZXhpc3RpbmdGaWxlLCBuZXdOYW1lLCBmdW5jdGlvbigpe30pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmModGhpcy5mdWxscGF0aCArIFwiLjBcIiwgZnMucmVhZEZpbGVTeW5jKHRoaXMuZnVsbHBhdGgpKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5leGlzdGluZ0ZpbGVzLnB1c2godGhpcy5mdWxscGF0aCArIFwiLlwiICsgbnVtRmlsZXMpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgcmFuZCA9IE1hdGgucmFuZG9tKCk7XG4gICAgICAgICAgICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmModGhpcy5mdWxscGF0aCwgXCJmaWxlIHJvdGF0ZWQ6IFtcIiArIHJhbmQgKyBcIl1cIik7XG4gICAgICAgICAgICAgICAgICAgIGlmKG51bUZpbGVzID49IHRoaXMub3B0aW9ucy5udW1maWxlcyl7XG4gICAgICAgICAgICAgICAgICAgICAgICBmcy51bmxpbmsodGhpcy5mdWxscGF0aCArIFwiLlwiICsgKHRoaXMuZXhpc3RpbmdGaWxlcy5sZW5ndGggLSAxKSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZXhpc3RpbmdGaWxlcy5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBsb2cobWVzc2FnZSl7XG4gICAgICAgIGxldCBzdDtcbiAgICAgICAgdHJ5e1xuICAgICAgICAgICAgc3QgPSBKU09OLnN0cmluZ2lmeShtZXNzYWdlKTtcbiAgICAgICAgfWNhdGNoKGUpe1xuICAgICAgICAgICAgc3QgPSBtZXNzYWdlO1xuICAgICAgICB9XG4gICAgICAgIGZzLmFwcGVuZEZpbGUodGhpcy5mdWxscGF0aCwgXCJbSU5GT10gXCIgKyBzdCArIFwiXFxuXCIsIGZ1bmN0aW9uKCl7fSk7XG4gICAgfVxuXG4gICAgZXJyb3IobWVzc2FnZSl7XG4gICAgICAgIGxldCBzdDtcbiAgICAgICAgdHJ5e1xuICAgICAgICAgICAgc3QgPSBKU09OLnN0cmluZ2lmeShtZXNzYWdlKTtcbiAgICAgICAgfWNhdGNoKGUpe1xuICAgICAgICAgICAgc3QgPSBtZXNzYWdlO1xuICAgICAgICB9XG4gICAgICAgIGZzLmFwcGVuZEZpbGUodGhpcy5mdWxscGF0aCwgXCJbRVJST1JdIFwiICsgc3QgKyBcIlxcblwiLCBmdW5jdGlvbigpe30pO1xuICAgIH1cblxuICAgIGRlYnVnKG1lc3NhZ2Upe1xuICAgICAgICBpZighdGhpcy5vcHRpb25zLmRlYnVnKSByZXR1cm47XG4gICAgICAgIGxldCBzdDtcbiAgICAgICAgdHJ5e1xuICAgICAgICAgICAgc3QgPSBKU09OLnN0cmluZ2lmeShtZXNzYWdlKTtcbiAgICAgICAgfWNhdGNoKGUpe1xuICAgICAgICAgICAgc3QgPSBtZXNzYWdlO1xuICAgICAgICB9XG4gICAgICAgIGZzLmFwcGVuZEZpbGUodGhpcy5mdWxscGF0aCwgXCJbREVCVUddIFwiICsgc3QgKyBcIlxcblwiLCBmdW5jdGlvbigpe30pO1xuICAgIH1cbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IExvZzsiXX0=
//# sourceMappingURL=Log.js.map
