'use strict';

var _Db = require('./Db');

var _Db2 = _interopRequireDefault(_Db);

var _Log = require('./Log');

var _Log2 = _interopRequireDefault(_Log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var pjson = require('../../package.json');

var log = new _Log2.default({
    logfolder: pjson.builder_log_folder,
    filename: "rest.log",
    filesize: 5000000,
    numfiles: 3
});

var db = new _Db2.default(log, pjson.builder_db_name);

db.reindex();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvUmVJbmRleC5lczYiXSwibmFtZXMiOlsicGpzb24iLCJyZXF1aXJlIiwibG9nIiwibG9nZm9sZGVyIiwiYnVpbGRlcl9sb2dfZm9sZGVyIiwiZmlsZW5hbWUiLCJmaWxlc2l6ZSIsIm51bWZpbGVzIiwiZGIiLCJidWlsZGVyX2RiX25hbWUiLCJyZWluZGV4Il0sIm1hcHBpbmdzIjoiOztBQUFBOzs7O0FBQ0E7Ozs7OztBQUVBLElBQU1BLFFBQVFDLFFBQVEsb0JBQVIsQ0FBZDs7QUFHQSxJQUFNQyxNQUFNLGtCQUFXO0FBQ25CQyxlQUFXSCxNQUFNSSxrQkFERTtBQUVuQkMsY0FBVSxVQUZTO0FBR25CQyxjQUFVLE9BSFM7QUFJbkJDLGNBQVU7QUFKUyxDQUFYLENBQVo7O0FBT0EsSUFBTUMsS0FBSyxpQkFBT04sR0FBUCxFQUFZRixNQUFNUyxlQUFsQixDQUFYOztBQUVBRCxHQUFHRSxPQUFIIiwiZmlsZSI6IlJlSW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRGIgZnJvbSAnLi9EYic7XG5pbXBvcnQgTG9nZ2VyIGZyb20gJy4vTG9nJztcblxuY29uc3QgcGpzb24gPSByZXF1aXJlKCcuLi8uLi9wYWNrYWdlLmpzb24nKTtcblxuXG5jb25zdCBsb2cgPSBuZXcgTG9nZ2VyKHtcbiAgICBsb2dmb2xkZXI6IHBqc29uLmJ1aWxkZXJfbG9nX2ZvbGRlcixcbiAgICBmaWxlbmFtZTogXCJyZXN0LmxvZ1wiLFxuICAgIGZpbGVzaXplOiA1MDAwMDAwLFxuICAgIG51bWZpbGVzOiAzXG59KTtcblxuY29uc3QgZGIgPSBuZXcgRGIobG9nLCBwanNvbi5idWlsZGVyX2RiX25hbWUpO1xuXG5kYi5yZWluZGV4KCk7Il19
//# sourceMappingURL=ReIndex.js.map
