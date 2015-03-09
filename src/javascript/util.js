jQuery.tokenpicker.search = {
  exec: function( context, input ) {
    return jQuery.tokenpicker.search.find( context, jQuery( input ).val() || "" );
  },
  find: function( context, query ) {
    var config = jQuery.tokenpicker.config( context );

    return jQuery.map( config.tokens.concat( config.groups ), function( token ) {
      if ( jQuery.tokenpicker.search.matchAll( context, query, token.search.join( "||" ) ) ) {
        return token;
      }
    });
  },
  matchAll: function( context, query, sequence ) {
    var regexes = [ /.*/ ];

    if ( query.length > 0) {
      regexes = jQuery.map( query.split( /(?:\s|　)/ ), function( val ) {
        return new RegExp( val, "i" )
      });
    }

    var result = true

    jQuery.each( regexes, function( _, regex ) {
      if ( !regex.test( sequence ) ) {
        result = false
        return
      }
    });

    return result;
  }
};
