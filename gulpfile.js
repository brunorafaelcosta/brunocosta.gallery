var gulp        = require('gulp'),
    pug         = require('gulp-pug'),
    data        = require('gulp-data'),
    fs          = require('fs');
    deploy      = require('gulp-gh-pages');

gulp.task('copy-cname', function () {
    return gulp.src(['./CNAME'], 
                    {base: '.'})
            .pipe(gulp.dest('dist/'))
});

gulp.task('copy-static', function () {
    return gulp.src(['./src/styles/**/*.*',
                     './src/fonts/**/*.*',
                     './src/scripts/**/*.*',
                     './src/images/**/*.*'],
                    {base: './src/'})
            .pipe(gulp.dest('dist/static/'))
});

gulp.task('build-base', function() {
    return gulp.src('src/index.pug')
        .pipe(data(function(file) {
            return JSON.parse(fs.readFileSync('src/data/datasource.pt.json'))
        }))
        .pipe(pug())
        .pipe(gulp.dest('dist/'));
});

gulp.task('build-pt', function() {
    return gulp.src('src/views/**/*.pug')
        .pipe(data(function(file) {
            return JSON.parse(fs.readFileSync('src/data/datasource.pt.json'))
        }))
        .pipe(pug())
        .pipe(gulp.dest('dist/pt/'));
});

gulp.task('build-en', function() {
    return gulp.src('src/views/**/*.pug')
        .pipe(data(function(file) {
            return JSON.parse(fs.readFileSync('src/data/datasource.en.json'))
        }))
        .pipe(pug())
        .pipe(gulp.dest('dist/en/'));
});

gulp.task('build-fr', function() {
    return gulp.src('src/views/**/*.pug')
        .pipe(data(function(file) {
            return JSON.parse(fs.readFileSync('src/data/datasource.fr.json'))
        }))
        .pipe(pug())
        .pipe(gulp.dest('dist/fr/'));
});

/**
 * Build
 */
gulp.task('build', gulp.series('copy-cname', 'copy-static', 'build-base', 'build-pt', 'build-en', 'build-fr'));

/**
 * Push build to gh-pages
 */
gulp.task('deploy', function () {
    return gulp.src("dist/**/*")
        .pipe(deploy())
});
