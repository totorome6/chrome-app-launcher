import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import del from 'del';
import runSequence from 'run-sequence';
import { stream as wiredep } from 'wiredep';
import browserify from 'browserify';
import babelify from 'babelify';
import buffer from 'vinyl-buffer';
import source from 'vinyl-source-stream';
import eventStream from 'event-stream';
import * as fs from 'fs';

const $ = gulpLoadPlugins();
const {
    sourcemaps,
    eslint,
    cache,
    useref,
    imagemin,
    uglify,
    mocha
} = $;

gulp.task('test', () => {
    return gulp.src('test/**/*.spec.js')
        .pipe(mocha({
            compilers: [ 'js:babel-register' ],
            reporter: 'dot'
        }));
});

gulp.task('browserify', () => {
    let entries = {
        popup: 'app/scripts/popup/index.js',
        options: 'app/scripts/options.js',
        background: 'app/scripts/background/index.js'
    };

    let bundleStreams = Object.keys(entries)
        .map(bundleName => bundle(entries[bundleName], `${ bundleName }.js`));

    return eventStream.merge(bundleStreams);

    function bundle(entrypoint, name) {
        return browserifyStream(entrypoint, name)
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist/scripts'));
    }
});

function browserifyStream(entrypoint, name) {
    return browserify(entrypoint, { debug: true })
        .transform(babelify)
        .bundle()
        .pipe(source(name));
}

gulp.task('copy-dev-scripts', () => {
    return gulp.src('app/scripts/chromereload.js')
    .pipe(gulp.dest('dist/scripts'));
});

gulp.task('extras', () => {
    return gulp.src([
        'app/*.*',
        'app/fonts/*.*',
        'app/_locales/**',
        '!app/scripts',
        '!app/*.html'
    ], {
        base: 'app',
        dot: true
    }).pipe(gulp.dest('dist'));
});

function lint(files, options) {
    return () => {
        return gulp.src(files)
        .pipe(eslint(options))
        .pipe(eslint.format());
    };
}

gulp.task('lint', lint('app/scripts/**/*.js'));

gulp.task('images', () => {
    return gulp.src('app/images/**/*')
    .pipe($.if($.if.isFile, cache(imagemin({
        progressive: true,
        interlaced: true,
        // don't remove IDs from SVGs, they are often used
        // as hooks for embedding and styling
        svgoPlugins: [{cleanupIDs: false}]
    }))
    .on('error', function (err) {
        console.log(err);
        this.end();
    })))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('html', () => {
    return gulp.src('app/*.html')
    .pipe(useref({ searchPath: ['.tmp', 'app', '.'] }))
    .pipe(sourcemaps.init())
    .pipe($.if('*.css', $.cleanCss({ compatibility: '*' })))
    .pipe(sourcemaps.write())
    .pipe($.if('*.html', $.htmlmin({ removeComments: true, collapseWhitespace: true })))
    .pipe(gulp.dest('dist'));
});

gulp.task('remove-dev-scripts', (cb) => {
    let manifest = require('./dist/manifest.json');
    if (!manifest.background ||
        !Array.isArray(manifest.background.scripts)) {
        cb();
    }

    let bgScripts = manifest.background.scripts;
    bgScripts.splice(bgScripts.indexOf('scripts/chromereload.js'), 1);
    fs.writeFileSync('dist/manifest.json', JSON.stringify(manifest));

    del('dist/scripts/chromereload.js')
        .then(() => cb(), cb);
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist', 'package']));

gulp.task('livereload-listen', () => {
    $.livereload.listen();
});

gulp.task('watch', ['clean'], () => {
    runSequence('build', 'livereload-listen', () => {
        gulp.watch(['app/**/*'])
            .on('change', () => {
                console.log('Change detected.');
                runSequence('build');
            });

        gulp.watch('dist/**/*', $.livereload.reload);
    });
});

gulp.task('size', () => {
    return gulp.src('dist/**/*').pipe($.size({ title: 'build', gzip: true }));
});

gulp.task('wiredep', () => {
    gulp.src('app/*.html')
    .pipe(wiredep({
        ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app'));
});

gulp.task('package', ['remove-dev-scripts'], function () {
    let manifest = require('./dist/manifest.json');
    return gulp.src('dist/**')
    .pipe($.zip('Apps Launcher-' + manifest.version + '.zip'))
    .pipe(gulp.dest('package'));
});

gulp.task('assets', [ 'html', 'images', 'extras' ]);

gulp.task('dev', ['watch']);

gulp.task('build', [
        'lint',
        'test',
        'browserify',
        'copy-dev-scripts',
        'assets']);

gulp.task('default', ['clean'], cb => runSequence('build', cb));
