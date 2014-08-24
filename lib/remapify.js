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
    , doneAfterCount = patterns.length
    , doneCount = 0
    , done

  done = function done(){
    var expandedAliasesCount

    // only call the alasify transform once
    doneCount++
    if (doneCount !== doneAfterCount) return

    expandedAliasesCount = _.size(expandedAliases)
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
        file = file.replace(/^\.\//, '')
        var filePath = (g.cwd ? g.cwd : '.') + '/' + file
          , alias = (pattern.expose ? pattern.expose + '/' : '') + file
          , extStripper = new RegExp('(.*?)(' + b._extensions.join('$|\\') + ')$')
          , aliasWithNoExt = alias.match(extStripper)
        
        if (g.cwd && path.resolve(g.cwd) === g.cwd) filePath = path.resolve(filePath)
        // expose both with and with out the js extension to match normal require behavior
        expandedAliases[alias] = filePath
        // if the file ext matches a known browserify extension, alias it, without the extensions
        if (aliasWithNoExt[1])
          expandedAliases[aliasWithNoExt[1]] = filePath

        log('found', file)
        b.emit('remapify:file', file, expandedAliases, g, pattern)
      })
      .on('end', function globEnd(files){
        b.emit('remapify:files', files, expandedAliases, g, pattern)
        done()
      })
  })
}
