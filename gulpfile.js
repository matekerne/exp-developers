'use strict';

var gulp        = require('gulp'),
    minifyCss   = require('gulp-minify-css'),
    pug         = require('gulp-pug'),
    sass        = require('gulp-sass'),
    plumber     = require('gulp-plumber'),
    notify      = require('gulp-notify'),
    del         = require('del'),
    imagemin    = require('gulp-imagemin'),
    pngquant    = require('imagemin-pngquant'),
    cache       = require('gulp-cache'),
    spritesmith = require("gulp.spritesmith"),
    concat      = require('gulp-concat'),
    uglify      = require('gulp-uglifyjs'),
    rename      = require('gulp-rename'),
    browserSync = require('browser-sync'),
    reload      = browserSync.reload;

var paths = {
  html:['src/*.html'],
  css:['src/sass/**/*.scss']
};

// SASS

gulp.task('mincss', function(){
  return gulp.src(paths.css)
    .pipe(sass())
    .on('error', notify.onError(function(err){
      return {
        title: 'SASS',
        message: err.message
      };
    }))
    .pipe(minifyCss())
    .pipe(gulp.dest('src/css'))
    .pipe(reload({stream:true}))
    .pipe(notify('SASS compile success.'));
});

// ////////////////////////////////////////////////
// HTML
// ///////////////////////////////////////////////
gulp.task('html', function(){
  gulp.src(paths.html)
  .pipe(reload({stream:true}));
});

// Работа с Pug
gulp.task('pug', function() {
    return gulp.src('src/pug/pages/*.pug')
        .pipe(plumber())
        .pipe(pug({
            pretty: true
        }))
        .on('error', notify.onError(function(err){
          return {
            title: 'Pug',
            message: err.message
          };
        }))
        .pipe(gulp.dest('src'))
        .pipe(reload({stream:true}))
        .pipe(notify('Pug compile success.'));
});

// ////////////////////////////////////////////////
// Browser-Sync
// // /////////////////////////////////////////////
gulp.task('browserSync', function() {
  browserSync({
    server: {
      baseDir: "src"
    },
    port: 8080,
    open: true,
    notify: true
  });
});

// Работа с JS
gulp.task('scripts', function() {
    return gulp.src([
            // Библиотеки
            'src/libs/bower/jquery/dist/jquery.min.js',
            'src/libs/bower/magnific-popup/dist/jquery.magnific-popup.min.js',
            'src/libs/bower/scrollreveal/dist/scrollreveal.min.js'
        ])
        .pipe(concat('libs.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('src/js'))
        .pipe(reload({
            stream: true
        }));
});

// Сборка спрайтов PNG
gulp.task('cleansprite', function() {
    return del.sync('src/img/sprite/sprite.png');
});

gulp.task('spritemade', function() {
    var spriteData =
        gulp.src('src/img/sprite/*.*')
        .pipe(spritesmith({
            imgName: 'sprite.png',
            cssName: '_sprite.scss',
            padding: 15,
            cssFormat: 'scss',
            algorithm: 'binary-tree',
            cssTemplate: 'scss.template.mustache',
            cssVarMap: function(sprite) {
                sprite.name = 's-' + sprite.name;
            }
        }));

    spriteData.img.pipe(gulp.dest('src/img/sprite/')); // путь, куда сохраняем картинку
    spriteData.css.pipe(gulp.dest('src/sass/')); // путь, куда сохраняем стили
});
gulp.task('sprite', ['cleansprite', 'spritemade']);

// Слежение
gulp.task('watcher', ['browserSync', 'mincss', 'pug', 'scripts'], function(){
  gulp.watch(paths.css, ['mincss']);
  gulp.watch(['src/js/*.js', '!src/js/libs.min.js'], ['scripts']);
  gulp.watch('src/pug/**/*.pug', ['pug']);
  gulp.watch(paths.html, ['html']);
});

// Очистка папки сборки
gulp.task('clean', function() {
    return del.sync('product');
});

// Оптимизация изображений
gulp.task('img', function() {
    return gulp.src(['src/img/**/*', '!src/img/sprite/*'])
        .pipe(cache(imagemin({
            progressive: true,
            use: [pngquant()]

        })))
        .pipe(gulp.dest('product/img'));
});

// Сборка проекта

gulp.task('build', ['clean', 'img', 'mincss', 'scripts'], function() {
    var buildCss = gulp.src('src/css/*.css')
        .pipe(gulp.dest('product/css'));

    var buildFonts = gulp.src('src/fonts/**/*')
        .pipe(gulp.dest('product/fonts'));

    var buildJs = gulp.src('src/js/**.js')
        .pipe(gulp.dest('product/js'));

    var buildHtml = gulp.src('src/*.html')
        .pipe(gulp.dest('product/'));

    var buildImg = gulp.src('src/img/sprite/sprite.png')
        .pipe(imagemin({
            progressive: true,
            use: [pngquant()]
        }))
        .pipe(gulp.dest('product/img/sprite/'));
});

gulp.task('default', ['watcher', 'browserSync']);
