var wrapTemplate,
    gulp   = require( "gulp" ),
    concat = require( "gulp-concat" ),
    wrap   = require( "gulp-wrap" ),
    pkg    = require( "./package.json" );

wrapTemplate = "/*!\n" +
               " * <%= data.name %> v<%= data.version %>\n" +
               " *\n" +
               " * Copyright (c) <%= data.author %>, <%= data.homepage %>\n" +
               " * Released under the <%= data.license %> License\n" +
               "*/\n" +
               "\n" +
               "( function() {\n" +
                 "<%= data.contents %>" +
               "})();";

console.log( gulp );
console.log( pkg );
gulp.task( "js", function() {
  return gulp
    .src( "./src/javascript/jquery.tokenpicker.js" )
    .pipe( concat( "jquery.tokenpicker.js" ) )
    .pipe( wrap( wrapTemplate, pkg, { variable: "data" } ) )
    .pipe( gulp.dest( "./dist/javascript/" ) );
});

gulp.task( "css", function() {
  return gulp
    .src( "./src/stylesheet/jquery.tokenpicker.css" )
    .pipe( gulp.dest( "./dist/stylesheet/" ) );
});

gulp.task( "default", [ "js", "css" ] );
