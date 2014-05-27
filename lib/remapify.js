'use strict';

var _ = require('lodash')
  , aliasify = require('aliasify')
  , Glob = require('glob').Glob
  , path = require('path')

module.exports = function(b, options){
  var patterns = _.isArray(options)
      ? _.clone(options)
      : [_.clone(options)]
    , patternsLeft = patterns.length
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
    , extensionMatcher = new RegExp('(' + b._extensions.join('|\\') + ')$')

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

    if (--patternsLeft === 0) {
      b.emit('remapify:patterns', expandedAliases)
    }
  }

  patterns.forEach(function(pattern){
    var g = new Glob(pattern.src, pattern)
      .on('error', function globError(err){
        log(err)
        b.emit('error', err)
      })
      .on('match', function globMatch(file){
        var filePath = path.resolve(g.cwd, file)
        // expose both with and with out the js extension to match normal npm behavior
        expandedAliases[path.join(pattern.expose || '', file)] = filePath
        expandedAliases[path.join(pattern.expose || '', file.replace(extensionMatcher, ''))] = filePath

        log('found', file)
        b.emit('remapify:file', file, expandedAliases, g, pattern)
      })
      .on('end', function globEnd(files){
        b.emit('remapify:files', files, expandedAliases, g, pattern)
        done()
      })
  })
}
