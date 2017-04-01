import Db from '../src/server/Db';
const fs = require('fs');

class Test {
    constructor(){
        let database = new Db({
            debug: () => {}
        });

        let db = database.getDatabase();

        let rows = fs.readFileSync("./1-28.csv", "utf8").split("\n");

        let features = {};

        let fp_id = 0;

        rows.forEach((row) => {
            row = row.split(",");
            if(typeof(row[1]) == "undefined") return;

            rows.forEach((row1) => {
                row1 = row1.split(",");
                if(typeof(row1[1]) == "undefined") return;
                fp_id = row[0];
                features[row[1] + row1[1]] = Math.abs(Number(row[4]) - Number(row1[4]));
            });
        });
        this.start = new Date().getTime();
        let data = [];
        let keys = Object.keys(features);
        let done = 0;

        keys.forEach((key) => {
            db.all(Db.query_get_features.replace(":feature_value:", features[key]), [key, fp_id], (err, rows) => {
                data.push(rows);
                done++;
                if(done >= keys.length){
                    db.close();
                    this.makeGuess(data);
                }
            });
        });
    }

    makeGuess(data){

        let distances = {};
        let knn = [];

        data.forEach((feature) => {
            if(feature.length == 0) return;

            feature.forEach((coord) => {
                if(typeof(distances[coord.x + "_" + coord.y]) == "undefined"){
                    distances[coord.x + "_" + coord.y] = [];
                }

                distances[coord.x + "_" + coord.y].push(Math.pow(coord.diff, 2));
            });
        });
        let keys = Object.keys(distances);
        keys.forEach((key) => {
            knn.push({
                x_y: key,
                distance: Math.sqrt(distances[key].reduce((a, b) => { return a+b; }))
            });
        });
        knn.sort((a, b) => { return a.distance > b.distance; });

        console.log(knn);
        this.end = new Date().getTime();
        console.log(this.end - this.start);
    }

}

//new Test();

class Test1{

    kmeans(c){
        let centroids = this.findCentroids(c);
        let newCE = this.findClusters(
            centroids,
            c.reduce((a, b) => { return a.concat(b); })
        );

        let new_error = newCE[0];
        let clusters = newCE[1];

        let same = true;
        for(let i = 0; i < new_error.length; i++){
            if(new_error[i] !== this.old_error[i]){
                same = false;
                this.old_error = new_error;
                break;
            }
        }
        if(same){
            return clusters;
        }else{
            return this.kmeans(clusters);
        }
    }

    constructor(){
        const success = JSON.parse('{"succes":true,"knn":[{"x_y":"8_2","x":8,"y":2,"distance":285.15278139022917},{"x_y":"0_20","x":0,"y":20,"distance":267.51499438540867},{"x_y":"1_20","x":1,"y":20,"distance":224.59007657700653},{"x_y":"2_17","x":2,"y":17,"distance":201.50943271573516},{"x_y":"0_17","x":0,"y":17,"distance":203.63129405777823}],"center":[3,16]}');

        let clusters = [
            success.knn.slice(0, 2)
                .map((n) => {return [n.x, n.y];}),
            success.knn.slice(2, 5)
                .map((n) => {return [n.x, n.y];})
        ];

        this.old_error = clusters.map(() => {return Infinity;});

        clusters = this.kmeans(clusters);

        console.log(clusters);
    }


    findCentroids(clusters){

        let centroids = [];

        for(let i = 0; i < clusters.length; i++){
            let clu = clusters[i];
            let x = 0;
            let y = 0;
            for(let j = 0; j < clu.length; j++){
                x += clu[j][0];
                y += clu[j][1];
            }
            let center = [x / clu.length, y / clu.length];
            centroids.push(center);
        }
        return centroids;
    }

    findClusters(centroids, dataset){

        let clusters = centroids.map((c) => { return []; });
        let new_error = centroids.map(() => {return 0;});
        for(let i = 0; i < dataset.length; i++){
            let dp = dataset[i];
            let closest = false;
            let closest_distance = Infinity;
            for(let j = 0; j < centroids.length; j++){
                let center = centroids[j];
                let distance = this.dist(center, dp);
                if(distance < closest_distance){
                    closest = j;
                    closest_distance = distance;
                }
            }
            new_error[closest] = Number(new_error[closest]) + Math.pow(closest_distance, 2);

            clusters[closest].push(dp);
        }
        return [new_error, clusters];
    }

    dist(a, b){
        let root = 0;
        for(let i = 0; i < a.length; i++){
            root += Math.pow((a[i] - b[i]), 2);
        }
        return Math.sqrt(root);
    }
}

