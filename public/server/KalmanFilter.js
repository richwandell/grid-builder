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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkthbG1hbkZpbHRlci5lczYiXSwibmFtZXMiOlsiS2FsbWFuRmlsdGVyIiwicGVzdCIsImNlc3QiLCJtZWEiLCJrZyIsImVlc3QiLCJlbWVhIiwibSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztJQUFNQSxZO0FBRUYsMEJBQVlDLElBQVosRUFBaUI7QUFBQTs7QUFDYixhQUFLQyxJQUFMLEdBQVksQ0FBWjtBQUNBLGFBQUtELElBQUwsR0FBWUEsSUFBWjtBQUNBLGFBQUtFLEdBQUwsR0FBVyxDQUFYO0FBQ0EsYUFBS0MsRUFBTCxHQUFVLENBQVY7QUFDQSxhQUFLQyxJQUFMLEdBQVksQ0FBWjtBQUNBLGFBQUtDLElBQUwsR0FBWSxDQUFaO0FBQ0g7Ozs7a0NBRVNDLEMsRUFBRTtBQUNSLGdCQUFHQSxNQUFNLENBQVQsRUFBWTtBQUNaLGlCQUFLSixHQUFMLEdBQVdJLENBQVg7QUFDQSxpQkFBS0gsRUFBTCxHQUFVLEtBQUtDLElBQUwsSUFBYSxLQUFLQSxJQUFMLEdBQVksS0FBS0MsSUFBOUIsQ0FBVjtBQUNBLGlCQUFLSixJQUFMLEdBQVksS0FBS0QsSUFBTCxHQUFZLEtBQUtHLEVBQUwsSUFBVyxLQUFLRCxHQUFMLEdBQVcsS0FBS0YsSUFBM0IsQ0FBeEI7QUFDQSxpQkFBS0EsSUFBTCxHQUFZLEtBQUtDLElBQWpCO0FBQ0EsaUJBQUtHLElBQUwsR0FBYSxLQUFLQyxJQUFMLEdBQVksS0FBS0QsSUFBbEIsSUFBMkIsS0FBS0MsSUFBTCxHQUFZLEtBQUtELElBQTVDLENBQVo7QUFDQSxtQkFBTyxLQUFLSCxJQUFaO0FBQ0g7OztzQ0FFWTtBQUNULG1CQUFPLEtBQUtBLElBQVo7QUFDSDs7Ozs7O2tCQUlVRixZIiwiZmlsZSI6IkthbG1hbkZpbHRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEthbG1hbkZpbHRlciB7XG5cbiAgICBjb25zdHJ1Y3RvcihwZXN0KXtcbiAgICAgICAgdGhpcy5jZXN0ID0gMDtcbiAgICAgICAgdGhpcy5wZXN0ID0gcGVzdDtcbiAgICAgICAgdGhpcy5tZWEgPSAwO1xuICAgICAgICB0aGlzLmtnID0gMDtcbiAgICAgICAgdGhpcy5lZXN0ID0gMTtcbiAgICAgICAgdGhpcy5lbWVhID0gMTtcbiAgICB9XG5cbiAgICBhZGRTYW1wbGUobSl7XG4gICAgICAgIGlmKG0gPT09IDApIHJldHVybjtcbiAgICAgICAgdGhpcy5tZWEgPSBtO1xuICAgICAgICB0aGlzLmtnID0gdGhpcy5lZXN0IC8gKHRoaXMuZWVzdCArIHRoaXMuZW1lYSk7XG4gICAgICAgIHRoaXMuY2VzdCA9IHRoaXMucGVzdCArIHRoaXMua2cgKiAodGhpcy5tZWEgLSB0aGlzLnBlc3QpO1xuICAgICAgICB0aGlzLnBlc3QgPSB0aGlzLmNlc3Q7XG4gICAgICAgIHRoaXMuZWVzdCA9ICh0aGlzLmVtZWEgKiB0aGlzLmVlc3QpIC8gKHRoaXMuZW1lYSArIHRoaXMuZWVzdCk7XG4gICAgICAgIHJldHVybiB0aGlzLmNlc3Q7XG4gICAgfVxuXG4gICAgZ2V0RXN0aW1hdGUoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2VzdDtcbiAgICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgS2FsbWFuRmlsdGVyOyJdfQ==
//# sourceMappingURL=KalmanFilter.js.map
