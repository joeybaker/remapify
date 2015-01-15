 'use strict';

var _ = require('lodash')
  , aliasify = require('aliasify')
  , Glob = require('glob').Glob
  , path = require('path')

module.exports = function remapify(b, options){
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
    , identity

  // identity function to use in place of a filter if none is passed
  identity = function(alias) { return alias; }

  done = function done(pattern){
    var expandedAliasesCount

    // only call the alasify transform once
    doneCount++
    if (doneCount !== doneAfterCount) return

    expandedAliasesCount = _.size(expandedAliases)
    if (expandedAliasesCount) {
      log('exposing ' + expandedAliasesCount + ' aliases.')
      b.transform(aliasify.configure({
        aliases: expandedAliases
        , configDir: pattern.cwd
      }))
    }
    else {
      log('no aliases found to expose.')
    }
  }

  patterns.forEach(function forEachPattern(pattern){
    var g = new Glob(pattern.src, pattern)
      .on('error', function globError(err){
        log(err)
        b.emit('error', err)
      })
      .on('match', function globMatch(file){
        var processCwd = process.cwd()
          , cwd = g.cwd || processCwd
          // we'll send the process-relative path to aliasify
          , aliasifyFilePath = './' + path.relative(process.cwd(), path.resolve(path.join(cwd, file)))
          // we'll use the relative path to create our alias
          , relativeFilePath = file.replace(cwd, '')
          // append the expose path
          , alias = path.join((pattern.expose || ''), relativeFilePath)
          , extStripper = new RegExp('(.*?)(' + b._extensions.join('$|\\') + ')$')
          , splittedPath = alias.split(path.sep)

        _(['/', '\\']).forEach(function forEachSep(sep){
          var alias = splittedPath.join(sep)
            , aliasWithNoExt = alias.match(extStripper)
            , filterFxn = pattern.filter ? pattern.filter : identity;

          // add aliases for always applying the filter function (if it is passed)
          if (sep === path.sep)
            expandedAliases[filterFxn(alias, path.dirname(alias), path.basename(alias))] = aliasifyFilePath
          else {
            var lastIndex = alias.lastIndexOf(sep)
            if (lastIndex < 0)
              expandedAliases[filterFxn(alias, '.', alias).split(path.sep).join(sep)] = aliasifyFilePath
            else
              expandedAliases[filterFxn(alias
                , alias.substring(0, lastIndex)
                , alias.substring(lastIndex + 1)).split(path.sep).join(sep)] = aliasifyFilePath
          }

          // if the file ext matches a known browserify extension, alias it, without the extensions
          if (aliasWithNoExt[1])
            expandedAliases[filterFxn(aliasWithNoExt[1], path.dirname(alias), path.basename(aliasWithNoExt[1]))] = aliasifyFilePath
        })

        log('found', aliasifyFilePath)
        b.emit('remapify:file', aliasifyFilePath, expandedAliases, g, pattern)
      })
      .on('end', function globEnd(files){
        b.emit('remapify:files', files, expandedAliases, g, pattern)
        done(pattern)
      })
  })
}
