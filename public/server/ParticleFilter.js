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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvUGFydGljbGVGaWx0ZXIuZXM2Il0sIm5hbWVzIjpbIlBhcnRpY2xlRmlsdGVyIiwiZGIiLCJmcF9pZCIsInBhcnRpY2xlcyIsInBhcnRpY2xlQ29vcmRzIiwidW5pcXVlUGFydGljbGVzIiwiYWxsUGFydGljbGVzIiwiZ2V0RmVhdHVyZXNDYWNoZSIsImd1ZXNzIiwib2xkUGFydGljbGVzIiwia2V5cyIsIk9iamVjdCIsImtleUxlbmd0aCIsImxlbmd0aCIsIm1heFgiLCJtYXhZIiwiaSIsInNwbGl0IiwieCIsInkiLCJOdW1iZXIiLCJwdXNoIiwid2VpZ2h0IiwiY29vcmQiLCJ3IiwiTWF0aCIsInNxcnQiLCJyb3VuZCIsIkluZmluaXR5IiwiZmVhdHVyZXMiLCJpbml0aWFsaXplUGFydGljbGVzIiwiZmVhdHVyZUtleXMiLCJmZWF0dXJlS2V5c0xlbmd0aCIsInBhcnRpY2xlTGVuZ3RoIiwicGFydGljbGUiLCJ4X3kiLCJqIiwiZmVhdHVyZSIsInRlc3RWYWx1ZSIsImdldEZlYXR1cmVWYWx1ZSIsImZlYXR1cmVWYWx1ZSIsImRpZmYiLCJhYnMiLCJwb3ciLCJnZXRQYXJ0aWNsZVdlaWdodCIsInJlc2FtcGxlIiwiZ29vZFgiLCJnb29kWSIsInVzZWRYeSIsInNvcnQiLCJhIiwiYiIsIm9sZCIsImd4IiwiZ3kiLCJrZXkiLCJpbmRleE9mIiwiZGlzdGFuY2UiLCJsIiwibWF4IiwiciIsIm5ld1BhcnRpY2xlcyIsImNfeCIsImZsb29yIiwicmFuZG9tIiwiY195IiwidW5kZWZpbmVkIiwicCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBOzs7Ozs7OztJQUVNQSxjO0FBRUYsNEJBQVlDLEVBQVosRUFBb0JDLEtBQXBCLEVBQWtDO0FBQUE7O0FBQzlCLGFBQUtBLEtBQUwsR0FBYUEsS0FBYjtBQUNBLGFBQUtELEVBQUwsR0FBVUEsRUFBVjtBQUNBLGFBQUtFLFNBQUwsR0FBaUIsRUFBakI7QUFDQSxhQUFLQyxjQUFMLEdB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RDBDLDZCQUFheEMsSUFBYixDQUFrQjhDLENBQWxCO0FBQ0g7QUFDRCxpQkFBS2hFLFNBQUwsR0FBaUIwRCxZQUFqQjtBQUNIOzs7NENBRWtCO0FBQ2YsbUJBQU8sS0FBS3pELGNBQVo7QUFDSDs7OzBDQUVnQjtBQUNiLGdCQUFJK0QsSUFBSSxFQUFSO0FBQ0EsZ0JBQU1sQyxpQkFBaUIsS0FBSzlCLFNBQUwsQ0FBZVUsTUFBdEM7O0FBRUEsaUJBQUksSUFBSUcsSUFBSSxDQUFaLEVBQWVBLElBQUlpQixjQUFuQixFQUFtQ2pCLEdBQW5DLEVBQXVDO0FBQ25DLG9CQUFJdUMsTUFBTSxLQUFLcEQsU0FBTCxDQUFlYSxDQUFmLEVBQWtCRSxDQUFsQixHQUFzQixHQUF0QixHQUE0QixLQUFLZixTQUFMLENBQWVhLENBQWYsRUFBa0JHLENBQXhEO0FBQ0FnRCxrQkFBRVosR0FBRixJQUFTLENBQVQ7QUFDSDtBQUNELG1CQUFPWSxDQUFQO0FBQ0g7Ozs2Q0FFbUI7QUFDaEIsbUJBQU8sS0FBSzlELGVBQVo7QUFDSDs7Ozs7O2tCQUlVTCxjIiwiZmlsZSI6IlBhcnRpY2xlRmlsdGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IERiIGZyb20gJy4vRGInO1xuXG5jbGFzcyBQYXJ0aWNsZUZpbHRlciB7XG5cbiAgICBjb25zdHJ1Y3RvcihkYjogRGIsIGZwX2lkOiBzdHJpbmcpe1xuICAgICAgICB0aGlzLmZwX2lkID0gZnBfaWQ7XG4gICAgICAgIHRoaXMuZGIgPSBkYjtcbiAgICAgICAgdGhpcy5wYXJ0aWNsZXMgPSBbXTtcbiAgICAgICAgdGhpcy5wYXJ0aWNsZUNvb3JkcyA9IFtdO1xuICAgICAgICB0aGlzLnVuaXF1ZVBhcnRpY2xlcyA9IFtdO1xuICAgICAgICB0aGlzLmFsbFBhcnRpY2xlcyA9IHRoaXMuZGIuZ2V0RmVhdHVyZXNDYWNoZSh0aGlzLmZwX2lkKTtcbiAgICAgICAgdGhpcy5ndWVzcyA9IFswLDBdO1xuICAgICAgICB0aGlzLm9sZFBhcnRpY2xlcyA9IFtdO1xuICAgIH1cblxuICAgIHNldFBhcnRpY2xlcyhwYXJ0aWNsZXMpe1xuICAgICAgICB0aGlzLnBhcnRpY2xlcyA9IHBhcnRpY2xlcztcbiAgICAgICAgdGhpcy5hbGxQYXJ0aWNsZXMgPSB0aGlzLmRiLmdldEZlYXR1cmVzQ2FjaGUodGhpcy5mcF9pZCk7XG4gICAgfVxuXG4gICAgZ2V0UGFydGljbGVzKCl7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcnRpY2xlcztcbiAgICB9XG5cbiAgICBnZXRPbGRQYXJ0aWNsZXMoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMub2xkUGFydGljbGVzO1xuICAgIH1cblxuICAgIGluaXRpYWxpemVQYXJ0aWNsZXMoKXtcbiAgICAgICAgdGhpcy5hbGxQYXJ0aWNsZXMgPSB0aGlzLmRiLmdldEZlYXR1cmVzQ2FjaGUodGhpcy5mcF9pZCk7XG4gICAgICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLmFsbFBhcnRpY2xlcyk7XG4gICAgICAgIGNvbnN0IGtleUxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICAgICAgICBsZXQgbWF4WCA9IDA7XG4gICAgICAgIGxldCBtYXhZID0gMDtcbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IGtleUxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGxldCBbeCwgeV0gPSBrZXlzW2ldLnNwbGl0KFwiX1wiKTtcbiAgICAgICAgICAgIFt4LCB5XSA9IFtOdW1iZXIoeCksIE51bWJlcih5KV07XG5cbiAgICAgICAgICAgIGlmKHggPiBtYXhYKSBtYXhYID0geDtcbiAgICAgICAgICAgIGlmKHkgPiBtYXhZKSBtYXhZID0geTtcbiAgICAgICAgICAgIHRoaXMucGFydGljbGVzLnB1c2goe1xuICAgICAgICAgICAgICAgIHg6IHgsXG4gICAgICAgICAgICAgICAgeTogeSxcbiAgICAgICAgICAgICAgICB3ZWlnaHQ6IDBcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubWF4WCA9IG1heFg7XG4gICAgICAgIHRoaXMubWF4WSA9IG1heFk7XG4gICAgfVxuXG4gICAgZ2V0UGFydGljbGVXZWlnaHQoY29vcmQsIHdlaWdodCl7XG4gICAgICAgIGxldCB3ID0gTWF0aC5zcXJ0KHdlaWdodCk7XG4gICAgICAgIGlmIChNYXRoLnJvdW5kKHcpID09PSAwKSB7XG4gICAgICAgICAgIHcgPSBJbmZpbml0eTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdztcbiAgICB9XG5cbiAgICBtb3ZlKGZlYXR1cmVzKXtcbiAgICAgICAgaWYodGhpcy5wYXJ0aWNsZXMubGVuZ3RoID09PSAwKSB0aGlzLmluaXRpYWxpemVQYXJ0aWNsZXMoKTtcbiAgICAgICAgdGhpcy5vbGRQYXJ0aWNsZXMgPSBbXTtcbiAgICAgICAgY29uc3QgZmVhdHVyZUtleXMgPSBPYmplY3Qua2V5cyhmZWF0dXJlcyk7XG4gICAgICAgIGNvbnN0IGZlYXR1cmVLZXlzTGVuZ3RoID0gZmVhdHVyZUtleXMubGVuZ3RoO1xuXG4gICAgICAgIGNvbnN0IHBhcnRpY2xlTGVuZ3RoID0gdGhpcy5wYXJ0aWNsZXMubGVuZ3RoO1xuXG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBwYXJ0aWNsZUxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGxldCBwYXJ0aWNsZSA9IHRoaXMucGFydGljbGVzW2ldO1xuICAgICAgICAgICAgbGV0IHhfeSA9IHBhcnRpY2xlLnggKyBcIl9cIiArIHBhcnRpY2xlLnk7XG5cbiAgICAgICAgICAgIGZvcihsZXQgaiA9IDA7IGogPCBmZWF0dXJlS2V5c0xlbmd0aDsgaisrKXtcbiAgICAgICAgICAgICAgICBsZXQgZmVhdHVyZSA9IGZlYXR1cmVLZXlzW2pdO1xuICAgICAgICAgICAgICAgIGxldCB0ZXN0VmFsdWUgPSB0aGlzLmRiLmdldEZlYXR1cmVWYWx1ZSh0aGlzLmZwX2lkLCB4X3ksIGZlYXR1cmUpO1xuICAgICAgICAgICAgICAgIGlmKHRlc3RWYWx1ZSl7XG4gICAgICAgICAgICAgICAgICAgIGxldCBmZWF0dXJlVmFsdWUgPSBmZWF0dXJlc1tmZWF0dXJlXTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRpZmYgPSBNYXRoLmFicyh0ZXN0VmFsdWUgLSBmZWF0dXJlVmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBwYXJ0aWNsZS53ZWlnaHQgKz0gTWF0aC5wb3coZGlmZiwgMik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcGFydGljbGUud2VpZ2h0ICs9IE1hdGgucG93KHRlc3RWYWx1ZSwgMik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFydGljbGUud2VpZ2h0ID0gdGhpcy5nZXRQYXJ0aWNsZVdlaWdodCh4X3ksIHBhcnRpY2xlLndlaWdodCk7XG4gICAgICAgICAgICB0aGlzLm9sZFBhcnRpY2xlcy5wdXNoKHt4OiBwYXJ0aWNsZS54LCB5OiBwYXJ0aWNsZS55LCB3ZWlnaHQ6IHBhcnRpY2xlLndlaWdodH0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVzYW1wbGUoKTtcbiAgICB9XG5cbiAgICByZXNhbXBsZSgpe1xuICAgICAgICBsZXQgZ29vZFggPSBbXTtcbiAgICAgICAgbGV0IGdvb2RZID0gW107XG4gICAgICAgIGxldCB1c2VkWHkgPSBbXTtcblxuICAgICAgICB0aGlzLnBhcnRpY2xlcyA9IHRoaXMucGFydGljbGVzLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICAgIGlmKGEud2VpZ2h0ID49IGIud2VpZ2h0KXtcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudW5pcXVlUGFydGljbGVzID0gW107XG4gICAgICAgIGNvbnN0IHBhcnRpY2xlTGVuZ3RoID0gdGhpcy5wYXJ0aWNsZXMubGVuZ3RoO1xuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgcGFydGljbGVMZW5ndGggLyA1OyBpKyspe1xuICAgICAgICAgICAgY29uc3Qgb2xkID0gdGhpcy5wYXJ0aWNsZXNbaV07XG4gICAgICAgICAgICBsZXQgZ3ggPSBvbGQueDtcbiAgICAgICAgICAgIGxldCBneSA9IG9sZC55O1xuICAgICAgICAgICAgbGV0IGtleSA9IGd4ICsgXCJfXCIgKyBneTtcbiAgICAgICAgICAgIGlmKHVzZWRYeS5pbmRleE9mKGtleSkgPT09IC0xKXtcbiAgICAgICAgICAgICAgICB0aGlzLnVuaXF1ZVBhcnRpY2xlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgeDogZ3gsXG4gICAgICAgICAgICAgICAgICAgIHk6IGd5LFxuICAgICAgICAgICAgICAgICAgICBkaXN0YW5jZTogb2xkLndlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgd2VpZ2h0OiBvbGQud2VpZ2h0XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdXNlZFh5LnB1c2goa2V5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKGdvb2RYLmluZGV4T2YoZ3gpID09PSAtMSkge1xuICAgICAgICAgICAgICAgIGdvb2RYLnB1c2goZ3gpO1xuXG4gICAgICAgICAgICAgICAgbGV0IGwgPSBNYXRoLm1heCgwLCBneCAtIDIpO1xuICAgICAgICAgICAgICAgIGxldCByID0gZ3ggKyAyO1xuICAgICAgICAgICAgICAgIGZvcig7IGwgPD0gcjsgbCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChnb29kWC5pbmRleE9mKGwpID09PSAtMSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBnb29kWC5wdXNoKGwpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZihnb29kWS5pbmRleE9mKGd5KSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICBnb29kWS5wdXNoKGd5KTtcbiAgICAgICAgICAgICAgICBsZXQgbCA9IE1hdGgubWF4KDAsIGd5IC0gMik7XG4gICAgICAgICAgICAgICAgbGV0IHIgPSBneSArIDI7XG4gICAgICAgICAgICAgICAgZm9yKDsgbCA8PSByOyBsKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGdvb2RZLmluZGV4T2YobCkgPT09IC0xKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdvb2RZLnB1c2gobCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgbmV3UGFydGljbGVzID0gW107XG4gICAgICAgIHRoaXMucGFydGljbGVDb29yZHMgPSBbXTtcbiAgICAgICAgdXNlZFh5ID0gW107XG4gICAgICAgIHdoaWxlIChuZXdQYXJ0aWNsZXMubGVuZ3RoIDwgcGFydGljbGVMZW5ndGgpIHtcbiAgICAgICAgICAgIGxldCBjX3ggPSBnb29kWFtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBnb29kWC5sZW5ndGgpXTtcbiAgICAgICAgICAgIGxldCBjX3kgPSBnb29kWVtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBnb29kWS5sZW5ndGgpXTtcbiAgICAgICAgICAgIGxldCBrZXkgPSBjX3ggKyBcIl9cIiArIGNfeTtcbiAgICAgICAgICAgIGlmKHRoaXMuYWxsUGFydGljbGVzW2tleV0gPT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgcCA9IHtcbiAgICAgICAgICAgICAgICB4OiBjX3gsXG4gICAgICAgICAgICAgICAgeTogY195LFxuICAgICAgICAgICAgICAgIHdlaWdodDogMFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmKHVzZWRYeS5pbmRleE9mKGtleSkgPT09IC0xKXtcbiAgICAgICAgICAgICAgICB1c2VkWHkucHVzaChrZXkpO1xuICAgICAgICAgICAgICAgIHRoaXMucGFydGljbGVDb29yZHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHg6IHAueCxcbiAgICAgICAgICAgICAgICAgICAgeTogcC55XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBuZXdQYXJ0aWNsZXMucHVzaChwKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnBhcnRpY2xlcyA9IG5ld1BhcnRpY2xlcztcbiAgICB9XG5cbiAgICBnZXRQYXJ0aWNsZUNvb3Jkcygpe1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJ0aWNsZUNvb3JkcztcbiAgICB9XG5cbiAgICBnZXRQYXJ0aWNsZUtleXMoKXtcbiAgICAgICAgbGV0IHAgPSB7fTtcbiAgICAgICAgY29uc3QgcGFydGljbGVMZW5ndGggPSB0aGlzLnBhcnRpY2xlcy5sZW5ndGg7XG5cbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHBhcnRpY2xlTGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgbGV0IGtleSA9IHRoaXMucGFydGljbGVzW2ldLnggKyBcIl9cIiArIHRoaXMucGFydGljbGVzW2ldLnk7XG4gICAgICAgICAgICBwW2tleV0gPSAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwO1xuICAgIH1cblxuICAgIGdldFVuaXF1ZVBhcnRpY2xlcygpe1xuICAgICAgICByZXR1cm4gdGhpcy51bmlxdWVQYXJ0aWNsZXM7XG4gICAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IFBhcnRpY2xlRmlsdGVyOyJdfQ==
//# sourceMappingURL=ParticleFilter.js.map
