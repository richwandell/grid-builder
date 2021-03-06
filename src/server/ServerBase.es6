import Features from "./Features";
import KMeans from "./KMeans";
import ParticleFilter from "./ParticleFilter";


class ParticleFilterResponse {
    constructor(particles, uniqueParticles, allParticles) {
        this.particles = particles;
        this.uniqueParticles = uniqueParticles;
        this.allParticles = allParticles;
    }
}

class LargeClusterResponse {
    constructor(pf: ParticleFilterResponse, km: KMeans) {
        this.particleFilterResponse = pf;
        const largestCluster = km.getLargestClusterIndex();
        const clusters = km.getClusters();

        this.clusters = clusters;
        this.largestCluster = clusters[largestCluster];
        this.guess = this.largestCluster[0];

        if(clusters.length > 1) {
            if(clusters[0].length > 0 && clusters[1].length > 0) {
                if(this.largestCluster[0].weight < clusters[0][0].weight
                    || this.largestCluster[0].weight < clusters[1][0].weight) {
                    debugger;
                }
            }
        }


        // let best = [];
        // for(let c of clusters) {
        //     if(c.length > 0) {
        //         best.push(
        //             c.map(a => a[2]).reduce((a, b) => a + b)
        //         );
        //     } else {
        //         best.push(-1);
        //     }
        // }
        // error: 0.46945099860763123 average std: 0.7207840273301789

        // this.guess = clusters[best.indexOf(Math.max(...best))][0];
    }
}



class FinalResponse {

    constructor(cl: LargeClusterResponse, km: KMeans = null) {
        this.particleFilterResponse = cl.particleFilterResponse;
        this.largeClusterResponse = cl;

        if(km !== null) {
            const largestCluster = km.getLargestClusterIndex();
            const clusters = km.getClusters();

            this.clusters = clusters;
            this.largestCluster = clusters[largestCluster];
            this.guess = clusters[largestCluster][0];
        } else {
            this.clusters = cl.clusters;
            this.largestCluster = cl.largestCluster;
            this.guess = cl.guess;
        }
    }

    get particles() {
        return this.particleFilterResponse.particles;
    }

    get unique() {
        return this.particleFilterResponse.uniqueParticles;
    }

    get all() {
        return this.particleFilterResponse.allParticles;
    }

    get largeClusters() {
        return this.largeClusterResponse.clusters;
    }
}

class ServerBase {

    constructor(worker) {
        this.worker = worker;
    }

    /**
     *
     * @param data
     * @param id
     * @param particleNumber
     * @param alphaValue
     * @returns {ParticleFilterResponse}
     */
    moveParticles(data, id, particleNumber, alphaValue) {
        let stateParticles = [];
        if (this.worker.particles[id] !== undefined) {
            stateParticles = this.worker.particles[id];
        }
        let previousState = [];
        if(this.worker.previousState[id] !== undefined) {
            previousState = this.worker.previousState[id];
        }
        let pf = new ParticleFilter(this.db, data.fp_id, particleNumber, alphaValue);
        pf.setParticles(stateParticles);
        if(typeof(this.worker.trackingLog) !== "undefined") {
            this.worker.trackingLog.debug(data.ap_ids);
        }

        const f = new Features();
        const features = f.makeFeatures(data.ap_ids);
        pf.move(features, previousState);
        const allParticles = pf.getParticles();
        this.worker.particles[id] = allParticles;

        const particles = pf.getParticleCoords();
        const unique = pf.getUniqueParticles();
        return new ParticleFilterResponse(particles, unique, allParticles);
    }

    pfOnly(pf: ParticleFilterResponse) {
        let guess = pf.uniqueParticles[0];
        return new FinalResponse({
            particleFilterResponse: pf,
            guess: [guess.x, guess.y],
            clusters: [],
            largestCluster: pf.uniqueParticles
        })
    }

    /**
     *
     * @param pf
     * @returns {LargeClusterResponse}
     */
    largeCluster(pf: ParticleFilterResponse) {
        let km = new KMeans(2, pf.uniqueParticles);
        return new FinalResponse(new LargeClusterResponse(pf, km));
    }

    smallCluster(pf: ParticleFilterResponse) {
        let km = new KMeans(2, pf.uniqueParticles.slice(0, 5));
        return new FinalResponse(new LargeClusterResponse(pf, km));
    }

    doubleCluster(pf: ParticleFilterResponse) {
        let km = new KMeans(2, pf.uniqueParticles);
        const clusters = km.getClusters();

        let best = [];
        for(let c of clusters) {
            best.push(
                c.slice(0, 20)
                    .map(a => a[2])
                    .reduce((a, b) => a + b)
            );
        }

        let p = clusters[best.indexOf(Math.max(...best))]
            .slice(0, 5)
            .map((i) => {
                return {x: i[0], y: i[1], weight: i[2]};
            });
        let km1 = new KMeans(2, p);
        return new FinalResponse(new LargeClusterResponse(pf, km), km1);
    }


}

export {ParticleFilterResponse, LargeClusterResponse, FinalResponse, ServerBase};