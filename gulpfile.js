'use strict';

// gulp core
var gulp = require('gulp');
var gutil = require('gulp-util');
var webserver = require('gulp-webserver');
var sourcemaps = require('gulp-sourcemaps');
var chalk = require('chalk');

// browserify/watchify/babelify stack
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify');

// linting
var eslint = require('gulp-eslint');
//var eslintify = require('eslintify');

// sass compiler
var sass = require('gulp-sass');


// Package Definition
const PKG = {
  name: 'StampLines',
  main: 'stamplines.js',
  path: {
    src: {
      main: './src/stamplines.js',
      sass: ['./src/**/*.scss']
    },
    dest: {
      build: './dist/',
      maps: './'
    },
    lint: {
      js: ['./src/**/*.js','test/**/*.js'],
      sass: ['./src/**/*.scss']
    },
    test: '/test'
  }
};


/** Browserify setup **/
// generate a browserify bundler
var bify = function() {
  return browserify(PKG.path.src.main, { debug: true, standalone: PKG.name })
//          .transform(eslintify, {})
          .transform(babelify, {presets: ["es2015"], plugins: ['add-module-exports']});
};

// runs a browserify/watchify bundler
function bundleJS(pkg) {
  gutil.log('['+chalk.yellow('Browserify')+'] '+chalk.blue('Starting')+'...');
  return pkg.bundle()
          .on('error', function(err) { console.error(err); this.emit('end'); })
          .on('end', function(result){ gutil.log('['+chalk.yellow('Browserify')+'] '+chalk.blue('Finished')+'!'); })
          .pipe(source(PKG.main))
          .pipe(buffer())
          .pipe(sourcemaps.init({ loadMaps: true }))
          .pipe(sourcemaps.write(PKG.path.dest.maps))
          .pipe(gulp.dest(PKG.path.dest.build));
}

// runs js through eslint
function lintJS(lintFiles=PKG.path.lint.js) {
  return gulp.src(lintFiles)
          .pipe(eslint())
          .pipe(eslint.format())
          .pipe(eslint.failOnError());
}

function buildSass(){
  return gulp.src(PKG.path.src.sass)
          .pipe(sourcemaps.init({ loadMaps: true }))
          .pipe(sass().on('error', sass.logError))
          .pipe(sourcemaps.write(PKG.path.dest.maps))
          .pipe(gulp.dest(PKG.path.dest.build));
}


/** MAIN TASKS **/
// default is to start up the development environment
gulp.task('default', ['dev']);

// dev environment watches with a livereload on localhost:8000
gulp.task('dev', ['watch'], function() {
  gulp.src('./')
      .pipe(webserver({
        open: PKG.path.test,
        livereload: true
//        directoryListing: true
      }));
});


/** BUILD TASKS **/
gulp.task('build', ['build:js', 'build:sass']);

// builds javascript using browserify
gulp.task('build:js', ['lint:js'], function() {
  bundleJS(bify());
});

// builds sass
gulp.task('build:sass', buildSass);


/** LINTING TASKS **/
gulp.task('lint', ['lint:js']);

// js linting
gulp.task('lint:js', function(){
  return lintJS();
});


/** WATCH TASKS **/
gulp.task('watch', ['watch:js', 'watch:sass']);

// watches the browserify bundle (using watchify)
gulp.task('watch:js', function() {
  // generate a watchify bundler
  var wify = watchify(bify());
  wify.on('log', gutil.log);
  wify.on('update', function(changedFiles) {
    bundleJS(wify);
  });
  bundleJS(wify);
});

// watches the sass
gulp.task('watch:sass',  function(){
  // watch scss files
  gulp.watch(PKG.path.src.sass, ['build:sass']);
  gulp.start('build:sass');
});
