'use strict';

var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var licences = require('./licences.js');

var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del']
});

gulp.task('styles', ['wiredep'], function () {
    return (sass('src/css/', {style: 'expanded'}))
        .on('error', function handleError(err) {
            console.error(err.toString());
            this.emit('end');
        })
        .pipe($.autoprefixer())
        .pipe(gulp.dest('.tmp/'));
});

gulp.task('injector:css', ['styles'], function () {
    return gulp.src('src/index.html')
        .pipe($.inject(gulp.src([
            '.tmp/**/*.css'
        ], {read: false}), {
            ignorePath: '.tmp',
            addRootSlash: false
        }))
        .pipe(gulp.dest('src/'));
});

gulp.task('scripts', function () {
    return gulp.src(['src/**/*.js', '!src/assets/maps/**'])
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'));
});

gulp.task('injector:js', ['scripts', 'injector:css'], function () {
    return gulp.src(['src/index.html', '.tmp/index.html'])
        .pipe($.inject(gulp.src([
                'src/**/*.js',
                '!src/**/*.spec.js',
                '!src/**/*_test.js',
                '!src/**/*.mock.js',
                '!src/lib/**/*.*',
                '!src/**/*.mine.*'
            ])
            .pipe($.naturalSort())//This fixes a angularFileSort issue : https://github.com/klei/gulp-angular-filesort/issues/17
            .pipe($.angularFilesort())
            , {
                ignorePath: 'src',
                addRootSlash: false
            }))
        .pipe(gulp.dest('src/'));
});

//this copies the personal files into .tmp folder to override default values
gulp.task('copy-personnal-files', function () {
    return gulp.src(['src/assets/config/config.mine.json'])
        .pipe($.rename('assets/config/config.json'))
        .pipe(gulp.dest('.tmp'));
});


gulp.task('partials', function () {
    return gulp.src(['src/**/*.html', '.tmp/**/*.html'])
        .pipe($.minifyHtml({
            empty: true,
            spare: true,
            quotes: true
        }))
        .pipe($.angularTemplatecache('templateCacheHtml.js', {
            module: 'data-prep'
        }))
        .pipe(gulp.dest('.tmp/inject/'));
});

gulp.task('html', ['wiredep', 'injector:css', 'injector:js', 'partials'], function () {
    var htmlFilter = $.filter('*.html');
    var htmlIndexFilter = $.filter('index.html');
    var jsFilter = $.filter('**/*.js');
    var jsAppFilter = $.filter('**/app-*.js');
    var cssFilter = $.filter('**/*.css');
    var cssAppFilter = $.filter('**/app-*.css');
    var assets;

    return gulp.src(['src/*.html', '.tmp/*.html'])
        .pipe($.inject(gulp.src('.tmp/inject/templateCacheHtml.js', {read: false}), {
            starttag: '<!-- inject:partials -->',
            ignorePath: '.tmp',
            addRootSlash: false
        }))
        .pipe(assets = $.useref.assets())
        .pipe($.rev())
        .pipe(jsFilter)
        .pipe($.ngAnnotate())
        .pipe($.uglify({
            mangle: {
                //workerFn[0-9] are preserved words that won't be mangled during uglification
                //those can be used to pass external functions to the web worker
                except: ['workerFn0', 'workerFn1', 'workerFn2', 'workerFn3', 'workerFn4', 'workerFn5', 'workerFn6', 'workerFn7', 'workerFn8', 'workerFn9']
            },
            preserveComments: function(node, comment) {
                return $.uglifySaveLicense(node, comment) && comment.value.indexOf('Talend Inc') < 0;
            }
        }))
        .pipe(jsFilter.restore())
        .pipe(jsAppFilter)
        .pipe($.header(licences.js, {year: new Date().getFullYear()}))
        .pipe(jsAppFilter.restore())
        .pipe(cssFilter)
        .pipe($.csso())
        .pipe(cssFilter.restore())
        .pipe(cssAppFilter)
        .pipe($.header(licences.css, {year: new Date().getFullYear()}))
        .pipe(cssAppFilter.restore())
        .pipe(assets.restore())
        .pipe($.useref())
        .pipe($.revReplace())
        .pipe(htmlFilter)
        .pipe($.minifyHtml({
            empty: true,
            spare: true,
            quotes: true
        }))
        .pipe(htmlFilter.restore())
        .pipe(htmlIndexFilter)
        .pipe($.header(licences.html, {year: new Date().getFullYear()}))
        .pipe(htmlIndexFilter.restore())
        .pipe(gulp.dest('dist/'))
        .pipe($.size({title: 'dist/', showFiles: true}));
});

gulp.task('images', function () {
    return gulp.src('src/**/*.png')
        .pipe($.imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest('dist/'));
});

gulp.task('customFonts', function () {
    return gulp.src('src/**/*.{eot,svg,ttf,woff}')
        .pipe(gulp.dest('dist/'));
});

gulp.task('fonts', function () {
    return gulp.src($.mainBowerFiles())
        .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
        .pipe($.flatten())
        .pipe(gulp.dest('dist/fonts/'));
});

gulp.task('workerLibs', function () {
    return gulp.src($.mainBowerFiles())
        .pipe($.filter('**/*.js'))
        .pipe($.flatten())
        .pipe(gulp.dest('dist/worker/'));
});

gulp.task('workerLibs:dev', function () {
    return gulp.src($.mainBowerFiles())
        .pipe($.filter('**/*.js'))
        .pipe($.flatten())
        .pipe(gulp.dest('.tmp/worker/'));
});

gulp.task('misc', function () {
    return gulp.src(['src/**/*.ico', 'src/**/*.json'])
        .pipe(gulp.dest('dist/'));
});

gulp.task('clean', function (done) {
    $.del(['dist/', '.tmp/', 'dev/'], done);
});

gulp.task('clean:dev', function (done) {
    $.del(['.tmp/', 'dev/'], done);
});

gulp.task('build', ['clean'], function () {
    gulp.start(['html', 'images', 'fonts', 'customFonts', 'misc', 'workerLibs']);
});

gulp.task('build:dev', ['clean'], function () {
    gulp.stat(['injector:css', 'injector:js']);
    return gulp.src([
        'src/**/*.*',
        '.tmp/**/*.*',
        '!src/**/*.scss'
    ]).pipe(gulp.dest('dev/'));
});
