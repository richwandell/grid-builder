import math from 'mathjs'
import md5 from 'md5';
import Db from '../src/server/Db';

const log = {debug: () => {}, log: () => {}};
const database = new Db(log);

let db = database.getDatabase();

let goodMarks = [[1,8],[6,8],[6,13],[1,13],[1,10],[3,10],[6,10],[8,16],[8,12],[8,9],[8,6],[10,5],[10,8],[10,11],[10,14],[12,16],[13,14],[12,12],[13,10],[12,8],[13,6],[15,5],[15,7],[15,9],[15,11],[15,13],[15,15],[17,16],[18,14],[17,12],[18,10],[17,8],[18,6],[20,5],[20,3],[21,1],[23,1],[24,3],[22,4],[22,6],[22,9],[22,12],[22,15],[20,13],[20,11],[20,9],[20,7],[16,11]];

let oldId = '6230626FC6FF77D1880E408B3EA8F70F';
let newId = '29D98534E721A75CBBE2D02E737D7231';

for(let mark of goodMarks) {
    try {
        db.exec(`
        insert or ignore into scan_results
            select
              null,
              '${newId}',
              ap_id,
              x,
              y,
              value,
              orig_values,
              created
            from scan_results
            where fp_id = '${oldId}'
            and x = ${mark[0]}
            and y = ${mark[1]}
        `);

        db.exec(`
        insert or ignore into kalman_estimates
        select
          '${newId}',
          ap_id,
          x,
          y,
          kalman
        from kalman_estimates
        where fp_id = '${oldId}'
        and x = ${mark[0]}
        and y = ${mark[1]}
        `);
    } catch(e) {}
}

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

// db.all(`
// select * from (
// select
//   case when y % 2 = 0 then x else x + 1 end as x,
//   case when x % 2 = 0 then y else y + 1 end as y
// from
//   kalman_estimates
// where
//   fp_id = '5675A64DAA4DB63F216D36A170E72942'
// group by x, y) a
// group by a.x, a.y;
// `, (err, rows) => {
//     let del = db.prepare(`
//         delete from
//         kalman_estimates
//         where fp_id = '5675A64DAA4DB63F216D36A170E72942'
//         and x = ? and y = ?
//     `);
//
//     for(let row of rows) {
//         console.log(row);
//         del.run(row.x, row.y);
//     }
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

