import WalkAnalyzer from "./WalkAnalyzer";
import KMeans from "../KMeans";
import Features from "../Features";
import ParticleFilter from "../ParticleFilter";
import SimpleLock from "./SimpleLock";
import File from 'fs';


export default class LocalWalkAnalyzer extends WalkAnalyzer {

    async run() {
        this.worker = {particles: {}, previousState: {}};
        this.previousState = {};

        let particleNumber = 600;
        let particleCutoff = 20; // not used anymore
        let alphaValue = 2;

        let allErrors = [];
        let allTimes = [];
        for(let i = 0; i < 5; i++) {
            let start = new Date().getTime();
            let error = await this.runLocalizer(particleNumber, particleCutoff, alphaValue);

            let length = new Date().getTime() - start;
            allErrors.push(error);
            console.log(" error: " + error + " time: " + length);
        }
        let averageError = allErrors.reduce((a, b) => a+b) / 5;
        console.log(" average error: " + averageError);

        this.writeData(averageError);
        process.exit(0);
    }

    writeData(averageError) {
        SimpleLock.aquire();
        let data = `${this.walkFileName}, ${this.interpolated}, ${averageError}\n`;
        File.appendFileSync("db/analysis.csv", data);
        SimpleLock.release();
    }

    async runLocalizer(particleNumber, particleCutoff, alphaValue) {

        const fp_id = this.walkData.fpId;
        const id = this.id;

        let estimates = [];

        for(let apIds of this.walkData.walk) {
            let data = {fp_id: fp_id, ap_ids: apIds};
            await this.db.createFeaturesCache(fp_id, this.interpolated)
                .then(() => this.moveParticles(data, id, particleNumber, particleCutoff, alphaValue))
                .then(this.makeKMeans)
                .then((args) => {
                        let [particles, unique, clusters, guess, allParticles] = args;
                        this.setPreviousState(id, guess);
                        estimates.push(guess);
                    }
                );
        }

        delete this.worker.particles[id];

        let error = this.compareResultsToActual(this.walkData.steps, estimates);

        return error;
    }

    setPreviousState(id, newState) {
        if(typeof(this.previousState[id]) !== "undefined") {
            let state = this.previousState[id];
            state.shift();
            state.push(newState);
            this.previousState[id] = state;
            return;
        }

        this.previousState[id] = [newState, newState];
    }

    moveParticles(data, id, particleNumber, particleCutoff, alphaValue) {
        let stateParticles = [];
        if (this.worker.particles[id] !== undefined) {
            stateParticles = this.worker.particles[id];
        }
        let previousState = [];
        if(this.worker.previousState[id] !== undefined) {
            previousState = this.worker.previousState[id];
        }
        let pf = new ParticleFilter(this.db, data.fp_id, particleNumber, particleCutoff, alphaValue);
        pf.setParticles(stateParticles);

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
        const guess = km.getCentroid(largestCluster);
        const clusters = km.getClusters();

        return [particles, unique, clusters, guess, allParticles];
    }
}