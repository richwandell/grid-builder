import Path from 'path';
const fs = require('fs');
const uuid = require('uuid');


export default class WalkAnalyzer {

    makeSteps(walkData) {
        let steps = [];
        let s = walkData.total_time_seconds;
        let a = walkData.steps.length;

        let scanInterval = s / walkData.walk.length;
        let stepInterval = s / a;

        for(let i = 0; i < walkData.walk.length; i++) {
            let which = (scanInterval / stepInterval) * i;
            which = Math.round(which);
            let correctStep = walkData.steps[which];
            steps.push(correctStep);
        }


        return steps;
    }

    constructor(db: Db, walkFile: string, outFile: string, interpolated = true) {
        this.db = db;
        let file = fs.readFileSync(walkFile);
        this.walkFileName = walkFile.replace("test/walk_analysis/", "");
        this.walkData = JSON.parse(file);
        if(
            typeof(this.walkData.total_time_seconds) !== "undefined"
            && typeof(this.walkData.seconds_per_scan) !== "undefined"
        ) {
            this.walkData.steps = this.makeSteps(this.walkData);
        }
        this.steps = this.walkData.steps;
        this.walk = this.walkData.walk;
        this.fpId = this.walkData.fpId;
        this.outFile = outFile;
        this.interpolated = interpolated;


        this.id = uuid.v4();
        try {
            let oldUUID = fs.readFileSync(".uuid", "utf8");
            this.id = oldUUID;
        }catch(e){
            fs.writeFileSync(".uuid", this.id);
        }
    }

    run() {
        console.log("this is a method stub!");
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


        return averageError;
    }
}