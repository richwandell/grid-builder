import Db from './Db';
import Logger from './Log';

const pjson = require('../../package.json');


const log = new Logger({
    logfolder: pjson.builder_log_folder,
    filename: "rest.log",
    filesize: 5000000,
    numfiles: 3
});

const db = new Db(log, pjson.builder_db_name);

db.reindex();