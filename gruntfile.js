module.exports = function(grunt) {
  
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            options: {
                esnext: true,
                strict: false,
                node: true,
                mocha: true
            },
            all: ['gruntfile.js', 'main/lib/**/*.js', 'test/**/*.js']
        },

        mochacli: {
            test: {
                // mocha options?
                options: {
                    require: ['should'],
                    reporter: 'spec',
                    harmony: true,
                    quiet: false,
                    files: ['test/*.js','test/model/user.js','test/model/authentication.js']
                }
            },
            it: {
                options: {
                    require: ['should'],
                    reporter: 'spec',
                    harmony: true,
                    quiet: false,
                    files: ['test/routes/*.js']
                }
            }
        }

    });
    grunt.loadNpmTasks('grunt-mocha-cli');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    
    grunt.registerTask('default', ['jshint']);
    grunt.registerTask('test', ['mochacli']);
    grunt.registerTask('it', ['mochacli:it']);


};
