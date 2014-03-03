'use strict';

var gulp = require('gulp')
  , cache = require('gulp-cached')
  , jshint = require('gulp-jshint')
  , jshintStylish = require('jshint-stylish')
  , jscs = require('gulp-jscs')
  , git = require('gulp-git')
  , todo = require('gulp-todo')
  , execFile = require('child_process').execFile
  , mocha = require('gulp-mocha')
  , plumber = require('gulp-plumber')
  , argv = require('minimist')(process.argv.slice(2)) || {}
  , bump = require('gulp-bump')
  , paths = {
    app: ['./lib/**/*.js', './index.js']
    , tests: ['./test/**/*.js']
    , meta: ['./gulpfile.js']
  }

gulp.task('default', function(){
  console.log('Possible Commands\n')
  Object.keys(gulp.tasks).forEach(function(task){
    console.log(task)
  })
})

gulp.task('lint', function(){
  return gulp.src(paths.app.concat(paths.tests, paths.meta))
    .pipe(cache('linting'))
    .pipe(jshint())
    .pipe(jshint.reporter(jshintStylish))
    .pipe(jshint.reporter('fail'))
    .pipe(jscs())
    .pipe(todo({
      fileName: 'TODO.md'
    }))
    .pipe(gulp.dest('./'))
})

gulp.task('gitPrep', function(done){
  execFile('./sh/git/isclean.sh', null, {cwd: __dirname, stdio: 'inherit'}, done)
})

gulp.task('gitPull', ['gitPrep'], function(){
  return gulp.src('./')
    git.pull('origin', 'master', {args: '--rebase'})
})

gulp.task('test', ['lint'], function(){
  return gulp.src('test/**/*.js')
    .pipe(cache('test'))
    .pipe(mocha({
      ui: 'bdd'
      , reporter: 'dot'
    }))
})

gulp.task('bump', ['gitPull', 'test'], function(){
  return gulp.src('./package.json')
    .pipe(plumber())
    .pipe(bump({
      type: argv.bump || 'patch'
      , indent: 2
    }))
    .pipe(gulp.dest('./'))
})

gulp.task('gitCommit', ['bump'], function(){
  var pkg = require('./package.json')

  return gulp.src('./package.json')
    .pipe(git.commit(pkg.version))
})

gulp.task('tag', ['gitCommit'], function(){
  var pkg = require('./package.json')

  return gulp.src('./')
    .pipe(git.tag('v' + pkg.version, pkg.version))
})

gulp.task('push', ['tag'], function(){
  return gulp.src('./')
    .pipe(git.push('origin', 'master', {args: '--tags'}))
})

gulp.task('publish', ['push'], function(done){
  require('child_process').spawn('npm', ['publish'], {stdio: 'inherit'})
    .on('close', done)
})
