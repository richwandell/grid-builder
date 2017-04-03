import Db from './Db';

class ParticleFilter {

    constructor(db: Db, fp_id: string){
        this.fp_id = fp_id;
        this.db = db;
        this.particles = [];
        this.particleCoords = [];
        this.uniqueParticles = [];
        this.allParticles = this.db.getFeaturesCache(this.fp_id);
    }

    setParticles(particles){
        this.particles = particles;
    }

    getParticles(){
        return this.particles;
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

    move(features){
        if(this.particles.length === 0) this.initializeParticles();

        const featureKeys = Object.keys(features);
        const featureKeysLength = featureKeys.length;

        const particleLength = this.particles.length;

        for(let i = 0; i < particleLength; i++){
            let particle = this.particles[i];

            for(let j = 0; j < featureKeysLength; j++){
                let feature = featureKeys[j];
                let x_y = particle.x + "_" + particle.y;
                let testValue = this.db.getFeatureValue(this.fp_id, x_y, feature);
                if(testValue){
                    let featureValue = features[feature];
                    let diff = Math.abs(testValue - featureValue);
                    particle.weight += Math.pow(diff, 2);
                } else {
                    particle.weight += Math.pow(testValue, 2);
                }
            }
            particle.weight = Math.sqrt(particle.weight);
        }
        this.resample();
    }

    resample(){
        let goodX = [];
        let goodY = [];
        this.particles = this.particles.sort((a, b) => {
            if(a.weight >= b.weight){
                return 1;
            }else{
                return -1;
            }
        });
        const particleLength = this.particles.length;
        for(let i = 0; i < particleLength / 5; i++){
            let gx = this.particles[i].x;
            let gy = this.particles[i].y;
            if(goodX.indexOf(gx) === -1) {
                goodX.push(gx);

                let l = Math.max(0, gx - 1);
                let r = gx + 1;
                for(; l <= r; l++) {
                    if (goodX.indexOf(l) === -1){
                        goodX.push(l);
                    }
                }
            }

            if(goodY.indexOf(gy) === -1) {
                goodY.push(gy);
                let l = Math.max(0, gy - 1);
                let r = gy + 1;
                for(; l <= r; l++) {
                    if (goodY.indexOf(l) === -1){
                        goodY.push(l);
                    }
                }
            }
        }

        let newParticles = [];
        this.particleCoords = [];
        this.uniqueParticles = [];
        let usedXy = [];
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
                this.uniqueParticles.push(p);
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