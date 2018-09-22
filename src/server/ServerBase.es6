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

    /**
     *
     * @param pf
     * @returns {LargeClusterResponse}
     */
    largeCluster(pf: ParticleFilterResponse) {
        let km = new KMeans(2, pf.uniqueParticles);
        return new LargeClusterResponse(pf, km);
    }

    smallCluster(pf: LargeClusterResponse) {
        let km = new KMeans(2, pf.uniqueParticles.slice(0, 5));
        return new LargeClusterResponse(pf, km);
    }

    doubleCluster(pf: ParticleFilterResponse) {
        let km = new KMeans(2, pf.uniqueParticles);
        const largestCluster = km.getLargestClusterIndex();
        const clusters = km.getClusters();

        let best = [];
        for(let c of clusters) {
            best.push(
                c.slice(0, 10)
                    .map(a => a[2])
                    .reduce((a, b) => {
                        return a + b
                    })
            );
        }

        let p = clusters[best.indexOf(Math.max(...best))]
            .slice(0, 5)
            .map((i) => {
                return {x: i[0], y: i[1], weight: i[2]};
            });
        let km1 = new KMeans(2, p);
        return new LargeClusterResponse(pf, km1);
    }


}

export {ParticleFilterResponse, LargeClusterResponse, FinalResponse, ServerBase};