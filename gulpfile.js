'use strict';

// gulp core
var gulp = require('gulp');
var gutil = require('gulp-util');
var webserver = require('gulp-webserver');
var sourcemaps = require('gulp-sourcemaps');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
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

// uglify
var uglify = require('gulp-uglify');

// soften
var soften = require('gulp-soften');


// Package Definition
const PKG = {
  name: 'StampLines',
  main: 'stamplines.js',
  path: {
    src: {
      main: './src/stamplines.js',
      sass: ['./src/**/*.scss'],
      testLib: './test/tests/lib.js',
      tests: ['!./test/tests/lib.js', './test/tests/*.js', './test/tests/core/**/*.js', './test/tests/palette/*.js', './test/tests/palette/**/*.js', './test/tests/ui/ui-test.js', './test/tests/ui/**/*.js', './test/tests/tools/*.js', './test/tests/tools/**/*.js', './test/tests/util/*.js', './test/tests/util/**/*.js', './test/tests/**/*.js']
    },
    dest: {
      build: './dist/',
      maps: './', // relative to dest.build
      testLib: {
        path: './test/',
        js: 'test-lib.js'
      },
      tests: {
        path: './test/',
        js: 'tests.js'
      }
    },
    clean: {
      build: {
        all: './dist/',
        js: ['./dist/*.js', './dist/*.js.map', './dist/*.min.map'],
        sass: ['./dist/*.css', './dist/*.css.map']
      },
      testLib: ['./test/test-lib.js', './test/test-lib.js.map'],
      tests: ['./test/tests.js', './test/tests.js.map'] // dest.test.path + dest.testss.js
    },
    lint: {
      js: ['./src/**/*.js','./test/tests/**/*.js'],
      sass: ['./src/**/*.scss']
    },
    webserver: {
      root: './',
      open: '/test'
    }
  }
};


/** Browserify setup **/
// generate a browserify bundler
var bify = function(src, name) {
  src = src || PKG.path.src.main;
  name = name || PKG.name;
  return browserify(src, { debug: true, standalone: name })
//          .transform(eslintify, {})
          .transform(babelify, {presets: ["es2015"], plugins: ['add-module-exports']});
};

// runs a browserify/watchify bundler
function bundleJS(pkg, destPath, destFile, minify) {
  destPath = destPath || PKG.path.dest.build;
  destFile = destFile || PKG.main;
  gutil.log('['+chalk.yellow('Browserify')+'] '+chalk.blue('Starting')+'...');
  var bundle = pkg.bundle()
          .on('error', function(err) { console.error(err); this.emit('end'); })
          .on('end', function(result){ gutil.log('['+chalk.yellow('Browserify')+'] '+chalk.blue('Finished')+'!'); })
          .pipe(source(destFile))
          .pipe(buffer())
          .pipe(sourcemaps.init({ loadMaps: true }));

  if (!minify) {
    // not minifying - output the sourcemaps and transpiled code
    bundle = bundle.pipe(sourcemaps.write(PKG.path.dest.maps))
          .pipe(gulp.dest(destPath));
  }
  else {
    // minifying - output the transpiled source, sourcemaps, and minified code
    bundle = bundle.pipe(gulp.dest(PKG.path.dest.build))
          .pipe(uglify())
          .pipe(rename({ extname: '.min.js' }))
          .pipe(sourcemaps.write(PKG.path.dest.maps))
          .pipe(gulp.dest(destPath));
  }

  return bundle;
}

// runs js through eslint
function lintJS(lintFiles=PKG.path.lint.js) {
  return gulp.src(lintFiles)
          .pipe(eslint())
          .pipe(eslint.format())
          .pipe(eslint.failOnError());
}

function buildSass(minify){
  var bundle = gulp.src(PKG.path.src.sass)
          .pipe(sourcemaps.init({ loadMaps: true }))
          .pipe(sass().on('error', sass.logError));
  if (!minify) {
    bundle = bundle.pipe(sourcemaps.write(PKG.path.dest.maps))
          .pipe(gulp.dest(PKG.path.dest.build));
  }
  else{
    bundle = bundle.pipe(gulp.dest(PKG.path.dest.build))
          .pipe(uglify())
          .pipe(rename({ extname: '.min.css' }))
          .pipe(sourcemaps.write(PKG.path.dest.maps))
          .pipe(gulp.dest(PKG.path.dest.build));
  }
  return bundle;
}


