class KalmanFilter {

    constructor(pest){
        this.cest = 0;
        this.pest = pest;
        this.mea = 0;
        this.kg = 0;
        this.eest = 1;
        this.emea = 1;
    }

    addSample(m){
        if(m === 0) return;
        this.mea = m;
        this.kg = this.eest / (this.eest + this.emea);
        this.cest = this.pest + this.kg * (this.mea - this.pest);
        this.pest = this.cest;
        this.eest = (this.emea * this.eest) / (this.emea + this.eest);
        return this.cest;
    }

    getEstimate(){
        return this.cest;
    }

}

export default KalmanFilter;