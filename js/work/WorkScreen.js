// Copyright 2018, University of Colorado Boulder

/**
 * The 'Work' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var Screen = require( 'JOIST/Screen' );
  var gasProperties = require( 'GAS_PROPERTIES/gasProperties' );
  var WorkModel = require( 'GAS_PROPERTIES/work/model/WorkModel' );
  var WorkScreenView = require( 'GAS_PROPERTIES/work/view/WorkScreenView' );

  // strings
  var screenWorkString = require( 'string!GAS_PROPERTIES/screen.work' );

  /**
   * @constructor
   */
  function WorkScreen() {

    var options = {
      name: screenWorkString,
      backgroundColorProperty: new Property( 'white' )
    };

    Screen.call( this,
      function() { return new WorkModel(); },
      function( model ) { return new WorkScreenView( model ); },
      options
    );
  }

  gasProperties.register( 'WorkScreen', WorkScreen );

  return inherit( Screen, WorkScreen );
} );