var webpack = require('webpack');


module.exports = function (grunt) {
    var pkg  = grunt.file.readJSON("public/package.json");
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
                    src: ['builder.html', 'compass.svg'],
                    dest: 'public/builder/',
                    expand: true
                }, {
                    cwd: 'node_modules/blueimp-md5/js/',
                    src: 'md5.min.js',
                    dest: 'public/builder/lib/js/',
                    expand: true
                },{
                    cwd: 'src/server/',
                    src: '*',
                    dest: 'public/server/',
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
                    src: ['*.less'],
                    dest: 'public/builder/',
                    ext: '.css'
                }]
            }
        },
        uglify: {
            desktop: {
                options: {
                    mangle: false
                },
                files: {
                    'public/builder/app.js': [
                        'public/builder/app.js'
                    ]
                }
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
                    new webpack.DefinePlugin({
                        REST_PORT: JSON.stringify(pkg.builder_rest_port),
                        HOST_NAME: JSON.stringify(pkg.builder_host_name),
                        PROTOCOL: JSON.stringify(pkg.builder_protocol)
                    })
                ]
            }
        },
        nwjs: {
            options: {
                platforms: ['osx64'],
                buildDir: './dist',
                flavor: 'normal',
                version: '0.19.1'
            },
            src: ['./public/**/*']
        },
        babel: {
            options: {
                sourceMap: true,
                presets: ['es2015', 'stage-0']
            },
            dist: {
                files: [{
                    expand: true,
                    src: ['src/server/*.es6'],
                    dest: '.',
                    ext: '.js'
                }]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-nw-builder');
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-webpack');
};