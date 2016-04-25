'use strict';

var gulp = require('gulp');
var gulpif = require('gulp-if');
var gutil = require('gulp-util');

var livereload = require('gulp-livereload');
var rename = require('gulp-rename');

(function() {
  var babel = require('gulp-babel');

  gulp.task('js', function() {
    return gulp.src(['visualizations/*/graph.js'])
      .pipe(babel({
        presets: ['es2015']
      }))
      .pipe(rename(function(path) {
        path.dirname = 'compiled/' + path.dirname;
        return path;
      }))
      .pipe(gulp.dest('.'))
      .pipe(livereload());
  });
})();

(function() {
  var less = require('gulp-less');
  var autoprefixer = require('gulp-autoprefixer');

  gulp.task('less', function() {
    return gulp.src('visualizations/*/graph.css.less')
      .pipe(less({
        strictMath: true
      }))
      .on('error', gutil.log.bind(gutil, 'LESS Error'))
      .pipe(autoprefixer())
      .on('error', gutil.log.bind(gutil, 'Autoprefixer Error'))
      .pipe(rename({ extname: '' })) // Change .css.css to .css.
      .pipe(rename(function(path) {
        path.dirname = 'compiled/' + path.dirname;
        return path;
      }))
      .pipe(gulp.dest('.'))
      .pipe(livereload())
      .on('error', function() {});
  });
})();

(function() {
  const eslint = require('gulp-eslint');
  gulp.task('eslint', function() {
    return gulp.src(['visualizations/*/graph.js'])
      .pipe(eslint({ configFile: '.eslintrc.json' }))
      .pipe(eslint.format());
  });
})();

(function() {
  var merge = require('merge-stream');
  var fs = require('fs');
  var path = require('path');

  function getFolders(dir) {
    return fs.readdirSync(dir)
    .filter(function(file) {
      return fs.statSync(path.join(dir, file)).isDirectory() && fs.existsSync(path.join(dir, file, 'graph.js'));
    });
  }

  gulp.task('html', function() {
    const tasks = getFolders('compiled').map(function(f) {
      return gulp.src('template.html')
        .pipe(rename('graph.html'))
        .pipe(gulp.dest('compiled/' + f));
    });

    return merge(tasks);
  });
})();

(function() {
  gulp.task('data', function() {
    return gulp.src('visualizations/*/*.{csv,tsv,json}')
    .pipe(rename(function(path) {
      path.dirname = 'compiled/' + path.dirname;
      return path;
    }))
    .pipe(gulp.dest('.'));
  });
})();

gulp.task('watch', function() {
  gulp.watch('visualizations/*/graph.css.less', ['less']);
  gulp.watch('visualizations/*/graph.js', ['eslint']);
  gulp.watch('visualizations/*/graph.js', ['js']);
  gulp.watch('visualizations/*/*.{csv,tsv,json}', ['data']);
  livereload.listen(35731);
});

gulp.task('serve', function() {
  var connect = require('connect');
  var serveStatic = require('serve-static');
  var serveIndex = require('serve-index');

  var app = connect();

  app
    .use(serveStatic('compiled'))
    .use(serveIndex('compiled'));

  app.listen(3500);
});

gulp.task('default', [
  'js',
  'html',
  'less',
  'data'
]);
