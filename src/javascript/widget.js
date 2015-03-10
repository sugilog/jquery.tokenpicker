var REMOVE = "×";

jQuery.tokenpicker.widget = {
  build: function( context ) {
    this.base( context );
    this.frame( context );
    this.inputField( context );
    this.existingTokens( context );
    this.cacheImage( context );
  },
  cacheImage: function( context ) {
    var config  = jQuery.tokenpicker.config( context );

    if ( config.items.images.display ) {
      jQuery.each( config.tokens.concat( config.groups ), function( _, item ) {
        if ( typeof item.image !== "undefined" ) {
          var cache    = new Image();
          cache.width  = config.items.images.width;
          cache.height = config.items.images.height;
          cache.src    = item.image;
          config.items.images.cached[ item.token ] = cache;
        }
      });
    }
  },
  base: function( context ) {
    var wrapper = jQuery( "<div>" ),
        config  = jQuery.tokenpicker.config( context );

    wrapper
      .addClass( config.items.cssClass.base )
      .prop( {
        id: config.items.selector.baseId.replace( "#", "" )
      });

    context.wrap( wrapper ).css( { display: 'none' } );
  },
  frame: function( context ) {
    var config = jQuery.tokenpicker.config( context );

    jQuery( "<ul>" )
      .prop( {
        id: config.items.selector.frameId.replace( "#", "" )
      })
      .addClass( config.items.cssClass.frame )
      // EVENT: click in frame to focus
      .on( "click.tokenpicker", function() {
        jQuery( config.items.selector.inputId ).get(0).focus();
      })
      // EVENT: sort ( required jquery ui sortable; experimental )
      .sortable( {
        placeholder: config.items.cssClass.sortablePlaceholder,
        // EVENT: start sorting
        start: config.events.onSortableStart,
        // EVENT: end sorting
        update: config.events.onSortableUpdate
      })
      .appendTo( jQuery( config.items.selector.baseId ) );

    if ( config.items.clearButton ) {
      jQuery( "<span>" )
        .prop( {
          id: config.items.selector.clearButtonId.replace( "#", "" )
        })
        .addClass( config.items.cssClass.clearButton )
        .text( REMOVE )
        .on( "click.tokenpicker", config.events.onClearToken )
        .appendTo( jQuery( config.items.selector.baseId ) );
    }
  },
  inputField: function( context ) {
    var input  = jQuery( "<input>" ),
        config = jQuery.tokenpicker.config( context );

    input
      .prop({
        id:   config.items.selector.inputId.replace("#", ""),
        type: "text",
        "autocomplete": "off"
      })
      .attr( "autocomplete", "off" )
      .addClass( config.items.cssClass.input )
      // EVENT: observe inputing
      .observeField( 0.15, config.events.onInputSearchWord )
      // EVENT: focus inputing
      .on( "focus.tokenpicker", config.events.onFocusInputField )
      // EVENT: key control
      .on( "keydown.tokenpicker", config.events.onSelectTokenCandidates );

    jQuery( "<li>" )
      .addClass( config.items.cssClass.tokenItems )
      .addClass( config.items.cssClass.inputContainer )
      .append( input )
      .appendTo( jQuery( config.items.selector.frameId ) );
  },
  existingTokens: function( context ) {
    var temp, _item,
        existingItems = {},
        config = jQuery.tokenpicker.config( context ),
        existingTokens = context.val().split( config.items.tokenSeparator );

    temp = jQuery.grep( config.tokens.concat( config.groups ), function( item ) {
      return ( jQuery.inArray( item.token.toString(), existingTokens ) > -1 );
    })

    jQuery.each( temp, function( _, item ) {
      existingItems[ item.token.toString() ] = item;
    });

    jQuery.each( existingTokens, function( _, token ) {
      if ( _item = existingItems[ token ] ) {
        jQuery.tokenpicker.widget.token( context, _item );
      }
    });
  },
  token: function( context, pickedItem ) {
    var label, datum, items, tmp, existingTokens,
        item = jQuery( "<li>" ),
        remover = jQuery( "<span>" ),
        config  = jQuery.tokenpicker.config( context );

    if ( jQuery.isPlainObject( pickedItem ) ) {
      datum = pickedItem;
    }
    else {
      datum  = pickedItem.data();
    }

    if ( typeof datum.tokens !== "undefined" ) {
      existingTokens = context.val().split( config.items.tokenSeparator );

      datum = jQuery.map( datum.tokens, function( token ) {
        // FIXME: performance
        if ( jQuery.inArray( token.toString(), existingTokens ) === -1 ) {
          return jQuery.grep( config.tokens, function( item ) {
           return item.token.toString() === token.toString();
          });
        }
      });
    }
    else {
      datum = [ datum ];
    }

    items = jQuery.map( datum, function( data ) {
      label = data.label;

      label = jQuery( "<span>" ).text( label );
      remover = jQuery( "<span>" )
        .addClass( config.items.cssClass.removeToken )
        .text( REMOVE )
        // EVENT: remove token item
        .on( "click.tokenpicker", config.events.onRemoveToken );

      tmp = item.clone( true )
      tmp
        .addClass( config.items.cssClass.tokenItems )
        .addClass( config.items.cssClass.pickedToken )
        .data( data )
        .append( label )
        .append( remover );

      jQuery( config.items.selector.inputId )
        .closest( "." + config.items.cssClass.tokenItems )
        .before( tmp );

      return tmp;
    });

    return items;
  },
  candidatesArea: function( context, tokenCandidates ) {
    var config = jQuery.tokenpicker.config( context ),
        candidatesArea = jQuery( config.items.selector.candidatesAreaId );

    if ( candidatesArea.length === 0 ) {
      candidatesArea =
        jQuery( "<ul>" )
          .prop( {
            id: config.items.selector.candidatesAreaId.replace( "#", "" )
          })
          .addClass( config.items.cssClass.candidatesArea )

      candidatesArea.appendTo( jQuery( config.items.selector.baseId ) );
    }
    else {
      candidatesArea.children().remove();
      candidatesArea.removeClass( config.items.cssClass.found );
      candidatesArea.removeClass( config.items.cssClass.notFound );
    }

    if ( typeof tokenCandidates !== "undefined" ) {
      var pickedTokens = jQuery.tokenpicker.widget.pickedToken.tokens( context );

      tokenCandidates = jQuery( tokenCandidates ).map(function( _, item ) {
        if ( jQuery.inArray( item.token, pickedTokens ) === -1 ) {
          return item;
        }
      });
    }

    if (typeof tokenCandidates === "undefined") {
      tokenCandidates = [ { token: undefined, label: config.items.placeholders.start } ];
      candidatesArea.addClass( config.items.cssClass.notFound );
    }
    else if ( tokenCandidates.length === 0 ) {
      tokenCandidates = [ { token: undefined, label: config.items.placeholders.none } ];
      candidatesArea.addClass( config.items.cssClass.notFound );
    }
    else {
      candidatesArea.addClass( config.items.cssClass.found );
    }

    jQuery( tokenCandidates ).each(function( _, item ){
      var candidate = jQuery("<li>").data(item).addClass( config.items.cssClass.tokenCandidates );

      if ( typeof config.items.images.cached[ item.token ] !== "undefined" ) {
        candidate.append(
          jQuery( config.items.images.cached[ item.token ] ).css( { verticalAlign: "middle", marginRight: 10 } )
        );
      }

      candidate
        .append( jQuery( "<span>" ).text( item.label ) )
        .appendTo( candidatesArea );
    });
  },
  pickedToken: {
    items: function( context ) {
      var config = jQuery.tokenpicker.config( context );
      return ( jQuery( config.items.selector.frameId ).find( "." + config.items.cssClass.pickedToken ) || jQuery( undefined ) );
    },
    tokens: function( context ) {
      var tokens = jQuery.tokenpicker.widget.pickedToken.items( context ).map( function() {
        return jQuery( this ).data().token;
      }).toArray();

      return tokens || [];
    },
    setVal: function( context ) {
      var pickedTokens = jQuery.tokenpicker.widget.pickedToken.tokens( context ),
          config = jQuery.tokenpicker.config( context );
      context.val( pickedTokens.join( config.items.tokenSeparator ) );
    }
  },
  candidateItem: {
    setCurrentPick: function( context, target ) {
      var config = jQuery.tokenpicker.config( context );
      jQuery( target ).siblings().removeClass( config.items.cssClass.currentPick );
      jQuery( target ).addClass( config.items.cssClass.currentPick );
    },
    currentPick: function( context ) {
      var config = jQuery.tokenpicker.config( context ),
          candidatesArea = jQuery( config.items.selector.candidatesAreaId ),
          current = jQuery( undefined );

      if ( candidatesArea.hasClass( config.items.cssClass.found ) ) {
        current = candidatesArea.find( "." + config.items.cssClass.currentPick );
      }

      return current;
    },
    next: function( context ) {
      var current = jQuery.tokenpicker.widget.candidateItem.currentPick( context );
      return current.next();
    },
    prev: function( context ) {
      var current = jQuery.tokenpicker.widget.candidateItem.currentPick( context );
      return current.prev();
    }
  }
};
