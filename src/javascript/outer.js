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
