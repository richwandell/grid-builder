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
    }

    _createClass(ParticleFilter, [{
        key: "setParticles",
        value: function setParticles(particles) {
            this.particles = particles;
        }
    }, {
        key: "getParticles",
        value: function getParticles() {
            var rParticles = [];
            var particleLength = this.particles.length;

            for (var i = 0; i < particleLength; i++) {
                rParticles.push({
                    x: this.particles[i].x,
                    y: this.particles[i].y,
                    weight: 0
                });
            }
            return rParticles;
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
                    ap_ids: Object.assign({}, this.allParticles[keys[i]]),
                    weight: 0
                });
            }
            this.maxX = maxX;
            this.maxY = maxY;
        }
    }, {
        key: "move",
        value: function move(features) {
            if (this.particles.length === 0) this.initializeParticles();

            var featureKeys = Object.keys(features);
            var featureKeysLength = featureKeys.length;

            var particleLength = this.particles.length;

            for (var i = 0; i < particleLength; i++) {
                var particle = this.particles[i];

                for (var j = 0; j < featureKeysLength; j++) {
                    var feature = featureKeys[j];
                    var x_y = particle.x + "_" + particle.y;
                    var testValue = this.db.getFeatureValue(this.fp_id, x_y, feature);
                    if (testValue) {
                        var featureValue = features[feature];
                        var diff = Math.abs(testValue - featureValue);
                        particle.weight += Math.pow(diff, 2);
                    } else {
                        particle.weight += Math.pow(testValue, 2);
                    }
                }
                particle.weight = Math.sqrt(particle.weight);
            }
            this.resample();
        }
    }, {
        key: "resample",
        value: function resample() {
            var goodX = [];
            var goodY = [];
            this.particles = this.particles.sort(function (a, b) {
                if (a.weight >= b.weight) {
                    return 1;
                } else {
                    return -1;
                }
            });
            var particleLength = this.particles.length;
            for (var i = 0; i < particleLength / 5; i++) {
                var gx = this.particles[i].x;
                var gy = this.particles[i].y;
                if (goodX.indexOf(gx) === -1) {
                    goodX.push(gx);

                    var l = Math.max(0, gx - 1);
                    var r = gx + 1;
                    for (; l <= r; l++) {
                        if (goodX.indexOf(l) === -1) {
                            goodX.push(l);
                        }
                    }
                }

                if (goodY.indexOf(gy) === -1) {
                    goodY.push(gy);
                    var _l = Math.max(0, gy - 1);
                    var _r = gy + 1;
                    for (; _l <= _r; _l++) {
                        if (goodY.indexOf(_l) === -1) {
                            goodY.push(_l);
                        }
                    }
                }
            }

            var newParticles = [];
            this.particleCoords = [];
            this.uniqueParticles = [];
            var usedXy = [];
            while (newParticles.length < particleLength) {
                var c_x = goodX[Math.floor(Math.random() * goodX.length)];
                var c_y = goodY[Math.floor(Math.random() * goodY.length)];
                var key = c_x + "_" + c_y;
                if (this.allParticles[key] === undefined) {
                    continue;
                }
                var p = {
                    x: c_x,
                    y: c_y,
                    ap_ids: Object.assign({}, this.allParticles[key]),
                    weight: 0
                };
                if (usedXy.indexOf(key) === -1) {
                    usedXy.push(key);
                    this.particleCoords.push({
                        x: p.x,
                        y: p.y
                    });
                    this.uniqueParticles.push(p);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvUGFydGljbGVGaWx0ZXIuZXM2Il0sIm5hbWVzIjpbIlBhcnRpY2xlRmlsdGVyIiwiZGIiLCJmcF9pZCIsInBhcnRpY2xlcyIsInBhcnRpY2xlQ29vcmRzIiwidW5pcXVlUGFydGljbGVzIiwiYWxsUGFydGljbGVzIiwiZ2V0RmVhdHVyZXNDYWNoZSIsInJQYXJ0aWNsZXMiLCJwYXJ0aWNsZUxlbmd0aCIsImxlbmd0aCIsImkiLCJwdXNoIiwieCIsInkiLCJ3ZWlnaHQiLCJrZXlzIiwiT2JqZWN0Iiwia2V5TGVuZ3RoIiwibWF4WCIsIm1heFkiLCJzcGxpdCIsIk51bWJlciIsImFwX2lkcyIsImFzc2lnbiIsImZlYXR1cmVzIiwiaW5pdGlhbGl6ZVBhcnRpY2xlcyIsImZlYXR1cmVLZXlzIiwiZmVhdHVyZUtleXNMZW5ndGgiLCJwYXJ0aWNsZSIsImoiLCJmZWF0dXJlIiwieF95IiwidGVzdFZhbHVlIiwiZ2V0RmVhdHVyZVZhbHVlIiwiZmVhdHVyZVZhbHVlIiwiZGlmZiIsIk1hdGgiLCJhYnMiLCJwb3ciLCJzcXJ0IiwicmVzYW1wbGUiLCJnb29kWCIsImdvb2RZIiwic29ydCIsImEiLCJiIiwiZ3giLCJneSIsImluZGV4T2YiLCJsIiwibWF4IiwiciIsIm5ld1BhcnRpY2xlcyIsInVzZWRYeSIsImNfeCIsImZsb29yIiwicmFuZG9tIiwiY195Iiwia2V5IiwidW5kZWZpbmVkIiwicCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBOzs7Ozs7OztJQUVNQSxjO0FBRUYsNEJBQVlDLEVBQVosRUFBb0JDLEtBQXBCLEVBQWtDO0FBQUE7O0FBQzlCLGFBQUtBLEtBQUwsR0FBYUEsS0FBYjtBQUNBLGFBQUtELEVBQUwsR0FBVUEsRUFBVjtBQUNBLGFBQUtFLFNBQUwsR0FBaUIsRUFBakI7QUFDQSxhQUFLQyxjQUFMLEdBQXNCLEVBQXRCO0FBQ0EsYUFBS0MsZUFBTCxHQUF1QixFQUF2QjtBQUNBLGFBQUtDLFlBQUwsR0FBb0Is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Q0g7Ozs2Q0FFbUI7QUFDaEIsbUJBQU8sS0FBS3hELGVBQVo7QUFDSDs7Ozs7O2tCQUlVTCxjIiwiZmlsZSI6IlBhcnRpY2xlRmlsdGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IERiIGZyb20gJy4vRGInO1xuXG5jbGFzcyBQYXJ0aWNsZUZpbHRlciB7XG5cbiAgICBjb25zdHJ1Y3RvcihkYjogRGIsIGZwX2lkOiBzdHJpbmcpe1xuICAgICAgICB0aGlzLmZwX2lkID0gZnBfaWQ7XG4gICAgICAgIHRoaXMuZGIgPSBkYjtcbiAgICAgICAgdGhpcy5wYXJ0aWNsZXMgPSBbXTtcbiAgICAgICAgdGhpcy5wYXJ0aWNsZUNvb3JkcyA9IFtdO1xuICAgICAgICB0aGlzLnVuaXF1ZVBhcnRpY2xlcyA9IFtdO1xuICAgICAgICB0aGlzLmFsbFBhcnRpY2xlcyA9IHRoaXMuZGIuZ2V0RmVhdHVyZXNDYWNoZSh0aGlzLmZwX2lkKTtcbiAgICB9XG5cbiAgICBzZXRQYXJ0aWNsZXMocGFydGljbGVzKXtcbiAgICAgICAgdGhpcy5wYXJ0aWNsZXMgPSBwYXJ0aWNsZXM7XG4gICAgfVxuXG4gICAgZ2V0UGFydGljbGVzKCl7XG4gICAgICAgIGxldCByUGFydGljbGVzID0gW107XG4gICAgICAgIGNvbnN0IHBhcnRpY2xlTGVuZ3RoID0gdGhpcy5wYXJ0aWNsZXMubGVuZ3RoO1xuXG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBwYXJ0aWNsZUxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIHJQYXJ0aWNsZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgeDogdGhpcy5wYXJ0aWNsZXNbaV0ueCxcbiAgICAgICAgICAgICAgICB5OiB0aGlzLnBhcnRpY2xlc1tpXS55LFxuICAgICAgICAgICAgICAgIHdlaWdodDogMFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJQYXJ0aWNsZXM7XG4gICAgfVxuXG4gICAgaW5pdGlhbGl6ZVBhcnRpY2xlcygpe1xuICAgICAgICB0aGlzLmFsbFBhcnRpY2xlcyA9IHRoaXMuZGIuZ2V0RmVhdHVyZXNDYWNoZSh0aGlzLmZwX2lkKTtcbiAgICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKHRoaXMuYWxsUGFydGljbGVzKTtcbiAgICAgICAgY29uc3Qga2V5TGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gICAgICAgIGxldCBtYXhYID0gMDtcbiAgICAgICAgbGV0IG1heFkgPSAwO1xuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwga2V5TGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgbGV0IFt4LCB5XSA9IGtleXNbaV0uc3BsaXQoXCJfXCIpO1xuICAgICAgICAgICAgW3gsIHldID0gW051bWJlcih4KSwgTnVtYmVyKHkpXTtcblxuICAgICAgICAgICAgaWYoeCA+IG1heFgpIG1heFggPSB4O1xuICAgICAgICAgICAgaWYoeSA+IG1heFkpIG1heFkgPSB5O1xuICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgeDogeCxcbiAgICAgICAgICAgICAgICB5OiB5LFxuICAgICAgICAgICAgICAgIGFwX2lkczogT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5hbGxQYXJ0aWNsZXNba2V5c1tpXV0pLFxuICAgICAgICAgICAgICAgIHdlaWdodDogMFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5tYXhYID0gbWF4WDtcbiAgICAgICAgdGhpcy5tYXhZID0gbWF4WTtcbiAgICB9XG5cbiAgICBtb3ZlKGZlYXR1cmVzKXtcbiAgICAgICAgaWYodGhpcy5wYXJ0aWNsZXMubGVuZ3RoID09PSAwKSB0aGlzLmluaXRpYWxpemVQYXJ0aWNsZXMoKTtcblxuICAgICAgICBjb25zdCBmZWF0dXJlS2V5cyA9IE9iamVjdC5rZXlzKGZlYXR1cmVzKTtcbiAgICAgICAgY29uc3QgZmVhdHVyZUtleXNMZW5ndGggPSBmZWF0dXJlS2V5cy5sZW5ndGg7XG5cbiAgICAgICAgY29uc3QgcGFydGljbGVMZW5ndGggPSB0aGlzLnBhcnRpY2xlcy5sZW5ndGg7XG5cbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHBhcnRpY2xlTGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgbGV0IHBhcnRpY2xlID0gdGhpcy5wYXJ0aWNsZXNbaV07XG5cbiAgICAgICAgICAgIGZvcihsZXQgaiA9IDA7IGogPCBmZWF0dXJlS2V5c0xlbmd0aDsgaisrKXtcbiAgICAgICAgICAgICAgICBsZXQgZmVhdHVyZSA9IGZlYXR1cmVLZXlzW2pdO1xuICAgICAgICAgICAgICAgIGxldCB4X3kgPSBwYXJ0aWNsZS54ICsgXCJfXCIgKyBwYXJ0aWNsZS55O1xuICAgICAgICAgICAgICAgIGxldCB0ZXN0VmFsdWUgPSB0aGlzLmRiLmdldEZlYXR1cmVWYWx1ZSh0aGlzLmZwX2lkLCB4X3ksIGZlYXR1cmUpO1xuICAgICAgICAgICAgICAgIGlmKHRlc3RWYWx1ZSl7XG4gICAgICAgICAgICAgICAgICAgIGxldCBmZWF0dXJlVmFsdWUgPSBmZWF0dXJlc1tmZWF0dXJlXTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRpZmYgPSBNYXRoLmFicyh0ZXN0VmFsdWUgLSBmZWF0dXJlVmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBwYXJ0aWNsZS53ZWlnaHQgKz0gTWF0aC5wb3coZGlmZiwgMik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcGFydGljbGUud2VpZ2h0ICs9IE1hdGgucG93KHRlc3RWYWx1ZSwgMik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFydGljbGUud2VpZ2h0ID0gTWF0aC5zcXJ0KHBhcnRpY2xlLndlaWdodCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZXNhbXBsZSgpO1xuICAgIH1cblxuICAgIHJlc2FtcGxlKCl7XG4gICAgICAgIGxldCBnb29kWCA9IFtdO1xuICAgICAgICBsZXQgZ29vZFkgPSBbXTtcbiAgICAgICAgdGhpcy5wYXJ0aWNsZXMgPSB0aGlzLnBhcnRpY2xlcy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgICAgICBpZihhLndlaWdodCA+PSBiLndlaWdodCl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBwYXJ0aWNsZUxlbmd0aCA9IHRoaXMucGFydGljbGVzLmxlbmd0aDtcbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHBhcnRpY2xlTGVuZ3RoIC8gNTsgaSsrKXtcbiAgICAgICAgICAgIGxldCBneCA9IHRoaXMucGFydGljbGVzW2ldLng7XG4gICAgICAgICAgICBsZXQgZ3kgPSB0aGlzLnBhcnRpY2xlc1tpXS55O1xuICAgICAgICAgICAgaWYoZ29vZFguaW5kZXhPZihneCkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgZ29vZFgucHVzaChneCk7XG5cbiAgICAgICAgICAgICAgICBsZXQgbCA9IE1hdGgubWF4KDAsIGd4IC0gMSk7XG4gICAgICAgICAgICAgICAgbGV0IHIgPSBneCArIDE7XG4gICAgICAgICAgICAgICAgZm9yKDsgbCA8PSByOyBsKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGdvb2RYLmluZGV4T2YobCkgPT09IC0xKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdvb2RYLnB1c2gobCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKGdvb2RZLmluZGV4T2YoZ3kpID09PSAtMSkge1xuICAgICAgICAgICAgICAgIGdvb2RZLnB1c2goZ3kpO1xuICAgICAgICAgICAgICAgIGxldCBsID0gTWF0aC5tYXgoMCwgZ3kgLSAxKTtcbiAgICAgICAgICAgICAgICBsZXQgciA9IGd5ICsgMTtcbiAgICAgICAgICAgICAgICBmb3IoOyBsIDw9IHI7IGwrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZ29vZFkuaW5kZXhPZihsKSA9PT0gLTEpe1xuICAgICAgICAgICAgICAgICAgICAgICAgZ29vZFkucHVzaChsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBuZXdQYXJ0aWNsZXMgPSBbXTtcbiAgICAgICAgdGhpcy5wYXJ0aWNsZUNvb3JkcyA9IFtdO1xuICAgICAgICB0aGlzLnVuaXF1ZVBhcnRpY2xlcyA9IFtdO1xuICAgICAgICBsZXQgdXNlZFh5ID0gW107XG4gICAgICAgIHdoaWxlIChuZXdQYXJ0aWNsZXMubGVuZ3RoIDwgcGFydGljbGVMZW5ndGgpIHtcbiAgICAgICAgICAgIGxldCBjX3ggPSBnb29kWFtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBnb29kWC5sZW5ndGgpXTtcbiAgICAgICAgICAgIGxldCBjX3kgPSBnb29kWVtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBnb29kWS5sZW5ndGgpXTtcbiAgICAgICAgICAgIGxldCBrZXkgPSBjX3ggKyBcIl9cIiArIGNfeTtcbiAgICAgICAgICAgIGlmKHRoaXMuYWxsUGFydGljbGVzW2tleV0gPT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgcCA9IHtcbiAgICAgICAgICAgICAgICB4OiBjX3gsXG4gICAgICAgICAgICAgICAgeTogY195LFxuICAgICAgICAgICAgICAgIGFwX2lkczogT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5hbGxQYXJ0aWNsZXNba2V5XSksXG4gICAgICAgICAgICAgICAgd2VpZ2h0OiAwXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYodXNlZFh5LmluZGV4T2Yoa2V5KSA9PT0gLTEpe1xuICAgICAgICAgICAgICAgIHVzZWRYeS5wdXNoKGtleSk7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZUNvb3Jkcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgeDogcC54LFxuICAgICAgICAgICAgICAgICAgICB5OiBwLnlcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLnVuaXF1ZVBhcnRpY2xlcy5wdXNoKHApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbmV3UGFydGljbGVzLnB1c2gocCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wYXJ0aWNsZXMgPSBuZXdQYXJ0aWNsZXM7XG4gICAgfVxuXG4gICAgZ2V0UGFydGljbGVDb29yZHMoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFydGljbGVDb29yZHM7XG4gICAgfVxuXG4gICAgZ2V0UGFydGljbGVLZXlzKCl7XG4gICAgICAgIGxldCBwID0ge307XG4gICAgICAgIGNvbnN0IHBhcnRpY2xlTGVuZ3RoID0gdGhpcy5wYXJ0aWNsZXMubGVuZ3RoO1xuXG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBwYXJ0aWNsZUxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGxldCBrZXkgPSB0aGlzLnBhcnRpY2xlc1tpXS54ICsgXCJfXCIgKyB0aGlzLnBhcnRpY2xlc1tpXS55O1xuICAgICAgICAgICAgcFtrZXldID0gMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcDtcbiAgICB9XG5cbiAgICBnZXRVbmlxdWVQYXJ0aWNsZXMoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMudW5pcXVlUGFydGljbGVzO1xuICAgIH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBQYXJ0aWNsZUZpbHRlcjsiXX0=
//# sourceMappingURL=ParticleFilter.js.map
