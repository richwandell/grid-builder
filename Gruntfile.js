module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        copy: {
            first: {
                files: [{
                    cwd: 'node_modules/jquery/dist/',
                    src: 'jquery.min.js',
                    dest: 'dist/lib/js/',
                    expand: true
                }, {
                    cwd: 'node_modules/bootstrap/dist/css/',
                    src: 'bootstrap.min.css',
                    dest: 'dist/lib/css/',
                    expand: true
                }, {
                    cwd: 'node_modules/bootstrap/dist/fonts/',
                    src: '*',
                    dest: 'dist/lib/fonts/',
                    expand: true
                }, {
                    cwd: 'node_modules/bootstrap/dist/js/',
                    src: 'bootstrap.min.js',
                    dest: 'dist/lib/js/',
                    expand: true
                }, {
                    cwd: 'src/',
                    src: 'builder.html',
                    dest: 'dist/',
                    expand: true
                }]
            }
        },
        watch: {
            dev: {
                files: ['src/**/*.less', 'src/builder/**/*', 'src/builder.html'],
                tasks: ['clean', 'less:dev', 'copy:first', 'uglify:desktop']
            }
        },
        clean: {
            temp: ['dist/**']
        },
        concat: {
            options: {
                separator: ';'
            },
            desktop: {
                src: [
                    'src/builder/Registry.js',
                    'src/ContextMenu.js',
                    'src/builder/CustomExceptions.js',
                    'src/builder/Db.js',
                    'src/builder/Grid.js',
                    'src/builder/LayoutManager.js',
                    'src/builder/Main.js'
                ],
                dest: 'dist/app.js'
            }
        },
        less: {
            dev: {
                files: [{
                    expand: true,
                    cwd: 'src/styles',
                    src: ['*.less'],
                    dest: 'dist/',
                    ext: '.css'
                }]
            }
        },
        uglify: {
            desktop: {
                options: {
                    sourceMap: true,
                    sourceMapName: 'dist/app.map'
                },
                files: {
                    'dist/app.js': [
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
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('build-nw', '', function () {
        var exec = require('child_process').execSync;
        var result = exec("zip -r build/grid_builder.nw dist/desktop/*", { encoding: 'utf8' });
        Log.log.writeln(result);
        var result = exec("zip -r build/grid_builder.nw dist/node_modules/*", { encoding: 'utf8' });
        Log.log.writeln(result);
        var result = exec("zip -r build/grid_builder.nw package.json", { encoding: 'utf8' });
        Log.log.writeln(result);
    });

    grunt.registerTask('build project', '', function() {
        grunt.task.run(['clean', 'copy:first', 'copy:second', 'copy:third', 'concat', 'clean:html'])
    });
};