/** MAIN TASKS **/
// default is to start up the development environment
gulp.task('default', ['dev']);

// dev environment watches with a livereload on localhost:8000
gulp.task('dev', ['watch:tests', 'watch:src'], function() {
  gulp.src(PKG.path.webserver.root)
      .pipe(webserver({
        open: PKG.path.webserver.open,
        livereload: true
      }));
});

// clean
gulp.task('clean', ['clean:all']);
gulp.task('clean:all', ['clean:build', 'clean:tests', 'clean:testLib']);

gulp.task('clean:build', function() {
  return gulp.src(PKG.path.clean.build.all, {read: false})
          .pipe(clean());
});
gulp.task('clean:js', function() {
  return gulp.src(PKG.path.clean.build.js, {read: false})
          .pipe(clean());
});
gulp.task('clean:sass', function() {
  return gulp.src(PKG.path.clean.build.sass, {read: false})
          .pipe(clean());
});
gulp.task('clean:tests', function() {
  return gulp.src(PKG.path.clean.tests, {read: false})
          .pipe(clean());
});
gulp.task('clean:testLib', function() {
  return gulp.src(PKG.path.clean.testLib, {read: false})
          .pipe(clean());
});


/** BUILD TASKS **/
gulp.task('build', ['clean:build', 'build:js', 'build:sass']);

// builds javascript using browserify
gulp.task('build:js', ['clean:js', 'lint:js'], function() {
  bundleJS(bify(), PKG.path.dest.build, PKG.main, true);
});

// builds sass
gulp.task('build:sass', ['clean:sass'], function() {
  buildSass(true);
});
gulp.task('build:sass:watched', function() {
  buildSass();
});

// builds tests
gulp.task('build:tests', ['clean:tests'], function() {
  gulp.src(PKG.path.src.tests)
      .pipe(concat(PKG.path.dest.tests.js))
      .pipe(gulp.dest(PKG.path.dest.tests.path));
});
gulp.task('build:testLib', ['clean:testLib'], function() {
  bundleJS(bify(PKG.path.src.testLib, PKG.name+'Test'), PKG.path.dest.testLib.path, PKG.path.dest.testLib.js, false);
});


/** LINTING TASKS **/
gulp.task('lint', ['lint:js']);

// js linting
gulp.task('lint:js', function(){
  return lintJS();
});


/** WATCH TASKS **/
gulp.task('watch', ['watch:src']);
gulp.task('watch:src', ['watch:js', 'watch:sass']);

// watches the browserify bundle (using watchify)
gulp.task('watch:js', function() {
  // generate a watchify bundler
  var wify = watchify(bify());
  wify.on('log', gutil.log);
  wify.on('update', function(changedFiles) {
    bundleJS(wify, PKG.path.dest.build);
  });
  bundleJS(wify, PKG.path.dest.build);
});

// watches the sass
gulp.task('watch:sass', function(){
  // watch scss files
  gulp.watch(PKG.path.src.sass, ['build:sass:watched']);
  gulp.start('build:sass:watched');
});

// watches the tests
gulp.task('watch:tests', function(){
  // generate a watchify bundler
  var wify = watchify(bify(PKG.path.src.testLib, PKG.name+'Test'));
  wify.on('log', gutil.log);
  wify.on('update', function(changedFiles) {
    bundleJS(wify, PKG.path.dest.testLib.path, PKG.path.dest.testLib.js);
  });
  bundleJS(wify, PKG.path.dest.testLib.path, PKG.path.dest.testLib.js);
  
  gulp.watch(PKG.path.src.tests, ['build:tests']);
  gulp.start('build:tests');
});


/** TEST TASKS **/
gulp.task('test', ['build:tests', 'build:testLib']);


/** Utility Tasks **/
gulp.task('soften', function(){
  gulp.src(['src/**/*.js', 'test/tests/**/*.js'], {base: './'})
  .pipe(soften(2))
  .pipe(gulp.dest('./'));
});
