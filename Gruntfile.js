var webpack = require('webpack');
var uuid = require('uuid');
var fs = require('fs');

var isWin = process.platform === "win32";

module.exports = function (grunt) {
    var id = uuid.v4();
    try {
        var oldUUID = fs.readFileSync(".uuid", "utf8");
        id = oldUUID;
    }catch(e){
        fs.writeFileSync(".uuid", id);
    }

    var grunt_watch_tasks = ['clean', 'webpack', 'less:dev', 'copy:first'];

    var pkg  = grunt.file.readJSON("./package.json");

    function walkCommand(inputFile, localRest, interpolate) {
        let outputFile = inputFile.replace(".json", "-result.json");
        if(isWin){
            return ".\\node_modules\\.bin\\babel-node.cmd --inspect .\\src\\server\\CommandLine.es6 " +
                "--analyze-walk \"" + localRest + "\" \"" + inputFile + "\" " +
                "\"" + outputFile +"\" " + interpolate;
        }
        return "./node_modules/.bin/babel-node --inspect ./src/server/CommandLine.es6 " +
            "--analyze-walk " + localRest + " " + inputFile + " " + outputFile + " " + interpolate;
    }

    var workFullDb = {
        work_real_walk1_full_rest: {
            cmd: walkCommand("test/walk_analysis/work/full_db/real_walk1.json", "rest", "")
        },
        work_real_walk1_full_local_ni: {
            cmd: walkCommand("test/walk_analysis/work/full_db/real_walk1.json", "local", "false")
        },
        work_real_walk1_full_local_i: {
            cmd: walkCommand("test/walk_analysis/work/full_db/real_walk1.json", "local", "true")
        },

        work_real_walk2_full_rest: {
            cmd: walkCommand("test/walk_analysis/work/full_db/real_walk2.json", "rest", "")
        },
        work_real_walk2_full_local_ni: {
            cmd: walkCommand("test/walk_analysis/work/full_db/real_walk2.json", "local", "false")
        },
        work_real_walk2_full_local_i: {
            cmd: walkCommand("test/walk_analysis/work/full_db/real_walk2.json", "local", "true")
        },

        work_real_walk3_full_rest: {
            cmd: walkCommand("test/walk_analysis/work/full_db/real_walk3.json", "rest", "")
        },
        work_real_walk3_full_local_ni: {
            cmd: walkCommand("test/walk_analysis/work/full_db/real_walk3.json", "local", "false")
        },
        work_real_walk3_full_local_i: {
            cmd: walkCommand("test/walk_analysis/work/full_db/real_walk3.json", "local", "true")
        },

        work_gen_walk1_full_rest: {
            cmd: walkCommand("test/walk_analysis/work/full_db/gen_walk1.json", "rest", "")
        },
        work_gen_walk1_full_local_ni: {
            cmd: walkCommand("test/walk_analysis/work/full_db/gen_walk1.json", "local", "false")
        },
        work_gen_walk1_full_local_i: {
            cmd: walkCommand("test/walk_analysis/work/full_db/gen_walk1.json", "local", "true")
        },

        work_gen_walk2_full_rest: {
            cmd: walkCommand("test/walk_analysis/work/full_db/gen_walk2.json", "rest", "")
        },
        work_gen_walk2_full_local_ni: {
            cmd: walkCommand("test/walk_analysis/work/full_db/gen_walk2.json", "local", "false")
        },
        work_gen_walk2_full_local_i: {
            cmd: walkCommand("test/walk_analysis/work/full_db/gen_walk2.json", "local", "true")
        },
    };

    var workHalfDb = {
        work_real_walk1_half_rest: {
            cmd: walkCommand("test/walk_analysis/work/half_db/real_walk1.json", "rest", "")
        },
        work_real_walk1_half_local_ni: {
            cmd: walkCommand("test/walk_analysis/work/half_db/real_walk1.json", "local", "false")
        },
        work_real_walk1_half_local_i: {
            cmd: walkCommand("test/walk_analysis/work/half_db/real_walk1.json", "local", "true")
        },

        work_real_walk2_half_rest: {
            cmd: walkCommand("test/walk_analysis/work/half_db/real_walk2.json", "rest", "")
        },
        work_real_walk2_half_local_ni: {
            cmd: walkCommand("test/walk_analysis/work/half_db/real_walk2.json", "local", "false")
        },
        work_real_walk2_half_local_i: {
            cmd: walkCommand("test/walk_analysis/work/half_db/real_walk2.json", "local", "true")
        },

        work_real_walk3_half_rest: {
            cmd: walkCommand("test/walk_analysis/work/half_db/real_walk3.json", "rest", "")
        },
        work_real_walk3_half_local_ni: {
            cmd: walkCommand("test/walk_analysis/work/half_db/real_walk3.json", "local", "false")
        },
        work_real_walk3_half_local_i: {
            cmd: walkCommand("test/walk_analysis/work/half_db/real_walk3.json", "local", "true")
        },

        work_gen_walk1_half_rest: {
            cmd: walkCommand("test/walk_analysis/work/half_db/gen_walk1.json", "rest", "")
        },
        work_gen_walk1_half_local_ni: {
            cmd: walkCommand("test/walk_analysis/work/half_db/gen_walk1.json", "local", "false")
        },
        work_gen_walk1_half_local_i: {
            cmd: walkCommand("test/walk_analysis/work/half_db/gen_walk1.json", "local", "true")
        },

        work_gen_walk2_half_rest: {
            cmd: walkCommand("test/walk_analysis/work/half_db/gen_walk2.json", "rest", "")
        },
        work_gen_walk2_half_local_ni: {
            cmd: walkCommand("test/walk_analysis/work/half_db/gen_walk2.json", "local", "false")
        },
        work_gen_walk2_half_local_i: {
            cmd: walkCommand("test/walk_analysis/work/half_db/gen_walk2.json", "local", "true")
        },
    };

    var work20pDb = {
        work_real_walk1_20p_rest: {
            cmd: walkCommand("test/walk_analysis/work/20p/real_walk1.json", "rest", "")
        },
        work_real_walk1_20p_local_ni: {
            cmd: walkCommand("test/walk_analysis/work/20p/real_walk1.json", "local", "false")
        },
        work_real_walk1_20p_local_i: {
            cmd: walkCommand("test/walk_analysis/work/20p/real_walk1.json", "local", "true")
        },

        work_real_walk2_20p_rest: {
            cmd: walkCommand("test/walk_analysis/work/20p/real_walk2.json", "rest", "")
        },
        work_real_walk2_20p_local_ni: {
            cmd: walkCommand("test/walk_analysis/work/20p/real_walk2.json", "local", "false")
        },
        work_real_walk2_20p_local_i: {
            cmd: walkCommand("test/walk_analysis/work/20p/real_walk2.json", "local", "true")
        },

        work_real_walk3_20p_rest: {
            cmd: walkCommand("test/walk_analysis/work/20p/real_walk3.json", "rest", "")
        },
        work_real_walk3_20p_local_ni: {
            cmd: walkCommand("test/walk_analysis/work/20p/real_walk3.json", "local", "false")
        },
        work_real_walk3_20p_local_i: {
            cmd: walkCommand("test/walk_analysis/work/20p/real_walk3.json", "local", "true")
        },

        work_gen_walk1_20p_rest: {
            cmd: walkCommand("test/walk_analysis/work/20p/gen_walk1.json", "rest", "")
        },
        work_gen_walk1_20p_local_ni: {
            cmd: walkCommand("test/walk_analysis/work/20p/gen_walk1.json", "local", "false")
        },
        work_gen_walk1_20p_local_i: {
            cmd: walkCommand("test/walk_analysis/work/20p/gen_walk1.json", "local", "true")
        },

        work_gen_walk2_20p_rest: {
            cmd: walkCommand("test/walk_analysis/work/20p/gen_walk2.json", "rest", "")
        },
        work_gen_walk2_20p_local_ni: {
            cmd: walkCommand("test/walk_analysis/work/20p/gen_walk2.json", "local", "false")
        },
        work_gen_walk2_20p_local_i: {
            cmd: walkCommand("test/walk_analysis/work/20p/gen_walk2.json", "local", "true")
        },
    };

    var workOld = {
        work_old_rest: {
            cmd: walkCommand("test/walk_analysis/work/old/walk1.json", "rest", "")
        },
        work_old_local_ni: {
            cmd: walkCommand("test/walk_analysis/work/old/walk1.json", "local", "false")
        },
        work_old_local_i: {
            cmd: walkCommand("test/walk_analysis/work/old/walk1.json", "local", "true")
        },
    };

    var homeFullDb = {
        home_walk1_rest: {
            cmd: walkCommand("test/walk_analysis/home/fp1/walk1.json", "rest", "")
        },
        home_walk1_local_ni: {
            cmd: walkCommand("test/walk_analysis/home/fp1/walk1.json", "local", "false")
        },
        home_walk1_local_i: {
            cmd: walkCommand("test/walk_analysis/home/fp1/walk1.json", "local", "true")
        },
    };

    var homeHalfDb = {
        home_half_database_rest: {
            cmd: walkCommand("test/walk_analysis/home/half_db/walk1.json", "rest", "")
        },
        home_half_database_local_ni: {
            cmd: walkCommand("test/walk_analysis/home/half_db/walk1.json", "local", "false")
        },
        home_half_database_local_i: {
            cmd: walkCommand("test/walk_analysis/home/half_db/walk1.json", "local", "true")
        },
    };

    var home20pDb = {
        home_20p_rest: {
            cmd: walkCommand("test/walk_analysis/home/20p/walk1.json", "rest", "")
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
            temp: ['public/builder/**']
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
            ...workFullDb, ...workHalfDb, ...work20pDb,
            ...homeFullDb, ...homeHalfDb, ...home20pDb
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-webpack');
    grunt.loadNpmTasks('grunt-exec');

    grunt.registerTask('dist', grunt_watch_tasks);

    grunt.registerTask('run all tests', [
        'exec:home_walk1_local_ni',
        'exec:home_walk1_local_i',
        'exec:home_half_database_local_ni',
        'exec:home_half_database_local_i'
    ]);
};