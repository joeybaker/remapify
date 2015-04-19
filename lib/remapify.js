'use strict'

var _ = require('lodash')
  , glob = require('glob')
  , path = require('path')
  , processCwd = process.cwd()
  , eachPattern
  , eachFile
  , setLogger
  , log
  , transformAliases

setLogger = function setLogger(verbose){
  if (!verbose) log = _.noop
  else {
    log = function logger(){
      return console.info.apply(console
        , ['remapify - ']
        .concat([].slice.call(arguments, 0))
      )
    }
  }
}

// expects to be called with the context of a bundle
transformAliases = function transformAliases(b, results){
  var expandedAliasesCount = _(results).pluck('aliases').map(_.size).reduce(function sum(total, count){
      return total + count
    }).valueOf()
    , aliasMap = {}
    , realPaths = []


  if (expandedAliasesCount) {
    log('exposing ' + expandedAliasesCount + ' aliases.')

    results.forEach(function mapFullAliasPaths(result){
      result.aliases.forEach(function ignoreAlias(aliasGroup){
        var aliasNames = Object.keys(aliasGroup)
          , realityPath = path.join(processCwd, aliasGroup[aliasNames[0]])

        // console.log(aliasNames[0])

        realPaths.push(realityPath)
        // b.require(realityPath)
        // b.ignore(aliasGroup[aliasNames[0]])
        aliasNames.forEach(function addToAliasMap(alias){
          aliasMap[alias] = realityPath
        })
      })
    })

    // FIXME: don't modify private parts of browserify
    // this is dirty, and a feel like a lesser human, but… it works. I've spent
    // months trying to figure out the browserify pipeline to work and… sqaut.
    // so, this works. Fuck it.
    _.defaults(b._mdeps.options.modules, aliasMap)
  }
  else {
    log('no aliases found to expose.')
  }
}

// expects to be called with the context of a bundle
eachFile = function eachFile(b, file, pattern){
  var cwd = pattern.cwd || processCwd
    // we'll send the process-relative path to aliasify
    , aliasifyFilePath = './' + path.relative(process.cwd(), path.resolve(path.join(cwd, file)))
    // we'll use the relative path to create our alias
    , relativeFilePath = file.replace(cwd, '')
    // append the expose path
    , alias = path.join(pattern.expose || '', relativeFilePath)
    , extStripper = new RegExp('(.*?)(' + b._extensions.join('$|\\') + ')$')
    , splitPath = alias.split(path.sep)
    , expandedAliases = {}

  // accomadate both windows and *nix file paths
  _.each(['/', '\\'], function forEachSep(sep){
    var aliasPath = splitPath.join(sep)
      , aliasWithNoExt = aliasPath.match(extStripper)
      , lastIndex

    // expose both with and with out the js extension to match normal require behavior
    expandedAliases[aliasPath] = aliasifyFilePath
    // if the file ext matches a known browserify extension, alias it, without the extensions
    if (aliasWithNoExt && aliasWithNoExt[1]){
      expandedAliases[aliasWithNoExt[1]] = aliasifyFilePath
    }

    // if the filter option is passed, call it with the alias and add it's result
    if (pattern.filter){
      if (sep === path.sep){
        expandedAliases[pattern.filter(aliasPath, path.dirname(aliasPath), path.basename(aliasPath))] = aliasifyFilePath
      }
      else {
        lastIndex = aliasPath.lastIndexOf(sep)
        if (lastIndex < 0){
          expandedAliases[pattern.filter(aliasPath, '.', aliasPath).split(path.sep).join(sep)] = aliasifyFilePath
        }
        else {
          expandedAliases[pattern.filter(aliasPath
            , aliasPath.substring(0, lastIndex)
            , aliasPath.substring(lastIndex + 1)).split(path.sep).join(sep)] = aliasifyFilePath
        }
      }
    }
  })

  return expandedAliases
}

// expects to be called with the context of a bundle
eachPattern = function forEachPattern(b, pattern){
  // TODO: it would be nice to go back to this being async, but I'm not sure if
  // browserify will cooperate
  var realityFiles = glob.sync(pattern.src, pattern)
    , parsedFiles = realityFiles.map(function getAliases(file){
      return eachFile(b, file, pattern)
    })

  // emit the files we found and their alias mappings as one object
  b.emit('remapify:files', realityFiles, _.assign.apply(_, parsedFiles), pattern)

  return {pattern: pattern, aliases: parsedFiles}
}

module.exports = function remapify(b, options){
  var patterns
    , aliasPatterns

  options = _.defaults(options || {}, {
    config: {
      verbose: false
    }
  })

  patterns = _.isArray(options)
    ? _.clone(options)
    : [_.clone(options)]

  setLogger(options.config.verbose)

  aliasPatterns = patterns.map(function findAliasesForPattern(pattern){
    return eachPattern(b, pattern)
  })

  transformAliases(b, aliasPatterns)
}
