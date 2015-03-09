jQuery.tokenpicker.widget = {
  baseId:        ( "#tokenpicker_widget_base_"   + tokenpickerItems.baseName ),
  frameId:       ( "#tokenpicker_widget_frame_"  + tokenpickerItems.baseName ),
  inputId:       ( "#tokenpicker_widget_input_"  + tokenpickerItems.baseName ),
  clearButtonId: ( "#tokenpicker_widget_clear_"  + tokenpickerItems.baseName ),
  candidatesAreaId: ( "#tokenpicker_widget_candidatesArea_" + tokenpickerItems.baseName ),
  build: function(){
    this.base();
    this.frame();
    this.inputField();
    this.existingTokens();
    this.cacheImage();
  },
  cacheImage: function() {
    if ( tokenpickerItems.images.display ) {
      jQuery.each( TOKENS.concat( GROUPS ), function( _, item ) {
        if ( typeof item.image !== "undefined" ) {
          var cache    = new Image();
          cache.width  = tokenpickerItems.images.width;
          cache.height = tokenpickerItems.images.height;
          cache.src    = item.image;
          tokenpickerItems.images.cached[ item.token ] = cache;
        }
      });
    }
  },
  base: function() {
    var wrapper = jQuery( "<div>" );

    wrapper
      .addClass( tokenpickerItems.cssClass.base )
      .prop( {
        id: tokenpickerWidget.baseId.replace( "#", "" )
      });

    self.wrap( wrapper ).css( { display: 'none' } );
  },
  frame: function() {
    jQuery( "<ul>" )
      .prop( {
        id: tokenpickerWidget.frameId.replace( "#", "" )
      })
      .addClass( tokenpickerItems.cssClass.frame )
      // EVENT: click in frame to focus
      .on( "click.tokenpicker", function() {
        jQuery(tokenpickerWidget.inputId).get(0).focus();
      })
      // EVENT: sort ( required jquery ui sortable; experimental )
      .sortable( {
        placeholder: tokenpickerItems.cssClass.sortablePlaceholder,
        // EVENT: start sorting
        start: events.onSortableStart,
        // EVENT: end sorting
        update: events.onSortableUpdate
      })
      .appendTo( jQuery( tokenpickerWidget.baseId ) );

    if ( options.clearButton ) {
      jQuery( "<span>" )
        .prop( {
          id: tokenpickerWidget.clearButtonId.replace( "#", "" )
        })
        .addClass( tokenpickerItems.cssClass.clearButton )
        .text( REMOVE )
        .on( "click.tokenpicker", events.onClearToken )
        .appendTo( jQuery( tokenpickerWidget.baseId ) );
    }
  },
  inputField: function() {
    var input = jQuery("<input>");

    input
      .prop({
        id:   tokenpickerWidget.inputId.replace("#", ""),
        type: "text",
        "autocomplete": "off"
      })
      .attr( "autocomplete", "off" )
      .addClass( tokenpickerItems.cssClass.input )
      // EVENT: observe inputing
      .observeField( 0.15, events.onInputSearchWord )
      // EVENT: focus inputing
      .on( "focus.tokenpicker", events.onFocusInputField )
      // EVENT: key control
      .on( "keydown.tokenpicker", events.onSelectTokenCandidates );

    jQuery( "<li>" )
      .addClass( tokenpickerItems.cssClass.tokenItems )
      .addClass( tokenpickerItems.cssClass.inputContainer )
      .append( input )
      .appendTo( jQuery( tokenpickerWidget.frameId ) );
  },
  existingTokens: function() {
    var temp, _item,
        existingItems = {},
        existingTokens = self.val().split( tokenpickerItems.tokenSeparator );

    temp = jQuery.grep( TOKENS.concat( GROUPS ), function( item ) {
      return ( jQuery.inArray( item.token.toString(), existingTokens ) > -1 );
    })

    jQuery.each( temp, function( _, item ) {
      existingItems[ item.token.toString() ] = item;
    });

    jQuery.each( existingTokens, function( _, token ) {
      if ( _item = existingItems[ token ] ) {
        tokenpickerWidget.token( _item );
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
      existingTokens = self.val().split( tokenpickerItems.tokenSeparator );

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
        .addClass( tokenpickerItems.cssClass.removeToken )
        .text( REMOVE )
        // EVENT: remove token item
        .on( "click.tokenpicker", events.onRemoveToken );

      tmp = item.clone( true )
      tmp
        .addClass( tokenpickerItems.cssClass.tokenItems )
        .addClass( tokenpickerItems.cssClass.pickedToken )
        .data( data )
        .append( label )
        .append( remover );

      jQuery( tokenpickerWidget.inputId )
        .closest( "." + tokenpickerItems.cssClass.tokenItems )
        .before( tmp );

      return tmp;
    });

    return items;
  },
  candidatesArea: function( tokenCandidates ) {
    var candidatesArea = jQuery( tokenpickerWidget.candidatesAreaId );

    if ( candidatesArea.length === 0 ) {
      candidatesArea =
        jQuery( "<ul>" )
          .prop( {
            id: tokenpickerWidget.candidatesAreaId.replace( "#", "" )
          })
          .addClass( tokenpickerItems.cssClass.candidatesArea )

      candidatesArea.appendTo( jQuery( tokenpickerWidget.baseId ) );
    }
    else {
      candidatesArea.children().remove();
      candidatesArea.removeClass( tokenpickerItems.cssClass.found );
      candidatesArea.removeClass( tokenpickerItems.cssClass.notFound );
    }

    if ( typeof tokenCandidates !== "undefined" ) {
      var pickedTokens = tokenpickerWidget.pickedToken.tokens();

      tokenCandidates = jQuery( tokenCandidates ).map(function( _, item ) {
        if ( jQuery.inArray( item.token, pickedTokens ) === -1 ) {
          return item;
        }
      });
    }

    if (typeof tokenCandidates === "undefined") {
      tokenCandidates = [ { token: undefined, label: tokenpickerItems.placeholders.start } ];
      candidatesArea.addClass( tokenpickerItems.cssClass.notFound );
    }
    else if ( tokenCandidates.length === 0 ) {
      tokenCandidates = [ { token: undefined, label: tokenpickerItems.placeholders.none } ];
      candidatesArea.addClass( tokenpickerItems.cssClass.notFound );
    }
    else {
      candidatesArea.addClass( tokenpickerItems.cssClass.found );
    }

    jQuery( tokenCandidates ).each(function( _, item ){
      var candidate = jQuery("<li>").data(item).addClass( tokenpickerItems.cssClass.tokenCandidates );

      if ( typeof tokenpickerItems.images.cached[ item.token ] !== "undefined" ) {
        candidate.append(
          jQuery( tokenpickerItems.images.cached[ item.token ] ).css( { verticalAlign: "middle", marginRight: 10 } )
        );
      }

      candidate
        .append( jQuery( "<span>" ).text( item.label ) )
        .appendTo( candidatesArea );
    });
  },
  pickedToken: {
    items: function() {
      return ( jQuery( tokenpickerWidget.frameId ).find( "." + tokenpickerItems.cssClass.pickedToken ) || jQuery( undefined ) );
    },
    tokens: function() {
      var tokens = tokenpickerWidget.pickedToken.items().map(
        function() {
          return jQuery( this ).data().token;
        }
      ).toArray();

      return tokens || [];
    },
    setVal: function() {
      var pickedTokens = tokenpickerWidget.pickedToken.tokens();
      self.val(pickedTokens.join( tokenpickerItems.tokenSeparator ));
    }
  },
  candidateItem: {
    setCurrentPick: function( target ) {
      jQuery( target ).siblings().removeClass( tokenpickerItems.cssClass.currentPick );
      jQuery( target ).addClass( tokenpickerItems.cssClass.currentPick );
    },
    currentPick: function() {
      var candidatesArea = jQuery( tokenpickerWidget.candidatesAreaId ),
          current = jQuery( undefined );

      if ( candidatesArea.hasClass( tokenpickerItems.cssClass.found ) ) {
        current = candidatesArea.find( "." + tokenpickerItems.cssClass.currentPick );
      }

      return current;
    },
    next: function() {
      var current = tokenpickerWidget.candidateItem.currentPick();
      return current.next();
    },
    prev: function() {
      var current = tokenpickerWidget.candidateItem.currentPick();
      return current.prev();
    }
  }
};
