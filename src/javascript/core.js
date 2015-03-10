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

      if ( current.length > 0 ) {
        config.items.callback.onPick.apply( context, [ tokens ] );
      }
    },
    onAddToken: function( token ) {
      var tokens;

      if ( token ) {
        tokens = jQuery.tokenpicker.widget.token( context, token );
        jQuery.tokenpicker.widget.pickedToken.setVal( context );
        config.items.callback.onPick.apply( context, [ tokens ] );
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

      if ( token.length > 0 ) {
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

      if ( tokens.length > 0 ) {
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
      config.items.callback.onSort.apply( context, [ jQuery.tokenpicker.widget.pickedToken.items( context ) ] );
    }
  };

  config.events = events;

  run();
};
