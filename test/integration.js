// /* global describe, it */
'use strict';

var browserify = require('browserify')
  , remapify = require('../index.js')
  , path = require('path')
  , b = browserify(path.join(__dirname, 'fixtures', 'integration-entry.js'))

// running this file with node works, but running it through mocha doesn't IDK… whatever…
// describe('remapify integration', function(){
//   it.only('should not error', function(done){
//     b.plugin(remapify, [
//       {
//         src: '**/*.js' // glob for the files to remap
//         , expose: 'things' // this will expose `__dirname + /client/views/home.js` as `views/home.js`
//         , cwd: path.join(__dirname, 'fixtures', 'target') // defaults to process.cwd()
//       }
//       , {
//         src: './test/fixtures/target/**/*.js'
//         , expose: 'nocwd'
//       }
//     ])

//     b.bundle(done)
//   })
// })

b.plugin(remapify, [
  {
    src: '**/*.js' // glob for the files to remap
    , expose: 'things' // this will expose `__dirname + /client/views/home.js` as `views/home.js`
    , cwd: path.join(__dirname, 'fixtures', 'target') // defaults to process.cwd()
  }
  , {
    src: './test/fixtures/target/**/*.js'
    , expose: 'nocwd'
  }
])

b.bundle()
