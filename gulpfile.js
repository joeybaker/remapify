'use strict';

var gulp = require('gulp')
  , cache = require('gulp-cached')
  , jshint = require('gulp-jshint')
  , jshintStylish = require('jshint-stylish')
  , jscs = require('gulp-jscs')
  , execFile = require('child_process').execFile
  , exec = require('child_process').exec
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
})

gulp.task('publish', ['lint'], function(done){
  var end = function end(err){
      if (err) return done(err)

      count--
      if (count === 0) done()
    }
    , count = 2

  execFile('./sh/git/isclean.sh', null, {cwd: __dirname}, function(err, stdout, stderr){
    end(err || stderr)
  })

  exec('git pull --rebase origin master', null, {cwd: __dirname}, function(err, stdout, stderr){
    stdout.pipe(console.log)
    end(err || stderr)
  })

})
