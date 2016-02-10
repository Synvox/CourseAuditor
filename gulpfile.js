var gulp = require("gulp");

var fs = require("fs");
var browserify = require("browserify");
var babel = require('gulp-babel');

var riot = require('gulp-riot');
var concat = require('gulp-concat');

var watch = require('gulp-watch');
var plumber = require('gulp-plumber');

gulp.task('default', ['riot','babel','browserify']);

gulp.task("babel", function () {
  watch('./js/*.js',function(){
    gulp.src('./js/main.js')
      .pipe(plumber())
      .pipe(babel({
        presets: ['es2015']
      }))
      .pipe(concat('main.es6.js'))
      .pipe(gulp.dest('./public'));
  });
});

gulp.task("browserify", function () {
  watch('./public/main.es6.js',function(){
    browserify({ debug: true })
      .require('./public/main.es6.js', { entry: true })
      .bundle()
      .on("error", function (err) { console.log("Error: " + err.message); })
      .pipe(fs.createWriteStream('./public/main.bundle.js'));
  });
});

gulp.task('riot', function() {
  watch('tags/*.html',function(){
    gulp.src('tags/*.html')
      .pipe(plumber())
      .pipe(riot({
        type: 'babel',
        parsers: {
          css: 'less'
        }
      }))
      .pipe(babel({
          presets: ['es2015']
      }))
      .pipe(concat('tags.js'))
      .on("error", function (err) { console.log("Error: " + err.message); })
      .pipe(gulp.dest('public'))
  })
})
