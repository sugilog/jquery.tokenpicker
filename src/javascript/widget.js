var REMOVE = "×";

jQuery.tokenpicker.widget = {
  baseId:        ( "#tokenpicker_widget_base_"   + jQuery.tokenpicker.items.baseName ),
  frameId:       ( "#tokenpicker_widget_frame_"  + jQuery.tokenpicker.items.baseName ),
  inputId:       ( "#tokenpicker_widget_input_"  + jQuery.tokenpicker.items.baseName ),
  clearButtonId: ( "#tokenpicker_widget_clear_"  + jQuery.tokenpicker.items.baseName ),
  candidatesAreaId: ( "#tokenpicker_widget_candidatesArea_" + jQuery.tokenpicker.items.baseName ),
  build: function(){
    this.base();
    this.frame();
    this.inputField();
    this.existingTokens();
    this.cacheImage();
  },
  cacheImage: function() {
    if ( jQuery.tokenpicker.items.images.display ) {
      jQuery.each( TOKENS.concat( GROUPS ), function( _, item ) {
        if ( typeof item.image !== "undefined" ) {
          var cache    = new Image();
          cache.width  = jQuery.tokenpicker.items.images.width;
          cache.height = jQuery.tokenpicker.items.images.height;
          cache.src    = item.image;
          jQuery.tokenpicker.items.images.cached[ item.token ] = cache;
        }
      });
    }
  },
  base: function() {
    var wrapper = jQuery( "<div>" );

    wrapper
      .addClass( jQuery.tokenpicker.items.cssClass.base )
      .prop( {
        id: jQuery.tokenpicker.widget.baseId.replace( "#", "" )
      });

    self.wrap( wrapper ).css( { display: 'none' } );
  },
  frame: function() {
    jQuery( "<ul>" )
      .prop( {
        id: jQuery.tokenpicker.widget.frameId.replace( "#", "" )
      })
      .addClass( jQuery.tokenpicker.items.cssClass.frame )
      // EVENT: click in frame to focus
      .on( "click.tokenpicker", function() {
        jQuery( jQuery.tokenpicker.widget.inputId ).get(0).focus();
      })
      // EVENT: sort ( required jquery ui sortable; experimental )
      .sortable( {
        placeholder: jQuery.tokenpicker.items.cssClass.sortablePlaceholder,
        // EVENT: start sorting
        start: jQuery.tokenpicker.events.onSortableStart,
        // EVENT: end sorting
        update: jQuery.tokenpicker.events.onSortableUpdate
      })
      .appendTo( jQuery( jQuery.tokenpicker.widget.baseId ) );

    if ( options.clearButton ) {
      jQuery( "<span>" )
        .prop( {
          id: jQuery.tokenpicker.widget.clearButtonId.replace( "#", "" )
        })
        .addClass( jQuery.tokenpicker.items.cssClass.clearButton )
        .text( REMOVE )
        .on( "click.tokenpicker", jQuery.tokenpicker.events.onClearToken )
        .appendTo( jQuery( jQuery.tokenpicker.widget.baseId ) );
    }
  },
  inputField: function() {
    var input = jQuery("<input>");

    input
      .prop({
        id:   jQuery.tokenpicker.widget.inputId.replace("#", ""),
        type: "text",
        "autocomplete": "off"
      })
      .attr( "autocomplete", "off" )
      .addClass( jQuery.tokenpicker.items.cssClass.input )
      // EVENT: observe inputing
      .observeField( 0.15, jQuery.tokenpicker.events.onInputSearchWord )
      // EVENT: focus inputing
      .on( "focus.tokenpicker", jQuery.tokenpicker.events.onFocusInputField )
      // EVENT: key control
      .on( "keydown.tokenpicker", jQuery.tokenpicker.events.onSelectTokenCandidates );

    jQuery( "<li>" )
      .addClass( jQuery.tokenpicker.items.cssClass.tokenItems )
      .addClass( jQuery.tokenpicker.items.cssClass.inputContainer )
      .append( input )
      .appendTo( jQuery( jQuery.tokenpicker.widget.frameId ) );
  },
  existingTokens: function() {
    var temp, _item,
        existingItems = {},
        existingTokens = self.val().split( jQuery.tokenpicker.items.tokenSeparator );

    temp = jQuery.grep( TOKENS.concat( GROUPS ), function( item ) {
      return ( jQuery.inArray( item.token.toString(), existingTokens ) > -1 );
    })

    jQuery.each( temp, function( _, item ) {
      existingItems[ item.token.toString() ] = item;
    });

    jQuery.each( existingTokens, function( _, token ) {
      if ( _item = existingItems[ token ] ) {
        jQuery.tokenpicker.widget.token( _item );
      }
    });
  },
  token: function( pickedItem ) {
    var label, datum, items, tmp, existingTokens,
        item = jQuery( "<li>" ),
        remover = jQuery( "<span>" );

    if ( jQuery.isPlainObject( pickedItem ) ) {
      datum = pickedItem;
    }
    else {
      datum  = pickedItem.data();
    }

    if ( typeof datum.tokens !== "undefined" ) {
      existingTokens = self.val().split( jQuery.tokenpicker.items.tokenSeparator );

      datum = jQuery.map( datum.tokens, function( token ) {
        // FIXME: performance
        if ( jQuery.inArray( token.toString(), existingTokens ) === -1 ) {
          return jQuery.grep( TOKENS, function( item ) {
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
      remover = jQuery("<span>")
        .addClass( jQuery.tokenpicker.items.cssClass.removeToken )
        .text( REMOVE )
        // EVENT: remove token item
        .on( "click.tokenpicker", jQuery.tokenpicker.events.onRemoveToken );

      tmp = item.clone( true )
      tmp
        .addClass( jQuery.tokenpicker.items.cssClass.tokenItems )
        .addClass( jQuery.tokenpicker.items.cssClass.pickedToken )
        .data( data )
        .append( label )
        .append( remover );

      jQuery( jQuery.tokenpicker.widget.inputId )
        .closest( "." + jQuery.tokenpicker.items.cssClass.tokenItems )
        .before( tmp );

      return tmp;
    });

    return items;
  },
  candidatesArea: function( tokenCandidates ) {
    var candidatesArea = jQuery( jQuery.tokenpicker.widget.candidatesAreaId );

    if ( candidatesArea.length === 0 ) {
      candidatesArea =
        jQuery( "<ul>" )
          .prop( {
            id: jQuery.tokenpicker.widget.candidatesAreaId.replace( "#", "" )
          })
          .addClass( jQuery.tokenpicker.items.cssClass.candidatesArea )

      candidatesArea.appendTo( jQuery( jQuery.tokenpicker.widget.baseId ) );
    }
    else {
      candidatesArea.children().remove();
      candidatesArea.removeClass( jQuery.tokenpicker.items.cssClass.found );
      candidatesArea.removeClass( jQuery.tokenpicker.items.cssClass.notFound );
    }

    if ( typeof tokenCandidates !== "undefined" ) {
      var pickedTokens = jQuery.tokenpicker.widget.pickedToken.tokens();

      tokenCandidates = jQuery( tokenCandidates ).map(function( _, item ) {
        if ( jQuery.inArray( item.token, pickedTokens ) === -1 ) {
          return item;
        }
      });
    }

    if (typeof tokenCandidates === "undefined") {
      tokenCandidates = [ { token: undefined, label: jQuery.tokenpicker.items.placeholders.start } ];
      candidatesArea.addClass( jQuery.tokenpicker.items.cssClass.notFound );
    }
    else if ( tokenCandidates.length === 0 ) {
      tokenCandidates = [ { token: undefined, label: jQuery.tokenpicker.items.placeholders.none } ];
      candidatesArea.addClass( jQuery.tokenpicker.items.cssClass.notFound );
    }
    else {
      candidatesArea.addClass( jQuery.tokenpicker.items.cssClass.found );
    }

    jQuery( tokenCandidates ).each(function( _, item ){
      var candidate = jQuery("<li>").data(item).addClass( jQuery.tokenpicker.items.cssClass.tokenCandidates );

      if ( typeof jQuery.tokenpicker.items.images.cached[ item.token ] !== "undefined" ) {
        candidate.append(
          jQuery( jQuery.tokenpicker.items.images.cached[ item.token ] ).css( { verticalAlign: "middle", marginRight: 10 } )
        );
      }

      candidate
        .append( jQuery( "<span>" ).text( item.label ) )
        .appendTo( candidatesArea );
    });
  },
  pickedToken: {
    items: function() {
      return ( jQuery( jQuery.tokenpicker.widget.frameId ).find( "." + jQuery.tokenpicker.items.cssClass.pickedToken ) || jQuery( undefined ) );
    },
    tokens: function() {
      var tokens = jQuery.tokenpicker.widget.pickedToken.items().map(
        function() {
          return jQuery( this ).data().token;
        }
      ).toArray();

      return tokens || [];
    },
    setVal: function() {
      var pickedTokens = jQuery.tokenpicker.widget.pickedToken.tokens();
      self.val(pickedTokens.join( jQuery.tokenpicker.items.tokenSeparator ));
    }
  },
  candidateItem: {
    setCurrentPick: function( target ) {
      jQuery( target ).siblings().removeClass( jQuery.tokenpicker.items.cssClass.currentPick );
      jQuery( target ).addClass( jQuery.tokenpicker.items.cssClass.currentPick );
    },
    currentPick: function() {
      var candidatesArea = jQuery( jQuery.tokenpicker.widget.candidatesAreaId ),
          current = jQuery( undefined );

      if ( candidatesArea.hasClass( jQuery.tokenpicker.items.cssClass.found ) ) {
        current = candidatesArea.find( "." + jQuery.tokenpicker.items.cssClass.currentPick );
      }

      return current;
    },
    next: function() {
      var current = jQuery.tokenpicker.widget.candidateItem.currentPick();
      return current.next();
    },
    prev: function() {
      var current = jQuery.tokenpicker.widget.candidateItem.currentPick();
      return current.prev();
    }
  }
};
