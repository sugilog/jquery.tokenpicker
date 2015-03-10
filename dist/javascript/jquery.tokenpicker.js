/*!
 * jquery.tokenpicker v0.0.3
 *
 * Copyright (c) Takayuki Sugita, https://github.com/sugilog/jquery.tokenpicker
 * Released under the MIT License
*/

( function() {
"use strict";
jQuery.tokenpicker = {};
jQuery.fn.tokenpicker = function( options ) {
  var events, config,
      context = jQuery( this );

  jQuery.tokenpicker.configure( context, options );
  config = jQuery.tokenpicker.config( context );

  function run() {
    jQuery.tokenpicker.widget.build( context );
    jQuery( document ).off( "mouseover.tokenpicker", config.items.selector.candidatesAreaId + " li" );
    jQuery( document ).off( "click.tokenpicker",     config.items.selector.candidatesAreaId + " li" );
    jQuery( document ).on(  "mouseover.tokenpicker", config.items.selector.candidatesAreaId + " li", events.onMouseoverCandidates );
    jQuery( document ).on(  "click.tokenpicker",     config.items.selector.candidatesAreaId + " li", events.onClickCandidate );
    events.outerClick();
  };

  events = {
    onCloseCandidates: function( event ) {
      var base;

      if ( jQuery( this ).hasClass( config.items.cssClass.base ) ) {
        base = jQuery( this );
      }
      else {
        base = jQuery( this ).closest( "." + config.items.cssClass.base );
      }

      base.find( "." + config.items.cssClass.input ).val( "" );
      base.find( "." + config.items.cssClass.candidatesArea ).remove();
    },
    afterCloseCandidates: function( event ) {
      jQuery( config.items.selector.inputId ).get( 0 ).focus();
    },
    onFocusInputField: function( event ) {
      jQuery.tokenpicker.widget.candidatesArea( context );
    },
    onInputSearchWord: function( event ) {
      if ( jQuery( this ).val() === "" ) {
        events.onCloseCandidates.apply( this, [ event ] );
        events.afterCloseCandidates.apply( this, [ event ] );
      }
      else {
        var result,
            candidatesArea = jQuery( config.items.selector.candidatesAreaId );

        result = jQuery.tokenpicker.search.exec( context, this );
        jQuery.tokenpicker.widget.candidatesArea( context, result );

        if ( candidatesArea.hasClass( config.items.cssClass.found ) ) {
          jQuery.tokenpicker.widget.candidateItem.setCurrentPick( context, candidatesArea.children().eq( 0 ) );
        }
      }
    },
    onMouseoverCandidates: function( event ) {
      jQuery.tokenpicker.widget.candidateItem.setCurrentPick( context, this );
    },
    onClickCandidate: function( event ) {
      jQuery.tokenpicker.widget.candidateItem.setCurrentPick( context, this );
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
        var target = jQuery.tokenpicker.widget.candidateItem[ ( event.keyCode.toString() === "38" ) ? "prev" : "next" ]( context );

        if ( target.length > 0 ) {
          jQuery.tokenpicker.widget.candidateItem.setCurrentPick( context, target );
        }

        break;
      case "37":
      case "39":
        if ( jQuery( config.items.selector.inputId ).val() !== "" ) {
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

        var target = jQuery( config.items.selector.inputId ).closest( "li" )[ selector ]();
        target[ append ]( jQuery( config.items.selector.inputId ).closest( "li" ) );

        setTimeout( function() {
          jQuery( config.items.selector.inputId ).get( 0 ).focus();
        }, 30 );

        break;
      case  "8":
      case "46":
        if ( jQuery( config.items.selector.inputId ).val() !== "" ) {
          break;
        }

        var target = jQuery( config.items.selector.inputId ).closest( "li" )[ event.keyCode.toString() === "8" ? "prev" : "next" ]();
        events.onRemoveToken.apply( target, [ event ] );
        break;
      }
    },
    onPickToken: function( event ) {
      var tokens,
          current = jQuery.tokenpicker.widget.candidateItem.currentPick( context );

      if ( current.length > 0 ) {
        tokens = jQuery.tokenpicker.widget.token( context, current );
        jQuery.tokenpicker.widget.pickedToken.setVal( context );
      }

      events.onCloseCandidates.apply( this, [ event ] );
      events.afterCloseCandidates.apply( this, [ event ] );

      if ( current.length > 0 && jQuery.isFunction( config.items.callback.onPick ) ) {
        config.items.callback.onPick.apply( context, [ tokens ] );
      }
    },
    onAddToken: function( token ) {
      var tokens;

      if ( token ) {
        tokens = jQuery.tokenpicker.widget.token( context, token );
        jQuery.tokenpicker.widget.pickedToken.setVal( context );

        if ( jQuery.isFunction( config.items.callback.onPick ) ) {
          config.items.callback.onPick.apply( context, [ tokens ] );
        }
      }
      else {
        return false;
      }
    },
    onRemoveToken: function( event ) {
      var token = jQuery( this ).closest( "." + config.items.cssClass.pickedToken ),
          data  = token.data();

      token.remove();
      jQuery.tokenpicker.widget.pickedToken.setVal( context );

      if ( token.length > 0 && jQuery.isFunction( config.items.callback.onRemove ) ) {
        config.items.callback.onRemove.apply( context, [ data ] );
      }
    },
    onClearToken: function( event ) {
      var data,
          tokens = jQuery( config.items.selector.frameId )
            .find( "." + config.items.cssClass.pickedToken );

      data = tokens.map( function() {
        return jQuery( this ).data();
      }).toArray();

      tokens.remove();
      jQuery.tokenpicker.widget.pickedToken.setVal( context );

      if ( tokens.length > 0 && jQuery.isFunction( config.items.callback.onClear ) ) {
        config.items.callback.onClear.apply( context, [ data ] );
      }
    },
    outerClick: function() {
      jQuery( "." + config.items.cssClass.base ).outerOff( "click.tokenpicker" );
      // EVENT: hide on click out of widget
      jQuery( "." + config.items.cssClass.base ).outerOn( "click.tokenpicker", function( event ) {
        jQuery( this ).each( function() {
          events.onCloseCandidates.apply( this, [ event ] );
        });
      });
    },
    onSortableStart: function( event, ui ) {
      jQuery( "." + config.items.cssClass.sortablePlaceholder ).text( config.items.placeholders.sort );
    },
    onSortableUpdate: function( event, ui ) {
      jQuery.tokenpicker.widget.pickedToken.setVal( context );

      if ( jQuery.isFunction( config.items.callback.onSort ) ) {
        config.items.callback.onSort.apply( context, [ jQuery.tokenpicker.widget.pickedToken.items( context ) ] );
      }
    }
  };

  config.events = events;

  run();
};

jQuery.tokenpicker.configure = function( context, options ) {
  var name,
      config = {},

  options = jQuery.extend(
    { placeholders: {}, images: {} },
    options
  );

  name          = jQuery.tokenpicker.config.contextName( context );
  config.tokens = jQuery.tokenpicker.config.tokens( context, options );
  config.groups = jQuery.tokenpicker.config.groups( context, options );
  config.items  = jQuery.tokenpicker.config.items(  context, options );

  jQuery.tokenpicker.config.configs = jQuery.extend(
    {},
    jQuery.tokenpicker.config.configs
  );

  jQuery.tokenpicker.config.configs[ name ] = config;
};

jQuery.tokenpicker.config = function( context ) {
  var name = jQuery.tokenpicker.config.contextName( context );
  return jQuery.tokenpicker.config.configs[ name ];
};

jQuery.extend(
  jQuery.tokenpicker.config,
  {
    contextName: function( context ) {
      return context.prop( "name" );
    },
    tokens: function( context, options ) {
      return jQuery.map( options.tokens, function( token ) {
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
    },
    groups: function( context, options ) {
      return jQuery.map( ( options.groups || [] ), function( group ) {
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
    },
    items: function( context, options ) {
      var baseName = jQuery.tokenpicker.config.contextName( context );

      return {
        baseName:       baseName,
        tokenSeparator: ( options.separator || "," ),
        clearButton:    !!options.clearButton,
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
          inputContainer:       "tokenpicker_frame_input_container",
          input:                "tokenpicker_input",
          removeToken:          "tokenpicker_remove_token",
          candidatesArea:       "tokenpicker_candidates_area",
          tokenCandidates:      "tokenpicker_token_candidates",
          found:                "tokenpicker_candidates_found",
          notFound:             "tokenpicker_candidates_not_found",
          currentPick:          "tokenpicker_current_pick"
        },
        selector: {
          baseId:           ( "#tokenpicker_widget_base_"   + baseName ),
          frameId:          ( "#tokenpicker_widget_frame_"  + baseName ),
          inputId:          ( "#tokenpicker_widget_input_"  + baseName ),
          clearButtonId:    ( "#tokenpicker_widget_clear_"  + baseName ),
          candidatesAreaId: ( "#tokenpicker_widget_candidatesArea_" + baseName )
        },
        callback: {
          onPick:   options.onPick,
          onRemove: options.onRemove,
          onSort:   options.onSort,
          onClear:  options.onClear
        }
      };
    }
  }
);

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
    
    token.find( "." + config.items.cssClass.removeToken ).trigger( "click" );
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

if ( typeof jQuery.fn.outerOn === "undefined" && typeof jQuery.fn.outerOff === "undefined" ) {
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
    var args = jQuery( arguments ).toArray(),
        self = this,
        handleEvent = ( args.shift() + [ ".outer" + "_" + self.eq( 0 ).prop( "id" ) ].join() ),
        selector    = "body";

    if ( typeof args[ 0 ] !== "undefined" ) {
      selector = args.shift();
    }

    jQuery( selector ).off( handleEvent );
  }
}
})();