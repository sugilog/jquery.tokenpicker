jQuery.tokenpicker.search = {
  exec: function( input ) {
    return jQuery.tokenpicker.search.find( jQuery( input ).val() || "" );
  },
  find: function( query ) {
    var that = this;

    return jQuery.map( TOKENS.concat( GROUPS ), function( token ) {
      if ( jQuery.tokenpicker.search.matchAll( query, token.search.join( "||" ) ) ) {
        return token;
      }
    });
  },
  matchAll: function( query, sequence ) {
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
