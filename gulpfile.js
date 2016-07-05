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
  src: './src/',
  tmp: './.tmp/',
  dist: './dist/',
  html: '**/*.html',
  sass: 'sass/**/*.scss',
  css: 'css/**/*.css',
  js: 'js/**/*.js'
};


// Compile sass
gulp.task('sass', function() {
  var sassOptions = {
    errLogToConsole: true,
    includePaths: ['./bower_components'],
    outputStyle: 'compressed',
    precision: 5
  };

  return gulp.src(paths.src + paths.sass)
    .pipe(sourcemaps.init())
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('./maps', { cwd: paths.tmp }))
    .pipe(gulp.dest('./css', { cwd: paths.tmp }))
    .pipe(browserSync.stream())
});


// Lint Sass
gulp.task('lint', function() {
  var scssLintOptions = {
    config: 'scss-lint.yml',
  }

  return gulp.src(paths.src + paths.sass)
    .pipe(cache('scsslint'))
    .pipe(scsslint(scssLintOptions))
});


// Copy HTML
gulp.task('html', function() {
  return gulp.src(paths.src + paths.html)
    .pipe(gulp.dest('./', { cwd: paths.tmp }))
});


// Create server
gulp.task('serve', ['sass', 'html'], function() {
  browserSync.init({
    server: {
      baseDir: paths.tmp
    }
  });

  gulp.watch(paths.sass, { cwd: paths.src }, ['sass']);
  gulp.watch(paths.html, { cwd: paths.src }, ['html']);
  gulp.watch(paths.html, { cwd: paths.tmp }).on('change', reload);
});
