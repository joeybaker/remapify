/* global describe, it, beforeEach, afterEach */
'use strict';

var sinon = require('sinon')
  , chai = require('chai')
  , plugin = require('../lib/remapify.js')
  , aliasify = require('aliasify')
  , should = chai.should()
  , path = require('path')
  , Emitter = require('events').EventEmitter

chai.use(require('sinon-chai'))

describe('remapify', function(){
  var b

  beforeEach(function(){
    b = new Emitter()
    sinon.spy(b, 'emit')
    sinon.stub(aliasify, 'configure')
  })

  afterEach(function(){
    b.emit.restore()
    aliasify.configure.restore()
  })

  it('gets all the files from a glob pattern', function(done){
    should.exist(b)
    plugin(b, [{src: './test/fixtures/target/**/*.js', expose: 'path'}])

    b.on('remapify:files', function(files){
      files.should.deep.equal(
        ['./test/fixtures/target/a.js'
        , './test/fixtures/target/b.js'
        , './test/fixtures/target/nested/a.js'
        , './test/fixtures/target/nested/c.js']
      )

      b.emit.should.not.have.been.calledWith('error')

      done()
    })
  })

  it('works with the `cwd` option', function(done){
    plugin(b, [{
      src: './fixtures/target/**/*.js'
      , expose: 'path'
      , cwd: './test'
    }])

    b.on('remapify:files', function(files){
      files.should.deep.equal(
        ['./fixtures/target/a.js'
        , './fixtures/target/b.js'
        , './fixtures/target/nested/a.js'
        , './fixtures/target/nested/c.js']
      )

      b.emit.should.not.have.been.calledWith('error')

      done()
    })
  })

  it('exposes the files under a different alias', function(done){
    plugin(b, [{
      src: './**/*.js'
      , expose: 'path'
      , cwd: './test/fixtures/target'
    }])

    b.on('remapify:files', function(files, expandedAliases){
      expandedAliases.should.deep.equal({
        'path/a.js': path.resolve(__dirname, './fixtures/target/a.js')
        , 'path/b.js': path.resolve(__dirname, './fixtures/target/b.js')
        , 'path/nested/a.js': path.resolve(__dirname, './fixtures/target/nested/a.js')
        , 'path/nested/c.js': path.resolve(__dirname, './fixtures/target/nested/c.js')
      })

      b.emit.should.not.have.been.calledWith('error')

      done()
    })
  })

  it('works without the expose option', function(done){
    plugin(b, [{
      src: './**/*.js'
      , cwd: './test/fixtures/target'
    }])

    b.on('remapify:files', function(files, expandedAliases){
      expandedAliases.should.deep.equal({
        'a.js': path.resolve(__dirname, './fixtures/target/a.js')
        , 'b.js': path.resolve(__dirname, './fixtures/target/b.js')
        , 'nested/a.js': path.resolve(__dirname, './fixtures/target/nested/a.js')
        , 'nested/c.js': path.resolve(__dirname, './fixtures/target/nested/c.js')
      })

      b.emit.should.not.have.been.calledWith('error')

      done()
    })
  })
})
