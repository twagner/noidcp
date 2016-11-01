module.exports = function(grunt) {
  
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        /*
        copy: {
            files: {
                src: '/home/twagner/Documents/bootstrap-3.3.7/dist/js/*.js',
                dest: '/tmp'
            }
        },
        */
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
                    files: ['test/*.js','test/model/*.js']
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

    
    grunt.registerTask('default', ['jshint', 'mochacli']);

    //grunt.registerTask('jshint', ['jshint']);
    grunt.registerTask('test', ['mochacli']);
    grunt.registerTask('it', ['mochacli:it']);
    //grunt.registerTask('bootstrap', ['copy']);


};
