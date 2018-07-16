// Copyright 2018, University of Colorado Boulder

/**
 * The view for the 'Intro' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var gasProperties = require( 'GAS_PROPERTIES/gasProperties' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Text = require( 'SCENERY/nodes/Text' );

  /**
   * @param {IntroModel} model
   * @constructor
   */
  function IntroScreenView( model ) {

    ScreenView.call( this );

    //TODO delete this
    var underConstruction = new Text( 'Intro: under construction', {
      font: new PhetFont( 35 ),
      center: this.layoutBounds.center
    } );
    this.addChild( underConstruction );

    // Reset All button
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        model.reset();
      },
      right: this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10
    } );
    this.addChild( resetAllButton );
  }

  gasProperties.register( 'IntroScreenView', IntroScreenView );

  return inherit( ScreenView, IntroScreenView, {

    //TODO Called by the animation loop. Optional, so if your view has no animation, please delete this.
    // @public
    step: function( dt ) {
      //TODO Handle view animation here.
    }
  } );
} );