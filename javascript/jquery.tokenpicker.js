/*!
 * jquery.tokenpicker v0.0.2
 *
 * Copyright (c) 2012 Takayuki Sugita, http://github.com/sugilog
 * Released under the MIT License
*/
(function( jQuery ) {
  "use strict";

jQuery.fn.tokenpicker = function( options ) {
  var TOKENS, GROUPS,
      tokenpickerItems, tokenpickerWidget, events, searchUtil,
      self = jQuery( this ),
      REMOVE = "×";

  options = jQuery.extend(
    { placeholders: {}, images: {} },
    options
  );

  TOKENS = jQuery.map( options.tokens, function( token ) {
    var searchValues = jQuery.map( options.searchKeys, function( key ) {
      return token[ key ];
    });

    return {
      token:    token[ options.tokenKey ],
      label:    token[ options.labelKey ],
      search:   searchValues,
      original: token,
      image:    token[ options.imageKey ]
    };
  });

  GROUPS = jQuery.map( ( options.groups || [] ), function( group ) {
    var searchValues = jQuery.map( options.searchKeys, function( key ) {
      return group[ key ];
    });

    return {
      token:    "group_" + group[ options.tokenKey ].join( "_" ),
      tokens:   group[ options.tokenKey ] || [],
      label:    group[ options.labelKey ],
      search:   searchValues,
      original: group,
      image:    group[ options.imageKey ]
    };
  });

  tokenpickerItems = {
    baseName:       self.prop( "name" ),
    tokenSeparator: ( options.separator || "," ),
    placeholders:   {
      sort:  ( options.placeholders.sort  || "HERE" ),
      start: ( options.placeholders.start || "Type to search..." ),
      none:  ( options.placeholders.none  || "No Results." )
    },
    images: {
      display: !!options.images.display,
      cached:  {},
      width:   ( options.images.width  || 50 ),
      height:  ( options.images.height || 50 )
    },
    cssClass: {
      base:                 "tokenpicker_base",
      frame:                options.clearButton ? "tokenpicker_frame_with_clear" : "tokenpicker_frame",
      clearButton:          "tokenpicker_clear_token",
      tokenItems:           "tokenpicker_frame_items",
      pickedToken:          "tokenpicker_frame_picked_token",
      sortablePlaceholder : "tokenpicker_frame_sortable_placeholder",
      input:                "tokenpicker_input",
      removeToken:          "tokenpicker_remove_token",
      candidatesArea:       "tokenpicker_candidates_area",
      tokenCandidates:      "tokenpicker_token_candidates",
      found:                "tokenpicker_candidates_found",
      notFound:             "tokenpicker_candidates_not_found",
      currentPick:          "tokenpicker_current_pick"
    },
    callback: {
      onPick:   options.onPick,
      onRemove: options.onRemove,
      onSort:   options.onSort,
      onClear:  options.onClear
    }
  };

  tokenpickerWidget = {
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

  events = {
    onCloseCandidates: function( event ) {
      var base;

      if ( jQuery( this ).hasClass( tokenpickerItems.cssClass.base ) ) {
        base = jQuery( this );
      }
      else {
        base = jQuery( this ).closest( "." + tokenpickerItems.cssClass.base );
      }

      base.find( "." + tokenpickerItems.cssClass.input ).val( "" );
      base.find( "." + tokenpickerItems.cssClass.candidatesArea ).remove();
    },
    afterCloseCandidates: function( event ) {
      jQuery( tokenpickerWidget.inputId ).get( 0 ).focus();
    },
    onFocusInputField: function( event ) {
      tokenpickerWidget.candidatesArea();
    },
    onInputSearchWord: function( event ) {
      if ( jQuery( this ).val() === "" ) {
        events.onCloseCandidates.apply( this, [ event ] );
        events.afterCloseCandidates.apply( this, [ event ] );
      }
      else {
        var result,
            candidatesArea = jQuery( tokenpickerWidget.candidatesAreaId );

        result = searchUtil.exec( this );
        tokenpickerWidget.candidatesArea( result );

        if ( candidatesArea.hasClass( tokenpickerItems.cssClass.found ) ) {
          tokenpickerWidget.candidateItem.setCurrentPick( candidatesArea.children().eq( 0 ) );
        }
      }
    },
    onMouseoverCandidates: function( event ) {
      tokenpickerWidget.candidateItem.setCurrentPick( this );
    },
    onClickCandidate: function(_event) {
      tokenpickerWidget.candidateItem.setCurrentPick( this );
      events.onPickToken.apply( this, [ event ] );
    },
    onSelectTokenCandidates: function( event ) {
      // delete   :  8
      // enter    : 13
      // up       : 38
      // down     : 40
      // left     : 37
      // right    : 39
      // backspace: 46

      switch( event.keyCode.toString() ) {
      case "13":
        events.onPickToken.apply( this, [ event ] );
        return false;
      case "38":
      case "40":
        var target = tokenpickerWidget.candidateItem[ ( event.keyCode.toString() === "38" ) ? "prev" : "next" ]();

        if ( target.length > 0 ) {
          tokenpickerWidget.candidateItem.setCurrentPick( target );
        }

        break;
      case "37":
      case "39":
        if ( jQuery( tokenpickerWidget.inputId ).val() !== "" ) {
          break;
        }

        var selector, append;

        if ( event.keyCode.toString() === "37" ) {
          selector = "prev";
          append   = "before";
        }
        else {
          selector = "next";
          append   = "after";
        }

        var target = jQuery( tokenpickerWidget.inputId ).closest( "li" )[ selector ]();
        target[ append ]( jQuery( tokenpickerWidget.inputId ).closest( "li" ) );

        setTimeout( function() {
          jQuery( tokenpickerWidget.inputId ).get( 0 ).focus();
        }, 30 );

        break;
      case  "8":
      case "46":
        if ( jQuery( tokenpickerWidget.inputId ).val() !== "" ) {
          break;
        }

        var target = jQuery( tokenpickerWidget.inputId ).closest( "li" )[ event.keyCode.toString() === "8" ? "prev" : "next" ]();
        events.onRemoveToken.apply( target, [ event ] );
        break;
      }
    },
    onPickToken: function( event ) {
      var tokens,
          current = tokenpickerWidget.candidateItem.currentPick();

      if ( current.length > 0 ) {
        tokens = tokenpickerWidget.token( current );
        tokenpickerWidget.pickedToken.setVal();
      }

      events.onCloseCandidates.apply( this, [ event ] );
      events.afterCloseCandidates.apply( this, [ event ] );

      if ( current.length > 0 && jQuery.isFunction( tokenpickerItems.callback.onPick ) ) {
        tokenpickerItems.callback.onPick.apply( self, [ tokens ] );
      }
    },
    onRemoveToken: function( event ) {
      var token = jQuery( this ).closest( "." + tokenpickerItems.cssClass.pickedToken ),
          data  = token.data();

      token.remove();
      tokenpickerWidget.pickedToken.setVal();

      if ( token.length > 0 && jQuery.isFunction( tokenpickerItems.callback.onRemove ) ) {
        tokenpickerItems.callback.onRemove.apply( self, [ data ] );
      }
    },
    onClearToken: function( event ) {
      var data,
          tokens = jQuery( tokenpickerWidget.frameId )
            .find( "." + tokenpickerItems.cssClass.pickedToken );

      data = tokens.map( function() {
        return jQuery( this ).data();
      }).toArray();

      tokens.remove();
      tokenpickerWidget.pickedToken.setVal();

      if ( tokens.length > 0 && jQuery.isFunction( tokenpickerItems.callback.onClear ) ) {
        tokenpickerItems.callback.onClear.apply( self, [ data ] );
      }
    },
    outerClick: function() {
      jQuery( "." + tokenpickerItems.cssClass.base ).outerOff( "click.tokenpicker" );
      // EVENT: hide on click out of widget
      jQuery( "." + tokenpickerItems.cssClass.base ).outerOn( "click.tokenpicker", function( event ) {
        jQuery( this ).each( function() {
          events.onCloseCandidates.apply( this, [ event ] );
        });
      });
    },
    onSortableStart: function( event, ui ) {
      jQuery( "." + tokenpickerItems.cssClass.sortablePlaceholder ).text( tokenpickerItems.placeholders.sort );
    },
    onSortableUpdate: function( event, ui ) {
      tokenpickerWidget.pickedToken.setVal();

      if ( jQuery.isFunction( tokenpickerItems.callback.onSort ) ) {
        tokenpickerItems.callback.onSort.apply( self, [ tokenpickerWidget.pickedToken.items() ] );
      }
    }
  };

  // share with selectpicker
  searchUtil = {
    exec: function( input ) {
      return searchUtil.find( jQuery( input ).val() || "" );
    },
    find: function( query ) {
      var that = this;

      return jQuery.map( TOKENS.concat( GROUPS ), function( token ) {
        // FIXME: find by Array
        if ( searchUtil.matchAll( query, token.search.join( "||" ) ) ) {
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

  tokenpickerWidget.build();
  jQuery( document ).off( "mouseover.tokenpicker", tokenpickerWidget.candidatesAreaId + " li" );
  jQuery( document ).off( "click.tokenpicker",     tokenpickerWidget.candidatesAreaId + " li" );
  jQuery( document ).on(  "mouseover.tokenpicker", tokenpickerWidget.candidatesAreaId + " li", events.onMouseoverCandidates );
  jQuery( document ).on(  "click.tokenpicker",     tokenpickerWidget.candidatesAreaId + " li", events.onClickCandidate );
  events.outerClick();
}

if (typeof jQuery.fn.outerOn === "undefined" && typeof jQuery.fn.outerOff === "undefined") {
  jQuery.fn.outerOn = function() {
    var args = jQuery( arguments ).toArray(),
        self = this,
        handleEvent = ( args.shift() + [ ".outer" + "_" + self.eq( 0 ).prop( "id" ) ].join() ),
        selector    = "body";

    if ( typeof args[ 0 ] !== "function" ) {
      selector = args.shift();
    }

    var callback = args.shift();

    jQuery( selector ).on( handleEvent, function( event ) {
      if ( jQuery( event.target ).closest( self ).length === 0 ) {
        callback.apply( self, [ event ] );
      }
    });
  };

  jQuery.fn.outerOff = function() {
    var args = jQuery(arguments).toArray(),
        self = this,
        handleEvent = ( args.shift() + [ ".outer" + "_" + self.eq( 0 ).prop( "id" ) ].join() ),
        selector    = "body";

    if ( typeof args[0] !== "undefined" ) {
      selector = args.shift();
    }

    jQuery( selector ).off( handleEvent );
  }
}

if (typeof jQuery.fn.observeField === "undefined") {
  // jquery.observe_field
  // https://github.com/splendeo/jquery.observe_field
  jQuery.fn.observeField = function(frequency, callback) {
    frequency = frequency * 1000; // translate to milliseconds
    return this.each(function(){
      var self = jQuery(this);
      var prev = self.val();
      var check = function() {
        var val = self.val();
        if(prev != val){
          prev = val;
          self.map(callback); // invokes the callback on jQuery this
        }
      };
      var reset = function() {
        if(ti){
          clearInterval(ti);
          ti = setInterval(check, frequency);
        }
      };
      check();
      var ti = setInterval(check, frequency); // invoke check periodically
      // reset counter after user interaction
      self.bind('keyup click mousemove', reset); //mousemove is for selects
    });
  };
}

})( jQuery );
