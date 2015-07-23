/**
 * Created by Kane on 15/7/23.
 */
var gulp = require('gulp');
var babel = require('gulp-babel');

gulp.task('src-babel', function() {
  return gulp
    .src(['src/**/*.js'])
    .pipe(babel())
    .pipe(gulp.dest('built'));
});

gulp.task('test-babel', function() {
  return gulp
    .src(['test/src/**/*.js'])
    .pipe(babel())
    .pipe(gulp.dest('test/built'));
});

gulp.task('default', ['src-babel', 'test-babel']);