/*
 * grunt-traceur
 * https://github.com/aaron/grunt
 *
 * Copyright (c) 2013 Aaron Frost
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({

    // Configuration to be run (and then tested).
    traceur: {
      options: {
        sourceMaps: true,
        modules: 'commonjs'
      },
      test: {
        options: {
          fileRoot: 'test/fixtures'
        },
        files: {
          'test/tmp/': ['test/fixtures/**/*.js']
        }
      }
    },
    nodeunit: {
      tests: ['test/*_test.js']
    },
    watch: {
      tasks: {
        files: ['tasks/*.js'],
        tasks: ['traceur', 'nodeunit']
      },
      tests: {
        files: ['text/fixtures/**/*.js'],
        tasks: ['traceur', 'nodeunit']
      }
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['traceur', 'nodeunit']);

};
