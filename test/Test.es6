import Db from './Db';
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

new Test();