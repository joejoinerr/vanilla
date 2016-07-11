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
    htmlmin = require('gulp-htmlmin'),
    cleancss = require('gulp-cleancss'),
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
  js: 'js/**/*.js',
  img: 'img/**/*.{png,jpg,svg,gif}'
};


// Copy HTML
gulp.task('html', function() {
  return gulp.src(paths.src + paths.html)
    .pipe(gulp.dest('./', { cwd: paths.tmp }))
});


// Minify HTML
gulp.task('htmlmin', ['html'], function() {
  var htmlMinOptions = {
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    removeComments: true,
    removeEmptyAttributes: true,
    removeEmptyElements: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true
  }

  return gulp.src(paths.tmp + paths.html)
    .pipe(htmlmin(htmlMinOptions))
    .pipe(gulp.dest('./', { cwd: paths.dist }))
});


// Compile sass
gulp.task('sass', function() {
  var sassOptions = {
    errLogToConsole: true,
    includePaths: ['./bower_components'],
    outputStyle: 'expanded',
    precision: 2
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
  // Options vars
  var scssLintOptions = {
    config: 'scss-lint.yml',
  }

  return gulp.src(paths.src + paths.sass)
    .pipe(cache('scsslint'))
    .pipe(scsslint(scssLintOptions))
});


// Minify CSS
gulp.task('cssmin', ['sass'], function() {
  var cleanCSSOptions = {
    debug: true,
    rebase: false
  }

  return gulp.src(paths.tmp + paths.css)
    .pipe(cleancss(cleanCSSOptions))
    .pipe(gulp.dest('./css', { cwd: paths.dist }))
});


// Copy images
gulp.task('img', function() {
  return gulp.src(paths.src + paths.img)
    .pipe(gulp.dest('./img', { cwd: paths.tmp }))
    .pipe(gulp.dest('./img', { cwd: paths.dist }))
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


// Compile for production
gulp.task('dist', ['cssmin', 'htmlmin', 'img']);
