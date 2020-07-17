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


// Input paths

const paths = {
  src: './src/',
  tmp: './.tmp/',
  dist: './dist/',
  html: '**/*.html',
  twig: '**/*.html.twig',
  css: 'css/**/*.css',
  js: 'js/**/*.js',
  img: 'img/**/*.+(png|jpg|svg|gif)',
  font: 'font/**/*.+(woff|woff2|eot|svg|ttf|otf)'
};





/*------------------------------------*\
  #HTML
\*------------------------------------*/

// Render Twig templates

function twig() {
  return src(paths.src + paths.twig)
    .pipe(plugins.twig({
      errorLogToConsole: true,
      extname: false
    }))
    .pipe(dest(paths.dist))
};


// Copy HTML

function html() {
  return src([paths.src + paths.html, paths.src + "*.*"])
    .pipe(dest(paths.dist))
};





/*------------------------------------*\
  #CSS
\*------------------------------------*/

// Compile CSS

function css() {
  return src(paths.src + paths.css)
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.postcss([
      atImport(),
      tailwindcss(),
      autoprefixer()
    ]))
    .pipe(plugins.sourcemaps.write('./maps'))
    .pipe(dest(paths.dist + 'css/'))
    .pipe(browserSync.stream())
};


// Minify CSS

const cssdist = series(css, function cssdist() {
  return src(paths.dist + paths.css)
    .pipe(plugins.purgecss({
      content: ['dist/**/*.html'],
      extractors: [{
        extractor: class {
          static extract(content) {
            return content.match(/[A-Za-z0-9-_:\/]+/g) || [];
          }
        },
        extensions: ['html']
      }]
    }))
    .pipe(plugins.postcss([cssnano()]))
    .pipe(plugins.rev())
    .pipe(dest(paths.dist + 'css/'))
    .pipe(plugins.rev.manifest({
      base: paths.dist,
      merge: true
    }))
    .pipe(dest(paths.dist + 'css/'))
});





/*------------------------------------*\
  #IMAGES
\*------------------------------------*/

// Copy images

function img() {
  return src(paths.src + paths.img)
    .pipe(plugins.newer(paths.dist + paths.img))
    .pipe(dest(paths.dist + 'img/'))
};


// Minify images

const imgdist = series(img, function imgdist() {
  const imageminPlugins = [
    plugins.imagemin.jpegtran({ progressive: true }),
    plugins.imagemin.gifsicle({ interlaced: true }),
    plugins.imagemin.svgo(),
    pngquant()
  ]

  return src(paths.dist + paths.img)
    .pipe(plugins.newer(paths.dist + paths.img))
    // .pipe(plugins.webp())
    .pipe(plugins.imagemin(imageminPlugins, { verbose: true }))
    .pipe(dest(paths.dist + 'img/'))
});





/*------------------------------------*\
  #FONTS
\*------------------------------------*/

function font() {
  return src(paths.src + paths.font)
    .pipe(dest(paths.dist + 'font/'))
};





/*------------------------------------*\
  #SERVER
\*------------------------------------*/

// Create servera and watch files

export const serve = series(parallel(css, html, twig, img, font), function serve() {
  bs.init({
    browser: 'opera',
    server: {
      baseDir: paths.dist,
      routes: {
        '/vendor': './node_modules'
      }
    }
  });

  watch(paths.src + paths.css, css);
  watch(paths.src + paths.html, html);
  watch(paths.src + paths.twig, twig);
  watch(paths.dist + paths.html).on('change', bs.reload);
});





/*------------------------------------*\
  #MAINTENANCE
\*------------------------------------*/

export const bump = () => {
  return src('./package.json')
    .pipe(plugins.bump({ version: '3.0.0' }))
    .pipe(dest('./'))
};





/*------------------------------------*\
  #SCRIPT GROUPS
\*------------------------------------*/

// Temporary compile

export const compile = parallel(css, html, twig, img, font)


// Compile for production and version files

export const dist = series(parallel(cssdist, html, imgdist, font), function dist() {
  const manifest = src(paths.dist + 'rev-manifest.json')

  return src(paths.dist + paths.html)
    .pipe(plugins.revReplace({
      manifest: manifest,
      replaceInExtensions: ['.html']
    }))
    .pipe(dest(paths.dist))
});
