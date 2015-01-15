Remapify
=======================
[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/joeybaker/remapify?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![NPM](https://nodei.co/npm/remapify.png)](https://nodei.co/npm/remapify/) [![Build Status](https://travis-ci.org/joeybaker/remapify.png?branch=master)](https://travis-ci.org/joeybaker/remapify)

A [Browserify](https://github.com/substack/node-browserify) plugin to map whole directories as different directories to browserify. This is useful if you have a common batch of files that you don't want to have to refer to relatively all the time.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](http://doctoc.herokuapp.com/)*

- [Why](#why)
- [Usage](#usage)
  - [options `[{}]`](#options-)
    - [`src`](#src)
    - [`expose`](#expose)
    - [`cwd` (optional)](#cwd-optional)
    - [`filter` (optional)](#filter-optional)
    - [glob options](#glob-options)
  - [events](#events)
    - [`b.on('remapify:file', function(file, expandedAliases, globber, pattern){})`](#bonremapifyfile-functionfile-expandedaliases-globber-pattern)
    - [`b.on('remapify:files', function(file, expandedAliases, globber, pattern){})`](#bonremapifyfiles-functionfile-expandedaliases-globber-pattern)
- [Tests](#tests)
- [Development](#development)
- [Changelog](#changelog)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Why

Suppose you've got an app structure that looks like

```
app
  - views
    - home
      index.js
    - people
      index.js
      _avatar.js
      _description.js
  - models
    person.js
```

```js
// _avatar.js
  // this gets really old after a while, and is prone to breaking if you change the directory hiearchy.
  var person = require('../../models/person.js')
  // This is much better
  var person = require('models/person.js')
```

## Usage
```js
var browserify = require('browserify')
  , remapify = require('remapify')
  , b = browserify(__dirname)

b.plugin(remapify, [
  {
    src: './client/views/**/*.js' // glob for the files to remap
    , expose: 'views' // this will expose `__dirname + /client/views/home.js` as `views/home.js`
    , cwd: __dirname // defaults to process.cwd()
    , filter: function(alias, dirname, basename) { // customize file names
      return path.join(dirname, basename.replace('foo', 'bar'))
    }
  }
])

b.bundle()
```

### options `[{}]`
Array of objects. Each object is one remapping.

#### `src`
Glob pattern to find the files to remap.

#### `expose`
Replace the `cwd` of each file in `src` with this value.

#### `cwd` (optional)
Specify the 'current working directory' for the glob pattern to start from and for the `expose` option to replace.

#### `filter` (optional)
Alter the file name on the fly. For example, if you wanted to require `_avatar.js` as `require('avatar')` you could do:

```js
var path = require('path')
b.plugin(remapify, [
  {
    src: './**/*.js'
    , filter: function(alias, dirname, basename) {
      return path.join(dirname, basename.replace(/^\_(.*)\.js$/, '$1'))
    }
  }
]);
```

#### glob options
All options specified by the [glob](https://www.npmjs.org/package/glob) module can be used as well.

### events
Remapify will emit events while processing. This is implemented to make testing easier, but… maybe it'll be useful for other things. The events are emitted on the bundle.

#### `b.on('remapify:file', function(file, expandedAliases, globber, pattern){})`
Emitted when the globbing finds a file to remap.

* **`file`** The path to the file
* **`expandedAliases`** The list of files and what they will be exposed as as found so far. Includes this file.
* **`globber`** The full [glob instance](https://github.com/isaacs/node-glob#properties).
* **`pattern`** The glob pattern in use.

#### `b.on('remapify:files', function(file, expandedAliases, globber, pattern){})`
Emitted when all files have been found to be remapped.

The arguments are the same as above.

## Tests
All tests are mocha. You can run them with either `npm test` or `mocha test`.

## Development

* Git hooks are installed to make sure nothing goes to wacky.
* TDD with `npm run tdd`
* Release with `npm run release`
* Testing runs jscs and jshint. You can manually run with `npm run lint`

## Changelog
See `CHANGELOG.md`
