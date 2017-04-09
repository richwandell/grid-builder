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
            second: {
                files: [{
                    cwd: 'public/builder/',
                    src: '**/*.*',
                    dest: '/Users/richwandell/AndroidStudioProjects/indoorlocation/app/src/main/assets/',
                    expand: true
                }]
            }
        },
        watch: {
            dev: {
                files: ['src/**/*.less', 'src/builder/**/*', 'src/builder.html', 'src/server/*'],
                tasks: ['clean', 'babel', 'webpack', 'less:dev', 'copy:first']
            }
        },
        clean: {
            temp: ['public/builder/**', 'public/server/**']
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
                    new webpack.optimize.UglifyJsPlugin({
                        compress: {
                            warnings: false,
                        },
                        output: {
                            comments: false,
                        },
                        sourceMap: true
                    }),
                ]
            }
        },
        nwjs: {
            options: {
                platforms: ['osx64'],
                buildDir: './dist',
                flavor: 'sdk',
                version: '0.21.5'
            },
            src: ['./**/*']
        },
        babel: {
            options: {
                sourceMap: true,
                presets: ['es2015', 'stage-0']
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'src/server',
                    src: ['*.es6'],
                    dest: 'public/server/',
                    ext: '.js'
                }]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-nw-builder');
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-webpack');
};