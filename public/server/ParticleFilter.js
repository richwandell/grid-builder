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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvUGFydGljbGVGaWx0ZXIuZXM2Il0sIm5hbWVzIjpbIlBhcnRpY2xlRmlsdGVyIiwiZGIiLCJmcF9pZCIsInBhcnRpY2xlcyIsInBhcnRpY2xlQ29vcmRzIiwidW5pcXVlUGFydGljbGVzIiwiYWxsUGFydGljbGVzIiwiZ2V0RmVhdHVyZXNDYWNoZSIsImd1ZXNzIiwib2xkUGFydGljbGVzIiwia2V5cyIsIk9iamVjdCIsImtleUxlbmd0aCIsImxlbmd0aCIsIm1heFgiLCJtYXhZIiwiaSIsInNwbGl0IiwieCIsInkiLCJOdW1iZXIiLCJwdXNoIiwid2VpZ2h0IiwiY29vcmQiLCJmZWF0dXJlTnVtYmVyIiwiZ2V0RmVhdHVyZU51bWJlciIsInciLCJNYXRoIiwic3FydCIsImZlYXR1cmVzIiwiaW5pdGlhbGl6ZVBhcnRpY2xlcyIsImZlYXR1cmVLZXlzIiwiZmVhdHVyZUtleXNMZW5ndGgiLCJwYXJ0aWNsZUxlbmd0aCIsInBhcnRpY2xlIiwieF95IiwiaiIsImZlYXR1cmUiLCJ0ZXN0VmFsdWUiLCJnZXRGZWF0dXJlVmFsdWUiLCJmZWF0dXJlVmFsdWUiLCJkaWZmIiwiYWJzIiwicG93IiwiZ2V0UGFydGljbGVXZWlnaHQiLCJyZXNhbXBsZSIsImdvb2RYIiwiZ29vZFkiLCJ1c2VkWHkiLCJzb3J0IiwiYSIsImIiLCJvbGQiLCJneCIsImd5Iiwia2V5IiwiaW5kZXhPZiIsImRpc3RhbmNlIiwibCIsIm1heCIsInIiLCJuZXdQYXJ0aWNsZXMiLCJjX3giLCJmbG9vciIsInJhbmRvbSIsImNfeSIsInVuZGVmaW5lZCIsInAiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQTs7Ozs7Ozs7SUFFTUEsYztBQUVGLDRCQUFZQyxFQUFaLEVBQW9CQyxLQUFwQixFQUFrQztBQUFBOztBQUM5QixhQUFLQSxLQUFMLEdBQWFBLEtBQWI7QUFDQSxhQUFLRCxFQUFMLEdBQVVBLEVBQVY7QUFDQSxhQUFLRSxTQUFMLEdBQWlCLEVBQWpCO0FB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NkJBQWF4QyxJQUFiLENBQWtCOEMsQ0FBbEI7QUFDSDtBQUNELGlCQUFLaEUsU0FBTCxHQUFpQjBELFlBQWpCO0FBQ0g7Ozs0Q0FFa0I7QUFDZixtQkFBTyxLQUFLekQsY0FBWjtBQUNIOzs7MENBRWdCO0FBQ2IsZ0JBQUkrRCxJQUFJLEVBQVI7QUFDQSxnQkFBTWxDLGlCQUFpQixLQUFLOUIsU0FBTCxDQUFlVSxNQUF0Qzs7QUFFQSxpQkFBSSxJQUFJRyxJQUFJLENBQVosRUFBZUEsSUFBSWlCLGNBQW5CLEVBQW1DakIsR0FBbkMsRUFBdUM7QUFDbkMsb0JBQUl1QyxNQUFNLEtBQUtwRCxTQUFMLENBQWVhLENBQWYsRUFBa0JFLENBQWxCLEdBQXNCLEdBQXRCLEdBQTRCLEtBQUtmLFNBQUwsQ0FBZWEsQ0FBZixFQUFrQkcsQ0FBeEQ7QUFDQWdELGtCQUFFWixHQUFGLElBQVMsQ0FBVDtBQUNIO0FBQ0QsbUJBQU9ZLENBQVA7QUFDSDs7OzZDQUVtQjtBQUNoQixtQkFBTyxLQUFLOUQsZUFBWjtBQUNIOzs7Ozs7a0JBSVVMLGMiLCJmaWxlIjoiUGFydGljbGVGaWx0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRGIgZnJvbSAnLi9EYic7XG5cbmNsYXNzIFBhcnRpY2xlRmlsdGVyIHtcblxuICAgIGNvbnN0cnVjdG9yKGRiOiBEYiwgZnBfaWQ6IHN0cmluZyl7XG4gICAgICAgIHRoaXMuZnBfaWQgPSBmcF9pZDtcbiAgICAgICAgdGhpcy5kYiA9IGRiO1xuICAgICAgICB0aGlzLnBhcnRpY2xlcyA9IFtdO1xuICAgICAgICB0aGlzLnBhcnRpY2xlQ29vcmRzID0gW107XG4gICAgICAgIHRoaXMudW5pcXVlUGFydGljbGVzID0gW107XG4gICAgICAgIHRoaXMuYWxsUGFydGljbGVzID0gdGhpcy5kYi5nZXRGZWF0dXJlc0NhY2hlKHRoaXMuZnBfaWQpO1xuICAgICAgICB0aGlzLmd1ZXNzID0gWzAsMF07XG4gICAgICAgIHRoaXMub2xkUGFydGljbGVzID0gW107XG4gICAgfVxuXG4gICAgc2V0UGFydGljbGVzKHBhcnRpY2xlcyl7XG4gICAgICAgIHRoaXMucGFydGljbGVzID0gcGFydGljbGVzO1xuICAgICAgICB0aGlzLmFsbFBhcnRpY2xlcyA9IHRoaXMuZGIuZ2V0RmVhdHVyZXNDYWNoZSh0aGlzLmZwX2lkKTtcbiAgICB9XG5cbiAgICBnZXRQYXJ0aWNsZXMoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFydGljbGVzO1xuICAgIH1cblxuICAgIGdldE9sZFBhcnRpY2xlcygpe1xuICAgICAgICByZXR1cm4gdGhpcy5vbGRQYXJ0aWNsZXM7XG4gICAgfVxuXG4gICAgaW5pdGlhbGl6ZVBhcnRpY2xlcygpe1xuICAgICAgICB0aGlzLmFsbFBhcnRpY2xlcyA9IHRoaXMuZGIuZ2V0RmVhdHVyZXNDYWNoZSh0aGlzLmZwX2lkKTtcbiAgICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKHRoaXMuYWxsUGFydGljbGVzKTtcbiAgICAgICAgY29uc3Qga2V5TGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gICAgICAgIGxldCBtYXhYID0gMDtcbiAgICAgICAgbGV0IG1heFkgPSAwO1xuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwga2V5TGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgbGV0IFt4LCB5XSA9IGtleXNbaV0uc3BsaXQoXCJfXCIpO1xuICAgICAgICAgICAgW3gsIHldID0gW051bWJlcih4KSwgTnVtYmVyKHkpXTtcblxuICAgICAgICAgICAgaWYoeCA+IG1heFgpIG1heFggPSB4O1xuICAgICAgICAgICAgaWYoeSA+IG1heFkpIG1heFkgPSB5O1xuICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgeDogeCxcbiAgICAgICAgICAgICAgICB5OiB5LFxuICAgICAgICAgICAgICAgIHdlaWdodDogMFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5tYXhYID0gbWF4WDtcbiAgICAgICAgdGhpcy5tYXhZID0gbWF4WTtcbiAgICB9XG5cbiAgICBnZXRQYXJ0aWNsZVdlaWdodChjb29yZCwgd2VpZ2h0KXtcbiAgICAgICAgY29uc3QgZmVhdHVyZU51bWJlciA9IHRoaXMuZGIuZ2V0RmVhdHVyZU51bWJlcih0aGlzLmZwX2lkLCBjb29yZCk7XG4gICAgICAgIGxldCB3ID0gTWF0aC5zcXJ0KHdlaWdodCk7XG4gICAgICAgIHJldHVybiB3IC8gZmVhdHVyZU51bWJlcjtcbiAgICB9XG5cbiAgICBtb3ZlKGZlYXR1cmVzKXtcbiAgICAgICAgaWYodGhpcy5wYXJ0aWNsZXMubGVuZ3RoID09PSAwKSB0aGlzLmluaXRpYWxpemVQYXJ0aWNsZXMoKTtcbiAgICAgICAgdGhpcy5vbGRQYXJ0aWNsZXMgPSBbXTtcbiAgICAgICAgY29uc3QgZmVhdHVyZUtleXMgPSBPYmplY3Qua2V5cyhmZWF0dXJlcyk7XG4gICAgICAgIGNvbnN0IGZlYXR1cmVLZXlzTGVuZ3RoID0gZmVhdHVyZUtleXMubGVuZ3RoO1xuXG4gICAgICAgIGNvbnN0IHBhcnRpY2xlTGVuZ3RoID0gdGhpcy5wYXJ0aWNsZXMubGVuZ3RoO1xuXG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBwYXJ0aWNsZUxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGxldCBwYXJ0aWNsZSA9IHRoaXMucGFydGljbGVzW2ldO1xuICAgICAgICAgICAgbGV0IHhfeSA9IHBhcnRpY2xlLnggKyBcIl9cIiArIHBhcnRpY2xlLnk7XG5cbiAgICAgICAgICAgIGZvcihsZXQgaiA9IDA7IGogPCBmZWF0dXJlS2V5c0xlbmd0aDsgaisrKXtcbiAgICAgICAgICAgICAgICBsZXQgZmVhdHVyZSA9IGZlYXR1cmVLZXlzW2pdO1xuICAgICAgICAgICAgICAgIGxldCB0ZXN0VmFsdWUgPSB0aGlzLmRiLmdldEZlYXR1cmVWYWx1ZSh0aGlzLmZwX2lkLCB4X3ksIGZlYXR1cmUpO1xuICAgICAgICAgICAgICAgIGlmKHRlc3RWYWx1ZSl7XG4gICAgICAgICAgICAgICAgICAgIGxldCBmZWF0dXJlVmFsdWUgPSBmZWF0dXJlc1tmZWF0dXJlXTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRpZmYgPSBNYXRoLmFicyh0ZXN0VmFsdWUgLSBmZWF0dXJlVmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBwYXJ0aWNsZS53ZWlnaHQgKz0gTWF0aC5wb3coZGlmZiwgMik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcGFydGljbGUud2VpZ2h0ICs9IE1hdGgucG93KHRlc3RWYWx1ZSwgMik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFydGljbGUud2VpZ2h0ID0gdGhpcy5nZXRQYXJ0aWNsZVdlaWdodCh4X3ksIHBhcnRpY2xlLndlaWdodCk7XG4gICAgICAgICAgICB0aGlzLm9sZFBhcnRpY2xlcy5wdXNoKHt4OiBwYXJ0aWNsZS54LCB5OiBwYXJ0aWNsZS55LCB3ZWlnaHQ6IHBhcnRpY2xlLndlaWdodH0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVzYW1wbGUoKTtcbiAgICB9XG5cbiAgICByZXNhbXBsZSgpe1xuICAgICAgICBsZXQgZ29vZFggPSBbXTtcbiAgICAgICAgbGV0IGdvb2RZID0gW107XG4gICAgICAgIGxldCB1c2VkWHkgPSBbXTtcblxuICAgICAgICB0aGlzLnBhcnRpY2xlcyA9IHRoaXMucGFydGljbGVzLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICAgIGlmKGEud2VpZ2h0ID49IGIud2VpZ2h0KXtcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudW5pcXVlUGFydGljbGVzID0gW107XG4gICAgICAgIGNvbnN0IHBhcnRpY2xlTGVuZ3RoID0gdGhpcy5wYXJ0aWNsZXMubGVuZ3RoO1xuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgcGFydGljbGVMZW5ndGggLyA1OyBpKyspe1xuICAgICAgICAgICAgY29uc3Qgb2xkID0gdGhpcy5wYXJ0aWNsZXNbaV07XG4gICAgICAgICAgICBsZXQgZ3ggPSBvbGQueDtcbiAgICAgICAgICAgIGxldCBneSA9IG9sZC55O1xuICAgICAgICAgICAgbGV0IGtleSA9IGd4ICsgXCJfXCIgKyBneTtcbiAgICAgICAgICAgIGlmKHVzZWRYeS5pbmRleE9mKGtleSkgPT09IC0xKXtcbiAgICAgICAgICAgICAgICB0aGlzLnVuaXF1ZVBhcnRpY2xlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgeDogZ3gsXG4gICAgICAgICAgICAgICAgICAgIHk6IGd5LFxuICAgICAgICAgICAgICAgICAgICBkaXN0YW5jZTogb2xkLndlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgd2VpZ2h0OiBvbGQud2VpZ2h0XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihnb29kWC5pbmRleE9mKGd4KSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICBnb29kWC5wdXNoKGd4KTtcblxuICAgICAgICAgICAgICAgIGxldCBsID0gTWF0aC5tYXgoMCwgZ3ggLSAyKTtcbiAgICAgICAgICAgICAgICBsZXQgciA9IGd4ICsgMjtcbiAgICAgICAgICAgICAgICBmb3IoOyBsIDw9IHI7IGwrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZ29vZFguaW5kZXhPZihsKSA9PT0gLTEpe1xuICAgICAgICAgICAgICAgICAgICAgICAgZ29vZFgucHVzaChsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYoZ29vZFkuaW5kZXhPZihneSkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgZ29vZFkucHVzaChneSk7XG4gICAgICAgICAgICAgICAgbGV0IGwgPSBNYXRoLm1heCgwLCBneSAtIDIpO1xuICAgICAgICAgICAgICAgIGxldCByID0gZ3kgKyAyO1xuICAgICAgICAgICAgICAgIGZvcig7IGwgPD0gcjsgbCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChnb29kWS5pbmRleE9mKGwpID09PSAtMSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBnb29kWS5wdXNoKGwpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG5ld1BhcnRpY2xlcyA9IFtdO1xuICAgICAgICB0aGlzLnBhcnRpY2xlQ29vcmRzID0gW107XG4gICAgICAgIHVzZWRYeSA9IFtdO1xuICAgICAgICB3aGlsZSAobmV3UGFydGljbGVzLmxlbmd0aCA8IHBhcnRpY2xlTGVuZ3RoKSB7XG4gICAgICAgICAgICBsZXQgY194ID0gZ29vZFhbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogZ29vZFgubGVuZ3RoKV07XG4gICAgICAgICAgICBsZXQgY195ID0gZ29vZFlbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogZ29vZFkubGVuZ3RoKV07XG4gICAgICAgICAgICBsZXQga2V5ID0gY194ICsgXCJfXCIgKyBjX3k7XG4gICAgICAgICAgICBpZih0aGlzLmFsbFBhcnRpY2xlc1trZXldID09PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IHAgPSB7XG4gICAgICAgICAgICAgICAgeDogY194LFxuICAgICAgICAgICAgICAgIHk6IGNfeSxcbiAgICAgICAgICAgICAgICB3ZWlnaHQ6IDBcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZih1c2VkWHkuaW5kZXhPZihrZXkpID09PSAtMSl7XG4gICAgICAgICAgICAgICAgdXNlZFh5LnB1c2goa2V5KTtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcnRpY2xlQ29vcmRzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB4OiBwLngsXG4gICAgICAgICAgICAgICAgICAgIHk6IHAueVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbmV3UGFydGljbGVzLnB1c2gocCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wYXJ0aWNsZXMgPSBuZXdQYXJ0aWNsZXM7XG4gICAgfVxuXG4gICAgZ2V0UGFydGljbGVDb29yZHMoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFydGljbGVDb29yZHM7XG4gICAgfVxuXG4gICAgZ2V0UGFydGljbGVLZXlzKCl7XG4gICAgICAgIGxldCBwID0ge307XG4gICAgICAgIGNvbnN0IHBhcnRpY2xlTGVuZ3RoID0gdGhpcy5wYXJ0aWNsZXMubGVuZ3RoO1xuXG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBwYXJ0aWNsZUxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGxldCBrZXkgPSB0aGlzLnBhcnRpY2xlc1tpXS54ICsgXCJfXCIgKyB0aGlzLnBhcnRpY2xlc1tpXS55O1xuICAgICAgICAgICAgcFtrZXldID0gMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcDtcbiAgICB9XG5cbiAgICBnZXRVbmlxdWVQYXJ0aWNsZXMoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMudW5pcXVlUGFydGljbGVzO1xuICAgIH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBQYXJ0aWNsZUZpbHRlcjsiXX0=
//# sourceMappingURL=ParticleFilter.js.map
