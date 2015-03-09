jQuery.tokenpicker.events = {
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
  onClickCandidate: function( event ) {
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

