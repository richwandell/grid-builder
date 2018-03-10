const fs = require('fs');

export class WalkGenerator {

    constructor(db: Db, fpId: string, inputFile: string, outputFile: string) {
        this.fpId = fpId;
        this.steps = JSON.parse(fs.readFileSync(inputFile));
        this.outputFile = outputFile;
        this.walk = [];
        this.finished = 0;

        let step = 0;
        for(let [x, y] of this.steps) {
            this.walk.push([]);

            db.getLatestScanResults(fpId, x, y, step)
                .then(([res, step]) => this.generateValue(res, step));
            step++;
        }
    }

    generateValue(records, step) {
        for(let record of records) {
            let values = JSON.parse(record.orig_values);
            values = values.filter((val) => val > 0 || val < 0);
            let value = values[Math.floor(Math.random() * values.length)];
            this.walk[step].push({
                ap_id: record.ap_id,
                value: value
            });
        }
        this.finished++;
        if(this.finished >= this.walk.length) {
            this.done();
        }
    }

    done() {
        let outData = {
            steps: this.steps,
            walk: this.walk,
            fpId: this.fpId
        };
        fs.writeFileSync(this.outputFile, JSON.stringify(outData));
        process.exit();
    }
}