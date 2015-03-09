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
                 '"use strict";\n' +
                 "<%= data.contents %>" +
               "})();";

gulp.task( "js", function() {
  return gulp
    .src( [
      "./src/javascript/core.js",
      "./src/javascript/util.js",
      "./src/javascript/widget.js",
      "./src/javascript/event.js",
      "./src/javascript/observe_field.js",
      "./src/javascript/outer.js"
    ])
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
