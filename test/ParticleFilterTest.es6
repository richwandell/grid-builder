import Db from '../public/server/Db';
import ParticleFilter from '../public/server/ParticleFilter';

const fs = require('fs');

const log = {debug: () => {}, log: () => {}};

let database = new Db(log);

let promise = database.featuresCachePromise;

promise.then(() => {
    let rows = JSON.parse(fs.readFileSync("./test/0-18.json", "utf8"));

    let pfilter = new ParticleFilter(log, database, '336c6582c283421c28479e8801e8edfa');
    console.log("resolved");

    pfilter.move(rows);
});