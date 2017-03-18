import Db from './Db';

class Knn {
    constructor(log, db, fp_id, ap_ids){
        this.log = log;
        this.db = db.getDatabase();
        this.fp_id = fp_id;
        this.makeFeatures(ap_ids);
    }

    makeFeatures(ap_ids){
        let features = {};
        ap_ids.forEach((row) => {
            ap_ids.forEach((row1) => {
                features[row.ap_id + row1.ap_id] = Math.abs(Number(row.value) - Number(row1.value));
            });
        });
        this.features = features;
    }

    getNeighbors(k, cb){
        let keys = Object.keys(this.features);
        let done = 0;
        let data = [];

        keys.forEach((key) => {
            this.db.all(Db.query_get_features.replace(":feature_value:", this.features[key]), [key, this.fp_id], (err, rows) => {
                data.push(rows);
                done++;
                if(done >= keys.length){
                    this.makeGuess(data, cb, k);
                }
            });
        });
    }

    makeGuess(data, cb, k){

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
        cb(knn.splice(0, k));
    }
}

export default Knn;