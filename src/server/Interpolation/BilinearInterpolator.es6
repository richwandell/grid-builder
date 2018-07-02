import Interpolator from "./Interpolator";

export default class BilinearInterpolator extends Interpolator {

    fakeFeatures() {
        this.allFeatures = ['a', 'b', 'c', 'd'];
        this.featuresCache = {
            '0_0': {'a': 0, 'b': 1, 'c': 2, 'd': 3},
            '1_0': {'a': 1, 'b': 2, 'c': 3, 'd': 4},
            '3_0': {'a': 1, 'b': 2, 'c': 3, 'd': 4},

            '0_1': {'b': 1},
            '1_1': {'a': 2, 'c': 3, 'd': 4},
            '2_1': {'a': 1, 'b': 2, 'c': 3, 'd': 4},
            '3_1': {'a': 1, 'b': 2, 'c': 3, 'd': 4},

            '0_2': {'a': 0, 'b': 2, 'c': 3, 'd': 4},
            '2_2': {'a': 1, 'c': 3, 'd': 4},
            '3_2': {'a': 1, 'c': 3, 'd': 4},
            '4_2': {'b': 6},

            '0_3': {'a': 1, 'b': 1, 'c': 3, 'd': 4},
            '1_3': {'a': 2, 'b': 3, 'c': 3, 'd': 4},
            '2_3': {'a': 1, 'c': 3, 'd': 4},
            '7_3': {'b': 10},

            '0_5': {'a': 2, 'b': 3, 'c': 4, 'd': 5},
            '1_5': {'a': 3, 'b': 4, 'c': 3, 'd': 4},
            '2_5': {'a': 1, 'b': 2, 'c': 3, 'd': 4},
            '3_5': {'a': 1, 'b': 2, 'c': 3, 'd': 4},
        };
        this.maxX = 7;
        this.maxY = 5;
    }

    int(y1, y2, x, x1, x2) {
        let x2mx = x2 - x;
        let x2mx1 = x2 - x1;
        let xmx1 = x - x1;

        let l = ((x2mx / x2mx1) * y1);
        let r = ((xmx1 / x2mx1) * y2);
        let v = l + r;

        return v;
    }

    interpolate() {
        // this.fakeFeatures();

        //go through each feature
        for(let feature of this.allFeatures) {
            let ints = [];
            for (let r = 0; r < this.maxY; r++) {
                for (let c = 0; c < this.maxX; c++) {
                    // go through each coordinate
                    let coord = c + "_" + r;

                    //check if this coordinate has this feature
                    if (
                        this.featuresCache[coord] === undefined
                        || this.featuresCache[coord][feature] === undefined
                    ) {
                        let [int1, rowStart] = this.getUpperValues(feature, r, c);
                        let [int2, rowEnd] = this.getLowerValues(feature, r, c);
                        let int = null;

                        if(int1 !== null && int2 !== null) {
                            int = this.int(int1, int2, r, rowStart, rowEnd);
                        }

                        if(int !== null) {
                            ints.push([coord, feature, int]);
                        }
                    }
                }
            }
            for(let int of ints) {
                if(this.featuresCache[int[0]] === undefined) {
                    let tmp = {};
                    tmp[int[1]] = int[2];
                    this.featuresCache[int[0]] = tmp;
                } else {
                    this.featuresCache[int[0]][int[1]] = int[2];
                }
            }
        }
        return this.featuresCache;
    }

    getUpperValues(feature, rowStart, c) {
        if(rowStart === 0) {
            rowStart = 1;
        }
        for(let row = rowStart - 1; row >= 0; row--) {
            if(
                typeof(this.featuresCache[c + "_" + row]) !== "undefined"
                && typeof(this.featuresCache[c + "_" + row][feature]) !== "undefined") {
                return [this.featuresCache[c + "_" + row][feature], row];
            }
            let [lv, start] = this.getUpperLeft(feature, row, c);
            let [rv, end] = this.getUpperRight(feature, row, c);

            if(lv !== null && rv !== null) {
                let int = this.int(lv, rv, c, start, end);
                return [int, row];
            }
        }
        return [null, null];
    }

    getLowerValues(feature, rowStart, c) {
        for(let row = rowStart + 1; row < this.maxY; row++) {
            if(
                typeof(this.featuresCache[c + "_" + row]) !== "undefined"
                && typeof(this.featuresCache[c + "_" + row][feature]) !== "undefined") {
                return [this.featuresCache[c + "_" + row][feature], row];
            }
            let [lv, start] = this.getUpperLeft(feature, row, c);
            let [rv, end] = this.getUpperRight(feature, row, c);

            if(lv !== null && rv !== null) {
                let int = this.int(lv, rv, c, start, end);
                return [int, row];
            }
        }
        return [null, null];
    }

    getUpperLeft(feature, r, c, noRight = false) {
        for(let col = c - 1; col >= 0; col--) {
            let key = col + "_" + r;
            if(this.featuresCache[key] !== undefined) {
                if(this.featuresCache[key][feature] !== undefined) {
                    return [this.featuresCache[key][feature], col];
                }
            }
        }
        if(noRight) return [null, null];

        let [v, col] = this.getUpperRight(feature, r, c, true);
        return [v, 0];
    }

    getUpperRight(feature, r, c, noLeft = false) {
        for(let col = c + 1; col <= this.maxX; col++) {
            let key = col + "_" + r;
            if(this.featuresCache[key] !== undefined) {
                if(this.featuresCache[key][feature] !== undefined) {
                    return [this.featuresCache[key][feature], col];
                }
            }
        }
        if(noLeft) return [null, null];

        let [v, col] = this.getUpperLeft(feature, r, c, true);
        return [v, this.maxX];
    }
}