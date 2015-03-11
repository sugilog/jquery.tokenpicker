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

jQuery.tokenpicker.util = {
  remove: function( context, removeToken ) {
    var token,
        items = jQuery.tokenpicker.widget.pickedToken.items( context ),
        config = jQuery.tokenpicker.config( context );

    jQuery.each( items, function( _, item ) {
      if ( jQuery( item ).data().token === removeToken ) {
        token = jQuery( item );
        return false;
      }
    });

    if ( !token ) {
      return false;
    }
    
    config.events.onRemoveToken.apply( token.find( "." + config.items.cssClass.removeToken ), [] );
  },
  add: function( context, addToken ) {
    var token,
        items = jQuery.tokenpicker.widget.pickedToken.items( context ),
        config = jQuery.tokenpicker.config( context );

    jQuery.each( items, function( _, item ) {
      if ( jQuery( item ).data().token === addToken ) {
        token = jQuery( item );
        return false;
      }
    });

    if ( token ) {
      return false;
    }

    jQuery.each( config.tokens, function( _, item ) {
      if ( item.token === addToken ) {
        token = item;
        return false;
      }
    });

    config.events.onAddToken( token );
  }
};
