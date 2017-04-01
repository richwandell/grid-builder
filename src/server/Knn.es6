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
        let knn = {};
        keys.forEach((key) => {
            this.db.all(Db.query_get_features.replace(":feature_value:", this.features[key]), [key, this.fp_id], (err, rows) => {

                if(typeof(rows) != "undefined" && rows.length != 0){

                    rows.forEach((coord) => {
                        let key = coord.x + "_" + coord.y;
                        if(typeof(knn[key]) == "undefined"){
                            knn[key] = {
                                x_y: coord.x + "_" + coord.y,
                                x: Number(coord.x),
                                y: Number(coord.y),
                                distance: 0
                            }
                        }
                        knn[key].distance += Math.pow(coord.diff, 2);
                    });
                }
                done++;
                if(done >= keys.length){
                    this.makeGuess(knn, cb, k);
                }
            });
        });
    }

    makeGuess(knn, cb, k){
        knn = Object
            .keys(knn)
            .map((key) => {
                let obj = knn[key];
                obj.distance = Math.sqrt(obj.distance);
                return knn[key];
            });
        knn = knn.sort((a, b) => {
            if(a.distance > b.distance){
                return 1;
            }else if(b.distance > a.distance){
                return -1;
            }
            return 0;
        });
        knn = knn.splice(0, k);
        cb(knn);
    }
}

export default Knn;