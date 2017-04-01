'use strict';

module.exports = {
    getServerIp: function getServerIp() {
        var os = require('os');
        var ifaces = os.networkInterfaces();
        var values = Object.keys(ifaces).map(function (name) {
            return ifaces[name];
        });
        values = [].concat.apply([], values).filter(function (val) {
            return val.family == 'IPv4' && val.internal == false;
        });

        return values.length ? values[0].address : '0.0.0.0';
    }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvVXRpbHMuZXM2Il0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydHMiLCJnZXRTZXJ2ZXJJcCIsIm9zIiwicmVxdWlyZSIsImlmYWNlcyIsIm5ldHdvcmtJbnRlcmZhY2VzIiwidmFsdWVzIiwiT2JqZWN0Iiwia2V5cyIsIm1hcCIsIm5hbWUiLCJjb25jYXQiLCJhcHBseSIsImZpbHRlciIsInZhbCIsImZhbWlseSIsImludGVybmFsIiwibGVuZ3RoIiwiYWRkcmVzcyJdLCJtYXBwaW5ncyI6Ijs7QUFBQUEsT0FBT0MsT0FBUCxHQUFpQjtBQUNiQyxpQkFBYSx1QkFBVztBQUNwQixZQUFJQyxLQUFLQyxRQUFRLElBQVIsQ0FBVDtBQUNBLFlBQUlDLFNBQVNGLEdBQUdHLGlCQUFILEVBQWI7QUFDQSxZQUFJQyxTQUFTQyxPQUFPQyxJQUFQLENBQVlKLE1BQVosRUFBb0JLLEdBQXBCLENBQXdCLFVBQVNDLElBQVQsRUFBZTtBQUNoRCxtQkFBT04sT0FBT00sSUFBUCxDQUFQO0FBQ0gsU0FGWSxDQUFiO0FBR0FKLGlCQUFTLEdBQUdLLE1BQUgsQ0FBVUMsS0FBVixDQUFnQixFQUFoQixFQUFvQk4sTUFBcEIsRUFBNEJPLE1BQTVCLENBQW1DLFVBQVNDLEdBQVQsRUFBYTtBQUNyRCxtQkFBT0EsSUFBSUMsTUFBSixJQUFjLE1BQWQsSUFBd0JELElBQUlFLFFBQUosSUFBZ0IsS0FBL0M7QUFDSCxTQUZRLENBQVQ7O0FBSUEsZUFBT1YsT0FBT1csTUFBUCxHQUFnQlgsT0FBTyxDQUFQLEVBQVVZLE9BQTFCLEdBQW9DLFNBQTNDO0FBQ0g7QUFaWSxDQUFqQiIsImZpbGUiOiJVdGlscy5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGdldFNlcnZlcklwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgbGV0IG9zID0gcmVxdWlyZSgnb3MnKTtcbiAgICAgICAgbGV0IGlmYWNlcyA9IG9zLm5ldHdvcmtJbnRlcmZhY2VzKCk7XG4gICAgICAgIGxldCB2YWx1ZXMgPSBPYmplY3Qua2V5cyhpZmFjZXMpLm1hcChmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gaWZhY2VzW25hbWVdO1xuICAgICAgICB9KTtcbiAgICAgICAgdmFsdWVzID0gW10uY29uY2F0LmFwcGx5KFtdLCB2YWx1ZXMpLmZpbHRlcihmdW5jdGlvbih2YWwpe1xuICAgICAgICAgICAgcmV0dXJuIHZhbC5mYW1pbHkgPT0gJ0lQdjQnICYmIHZhbC5pbnRlcm5hbCA9PSBmYWxzZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHZhbHVlcy5sZW5ndGggPyB2YWx1ZXNbMF0uYWRkcmVzcyA6ICcwLjAuMC4wJztcbiAgICB9XG59OyJdfQ==
//# sourceMappingURL=Utils.js.map
