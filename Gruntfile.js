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
                    src: '*',
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
                files: ['src/*'],
                tasks: ['copy:dev']
            }
        },

    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
};