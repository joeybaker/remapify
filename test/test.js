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

// jscs:disable disallowAnonymousFunctions
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

    plugin(b, [{src: './test/fixtures/target/**/*.js', expose: 'path'}])
  })

  it('works with the `cwd` option', function(done){
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

    plugin(b, [{
      src: './fixtures/target/**/*.js'
      , expose: 'path'
      , cwd: './test'
    }])
  })

  it('exposes the files under a different alias', function(done){
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

      expandedAliases['path/a.js'].split(path.sep).join('/').should.equal('./test/fixtures/target/a.js')
      expandedAliases['path\\a.js'].split(path.sep).join('/').should.equal('./test/fixtures/target/a.js')

      b.emit.should.not.have.been.calledWith('error')

      done()
    })

    plugin(b, [{
      src: './**/*.js'
      , expose: 'path'
      , cwd: './test/fixtures/target'
    }])
  })

  it('works without the expose option', function(done){
    b.on('remapify:files', function(files, expandedAliases){
      expandedAliases.should.contain.keys(
        'a.js'
        , 'b.js'
        , 'nested/a.js'
        , 'nested/c.js'
        , 'nested\\a.js'
        , 'nested\\c.js'
      )
      expandedAliases['a.js'].split(path.sep).join('/').should.equal('./test/fixtures/target/a.js')

      b.emit.should.not.have.been.calledWith('error')

      done()
    })

    plugin(b, [{
      src: './**/*.js'
      , cwd: './test/fixtures/target'
    }])
  })

  it('aliases with and without the `.js` extension', function(done){
    b.on('remapify:files', function(files, expandedAliases){
      expandedAliases.should.contain.keys(
        'a.js'
        , 'a'
      )
      expandedAliases['a.js'].split(path.sep).join('/').should.equal('./test/fixtures/target/a.js')
      expandedAliases.a.split(path.sep).join('/').should.equal('./test/fixtures/target/a.js')

      b.emit.should.not.have.been.calledWith('error')

      done()
    })

    plugin(b, [{
      src: '**/*.js'
      , cwd: './test/fixtures/target'
    }])
  })

  it('works with non-standard extensions', function(done){
    // setup
    b._extensions = b._extensions.concat('.coffee')

    b.on('remapify:files', function(files, expandedAliases){
      expandedAliases.should.contain.keys(
        'c.coffee'
        , 'c'
      )
      expandedAliases['c.coffee'].split(path.sep).join('/').should.equal('./test/fixtures/target/c.coffee')
      expandedAliases.c.split(path.sep).join('/').should.equal('./test/fixtures/target/c.coffee')

      b.emit.should.not.have.been.calledWith('error')

      // cleanup
      b._extensions.pop()
      done()
    })

    plugin(b, [{
      src: '**/*.coffee'
      , cwd: './test/fixtures/target'
    }])
  })

  it('works with absolute `cwd` paths', function(done){
    b.on('remapify:files', function(files, expandedAliases){
      expandedAliases.should.contain.keys(
        'a.js'
        , 'b.js'
        , 'nested/a.js'
        , 'nested/c.js'
        , 'nested\\a.js'
        , 'nested\\c.js'
      )
      expandedAliases['a.js'].split(path.sep).join('/').should.equal('./test/fixtures/target/a.js')

      b.emit.should.not.have.been.calledWith('error')

      done()
    })

    plugin(b, [{
      src: './**/*.js'
      , cwd: path.join(__dirname, 'fixtures/target')
    }])
  })

  it('works with relative `cwd` paths', function(done){
    b.on('remapify:files', function(files, expandedAliases){
      expandedAliases.should.contain.keys(
        'a.js'
        , 'b.js'
        , 'nested/a.js'
        , 'nested/c.js'
        , 'nested\\a.js'
        , 'nested\\c.js'
      )
      expandedAliases['a.js'].split(path.sep).join('/').should.equal('./test/fixtures/target/a.js')

      b.emit.should.not.have.been.calledWith('error')

      done()
    })

    plugin(b, [{
      src: './**/*.js'
      , cwd: './test/fixtures/target'
    }])
  })

  it('works with a `src` that has more than a pattern', function(done){
    b.on('remapify:files', function(files, expandedAliases){
      expandedAliases.should.contain.keys(
        'target/a.js'
        , 'target/b.js'
        , 'target/nested/a.js'
        , 'target/nested/c.js'
        , 'target\\nested\\a.js'
        , 'target\\nested\\c.js'
      )
      expandedAliases['target/a.js'].split(path.sep).join('/').should.equal('./test/fixtures/target/a.js')

      b.emit.should.not.have.been.calledWith('error')

      done()
    })

    plugin(b, [{
      src: path.join('target', '**/*.js')
      , cwd: path.join('./test', 'fixtures')
    }])
  })

  it('calls `b.transform` on all expanded aliases', function(done){
    b.on('remapify:files', function(){
      // wait for the callstack to clear since the event is triggered before b.transform is called.
      setImmediate(function(){
        b.transform.should.have.been.calledOnce
        done()
      })
    })

    plugin(b, [{
      src: './**/*.js'
      , expose: 'path'
      , cwd: path.join(__dirname, 'fixtures', 'target')
    }])
  })

  it('works with the filter option', function(done){
    b.on('remapify:files', function(files, expandedAliases){
      expandedAliases.should.contain.keys(
        '_a.js'
        , '_b.js'
        , 'nested/_a.js'
        , 'nested/_c.js'
        , 'nested\\_a.js'
        , 'nested\\_c.js'
      )
      expandedAliases['_a.js'].split(path.sep).join('/').should.equal('./test/fixtures/target/a.js')

      b.emit.should.not.have.been.calledWith('error')

      done()
    })

    plugin(b, [{
      src: './**/*.js'
      , cwd: './test/fixtures/target'
      , filter: function(alias, dirname, basename){
        return path.join(dirname, '_' + basename)
      }
    }])
  })
})
