import math from 'mathjs'
import md5 from 'md5';
import Db from '../src/server/Db';
import File from 'fs';
import KalmanFilter from "../src/server/KalmanFilter";

const log = {debug: () => {}, log: () => {}};
const database = new Db(log);

// let base64Image = File.readFileSync("test/school_floor_plan_image.base64", "utf8");
//
// let query = `
//   select
//       *
//   from
//        layout_images
//   where
//       id in ('2295874152d66417bceb0daab1d7b19d',
//              '3CC0542325DEAD60E5A2409297C8FD72',
//              '197C69B9597C6A8E382530C15DF698B8',
//              '8ECD6A0BD7F8AE2210144C81C102B0A9');
//   `;
//
// let update = `
//     update
//         layout_images
//     set
//         layout_image = ?
//     where
//         id = ?;
// `;
// //async/await with database wrapper class
// (async () => {
//     let rows = await database.all(query);
//
//     for(let row of rows) {
//         let layoutImage = JSON.parse(row.layout_image);
//         console.log(layoutImage.image);
//         layoutImage.image = base64Image;
//         let newLayoutImage = JSON.stringify(layoutImage);
//         await database.run(update, newLayoutImage, row.id);
//     }
// })();





// db.all(`
// select * from scan_results where fp_id = '2295874152d66417bceb0daab1d7b19d';
// `, (err, rows) => {
//
//
//
//     for(let row of rows) {
//         let values = eval(row.orig_values);
//
//         values = values.filter((v) => v !== 0);
//         values = values.slice(-5);
//
//         let k = new KalmanFilter(values[0]);
//
//         for(let i = 0; i < values.length; i++) {
//             k.addSample(values[i]);
//         }
//
//         let est = k.getEstimate();
//
//
//
//         db.run(`
//         update
//             scan_results set value = ?
//             where
//             s_id = ? and fp_id = ? and ap_id = ? and x = ? and y = ?;
//         `, est, row.s_id, row.fp_id, row.ap_id, row.x, row.y);
//
//         db.run(`
//         update
//             kalman_estimates set kalman = ?
//             where
//             fp_id = ? and ap_id = ? and x = ? and y = ?
//         `, est, row.fp_id, row.ap_id, row.x, row.y);
//
//     }
// });


let data = JSON.parse(File.readFileSync('db/cache/fcache-2295874152d66417bceb0daab1d7b19d-false.json', {encoding: 'utf8'}));

let count = {};

let macs = [];

let keys = Object.keys(data);
for(let key of keys) {
    let keys2 = Object.keys(data[key]);
    let _macs = [];

    for(let key2 of keys2) {
        let m1 = key2.match(/\w+:\w+:\w+:\w+:\w+:\w{2}/)[0];
        let m2 = key2.replace(m1, "");
        if(macs.indexOf(m1) === -1) {
            macs.push(m1);
        }

        if(macs.indexOf(m2) === -1) {
            macs.push(m2);
        }

        if(_macs.indexOf(m1) === -1) {
            _macs.push(m1);
            if(typeof count[m1] === "undefined") {
                count[m1] = 0;
            }
            count[m1]++;
        }

        if(_macs.indexOf(m2) === -1) {
            _macs.push(m2);
            if(typeof count[m2] === "undefined") {
                count[m2] = 0;
            }
            count[m2]++;
        }
    }
}

let values = Object.values(count);

count = {};

for(let value of values) {
    if(typeof count[value + ""] === "undefined") {
        count[value + ""] = 0;
    }
    count[value + ""]++;
}

console.log(values);
console.log(count);



// db.all(`
//     select * from layout_images where id = '${oldId}'
// `, (err, rows) => {
//     let newName = 'home 20%';
//     let row = rows[0];
//     let newId = md5(newName);
//     let layoutImage = JSON.parse(row.layout_image);
//     layoutImage.name = newName;
//
//     // db.run(`
//     // insert into layout_images values (?, ?, ?);
//     // `, newId, JSON.stringify(layoutImage), newName, (err, rows) => {
//     //     console.log(newId);
//
//         for(let mark of goodMarks) {
//             try {
//                 db.exec(`
//                 insert or ignore into kalman_estimates
//                 select
//                   '${newId}',
//                   ap_id,
//                   x,
//                   y,
//                   kalman
//                 from kalman_estimates
//                 where fp_id = '${oldId}'
//                 and x = ${mark[0]}
//                 and y = ${mark[1]}
//                 `);
//             } catch(e){ }
//         }
//     // });
//
//
// });



// db.all(`select
//   f.*, count(*) as fnum
// from
//   features f
// where
//   fp_id = '336c6582c283421c28479e8801e8edfa'
// group by
//   fp_id, x, y`, (err, rows) => {
//     let fnum = rows.map((r) => { return r.fnum; });
//     let std = math.std(fnum);
//     let mean = math.mean(fnum);
//
//     let within = fnum.filter((r) => {
//         return r > mean - std && r < mean + std;
//     });
//
//     let perc = within.length / rows.length;
//
//     console.log("number of features", std, mean, within.length, perc);
// });
//
// db.all(`select
//   a.*, b.*, a.value - b.value as diff
// from
//   "0_18_phone" a
// left join
//   "0_18_desktop" b on a.ap_id = b.ap_id
// where b.ap_id is not null;`, (err, rows) => {
//     let diff = rows.map((r) => { return r.diff; });
//     let std = math.std(diff);
//     let mean = math.mean(diff);
//
//     let within = diff.filter((r) => {
//         return r > mean - std && r < mean + std;
//     });
//
//     let perc = within.length / rows.length;
//
//     console.log("differences 1", std, mean, within.length, perc);
//
// });
//
// db.all(`select
//   p.feature, d.feature, p.value - d.value as diff
// from
//   "0_18_phone_features" p
// left join
//   "0_18_desktop_features" d on p.feature = d.feature
// where
//   d.feature is not null;`, (err, rows) => {
//     let diff = rows.map((r) => { return r.diff; });
//     let std = math.std(diff);
//     let mean = math.mean(diff);
//
//     let within = diff.filter((r) => {
//         return r > mean - std && r < mean + std;
//     });
//
//     let perc = within.length / rows.length;
//
//     console.log("differences 2", std, mean, within.length, perc);
//
// });

