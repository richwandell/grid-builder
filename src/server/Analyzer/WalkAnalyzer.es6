import Path from 'path';
const fs = require('fs');
const uuid = require('uuid');
import math from 'mathjs';
import {ServerBase} from "../ServerBase";
import ImageSize from "image-size";


export default class WalkAnalyzer extends ServerBase {

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
        super({particles: {}, previousState: {}});
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
        this.layoutRow = false;

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

    async compareResultsToActual(actual, results) {
        if(this.layoutRow === false) {
            let rows = await this.db.all('select layout_image, x_size, y_size from layout_images where id = ?', this.fpId);
            this.layoutRow = rows[0];
        }
        let fp_width = this.layoutRow.x_size;
        let fp_height = this.layoutRow.y_size;
        let record = JSON.parse(this.layoutRow.layout_image);

        let change = (a) => {
            let hs = record.hgrid_spaces;
            let vs = record.vgrid_spaces;
            let hss = fp_width / hs;
            let vss = fp_height / vs;

            let upperLeft = [a[0] * hss, a[1] * vss]
            let center = [
                upperLeft[0] + hss / 2,
                upperLeft[1] + vss / 2
            ];
            return center;
        };

        let ac = actual.map(change);
        let re = results.map(change);


        let errors = [];
        let i = 0;
        for(let [x, y] of ac) {
            let [x1, y1] = re[i];
            let diff = Math.sqrt(Math.pow(x - x1, 2) + Math.pow(y - y1, 2));

            errors.push(diff);
            i++;
        }

        let averageError = errors.reduce((a, b) => a+b) / errors.length;
        return [averageError, math.std(errors)];
    }
}