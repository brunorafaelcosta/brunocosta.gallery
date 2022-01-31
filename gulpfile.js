var gulp        = require('gulp'),
    pug         = require('gulp-pug'),
    data        = require('gulp-data'),
    fs          = require('fs'),
    deploy      = require('gulp-gh-pages'),
    merge       = require('gulp-merge-json');

var ptDataSource;
var enDataSource;
var frDataSource;
gulp.task('buildPtDataSource', function(cb) {
    return gulp.src(['src/data/datasource.json', 'src/data/datasource.pt.json'])
        .pipe(merge())
        .pipe(data(function(file) {
            ptDataSource = JSON.parse(file.contents);
            cb(); 
        }));
  });
gulp.task('buildEnDataSource', function(cb) {
    return gulp.src(['src/data/datasource.json', 'src/data/datasource.en.json'])
        .pipe(merge())
        .pipe(data(function(file) {
            enDataSource = JSON.parse(file.contents);
            cb(); 
        }));
  });
gulp.task('buildFrDataSource', function(cb) {
    return gulp.src(['src/data/datasource.json', 'src/data/datasource.fr.json'])
        .pipe(merge())
        .pipe(data(function(file) {
            frDataSource = JSON.parse(file.contents);
            cb(); 
        }));
  });
gulp.task('buildDataSource', gulp.series('buildEnDataSource', 'buildFrDataSource', 'buildPtDataSource'));


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
            return ptDataSource;
        }))
        .pipe(pug())
        .pipe(gulp.dest('dist/'));
});

gulp.task('build-pt', function() {
    return gulp.src('src/views/**/*.pug')
        .pipe(data(function(file) {
            return ptDataSource;
        }))
        .pipe(pug())
        .pipe(gulp.dest('dist/pt/'));
});

gulp.task('build-en', function() {
    return gulp.src('src/views/**/*.pug')
        .pipe(data(function(file) {
            return enDataSource;
        }))
        .pipe(pug())
        .pipe(gulp.dest('dist/en/'));
});

gulp.task('build-fr', function() {
    return gulp.src('src/views/**/*.pug')
        .pipe(data(function(file) {
            return frDataSource;
        }))
        .pipe(pug())
        .pipe(gulp.dest('dist/fr/'));
});

/**
 * Build
 */
gulp.task('build', gulp.series('buildDataSource', 'copy-cname', 'copy-static', 'build-base', 'build-pt', 'build-en', 'build-fr'));

/**
 * Push build to gh-pages
 */
gulp.task('deploy', function () {
    return gulp.src('dist/**/*')
        .pipe(deploy())
});
