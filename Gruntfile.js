module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        copy: {
            first: {
                files: [{
                    cwd: 'node_modules/jquery/dist/',
                    src: 'jquery.min.js',
                    dest: 'dist/scripts/',
                    expand: true
                },{
                    cwd: 'src/',
                    src: '**/*.*',
                    dest: 'dist/',
                    expand: true
                },{
                    cwd: 'test/floorplans/',
                    src: 'fplan-*.json',
                    dest: 'dist/floorplans/',
                    expand: true
                }]
            },
            second: {
                files: [{
                    cwd: 'dist/',
                    src: '**/*.*',
                    dest: 'dist/android/',
                    expand: true
                }]
            },
            third: {
                files: [{
                    cwd: 'dist/android/',
                    src: '**/*.*',
                    dest: 'dist/desktop/',
                    expand: true
                },{
                    cwd: '.',
                    src: 'node_modules/ws/**/*.*',
                    dest: 'dist/',
                    expand: true
                },{
                    cwd: '.',
                    src: 'node_modules/node-ssdp/**/*.*',
                    dest: 'dist/',
                    expand: true
                }]
            },
            android: {
                files: [{
                    cwd: 'dist/android/',
                    src: ['**/*.*'],
                    expand: true,
                    dest: '/Users/richwandell/AndroidStudioProjects/indoorlocation/app/src/main/assets/'
                }]
            }
        },
        watch: {
            dev: {
                files: ['src/**/*.*'],
                tasks: ['clean', 'copy:first', 'copy:second', 'copy:third', 'concat', 'clean:html']
            }
        },
        clean: {
            temp: ['dist/**'],
            html: ['dist/android/html/', 'dist/desktop/html/']
        },
        concat: {
            desktop: {
                src: ['src/html/builder.html', 'src/html/bm1.html', 'src/html/scripts.html'],
                dest: 'dist/desktop/desktop.html'
            },
            android: {
                src: ['src/html/builder.html', 'src/html/bm2.html', 'src/html/scripts.html'],
                dest: 'dist/android/android.html'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('build-nw', '', function () {
        var exec = require('child_process').execSync;
        var result = exec("zip -r build/grid_builder.nw dist/desktop/*", { encoding: 'utf8' });
        grunt.log.writeln(result);
        var result = exec("zip -r build/grid_builder.nw dist/node_modules/*", { encoding: 'utf8' });
        grunt.log.writeln(result);
        var result = exec("zip -r build/grid_builder.nw package.json", { encoding: 'utf8' });
        grunt.log.writeln(result);
    });

    grunt.registerTask('build project', '', function() {
        grunt.task.run(['clean', 'copy:first', 'copy:second', 'copy:third', 'concat', 'clean:html'])
    });
};