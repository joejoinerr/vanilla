/**
 *
 * Vanilla Boilerplate
 * Copyright 2016 Joe Joiner.
 *
 */


// Import task runners
var gulp = require('gulp'),
    cache = require('gulp-cached'),
    sass = require('gulp-sass'),
    scsslint = require('gulp-scss-lint'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    browserSync = require('browser-sync').create(),
    reload = browserSync.reload;


// Input paths
var paths = {
  src: './src',
  tmp: './.tmp',
  dist: './dist',
  html: '/**/*.html',
  sass: '/sass/**/*.scss',
  css: '/css/**/*.css',
  js: '/js/**/*.js'
};


// Options vars
var scssLintOptions = {
  config: 'scss-lint.yml',
}


// Compile sass
gulp.task('sass', function() {
  var sassOptions = {
    errLogToConsole: true,
    includePaths: ['./bower_components'],
    outputStyle: 'compressed',
    precision: 5
  };

  return gulp.src(paths.sass)
    .pipe(sourcemaps.init())
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('./maps', { cwd: paths.tmp }))
    .pipe(gulp.dest('./css', { cwd: paths.tmp }))
    .pipe(reload({ stream: true }))
});


// Lint Sass
gulp.task('lint', function() {
  return gulp.src(paths.sass)
    .pipe(cache('scsslint'))
    .pipe(scsslint(scssLintOptions))
});


// Create server
gulp.task('serve', ['sass'], function() {
  browserSync({
    server: {
      baseDir: paths.tmp
    }
  });

  gulp.watch([paths.html, paths.css, paths.js], { cwd: paths.tmp }, reload)
});
