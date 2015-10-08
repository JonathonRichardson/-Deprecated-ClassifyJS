var gulp         = require('gulp'),
    sass         = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss    = require('gulp-minify-css'),
    jshint       = require('gulp-jshint'),
    uglify       = require('gulp-uglify'),
    imagemin     = require('gulp-imagemin'),
    rename       = require('gulp-rename'),
    concat       = require('gulp-concat'),
    notify       = require('gulp-notify'),
    cache        = require('gulp-cache'),
    livereload   = require('gulp-livereload'),
    replace      = require('gulp-replace'),
    bump         = require('gulp-bump'),
    del          = require('del');

gulp.task('bump', function(){
  return gulp.src(['package.json'])
  .pipe(bump())
  .pipe(gulp.dest('./'));
});

gulp.task('clean', function(cb) {
  del(['dist']);
  cb();
});

gulp.task('js', ['clean', 'bump'], function() {
  var fs = require('fs')
  var json = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  var version = json.version;

  return gulp.src('src/**/*.js')
    .pipe(concat('classify.js'))

    //Update the version number from the source file
    .pipe(replace('{{VERSION}}', version)) 

    .pipe(gulp.dest('dist'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('dist'))
    .pipe(notify({ message: 'Scripts task complete' }));
});

gulp.task('default', ['js']);
