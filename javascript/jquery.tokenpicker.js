/*!
 * jquery.tokenpicker v0.0.1
 *
 * Copyright (c) 2012 Takayuki Sugita, http://github.com/sugilog
 * Released under the MIT License
*/
(function($) {

$.fn.tokenpicker = function(_options) {
  // prepare
  var _this = this;
  _options = _options ? _options : {};

  // FIXME: check options arguments

  var _tokens = $(_options.tokens).map(function(_, _token) {
    var searchValues = $(_options.searchKeys).map(function(_, key) {
      return _token[ key ];
    }).toArray();

    return { token: _token[ _options.tokenKey ], label: _token[ _options.labelKey ], search: searchValues, original: _token };
  });

  var tokenpickerItems = {
    baseName: $(_this).prop("name"),
    tokens:   _tokens,
    cssClass: {
      base:          "tokenpicker_base",
      frame:         "tokenpicker_frame",
      tokenItems:    "tokenpicker_frame_items",
      pickedToken:   "tokenpicker_frame_picked_token",
      label:         "tokenpicker_label",
      input:         "tokenpicker_input",
      search:        "tokenpicker_search",
      searchedItems: "tokenpicker_searched_items",
      found:         "tokenpicker_candidates_found",
      currentPick:   "tokenpicker_current_pick"
    }
  };

  var tokenpickerWidget = {
    baseId:   ("#tokenpicker_widget_base_"   + tokenpickerItems.baseName),
    frameId:  ("#tokenpicker_widget_frame_"  + tokenpickerItems.baseName),
    inputId:  ("#tokenpicker_widget_input_"  + tokenpickerItems.baseName),
    searchId: ("#tokenpicker_widget_search_" + tokenpickerItems.baseName),
    build: function(){
      this.base();
      this.frame();
      // this.existingToken()
      this.inputField();
    },
    base: function() {
      $(_this)
        .wrap(
          jQuery("<div>")
            .prop({
              id: tokenpickerWidget.baseId.replace("#", "")
            })
            .addClass(tokenpickerItems.cssClass.base)
        )
        .css({ display: 'none' });
    },
    frame: function() {
      $("<ul>")
        .prop({
          id: tokenpickerWidget.frameId.replace("#", "")
        })
        .addClass( tokenpickerItems.cssClass.frame )
        // EVENT: click in frame to focus
        .on("click.tokenpicker", function() {
          $(tokenpickerWidget.inputId).get(0).focus();
        })
        .appendTo( $(tokenpickerWidget.baseId) );
    },
    inputField: function() {
      var _input =
        $("<input>")
          .prop({
            id:   tokenpickerWidget.inputId.replace("#", ""),
            type: "text",
            "autocomplete": "off"
          })
          .attr("autocomplete", "off")
          .addClass( tokenpickerItems.cssClass.input )
          // EVENT: observe inputing
          .observeField(0.15, events.onInputSearchWord);

      $("<li>")
        .addClass( tokenpickerItems.cssClass.tokenItems )
        .append( _input )
        .appendTo( $(tokenpickerWidget.frameId) );
    },
    token: function(pickedItem) {
      $(tokenpickerWidget.inputId)
        .closest("." + tokenpickerItems.cssClass.tokenItems)
        .before(
          $("<li>")
            .addClass( tokenpickerItems.cssClass.tokenItems )
            .addClass( tokenpickerItems.cssClass.pickedToken )
            .text( pickedItem.data().label )
            .data(pickedItem.data())
        );
    },
    list: function(searchedTokens) {
      var search = $(tokenpickerWidget.searchId);

      if ( search.length === 0 ) {
        search =
          $("<ul>")
            .prop({
              id: tokenpickerWidget.searchId.replace("#", "")
            })
            .addClass( tokenpickerItems.cssClass.search )
        search.appendTo( $(tokenpickerWidget.baseId) );
      }
      else {
        search.children().remove();
        search.removeClass( tokenpickerItems.cssClass.found );
      }

      if (typeof searchedTokens !== "undefined") {
        var pickedTokens = tokenpickerWidget.pickedToken.tokens();
        searchedTokens = $(searchedTokens).map(function(_, item) {
          if ( $.inArray(item.token, pickedTokens) === -1 ) {
            return item;
          }
        });
      }

      if (typeof searchedTokens === "undefined") {
        searchedTokens = [{token: undefined, label: "Searching..."}]
      }
      else if (searchedTokens.length === 0) {
        searchedTokens = [{token: undefined, label: "No Results."}]
      }
      else {
        search.addClass( tokenpickerItems.cssClass.found );
      }

      $(searchedTokens).each(function(_, item){
        $("<li>")
          .data(item)
          .addClass( tokenpickerItems.cssClass.searchedItems )
          .text( item.label )
          .appendTo(search);
      });
    },
    pickedToken: {
      tokens: function() {
        var _tokens =
          $(tokenpickerWidget.frameId)
            .find("." + tokenpickerItems.cssClass.pickedToken)
            .map(function(){
              return $(this).data().token;
            })
            .toArray();
        return _tokens || [];
      }
    },
    listItem: {
      setCurrentPick: function(target) {
        $(target).siblings().removeClass(tokenpickerItems.cssClass.currentPick);
        $(target).addClass(tokenpickerItems.cssClass.currentPick);
      },
      currentPick: function() {
        var list = $(tokenpickerWidget.searchId);
        var current = jQuery(undefined);

        if (list.hasClass(tokenpickerItems.cssClass.found)) {
          current = list.find("." + tokenpickerItems.cssClass.currentPick);
        }

        return current;
      },
      next: function() {
        var current = tokenpickerWidget.listItem.currentPick();
        return current.next();
      },
      prev: function() {
        var current = tokenpickerWidget.listItem.currentPick();
        return current.prev();
      }
    }
  }

  var events = {
    onCloseCandidates: function(_event) {
      var base;

      if ( $(this).hasClass(tokenpickerItems.cssClass.base) ) {
        base = this;
      }
      else {
        base = $(this).closest("." + tokenpickerItems.cssClass.base);
      }

      $(base).find("." + tokenpickerItems.cssClass.input).val("");
      $(base).find("." + tokenpickerItems.cssClass.search).remove();
    },
    onInputSearchWord: function(_event) {
      if ($(this).val() === "") {
        events.onCloseCandidates.apply(this, [_event]);
      }
      else {
        var result = searchUtil.exec(this);
        tokenpickerWidget.list(result);
        var search = $(tokenpickerWidget.searchId);

        if ( search.hasClass(tokenpickerItems.cssClass.found) ) {
          tokenpickerWidget.listItem.setCurrentPick(search.children().eq(0));
        }
      }
    },
    onSelectTokenCandidates: function(_event) {
      if (_event.keyCode == "13" || _event.keyCode == "38" || _event.keyCode == "40") {
        if (_event.keyCode == "13") {
          events.onPickToken.apply(this, [_event]);
          return false;
        }
        else {
          var target = tokenpickerWidget.listItem[ (_event.keyCode == "38") ? "prev" : "next" ]();

          if (target.length > 0) {
            tokenpickerWidget.listItem.setCurrentPick(target)
          }
        }
      }
    },
    onPickToken: function(_event) {
      var current = tokenpickerWidget.listItem.currentPick();

      if (current.length > 0) {
        tokenpickerWidget.token(current);
      }

      events.onCloseCandidates.apply(this, [_event]);
    },
    outerClick: function() {
      $("." + tokenpickerItems.cssClass.base).outerOff("click.tokenpicker");
      // EVENT: hide on click out of widget
      $("." + tokenpickerItems.cssClass.base).outerOn("click.tokenpicker", function(_event){
        $(this).each(function(){
          events.onCloseCandidates.apply(this, [_event]);
        });
      });
    }
  }

  // share with selectpicker
  var searchUtil = {
    exec: function(_input) {
      return searchUtil.find( $(_input).val() || "" );
    },
    find: function(query) {
      var that = this;

      return $(tokenpickerItems.tokens).map(function(_, _token){
        // FIXME: find by Array
        if (searchUtil.matchAll(query, _token.search.join("||"))) {
          return _token;
        }
      }).toArray();
    },
    matchAll: function(query, sequence) {
      var regexes = [/.*/];

      if (query.length > 0) {
        regexes = $(query.split(/(?:\s|　)/)).map(function(idx, val){
          return new RegExp(val, "i")
        }).toArray();
      }

      var result = true

      $.each(regexes, function(_, regex) {
        if (!regex.test(sequence)) {
          result = false
          return
        }
      })

      return result;
    }
  }


  tokenpickerWidget.build();
  $(document).on("keydown", tokenpickerWidget.inputId, events.onSelectTokenCandidates);
  events.outerClick();

}

if (typeof $.fn.outerOn === "undefined" && typeof $.fn.outerOff === "undefined") {
  $.fn.outerOn = function() {
    var args = $(arguments).toArray();
    var _this = this;
    var handleEvent = (args.shift() + [".outer" + "_" + _this.get(0).id].join());
    var selector = "body";

    if (typeof args[0] !== "function") {
      selector = args.shift();
    }

    var callback = args.shift();

    $(selector).on(handleEvent, function(e) {
      if ($(e.target).closest(_this).length === 0) {
        callback.apply(_this, [e]);
      }
    });
  };

  $.fn.outerOff = function() {
    var args = $(arguments).toArray();
    var _this = this;
    var handleEvent = (args.shift() + [".outer" + "_" + _this.get(0).id].join());
    var selector = "body";

    if (typeof args[0] !== "undefined") {
      selector = args.shift();
    }

    $(selector).off(handleEvent);
  }
}

if (typeof $.fn.observeField === "undefined") {
  // jquery.observe_field
  // https://github.com/splendeo/jquery.observe_field
  $.fn.observeField = function(frequency, callback) {
    frequency = frequency * 1000; // translate to milliseconds
    return this.each(function(){
      var _this = $(this);
      var prev = _this.val();
      var check = function() {
        var val = _this.val();
        if(prev != val){
          prev = val;
          _this.map(callback); // invokes the callback on $this
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
      _this.bind('keyup click mousemove', reset); //mousemove is for selects
    });
  };
}

})(jQuery);
