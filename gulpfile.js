'use strict'
/**
 *
 * Vanilla Boilerplate
 * by Joe Joiner
 *
 */


/*------------------------------------*\
  #CONFIG
\*------------------------------------*/

// Import task runners

const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();
const pngquant = require('imagemin-pngquant');
const browserSync = require('browser-sync').create();
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const reload = browserSync.reload;


// Input paths

const paths = {
  src: './src/',
  tmp: './.tmp/',
  dist: './dist/',
  html: '**/*.html',
  twig: '**/*.html.twig',
  sass: 'sass/**/*.scss',
  css: 'css/**/*.css',
  js: 'js/**/*.js',
  img: 'img/**/*.+(png|jpg|svg|gif)'
};





/*------------------------------------*\
  #HTML
\*------------------------------------*/

// Render HTML

gulp.task('twig', function() {
  return gulp.src(paths.src + paths.twig)
    .pipe(plugins.twig({
      errorLogToConsole: true,
      extname: false
    }))
    .pipe(gulp.dest(paths.tmp))
});


// Copy HTML to tmp folder

gulp.task('html', function() {
  return gulp.src(paths.src + paths.html)
    .pipe(gulp.dest(paths.tmp))
});


// Copy HTML to build folder

gulp.task('html:dist', ['twig', 'html'], function() {
  return gulp.src(paths.tmp + paths.html)
    .pipe(gulp.dest(paths.dist))
});





/*------------------------------------*\
  #CSS
\*------------------------------------*/

// Compile Sass

gulp.task('css', function() {
  const sassOptions = {
    errLogToConsole: true,
    includePaths: ['./node_modules'],
    outputStyle: 'expanded',
    precision: 2
  };

  return gulp.src(paths.src + paths.sass)
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.sass(sassOptions).on('error', plugins.sass.logError))
    .pipe(plugins.postcss([
      autoprefixer()
    ]))
    .pipe(plugins.sourcemaps.write('./maps'))
    .pipe(gulp.dest(paths.tmp + 'css/'))
    .pipe(browserSync.stream())
});


// Lint Sass

gulp.task('lint', function() {
  const scssLintOptions = {
    config: 'scss-lint.yml'
  }

  return gulp.src(paths.src + paths.sass)
    .pipe(plugins.cached('plugins.scssLint'))
    .pipe(plugins.scssLint(scssLintOptions))
    .pipe(plugins.scssLint.failReporter('E'))
});


// Minify CSS

gulp.task('css:dist', ['css'], function() {
  return gulp.src(paths.tmp + paths.css)
    .pipe(gulp.dest(paths.dist + 'css/')) // Copy unminified
    .pipe(plugins.postcss([cssnano()]))
    .pipe(plugins.rev())
    .pipe(gulp.dest(paths.dist + 'css/'))
    .pipe(plugins.rev.manifest({
      base: paths.dist,
      merge: true
    }))
    .pipe(gulp.dest(paths.dist + 'css/'))
});





/*------------------------------------*\
  #IMAGES
\*------------------------------------*/

// Copy images

gulp.task('img', function() {
  return gulp.src(paths.src + paths.img)
    .pipe(plugins.newer(paths.tmp + paths.img))
    .pipe(gulp.dest(paths.tmp + 'img/'))
});


// Minify images

gulp.task('img:dist', ['img'], function() {
  const imageminPlugins = [
    plugins.imagemin.jpegtran({ progressive: true }),
    plugins.imagemin.gifsicle({ interlaced: true }),
    plugins.imagemin.svgo(),
    pngquant()
  ]

  return gulp.src(paths.tmp + paths.img)
    .pipe(plugins.newer(paths.dist + paths.img))
    .pipe(plugins.imagemin(imageminPlugins, { verbose: true }))
    .pipe(gulp.dest(paths.dist + 'img/'))
});





/*------------------------------------*\
  #SERVER
\*------------------------------------*/

// Create servera and watch files

gulp.task('serve', ['css', 'html', 'twig', 'img'], function() {
  browserSync.init({
    browser: 'google chrome',
    server: {
      baseDir: paths.tmp,
      routes: {
        '/vendor': './node_modules'
      }
    }
  });

  gulp.watch(paths.sass, { cwd: paths.src }, ['css']);
  gulp.watch(paths.html, { cwd: paths.src }, ['html']);
  gulp.watch(paths.twig, { cwd: paths.src }, ['twig']);
  gulp.watch(paths.html, { cwd: paths.tmp }).on('change', reload);
});





/*------------------------------------*\
  #MAINTENANCE
\*------------------------------------*/

gulp.task('bump', function() {
  return gulp.src('./package.json')
    .pipe(plugins.bump({ version: '2.1.1' }))
    .pipe(gulp.dest('./'))
})





/*------------------------------------*\
  #SCRIPT GROUPS
\*------------------------------------*/

// Temporary compile

gulp.task('compile', ['css', 'html', 'twig', 'img'])


// Compile for production and version files

gulp.task('dist', ['css:dist', 'html:dist', 'img:dist'], function() {
  const manifest = gulp.src(paths.dist + 'rev-manifest.json')

  return gulp.src(paths.tmp + paths.html)
    .pipe(plugins.revReplace({
      manifest: manifest,
      replaceInExtensions: ['.html']
    }))
    .pipe(gulp.dest(paths.dist))
});
