'use strict';

var _ = require('lodash')
  , aliasify = require('aliasify')
  , Glob = require('glob').Glob
  , path = require('path')

module.exports = function(b, options){
  var patterns = _.isArray(options)
      ? _.clone(options)
      : [_.clone(options)]
    , verbose = options.config
      ? options.config.verbose
      : false
    , log = function log(){
      if (!verbose) return

      console.info.apply(console
      , ['remapify - ']
        .concat(Array.prototype.slice.call(arguments, 0))
      )
    }
    , expandedAliases = {}
    , done

  done = function done(){
    var expandedAliasesCount = _.size(expandedAliases)

    if (expandedAliasesCount) {
      log('exposing ' + expandedAliasesCount + ' aliases.')
      b.transform(aliasify.configure({
        aliases: expandedAliases
      }))
    }
    else {
      log('no aliases found to expose.')
    }
  }

  patterns.forEach(function(pattern){
    var g = new Glob(pattern.src, pattern)
      .on('error', function globError(err){
        log(err)
        b.emit('error', err)
      })
      .on('match', function globMatch(file){
        var cwd = g.cwd || process.cwd()
          // we'll send the absolute path to browserify
          , absoluteFilePath = path.resolve(path.join(cwd, file))
          // we'll use the relative path to create our alias
          , relativeFilePath = file.replace(cwd, '')
          // append the expose path
          , alias = path.join((pattern.expose || ''), relativeFilePath)
        // expose both with and with out the js extension to match normal require behavior
        expandedAliases[alias] = absoluteFilePath

        log('found', absoluteFilePath)
        b.emit('remapify:file', absoluteFilePath, expandedAliases, g, pattern)
      })
      .on('end', function globEnd(files){
        b.emit('remapify:files', files, expandedAliases, g, pattern)
        done()
      })
  })
}
