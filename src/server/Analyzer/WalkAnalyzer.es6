const fs = require('fs');
const uuid = require('uuid');

export default class WalkAnalyzer {

    constructor(db: Db, walkFile: string, outFile: string) {
        this.db = db;
        let file = fs.readFileSync(walkFile);
        this.walkData = JSON.parse(file);
        this.steps = this.walkData.steps;
        this.walk = this.walkData.walk;
        this.fpId = this.walkData.fpId;
        this.outFile = outFile;


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