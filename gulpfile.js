'use strict';

const gulp = require('gulp');
const plumber = require('gulp-plumber');
const watch = require('gulp-watch');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const rigger = require('gulp-rigger');
const cssmin = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const rimraf = require('rimraf');
const server = require('browser-sync');
const runSequence = require('run-sequence').use(gulp);
const reload = server.reload;
   
const path = {
  build: {
    html:  'build/',
    style: 'build/css/',
    img:   'build/img/'
  },
  src: {
    html:  'src/*.html',
    style: 'src/scss/style.scss',
    img:   'src/img/**/*.*'
  },
  watch: {
    html:  'src/**/*.html',
    style: 'src/scss/**/*.scss',
    img:   'src/img/**/*.*'
  },
  clean: './build'
};

const config = {
  server: {
    baseDir: './build'
  },
  tunnel: false,
  host: 'localhost',
  port: 9000,
  logPrefix: 'SDN'
};

gulp.task('clean', function(callback) {
  rimraf(path.clean, callback);
});

gulp.task('html:build', function() {
  gulp.src(path.src.html)
    .pipe(rigger())
    .pipe(gulp.dest(path.build.html))
    .pipe(reload({ stream: true }));
});


gulp.task('style:build', function() {
  gulp.src(path.src.style)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(postcss([ autoprefixer({ browsers: ['last 2 versions'] }) ]))
    .pipe(rename({ suffix: '.min' }))
    .pipe(cssmin())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.build.style))
    .pipe(reload({ stream: true }));
});

gulp.task('image:build', function() {
  gulp.src(path.src.img)
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{ removeViewBox: false }],
      use: [pngquant()],
      interlaced: true
    }))
    .pipe(gulp.dest(path.build.img))
    .pipe(reload({ stream: true }));
});

gulp.task('build', function(callback) {
  runSequence('clean',
    ['html:build', 'style:build', 'image:build'],
    callback
  )
});

gulp.task('watch', function() {
  watch([path.watch.html], function(event, callback) {
    gulp.start('html:build');
  });
  watch([path.watch.style], function(event, callback) {
    gulp.start('style:build');
  });
  watch([path.watch.img], function(event, callback) {
    gulp.start('image:build');
  });
});

gulp.task('webserver', function() {
  server(config);
});

gulp.task('default', function(callback) {
  runSequence(['build', 'webserver', 'watch'],
    callback
  )
});

gulp.task('server', ['webserver', 'watch']);
