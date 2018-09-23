import WalkAnalyzer from "./WalkAnalyzer";

const request = require('request');

export default class RestWalkAnalyzer extends WalkAnalyzer {

    constructor(db: Db, walkFile: string, outFile: string) {
        super(db, walkFile, outFile);

        this.index = 0;
        this.index1 = 0;
        this.index2 = 0;
        this.index3 = 0;
        this.guesses = [];
        this.experimentResults = [];
        this.particleNumbers = [
            600, 600, 600, 600, 600
        ];
        // no longer used
        this.particleCutoff = [
            0
        ];

        this.alphaValues = [
            2
        ];
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
            //setTimeout(() => {
                this.requestLocalization();
            //}, 10);
        });
    }

    finishALocalizer(){
        let [error, std] = this.compareResultsToActual(this.steps, this.guesses);
        console.log(`${this.index1} ${this.index2} ${this.index3} average error: ${error} std: ${std}`);
        this.experimentResults.push([
            this.particleNumbers[this.index1],
            this.particleCutoff[this.index2],
            this.alphaValues[this.index3],
            error,
            std
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
        let error = this.experimentResults.map((i) => i[3]).reduce((a, b) => a+b) / this.experimentResults.length;
        let std = this.experimentResults.map((i) => i[4]).reduce((a, b) => a+b) / this.experimentResults.length;
        console.log(`average error: ${error} av std: ${std}`);
        process.exit();
    }



    run() {
        this.resetLocalizer().then(() => {
            this.requestLocalization();
        });
    }
}