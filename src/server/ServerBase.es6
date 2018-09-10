import Features from "./Features";
import KMeans from "./KMeans";
import ParticleFilter from "./ParticleFilter";

export default class ServerBase {

    constructor(worker) {
        this.worker = worker;
    }

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
        return [particles, unique, allParticles]
    }

    makeKMeans(args) {
        let [particles, unique, allParticles] = args;
        let km = new KMeans(2, unique.slice(0, 5));
        const largestCluster = km.getLargestClusterIndex();
        // const guess = km.getCentroid(largestCluster);
        const clusters = km.getClusters();
        const guess = clusters[largestCluster][0];

        return [particles, unique, allParticles, clusters, guess];
    }
}