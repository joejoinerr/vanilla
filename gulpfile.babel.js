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

import { src, dest, series, parallel, watch } from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
const plugins = gulpLoadPlugins();
import pngquant from 'imagemin-pngquant';
import browserSync from 'browser-sync';
const bs = browserSync.create();
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import tailwindcss from 'tailwindcss';
import atImport from 'postcss-import';
import del from 'del';


// Input paths

const paths = {
  src: './src/',
  dist: './dist/',
  html: '**/*.html',
  twig: '**/*.twig',
  css: 'css/**/[!_]*.css',
  js: 'js/**/*.js',
  img: 'img/**/*.+(png|jpg|jpeg|svg|gif)',
  font: 'font/**/*.+(woff|woff2|eot|svg|ttf|otf)'
};





/*------------------------------------*\
  #ROOT FILES
\*------------------------------------*/

// Copy HTML and other root files

function copyRootFiles() {
  return src([
      paths.src + paths.html,
      paths.src + "robots.txt"
    ])
    .pipe(dest(paths.dist))
};





/*------------------------------------*\
  #CSS
\*------------------------------------*/

// Compile CSS

function compileCSS() {
  return src(paths.src + paths.css, { sourcemaps: true })
    .pipe(plugins.postcss([
      atImport(),
      tailwindcss(),
      autoprefixer()
    ]))
    .pipe(dest(paths.dist + 'css/', {
      sourcemaps: './maps'
    }))
    .pipe(browserSync.stream())
};


// Minify CSS

function minifyCSS() {
  return src(paths.dist + paths.css)
    .pipe(plugins.postcss([cssnano()]))
    .pipe(plugins.rev())
    .pipe(dest(paths.dist + 'css/'))
    .pipe(plugins.rev.manifest({
      base: paths.dist,
      merge: true
    }))
    .pipe(dest(paths.dist + 'css/'))
};





/*------------------------------------*\
  #IMAGES
\*------------------------------------*/

// Copy images

function copyImg() {
  return src(paths.src + paths.img)
    .pipe(plugins.newer(paths.dist + paths.img))
    .pipe(dest(paths.dist + 'img/'))
};


// Minify images

function compressImg() {
  const imageminPlugins = [
    plugins.imagemin.mozjpeg({
      quality: 80,
      progressive: true
    }),
    plugins.imagemin.gifsicle({ interlaced: true }),
    plugins.imagemin.svgo(),
    pngquant()
  ]

  return src(paths.dist + paths.img)
    .pipe(plugins.newer(paths.dist + paths.img))
    // .pipe(plugins.webp())
    .pipe(plugins.imagemin(imageminPlugins, { verbose: true }))
    .pipe(dest(paths.dist + 'img/'))
};





/*------------------------------------*\
  #FONTS
\*------------------------------------*/

function copyFont() {
  return src(paths.src + paths.font)
    .pipe(dest(paths.dist + 'font/'))
};





/*------------------------------------*\
  #MAINTENANCE
\*------------------------------------*/

// Remove previously compiled files

function clean(cb) {
  return del([
    paths.dist
  ], cb)
};


// Update revved filenames

function rewrite() {
  const manifest = src(paths.dist + 'rev-manifest.json')

  return src([
      paths.dist + paths.html,
      paths.dist + paths.twig
    ])
    .pipe(plugins.revRewrite({ manifest }))
    .pipe(dest(paths.dist))
};


// Start BrowserSync server

function startServer() {
  bs.init({
    browser: [],
    server: {
      baseDir: paths.dist
    }
  });

  watch(paths.src + paths.css, compileCSS);
  watch(paths.src + paths.html, copyRootFiles);
  watch(pathc.src + paths.img, copyImg);
  watch(paths.dist + paths.html).on('change', bs.reload);
};





/*------------------------------------*\
  #TASKS
\*------------------------------------*/

// Temporary compile

export const compile = series(
  clean,
  parallel(
    compileCSS,
    copyRootFiles,
    copyImg,
    copyFont
  )
);


// Create server and watch files

export const serve = series(
  parallel(
    compileCSS,
    copyRootFiles,
    copyImg,
    copyFont
  ),
  startServer
);


// Compile for production and version files

export const dist = series(
  clean,
  parallel(
    series(compileCSS, minifyCSS),
    copyRootFiles,
    series(copyImg, compressImg),
    copyFont
  ),
  rewrite
);
