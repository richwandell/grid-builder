import Db from './Db';
import Logger from './Log';

const pjson = require('../../package.json');
const commands = require('commander');

commands
    .option('--reindex', 'Reindex')
    .option('--interpolate', 'Interpolate')
    .parse(process.argv);

const log = new Logger({
    logfolder: pjson.builder_log_folder,
    filename: "rest.log",
    filesize: 5000000,
    numfiles: 3
});

const db = new Db(log, pjson.builder_db_name);

if(commands.reindex) {
    db.reindex();
} else if (commands.interpolate) {
    db.interpolate('336c6582c283421c28479e8801e8edfb');
}