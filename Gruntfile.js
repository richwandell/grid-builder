module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        copy: {
            first: {
                files: [{
                    cwd: 'node_modules/jquery/dist/',
                    src: 'jquery.min.js',
                    dest: 'public/builder/lib/js/',
                    expand: true
                }, {
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
                    src: 'builder.html',
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
                tasks: ['clean', 'babel', 'less:dev', 'copy:first', 'uglify:desktop']
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
                    sourceMap: true,
                    sourceMapName: 'public/builder/app.map'
                },
                files: {
                    'public/builder/app.js': [
                        'src/builder/Registry.js',
                        'src/builder/ContextMenu.js',
                        'src/builder/CustomExceptions.js',
                        'src/builder/Db.js',
                        'src/builder/Grid.js',
                        'src/builder/LayoutManager.js',
                        'src/builder/Main.js'
                    ]
                }
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
                    src: ['src/server/*.es6', 'src/builder/*.es6'],
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

};