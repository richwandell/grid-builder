module.exports = {
    getServerIp: function() {
        let os = require('os');
        let ifaces = os.networkInterfaces();
        let values = Object.keys(ifaces).map(function(name) {
            return ifaces[name];
        });
        values = [].concat.apply([], values).filter(function(val){
            return val.family == 'IPv4' && val.internal == false;
        });

        return values.length ? values[0].address : '0.0.0.0';
    }
};