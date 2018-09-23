import Db from './Db';
import Logger from './Log';
import {WalkGenerator} from "./WalkGenerator";
import {RestWalkAnalyzer, LocalWalkAnalyzer} from "./Analyzer";

const pjson = require('../../package.json');
const commands = require('commander');

commands
    .option('--analyze-walk', 'Analyze a walk file')
    .option('--generate-walk', 'Generate Walks from Scan data')
    .option('--reindex', 'Reindex')
    .option('--interpolate', 'Interpolate')
    .option('--regenerate-cache', 'Regenerate Cache')
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
    try {
        if(commands.args[0] && commands.args[1] && commands.args[2]) {
            if(commands.args[0] === "local") {
                if(typeof(commands.args[3]) === "undefined") {
                    throw "";
                }
            }
        } else {
            throw "";
        }



        let analyzer;
        if(commands.args[0] === "rest") {
            analyzer = new RestWalkAnalyzer(db, commands.args[1], commands.args[2]);
        } else {
            analyzer = new LocalWalkAnalyzer(db, commands.args[1], commands.args[2], commands.args[3] === "true");
        }
        analyzer.run();

    }catch(e) {
        console.log("missing args for analyzeWalk");
        process.exit(1);
    }
} else if(commands.regenerateCache) {
    try {


        async function runCacheCreator() {
            let results = await db.getAllFpIds();

            for (let res of results) {
                await db.createFeaturesCache(res.fp_id, true)
                    .then(() => {
                        console.log(res.fp_id + " interpolated cache created");
                    });

                db.clearFeaturesCache(res.fp_id);

                await db.createFeaturesCache(res.fp_id, false)
                    .then(() => {
                        console.log(res.fp_id + " non interpolated cache created for ");
                    });
            }
        }

        runCacheCreator().then(() => {
            process.exit(0);
        });
    }catch(e) {
        process.exit(1);
    }
}