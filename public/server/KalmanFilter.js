"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var KalmanFilter = function () {
    function KalmanFilter(pest) {
        _classCallCheck(this, KalmanFilter);

        this.cest = 0;
        this.pest = pest;
        this.mea = 0;
        this.kg = 0;
        this.eest = 1;
        this.emea = 1;
    }

    _createClass(KalmanFilter, [{
        key: "addSample",
        value: function addSample(m) {
            if (m === 0) return;
            this.mea = m;
            this.kg = this.eest / (this.eest + this.emea);
            this.cest = this.pest + this.kg * (this.mea - this.pest);
            this.pest = this.cest;
            this.eest = this.emea * this.eest / (this.emea + this.eest);
            return this.cest;
        }
    }, {
        key: "getEstimate",
        value: function getEstimate() {
            return this.cest;
        }
    }]);

    return KalmanFilter;
}();

exports.default = KalmanFilter;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvS2FsbWFuRmlsdGVyLmVzNiJdLCJuYW1lcyI6WyJLYWxtYW5GaWx0ZXIiLCJwZXN0IiwiY2VzdCIsIm1lYSIsImtnIiwiZWVzdCIsImVtZWEiLCJtIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0lBQU1BLFk7QUFFRiwwQkFBWUMsSUFBWixFQUFpQjtBQUFBOztBQUNiLGFBQUtDLElBQUwsR0FBWSxDQUFaO0FBQ0EsYUFBS0QsSUFBTCxHQUFZQSxJQUFaO0FBQ0EsYUFBS0UsR0FBTCxHQUFXLENBQVg7QUFDQSxhQUFLQyxFQUFMLEdBQVUsQ0FBVjtBQUNBLGFBQUtDLElBQUwsR0FBWSxDQUFaO0FBQ0EsYUFBS0MsSUFBTCxHQUFZLENBQVo7QUFDSDs7OztrQ0FFU0MsQyxFQUFFO0FBQ1IsZ0JBQUdBLE1BQU0sQ0FBVCxFQUFZO0FBQ1osaUJBQUtKLEdBQUwsR0FBV0ksQ0FBWDtBQUNBLGlCQUFLSCxFQUFMLEdBQVUsS0FBS0MsSUFBTCxJQUFhLEtBQUtBLElBQUwsR0FBWSxLQUFLQyxJQUE5QixDQUFWO0FBQ0EsaUJBQUtKLElBQUwsR0FBWSxLQUFLRCxJQUFMLEdBQVksS0FBS0csRUFBTCxJQUFXLEtBQUtELEdBQUwsR0FBVyxLQUFLRixJQUEzQixDQUF4QjtBQUNBLGlCQUFLQSxJQUFMLEdBQVksS0FBS0MsSUFBakI7QUFDQSxpQkFBS0csSUFBTCxHQUFhLEtBQUtDLElBQUwsR0FBWSxLQUFLRCxJQUFsQixJQUEyQixLQUFLQyxJQUFMLEdBQVksS0FBS0QsSUFBNUMsQ0FBWjtBQUNBLG1CQUFPLEtBQUtILElBQVo7QUFDSDs7O3NDQUVZO0FBQ1QsbUJBQU8sS0FBS0EsSUFBWjtBQUNIOzs7Ozs7a0JBSVVGLFkiLCJmaWxlIjoiS2FsbWFuRmlsdGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgS2FsbWFuRmlsdGVyIHtcblxuICAgIGNvbnN0cnVjdG9yKHBlc3Qpe1xuICAgICAgICB0aGlzLmNlc3QgPSAwO1xuICAgICAgICB0aGlzLnBlc3QgPSBwZXN0O1xuICAgICAgICB0aGlzLm1lYSA9IDA7XG4gICAgICAgIHRoaXMua2cgPSAwO1xuICAgICAgICB0aGlzLmVlc3QgPSAxO1xuICAgICAgICB0aGlzLmVtZWEgPSAxO1xuICAgIH1cblxuICAgIGFkZFNhbXBsZShtKXtcbiAgICAgICAgaWYobSA9PT0gMCkgcmV0dXJuO1xuICAgICAgICB0aGlzLm1lYSA9IG07XG4gICAgICAgIHRoaXMua2cgPSB0aGlzLmVlc3QgLyAodGhpcy5lZXN0ICsgdGhpcy5lbWVhKTtcbiAgICAgICAgdGhpcy5jZXN0ID0gdGhpcy5wZXN0ICsgdGhpcy5rZyAqICh0aGlzLm1lYSAtIHRoaXMucGVzdCk7XG4gICAgICAgIHRoaXMucGVzdCA9IHRoaXMuY2VzdDtcbiAgICAgICAgdGhpcy5lZXN0ID0gKHRoaXMuZW1lYSAqIHRoaXMuZWVzdCkgLyAodGhpcy5lbWVhICsgdGhpcy5lZXN0KTtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2VzdDtcbiAgICB9XG5cbiAgICBnZXRFc3RpbWF0ZSgpe1xuICAgICAgICByZXR1cm4gdGhpcy5jZXN0O1xuICAgIH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBLYWxtYW5GaWx0ZXI7Il19
//# sourceMappingURL=KalmanFilter.js.map
