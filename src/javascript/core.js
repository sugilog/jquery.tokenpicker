jQuery.fn.tokenpicker = function( options ) {
  var self = jQuery.tokenpicker;

  options = jQuery.extend(
    { placeholders: {}, images: {} },
    options
  );

  // FIXME: build TOKENS, GROUPS, ...

  self.widget.build();
  jQuery( document ).off( "mouseover.tokenpicker", self.widget.candidatesAreaId + " li" );
  jQuery( document ).off( "click.tokenpicker",     self.widget.candidatesAreaId + " li" );
  jQuery( document ).on(  "mouseover.tokenpicker", self.widget.candidatesAreaId + " li", self.events.onMouseoverCandidates );
  jQuery( document ).on(  "click.tokenpicker",     self.widget.candidatesAreaId + " li", self.events.onClickCandidate );
  self.events.outerClick();
};
