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

## tests
All tests are mocha. You can run them with either `npm test` or `mocha test`.

## Changelog
See `CHANGELOG.md`
