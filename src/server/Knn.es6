import Db from './Db';

class Knn {
    constructor(log, db, fp_id, ap_ids){
        this.log = log;
        this.db = db.getDatabase();
        this.fp_id = fp_id;
        this.features = this.makeFeatures(ap_ids);
    }

    makeFeatures(ap_ids){
        let features = {};
        ap_ids.forEach((row) => {
            ap_ids.forEach((row1) => {
                features[row.ap_id + row1.ap_id] = Math.abs(Number(row.value) - Number(row1.value));
            });
        });
        return features;
    }

    getNeighbors(k, cb){
        let keys = Object.keys(this.features);
        let done = 0;
        let knn = [];
        keys.forEach((key) => {
            this.db.all(Db.query_get_features.replace(":feature_value:", this.features[key]), [key, this.fp_id], (err, rows) => {
                if(rows.length != 0){
                    let nei = null;
                    rows.forEach((coord) => {
                        if(nei == null){
                            nei = {
                                x_y: coord.x + "_" + coord.y,
                                x: Number(coord.x),
                                y: Number(coord.y),
                                distance: 0
                            }
                        }
                        nei.distance += Math.pow(coord.diff, 2);
                    });
                    nei.distance = Math.sqrt(nei.distance);
                    knn.push(nei);
                }
                done++;
                if(done >= keys.length){
                    this.makeGuess(knn, cb, k);
                }
            });
        });
    }

    makeGuess(knn, cb, k){
        knn.sort((a, b) => { return a.distance > b.distance; });
        knn = knn.splice(0, k);
        cb(knn);
    }
}

export default Knn;