import Db from '../src/server/Db';
import KMeans from '../src/server/KMeans';
import ParticleFilter from '../src/server/ParticleFilter';
import Features from '../src/server/Features';
const fs = require('fs');


class Test5 {
    constructor() {
        this.singleIterations = 0;
        this.maxIterations = 5;
        this.singleParticles = {};
        this.multiParticles = [];
        this.log = {
            debug: () => {},
            log: () => {}
        };
        this.db = new Db(this.log);

        let rows = fs.readFileSync("./test/tracking.js", "utf8").split("\n");
        this.allData = rows.map((r) => {
            return JSON.parse(r);
        });
        this.singleResults = this.allData.map((r) => {
            return [];
        });
        this.multiResults = [];
        // this.runSingleLocalizer();
        this.runMultiLocalizer();
    }

    runMultiLocalizer(i = 0) {
        if (i < this.allData.length) {
            const id = i;
            const fp_id = '336c6582c283421c28479e8801e8edfa';
            this.localize(i, fp_id, this.allData[i], false)
                .then((i) => {
                    console.log(id, this.multiResults);
                    this.runMultiLocalizer(i + 1)
                });
        }
    }

    runSingleLocalizer(i = 0) {
        if (i < this.allData.length) {
            const id = i;
            const fp_id = '336c6582c283421c28479e8801e8edfa';
            this.localize(id, fp_id, this.allData[i], true)
                .then((i) => {
                    console.log(id, this.singleResults[id]);
                    this.runSingleLocalizer(i + 1)
                });
        } else if (this.singleIterations < this.maxIterations) {
            this.singleIterations++;
            this.runSingleLocalizer();
        }
    }


    localize(id, fp_id, ap_ids, single) {
        return new Promise((resolve, reject) => {
            this.db.createFeaturesCache(fp_id)
                .then(() => {

                    let stateParticles = [];
                    if (single) {
                        if (this.singleParticles[id] !== undefined) {
                            stateParticles = this.singleParticles[id];
                        }
                    } else {
                        if (this.multiParticles.length > 0) {
                            stateParticles = this.multiParticles;
                        }
                    }
                    let pf = new ParticleFilter(this.db, fp_id);
                    pf.setParticles(stateParticles);

                    const f = new Features();
                    const features = f.makeFeatures(ap_ids);
                    pf.move(features);
                    if (single) {
                        this.singleParticles[id] = pf.getParticles();
                    } else {
                        this.multiParticles = pf.getParticles();
                    }

                    const particles = pf.getParticleCoords();
                    const unique = pf.getUniqueParticles();

                    let km = new KMeans(2, unique.slice(0, 5));
                    const largestCluster = km.getLargestClusterIndex();
                    const guess = km.getCentroid(largestCluster);


                    if (single) {
                        this.singleResults[id].push(guess);
                    } else {
                        this.multiResults.push(guess);
                    }



                    resolve(id);
                });
        });
    }
}

new Test5();


