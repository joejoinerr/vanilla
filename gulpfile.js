/**
 * Import task runners
 */

var gulp = require('gulp'),
    cache = require('gulp-cached'),
    sass = require('gulp-sass'),
    scsslint = require('gulp-scss-lint'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    browserSync = require('browser-sync').create();


/**
 * Input paths
 */

var paths = {
  sass: './sass/**/*.scss',
  html: './**/*.html'
};


/**
 * Options vars
 */

var sassOptions = {
  errLogToConsole: true,
  includePaths: ['./bower_components'],
  outputStyle: 'compressed',
  precision: 5
};


/**
 * Compile sass
 */

gulp.task('sass', function() {
  return gulp.src(paths.sass)
    .pipe(sourcemaps.init())
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest('./css'))
});


/**
 * Lint Sass
 */

gulp.task('lint', function() {
  return gulp.src(paths.sass)
    .pipe(cache('scsslint'))
    .pipe(scsslint({
      endless: true
    }))
});


/**
 * Reload HTML
 */

gulp.task('html', function() {
  gulp.src(paths.html)
    .pipe(browserSync.reload({ stream: true }))
});


/**
 * Master watch
 */

gulp.task('watch', function() {
  return gulp
    .watch(paths.sass, ['sass'])
      .on('change', function(event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
      })
});


/**
 * Register default tasks
 */

gulp.task('default', ['sass', 'watch']);
