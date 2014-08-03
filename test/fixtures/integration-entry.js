'use strict';
var a = require('things/a.js')
  , b = require('nocwd/test/fixtures/target/b.js')

module.exports = function(){
  a()
  b()
}
