import Db from './Db';

class ParticleFilter {

    constructor(db: Db, fp_id: string){
        this.fp_id = fp_id;
        this.db = db;
        this.particles = [];
        this.particleCoords = [];
        this.uniqueParticles = [];
        this.allParticles = this.db.getFeaturesCache(this.fp_id);
        this.guess = [0,0];
        this.oldParticles = [];
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
        const keys = Object.keys(this.allParticles);
        const keyLength = keys.length;
        let maxX = 0;
        let maxY = 0;
        for(let i = 0; i < keyLength; i++){
            let [x, y] = keys[i].split("_");
            [x, y] = [Number(x), Number(y)];

            if(x > maxX) maxX = x;
            if(y > maxY) maxY = y;
            this.particles.push({
                x: x,
                y: y,
                weight: 0
            });
        }
        this.maxX = maxX;
        this.maxY = maxY;
    }

    getParticleWeight(coord, weight){
        return Math.sqrt(weight);
        const featureNumber = this.db.getFeatureNumber(this.fp_id, coord);
        let w = Math.sqrt(weight);
        return w / featureNumber;
    }

    move(features){
        if(this.particles.length === 0) this.initializeParticles();
        this.oldParticles = [];
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
                } else {
                    particle.weight += Math.pow(testValue, 2);
                }
            }
            particle.weight = this.getParticleWeight(x_y, particle.weight);
            this.oldParticles.push({x: particle.x, y: particle.y, weight: particle.weight});
        }
        this.resample();
    }

    resample(){
        let goodX = [];
        let goodY = [];
        let usedXy = [];

        this.particles = this.particles.sort((a, b) => {
            if(a.weight >= b.weight){
                return 1;
            }else{
                return -1;
            }
        });
        this.uniqueParticles = [];
        const particleLength = this.particles.length;
        for(let i = 0; i < particleLength / 5; i++){
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

                let l = Math.max(0, gx - 2);
                let r = gx + 2;
                for(; l <= r; l++) {
                    if (goodX.indexOf(l) === -1){
                        goodX.push(l);
                    }
                }
            }

            if(goodY.indexOf(gy) === -1) {
                goodY.push(gy);
                let l = Math.max(0, gy - 2);
                let r = gy + 2;
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
        while (newParticles.length < particleLength) {
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