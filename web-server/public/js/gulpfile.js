/**
 * Created by admin on 2017/11/6.
 */

var gulp = require('gulp');
var fileinclude  = require('../../web-server/node_modules/gulp-file-include');

gulp.task('fileinclude', function() {
    gulp.src('src/**.html')
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest('dist'));
});