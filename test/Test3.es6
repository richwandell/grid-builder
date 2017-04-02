import Db from '../public/server/Db';
import Knn from '../public/server/Knn';
import KMeans from '../public/server/KMeans';
const scanner = require('node-wifi-scanner');
const os = require('os');

const ifaces = os.networkInterfaces();
console.log(ifaces);

scanner.scan((err, networks) => {
    if (err) {
        console.error(err);
        return;
    }

    console.log(networks);

    const log = {debug: () => {}, log: () => {}};
    const database = new Db(log);
    const rows = networks.map((net) => {
        return {ap_id: net.mac, value: net.rssi};
    });

    let knn = new Knn(log, database, '336c6582c283421c28479e8801e8edfa', rows);
    knn.getNeighbors(5, (knn) => {
        let km = new KMeans(2, knn);
        const largestCluster = km.getLargestClusterIndex();
        const guess = km.getCentroid(largestCluster);

        console.log(guess);
    });
});