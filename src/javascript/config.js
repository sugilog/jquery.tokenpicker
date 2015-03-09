jQuery.tokenpicker.configure = function( object, options ) {
  var name,
      config = {},

  options = jQuery.extend(
    { placeholders: {}, images: {} },
    options
  );

  name          = jQuery.tokenpicker.config.name(   object );
  config.tokens = jQuery.tokenpicker.config.tokens( object, options );
  config.tokens = jQuery.tokenpicker.config.groups( object, options );
  config.tokens = jQuery.tokenpicker.config.items(  object, options );

  jQuery.tokenpicker.config.configs = jQuery.extend(
    {},
    jQuery.tokenpicker.config.configs,
    { name: config }
  );
};

jQuery.tokenpicker.config = function( object ) {
  var name = jQuery.tokenpicker.config.name( object );
  return jQuery.tokenpicker.config.configs[ name ];
};

jQuery.extend(
  jQuery.tokenpicker.config,
  {
    name: function( object ) {
      return object.prop( "name" );
    },
    tokens: function( object, options ) {
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
    groups: function( object, options ) {
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
    items: function( object, options ) {
      return {
        baseName:       jQuery.tokenpicker.config.name( object ),
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
    }
  }
);
