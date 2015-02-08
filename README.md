jquery.tokenpicker
========================================

You can build multi-pickable text field.

Require
------------------------------------------------------------
- jQuery 1.7+
- jQuery UI 1.8+
  - sortable required

Options
------------------------------------------------------------
<dl>
  <dt>onPick</dt>
  <dd>
    [function] onPick callback.

    <dl>
      <dt>this</dt>
      <dd>
        [jQuery object] tokenpicker caller
      </dd>
      <dt>arguments</dt>
      <dd>
        "items" of picked (selected) items. (Array of jQuery dom object)
      </dd>
    </dl>
  </dd>
  <dt>onSort</dt>
  <dd>
    [function] onSort callback.

    <dl>
      <dt>this</dt>
      <dd>
        [jQuery object] tokenpicker caller
      </dd>
      <dt>arguments</dt>
      <dd>
        "items" of picked (selected) items. (Array of jQuery dom object)
      </dd>
    </dl>
  </dd>
  <dt>onRemove</dt>
  <dd>
    [function] onRemove callback.

    <dl>
      <dt>this</dt>
      <dd>
        [jQuery object] tokenpicker caller
      </dd>
      <dt>arguments</dt>
      <dd>
        "item" of picked (selected) item. (data; dom object has been removed)
      </dd>
    </dl>
  </dd>
  <dt>onClear</dt>
  <dd>
    [function] onClear callback.

    <dl>
      <dt>this</dt>
      <dd>
        [jQuery object] tokenpicker caller
      </dd>
      <dt>arguments</dt>
      <dd>
        "items" of picked (selected) items. (Array of data; dom objects has been removed)
      </dd>
    </dl>
  </dd>
  <dt>tokens</dt>
  <dd>
    [Arrayed Hashes][required] search tokens by hash
  </dd>
  <dt>searchKeys</dt>
  <dd>
    [Arrayed Strings][required] keys of tokens to use as search value.
  </dd>
  <dt>labelKeys</dt>
  <dd>
    [Arrayed Strings][required] keys of tokens to use as label for candidates and picked item.
  </dd>
  <dt>tokenKey</dt>
  <dd>
    [String][required] key of tokens to use as token for field value.
  </dd>
  <dt>separator</dt>
  <dd>
    [String] string for tokens joining separator. ( default: comma ',' )
  </dd>
  <dt>clearButton</dt>
  <dd>
    [Boolean] true/false to append clear button. ( default: false )
  </dd>
  <dt>placeholders.sort</dt>
  <dd>
    [String] placeholder text on sort. ( default: 'HERE' )
  </dd>
  <dt>placeholders.start</dt>
  <dd>
    [String] placeholder text on start searching. ( default: 'Type to search...' )
  </dd>
  <dt>placeholders.none</dt>
  <dd>
    [String] placeholder text on no searched result. ( default: 'No Results.' )
  </dd>
  <dt>imageKey</dt>
  <dd>
    [String] key of tokens to use as display images ( like avator ).
  </dd>
  <dt>images.display</dt>
  <dd>
    [boolean] use images as avator.
  </dd>
  <dt>images.width</dt>
  <dd>
    [Number] image width. ( default: 50 )
  </dd>
  <dt>images.height</dt>
  <dd>
    [Number] image height. ( default: 50 )
  </dd>
</dl>

example:

    <input type="text" name="name_token" />
    <script type="text/javascript">
    <!--
    jQuery( "input[name=name_token]" ).tokenpicker( {
      onPick: function( items ) {
        // do something.
      },
      onRemove: function( item ) {
        // do something.
      },
      onSort: function( items ) {
        // do something.
      },
      onClear: function( items ) {
        // do something
      },
      searchKeys: [ 'name', 'company' ],
      labelKey:   'name',
      tokenKey:   'id',
      separator:  ',',
      clearButton: true,
      tokens: [
        { id: 1, name: "Bob",  company: "Google" },
        { id: 2, name: "John", company: "Apple"  },
        { id: 3, name: "Mary", company: "Google" }
      ]
    });
    -->
    </script>

Utility Methods
------------------------------------------------------------
none. (please tell me if you need.)

Licence
------------------------------------------------------------
jquery.tokenpicker is licenced under the MIT License.
