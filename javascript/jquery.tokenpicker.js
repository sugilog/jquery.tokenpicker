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
  _options.placeholders = _options.placeholders ? _options.placeholders : {};

  var _tokens = $(_options.tokens).map(function(_, _token) {
    var searchValues = $(_options.searchKeys).map(function(_, key) {
      return _token[ key ];
    }).toArray();

    return { token: _token[ _options.tokenKey ], label: _token[ _options.labelKey ], search: searchValues, original: _token };
  });

  var tokenpickerItems = {
    baseName: $(_this).prop("name"),
    tokens:   _tokens,
    tokenSeparator: (_options.separator || ","),
    placeholders: {
      sort: (_options.placeholders.sort || "HERE"),
      start: (_options.placeholders.start || "Type to search..."),
      none: (_options.placeholders.none || "No Results.")
    },
    cssClass: {
      base:                 "tokenpicker_base",
      frame:                "tokenpicker_frame",
      tokenItems:           "tokenpicker_frame_items",
      pickedToken:          "tokenpicker_frame_picked_token",
      sortablePlaceholder : "tokenpicker_frame_sortable_placeholder",
      input:                "tokenpicker_input",
      removeToken:          "tokenpicker_remove_token",
      candidatesArea:       "tokenpicker_candidates_area",
      tokenCandidates:      "tokenpicker_token_candidates",
      found:                "tokenpicker_candidates_found",
      notFound:             "tokenpicker_candidates_not_found",
      currentPick:          "tokenpicker_current_pick"
    },
    callback: {
      onPick:   _options.onPick,
      onRemove: _options.onRemove,
      onSort:   _options.onSort
    }
  };

  var tokenpickerWidget = {
    baseId:  ("#tokenpicker_widget_base_"   + tokenpickerItems.baseName),
    frameId: ("#tokenpicker_widget_frame_"  + tokenpickerItems.baseName),
    inputId: ("#tokenpicker_widget_input_"  + tokenpickerItems.baseName),
    candidatesAreaId: ("#tokenpicker_widget_candidatesArea_" + tokenpickerItems.baseName),
    build: function(){
      this.base();
      this.frame();
      this.inputField();
      this.existingTokens();
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
        // EVENT: sort ( required jquery ui sortable; experimental )
        .sortable({
          placeholder: tokenpickerItems.cssClass.sortablePlaceholder,
          // EVENT: start sorting
          start: events.onSortableStart,
          // EVENT: end sorting
          update: events.onSortableUpdate
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
          .observeField(0.15, events.onInputSearchWord)
          // EVENT: focus inputing
          .on("focus.tokenpicker", events.onFocusInputField)
          // EVENT: key control
          .on("keydown.tokenpicker", events.onSelectTokenCandidates);

      $("<li>")
        .addClass( tokenpickerItems.cssClass.tokenItems )
        .append( _input )
        .appendTo( $(tokenpickerWidget.frameId) );
    },
    existingTokens: function() {
      var existingTokens = $(_this).val().split( tokenpickerItems.tokenSeparator );
      var existingItems = $.grep(tokenpickerItems.tokens, function(item) {
        return ( $.inArray(item.token.toString(), existingTokens) !== -1 );
      });
      $.each(existingItems, function(_, item){
        tokenpickerWidget.token(item);
      });
    },
    token: function(pickedItem) {
      var _label, _data;

      if ($.isPlainObject(pickedItem)) {
        _label = pickedItem.label;
        _data  = pickedItem;
      }
      else {
        _label = pickedItem.data().label;
        _data  = pickedItem.data();
      }

      var item =
        $("<li>")
          .addClass( tokenpickerItems.cssClass.tokenItems )
          .addClass( tokenpickerItems.cssClass.pickedToken )
          .data( _data )
          .append(
            $("<span>")
              .text( _label )
          )
          .append(
            $("<span>")
              .addClass( tokenpickerItems.cssClass.removeToken )
              .text( "×" )
              // EVENT: remove token item
              .on("click.tokenpicker", events.onRemoveToken)
          )
      $(tokenpickerWidget.inputId)
        .closest("." + tokenpickerItems.cssClass.tokenItems)
        .before(item);

      return item;
    },
    candidatesArea: function(tokenCandidates) {
      var candidatesArea = $(tokenpickerWidget.candidatesAreaId);

      if ( candidatesArea.length === 0 ) {
        candidatesArea =
          $("<ul>")
            .prop({
              id: tokenpickerWidget.candidatesAreaId.replace("#", "")
            })
            .addClass( tokenpickerItems.cssClass.candidatesArea )
        candidatesArea.appendTo( $(tokenpickerWidget.baseId) );
      }
      else {
        candidatesArea.children().remove();
        candidatesArea.removeClass( tokenpickerItems.cssClass.found );
        candidatesArea.removeClass( tokenpickerItems.cssClass.notFound );
      }

      if (typeof tokenCandidates !== "undefined") {
        var pickedTokens = tokenpickerWidget.pickedToken.tokens();
        tokenCandidates = $(tokenCandidates).map(function(_, item) {
          if ( $.inArray(item.token, pickedTokens) === -1 ) {
            return item;
          }
        });
      }

      if (typeof tokenCandidates === "undefined") {
        tokenCandidates = [{token: undefined, label: tokenpickerItems.placeholders.start}]
        candidatesArea.addClass( tokenpickerItems.cssClass.notFound );
      }
      else if (tokenCandidates.length === 0) {
        tokenCandidates = [{token: undefined, label: tokenpickerItems.placeholders.none}]
        candidatesArea.addClass( tokenpickerItems.cssClass.notFound );
      }
      else {
        candidatesArea.addClass( tokenpickerItems.cssClass.found );
      }

      $(tokenCandidates).each(function(_, item){
        $("<li>")
          .data(item)
          .addClass( tokenpickerItems.cssClass.tokenCandidates )
          .text( item.label )
          .appendTo(candidatesArea);
      });
    },
    pickedToken: {
      items: function() {
        return ( $(tokenpickerWidget.frameId).find("." + tokenpickerItems.cssClass.pickedToken) || $(undefined) );
      },
      tokens: function() {
        var _tokens =
          tokenpickerWidget.pickedToken.items()
            .map(function(){
              return $(this).data().token;
            })
            .toArray();
        return _tokens || [];
      },
      setVal: function() {
        var pickedTokens = tokenpickerWidget.pickedToken.tokens();
        $(_this).val(pickedTokens.join( tokenpickerItems.tokenSeparator ));
      }
    },
    candidateItem: {
      setCurrentPick: function(target) {
        $(target).siblings().removeClass(tokenpickerItems.cssClass.currentPick);
        $(target).addClass(tokenpickerItems.cssClass.currentPick);
      },
      currentPick: function() {
        var candidatesArea = $(tokenpickerWidget.candidatesAreaId);
        var current = jQuery(undefined);

        if (candidatesArea.hasClass(tokenpickerItems.cssClass.found)) {
          current = candidatesArea.find("." + tokenpickerItems.cssClass.currentPick);
        }

        return current;
      },
      next: function() {
        var current = tokenpickerWidget.candidateItem.currentPick();
        return current.next();
      },
      prev: function() {
        var current = tokenpickerWidget.candidateItem.currentPick();
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
      $(base).find("." + tokenpickerItems.cssClass.candidatesArea).remove();
    },
    afterCloseCandidates: function(_event) {
      $(tokenpickerWidget.inputId).get(0).focus();
    },
    onFocusInputField: function(_event) {
      tokenpickerWidget.candidatesArea();
    },
    onInputSearchWord: function(_event) {
      if ($(this).val() === "") {
        events.onCloseCandidates.apply(this, [_event]);
        events.afterCloseCandidates.apply(this, [_event]);
      }
      else {
        var result = searchUtil.exec(this);
        tokenpickerWidget.candidatesArea(result);
        var candidatesArea = $(tokenpickerWidget.candidatesAreaId);

        if ( candidatesArea.hasClass(tokenpickerItems.cssClass.found) ) {
          tokenpickerWidget.candidateItem.setCurrentPick(candidatesArea.children().eq(0));
        }
      }
    },
    onMouseoverCandidates: function(_event) {
      tokenpickerWidget.candidateItem.setCurrentPick(this);
    },
    onClickCandidate: function(_event) {
      tokenpickerWidget.candidateItem.setCurrentPick(this);
      events.onPickToken.apply(this, [_event]);
    },
    onSelectTokenCandidates: function(_event) {
      // delete   :  8
      // enter    : 13
      // up       : 38
      // down     : 40
      // left     : 37
      // right    : 39
      // backspace: 46

      switch(_event.keyCode.toString()) {
        case "13":
          events.onPickToken.apply(this, [_event]);
          return false;
        case "38":
        case "40":
          var target = tokenpickerWidget.candidateItem[ (_event.keyCode.toString() === "38") ? "prev" : "next" ]();

          if (target.length > 0) {
            tokenpickerWidget.candidateItem.setCurrentPick(target)
          }

          break;
        case "37":
        case "39":
          if ($(tokenpickerWidget.inputId).val() !== "") {
            break;
          }

          var selector, append;

          if (_event.keyCode.toString() === "37") {
            selector = "prev";
            append   = "before";
          }
          else {
            selector = "next";
            append   = "after";
          }

          var target = $(tokenpickerWidget.inputId).closest("li")[selector]();
          target[append]( $(tokenpickerWidget.inputId).closest("li") );

          setTimeout(function(){
            $(tokenpickerWidget.inputId).get(0).focus();
          }, 30);

          break;
        case  "8":
        case "46":
          if ($(tokenpickerWidget.inputId).val() !== "") {
            break;
          }

          var target = $(tokenpickerWidget.inputId).closest("li")[ _event.keyCode.toString() === "8" ? "prev" : "next" ]();
          events.onRemoveToken.apply(target, [_event]);
          break;
      }
    },
    onPickToken: function(_event) {
      var current = tokenpickerWidget.candidateItem.currentPick();
      var _token;

      if (current.length > 0) {
        _token = tokenpickerWidget.token(current);
        tokenpickerWidget.pickedToken.setVal();
      }

      events.onCloseCandidates.apply(this, [_event]);
      events.afterCloseCandidates.apply(this, [_event]);

      if (current.length > 0 && $.isFunction( tokenpickerItems.callback.onPick )) {
        tokenpickerItems.callback.onPick.apply(_this, [_token]);
      }
    },
    onRemoveToken: function(_event) {
      var _token = $(this).closest( "." + tokenpickerItems.cssClass.pickedToken );
      var _data = _token.data();
      _token.remove();
      tokenpickerWidget.pickedToken.setVal();

      if (_token.length > 0 && $.isFunction( tokenpickerItems.callback.onRemove )) {
        tokenpickerItems.callback.onRemove.apply(_this, [_data]);
      }
    },
    outerClick: function() {
      $("." + tokenpickerItems.cssClass.base).outerOff("click.tokenpicker");
      // EVENT: hide on click out of widget
      $("." + tokenpickerItems.cssClass.base).outerOn("click.tokenpicker", function(_event){
        $(this).each(function(){
          events.onCloseCandidates.apply(this, [_event]);
        });
      });
    },
    onSortableStart: function(_event, ui) {
      $("." + tokenpickerItems.cssClass.sortablePlaceholder).text( tokenpickerItems.placeholders.sort );
    },
    onSortableUpdate: function(_event, ui) {
      tokenpickerWidget.pickedToken.setVal();

      if ($.isFunction( tokenpickerItems.callback.onSort )) {
        tokenpickerItems.callback.onSort.apply(_this, [tokenpickerWidget.pickedToken.items()]);
      }
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
  $(document).on("mouseover.tokenpicker", tokenpickerWidget.candidatesAreaId + " li", events.onMouseoverCandidates);
  $(document).on("click.tokenpicker", tokenpickerWidget.candidatesAreaId + " li", events.onClickCandidate);
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

    $(selector).on(handleEvent, function(_event) {
      if ($(_event.target).closest(_this).length === 0) {
        callback.apply(_this, [_event]);
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
