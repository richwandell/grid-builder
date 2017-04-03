import Db from './Db';
import Log from './Log';
import Features from './Features';

class Knn  {

    constructor(db: Db, fp_id: string){
        this.db = db;
        this.fp_id = fp_id;
    }

    getNeighbors(features, points, k, cb){
        this.features = features;
        const cache = points;

        const featureKeys = Object.keys(this.features);
        const featureKeysLength = featureKeys.length;
        const coords = Object.keys(cache);
        const coordsLength = coords.length;

        let knn = {};

        for(let i = 0; i < coordsLength; i++){
            let coord = coords[i];
            if(knn[coord] === undefined){
                let [x, y] = coord.split("_");
                knn[coord] = {
                    x_y: coord,
                    x: Number(x),
                    y: Number(y),
                    distance: 0
                };
            }
            for(let j = 0; j < featureKeysLength; j++){
                let feature = featureKeys[j];
                let testValue = this.db.getFeatureValue(this.fp_id, coord, feature);
                if(testValue){
                    knn[coord].distance += Math.pow(Math.abs(testValue - this.features[feature]), 2);
                }
            }
        }

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