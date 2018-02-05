import math from 'mathjs';

export default class NdKalmanFilter {

    constructor(dimensions: Number) {
        this.cest = math.ones(dimensions);
        this.mea = null;
        this.kg = null;
        this.eest = math.ones(dimensions);
        this.emea = math.ones(dimensions);
    }

    addSample(m: Array) {
        this.mea = m;
        let eestPlusEmea = math.add(this.eest, this.emea);
        this.kg = math.dotDivide(this.eest, eestPlusEmea);

        let meaMinusPest = math.subtract(this.mea, this.pest);
        let kgTimesMea = math.dotMultiply(this.kg, meaMinusPest);
        this.cest = math.add(this.pest, kgTimesMea);
        this.pest = this.cest;

        let emeaPlusEest = math.add(this.emea, this.eest);
        let emeaTimesEest = math.dotMultiply(this.emea, this.eest);
        this.eest = math.dotDivide(emeaTimesEest, emeaPlusEest);

        return this.cest.valueOf();
    }
}