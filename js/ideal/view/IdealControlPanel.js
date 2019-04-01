// Copyright 2018-2019, University of Colorado Boulder

/**
 * Control panel that appears in the upper-right corner of the 'Ideal' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const CollisionCounterCheckbox = require( 'GAS_PROPERTIES/common/view/CollisionCounterCheckbox' );
  const FixedWidthPanel = require( 'GAS_PROPERTIES/common/view/FixedWidthPanel' );
  const gasProperties = require( 'GAS_PROPERTIES/gasProperties' );
  const GasPropertiesColorProfile = require( 'GAS_PROPERTIES/common/GasPropertiesColorProfile' );
  const GasPropertiesConstants = require( 'GAS_PROPERTIES/common/GasPropertiesConstants' );
  const HoldConstantControls = require( 'GAS_PROPERTIES/ideal/view/HoldConstantControls' );
  const HSeparator = require( 'SUN/HSeparator' );
  const SizeCheckbox = require( 'GAS_PROPERTIES/common/view/SizeCheckbox' );
  const StopwatchCheckbox = require( 'GAS_PROPERTIES/common/view/StopwatchCheckbox' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  class IdealControlPanel extends FixedWidthPanel {

    /**
     * @param {StringProperty} holdConstantProperty
     * @param {BooleanProperty} sizeVisibleProperty
     * @param {BooleanProperty} stopwatchVisibleProperty
     * @param {BooleanProperty} collisionCounterVisibleProperty
     * @param {Object} [options]
     */
    constructor( holdConstantProperty, sizeVisibleProperty,
                 stopwatchVisibleProperty, collisionCounterVisibleProperty, options ) {

      options = _.extend( {
        fixedWidth: 250
      }, GasPropertiesConstants.PANEL_OPTIONS, options );

      const separatorWidth = options.fixedWidth - ( 2 * options.xMargin );

      const content = new VBox( {
        align: 'left',
        spacing: 10,
        children: [
          new HoldConstantControls( holdConstantProperty, { maxWidth: separatorWidth } ),
          new HSeparator( separatorWidth, {
            stroke: GasPropertiesColorProfile.separatorColorProperty,
            maxWidth: separatorWidth
          } ),
          new SizeCheckbox( sizeVisibleProperty ),
          new StopwatchCheckbox( stopwatchVisibleProperty ),
          new CollisionCounterCheckbox( collisionCounterVisibleProperty )
        ]
      } );

      super( content, options );
    }
  }

  return gasProperties.register( 'IdealControlPanel', IdealControlPanel );
} );
 