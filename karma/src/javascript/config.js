describe( "jQuery.tokenpicker.configure", function() {
  beforeEach( function() {
    jQuery.tokenpicker.config.configs = undefined;
    jQuery( "<input>" ).prop( { name: "test1" } ).appendTo( document.body );
    jQuery( "<input>" ).prop( { name: "test2" } ).appendTo( document.body );
  });

  afterEach( function() {
    jQuery( "input[name=test1]" ).remove();
    jQuery( "input[name=test2]" ).remove();
  });

  it( "should no configs", function() {
    expect( jQuery.tokenpicker.config.configs ).to.be.undefined;
  });

  it( "should add config for test1", function() {
    jQuery.tokenpicker.configure(
      jQuery( "input[name=test1]" ),
      {
        tokens: [
          { id: 1, short: "USA", name: "United States" },
          { id: 2, short: "JPN", name: "Japan" }
        ],
        searchKeys: [ "name", "short" ],
        labelKey:   "name",
        tokenKey:   "id"
      }
    );

    expect( jQuery.tokenpicker.config.configs ).not.to.be.undefined;
    expect( jQuery.tokenpicker.config.configs[ "test1" ] ).not.to.be.undefined;
    expect( jQuery.tokenpicker.config.configs[ "test1" ].tokens ).not.to.be.undefined;
    expect( jQuery.tokenpicker.config.configs[ "test1" ].groups ).not.to.be.undefined;
    expect( jQuery.tokenpicker.config.configs[ "test1" ].items  ).not.to.be.undefined;
  });
});

describe( "jQuery.tokenpicker.config", function() {
  beforeEach( function() {
    jQuery.tokenpicker.config.configs = undefined;
    jQuery( "<input>" ).prop( { name: "test1" } ).appendTo( document.body );
    jQuery( "<input>" ).prop( { name: "test2" } ).appendTo( document.body );

    jQuery.tokenpicker.configure(
      jQuery( "input[name=test1]" ),
      {
        tokens: [
          { id: 1, short: "USA", name: "United States" },
          { id: 2, short: "JPN", name: "Japan" }
        ],
        searchKeys: [ "name", "short" ],
        labelKey:   "name",
        tokenKey:   "id"
      }
    );
  });

  afterEach( function() {
    jQuery( "input[name=test1]" ).remove();
    jQuery( "input[name=test2]" ).remove();
  });

  it( "should no configs", function() {
    expect( jQuery.tokenpicker.config( jQuery( "input[name=test2]" ) ) ).to.be.undefined;
  });

  it( "should add config for test1", function() {
    expect( jQuery.tokenpicker.config( jQuery( "input[name=test1]" ) ) ).not.to.be.undefined;
  });
});
