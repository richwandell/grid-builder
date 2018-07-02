var webpack = require('webpack');
var uuid = require('uuid');
var fs = require('fs');


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
            home_walk1_rest: {
                cmd: ".\\node_modules\\.bin\\babel-node.cmd .\\src\\server\\CommandLine.es6 " +
                "--analyze-walk \"rest\" \"test/walk_analysis/home/walk1/home-walk1.json\" " +
                "\"test/walk_analysis/home_walk1/home-walk1-result.json\" "
            },
            home_half_database_rest: {
                cmd: ".\\node_modules\\.bin\\babel-node.cmd .\\src\\server\\CommandLine.es6 " +
                "--analyze-walk \"rest\" \"test/walk_analysis/home/home-walk-half-database.json\" " +
                "\"test/walk_analysis/home_walk1/home-walk1-result.json\" "
            },
            home_half_database_local: {
                cmd: ".\\node_modules\\.bin\\babel-node.cmd .\\src\\server\\CommandLine.es6 " +
                "--analyze-walk \"local\" \"test/walk_analysis/home/home-walk-half-database.json\" " +
                "\"test/walk_analysis/home_walk1/home-walk1-result.json\" "
            },
            home_20p_rest: {
                cmd: ".\\node_modules\\.bin\\babel-node.cmd .\\src\\server\\CommandLine.es6 " +
                "--analyze-walk \"rest\" \"test/walk_analysis/home/walk3/home-walk3.json\" " +
                "\"test/walk_analysis/home_walk1/home-walk1-result.json\" "
            },
            work_walk1_rest: {
                cmd: ".\\node_modules\\.bin\\babel-node.cmd .\\src\\server\\CommandLine.es6 " +
                "--analyze-walk \"rest\" \"test/walk_analysis/work/walk1/work-walk1.json\" " +
                "\"test/walk_analysis/home_walk1/home-walk1-result.json\" "
            },
            work_walk1_local: {
                cmd: ".\\node_modules\\.bin\\babel-node.cmd .\\src\\server\\CommandLine.es6 " +
                "--analyze-walk \"local\" \"test/walk_analysis/work/walk1/work-walk1.json\" " +
                "\"test/walk_analysis/home_walk1/home-walk1-result.json\" "
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-webpack');
    grunt.loadNpmTasks('grunt-exec');

    grunt.registerTask('dist', grunt_watch_tasks);
};