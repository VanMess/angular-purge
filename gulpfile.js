var path = require('path'),
    gulp = require('gulp'),
    plugins = require('gulp-load-plugins');

var $ = plugins({
    rename: {
        'gulp-server-livereload': 'server'
    }
});
$.run = require('run-sequence');
/**
 * File patterns
 **/

// Root directory
var rootDirectory = path.resolve('./');

// Source directory for build process
var sourceDirectory = path.join(rootDirectory, './src'),
    distDirectory = path.join(rootDirectory, './dist');

var sourceFiles = [
    path.join(sourceDirectory, '/_start.js'),
    path.join(sourceDirectory, '/*.module.js'),
    path.join(sourceDirectory, '/*.js'),
    path.join(sourceDirectory, '/end.js')
];

var lintFiles = [
    // Karma configuration
    'karma-*.conf.js',
    path.join(distDirectory, '/*.js')
];

/**
 * build
 **/
gulp.task('build', function() {
    gulp.src(sourceFiles)
        .pipe($.concat('angular-purge.js'))
        .pipe(gulp.dest(distDirectory))
        .pipe($.uglify())
        .pipe($.rename('angular-purge.min.js'))
        .pipe(gulp.dest(distDirectory));
});

/**
 * check then build
 */
gulp.task('checkAndBuild', function(done) {
    $.run('build', 'jshint', done);
});

/**
 * Process
 */
gulp.task('process-all', function(done) {
    $.run('jshint', 'test-src', 'build', done);
});

/**
 * Watch task
 */
gulp.task('watch', function(done) {
    // Watch JavaScript files
    gulp.watch(sourceFiles, ['checkAndBuild']);
    $.run('server', done);
});

gulp.task('server', function() {
    gulp.src('./')
        .pipe($.server({
            livereload: false,
            directoryListing: false,
            open: true,
            port: '7001',
            defaultFile: 'sample/demo.html'
        }));
});

/**
 * Validate source JavaScript
 */
gulp.task('jshint', function() {
    return gulp.src(lintFiles)
        .pipe($.filter((['*.js', '!_*.js','!*.min.js'])))
        .pipe($.plumber())
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe($.jshint.reporter('fail'));
});

/**
 * Run test once and exit
 */
gulp.task('test-src', function(done) {
    $.karma.start({
        configFile: __dirname + '/karma-src.conf.js',
        singleRun: true
    }, done);
});

/**
 * Run test once and exit
 */
gulp.task('test-dist-concatenated', function(done) {
    $.karma.start({
        configFile: __dirname + '/karma-dist-concatenated.conf.js',
        singleRun: true
    }, done);
});

/**
 * Run test once and exit
 */
gulp.task('test-dist-minified', function(done) {
    $.karma.start({
        configFile: __dirname + '/karma-dist-minified.conf.js',
        singleRun: true
    }, done);
});

gulp.task('default', function() {
    $.run('process-all', 'watch');
});
