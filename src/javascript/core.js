jQuery.fn.tokenpicker = function( options ) {
  var self = jQuery.tokenpicker;

  self.configure( jQuery( this ), options );

  self.widget.build();
  jQuery( document ).off( "mouseover.tokenpicker", self.widget.candidatesAreaId + " li" );
  jQuery( document ).off( "click.tokenpicker",     self.widget.candidatesAreaId + " li" );
  jQuery( document ).on(  "mouseover.tokenpicker", self.widget.candidatesAreaId + " li", self.events.onMouseoverCandidates );
  jQuery( document ).on(  "click.tokenpicker",     self.widget.candidatesAreaId + " li", self.events.onClickCandidate );
  self.events.outerClick();
};

jQuery.tokenpicker = {};
