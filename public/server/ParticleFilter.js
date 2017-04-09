"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Db = require("./Db");

var _Db2 = _interopRequireDefault(_Db);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ParticleFilter = function () {
    function ParticleFilter(db, fp_id) {
        _classCallCheck(this, ParticleFilter);

        this.fp_id = fp_id;
        this.db = db;
        this.particles = [];
        this.particleCoords = [];
        this.uniqueParticles = [];
        this.allParticles = this.db.getFeaturesCache(this.fp_id);
        this.guess = [0, 0];
        this.oldParticles = [];
    }

    _createClass(ParticleFilter, [{
        key: "setParticles",
        value: function setParticles(particles) {
            this.particles = particles;
            this.allParticles = this.db.getFeaturesCache(this.fp_id);
        }
    }, {
        key: "getParticles",
        value: function getParticles() {
            return this.particles;
        }
    }, {
        key: "getOldParticles",
        value: function getOldParticles() {
            return this.oldParticles;
        }
    }, {
        key: "initializeParticles",
        value: function initializeParticles() {
            this.allParticles = this.db.getFeaturesCache(this.fp_id);
            var keys = Object.keys(this.allParticles);
            var keyLength = keys.length;
            var maxX = 0;
            var maxY = 0;
            for (var i = 0; i < keyLength; i++) {
                var _keys$i$split = keys[i].split("_"),
                    _keys$i$split2 = _slicedToArray(_keys$i$split, 2),
                    x = _keys$i$split2[0],
                    y = _keys$i$split2[1];

                var _ref = [Number(x), Number(y)];
                x = _ref[0];
                y = _ref[1];


                if (x > maxX) maxX = x;
                if (y > maxY) maxY = y;
                this.particles.push({
                    x: x,
                    y: y,
                    weight: 0
                });
            }
            this.maxX = maxX;
            this.maxY = maxY;
        }
    }, {
        key: "getParticleWeight",
        value: function getParticleWeight(coord, weight) {
            return Math.sqrt(weight);
            var featureNumber = this.db.getFeatureNumber(this.fp_id, coord);
            var w = Math.sqrt(weight);
            return w / featureNumber;
        }
    }, {
        key: "move",
        value: function move(features) {
            if (this.particles.length === 0) this.initializeParticles();
            this.oldParticles = [];
            var featureKeys = Object.keys(features);
            var featureKeysLength = featureKeys.length;

            var particleLength = this.particles.length;

            for (var i = 0; i < particleLength; i++) {
                var particle = this.particles[i];
                var x_y = particle.x + "_" + particle.y;

                for (var j = 0; j < featureKeysLength; j++) {
                    var feature = featureKeys[j];
                    var testValue = this.db.getFeatureValue(this.fp_id, x_y, feature);
                    if (testValue) {
                        var featureValue = features[feature];
                        var diff = Math.abs(testValue - featureValue);
                        particle.weight += Math.pow(diff, 2);
                    } else {
                        particle.weight += Math.pow(testValue, 2);
                    }
                }
                particle.weight = this.getParticleWeight(x_y, particle.weight);
                this.oldParticles.push({ x: particle.x, y: particle.y, weight: particle.weight });
            }
            this.resample();
        }
    }, {
        key: "resample",
        value: function resample() {
            var goodX = [];
            var goodY = [];
            var usedXy = [];

            this.particles = this.particles.sort(function (a, b) {
                if (a.weight >= b.weight) {
                    return 1;
                } else {
                    return -1;
                }
            });
            this.uniqueParticles = [];
            var particleLength = this.particles.length;
            for (var i = 0; i < particleLength / 5; i++) {
                var old = this.particles[i];
                var gx = old.x;
                var gy = old.y;
                var key = gx + "_" + gy;
                if (usedXy.indexOf(key) === -1) {
                    this.uniqueParticles.push({
                        x: gx,
                        y: gy,
                        distance: old.weight,
                        weight: old.weight
                    });
                    usedXy.push(key);
                }
                if (goodX.indexOf(gx) === -1) {
                    goodX.push(gx);

                    var l = Math.max(0, gx - 2);
                    var r = gx + 2;
                    for (; l <= r; l++) {
                        if (goodX.indexOf(l) === -1) {
                            goodX.push(l);
                        }
                    }
                }

                if (goodY.indexOf(gy) === -1) {
                    goodY.push(gy);
                    var _l = Math.max(0, gy - 2);
                    var _r = gy + 2;
                    for (; _l <= _r; _l++) {
                        if (goodY.indexOf(_l) === -1) {
                            goodY.push(_l);
                        }
                    }
                }
            }

            var newParticles = [];
            this.particleCoords = [];
            usedXy = [];
            while (newParticles.length < particleLength) {
                var c_x = goodX[Math.floor(Math.random() * goodX.length)];
                var c_y = goodY[Math.floor(Math.random() * goodY.length)];
                var _key = c_x + "_" + c_y;
                if (this.allParticles[_key] === undefined) {
                    continue;
                }
                var p = {
                    x: c_x,
                    y: c_y,
                    weight: 0
                };
                if (usedXy.indexOf(_key) === -1) {
                    usedXy.push(_key);
                    this.particleCoords.push({
                        x: p.x,
                        y: p.y
                    });
                }
                newParticles.push(p);
            }
            this.particles = newParticles;
        }
    }, {
        key: "getParticleCoords",
        value: function getParticleCoords() {
            return this.particleCoords;
        }
    }, {
        key: "getParticleKeys",
        value: function getParticleKeys() {
            var p = {};
            var particleLength = this.particles.length;

            for (var i = 0; i < particleLength; i++) {
                var key = this.particles[i].x + "_" + this.particles[i].y;
                p[key] = 1;
            }
            return p;
        }
    }, {
        key: "getUniqueParticles",
        value: function getUniqueParticles() {
            return this.uniqueParticles;
        }
    }]);

    return ParticleFilter;
}();

