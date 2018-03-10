import Db from './Db';

class ParticleFilter {

    constructor(db: Db, fp_id: string, particleNumber, particleCutoff, alphaValue){
        this.fp_id = fp_id;
        this.db = db;
        this.particles = [];
        this.particleCoords = [];
        this.uniqueParticles = [];
        this.allParticles = this.db.getFeaturesCache(this.fp_id);
        this.guess = [0,0];
        this.oldParticles = [];
        this.numParticles = particleNumber;
        this.particleCutoff = particleCutoff;
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
        if (Math.round(w) === 0) {
           w = Infinity;
        }
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

            for(let j = 0; j < featureKeysLength; j++){
                let feature = featureKeys[j];
                let testValue = this.db.getFeatureValue(this.fp_id, x_y, feature);
                if(testValue){
                    let featureValue = features[feature];
                    let diff = Math.abs(testValue - featureValue);
                    particle.weight += Math.pow(diff, 2);
                }
            }
            particle.weight = this.getParticleWeight(x_y, particle.weight);
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

    resample(){
        let goodX = [];
        let goodY = [];
        let usedXy = [];


        //Sort particles by weight
        this.particles = this.particles.sort((a, b) => {
            if(a.weight >= b.weight){
                return 1;
            }else{
                return -1;
            }
        });
        this.uniqueParticles = [];
        for(let i = 0; i < this.particleCutoff; i++){
            const old = this.particles[i];
            let gx = old.x;
            let gy = old.y;
            let key = gx + "_" + gy;
            if(usedXy.indexOf(key) === -1){
                this.uniqueParticles.push({
                    x: gx,
                    y: gy,
                    distance: old.weight,
                    weight: old.weight
                });
                usedXy.push(key);
            }
            if(goodX.indexOf(gx) === -1) {
                goodX.push(gx);
                let l, r;
                if(this.previousStateSame(0)) {
                    l = Math.max(0, gx - 2);
                    r = gx + 2;
                }else if(this.previousState[0][0] < this.previousState[1][0]) {
                    l = Math.max(0, gx - 1);
                    r = gx + 2;
                } else {
                    l = Math.max(0, gx - 2);
                    r = gx + 1;
                }

                l = Math.max(0, gx - this.alphaValue);
                r = gx + this.alphaValue;

                for(; l <= r; l++) {
                    if (goodX.indexOf(l) === -1){
                        goodX.push(l);
                    }
                }
            }

            if(goodY.indexOf(gy) === -1) {
                goodY.push(gy);
                let l, r;
                if(this.previousStateSame(1)) {
                    l = Math.max(0, gy - 2);
                    r = gy + 2;
                } else if(this.previousState[0][1] < this.previousState[1][1]){
                    l = Math.max(0, gy - 1);
                    r = gy + 2;
                } else {
                    l = Math.max(0, gy - 2);
                    r = gy + 1;
                }

                l = Math.max(0, gy - this.alphaValue);
                r = gy + this.alphaValue;

                for(; l <= r; l++) {
                    if (goodY.indexOf(l) === -1){
                        goodY.push(l);
                    }
                }
            }
        }

        let newParticles = [];
        this.particleCoords = [];
        usedXy = [];
        while (newParticles.length < this.particles.length) {
            let c_x = goodX[Math.floor(Math.random() * goodX.length)];
            let c_y = goodY[Math.floor(Math.random() * goodY.length)];
            let key = c_x + "_" + c_y;
            if(this.allParticles[key] === undefined){
                continue;
            }
            let p = {
                x: c_x,
                y: c_y,
                weight: 0
            };
            if(usedXy.indexOf(key) === -1){
                usedXy.push(key);
                this.particleCoords.push({
                    x: p.x,
                    y: p.y
                });
            }
            newParticles.push(p);
        }
        this.particles = newParticles;
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