var webpack = require('webpack');
var uuid = require('uuid');
var fs = require('fs');

var isWin = process.platform === "win32";
var inspect = false;

module.exports = function (grunt) {
    const numCPUs = require('os').cpus().length;

    var id = uuid.v4();
    try {
        var oldUUID = fs.readFileSync(".uuid", "utf8");
        id = oldUUID;
    }catch(e){
        fs.writeFileSync(".uuid", id);
    }

    var grunt_watch_tasks = ['clean:temp', 'webpack', 'less:dev', 'copy:first'];

    var pkg  = grunt.file.readJSON("./package.json");

    function commandLine() {
        if(isWin) {
            return ".\\node_modules\\.bin\\babel-node.cmd " +
                (inspect ? "--inspect " : "") +
                " .\\src\\server\\CommandLine.es6 ";
        }
        return "./node_modules/.bin/babel-node " +
            (inspect ? "--inspect " : "") +
            " ./src/server/CommandLine.es6 ";
    }

    function walkCommand(inputFile, localRest, interpolate) {
        inputFile = 'test/walk_analysis/' + inputFile;
        let outputFile = inputFile.replace(".json", "-result.json");
        if(isWin){
            return commandLine() +
                "--analyze-walk \"" + localRest + "\" \"" + inputFile + "\" " +
                "\"" + outputFile +"\" " + interpolate;
        }
        return commandLine() +
            "--analyze-walk " + localRest + " " + inputFile + " " + outputFile + " " + interpolate;
    }

    var workFullDb = {
        work_real_walk1_full_rest: {
            cmd: walkCommand("work/full_db/real_walk1.json", "rest", "")
        },
        work_real_walk1_full_local_ni: {
            cmd: walkCommand("work/full_db/real_walk1.json", "local", "false")
        },
        work_real_walk1_full_local_i: {
            cmd: walkCommand("work/full_db/real_walk1.json", "local", "true")
        },

        work_real_walk2_full_rest: {
            cmd: walkCommand("work/full_db/real_walk2.json", "rest", "")
        },
        work_real_walk2_full_local_ni: {
            cmd: walkCommand("work/full_db/real_walk2.json", "local", "false")
        },
        work_real_walk2_full_local_i: {
            cmd: walkCommand("work/full_db/real_walk2.json", "local", "true")
        },

        work_real_walk3_full_rest: {
            cmd: walkCommand("work/full_db/real_walk3.json", "rest", "")
        },
        work_real_walk3_full_local_ni: {
            cmd: walkCommand("work/full_db/real_walk3.json", "local", "false")
        },
        work_real_walk3_full_local_i: {
            cmd: walkCommand("work/full_db/real_walk3.json", "local", "true")
        },

        work_gen_walk1_full_rest: {
            cmd: walkCommand("work/full_db/gen_walk1.json", "rest", "")
        },
        work_gen_walk1_full_local_ni: {
            cmd: walkCommand("work/full_db/gen_walk1.json", "local", "false")
        },
        work_gen_walk1_full_local_i: {
            cmd: walkCommand("work/full_db/gen_walk1.json", "local", "true")
        },

        work_gen_walk2_full_rest: {
            cmd: walkCommand("work/full_db/gen_walk2.json", "rest", "")
        },
        work_gen_walk2_full_local_ni: {
            cmd: walkCommand("work/full_db/gen_walk2.json", "local", "false")
        },
        work_gen_walk2_full_local_i: {
            cmd: walkCommand("work/full_db/gen_walk2.json", "local", "true")
        },

        work_stationary_full_rest: {
            cmd: walkCommand("work/full_db/stationary_10_6.json", "rest", "")
        },
        work_stationary_full_local_ni: {
            cmd: walkCommand("work/full_db/stationary_10_6.json", "local", "false")
        },
        work_stationary_full_local_i: {
            cmd: walkCommand("work/full_db/stationary_10_6.json", "local", "true")
        }
    };

    var workHalfDb = {
        work_real_walk1_half_rest: {
            cmd: walkCommand("work/half_db/real_walk1.json", "rest", "")
        },
        work_real_walk1_half_local_ni: {
            cmd: walkCommand("work/half_db/real_walk1.json", "local", "false")
        },
        work_real_walk1_half_local_i: {
            cmd: walkCommand("work/half_db/real_walk1.json", "local", "true")
        },

        work_real_walk2_half_rest: {
            cmd: walkCommand("work/half_db/real_walk2.json", "rest", "")
        },
        work_real_walk2_half_local_ni: {
            cmd: walkCommand("work/half_db/real_walk2.json", "local", "false")
        },
        work_real_walk2_half_local_i: {
            cmd: walkCommand("work/half_db/real_walk2.json", "local", "true")
        },

        work_real_walk3_half_rest: {
            cmd: walkCommand("work/half_db/real_walk3.json", "rest", "")
        },
        work_real_walk3_half_local_ni: {
            cmd: walkCommand("work/half_db/real_walk3.json", "local", "false")
        },
        work_real_walk3_half_local_i: {
            cmd: walkCommand("work/half_db/real_walk3.json", "local", "true")
        },

        work_gen_walk1_half_rest: {
            cmd: walkCommand("work/half_db/gen_walk1.json", "rest", "")
        },
        work_gen_walk1_half_local_ni: {
            cmd: walkCommand("work/half_db/gen_walk1.json", "local", "false")
        },
        work_gen_walk1_half_local_i: {
            cmd: walkCommand("work/half_db/gen_walk1.json", "local", "true")
        },

        work_gen_walk2_half_rest: {
            cmd: walkCommand("work/half_db/gen_walk2.json", "rest", "")
        },
        work_gen_walk2_half_local_ni: {
            cmd: walkCommand("work/half_db/gen_walk2.json", "local", "false")
        },
        work_gen_walk2_half_local_i: {
            cmd: walkCommand("work/half_db/gen_walk2.json", "local", "true")
        },

        work_stationary_half_rest: {
            cmd: walkCommand("work/half_db/stationary_10_6.json", "rest", "")
        },
        work_stationary_half_local_ni: {
            cmd: walkCommand("work/half_db/stationary_10_6.json", "local", "false")
        },
        work_stationary_half_local_i: {
            cmd: walkCommand("work/half_db/stationary_10_6.json", "local", "true")
        },
    };

    var work20pDb = {
        work_real_walk1_20p_rest: {
            cmd: walkCommand("work/20p/real_walk1.json", "rest", "")
        },
        work_real_walk1_20p_local_ni: {
            cmd: walkCommand("work/20p/real_walk1.json", "local", "false")
        },
        work_real_walk1_20p_local_i: {
            cmd: walkCommand("work/20p/real_walk1.json", "local", "true")
        },

        work_real_walk2_20p_rest: {
            cmd: walkCommand("work/20p/real_walk2.json", "rest", "")
        },
        work_real_walk2_20p_local_ni: {
            cmd: walkCommand("work/20p/real_walk2.json", "local", "false")
        },
        work_real_walk2_20p_local_i: {
            cmd: walkCommand("work/20p/real_walk2.json", "local", "true")
        },

        work_real_walk3_20p_rest: {
            cmd: walkCommand("work/20p/real_walk3.json", "rest", "")
        },
        work_real_walk3_20p_local_ni: {
            cmd: walkCommand("work/20p/real_walk3.json", "local", "false")
        },
        work_real_walk3_20p_local_i: {
            cmd: walkCommand("work/20p/real_walk3.json", "local", "true")
        },

        work_gen_walk1_20p_rest: {
            cmd: walkCommand("work/20p/gen_walk1.json", "rest", "")
        },
        work_gen_walk1_20p_local_ni: {
            cmd: walkCommand("work/20p/gen_walk1.json", "local", "false")
        },
        work_gen_walk1_20p_local_i: {
            cmd: walkCommand("work/20p/gen_walk1.json", "local", "true")
        },

        work_gen_walk2_20p_rest: {
            cmd: walkCommand("work/20p/gen_walk2.json", "rest", "")
        },
        work_gen_walk2_20p_local_ni: {
            cmd: walkCommand("work/20p/gen_walk2.json", "local", "false")
        },
        work_gen_walk2_20p_local_i: {
            cmd: walkCommand("work/20p/gen_walk2.json", "local", "true")
        },

        work_stationary_20p_rest: {
            cmd: walkCommand("work/20p/stationary_10_6.json", "rest", "")
        },
        work_stationary_20p_local_ni: {
            cmd: walkCommand("work/20p/stationary_10_6.json", "local", "false")
        },
        work_stationary_20p_local_i: {
            cmd: walkCommand("work/20p/stationary_10_6.json", "local", "true")
        },
    };

    var work10pDb = {
        work_real_walk1_10p_rest: {
            cmd: walkCommand("work/10p/real_walk1.json", "rest", "")
        },
        work_real_walk1_10p_local_ni: {
            cmd: walkCommand("work/10p/real_walk1.json", "local", "false")
        },
        work_real_walk1_10p_local_i: {
            cmd: walkCommand("work/10p/real_walk1.json", "local", "true")
        },

        work_real_walk2_10p_rest: {
            cmd: walkCommand("work/10p/real_walk2.json", "rest", "")
        },
        work_real_walk2_10p_local_ni: {
            cmd: walkCommand("work/10p/real_walk2.json", "local", "false")
        },
        work_real_walk2_10p_local_i: {
            cmd: walkCommand("work/10p/real_walk2.json", "local", "true")
        },

        work_real_walk3_10p_rest: {
            cmd: walkCommand("work/10p/real_walk3.json", "rest", "")
        },
        work_real_walk3_10p_local_ni: {
            cmd: walkCommand("work/10p/real_walk3.json", "local", "false")
        },
        work_real_walk3_10p_local_i: {
            cmd: walkCommand("work/10p/real_walk3.json", "local", "true")
        },

        work_gen_walk1_10p_rest: {
            cmd: walkCommand("work/10p/gen_walk1.json", "rest", "")
        },
        work_gen_walk1_10p_local_ni: {
            cmd: walkCommand("work/10p/gen_walk1.json", "local", "false")
        },
        work_gen_walk1_10p_local_i: {
            cmd: walkCommand("work/10p/gen_walk1.json", "local", "true")
        },

        work_gen_walk2_10p_rest: {
            cmd: walkCommand("work/10p/gen_walk2.json", "rest", "")
        },
        work_gen_walk2_10p_local_ni: {
            cmd: walkCommand("work/10p/gen_walk2.json", "local", "false")
        },
        work_gen_walk2_10p_local_i: {
            cmd: walkCommand("work/10p/gen_walk2.json", "local", "true")
        },

        work_stationary_10p_rest: {
            cmd: walkCommand("work/10p/stationary_10_6.json", "rest", "")
        },
        work_stationary_10p_local_ni: {
            cmd: walkCommand("work/10p/stationary_10_6.json", "local", "false")
        },
        work_stationary_10p_local_i: {
            cmd: walkCommand("work/10p/stationary_10_6.json", "local", "true")
        },
    };

    var workOld = {
        work_old_rest: {
            cmd: walkCommand("work/old/walk1.json", "rest", "")
        },
        work_old_local_ni: {
            cmd: walkCommand("work/old/walk1.json", "local", "false")
        },
        work_old_local_i: {
            cmd: walkCommand("work/old/walk1.json", "local", "true")
        },
    };

    var homeFullDb = {
        home_gen_walk1_rest: {
            cmd: walkCommand("home/full_db/walk1.json", "rest", "")
        },
        home_gen_walk1_local_ni: {
            cmd: walkCommand("home/full_db/walk1.json", "local", "false")
        },
        home_gen_walk1_local_i: {
            cmd: walkCommand("home/full_db/walk1.json", "local", "true")
        },

        home_gen_walk2_rest: {
            cmd: walkCommand("home/full_db/walk2.json", "rest", "")
        },
        home_gen_walk2_local_ni: {
            cmd: walkCommand("home/full_db/walk2.json", "local", "false")
        },
        home_gen_walk2_local_i: {
            cmd: walkCommand("home/full_db/walk2.json", "local", "true")
        },
        home_stationary1_rest: {
            cmd: walkCommand("home/full_db/stationary1.json", "rest", "")
        },
        home_stationary1_local_ni: {
            cmd: walkCommand("home/full_db/stationary1.json", "local", "false")
        },
        home_stationary1_local_i: {
            cmd: walkCommand("home/full_db/stationary1.json", "local", "true")
        }
    };

    var homeHalfDb = {
        home_gen_walk1_half_rest: {
            cmd: walkCommand("home/half_db/walk1.json", "rest", "")
        },
        home_gen_walk1_half_local_ni: {
            cmd: walkCommand("home/half_db/walk1.json", "local", "false")
        },
        home_gen_walk1_half_local_i: {
            cmd: walkCommand("home/half_db/walk1.json", "local", "true")
        },

        home_gen_walk2_half_rest: {
            cmd: walkCommand("home/half_db/walk2.json", "rest", "")
        },
        home_gen_walk2_half_local_ni: {
            cmd: walkCommand("home/half_db/walk2.json", "local", "false")
        },
        home_gen_walk2_half_local_i: {
            cmd: walkCommand("home/half_db/walk2.json", "local", "true")
        },
        home_stationary1_half_rest: {
            cmd: walkCommand("home/half_db/stationary1.json", "rest", "")
        },
        home_stationary1_half_local_ni: {
            cmd: walkCommand("home/half_db/stationary1.json", "local", "false")
        },
        home_stationary1_half_local_i: {
            cmd: walkCommand("home/half_db/stationary1.json", "local", "true")
        }
    };

    var home20pDb = {
        home_gen_walk1_20p_rest: {
            cmd: walkCommand("home/20p/walk1.json", "rest", "")
        },
        home_gen_walk1_20p_local_ni: {
            cmd: walkCommand("home/20p/walk1.json", "local", "false")
        },
        home_gen_walk1_20p_local_i: {
            cmd: walkCommand("home/20p/walk1.json", "local", "true")
        },

        home_gen_walk2_20p_rest: {
            cmd: walkCommand("home/20p/walk2.json", "rest", "")
        },
        home_gen_walk2_20p_local_ni: {
            cmd: walkCommand("home/20p/walk2.json", "local", "false")
        },
        home_gen_walk2_20p_local_i: {
            cmd: walkCommand("home/20p/walk2.json", "local", "true")
        },
        home_stationary1_20p_rest: {
            cmd: walkCommand("home/20p/stationary1.json", "rest", "")
        },
        home_stationary1_20p_local_ni: {
            cmd: walkCommand("home/20p/stationary1.json", "local", "false")
        },
        home_stationary1_20p_local_i: {
            cmd: walkCommand("home/20p/stationary1.json", "local", "true")
        }
    };

    var home10pDb = {
        home_gen_walk1_10p_rest: {
            cmd: walkCommand("home/10p/walk1.json", "rest", "")
        },
        home_gen_walk1_10p_local_ni: {
            cmd: walkCommand("home/10p/walk1.json", "local", "false")
        },
        home_gen_walk1_10p_local_i: {
            cmd: walkCommand("home/10p/walk1.json", "local", "true")
        },

        home_gen_walk2_10p_rest: {
            cmd: walkCommand("home/10p/walk2.json", "rest", "")
        },
        home_gen_walk2_10p_local_ni: {
            cmd: walkCommand("home/10p/walk2.json", "local", "false")
        },
        home_gen_walk2_10p_local_i: {
            cmd: walkCommand("home/10p/walk2.json", "local", "true")
        },
        home_stationary1_10p_rest: {
            cmd: walkCommand("home/10p/stationary1.json", "rest", "")
        },
        home_stationary1_10p_local_ni: {
            cmd: walkCommand("home/10p/stationary1.json", "local", "false")
        },
        home_stationary1_10p_local_i: {
            cmd: walkCommand("home/10p/stationary1.json", "local", "true")
        }
    };

    var schoolFullDb = {
        school_gen_walk1_full_rest: {
            cmd: walkCommand("school/full_db/walk1.json", "rest", "")
        },
        school_gen_walk1_full_local_ni: {
            cmd: walkCommand("school/full_db/walk1.json", "local", "false")
        },
        school_gen_walk1_full_local_i: {
            cmd: walkCommand("school/full_db/walk1.json", "local", "true")
        },

        school_stationary_08_03_full_rest: {
            cmd: walkCommand("school/full_db/stationary_08_03.json", "rest", "")
        },
        school_stationary_08_03_full_local_ni: {
            cmd: walkCommand("school/full_db/stationary_08_03.json", "local", "false")
        },
        school_stationary_08_03_full_local_i: {
            cmd: walkCommand("school/full_db/stationary_08_03.json", "local", "true")
        },

        school_stationary_21_10_full_rest: {
            cmd: walkCommand("school/full_db/stationary_21_10.json", "rest", "")
        },
        school_stationary_21_10_full_local_ni: {
            cmd: walkCommand("school/full_db/stationary_21_10.json", "local", "false")
        },
        school_stationary_21_10_full_local_i: {
            cmd: walkCommand("school/full_db/stationary_21_10.json", "local", "true")
        },

        school_stationary_25_09_full_rest: {
            cmd: walkCommand("school/full_db/stationary_25_09.json", "rest", "")
        },
        school_stationary_25_09_full_local_ni: {
            cmd: walkCommand("school/full_db/stationary_25_09.json", "local", "false")
        },
        school_stationary_25_09_full_local_i: {
            cmd: walkCommand("school/full_db/stationary_25_09.json", "local", "true")
        },

        school_stationary_26_12_full_rest: {
            cmd: walkCommand("school/full_db/stationary_26_12.json", "rest", "")
        },
        school_stationary_26_12_full_local_ni: {
            cmd: walkCommand("school/full_db/stationary_26_12.json", "local", "false")
        },
        school_stationary_26_12_full_local_i: {
            cmd: walkCommand("school/full_db/stationary_26_12.json", "local", "true")
        },

        school_stationary_25_09_full_rest_2weeks: {
            cmd: walkCommand("school/full_db/stationary_25_09_2weeks.json", "rest", "")
        },
        school_stationary_25_09_full_local_ni_2weeks: {
            cmd: walkCommand("school/full_db/stationary_25_09_2weeks.json", "local", "false")
        },
        school_stationary_25_09_full_local_i_2weeks: {
            cmd: walkCommand("school/full_db/stationary_25_09_2weeks.json", "local", "true")
        },

        school_stationary_21_09_full_rest_2weeks: {
            cmd: walkCommand("school/full_db/stationary_21_09_2weeks.json", "rest", "")
        },
        school_stationary_21_09_full_local_ni_2weeks: {
            cmd: walkCommand("school/full_db/stationary_21_09_2weeks.json", "local", "false")
        },
        school_stationary_21_09_full_local_i_2weeks: {
            cmd: walkCommand("school/full_db/stationary_21_09_2weeks.json", "local", "true")
        },

        school_stationary_25_09_full_rest_3weeks: {
            cmd: walkCommand("school/full_db/stationary_25_09_3weeks.json", "rest", "")
        },
        school_stationary_25_09_full_local_ni_3weeks: {
            cmd: walkCommand("school/full_db/stationary_25_09_3weeks.json", "local", "false")
        },
        school_stationary_25_09_full_local_i_3weeks: {
            cmd: walkCommand("school/full_db/stationary_25_09_3weeks.json", "local", "true")
        },

        school_walk2_full_rest_3weeks: {
            cmd: walkCommand("school/full_db/walk2_3weeks.json", "rest", "")
        },
        school_walk2_full_local_ni_3weeks: {
            cmd: walkCommand("school/full_db/walk2_3weeks.json", "local", "false")
        },
        school_walk2_full_local_i_3weeks: {
            cmd: walkCommand("school/full_db/walk2_3weeks.json", "local", "true")
        },

        school_test: {
            cmd: walkCommand("school/2.json", "rest", "")
        },
    };

    var schoolHalfDb = {
        school_gen_walk1_half_rest: {
            cmd: walkCommand("school/half_db/walk1.json", "rest", "")
        },
        school_gen_walk1_half_local_ni: {
            cmd: walkCommand("school/half_db/walk1.json", "local", "false")
        },
        school_gen_walk1_half_local_i: {
            cmd: walkCommand("school/half_db/walk1.json", "local", "true")
        },

        school_stationary_08_03_half_rest: {
            cmd: walkCommand("school/half_db/stationary_08_03.json", "rest", "")
        },
        school_stationary_08_03_half_local_ni: {
            cmd: walkCommand("school/half_db/stationary_08_03.json", "local", "false")
        },
        school_stationary_08_03_half_local_i: {
            cmd: walkCommand("school/half_db/stationary_08_03.json", "local", "true")
        },

        school_stationary_21_10_half_rest: {
            cmd: walkCommand("school/full_db/stationary_21_10.json", "rest", "")
        },
        school_stationary_21_10_half_local_ni: {
            cmd: walkCommand("school/half_db/stationary_21_10.json", "local", "false")
        },
        school_stationary_21_10_half_local_i: {
            cmd: walkCommand("school/half_db/stationary_21_10.json", "local", "true")
        },

        school_stationary_25_09_half_rest: {
            cmd: walkCommand("school/half_db/stationary_25_09.json", "rest", "")
        },
        school_stationary_25_09_half_local_ni: {
            cmd: walkCommand("school/half_db/stationary_25_09.json", "local", "false")
        },
        school_stationary_25_09_half_local_i: {
            cmd: walkCommand("school/half_db/stationary_25_09.json", "local", "true")
        },

        school_stationary_26_12_half_rest: {
            cmd: walkCommand("school/half_db/stationary_26_12.json", "rest", "")
        },
        school_stationary_26_12_half_local_ni: {
            cmd: walkCommand("school/half_db/stationary_26_12.json", "local", "false")
        },
        school_stationary_26_12_half_local_i: {
            cmd: walkCommand("school/half_db/stationary_26_12.json", "local", "true")
        },

        school_stationary_25_09_half_rest_2weeks: {
            cmd: walkCommand("school/half_db/stationary_25_09_2weeks.json", "rest", "")
        },
        school_stationary_25_09_half_local_ni_2weeks: {
            cmd: walkCommand("school/half_db/stationary_25_09_2weeks.json", "local", "false")
        },
        school_stationary_25_09_half_local_i_2weeks: {
            cmd: walkCommand("school/half_db/stationary_25_09_2weeks.json", "local", "true")
        },

        school_stationary_21_09_half_rest_2weeks: {
            cmd: walkCommand("school/half_db/stationary_21_09_2weeks.json", "rest", "")
        },
        school_stationary_21_09_half_local_ni_2weeks: {
            cmd: walkCommand("school/half_db/stationary_21_09_2weeks.json", "local", "false")
        },
        school_stationary_21_09_half_local_i_2weeks: {
            cmd: walkCommand("school/half_db/stationary_21_09_2weeks.json", "local", "true")
        },

        school_stationary_25_09_half_rest_3weeks: {
            cmd: walkCommand("school/half_db/stationary_25_09_3weeks.json", "rest", "")
        },
        school_stationary_25_09_half_local_ni_3weeks: {
            cmd: walkCommand("school/half_db/stationary_25_09_3weeks.json", "local", "false")
        },
        school_stationary_25_09_half_local_i_3weeks: {
            cmd: walkCommand("school/half_db/stationary_25_09_3weeks.json", "local", "true")
        },

        school_walk2_half_rest_3weeks: {
            cmd: walkCommand("school/half_db/walk2_3weeks.json", "rest", "")
        },
        school_walk2_half_local_ni_3weeks: {
            cmd: walkCommand("school/half_db/walk2_3weeks.json", "local", "false")
        },
        school_walk2_half_local_i_3weeks: {
            cmd: walkCommand("school/half_db/walk2_3weeks.json", "local", "true")
        },
    };

    var school20pDb = {
        school_gen_walk1_20p_rest: {
            cmd: walkCommand("school/20p/walk1.json", "rest", "")
        },
        school_gen_walk1_20p_local_ni: {
            cmd: walkCommand("school/20p/walk1.json", "local", "false")
        },
        school_gen_walk1_20p_local_i: {
            cmd: walkCommand("school/20p/walk1.json", "local", "true")
        },

        school_stationary_08_03_20p_rest: {
            cmd: walkCommand("school/20p/stationary_08_03.json", "rest", "")
        },
        school_stationary_08_03_20p_local_ni: {
            cmd: walkCommand("school/20p/stationary_08_03.json", "local", "false")
        },
        school_stationary_08_03_20p_local_i: {
            cmd: walkCommand("school/20p/stationary_08_03.json", "local", "true")
        },

        school_stationary_21_10_20p_rest: {
            cmd: walkCommand("school/20p/stationary_21_10.json", "rest", "")
        },
        school_stationary_21_10_20p_local_ni: {
            cmd: walkCommand("school/20p/stationary_21_10.json", "local", "false")
        },
        school_stationary_21_10_20p_local_i: {
            cmd: walkCommand("school/20p/stationary_21_10.json", "local", "true")
        },

        school_stationary_25_09_20p_rest: {
            cmd: walkCommand("school/20p/stationary_25_09.json", "rest", "")
        },
        school_stationary_25_09_20p_local_ni: {
            cmd: walkCommand("school/20p/stationary_25_09.json", "local", "false")
        },
        school_stationary_25_09_20p_local_i: {
            cmd: walkCommand("school/20p/stationary_25_09.json", "local", "true")
        },

        school_stationary_26_12_20p_rest: {
            cmd: walkCommand("school/20p/stationary_26_12.json", "rest", "")
        },
        school_stationary_26_12_20p_local_ni: {
            cmd: walkCommand("school/20p/stationary_26_12.json", "local", "false")
        },
        school_stationary_26_12_20p_local_i: {
            cmd: walkCommand("school/20p/stationary_26_12.json", "local", "true")
        },

        school_stationary_25_09_20p_rest_2weeks: {
            cmd: walkCommand("school/20p/stationary_25_09_2weeks.json", "rest", "")
        },
        school_stationary_25_09_20p_local_ni_2weeks: {
            cmd: walkCommand("school/20p/stationary_25_09_2weeks.json", "local", "false")
        },
        school_stationary_25_09_20p_local_i_2weeks: {
            cmd: walkCommand("school/20p/stationary_25_09_2weeks.json", "local", "true")
        },

        school_stationary_21_09_20p_rest_2weeks: {
            cmd: walkCommand("school/20p/stationary_21_09_2weeks.json", "rest", "")
        },
        school_stationary_21_09_20p_local_ni_2weeks: {
            cmd: walkCommand("school/20p/stationary_21_09_2weeks.json", "local", "false")
        },
        school_stationary_21_09_20p_local_i_2weeks: {
            cmd: walkCommand("school/20p/stationary_21_09_2weeks.json", "local", "true")
        },

        school_stationary_25_09_20p_rest_3weeks: {
            cmd: walkCommand("school/20p/stationary_25_09_3weeks.json", "rest", "")
        },
        school_stationary_25_09_20p_local_ni_3weeks: {
            cmd: walkCommand("school/20p/stationary_25_09_3weeks.json", "local", "false")
        },
        school_stationary_25_09_20p_local_i_3weeks: {
            cmd: walkCommand("school/20p/stationary_25_09_3weeks.json", "local", "true")
        },

        school_walk2_20p_rest_3weeks: {
            cmd: walkCommand("school/20p/walk2_3weeks.json", "rest", "")
        },
        school_walk2_20p_local_ni_3weeks: {
            cmd: walkCommand("school/20p/walk2_3weeks.json", "local", "false")
        },
        school_walk2_20p_local_i_3weeks: {
            cmd: walkCommand("school/20p/walk2_3weeks.json", "local", "true")
        },
    };

    var school10pDb = {
        school_gen_walk1_10p_rest: {
            cmd: walkCommand("school/10p/walk1.json", "rest", "")
        },
        school_gen_walk1_10p_local_ni: {
            cmd: walkCommand("school/10p/walk1.json", "local", "false")
        },
        school_gen_walk1_10p_local_i: {
            cmd: walkCommand("school/10p/walk1.json", "local", "true")
        },

        school_stationary_08_03_10p_rest: {
            cmd: walkCommand("school/10p/stationary_08_03.json", "rest", "")
        },
        school_stationary_08_03_10p_local_ni: {
            cmd: walkCommand("school/10p/stationary_08_03.json", "local", "false")
        },
        school_stationary_08_03_10p_local_i: {
            cmd: walkCommand("school/10p/stationary_08_03.json", "local", "true")
        },

        school_stationary_21_10_10p_rest: {
            cmd: walkCommand("school/10p/stationary_21_10.json", "rest", "")
        },
        school_stationary_21_10_10p_local_ni: {
            cmd: walkCommand("school/10p/stationary_21_10.json", "local", "false")
        },
        school_stationary_21_10_10p_local_i: {
            cmd: walkCommand("school/10p/stationary_21_10.json", "local", "true")
        },

        school_stationary_25_09_10p_rest: {
            cmd: walkCommand("school/10p/stationary_25_09.json", "rest", "")
        },
        school_stationary_25_09_10p_local_ni: {
            cmd: walkCommand("school/10p/stationary_25_09.json", "local", "false")
        },
        school_stationary_25_09_10p_local_i: {
            cmd: walkCommand("school/10p/stationary_25_09.json", "local", "true")
        },

        school_stationary_26_12_10p_rest: {
            cmd: walkCommand("school/10p/stationary_26_12.json", "rest", "")
        },
        school_stationary_26_12_10p_local_ni: {
            cmd: walkCommand("school/10p/stationary_26_12.json", "local", "false")
        },
        school_stationary_26_12_10p_local_i: {
            cmd: walkCommand("school/10p/stationary_26_12.json", "local", "true")
        },

        school_stationary_25_09_10p_rest_2weeks: {
            cmd: walkCommand("school/10p/stationary_25_09_2weeks.json", "rest", "")
        },
        school_stationary_25_09_10p_local_ni_2weeks: {
            cmd: walkCommand("school/10p/stationary_25_09_2weeks.json", "local", "false")
        },
        school_stationary_25_09_10p_local_i_2weeks: {
            cmd: walkCommand("school/10p/stationary_25_09_2weeks.json", "local", "true")
        },

        school_stationary_21_09_10p_rest_2weeks: {
            cmd: walkCommand("school/10p/stationary_21_09_2weeks.json", "rest", "")
        },
        school_stationary_21_09_10p_local_ni_2weeks: {
            cmd: walkCommand("school/10p/stationary_21_09_2weeks.json", "local", "false")
        },
        school_stationary_21_09_10p_local_i_2weeks: {
            cmd: walkCommand("school/10p/stationary_21_09_2weeks.json", "local", "true")
        },

        school_stationary_25_09_10p_rest_3weeks: {
            cmd: walkCommand("school/10p/stationary_25_09_3weeks.json", "rest", "")
        },
        school_stationary_25_09_10p_local_ni_3weeks: {
            cmd: walkCommand("school/10p/stationary_25_09_3weeks.json", "local", "false")
        },
        school_stationary_25_09_10p_local_i_3weeks: {
            cmd: walkCommand("school/10p/stationary_25_09_3weeks.json", "local", "true")
        },

        school_walk2_10p_rest_3weeks: {
            cmd: walkCommand("school/10p/walk2_3weeks.json", "rest", "")
        },
        school_walk2_10p_local_ni_3weeks: {
            cmd: walkCommand("school/10p/walk2_3weeks.json", "local", "false")
        },
        school_walk2_10p_local_i_3weeks: {
            cmd: walkCommand("school/10p/walk2_3weeks.json", "local", "true")
        },
    };

    grunt.initConfig({
        pkg: pkg,
        copy: {
            first: {
                files: [{
                    cwd: 'node_modules/bootstrap/dist/css/',
                    src: 'bootstrap.min.css',
                    dest: 'public/builder/lib/css/',
                    expand: true
                }, {
                    cwd: 'node_modules/bootstrap/dist/fonts/',
                    src: '*',
                    dest: 'public/builder/lib/fonts/',
                    expand: true
                }, {
                    cwd: 'node_modules/bootstrap/dist/js/',
                    src: 'bootstrap.min.js',
                    dest: 'public/builder/lib/js/',
                    expand: true
                }, {
                    cwd: 'src/',
                    src: ['builder.html', 'images/*'],
                    dest: 'public/builder/',
                    expand: true
                }, {
                    cwd: 'node_modules/blueimp-md5/js/',
                    src: 'md5.min.js',
                    dest: 'public/builder/lib/js/',
                    expand: true
                }]
            },
            osx_android: {
                files: [{
                    cwd: 'public/builder/',
                    src: '**/*.*',
                    dest: '/Users/richwandell/AndroidStudioProjects/indoorlocation/app/src/main/assets/',
                    expand: true
                }]
            },
            windows_android: {
                files: [{
                    expand: true,
                    cwd: 'public/builder/',
                    src: '**/*.*',
                    dest: 'C:\\Users\\rich\\AndroidStudioProjects\\indoorlocation\\app\\src\\main\\assets\\'
                }]
            }
        },
        watch: {
            dev: {
                files: ['src/**/*.less', 'src/builder/**/*', 'src/builder.html'],
                tasks: grunt_watch_tasks
            }
        },
        clean: {
            temp: ['public/builder/**'],
            cache: ['db/cache/**'],
            analysis: ['db/analysis.csv']
        },
        less: {
            dev: {
                files: [{
                    expand: true,
                    cwd: 'src/styles',
                    src: ['builder.less'],
                    dest: 'public/builder/',
                    ext: '.css'
                }]
            }
        },
        webpack: {
            dist:  {
                entry: [
                    './src/builder/Main.es6'
                ],
                output: {
                    filename: './public/builder/app.js'
                },
                module: {
                    loaders: [{
                        exclude: /node_modules/,
                        loader: 'babel-loader'
                    }]
                },
                externals: {
                    "nw": "nw"
                },
                resolve: {
                    extensions: ['.es6', '.js', '.jsx']
                },
                stats: {
                    colors: true
                },
                progress: false,
                inline: false,
                devtool: 'source-map',
                plugins: [
                    new webpack.IgnorePlugin(/nw\.gui/),
                    new webpack.DefinePlugin({
                        WS_PORT: JSON.stringify(pkg.builder_ws_port),
                        REST_PORT: JSON.stringify(pkg.builder_rest_port),
                        HOST_NAME: JSON.stringify(pkg.builder_host_name),
                        PROTOCOL: JSON.stringify(pkg.builder_protocol),
                        SYSTEM_ID: JSON.stringify(id)
                    }),
                ]
            }
        },
        exec: {
            ...workFullDb, ...workHalfDb, ...work20pDb, ...work10pDb,
            ...homeFullDb, ...homeHalfDb, ...home20pDb, ...home10pDb,
            ...schoolFullDb, ...schoolHalfDb, ...school20pDb, ...school10pDb,
            regenerate_cache: {
                cmd: commandLine() + " --regenerate-cache"
            }
        },
        concurrent: {
            options: {
                limit: numCPUs
            },
            home_walk1: {
                tasks: [
                    'exec:home_gen_walk1_local_ni',
                    'exec:home_gen_walk1_local_i',
                    'exec:home_gen_walk1_half_local_ni',
                    'exec:home_gen_walk1_half_local_i',
                    'exec:home_gen_walk1_20p_local_ni',
                    'exec:home_gen_walk1_20p_local_i',
                    'exec:home_gen_walk1_10p_local_ni',
                    'exec:home_gen_walk1_10p_local_i'
                ]
            },
            home_walk2: {
                tasks: [
                    'exec:home_gen_walk2_local_ni',
                    'exec:home_gen_walk2_local_i',
                    'exec:home_gen_walk2_half_local_ni',
                    'exec:home_gen_walk2_half_local_i',
                    'exec:home_gen_walk2_20p_local_ni',
                    'exec:home_gen_walk2_20p_local_i',
                    'exec:home_gen_walk2_10p_local_ni',
                    'exec:home_gen_walk2_10p_local_i'
                ]
            },
            home_stationary1: {
                tasks: [
                    'exec:home_stationary1_local_ni',
                    'exec:home_stationary1_local_i',
                    'exec:home_stationary1_half_local_ni',
                    'exec:home_stationary1_half_local_i',
                    'exec:home_stationary1_20p_local_ni',
                    'exec:home_stationary1_20p_local_i',
                    'exec:home_stationary1_10p_local_ni',
                    'exec:home_stationary1_10p_local_i'
                ]
            },
            work_walk1: {
                tasks: [
                    'exec:work_gen_walk1_full_local_ni',
                    'exec:work_gen_walk1_full_local_i',
                    'exec:work_gen_walk1_half_local_ni',
                    'exec:work_gen_walk1_half_local_i',
                    'exec:work_gen_walk1_20p_local_ni',
                    'exec:work_gen_walk1_20p_local_i',
                    'exec:work_gen_walk1_10p_local_ni',
                    'exec:work_gen_walk1_10p_local_i'
                ]
            },
            work_walk2: {
                tasks: [
                    'exec:work_gen_walk2_full_local_ni',
                    'exec:work_gen_walk2_full_local_i',
                    'exec:work_gen_walk2_half_local_ni',
                    'exec:work_gen_walk2_half_local_i',
                    'exec:work_gen_walk2_20p_local_ni',
                    'exec:work_gen_walk2_20p_local_i',
                    'exec:work_gen_walk2_10p_local_ni',
                    'exec:work_gen_walk2_10p_local_i'
                ]
            },
            work_stationary: {
                tasks: [
                    'exec:work_stationary_full_local_ni',
                    'exec:work_stationary_full_local_i',
                    'exec:work_stationary_half_local_ni',
                    'exec:work_stationary_half_local_i',
                    'exec:work_stationary_20p_local_ni',
                    'exec:work_stationary_20p_local_i',
                    'exec:work_stationary_10p_local_ni',
                    'exec:work_stationary_10p_local_i'
                ]
            },
            work_real_walk2: {
                tasks: [
                    'exec:work_real_walk2_full_local_ni',
                    'exec:work_real_walk2_full_local_i',
                    'exec:work_real_walk2_half_local_ni',
                    'exec:work_real_walk2_half_local_i',
                    'exec:work_real_walk2_20p_local_ni',
                    'exec:work_real_walk2_20p_local_i',
                    'exec:work_real_walk2_10p_local_ni',
                    'exec:work_real_walk2_10p_local_i'
                ]
            },
            school_walk1: {
                tasks: [
                    'exec:school_gen_walk1_full_local_ni',
                    'exec:school_gen_walk1_full_local_i',
                    'exec:school_gen_walk1_half_local_ni',
                    'exec:school_gen_walk1_half_local_i',
                    'exec:school_gen_walk1_20p_local_ni',
                    'exec:school_gen_walk1_20p_local_i',
                    'exec:school_gen_walk1_10p_local_ni',
                    'exec:school_gen_walk1_10p_local_i'
                ]
            },
            school_stationary1: {
                tasks: [
                    'exec:school_stationary_08_03_full_local_ni',
                    'exec:school_stationary_08_03_full_local_i',
                    'exec:school_stationary_08_03_half_local_ni',
                    'exec:school_stationary_08_03_half_local_i',
                    'exec:school_stationary_08_03_20p_local_ni',
                    'exec:school_stationary_08_03_20p_local_i',
                    'exec:school_stationary_08_03_10p_local_ni',
                    'exec:school_stationary_08_03_10p_local_i'
                ]
            },
            school_stationary2: {
                tasks: [
                    'exec:school_stationary_21_10_full_local_ni',
                    'exec:school_stationary_21_10_full_local_i',
                    'exec:school_stationary_21_10_half_local_ni',
                    'exec:school_stationary_21_10_half_local_i',
                    'exec:school_stationary_21_10_20p_local_ni',
                    'exec:school_stationary_21_10_20p_local_i',
                    'exec:school_stationary_21_10_10p_local_ni',
                    'exec:school_stationary_21_10_10p_local_i'
                ]
            },
            school_stationary3: {
                tasks: [
                    'exec:school_stationary_25_09_full_local_ni',
                    'exec:school_stationary_25_09_full_local_i',
                    'exec:school_stationary_25_09_half_local_ni',
                    'exec:school_stationary_25_09_half_local_i',
                    'exec:school_stationary_25_09_20p_local_ni',
                    'exec:school_stationary_25_09_20p_local_i',
                    'exec:school_stationary_25_09_10p_local_ni',
                    'exec:school_stationary_25_09_10p_local_i'
                ]
            },
            school_stationary4: {
                tasks: [
                    'exec:school_stationary_26_12_full_local_ni',
                    'exec:school_stationary_26_12_full_local_i',
                    'exec:school_stationary_26_12_half_local_ni',
                    'exec:school_stationary_26_12_half_local_i',
                    'exec:school_stationary_26_12_20p_local_ni',
                    'exec:school_stationary_26_12_20p_local_i',
                    'exec:school_stationary_26_12_10p_local_ni',
                    'exec:school_stationary_26_12_10p_local_i'
                ]
            },
            school_2weeks1: {
                tasks: [
                    'exec:school_stationary_25_09_full_local_ni_2weeks',
                    'exec:school_stationary_25_09_full_local_i_2weeks',
                    'exec:school_stationary_25_09_half_local_ni_2weeks',
                    'exec:school_stationary_25_09_half_local_i_2weeks',
                    'exec:school_stationary_25_09_20p_local_ni_2weeks',
                    'exec:school_stationary_25_09_20p_local_i_2weeks',
                    'exec:school_stationary_25_09_10p_local_ni_2weeks',
                    'exec:school_stationary_25_09_10p_local_i_2weeks'
                ]
            },
            school_2weeks2: {
                tasks: [
                    'exec:school_stationary_21_09_full_local_ni_2weeks',
                    'exec:school_stationary_21_09_full_local_i_2weeks',
                    'exec:school_stationary_21_09_half_local_ni_2weeks',
                    'exec:school_stationary_21_09_half_local_i_2weeks',
                    'exec:school_stationary_21_09_20p_local_ni_2weeks',
                    'exec:school_stationary_21_09_20p_local_i_2weeks',
                    'exec:school_stationary_21_09_10p_local_ni_2weeks',
                    'exec:school_stationary_21_09_10p_local_i_2weeks'
                ]
            },
            school_3weeks1: {
                tasks: [
                    'exec:school_stationary_25_09_full_local_ni_3weeks',
                    'exec:school_stationary_25_09_full_local_i_3weeks',
                    'exec:school_stationary_25_09_half_local_ni_3weeks',
                    'exec:school_stationary_25_09_half_local_i_3weeks',
                    'exec:school_stationary_25_09_20p_local_ni_3weeks',
                    'exec:school_stationary_25_09_20p_local_i_3weeks',
                    'exec:school_stationary_25_09_10p_local_ni_3weeks',
                    'exec:school_stationary_25_09_10p_local_i_3weeks'
                ]
            },
            school_3weeks2: {
                tasks: [
                    'exec:school_walk2_full_local_ni_3weeks',
                    'exec:school_walk2_full_local_i_3weeks',
                    'exec:school_walk2_half_local_ni_3weeks',
                    'exec:school_walk2_half_local_i_3weeks',
                    'exec:school_walk2_20p_local_ni_3weeks',
                    'exec:school_walk2_20p_local_i_3weeks',
                    'exec:school_walk2_10p_local_ni_3weeks',
                    'exec:school_walk2_10p_local_i_3weeks'
                ]
            }
        },
        "run tests": {
            "clean": ['clean:analysis'],
            "home": ['concurrent:home_walk1', 'concurrent:home_walk2', 'concurrent:home_stationary1'],
            "work": ['concurrent:work_walk1', 'concurrent:work_walk2', 'concurrent:work_stationary', 'concurrent:work_real_walk2'],
            "school": [
                'concurrent:school_walk1',
                'concurrent:school_stationary1',
                'concurrent:school_stationary2',
                "concurrent:school_stationary3",
                "concurrent:school_stationary4",
                "concurrent:school_2weeks1",
                "concurrent:school_2weeks2",
                "concurrent:school_3weeks1",
                "concurrent:school_3weeks2"
            ]
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-webpack');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-concurrent');

    grunt.registerTask('dist', grunt_watch_tasks);

    grunt.registerMultiTask('run tests', 'runs tests', function(){
        grunt.task.run(this.data);
    });

    grunt.registerTask('regenerate cache', function() {
        grunt.task.run(['clean:cache', 'exec:regenerate_cache']);
    });
};