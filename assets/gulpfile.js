/**
 * Dependencies
 **********************************************************/

var gulp = require('gulp'),
    webp = require('gulp-webp'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    changed = require('gulp-changed'),
    tinypng = require('gulp-tinypng'),
    imagemin = require('gulp-imagemin'),
    rubySass = require('gulp-ruby-sass'),
    minifycss = require('gulp-minify-css'),
    browserSync = require('browser-sync'),
    autoprefixer = require('gulp-autoprefixer');


/**
 * File Paths (relative to assets folder)
 **********************************************************/

 var paths = {
    sassSrc : ['scss/**/*.scss', '!scss/**/_*.scss'],
    cssDest : 'css',
    jsHintSrc : [
        'js/main.js'
    ],
    jsMinifySrc : [ // non-concatenated
        'js/vendor/modernizr.js'
    ],
    jsConcatSrc : [
        'js/main.js'
    ],
    jsDest : 'js/build',
    pngSrc : ['img/**/*.png', '!img/build/**/*'],
    jpgSrc : ['img/**/*.jpg', 'img/**/*.jpeg', '!img/build/**/*'],
    gifSrc : ['img/**/*.gif', '!img/build/**/*'],
    imgSrc : ['img/**/*.jpg', 'img/**/*.jpeg', 'img/**/*.gif', '!img/build/**/*'],
    imgDest : 'img/build',
    webpDest: 'img/build/webp'
};


/**
 * Config
 **********************************************************/

var config = {
    serverHost : '',
    serverPort : '',
    webpEnable : false,
    tinypngApiKey : '' // https://tinypng.com/developers
};


/**
 * Browser Sync
 **********************************************************/

gulp.task('browser-sync', function() {

    // If server host is not set run a static-server
    if (config.serverHost == '') {
        browserSync.init(['css/*.css', 'js/*.js'], {
            server: {
                baseDir: '../'
            }
        });
    } else {
        browserSync.init(['css/*.css', 'js/*.js'], {
            proxy: {
                host: config.serverHost
            }
        });
    }

});


/**
 * Sass Tasks
 **********************************************************/

gulp.task('sass', function() {
    gulp.src(paths.sassSrc)
        .pipe(rubySass({ style: 'expanded', compass: true }))
        .pipe(autoprefixer(
            'last 2 version',
            '> 1%',
            'ie 8',
            'ie 9',
            'ios 6',
            'android 4'
        ))
        .pipe(gulp.dest(paths.cssDest))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        .pipe(gulp.dest(paths.cssDest));
});


/**
 * JavaScript Tasks
 **********************************************************/

// JSHint custom js
gulp.task('js-hint', function() {
    gulp.src(paths.jsHintSrc)
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter(stylish));
});

// Minify all js files that should not be concatenated
gulp.task('js-uglify', function() {
    gulp.src(paths.jsMinifySrc)
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(paths.jsDest));
});

// Minify and concatenate all other js
gulp.task('js-concat', function() {
    gulp.src(paths.jsConcatSrc)
        .pipe(uglify())
        .pipe(concat('scripts.min.js'))
        .pipe(gulp.dest(paths.jsDest));
});


/**
 * Compress Images
 **********************************************************/

gulp.task('images', function() {

    // ImageMin for jpg and gifs
    gulp.src(paths.imgSrc)
        .pipe(changed(paths.imgDest))
        .pipe(imagemin({ optimizationLevel: 7, progressive: true, interlaced: true }))
        .pipe(gulp.dest(paths.imgDest));

    // Use TinyPNG if API Key is entered otherwise use ImageMin
    if (config.tinypngApiKey != '') {
        gulp.src(paths.pngSrc)
            .pipe(changed(paths.imgDest))
            .pipe(tinypng(config.tinypngApiKey))
            .pipe(gulp.dest(paths.imgDest));
    } else {
        gulp.src(paths.pngSrc)
            .pipe(changed(paths.imgDest))
            .pipe(imagemin({ optimizationLevel: 7 }))
            .pipe(gulp.dest(paths.imgDest));
    }

    // Create WebP images if enabled
    if (config.webpEnable != false) {
        gulp.src(paths.jpgSrc)
            .pipe(changed(paths.imgDest))
            .pipe(webp())
            .pipe(gulp.dest(paths.webpDest));
    }

});


/**
 * Gulp Tasks
 **********************************************************/

// Watch for file changes
gulp.task('watch', function() {
    gulp.watch([paths.sassSrc, 'scss/**/_*.scss'], ['sass']);
    gulp.watch(paths.jsHintSrc, ['js-hint']);
    gulp.watch(paths.jsMinifySrc, ['js-uglify']);
    gulp.watch(paths.jsConcatSrc, ['js-concat']);
    gulp.watch(paths.jpgSrc, ['images']);
    gulp.watch(paths.pngSrc, ['images']);
});


// Default task
gulp.task('default', ['sass', 'js-hint', 'js-uglify', 'js-concat', 'images', 'browser-sync', 'watch']);
