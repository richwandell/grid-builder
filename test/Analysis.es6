import math from 'mathjs'
import md5 from 'md5';
import Db from '../src/server/Db';
import File from 'fs';
import KalmanFilter from "../src/server/KalmanFilter";
import ImageSize from "image-size";

const log = {debug: () => {}, log: () => {}};
const database = new Db(log);

function createErrorLineData() {
    let data = File.readFileSync("db/analysis.csv", "utf8");
    data = data.split("\n");

    let allData = {};

    for (let row of data) {
        let r = row.split(",");
        if (r.length < 4) continue;

        let size = r[0].match(/10p|20p|full|half/);
        let fp = r[0].match(/home|school|work/);
        let int = r[1].trim() == "true";

        if (typeof(allData[size + int]) === "undefined") {
            allData[size + int] = [];
        }

        allData[size + int].push(Number(r[2]));


    }
    console.log(allData);
}

function createLatexTableFromData() {
    let data = File.readFileSync("test/data.csv", "utf8");
    data = data.split("\n");

    let text = "";

    for (let i = 0; i < data.length; i++) {
        let row = data[i].split("\t");
        let lastRow = [];
        if((i+1) % 2 === 0){
            lastRow = data[i-1].split("\t");
        }
        text += `\\hline
\\multicolumn{2}{|c|}{${row[0]}}`;

        for(let j = 1; j < row.length; j++){
            if(typeof(lastRow[j]) !== "undefined"){
                if(Number(row[j]) < Number(lastRow[j])) {
                    text += ` & \\cellcolor{mygreen}${row[j]}`;
                } else if(Number(row[j]) > Number(lastRow[j])) {
                    text += ` & \\cellcolor{myred}${row[j]}`;
                }
            } else {
                text += ` & ${row[j]}`;
            }
        }
        text += `\\\\
`;
    }

    console.log(text);
}
createLatexTableFromData();
function updateImage() {
    let base64Image = File.readFileSync("test/school_floor_plan_image.base64", "utf8");

    let query = `
      select
          *
      from
           layout_images
      where
          id in ('2295874152d66417bceb0daab1d7b19d',
                 '3CC0542325DEAD60E5A2409297C8FD72',
                 '197C69B9597C6A8E382530C15DF698B8',
                 '8ECD6A0BD7F8AE2210144C81C102B0A9');
      `;

    let update = `
        update
            layout_images
        set
            layout_image = ?
        where
            id = ?;
    `;
    //async/await with database wrapper class
    (async () => {
        let rows = await database.all(query);

        for(let row of rows) {
            let layoutImage = JSON.parse(row.layout_image);
            console.log(layoutImage.image);
            layoutImage.image = base64Image;
            let newLayoutImage = JSON.stringify(layoutImage);
            await database.run(update, newLayoutImage, row.id);
        }
    })();
}

function updateKalmanEstimatesFromOriginalData() {
    db.all(`
      select *
      from scan_results
      where fp_id = '2295874152d66417bceb0daab1d7b19d';
    `, (err, rows) => {


        for (let row of rows) {
            let values = eval(row.orig_values);

            values = values.filter((v) => v !== 0);
            values = values.slice(-5);

            let k = new KalmanFilter(values[0]);

            for (let i = 0; i < values.length; i++) {
                k.addSample(values[i]);
            }

            let est = k.getEstimate();


            db.run(`
              update
                  scan_results
              set value = ?
              where s_id = ?
                and fp_id = ?
                and ap_id = ?
                and x = ?
                and y = ?;
            `, est, row.s_id, row.fp_id, row.ap_id, row.x, row.y);

            db.run(`
              update
                  kalman_estimates
              set kalman = ?
              where fp_id = ?
                and ap_id = ?
                and x = ?
                and y = ?
            `, est, row.fp_id, row.ap_id, row.x, row.y);

        }
    });
}

function createDistributionData() {
    let data = JSON.parse(File.readFileSync('db/cache/fcache-2295874152d66417bceb0daab1d7b19d-false.json', {encoding: 'utf8'}));

    let count = {};

    let macs = [];

    let keys = Object.keys(data);
    for (let key of keys) {
        let keys2 = Object.keys(data[key]);
        let _macs = [];

        for (let key2 of keys2) {
            let m1 = key2.match(/\w+:\w+:\w+:\w+:\w+:\w{2}/)[0];
            let m2 = key2.replace(m1, "");
            if (macs.indexOf(m1) === -1) {
                macs.push(m1);
            }

            if (macs.indexOf(m2) === -1) {
                macs.push(m2);
            }

            if (_macs.indexOf(m1) === -1) {
                _macs.push(m1);
                if (typeof count[key + m1] === "undefined") {
                    count[key + m1] = 0;
                }
                count[key + m1]++;
            }

            if (_macs.indexOf(m2) === -1) {
                _macs.push(m2);
                if (typeof count[key + m2] === "undefined") {
                    count[key + m2] = 0;
                }
                count[key + m2]++;
            }
        }
    }

    let values = Object.values(count);

    count = {};

    for (let value of values) {
        if (typeof count[value + ""] === "undefined") {
            count[value + ""] = 0;
        }
        count[value + ""]++;
    }

    console.log(values);
    console.log(count);
}