exports.default = ParticleFilter;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvUGFydGljbGVGaWx0ZXIuZXM2Il0sIm5hbWVzIjpbIlBhcnRpY2xlRmlsdGVyIiwiZGIiLCJmcF9pZCIsInBhcnRpY2xlcyIsInBhcnRpY2xlQ29vcmRzIiwidW5pcXVlUGFydGljbGVzIiwiYWxsUGFydGljbGVzIiwiZ2V0RmVhdHVyZXNDYWNoZSIsImd1ZXNzIiwib2xkUGFydGljbGVzIiwia2V5cyIsIk9iamVjdCIsImtleUxlbmd0aCIsImxlbmd0aCIsIm1heFgiLCJtYXhZIiwiaSIsInNwbGl0IiwieCIsInkiLCJOdW1iZXIiLCJwdXNoIiwid2VpZ2h0IiwiY29vcmQiLCJNYXRoIiwic3FydCIsImZlYXR1cmVOdW1iZXIiLCJnZXRGZWF0dXJlTnVtYmVyIiwidyIsImZlYXR1cmVzIiwiaW5pdGlhbGl6ZVBhcnRpY2xlcyIsImZlYXR1cmVLZXlzIiwiZmVhdHVyZUtleXNMZW5ndGgiLCJwYXJ0aWNsZUxlbmd0aCIsInBhcnRpY2xlIiwieF95IiwiaiIsImZlYXR1cmUiLCJ0ZXN0VmFsdWUiLCJnZXRGZWF0dXJlVmFsdWUiLCJmZWF0dXJlVmFsdWUiLCJkaWZmIiwiYWJzIiwicG93IiwiZ2V0UGFydGljbGVXZWlnaHQiLCJyZXNhbXBsZSIsImdvb2RYIiwiZ29vZFkiLCJ1c2VkWHkiLCJzb3J0IiwiYSIsImIiLCJvbGQiLCJneCIsImd5Iiwia2V5IiwiaW5kZXhPZiIsImRpc3RhbmNlIiwibCIsIm1heCIsInIiLCJuZXdQYXJ0aWNsZXMiLCJjX3giLCJmbG9vciIsInJhbmRvbSIsImNfeSIsInVuZGVmaW5lZCIsInAiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQTs7Ozs7Ozs7SUFFTUEsYztBQUVGLDRCQUFZQyxFQUFaLEVBQW9CQyxLQUFwQixFQUFrQztBQUFBOztBQUM5QixhQUFLQSxLQUFMLEdBQWFBLEtBQWI7QUFDQSxhQUFLRCxFQUFMLEdBQVVBLEVBQVY7QUFDQSxhQUFLRSxTQUFMLEdBQWlCLEVBQWpCO0FB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ckJILDJCQUFHaUQsRUFBRWpELENBRGdCO0FBRXJCQywyQkFBR2dELEVBQUVoRDtBQUZnQixxQkFBekI7QUFJSDtBQUNEMEMsNkJBQWF4QyxJQUFiLENBQWtCOEMsQ0FBbEI7QUFDSDtBQUNELGlCQUFLaEUsU0FBTCxHQUFpQjBELFlBQWpCO0FBQ0g7Ozs0Q0FFa0I7QUFDZixtQkFBTyxLQUFLekQsY0FBWjtBQUNIOzs7MENBRWdCO0FBQ2IsZ0JBQUkrRCxJQUFJLEVBQVI7QUFDQSxnQkFBTWxDLGlCQUFpQixLQUFLOUIsU0FBTCxDQUFlVSxNQUF0Qzs7QUFFQSxpQkFBSSxJQUFJRyxJQUFJLENBQVosRUFBZUEsSUFBSWlCLGNBQW5CLEVBQW1DakIsR0FBbkMsRUFBdUM7QUFDbkMsb0JBQUl1QyxNQUFNLEtBQUtwRCxTQUFMLENBQWVhLENBQWYsRUFBa0JFLENBQWxCLEdBQXNCLEdBQXRCLEdBQTRCLEtBQUtmLFNBQUwsQ0FBZWEsQ0FBZixFQUFrQkcsQ0FBeEQ7QUFDQWdELGtCQUFFWixHQUFGLElBQVMsQ0FBVDtBQUNIO0FBQ0QsbUJBQU9ZLENBQVA7QUFDSDs7OzZDQUVtQjtBQUNoQixtQkFBTyxLQUFLOUQsZUFBWjtBQUNIOzs7Ozs7a0JBSVVMLGMiLCJmaWxlIjoiUGFydGljbGVGaWx0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRGIgZnJvbSAnLi9EYic7XG5cbmNsYXNzIFBhcnRpY2xlRmlsdGVyIHtcblxuICAgIGNvbnN0cnVjdG9yKGRiOiBEYiwgZnBfaWQ6IHN0cmluZyl7XG4gICAgICAgIHRoaXMuZnBfaWQgPSBmcF9pZDtcbiAgICAgICAgdGhpcy5kYiA9IGRiO1xuICAgICAgICB0aGlzLnBhcnRpY2xlcyA9IFtdO1xuICAgICAgICB0aGlzLnBhcnRpY2xlQ29vcmRzID0gW107XG4gICAgICAgIHRoaXMudW5pcXVlUGFydGljbGVzID0gW107XG4gICAgICAgIHRoaXMuYWxsUGFydGljbGVzID0gdGhpcy5kYi5nZXRGZWF0dXJlc0NhY2hlKHRoaXMuZnBfaWQpO1xuICAgICAgICB0aGlzLmd1ZXNzID0gWzAsMF07XG4gICAgICAgIHRoaXMub2xkUGFydGljbGVzID0gW107XG4gICAgfVxuXG4gICAgc2V0UGFydGljbGVzKHBhcnRpY2xlcyl7XG4gICAgICAgIHRoaXMucGFydGljbGVzID0gcGFydGljbGVzO1xuICAgICAgICB0aGlzLmFsbFBhcnRpY2xlcyA9IHRoaXMuZGIuZ2V0RmVhdHVyZXNDYWNoZSh0aGlzLmZwX2lkKTtcbiAgICB9XG5cbiAgICBnZXRQYXJ0aWNsZXMoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFydGljbGVzO1xuICAgIH1cblxuICAgIGdldE9sZFBhcnRpY2xlcygpe1xuICAgICAgICByZXR1cm4gdGhpcy5vbGRQYXJ0aWNsZXM7XG4gICAgfVxuXG4gICAgaW5pdGlhbGl6ZVBhcnRpY2xlcygpe1xuICAgICAgICB0aGlzLmFsbFBhcnRpY2xlcyA9IHRoaXMuZGIuZ2V0RmVhdHVyZXNDYWNoZSh0aGlzLmZwX2lkKTtcbiAgICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKHRoaXMuYWxsUGFydGljbGVzKTtcbiAgICAgICAgY29uc3Qga2V5TGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gICAgICAgIGxldCBtYXhYID0gMDtcbiAgICAgICAgbGV0IG1heFkgPSAwO1xuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwga2V5TGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgbGV0IFt4LCB5XSA9IGtleXNbaV0uc3BsaXQoXCJfXCIpO1xuICAgICAgICAgICAgW3gsIHldID0gW051bWJlcih4KSwgTnVtYmVyKHkpXTtcblxuICAgICAgICAgICAgaWYoeCA+IG1heFgpIG1heFggPSB4O1xuICAgICAgICAgICAgaWYoeSA+IG1heFkpIG1heFkgPSB5O1xuICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgeDogeCxcbiAgICAgICAgICAgICAgICB5OiB5LFxuICAgICAgICAgICAgICAgIHdlaWdodDogMFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5tYXhYID0gbWF4WDtcbiAgICAgICAgdGhpcy5tYXhZID0gbWF4WTtcbiAgICB9XG5cbiAgICBnZXRQYXJ0aWNsZVdlaWdodChjb29yZCwgd2VpZ2h0KXtcbiAgICAgICAgcmV0dXJuIE1hdGguc3FydCh3ZWlnaHQpO1xuICAgICAgICBjb25zdCBmZWF0dXJlTnVtYmVyID0gdGhpcy5kYi5nZXRGZWF0dXJlTnVtYmVyKHRoaXMuZnBfaWQsIGNvb3JkKTtcbiAgICAgICAgbGV0IHcgPSBNYXRoLnNxcnQod2VpZ2h0KTtcbiAgICAgICAgcmV0dXJuIHcgLyBmZWF0dXJlTnVtYmVyO1xuICAgIH1cblxuICAgIG1vdmUoZmVhdHVyZXMpe1xuICAgICAgICBpZih0aGlzLnBhcnRpY2xlcy5sZW5ndGggPT09IDApIHRoaXMuaW5pdGlhbGl6ZVBhcnRpY2xlcygpO1xuICAgICAgICB0aGlzLm9sZFBhcnRpY2xlcyA9IFtdO1xuICAgICAgICBjb25zdCBmZWF0dXJlS2V5cyA9IE9iamVjdC5rZXlzKGZlYXR1cmVzKTtcbiAgICAgICAgY29uc3QgZmVhdHVyZUtleXNMZW5ndGggPSBmZWF0dXJlS2V5cy5sZW5ndGg7XG5cbiAgICAgICAgY29uc3QgcGFydGljbGVMZW5ndGggPSB0aGlzLnBhcnRpY2xlcy5sZW5ndGg7XG5cbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHBhcnRpY2xlTGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgbGV0IHBhcnRpY2xlID0gdGhpcy5wYXJ0aWNsZXNbaV07XG4gICAgICAgICAgICBsZXQgeF95ID0gcGFydGljbGUueCArIFwiX1wiICsgcGFydGljbGUueTtcblxuICAgICAgICAgICAgZm9yKGxldCBqID0gMDsgaiA8IGZlYXR1cmVLZXlzTGVuZ3RoOyBqKyspe1xuICAgICAgICAgICAgICAgIGxldCBmZWF0dXJlID0gZmVhdHVyZUtleXNbal07XG4gICAgICAgICAgICAgICAgbGV0IHRlc3RWYWx1ZSA9IHRoaXMuZGIuZ2V0RmVhdHVyZVZhbHVlKHRoaXMuZnBfaWQsIHhfeSwgZmVhdHVyZSk7XG4gICAgICAgICAgICAgICAgaWYodGVzdFZhbHVlKXtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGZlYXR1cmVWYWx1ZSA9IGZlYXR1cmVzW2ZlYXR1cmVdO1xuICAgICAgICAgICAgICAgICAgICBsZXQgZGlmZiA9IE1hdGguYWJzKHRlc3RWYWx1ZSAtIGZlYXR1cmVWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIHBhcnRpY2xlLndlaWdodCArPSBNYXRoLnBvdyhkaWZmLCAyKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBwYXJ0aWNsZS53ZWlnaHQgKz0gTWF0aC5wb3codGVzdFZhbHVlLCAyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXJ0aWNsZS53ZWlnaHQgPSB0aGlzLmdldFBhcnRpY2xlV2VpZ2h0KHhfeSwgcGFydGljbGUud2VpZ2h0KTtcbiAgICAgICAgICAgIHRoaXMub2xkUGFydGljbGVzLnB1c2goe3g6IHBhcnRpY2xlLngsIHk6IHBhcnRpY2xlLnksIHdlaWdodDogcGFydGljbGUud2VpZ2h0fSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZXNhbXBsZSgpO1xuICAgIH1cblxuICAgIHJlc2FtcGxlKCl7XG4gICAgICAgIGxldCBnb29kWCA9IFtdO1xuICAgICAgICBsZXQgZ29vZFkgPSBbXTtcbiAgICAgICAgbGV0IHVzZWRYeSA9IFtdO1xuXG4gICAgICAgIHRoaXMucGFydGljbGVzID0gdGhpcy5wYXJ0aWNsZXMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgICAgaWYoYS53ZWlnaHQgPj0gYi53ZWlnaHQpe1xuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy51bmlxdWVQYXJ0aWNsZXMgPSBbXTtcbiAgICAgICAgY29uc3QgcGFydGljbGVMZW5ndGggPSB0aGlzLnBhcnRpY2xlcy5sZW5ndGg7XG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBwYXJ0aWNsZUxlbmd0aCAvIDU7IGkrKyl7XG4gICAgICAgICAgICBjb25zdCBvbGQgPSB0aGlzLnBhcnRpY2xlc1tpXTtcbiAgICAgICAgICAgIGxldCBneCA9IG9sZC54O1xuICAgICAgICAgICAgbGV0IGd5ID0gb2xkLnk7XG4gICAgICAgICAgICBsZXQga2V5ID0gZ3ggKyBcIl9cIiArIGd5O1xuICAgICAgICAgICAgaWYodXNlZFh5LmluZGV4T2Yoa2V5KSA9PT0gLTEpe1xuICAgICAgICAgICAgICAgIHRoaXMudW5pcXVlUGFydGljbGVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB4OiBneCxcbiAgICAgICAgICAgICAgICAgICAgeTogZ3ksXG4gICAgICAgICAgICAgICAgICAgIGRpc3RhbmNlOiBvbGQud2VpZ2h0LFxuICAgICAgICAgICAgICAgICAgICB3ZWlnaHQ6IG9sZC53ZWlnaHRcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB1c2VkWHkucHVzaChrZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoZ29vZFguaW5kZXhPZihneCkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgZ29vZFgucHVzaChneCk7XG5cbiAgICAgICAgICAgICAgICBsZXQgbCA9IE1hdGgubWF4KDAsIGd4IC0gMik7XG4gICAgICAgICAgICAgICAgbGV0IHIgPSBneCArIDI7XG4gICAgICAgICAgICAgICAgZm9yKDsgbCA8PSByOyBsKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGdvb2RYLmluZGV4T2YobCkgPT09IC0xKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdvb2RYLnB1c2gobCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKGdvb2RZLmluZGV4T2YoZ3kpID09PSAtMSkge1xuICAgICAgICAgICAgICAgIGdvb2RZLnB1c2goZ3kpO1xuICAgICAgICAgICAgICAgIGxldCBsID0gTWF0aC5tYXgoMCwgZ3kgLSAyKTtcbiAgICAgICAgICAgICAgICBsZXQgciA9IGd5ICsgMjtcbiAgICAgICAgICAgICAgICBmb3IoOyBsIDw9IHI7IGwrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZ29vZFkuaW5kZXhPZihsKSA9PT0gLTEpe1xuICAgICAgICAgICAgICAgICAgICAgICAgZ29vZFkucHVzaChsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBuZXdQYXJ0aWNsZXMgPSBbXTtcbiAgICAgICAgdGhpcy5wYXJ0aWNsZUNvb3JkcyA9IFtdO1xuICAgICAgICB1c2VkWHkgPSBbXTtcbiAgICAgICAgd2hpbGUgKG5ld1BhcnRpY2xlcy5sZW5ndGggPCBwYXJ0aWNsZUxlbmd0aCkge1xuICAgICAgICAgICAgbGV0IGNfeCA9IGdvb2RYW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGdvb2RYLmxlbmd0aCldO1xuICAgICAgICAgICAgbGV0IGNfeSA9IGdvb2RZW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGdvb2RZLmxlbmd0aCldO1xuICAgICAgICAgICAgbGV0IGtleSA9IGNfeCArIFwiX1wiICsgY195O1xuICAgICAgICAgICAgaWYodGhpcy5hbGxQYXJ0aWNsZXNba2V5XSA9PT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBwID0ge1xuICAgICAgICAgICAgICAgIHg6IGNfeCxcbiAgICAgICAgICAgICAgICB5OiBjX3ksXG4gICAgICAgICAgICAgICAgd2VpZ2h0OiAwXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYodXNlZFh5LmluZGV4T2Yoa2V5KSA9PT0gLTEpe1xuICAgICAgICAgICAgICAgIHVzZWRYeS5wdXNoKGtleSk7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZUNvb3Jkcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgeDogcC54LFxuICAgICAgICAgICAgICAgICAgICB5OiBwLnlcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5ld1BhcnRpY2xlcy5wdXNoKHApO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucGFydGljbGVzID0gbmV3UGFydGljbGVzO1xuICAgIH1cblxuICAgIGdldFBhcnRpY2xlQ29vcmRzKCl7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcnRpY2xlQ29vcmRzO1xuICAgIH1cblxuICAgIGdldFBhcnRpY2xlS2V5cygpe1xuICAgICAgICBsZXQgcCA9IHt9O1xuICAgICAgICBjb25zdCBwYXJ0aWNsZUxlbmd0aCA9IHRoaXMucGFydGljbGVzLmxlbmd0aDtcblxuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgcGFydGljbGVMZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICBsZXQga2V5ID0gdGhpcy5wYXJ0aWNsZXNbaV0ueCArIFwiX1wiICsgdGhpcy5wYXJ0aWNsZXNbaV0ueTtcbiAgICAgICAgICAgIHBba2V5XSA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHA7XG4gICAgfVxuXG4gICAgZ2V0VW5pcXVlUGFydGljbGVzKCl7XG4gICAgICAgIHJldHVybiB0aGlzLnVuaXF1ZVBhcnRpY2xlcztcbiAgICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgUGFydGljbGVGaWx0ZXI7Il19
//# sourceMappingURL=ParticleFilter.js.map
