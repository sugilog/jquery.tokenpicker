var wrapTemplate,
    gulp   = require( "gulp" ),
    concat = require( "gulp-concat" ),
    wrap   = require( "gulp-wrap" );

gulp.task( "js", function() {
  return gulp
    .src( "./src/javascript/jquery.tokenpicker.js" )
    .pipe( concat( "jquery.tokenpicker.js" ) )
    .pipe( gulp.dest( "./dist/javascript/" ) );
});

gulp.task( "css", function() {
  return gulp
    .src( "./src/stylesheet/jquery.tokenpicker.css" )
    .pipe( gulp.dest( "./dist/stylesheet/" ) );
});

gulp.task( "default", [ "js", "css" ] );
