'use strict';

var _Db = require('../src/server/Db');

var _Db2 = _interopRequireDefault(_Db);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require('fs');

var Test2 = function Test2() {
    _classCallCheck(this, Test2);

    var database = new _Db2.default({
        debug: function debug() {}
    });

    var db = database.getDatabase();
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlRlc3QyLmVzNiJdLCJuYW1lcyI6WyJmcyIsInJlcXVpcmUiLCJUZXN0MiIsImRhdGFiYXNlIiwiZGVidWciLCJkYiIsImdldERhdGFiYXNlIl0sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7OztBQUNBLElBQU1BLEtBQUtDLFFBQVEsSUFBUixDQUFYOztJQUVNQyxLLEdBQ0YsaUJBQWE7QUFBQTs7QUFDVCxRQUFJQyxXQUFXLGlCQUFPO0FBQ2xCQyxlQUFPLGlCQUFNLENBQUU7QUFERyxLQUFQLENBQWY7O0FBSUEsUUFBSUMsS0FBS0YsU0FBU0csV0FBVCxFQUFUO0FBQ0gsQyIsImZpbGUiOiJUZXN0Mi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBEYiBmcm9tICcuLi9zcmMvc2VydmVyL0RiJztcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcblxuY2xhc3MgVGVzdDJ7XG4gICAgY29uc3RydWN0b3IoKXtcbiAgICAgICAgbGV0IGRhdGFiYXNlID0gbmV3IERiKHtcbiAgICAgICAgICAgIGRlYnVnOiAoKSA9PiB7fVxuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgZGIgPSBkYXRhYmFzZS5nZXREYXRhYmFzZSgpO1xuICAgIH1cbn0iXX0=
//# sourceMappingURL=Test2.js.map
