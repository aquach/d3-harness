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
        path.dirname += '/compiled';
        return path;
      }))
      .pipe(gulp.dest('.'))
      .pipe(livereload());
  });
})();

(function() {
  var less = require('gulp-less');
  var autoprefixer = require('gulp-autoprefixer');
  var csscomb = require('gulp-csscomb');

  gulp.task('csscomb', function() {
    return gulp.src(['visualizations/*/graph.css.less'])
      .pipe(csscomb())
      .pipe(rename(function(path) {
        path.dirname += '/compiled';
        return path;
      }))
      .pipe(gulp.dest('.'));
  });

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
        path.dirname += '/compiled';
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
      .pipe(eslint())
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
    const tasks = getFolders('.').map(function(f) {
      return gulp.src('template.html')
      .pipe(rename('graph.html'))
      .pipe(gulp.dest(f + '/compiled'));
    });

    return merge(tasks);
  });
})();

gulp.task('watch', function() {
  gulp.watch('visualizations/*/graph.css.less', ['less']);
  gulp.watch('visualizations/*/graph.js', ['eslint']);
  gulp.watch('visualizations/*/graph.js', ['js']);
  livereload.listen(35731);
});

gulp.task('default', [
  'js',
  'html',
  'less'
]);
