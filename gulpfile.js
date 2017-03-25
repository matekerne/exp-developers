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
  css:['src/static/sass/**/*.scss']
};

gulp.task('mincss', function(){
  return gulp.src(paths.css)
    .pipe(sass().on('error', sass.logError))
    .pipe(minifyCss())
    .pipe(gulp.dest('src/static/css'))
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
            'src/static/libs/magnific/jquery.magnific-popup.min.js',
            'src/static/libs/bxslider/jquery.bxslider.min.js',
            'src/static/libs/maskedinput/maskedinput.js',
            'src/static/libs/slick/slick.min.js',
            'src/static/libs/validate/jquery.validate.min.js'
        ])
        .pipe(concat('libs.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('src/static/js'))
        .pipe(reload({
            stream: true
        }));
});

// Сборка спрайтов PNG
gulp.task('cleansprite', function() {
    return del.sync('src/static/img/sprite/sprite.png');
});

gulp.task('spritemade', function() {
    var spriteData =
        gulp.src('src/static/img/sprite/*.*')
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

    spriteData.img.pipe(gulp.dest('src/static/img/sprite/')); // путь, куда сохраняем картинку
    spriteData.css.pipe(gulp.dest('src/static/stylus/')); // путь, куда сохраняем стили
});
gulp.task('sprite', ['cleansprite', 'spritemade']);

// Слежение
gulp.task('watcher', ['browserSync', 'mincss', 'pug', 'scripts'], function(){
  gulp.watch(paths.css, ['mincss']);
  gulp.watch(['src/static/js/*.js', '!src/static/js/libs.min.js', '!src/static/js/jquery.js'], ['scripts']);
  gulp.watch('src/pug/**/*.pug', ['pug']);
  gulp.watch(paths.html, ['html']);
});

// Очистка папки сборки
gulp.task('clean', function() {
    return del.sync('product');
});

// Оптимизация изображений
gulp.task('img', function() {
    return gulp.src(['src/static/img/**/*', '!src/static/img/sprite/*'])
        .pipe(cache(imagemin({
            progressive: true,
            use: [pngquant()]

        })))
        .pipe(gulp.dest('product/static/img'));
});

// Сборка проекта

gulp.task('build', ['clean', 'img', 'mincss', 'scripts'], function() {
    var buildCss = gulp.src('src/static/css/*.css')
        .pipe(gulp.dest('product/static/css'));

    var buildFonts = gulp.src('src/static/fonts/**/*')
        .pipe(gulp.dest('product/static/fonts'));

    var buildJs = gulp.src('src/static/js/**.js')
        .pipe(gulp.dest('product/static/js'));

    var buildHtml = gulp.src('src/*.html')
        .pipe(gulp.dest('product/'));

    var buildImg = gulp.src('src/static/img/sprite/sprite.png')
        .pipe(imagemin({
            progressive: true,
            use: [pngquant()]
        }))
        .pipe(gulp.dest('product/static/img/sprite/'));
});

gulp.task('default', ['watcher', 'browserSync']);
