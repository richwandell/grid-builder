import Db from '../src/server/Db';
import Knn from '../src/server/Knn';
import KMeans from '../src/server/KMeans';
const fs = require('fs');

class Test2{
    constructor(){
        debugger;
        const log = {debug: () => {}, log: () => {}};
        let database = new Db(log);

        let rows = JSON.parse(fs.readFileSync("./test/0-18.json", "utf8"));

        let knn = new Knn(log, database, '336c6582c283421c28479e8801e8edfa', rows);
        knn.getNeighbors(5, (knn) => {
            let cc = new KMeans(2, knn);
            let out = {
                succes: true,
                knn: knn,
                clusters: cc[0],
                centroids: cc[1]
            };

            console.log(out.knn);
            console.log("\n");
            console.log(out.clusters)
            console.log("\n");
            console.log(out.centroids);


            let largest = 0;

            out.clusters.forEach(function(cl) {
                if(cl.length > largest){
                    largest = cl.length;
                }
            });
            let best = Infinity;
            let bestCluster;
            out.clusters.forEach(function(cl){
                if(cl.length == largest) {
                    let totalDist = 0;
                    cl.forEach(function (i) {
                        totalDist += i[2]
                    });
                    if (totalDist < best) {
                        best = totalDist;
                        bestCluster = cl;
                    }
                }
            });
            console.log(bestCluster);
        });
    }
}

new Test2();