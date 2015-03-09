var TOKENS, GROUPS,
    self = jQuery( this ),
    REMOVE = "×";

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

jQuery.tokenpicker.items = {
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
    inputContainer:       "tokenpicker_frame_input_container",
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

// share with selectpicker
jQuery.tokenpicker.search = {
  exec: function( input ) {
    return jQuery.tokenpicker.search.find( jQuery( input ).val() || "" );
  },
  find: function( query ) {
    var that = this;

    return jQuery.map( TOKENS.concat( GROUPS ), function( token ) {
      // FIXME: find by Array
      if ( jQuery.tokenpicker.search.matchAll( query, token.search.join( "||" ) ) ) {
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
