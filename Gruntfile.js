module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        copy: {
            dev: {
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
                }]
            },
            android: {
                files: [{
                    cwd: 'dist/',
                    src: ['*', '**/*.*'],
                    expand: true,
                    dest: '/Users/richwandell/AndroidStudioProjects/indoorlocation/app/src/main/assets/'
                }]
            }
        },
        watch: {
            dev: {
                files: ['src/**/*.*'],
                tasks: ['clean', 'copy:dev', 'concat', 'clean:html']
            }
        },
        clean: {
            temp: ['dist/**'],
            html: ['dist/html/']
        },
        concat: {
            desktop: {
                src: ['src/html/builder.html', 'src/html/bm1.html', 'src/html/scripts.html'],
                dest: 'dist/desktop.html'
            },
            android: {
                src: ['src/html/builder.html', 'src/html/bm2.html', 'src/html/scripts.html'],
                dest: 'dist/android.html'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
};