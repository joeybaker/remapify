'use strict';

var gulp = require('gulp')
  , cache = require('gulp-cached')
  , jshint = require('gulp-jshint')
  , jshintStylish = require('jshint-stylish')
  , jscs = require('gulp-jscs')
  , git = require('gulp-git')
  , todo = require('gulp-todo')
  , mocha = require('gulp-mocha')
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
    // .pipe(jshint.reporter('fail'))
    .pipe(jscs())
    .pipe(todo({
      fileName: 'TODO.md'
    }))
})

gulp.task('gitPrep', function(done){
  require('child_process').spawn('sh', ['./sh/git/isclean.sh'], {cwd: __dirname, stdio: 'inherit'})
    .on('close', done)
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
  console.log(argv.bump || 'patch')
  return gulp.src('./package.json')
    .pipe(bump({
      type: argv.bump || 'patch'
      , indent: 2
    }))
    .pipe(gulp.dest('./'))
})

gulp.task('gitCommit', ['bump'], function(done){
  var pkg = require('./package.json')

  gulp.src('./package.json')
    .pipe(git.commit(pkg.version))
    .on('end', done)
})

gulp.task('tag', ['gitCommit'], function(done){
  var pkg = require('./package.json')

  gulp.src('./')
    .pipe(git.tag('v' + pkg.version, pkg.version))
    .on('end', done)
})

gulp.task('gitPush', ['tag'], function(){
  return gulp.src('./')
    .pipe(git.push('origin', 'master', {args: '--tags'}))
})

gulp.task('publish', ['gitPush'], function(done){
  require('child_process').spawn('npm', ['publish'], {stdio: 'inherit', cwd: __dirname})
    .on('close', done)
})
