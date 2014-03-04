Remapify
=======================

[![NPM](https://nodei.co/npm/remapify.png)](https://nodei.co/npm/remapify/) [![Build Status](https://travis-ci.org/joeybaker/remapify.png?branch=master)](https://travis-ci.org/joeybaker/remapify)

A [Browserify](https://github.com/substack/node-browserify) plugin to map whole directories as different directories to browserify. This is useful if you have a common batch of files that you don't want to have to refer to relatively all the time.

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
  , b = browserify(_dirname)

b.plugin(remapify, [
  {
    src: './client/views/**/*.js' // glob for the files to remap
    , expose: 'views' // this will expose `__dirname + /client/views/home.js` as `views/home.js`
    , cwd: __dirname // defaults to process.cwd()
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

## tests
All tests are mocha. You can run them with either `npm test` or `mocha test`.

## Changelog
See `CHANGELOG.md`
