/*
 * grunt-traceur
 * https://github.com/aaron/grunt
 *
 * Copyright (c) 2013 Aaron Frost
 * Licensed under the MIT license.
 */

'use strict';
var fs = require('fs'),
  path = require('path'),
  compiler = require('../lib/compiler'),
  async = require('async');

function asyncCompile(content, filename, options, callback) {
  var result;
  try {
    result = compiler.compile(content, filename, options);
  } catch (e) {
    callback(e.message, null);
    return;
  }
  callback(null, result);
}

/**
 * Compiles a list of srcs files
 * */
function compileAll(grunt, compile, group, options, callback) {

  var fileRoot =  options.fileRoot;
  delete options.fileRoot;
  var srcs = group.src, dest = group.dest;
  grunt.log.debug('Compiling... ' + dest);


  async.map(srcs, function (src, callback) {
    var content = grunt.file.read(src).toString('utf8');
    grunt.log.debug('Reading file ' + src);
    compile(content, src, options, callback);
  }, function (err, result) {
    if (err) {
      grunt.log.error(err);
      callback(false);
    } else {
      result.map(function (res) {

        var offset = fileRoot ? path.relative(fileRoot, path.dirname(res.file)) : '';
        var currentDest = dest;

        if(offset) {
          currentDest = dest  +  offset + '/';
        }
        // console.log('Group', group, 'srcs', srcs, 'dest', dest);
      //  console.log('test:', dest + path.basename(res.file));
        if (!grunt.file.exists(currentDest)) {
          grunt.file.mkdir(currentDest);
        }
        if (res.errors && res.errors.length > 0) {
          grunt.log.error('Errors encountered for ' + res.file);
          grunt.log.error(res.errors);

        }
        else {
          var fileName = path.basename(res.file),
            filePath = currentDest + fileName,
            mapName = fileName + '.map',
            mapPath = currentDest + mapName,
            sourceMap = res.sourceMap;
          res.js += '//# sourceMappingURL=' + mapName;

          grunt.file.write(filePath, res.js, {encoding: 'utf8'});
          if (res.sourceMap) {
            sourceMap = JSON.parse(res.sourceMap);
            sourceMap.file = fileName;
            sourceMap = JSON.stringify(sourceMap);
            grunt.file.write(mapPath, sourceMap, {encoding: 'utf8'});
            grunt.file.copy(res.file, filePath + '.es6');
          }


          grunt.log.debug('Compilation successful - ' + currentDest);

        }

      });

      grunt.log.ok(srcs + ' -> ' + dest);
      callback(true);
    }
  });
}

module.exports = function (grunt) {
  grunt.registerMultiTask('traceur',
    'Compile ES6 JavaScript to ES3 JavaScript', function () {
      grunt.log.debug(this);
      var options = this.options({
        sourceMaps: false
      });
      grunt.log.write('using options: ' + JSON.stringify(options));
      var done = this.async();
      var compile = asyncCompile;


      // We don't terminate immediately on errors to log all error messages
      // before terminating.
      async.every(this.files, function (group, callback) {
          compileAll(grunt, compile, group, options, callback);
      }, function (success) {
        grunt.log.debug('Success' + success);
        done(success);
      });
    });

};
