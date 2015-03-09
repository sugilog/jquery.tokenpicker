jQuery.tokenpicker.events = {
  onCloseCandidates: function( event ) {
    var base;

    if ( jQuery( this ).hasClass( jQuery.tokenpicker.items.cssClass.base ) ) {
      base = jQuery( this );
    }
    else {
      base = jQuery( this ).closest( "." + jQuery.tokenpicker.items.cssClass.base );
    }

    base.find( "." + jQuery.tokenpicker.items.cssClass.input ).val( "" );
    base.find( "." + jQuery.tokenpicker.items.cssClass.candidatesArea ).remove();
  },
  afterCloseCandidates: function( event ) {
    jQuery( jQuery.tokenpicker.widget.inputId ).get( 0 ).focus();
  },
  onFocusInputField: function( event ) {
    jQuery.tokenpicker.widget.candidatesArea();
  },
  onInputSearchWord: function( event ) {
    if ( jQuery( this ).val() === "" ) {
      jQuery.tokenpicker.events.onCloseCandidates.apply( this, [ event ] );
      jQuery.tokenpicker.events.afterCloseCandidates.apply( this, [ event ] );
    }
    else {
      var result,
          candidatesArea = jQuery( jQuery.tokenpicker.widget.candidatesAreaId );

      result = jQuery.tokenpicker.search.exec( this );
      jQuery.tokenpicker.widget.candidatesArea( result );

      if ( candidatesArea.hasClass( jQuery.tokenpicker.items.cssClass.found ) ) {
        jQuery.tokenpicker.widget.candidateItem.setCurrentPick( candidatesArea.children().eq( 0 ) );
      }
    }
  },
  onMouseoverCandidates: function( event ) {
    jQuery.tokenpicker.widget.candidateItem.setCurrentPick( this );
  },
  onClickCandidate: function( event ) {
    jQuery.tokenpicker.widget.candidateItem.setCurrentPick( this );
    jQuery.tokenpicker.events.onPickToken.apply( this, [ event ] );
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
      jQuery.tokenpicker.events.onPickToken.apply( this, [ event ] );
      return false;
    case "38":
    case "40":
      var target = jQuery.tokenpicker.widget.candidateItem[ ( event.keyCode.toString() === "38" ) ? "prev" : "next" ]();

      if ( target.length > 0 ) {
        jQuery.tokenpicker.widget.candidateItem.setCurrentPick( target );
      }

      break;
    case "37":
    case "39":
      if ( jQuery( jQuery.tokenpicker.widget.inputId ).val() !== "" ) {
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

      var target = jQuery( jQuery.tokenpicker.widget.inputId ).closest( "li" )[ selector ]();
      target[ append ]( jQuery( jQuery.tokenpicker.widget.inputId ).closest( "li" ) );

      setTimeout( function() {
        jQuery( jQuery.tokenpicker.widget.inputId ).get( 0 ).focus();
      }, 30 );

      break;
    case  "8":
    case "46":
      if ( jQuery( jQuery.tokenpicker.widget.inputId ).val() !== "" ) {
        break;
      }

      var target = jQuery( jQuery.tokenpicker.widget.inputId ).closest( "li" )[ event.keyCode.toString() === "8" ? "prev" : "next" ]();
      jQuery.tokenpicker.events.onRemoveToken.apply( target, [ event ] );
      break;
    }
  },
  onPickToken: function( event ) {
    var tokens,
        current = jQuery.tokenpicker.widget.candidateItem.currentPick();

    if ( current.length > 0 ) {
      tokens = jQuery.tokenpicker.widget.token( current );
      jQuery.tokenpicker.widget.pickedToken.setVal();
    }

    jQuery.tokenpicker.events.onCloseCandidates.apply( this, [ event ] );
    jQuery.tokenpicker.events.afterCloseCandidates.apply( this, [ event ] );

    if ( current.length > 0 && jQuery.isFunction( jQuery.tokenpicker.items.callback.onPick ) ) {
      jQuery.tokenpicker.items.callback.onPick.apply( self, [ tokens ] );
    }
  },
  onRemoveToken: function( event ) {
    var token = jQuery( this ).closest( "." + jQuery.tokenpicker.items.cssClass.pickedToken ),
        data  = token.data();

    token.remove();
    jQuery.tokenpicker.widget.pickedToken.setVal();

    if ( token.length > 0 && jQuery.isFunction( jQuery.tokenpicker.items.callback.onRemove ) ) {
      jQuery.tokenpicker.items.callback.onRemove.apply( self, [ data ] );
    }
  },
  onClearToken: function( event ) {
    var data,
        tokens = jQuery( jQuery.tokenpicker.widget.frameId )
          .find( "." + jQuery.tokenpicker.items.cssClass.pickedToken );

    data = tokens.map( function() {
      return jQuery( this ).data();
    }).toArray();

    tokens.remove();
    jQuery.tokenpicker.widget.pickedToken.setVal();

    if ( tokens.length > 0 && jQuery.isFunction( jQuery.tokenpicker.items.callback.onClear ) ) {
      jQuery.tokenpicker.items.callback.onClear.apply( self, [ data ] );
    }
  },
  outerClick: function() {
    jQuery( "." + jQuery.tokenpicker.items.cssClass.base ).outerOff( "click.tokenpicker" );
    // EVENT: hide on click out of widget
    jQuery( "." + jQuery.tokenpicker.items.cssClass.base ).outerOn( "click.tokenpicker", function( event ) {
      jQuery( this ).each( function() {
        jQuery.tokenpicker.events.onCloseCandidates.apply( this, [ event ] );
      });
    });
  },
  onSortableStart: function( event, ui ) {
    jQuery( "." + jQuery.tokenpicker.items.cssClass.sortablePlaceholder ).text( jQuery.tokenpicker.items.placeholders.sort );
  },
  onSortableUpdate: function( event, ui ) {
    jQuery.tokenpicker.widget.pickedToken.setVal();

    if ( jQuery.isFunction( jQuery.tokenpicker.items.callback.onSort ) ) {
      jQuery.tokenpicker.items.callback.onSort.apply( self, [ jQuery.tokenpicker.widget.pickedToken.items() ] );
    }
  }
};

