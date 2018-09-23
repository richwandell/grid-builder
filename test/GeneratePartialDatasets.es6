import math from 'mathjs'
import md5 from 'md5';
import Db from '../src/server/Db';

const log = {debug: () => {}, log: () => {}};
const database = new Db(log);
let db = database.getDatabase();

let datasets = [
    {
        full: 'ee2a3068a005ad41b7439991ac00ad8e',
        half: '5C13DBE7239D26204EBB8CE294DD8CC1',
        twenty: {
            id: '6FCEAF389D2E65C5F4889B9D72344BA5',
            coords: [
                [0,	0],
                [0, 2],
                [0, 11],
                [0, 15],
                [0, 19],
                [1, 4],
                [1, 7],
                [1, 9],
                [1, 13],
                [2, 15],
                [2, 19],
                [3, 0],
                [3, 2],
                [3, 4],
                [3, 7],
                [3, 9],
                [3, 11],
                [3, 21],
                [4, 15],
                [4, 19]
            ]
        },
        ten: {
            id: '9272F952DB3F78C905E469CCAFACB67E',
            coords: [
                [0, 0],
                [0, 4],
                [0, 10],
                [0, 15],
                [0, 20],
                [3, 2],
                [3, 7],
                [3, 12],
                [3, 20],
                [4, 21]
            ]
        }
    },
    {
        full: '6230626FC6FF77D1880E408B3EA8F70F',
        half: '5675A64DAA4DB63F216D36A170E72942',
        twenty: {
            id: '29D98534E721A75CBBE2D02E737D7231',
            coords: [
                [1, 8],
                [1, 10],
                [1, 13],
                [3, 10],
                [6, 8],
                [6, 10],
                [6, 13],
                [8, 6],
                [8, 9],
                [8, 12],
                [8, 16],
                [10, 5],
                [10, 8],
                [10, 11],
                [10, 14],
                [12, 8],
                [12, 12],
                [12, 16],
                [13, 6],
                [13, 10],
                [13, 14],
                [15, 5],
                [15, 7],
                [15, 9],
                [15, 11],
                [15, 13],
                [15, 15],
                [16, 11],
                [17, 8],
                [17, 12],
                [17, 16],
                [18, 6],
                [18, 10],
                [18, 14],
                [20, 3],
                [20, 5],
                [20, 7],
                [20, 9],
                [20, 11],
                [20, 13],
                [21, 1],
                [22, 4],
                [22, 6],
                [22, 9],
                [22, 12],
                [22, 15],
                [23, 1],
                [24, 3]
            ]
        },
        ten: {
            id: '0A3820B30E873EA1A6115479B175E8AF',
            coords: [[22,16],[8,16],[8,5],[22,5],[15,11],[22,11],[8,11],[1,8],[6,8],[6,13],[1,13],[24,1],[21,1],[15,5],[19,8],[11,8],[11,14],[19,14],[3,11],[15,15],[20,5],[20,16],[10,16],[10,6]]
        }
    },
    {
        full: '2295874152d66417bceb0daab1d7b19d',
        half: '3CC0542325DEAD60E5A2409297C8FD72',
        twenty: {
            id: '197C69B9597C6A8E382530C15DF698B8',
            coords: [[26,7],[19,7],[19,11],[21,11],[26,11],[26,13],[22,13],[19,13],[14,13],[11,13],[8,13],[5,13],[25,9],[7,10],[6,7],[7,4],[6,1],[9,1],[9,4],[4,1],[5,4],[6,12],[9,12],[13,12],[17,12]]
        },
        ten: {
            id: '8ECD6A0BD7F8AE2210144C81C102B0A9',
            coords: [[5,1],[5,4],[9,4],[9,1],[19,7],[19,11],[26,11],[26,7],[5,13],[9,13],[19,13],[26,13]]
        }
    }
];

function generateSpecificCoords(oldId, newId, goodMarks) {
    db.serialize(function() {
        db.exec(`delete from scan_results where fp_id = '${newId}';`);
        db.exec(`delete from kalman_estimates where fp_id = '${newId}'`);

        for (let mark of goodMarks) {
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
            } catch (e) {
            }
        }
    });
}

function create50pDb(oldId, newId){
    db.serialize(function() {
        db.exec(`delete from scan_results where fp_id = '${newId}';`);
        db.exec(`delete from kalman_estimates where fp_id = '${newId}'`);

        db.exec(`
        insert into kalman_estimates
            select
              '${newId}',
              ap_id,
              x,
              y,
              kalman
            from kalman_estimates
            where fp_id = '${oldId}';`);

        db.exec(`       
        insert into scan_results
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
            where fp_id = '${oldId}';`);

        db.all(`
        select * from (
        select
          case when y % 2 = 0 then x else x + 1 end as x,
          case when x % 2 = 0 then y else y + 1 end as y
        from
          kalman_estimates
        where
          fp_id = '${newId}'
        group by x, y) a
        group by a.x, a.y;
        `, (err, rows) => {
            let del = db.prepare(`delete from kalman_estimates where fp_id = '${newId}' and x = ? and y = ?`);

            for (let row of rows) {
                del.run(row.x, row.y);
            }
        });
    });
}

// for(let dataset of datasets) {
//     create50pDb(dataset.full, dataset.half);
//     generateSpecificCoords(dataset.full, dataset.twenty.id, dataset.twenty.coords);
//     generateSpecificCoords(dataset.full, dataset.ten.id, dataset.ten.coords);
// }
let dataset = datasets[2];
// create50pDb(dataset.full, dataset.half);
generateSpecificCoords(dataset.full, dataset.twenty.id, dataset.twenty.coords);
// generateSpecificCoords(dataset.full, dataset.ten.id, dataset.ten.coords);