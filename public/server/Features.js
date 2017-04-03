"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Features = function () {
    function Features() {
        _classCallCheck(this, Features);
    }

    _createClass(Features, [{
        key: "makeFeatures",
        value: function makeFeatures(ap_ids) {
            var features = {};
            ap_ids.forEach(function (row) {
                ap_ids.forEach(function (row1) {
                    features[row.ap_id + row1.ap_id] = Math.abs(Number(row.value) - Number(row1.value));
                });
            });
            return features;
        }
    }]);

    return Features;
}();

exports.default = Features;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvRmVhdHVyZXMuZXM2Il0sIm5hbWVzIjpbIkZlYXR1cmVzIiwiYXBfaWRzIiwiZmVhdHVyZXMiLCJmb3JFYWNoIiwicm93Iiwicm93MSIsImFwX2lkIiwiTWF0aCIsImFicyIsIk51bWJlciIsInZhbHVlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0lBQU1BLFE7Ozs7Ozs7cUNBRVdDLE0sRUFBTztBQUNoQixnQkFBSUMsV0FBVyxFQUFmO0FBQ0FELG1CQUFPRSxPQUFQLENBQWUsVUFBQ0MsR0FBRCxFQUFTO0FBQ3BCSCx1QkFBT0UsT0FBUCxDQUFlLFVBQUNFLElBQUQsRUFBVTtBQUNyQkgsNkJBQVNFLElBQUlFLEtBQUosR0FBWUQsS0FBS0MsS0FBMUIsSUFBbUNDLEtBQUtDLEdBQUwsQ0FBU0MsT0FBT0wsSUFBSU0sS0FBWCxJQUFvQkQsT0FBT0osS0FBS0ssS0FBWixDQUE3QixDQUFuQztBQUNILGlCQUZEO0FBR0gsYUFKRDtBQUtBLG1CQUFPUixRQUFQO0FBQ0g7Ozs7OztrQkFHVUYsUSIsImZpbGUiOiJGZWF0dXJlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEZlYXR1cmVzIHtcblxuICAgIG1ha2VGZWF0dXJlcyhhcF9pZHMpe1xuICAgICAgICBsZXQgZmVhdHVyZXMgPSB7fTtcbiAgICAgICAgYXBfaWRzLmZvckVhY2goKHJvdykgPT4ge1xuICAgICAgICAgICAgYXBfaWRzLmZvckVhY2goKHJvdzEpID0+IHtcbiAgICAgICAgICAgICAgICBmZWF0dXJlc1tyb3cuYXBfaWQgKyByb3cxLmFwX2lkXSA9IE1hdGguYWJzKE51bWJlcihyb3cudmFsdWUpIC0gTnVtYmVyKHJvdzEudmFsdWUpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGZlYXR1cmVzO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRmVhdHVyZXM7Il19
//# sourceMappingURL=Features.js.map
