const request = require('request');
const fs = require('fs');
const uuid = require('uuid');

export class WalkAnalyzer {

    constructor(db: Db, walkFile: string, outFile: string) {
        this.db = db;
        this.walkData = JSON.parse(fs.readFileSync(walkFile));
        this.steps = this.walkData.steps;
        this.walk = this.walkData.walk;
        this.fpId = this.walkData.fpId;
        this.outFile = outFile;
        this.index = 0;
        this.index1 = 0;
        this.index2 = 0;
        this.index3 = 0;
        this.guesses = [];
        this.experimentResults = [];

        this.id = uuid.v4();
        try {
            let oldUUID = fs.readFileSync(".uuid", "utf8");
            this.id = oldUUID;
        }catch(e){
            fs.writeFileSync(".uuid", this.id);
        }

        this.particleNumbers = [
           400, 400, 200, 200
        ];

        this.particleCutoff = [
            10
        ];

        this.alphaValues = [
            1, 1, 2, 2, 3, 3, 4, 4
        ];

        this.resetLocalizer().then(() => {
            this.requestLocalization();
        });

    }

    resetLocalizer() {
        return new Promise((resolve, reject) => {
            let data = {
                device_id: this.id,
                fp_id: this.fpId
            };
            request({
                url: 'http://localhost:8888/rest/resetLocalizer',
                json: true,
                method: "POST",
                body: data
            }, (error, res, body) => {
                if(body.success) {
                    resolve();
                } else {
                    reject();
                }
            });
        });
    }

    requestLocalization() {

        if(typeof(this.walk[this.index]) === "undefined") {
            this.finishALocalizer();
            return;
        }

        let data = {
            device_id: this.id,
            ap_ids: this.walk[this.index],
            fp_id: this.fpId,
            type: "COMPUTER",
            steps: this.steps,
            particleNumber: this.particleNumbers[this.index1],
            particleCutoff: this.particleCutoff[this.index2],
            alphaValue: this.alphaValues[this.index3]
        };
        request({
            url: 'http://localhost:8888/rest/localize',
            json: true,
            method: "POST",
            body: data
        }, (error, res, body) => {
            this.guesses[this.index] = body.guess;
            this.index++;
            // setTimeout(() => {
                this.requestLocalization();
            // }, 3000);
        });
    }

    finishALocalizer(){
        let error = this.compareResultsToActual(this.steps, this.guesses);
        this.experimentResults.push([
            this.particleNumbers[this.index1],
            this.particleCutoff[this.index2],
            this.alphaValues[this.index3],
            error
        ]);

        this.index1++;
        if(this.index1 >= this.particleNumbers.length) {
            this.finishAParticleNumber();
            return;
        }


        this.index = 0;
        this.guesses = [];

        this.resetLocalizer().then(() => {
            this.requestLocalization();
        });
    }

    finishAParticleNumber() {
        this.index = 0;
        this.guesses = [];
        this.index1 = 0;

        this.index2++;
        if(this.index2 >= this.particleCutoff.length) {
            this.finishAlphaValue();
            return;
        }


        this.resetLocalizer().then(() => {
            this.requestLocalization();
        });
    }

    finishAlphaValue() {
        this.index2 = 0;

        this.index3++;
        if(this.index3 >= this.alphaValues.length) {
            this.finishEverything();
        }

        this.resetLocalizer().then(() => {
            this.requestLocalization();
        });
    }

    finishEverything() {
        for(let r of this.experimentResults){
            console.log(r[0] + ", " + r[1] + ", " + r[2] + ", " + r[3]);
        }
        process.exit();
    }

    compareResultsToActual(actual, results) {
        let errors = [];
        let i = 0;
        for(let [x, y] of actual) {
            let [x1, y1] = results[i];
            let diff = Math.sqrt(Math.pow(x - x1, 2) + Math.pow(y - y1, 2));

            errors.push(diff);
            i++;
        }

        let averageError = errors.reduce((a, b) => a+b) / errors.length;
        console.log(this.index1 + " " + this.index2 + " " + this.index3 + " average error: " + averageError);

        return averageError;
    }
}