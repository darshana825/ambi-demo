var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var gutil = require('gulp-util');
var babelify = require('babelify');
var uglify = require('gulp-uglify');
var streamify = require('gulp-streamify');
var browserifycss = require('browserify-css');

var dependencies = [
    'react',
    'react-dom',
    'react-router'
];
// keep a count of the times a task refires
var scriptsCount = 0;

// Gulp tasks
// ----------------------------------------------------------------------------
gulp.task('scripts', function () {
    bundleApp(false);
});

gulp.task('deploy', function () {
    bundleApp(true);
});

gulp.task('watch', function () {
    gulp.watch(['./public/app/*.js'], ['scripts']);
    gulp.watch(['./public/app/*/*.js'], ['scripts']);
    gulp.watch(['./public/app/*/*/*.js'], ['scripts']);
    gulp.watch(['./public/app/*/*/*/*.js'], ['scripts']);
});


// When running 'gulp' on the terminal this task will fire.
// It will start watching for changes in every .js file.
// If there's a change, the task 'scripts' defined above will fire.
gulp.task('default', ['scripts', 'watch']);

// Private Functions
// ----------------------------------------------------------------------------
function bundleApp(isProduction) {
    scriptsCount++;
    // Browserify will bundle all our js files together in to one and will let
    // us use modules in the front end.
    var appBundler = browserify({
        entries: './public/app/app.js',
        debug: true
    }).transform("babelify", {presets: ["es2015", "react"]})
        .transform(browserifycss, {global: true})

    // If it's not for production, a separate vendors.js file will be created
    // the first time gulp is run so that we don't have to rebundle things like
    // react everytime there's a change in the js file

    if (!isProduction && scriptsCount === 1) {

        // create vendors.js for dev environment.
        browserify({
            require: dependencies,
            debug: true
        })
            .bundle()
            .on('error', gutil.log)
            .pipe(source('vendors.js'))
            .pipe(streamify(uglify()))
            .pipe(gulp.dest('./public/web/js/'));
    }
    if (!isProduction) {
        // make the dependencies external so they dont get bundled by the
        // app bundler. Dependencies are already bundled in vendor.js for
        // development environments.
        dependencies.forEach(function (dep) {

            appBundler.external(dep);
        })
    }

    if (isProduction) {
        console.log("Production Deploy.......");
        appBundler
        // transform ES6 and JSX to ES5 with babelify
            .bundle()
            .on('error', gutil.log)
            .pipe(source('bundle.js'))
            .pipe(streamify(uglify()))
            .pipe(gulp.dest('./public/web/js/'));
        return 0;
    }
    appBundler
    // transform ES6 and JSX to ES5 with babelify
        .bundle()
        .on('error', gutil.log)
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('./public/web/js/'));
}
