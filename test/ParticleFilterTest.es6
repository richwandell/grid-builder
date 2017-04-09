import Db from '../public/server/Db';
import ParticleFilter from '../public/server/ParticleFilter';

const fs = require('fs');
const log = {debug: () => {}, log: () => {}};
const fp_id = '336c6582c283421c28479e8801e8edfa';
let database = new Db(log);

database.createFeaturesCache(fp_id)
    .then(() => {
        let rows = JSON.parse(fs.readFileSync("./test/0-18.json", "utf8"));

        let pfilter = new ParticleFilter(log, database, '336c6582c283421c28479e8801e8edfa');
        console.log("resolved");

        pfilter.move(rows);
    });