jQuery.tokenpicker.configure = function( context, options ) {
  var name,
      config = {};

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
      var baseName = jQuery.tokenpicker.config.contextName( context ),
          noop = function(){};

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
          onPick:   options.onPick || noop,
          onRemove: options.onRemove || noop,
          onSort:   options.onSort || noop,
          onClear:  options.onClear || noop
        }
      };
    }
  }
);
