/* global describe, it, beforeEach, afterEach */
'use strict';

// NOTE: when testing paths, it's important to use `path.join` for
// windows compatibility

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
    b.transform = sinon.stub()
    b._extensions = ['.js', '.json']
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
      expandedAliases.should.contain.keys(
        'path/a.js'
        , 'path/b.js'
        , 'path/nested/a.js'
        , 'path/nested/c.js'
        , 'path\\a.js'
        , 'path\\b.js'
        , 'path\\nested\\a.js'
        , 'path\\nested\\c.js'
      )
      expandedAliases['path/a.js'].should.equal(path.resolve(__dirname, './fixtures/target/a.js'))
      expandedAliases['path\\a.js'].should.equal(path.resolve(__dirname, './fixtures/target/a.js'))

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
      expandedAliases.should.contain.keys(
        'a.js'
        , 'b.js'
        , 'nested/a.js'
        , 'nested/c.js'
        , 'nested\\a.js'
        , 'nested\\c.js'
      )
      expandedAliases['a.js'].should.equal(path.resolve(__dirname, './fixtures/target/a.js'))

      b.emit.should.not.have.been.calledWith('error')

      done()
    })
  })

  it('aliases with and without the `.js` extension', function(done){
    plugin(b, [{
      src: '**/*.js'
      , cwd: './test/fixtures/target'
    }])

    b.on('remapify:files', function(files, expandedAliases){
      expandedAliases.should.contain.keys(
        'a.js'
        , 'a'
      )
      expandedAliases['a.js'].should.equal(path.resolve(__dirname, './fixtures/target/a.js'))
      expandedAliases.a.should.equal(path.resolve(__dirname, './fixtures/target/a.js'))

      b.emit.should.not.have.been.calledWith('error')

      done()
    })
  })

  it('works with non-standard extensions', function(done){
    // setup
    b._extensions = b._extensions.concat('.coffee')

    plugin(b, [{
      src: '**/*.coffee'
      , cwd: './test/fixtures/target'
    }])

    b.on('remapify:files', function(files, expandedAliases){
      expandedAliases.should.contain.keys(
        'c.coffee'
        , 'c'
      )
      expandedAliases['c.coffee'].should.equal(path.resolve(__dirname, './fixtures/target/c.coffee'))
      expandedAliases.c.should.equal(path.resolve(__dirname, './fixtures/target/c.coffee'))

      b.emit.should.not.have.been.calledWith('error')

      // cleanup
      b._extensions.pop()
      done()
    })
  })

  it('works with absolute `cwd` paths', function(done){
    plugin(b, [{
      src: './**/*.js'
      , cwd: path.join(__dirname, 'fixtures/target')
    }])

    b.on('remapify:files', function(files, expandedAliases){
      expandedAliases.should.contain.keys(
        'a.js'
        , 'b.js'
        , 'nested/a.js'
        , 'nested/c.js'
        , 'nested\\a.js'
        , 'nested\\c.js'
      )
      expandedAliases['a.js'].should.equal(path.resolve(__dirname, './fixtures/target/a.js'))

      b.emit.should.not.have.been.calledWith('error')

      done()
    })
  })

  it('works with relative `cwd` paths', function(done){
    plugin(b, [{
      src: './**/*.js'
      , cwd: './test/fixtures/target'
    }])

    b.on('remapify:files', function(files, expandedAliases){
      expandedAliases.should.contain.keys(
        'a.js'
        , 'b.js'
        , 'nested/a.js'
        , 'nested/c.js'
        , 'nested\\a.js'
        , 'nested\\c.js'
      )
      expandedAliases['a.js'].should.equal(path.resolve(__dirname, './fixtures/target/a.js'))

      b.emit.should.not.have.been.calledWith('error')

      done()
    })
  })

  it('calls `b.transform` on all expanded aliases', function(done){
    plugin(b, [{
      src: './**/*.js'
      , expose: 'path'
      , cwd: './test/fixtures/target'
    }])

    b.on('remapify:files', function(){
      // wait for the callstack to clear since the event is triggered before b.transform is called.
      setImmediate(function(){
        b.transform.should.have.been.calledOnce
        done()
      })
    })
  })

  it('works with the filter option', function(done){
    plugin(b, [{
      src: './**/*.js'
      , cwd: './test/fixtures/target'
      , filter: function(alias, dirname, basename){
        return path.join(dirname, '_' + basename)
      }
    }])

    b.on('remapify:files', function(files, expandedAliases){
      expandedAliases.should.contain.keys(
        '_a.js'
        , '_b.js'
        , 'nested/_a.js'
        , 'nested/_c.js'
        , 'nested\\_a.js'
        , 'nested\\_c.js'
      )
      expandedAliases['_a.js'].should.equal(path.resolve(__dirname, './fixtures/target/a.js'))

      b.emit.should.not.have.been.calledWith('error')

      done()
    })
  })

})
