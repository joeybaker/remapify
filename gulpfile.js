'use strict';

var gulp = require('gulp')
  , gutil = require('gulp-util')
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
  gutil.log(gutil.colors.green('Possible Commands\n'))
  Object.keys(gulp.tasks).sort().forEach(function(task){
    gutil.log('  -', task)
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
    .pipe(bump({
      type: argv.bump || 'patch'
      , indent: 2
    }))
    .pipe(gulp.dest('./'))
})

gulp.task('gitPrep', function(done){
  require('child_process').spawn('sh', ['./sh/git/isclean.sh'], {cwd: __dirname, stdio: 'inherit'})
    .on('close', done)
})

gulp.task('gitPull', ['gitPrep'], function(done){
  // TODO: disable until https://github.com/stevelacy/gulp-git/pull/9 is merged.
  // git.pull('origin', 'master', {args: '--rebase'}, done)
  require('child_process').spawn('git', ['pull', '--rebase', 'origin', 'master'], {stdio: 'inherit', cwd: __dirname})
    .on('close', done)
})

gulp.task('gitCommit', ['bump'], function(){
  var pkg = require('./package.json')

  return gulp.src('./package.json')
    .pipe(git.commit(pkg.version))
})

gulp.task('tag', ['gitCommit'], function(done){
  var pkg = require('./package.json')

  git.tag('v' + pkg.version, pkg.version, null, done)
})

gulp.task('gitPush', ['tag'], function(done){
  git.push('origin', 'master', {args: '--tags'}, done)
})

gulp.task('publish', ['gitPush'], function(done){
  require('child_process').spawn('npm', ['publish'], {stdio: 'inherit', cwd: __dirname})
    .on('close', done)
})
