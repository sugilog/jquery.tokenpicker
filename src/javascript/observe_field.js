if ( typeof jQuery.fn.observeField === "undefined" ) {
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
