import WalkAnalyzer from "./WalkAnalyzer";
import KMeans from "../KMeans";
import Features from "../Features";
import ParticleFilter from "../ParticleFilter";

// average error: 0.4163162231961564 time: 3275
// average error: 0.5649689967735987 time: 2698
// average error: 0.31530096874093533 time: 2676
// average error: 0.5858899409745596 time: 2700
// average error: 0.3658085959685459 time: 2687
// 0.4496569451307592

// average error: 0.371936198656182 time: 30620
// average error: 0.4813824523078241 time: 2166
// average error: 0.3362219129418963 time: 2151
// average error: 0.3362219129418963 time: 2160
// average error: 0.44566816659353836 time: 2189
// 0.39428612868826746

// average error: 1.855431893886392 time: 5833
// average error: 1.846465687944609 time: 4103
// average error: 1.5848161928280775 time: 4105
// average error: 1.533546256677229 time: 4087
// average error: 1.7954307331266939 time: 4080
// 1.7231381528926004


// average error: 1.6395651209706374 time: 5650
// average error: 1.6276399997630664 time: 4728
// average error: 1.6838911837638917 time: 4752
// average error: 1.9373637485540904 time: 4694
// average error: 1.6544484646639004 time: 4862
// 1.708581703543117

// error: 1.2810943400204517 time: 4813
// error: 1.2810943400204517 time: 3495
// error: 1.2810943400204517 time: 3506
// error: 1.2810943400204517 time: 3514
// error: 1.2810943400204517 time: 3499
// average error: 1.2810943400204517

// error: 1.2243561660562468 time: 5123
// error: 1.1254095684805432 time: 4629
// error: 1.1198486773895115 time: 4630
// error: 1.0896952827662574 time: 4640
// error: 1.274297081687253 time: 4650
// average error: 1.1667213552759625


export default class LocalWalkAnalyzer extends WalkAnalyzer {

    async run() {
        this.worker = {particles: {}, previousState: {}};
        this.previousState = {};

        let particleNumber = 600;
        let particleCutoff = 20;
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
        process.exit(0);
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