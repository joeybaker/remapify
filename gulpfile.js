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
  , argv = require('minimist')(process.argv.slice(2))
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
  var end = function end(err){
      if (err) return done(err)

      count--
      if (count === 0) done()
    }
    , count = 1
    execFile

  execFile('./sh/git/isclean.sh', null, {cwd: __dirname}, function(err, stdout, stderr){
    if (err || stderr) end(err || stderr)

    git.pull('origin', 'master', {args: '--rebase'})
  })

})

gulp.task('test', ['lint'], function(){
  return gulp.src('test/**/*.js')
    .pipe(cache('test'))
    .pipe(mocha({
      ui: 'bdd'
      , reporter: 'dot'
    }))
})

gulp.task('bump', function(){
  return gulp.src('./package.json')
    .pipe(bump({
      type: argv.bump || 'patch'
      , indent: 2
    }))
})

gulp.task('tag', function(){
  var pkg = require('./package.json')

  return gulp.src('./')
    .pipe(git.commit(pkg.version))
    .pipe(git.tag('v' + pkg.version, pkg.version))
    .pipe(git.push('origin', 'master', {args: '--tags'}))
    .pipe(gulp.dest('./'))
})

gulp.task('publish', ['gitPrep', 'lint', 'test', 'bump', 'tag'], function(done){
  require('child_process').spawn('npm', ['publish'], {stdio: 'inherit'})
    .on('close', done)
})
