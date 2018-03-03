"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

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
        this.numParticles = 20;
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

            var maxX = this.db.getMaxX(this.fp_id);
            var maxY = this.db.getMaxY(this.fp_id);

            var newParticles = [];
            while (newParticles.length < this.numParticles) {
                var c_x = Math.floor(Math.random() * maxX);
                var c_y = Math.floor(Math.random() * maxY);
                var key = c_x + "_" + c_y;
                if (this.allParticles[key] === undefined) {
                    continue;
                }
                var p = {
                    x: c_x,
                    y: c_y,
                    weight: 0
                };
                newParticles.push(p);
            }
            this.particles = newParticles;
        }
    }, {
        key: "getParticleWeight",
        value: function getParticleWeight(coord, weight) {
            var w = Math.sqrt(weight);
            if (Math.round(w) === 0) {
                w = Infinity;
            }
            return w;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvUGFydGljbGVGaWx0ZXIuZXM2Il0sIm5hbWVzIjpbIlBhcnRpY2xlRmlsdGVyIiwiZGIiLCJmcF9pZCIsInBhcnRpY2xlcyIsInBhcnRpY2xlQ29vcmRzIiwidW5pcXVlUGFydGljbGVzIiwiYWxsUGFydGljbGVzIiwiZ2V0RmVhdHVyZXNDYWNoZSIsImd1ZXNzIiwib2xkUGFydGljbGVzIiwibnVtUGFydGljbGVzIiwibWF4WCIsImdldE1heFgiLCJtYXhZIiwiZ2V0TWF4WSIsIm5ld1BhcnRpY2xlcyIsImxlbmd0aCIsImNfeCIsIk1hdGgiLCJmbG9vciIsInJhbmRvbSIsImNfeSIsImtleSIsInVuZGVmaW5lZCIsInAiLCJ4IiwieSIsIndlaWdodCIsInB1c2giLCJjb29yZCIsInciLCJzcXJ0Iiwicm91bmQiLCJJbmZpbml0eSIsImZlYXR1cmVzIiwiaW5pdGlhbGl6ZVBhcnRpY2xlcyIsImZlYXR1cmVLZXlzIiwiT2JqZWN0Iiwia2V5cyIsImZlYXR1cmVLZXlzTGVuZ3RoIiwicGFydGljbGVMZW5ndGgiLCJpIiwicGFydGljbGUiLCJ4X3kiLCJqIiwiZmVhdHVyZSIsInRlc3RWYWx1ZSIsImdldEZlYXR1cmVWYWx1ZSIsImZlYXR1cmVWYWx1ZSIsImRpZmYiLCJhYnMiLCJwb3ciLCJnZXRQYXJ0aWNsZVdlaWdodCIsInJlc2FtcGxlIiwiZ29vZFgiLCJnb29kWSIsInVzZWRYeSIsInNvcnQiLCJhIiwiYiIsIm9sZCIsImd4IiwiZ3kiLCJpbmRleE9mIiwiZGlzdGFuY2UiLCJsIiwibWF4IiwiciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7Ozs7Ozs7SUFFTUEsYztBQUVGLDRCQUFZQyxFQUFaLEVBQW9CQyxLQUFwQixFQUFrQztBQUFBOztBQUM5QixhQUFLQSxLQUFMLEdBQWFBLEtBQWI7QUFDQSxhQUFLRCxFQUFMLEdBQVVBLEVBQVY7QUFDQSxhQUFLRSxTQUFMLEdBQWlCLEVBQWpCO0FBQ0EsYUFBS0MsY0FB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QjtBQUNIO0FBQ0QsaUJBQUtyQixTQUFMLEdBQWlCWSxZQUFqQjtBQUNIOzs7NENBRWtCO0FBQ2YsbUJBQU8sS0FBS1gsY0FBWjtBQUNIOzs7MENBRWdCO0FBQ2IsZ0JBQUlvQixJQUFJLEVBQVI7QUFDQSxnQkFBTWdCLGlCQUFpQixLQUFLckMsU0FBTCxDQUFlYSxNQUF0Qzs7QUFFQSxpQkFBSSxJQUFJeUIsSUFBSSxDQUFaLEVBQWVBLElBQUlELGNBQW5CLEVBQW1DQyxHQUFuQyxFQUF1QztBQUNuQyxvQkFBSW5CLE1BQU0sS0FBS25CLFNBQUwsQ0FBZXNDLENBQWYsRUFBa0JoQixDQUFsQixHQUFzQixHQUF0QixHQUE0QixLQUFLdEIsU0FBTCxDQUFlc0MsQ0FBZixFQUFrQmYsQ0FBeEQ7QUFDQUYsa0JBQUVGLEdBQUYsSUFBUyxDQUFUO0FBQ0g7QUFDRCxtQkFBT0UsQ0FBUDtBQUNIOzs7NkNBRW1CO0FBQ2hCLG1CQUFPLEtBQUtuQixlQUFaO0FBQ0g7Ozs7OztrQkFJVUwsYyIsImZpbGUiOiJQYXJ0aWNsZUZpbHRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBEYiBmcm9tICcuL0RiJztcblxuY2xhc3MgUGFydGljbGVGaWx0ZXIge1xuXG4gICAgY29uc3RydWN0b3IoZGI6IERiLCBmcF9pZDogc3RyaW5nKXtcbiAgICAgICAgdGhpcy5mcF9pZCA9IGZwX2lkO1xuICAgICAgICB0aGlzLmRiID0gZGI7XG4gICAgICAgIHRoaXMucGFydGljbGVzID0gW107XG4gICAgICAgIHRoaXMucGFydGljbGVDb29yZHMgPSBbXTtcbiAgICAgICAgdGhpcy51bmlxdWVQYXJ0aWNsZXMgPSBbXTtcbiAgICAgICAgdGhpcy5hbGxQYXJ0aWNsZXMgPSB0aGlzLmRiLmdldEZlYXR1cmVzQ2FjaGUodGhpcy5mcF9pZCk7XG4gICAgICAgIHRoaXMuZ3Vlc3MgPSBbMCwwXTtcbiAgICAgICAgdGhpcy5vbGRQYXJ0aWNsZXMgPSBbXTtcbiAgICAgICAgdGhpcy5udW1QYXJ0aWNsZXMgPSAyMDtcbiAgICB9XG5cbiAgICBzZXRQYXJ0aWNsZXMocGFydGljbGVzKXtcbiAgICAgICAgdGhpcy5wYXJ0aWNsZXMgPSBwYXJ0aWNsZXM7XG4gICAgICAgIHRoaXMuYWxsUGFydGljbGVzID0gdGhpcy5kYi5nZXRGZWF0dXJlc0NhY2hlKHRoaXMuZnBfaWQpO1xuICAgIH1cblxuICAgIGdldFBhcnRpY2xlcygpe1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJ0aWNsZXM7XG4gICAgfVxuXG4gICAgZ2V0T2xkUGFydGljbGVzKCl7XG4gICAgICAgIHJldHVybiB0aGlzLm9sZFBhcnRpY2xlcztcbiAgICB9XG5cbiAgICBpbml0aWFsaXplUGFydGljbGVzKCl7XG4gICAgICAgIHRoaXMuYWxsUGFydGljbGVzID0gdGhpcy5kYi5nZXRGZWF0dXJlc0NhY2hlKHRoaXMuZnBfaWQpO1xuXG4gICAgICAgIGNvbnN0IG1heFggPSB0aGlzLmRiLmdldE1heFgodGhpcy5mcF9pZCk7XG4gICAgICAgIGNvbnN0IG1heFkgPSB0aGlzLmRiLmdldE1heFkodGhpcy5mcF9pZCk7XG5cbiAgICAgICAgbGV0IG5ld1BhcnRpY2xlcyA9IFtdO1xuICAgICAgICB3aGlsZSAobmV3UGFydGljbGVzLmxlbmd0aCA8IHRoaXMubnVtUGFydGljbGVzKSB7XG4gICAgICAgICAgICBsZXQgY194ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbWF4WCk7XG4gICAgICAgICAgICBsZXQgY195ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbWF4WSk7XG4gICAgICAgICAgICBsZXQga2V5ID0gY194ICsgXCJfXCIgKyBjX3k7XG4gICAgICAgICAgICBpZih0aGlzLmFsbFBhcnRpY2xlc1trZXldID09PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IHAgPSB7XG4gICAgICAgICAgICAgICAgeDogY194LFxuICAgICAgICAgICAgICAgIHk6IGNfeSxcbiAgICAgICAgICAgICAgICB3ZWlnaHQ6IDBcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBuZXdQYXJ0aWNsZXMucHVzaChwKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnBhcnRpY2xlcyA9IG5ld1BhcnRpY2xlcztcbiAgICB9XG5cbiAgICBnZXRQYXJ0aWNsZVdlaWdodChjb29yZCwgd2VpZ2h0KXtcbiAgICAgICAgbGV0IHcgPSBNYXRoLnNxcnQod2VpZ2h0KTtcbiAgICAgICAgaWYgKE1hdGgucm91bmQodykgPT09IDApIHtcbiAgICAgICAgICAgdyA9IEluZmluaXR5O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB3O1xuICAgIH1cblxuICAgIG1vdmUoZmVhdHVyZXMpe1xuICAgICAgICBpZih0aGlzLnBhcnRpY2xlcy5sZW5ndGggPT09IDApIHRoaXMuaW5pdGlhbGl6ZVBhcnRpY2xlcygpO1xuICAgICAgICB0aGlzLm9sZFBhcnRpY2xlcyA9IFtdO1xuICAgICAgICBjb25zdCBmZWF0dXJlS2V5cyA9IE9iamVjdC5rZXlzKGZlYXR1cmVzKTtcbiAgICAgICAgY29uc3QgZmVhdHVyZUtleXNMZW5ndGggPSBmZWF0dXJlS2V5cy5sZW5ndGg7XG5cbiAgICAgICAgY29uc3QgcGFydGljbGVMZW5ndGggPSB0aGlzLnBhcnRpY2xlcy5sZW5ndGg7XG5cbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHBhcnRpY2xlTGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgbGV0IHBhcnRpY2xlID0gdGhpcy5wYXJ0aWNsZXNbaV07XG4gICAgICAgICAgICBsZXQgeF95ID0gcGFydGljbGUueCArIFwiX1wiICsgcGFydGljbGUueTtcblxuICAgICAgICAgICAgZm9yKGxldCBqID0gMDsgaiA8IGZlYXR1cmVLZXlzTGVuZ3RoOyBqKyspe1xuICAgICAgICAgICAgICAgIGxldCBmZWF0dXJlID0gZmVhdHVyZUtleXNbal07XG4gICAgICAgICAgICAgICAgbGV0IHRlc3RWYWx1ZSA9IHRoaXMuZGIuZ2V0RmVhdHVyZVZhbHVlKHRoaXMuZnBfaWQsIHhfeSwgZmVhdHVyZSk7XG4gICAgICAgICAgICAgICAgaWYodGVzdFZhbHVlKXtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGZlYXR1cmVWYWx1ZSA9IGZlYXR1cmVzW2ZlYXR1cmVdO1xuICAgICAgICAgICAgICAgICAgICBsZXQgZGlmZiA9IE1hdGguYWJzKHRlc3RWYWx1ZSAtIGZlYXR1cmVWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIHBhcnRpY2xlLndlaWdodCArPSBNYXRoLnBvdyhkaWZmLCAyKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBwYXJ0aWNsZS53ZWlnaHQgKz0gTWF0aC5wb3codGVzdFZhbHVlLCAyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXJ0aWNsZS53ZWlnaHQgPSB0aGlzLmdldFBhcnRpY2xlV2VpZ2h0KHhfeSwgcGFydGljbGUud2VpZ2h0KTtcbiAgICAgICAgICAgIHRoaXMub2xkUGFydGljbGVzLnB1c2goe3g6IHBhcnRpY2xlLngsIHk6IHBhcnRpY2xlLnksIHdlaWdodDogcGFydGljbGUud2VpZ2h0fSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZXNhbXBsZSgpO1xuICAgIH1cblxuICAgIHJlc2FtcGxlKCl7XG4gICAgICAgIGxldCBnb29kWCA9IFtdO1xuICAgICAgICBsZXQgZ29vZFkgPSBbXTtcbiAgICAgICAgbGV0IHVzZWRYeSA9IFtdO1xuXG4gICAgICAgIHRoaXMucGFydGljbGVzID0gdGhpcy5wYXJ0aWNsZXMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgICAgaWYoYS53ZWlnaHQgPj0gYi53ZWlnaHQpe1xuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy51bmlxdWVQYXJ0aWNsZXMgPSBbXTtcbiAgICAgICAgY29uc3QgcGFydGljbGVMZW5ndGggPSB0aGlzLnBhcnRpY2xlcy5sZW5ndGg7XG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBwYXJ0aWNsZUxlbmd0aCAvIDU7IGkrKyl7XG4gICAgICAgICAgICBjb25zdCBvbGQgPSB0aGlzLnBhcnRpY2xlc1tpXTtcbiAgICAgICAgICAgIGxldCBneCA9IG9sZC54O1xuICAgICAgICAgICAgbGV0IGd5ID0gb2xkLnk7XG4gICAgICAgICAgICBsZXQga2V5ID0gZ3ggKyBcIl9cIiArIGd5O1xuICAgICAgICAgICAgaWYodXNlZFh5LmluZGV4T2Yoa2V5KSA9PT0gLTEpe1xuICAgICAgICAgICAgICAgIHRoaXMudW5pcXVlUGFydGljbGVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB4OiBneCxcbiAgICAgICAgICAgICAgICAgICAgeTogZ3ksXG4gICAgICAgICAgICAgICAgICAgIGRpc3RhbmNlOiBvbGQud2VpZ2h0LFxuICAgICAgICAgICAgICAgICAgICB3ZWlnaHQ6IG9sZC53ZWlnaHRcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB1c2VkWHkucHVzaChrZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoZ29vZFguaW5kZXhPZihneCkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgZ29vZFgucHVzaChneCk7XG5cbiAgICAgICAgICAgICAgICBsZXQgbCA9IE1hdGgubWF4KDAsIGd4IC0gMik7XG4gICAgICAgICAgICAgICAgbGV0IHIgPSBneCArIDI7XG4gICAgICAgICAgICAgICAgZm9yKDsgbCA8PSByOyBsKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGdvb2RYLmluZGV4T2YobCkgPT09IC0xKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdvb2RYLnB1c2gobCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKGdvb2RZLmluZGV4T2YoZ3kpID09PSAtMSkge1xuICAgICAgICAgICAgICAgIGdvb2RZLnB1c2goZ3kpO1xuICAgICAgICAgICAgICAgIGxldCBsID0gTWF0aC5tYXgoMCwgZ3kgLSAyKTtcbiAgICAgICAgICAgICAgICBsZXQgciA9IGd5ICsgMjtcbiAgICAgICAgICAgICAgICBmb3IoOyBsIDw9IHI7IGwrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZ29vZFkuaW5kZXhPZihsKSA9PT0gLTEpe1xuICAgICAgICAgICAgICAgICAgICAgICAgZ29vZFkucHVzaChsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBuZXdQYXJ0aWNsZXMgPSBbXTtcbiAgICAgICAgdGhpcy5wYXJ0aWNsZUNvb3JkcyA9IFtdO1xuICAgICAgICB1c2VkWHkgPSBbXTtcbiAgICAgICAgd2hpbGUgKG5ld1BhcnRpY2xlcy5sZW5ndGggPCBwYXJ0aWNsZUxlbmd0aCkge1xuICAgICAgICAgICAgbGV0IGNfeCA9IGdvb2RYW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGdvb2RYLmxlbmd0aCldO1xuICAgICAgICAgICAgbGV0IGNfeSA9IGdvb2RZW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGdvb2RZLmxlbmd0aCldO1xuICAgICAgICAgICAgbGV0IGtleSA9IGNfeCArIFwiX1wiICsgY195O1xuICAgICAgICAgICAgaWYodGhpcy5hbGxQYXJ0aWNsZXNba2V5XSA9PT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBwID0ge1xuICAgICAgICAgICAgICAgIHg6IGNfeCxcbiAgICAgICAgICAgICAgICB5OiBjX3ksXG4gICAgICAgICAgICAgICAgd2VpZ2h0OiAwXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYodXNlZFh5LmluZGV4T2Yoa2V5KSA9PT0gLTEpe1xuICAgICAgICAgICAgICAgIHVzZWRYeS5wdXNoKGtleSk7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZUNvb3Jkcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgeDogcC54LFxuICAgICAgICAgICAgICAgICAgICB5OiBwLnlcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5ld1BhcnRpY2xlcy5wdXNoKHApO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucGFydGljbGVzID0gbmV3UGFydGljbGVzO1xuICAgIH1cblxuICAgIGdldFBhcnRpY2xlQ29vcmRzKCl7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcnRpY2xlQ29vcmRzO1xuICAgIH1cblxuICAgIGdldFBhcnRpY2xlS2V5cygpe1xuICAgICAgICBsZXQgcCA9IHt9O1xuICAgICAgICBjb25zdCBwYXJ0aWNsZUxlbmd0aCA9IHRoaXMucGFydGljbGVzLmxlbmd0aDtcblxuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgcGFydGljbGVMZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICBsZXQga2V5ID0gdGhpcy5wYXJ0aWNsZXNbaV0ueCArIFwiX1wiICsgdGhpcy5wYXJ0aWNsZXNbaV0ueTtcbiAgICAgICAgICAgIHBba2V5XSA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHA7XG4gICAgfVxuXG4gICAgZ2V0VW5pcXVlUGFydGljbGVzKCl7XG4gICAgICAgIHJldHVybiB0aGlzLnVuaXF1ZVBhcnRpY2xlcztcbiAgICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgUGFydGljbGVGaWx0ZXI7Il19
//# sourceMappingURL=ParticleFilter.js.map
