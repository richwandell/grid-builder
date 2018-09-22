import WalkAnalyzer from "./WalkAnalyzer";
import KMeans from "../KMeans";
import Features from "../Features";
import ParticleFilter from "../ParticleFilter";
import SimpleLock from "./SimpleLock";
import File from 'fs';
import NdKalmanFilter from "../NdKalmanFilter";
import math from 'mathjs';
import {FinalResponse, LargeClusterResponse} from "../ServerBase";


export default class LocalWalkAnalyzer extends WalkAnalyzer {

    async run() {
        this.previousState = {};

        let particleNumber = 600;
        let alphaValue = 2;

        let allErrors = [];
        let allStd = [];
        for(let i = 0; i < 5; i++) {
            let [error, std] = await this.runLocalizer(particleNumber, alphaValue);
            allErrors.push(error);
            allStd.push(std);
            console.log(" error: " + error + " std: " + std);
        }
        let averageError = allErrors.reduce((a, b) => a+b) / 5;
        let averageStd = allStd.reduce((a, b) => a+b) / 5;
        console.log(" average error: " + averageError + " average std: " + averageStd);

        this.writeData(averageError);
        process.exit(0);
    }

    writeData(averageError) {
        SimpleLock.aquire();
        let data = `${this.walkFileName}, ${this.interpolated}, ${averageError}\n`;
        File.appendFileSync("db/analysis.csv", data);
        SimpleLock.release();
    }

    async runLocalizer(particleNumber, alphaValue) {

        const fp_id = this.walkData.fpId;
        const id = this.id;

        let estimates = [];

        for(let apIds of this.walkData.walk) {
            let data = {fp_id: fp_id, ap_ids: apIds};
            await this.db.createFeaturesCache(fp_id, this.interpolated)
                .then(() => this.moveParticles(data, id, particleNumber, alphaValue))
                .then(this.doubleCluster)
                .then((lc: LargeClusterResponse) => {
                    return new FinalResponse(lc)
                })
                .then((fr: FinalResponse) => {
                    let guess = fr.guess;
                    let neighbors = fr.largestCluster.slice(0, 5)
                        .map((i) => {
                            return {x: i[0], y: i[1], weight: i[2]};
                        });

                    this.setPreviousState(id, guess);
                    estimates.push(guess);
                });
        }

        delete this.worker.particles[id];

        let [error, std] = this.compareResultsToActual(this.walkData.steps, estimates);

        return [error, std];
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
}