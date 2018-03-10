import Db from './Db';
import Logger from './Log';
import {WalkGenerator} from "./WalkGenerator";
import {WalkAnalyzer} from "./WalkAnalyzer";

const pjson = require('../../package.json');
const commands = require('commander');

commands
    .option('--analyze-walk', 'Analyze a walk file')
    .option('--generate-walk', 'Generate Walks from Scan data')
    .option('--reindex', 'Reindex')
    .option('--interpolate', 'Interpolate')
    .parse(process.argv);

const log = new Logger({
    logfolder: pjson.builder_log_folder,
    filename: "cli.log",
    filesize: 5000000,
    numfiles: 3
});

const db = new Db(log, pjson.builder_db_name);

if(commands.reindex) {
    db.reindex();
} else if (commands.interpolate) {
    db.interpolate('336c6582c283421c28479e8801e8edfb');
} else if (commands.generateWalk) {
    console.log(commands.args);
    if (commands.args[0] && commands.args[1] && commands.args[2]) {
        let generator = new WalkGenerator(db, commands.args[0], commands.args[1], commands.args[2]);
    } else {
        process.exit(1);
    }
} else if(commands.analyzeWalk) {
    if(commands.args[0] && commands.args[1]) {
        let analyzer = new WalkAnalyzer(db, commands.args[0], commands.args[1]);
    }
}