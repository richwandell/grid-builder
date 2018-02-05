'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _mathjs = require('mathjs');

var _mathjs2 = _interopRequireDefault(_mathjs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NdKalmanFilter = function () {
    function NdKalmanFilter(dimensions) {
        _classCallCheck(this, NdKalmanFilter);

        this.cest = _mathjs2.default.ones(dimensions);
        this.mea = null;
        this.kg = null;
        this.eest = _mathjs2.default.ones(dimensions);
        this.emea = _mathjs2.default.ones(dimensions);
    }

    _createClass(NdKalmanFilter, [{
        key: 'addSample',
        value: function addSample(m) {
            this.mea = m;
            var eestPlusEmea = _mathjs2.default.add(this.eest, this.emea);
            this.kg = _mathjs2.default.dotDivide(this.eest, eestPlusEmea);

            var meaMinusPest = _mathjs2.default.subtract(this.mea, this.pest);
            var kgTimesMea = _mathjs2.default.dotMultiply(this.kg, meaMinusPest);
            this.cest = _mathjs2.default.add(this.pest, kgTimesMea);
            this.pest = this.cest;

            var emeaPlusEest = _mathjs2.default.add(this.emea, this.eest);
            var emeaTimesEest = _mathjs2.default.dotMultiply(this.emea, this.eest);
            this.eest = _mathjs2.default.dotDivide(emeaTimesEest, emeaPlusEest);

            return this.cest.valueOf();
        }
    }]);

    return NdKalmanFilter;
}();

exports.default = NdKalmanFilter;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvTmRLYWxtYW5GaWx0ZXIuZXM2Il0sIm5hbWVzIjpbIk5kS2FsbWFuRmlsdGVyIiwiZGltZW5zaW9ucyIsImNlc3QiLCJvbmVzIiwibWVhIiwia2ciLCJlZXN0IiwiZW1lYSIsIm0iLCJlZXN0UGx1c0VtZWEiLCJhZGQiLCJkb3REaXZpZGUiLCJtZWFNaW51c1Blc3QiLCJzdWJ0cmFjdCIsInBlc3QiLCJrZ1RpbWVzTWVhIiwiZG90TXVsdGlwbHkiLCJlbWVhUGx1c0Vlc3QiLCJlbWVhVGltZXNFZXN0IiwidmFsdWVPZiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7Ozs7Ozs7SUFFcUJBLGM7QUFFakIsNEJBQVlDLFVBQVosRUFBZ0M7QUFBQTs7QUFDNUIsYUFBS0MsSUFBTCxHQUFZLGlCQUFLQyxJQUFMLENBQVVGLFVBQVYsQ0FBWjtBQUNBLGFBQUtHLEdBQUwsR0FBVyxJQUFYO0FBQ0EsYUFBS0MsRUFBTCxHQUFVLElBQVY7QUFDQSxhQUFLQyxJQUFMLEdBQVksaUJBQUtILElBQUwsQ0FBVUYsVUFBVixDQUFaO0FBQ0EsYUFBS00sSUFBTCxHQUFZLGlCQUFLSixJQUFMLENBQVVGLFVBQVYsQ0FBWjtBQUNIOzs7O2tDQUVTTyxDLEVBQVU7QUFDaEIsaUJBQUtKLEdBQUwsR0FBV0ksQ0FBWDtBQUNBLGdCQUFJQyxlQUFlLGlCQUFLQyxHQUFMLENBQVMsS0FBS0osSUFBZCxFQUFvQixLQUFLQyxJQUF6QixDQUFuQjtBQUNBLGlCQUFLRixFQUFMLEdBQVUsaUJBQUtNLFNBQUwsQ0FBZSxLQUFLTCxJQUFwQixFQUEwQkcsWUFBMUIsQ0FBVjs7QUFFQSxnQkFBSUcsZUFBZSxpQkFBS0MsUUFBTCxDQUFjLEtBQUtULEdBQW5CLEVBQXdCLEtBQUtVLElBQTdCLENBQW5CO0FBQ0EsZ0JBQUlDLGFBQWEsaUJBQUtDLFdBQUwsQ0FBaUIsS0FBS1gsRUFBdEIsRUFBMEJPLFlBQTFCLENBQWpCO0FBQ0EsaUJBQUtWLElBQUwsR0FBWSxpQkFBS1EsR0FBTCxDQUFTLEtBQUtJLElBQWQsRUFBb0JDLFVBQXBCLENBQVo7QUFDQSxpQkFBS0QsSUFBTCxHQUFZLEtBQUtaLElBQWpCOztBQUVBLGdCQUFJZSxlQUFlLGlCQUFLUCxHQUFMLENBQVMsS0FBS0gsSUFBZCxFQUFvQixLQUFLRCxJQUF6QixDQUFuQjtBQUNBLGdCQUFJWSxnQkFBZ0IsaUJBQUtGLFdBQUwsQ0FBaUIsS0FBS1QsSUFBdEIsRUFBNEIsS0FBS0QsSUFBakMsQ0FBcEI7QUFDQSxpQkFBS0EsSUFBTCxHQUFZLGlCQUFLSyxTQUFMLENBQWVPLGFBQWYsRUFBOEJELFlBQTlCLENBQVo7O0FBRUEsbUJBQU8sS0FBS2YsSUFBTCxDQUFVaUIsT0FBVixFQUFQO0FBQ0g7Ozs7OztrQkF6QmdCbkIsYyIsImZpbGUiOiJOZEthbG1hbkZpbHRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtYXRoIGZyb20gJ21hdGhqcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE5kS2FsbWFuRmlsdGVyIHtcblxuICAgIGNvbnN0cnVjdG9yKGRpbWVuc2lvbnM6IE51bWJlcikge1xuICAgICAgICB0aGlzLmNlc3QgPSBtYXRoLm9uZXMoZGltZW5zaW9ucyk7XG4gICAgICAgIHRoaXMubWVhID0gbnVsbDtcbiAgICAgICAgdGhpcy5rZyA9IG51bGw7XG4gICAgICAgIHRoaXMuZWVzdCA9IG1hdGgub25lcyhkaW1lbnNpb25zKTtcbiAgICAgICAgdGhpcy5lbWVhID0gbWF0aC5vbmVzKGRpbWVuc2lvbnMpO1xuICAgIH1cblxuICAgIGFkZFNhbXBsZShtOiBBcnJheSkge1xuICAgICAgICB0aGlzLm1lYSA9IG07XG4gICAgICAgIGxldCBlZXN0UGx1c0VtZWEgPSBtYXRoLmFkZCh0aGlzLmVlc3QsIHRoaXMuZW1lYSk7XG4gICAgICAgIHRoaXMua2cgPSBtYXRoLmRvdERpdmlkZSh0aGlzLmVlc3QsIGVlc3RQbHVzRW1lYSk7XG5cbiAgICAgICAgbGV0IG1lYU1pbnVzUGVzdCA9IG1hdGguc3VidHJhY3QodGhpcy5tZWEsIHRoaXMucGVzdCk7XG4gICAgICAgIGxldCBrZ1RpbWVzTWVhID0gbWF0aC5kb3RNdWx0aXBseSh0aGlzLmtnLCBtZWFNaW51c1Blc3QpO1xuICAgICAgICB0aGlzLmNlc3QgPSBtYXRoLmFkZCh0aGlzLnBlc3QsIGtnVGltZXNNZWEpO1xuICAgICAgICB0aGlzLnBlc3QgPSB0aGlzLmNlc3Q7XG5cbiAgICAgICAgbGV0IGVtZWFQbHVzRWVzdCA9IG1hdGguYWRkKHRoaXMuZW1lYSwgdGhpcy5lZXN0KTtcbiAgICAgICAgbGV0IGVtZWFUaW1lc0Vlc3QgPSBtYXRoLmRvdE11bHRpcGx5KHRoaXMuZW1lYSwgdGhpcy5lZXN0KTtcbiAgICAgICAgdGhpcy5lZXN0ID0gbWF0aC5kb3REaXZpZGUoZW1lYVRpbWVzRWVzdCwgZW1lYVBsdXNFZXN0KTtcblxuICAgICAgICByZXR1cm4gdGhpcy5jZXN0LnZhbHVlT2YoKTtcbiAgICB9XG59Il19
//# sourceMappingURL=NdKalmanFilter.js.map
