import Db from './Db';
import csim from 'compute-cosine-similarity';

class ParticleFilter {

    constructor(db: Db, fp_id: string, particleNumber, alphaValue = 1){
        this.fp_id = fp_id;
        this.db = db;
        this.particles = [];
        this.particleCoords = [];
        this.uniqueParticles = [];
        this.allParticles = this.db.getFeaturesCache(this.fp_id);
        this.guess = [0,0];
        this.oldParticles = [];
        this.numParticles = particleNumber;
        this.alphaValue = alphaValue;
    }

    setParticles(particles){
        this.particles = particles;
        this.allParticles = this.db.getFeaturesCache(this.fp_id);
    }

    getParticles(){
        return this.particles;
    }

    getOldParticles(){
        return this.oldParticles;
    }

    initializeParticles(){
        this.allParticles = this.db.getFeaturesCache(this.fp_id);
        let newParticles = [];
        // Make a list of possible coordinates for particles
        let possibleParticleKeys = Object.keys(this.allParticles);
        possibleParticleKeys.splice(possibleParticleKeys.indexOf("max_x"), 1);
        possibleParticleKeys.splice(possibleParticleKeys.indexOf("max_y"), 1);
        while (newParticles.length < this.numParticles) {
            let key = possibleParticleKeys[Math.floor(Math.random() * possibleParticleKeys.length)];
            let [x, y] = key.split("_");

            if(this.allParticles[key] === undefined || isNaN(Number(x)) || isNaN(Number(y))){
                continue;
            }
            let p = {
                x: Number(x),
                y: Number(y),
                weight: 0
            };
            newParticles.push(p);
        }
        this.particles = newParticles;
    }

    getParticleWeight(coord, weight){
        let w = Math.sqrt(weight);
        return w;
    }

    move(features, previousState = []){
        if(this.particles.length === 0) this.initializeParticles();
        this.oldParticles = [];
        this.previousState = previousState;
        const featureKeys = Object.keys(features);
        const featureKeysLength = featureKeys.length;

        const particleLength = this.particles.length;
        for(let i = 0; i < particleLength; i++){
            let particle = this.particles[i];
            let x_y = particle.x + "_" + particle.y;

            let particleValues = [];
            let featureValues = [];
            for(let j = 0; j < featureKeysLength; j++){
                let feature = featureKeys[j];
                let testValue = this.db.getFeatureValue(this.fp_id, x_y, feature);
                let featureValue = features[feature];

                if(testValue !== false) {
                    particleValues.push(testValue);
                    featureValues.push(featureValue);
                }
            }

            let similarity = csim(particleValues, featureValues);
            if(isNaN(similarity)){
                similarity = 0;
            }
            particle.weight = similarity;
            this.oldParticles.push({x: particle.x, y: particle.y, weight: particle.weight});
        }

        this.resample();
    }

    previousStateSame(xOrY) {
        if(typeof(this.previousState[0]) === "undefined") {
            return true;
        }
        if(typeof(this.previousState[0][0]) === "undefined"){
            return true;
        }
        if(typeof(this.previousState[1][0]) === "undefined"){
            return true;
        }
        if(typeof(this.previousState[1][1]) === "undefined"){
            return true;
        }
        if(xOrY === 0 && this.previousState[0][0] === this.previousState[1][0]){
            return true;
        }
        if(xOrY === 1 && this.previousState[0][1] === this.previousState[1][1]){
            return true;
        }
        return false;
    }

    resample() {
        //Sort particles by weight
        this.particles = this.particles.sort((a, b) => {
            if(a.weight >= b.weight){
                return -1;
            }else{
                return 1;
            }
        });

        let maxWeight = this.particles[0].weight;
        let minWeight = this.particles[this.particles.length - 1].weight;
        if(minWeight === maxWeight) {
            minWeight = 0;
        }

        let particleNorm = (w) =>  (w - minWeight) / (maxWeight - minWeight);

        this.uniqueParticles = [];
        let usedXy = [];
        let resamplingList = [];
        for(let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            const numKeep = Math.round(particleNorm(particle.weight) * 10);

            for(let j = 0; j < numKeep; j++) {
                for (let x = particle.x - this.alphaValue; x <= particle.x + this.alphaValue; x++) {
                    for (let y = particle.y - this.alphaValue; y <= particle.y + this.alphaValue; y++) {
                        let key = `${x}_${y}`;
                        if (this.allParticles[key] === undefined) {
                            resamplingList.push([particle.x, particle.y]);
                            continue;
                        }

                        resamplingList.push([x, y]);
                    }
                }
            }

            let key = `${particle.x}_${particle.y}`;
            if(usedXy.indexOf(key) === -1) {
                this.uniqueParticles.push({
                    x: particle.x,
                    y: particle.y,
                    distance: particle.weight,
                    weight: particle.weight
                });
                usedXy.push(key);
            }
        }

        if(resamplingList.length === 0) {
            return;
        }

        let newParticles = [];
        usedXy = [];
        while (newParticles.length < this.numParticles) {
            let coord = resamplingList[Math.floor(Math.random() * resamplingList.length)];

            let p = {
                x: coord[0],
                y: coord[1],
                weight: 0
            };
            let key = `${coord[0]}_${coord[1]}`;
            if(usedXy.indexOf(key) === -1){
                usedXy.push(key);
                this.particleCoords.push({
                    x: p.x,
                    y: p.y
                });
            }
            newParticles.push(p);
        }
        // this.particles = newParticles;
    }

    getParticleCoords(){
        return this.particleCoords;
    }

    getParticleKeys(){
        let p = {};
        const particleLength = this.particles.length;

        for(let i = 0; i < particleLength; i++){
            let key = this.particles[i].x + "_" + this.particles[i].y;
            p[key] = 1;
        }
        return p;
    }

    getUniqueParticles(){
        return this.uniqueParticles;
    }

}

export default ParticleFilter;