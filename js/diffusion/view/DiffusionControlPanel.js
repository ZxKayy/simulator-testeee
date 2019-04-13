// Copyright 2019, University of Colorado Boulder

/**
 * Control panel that appears on the right side of the 'Diffusion' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const CenterOfMassCheckbox = require( 'GAS_PROPERTIES/diffusion/view/CenterOfMassCheckbox' );
  const DividerToggleButton = require( 'GAS_PROPERTIES/diffusion/view/DividerToggleButton' );
  const FixedWidthNode = require( 'GAS_PROPERTIES/common/view/FixedWidthNode' );
  const gasProperties = require( 'GAS_PROPERTIES/gasProperties' );
  const GasPropertiesColorProfile = require( 'GAS_PROPERTIES/common/GasPropertiesColorProfile' );
  const GasPropertiesConstants = require( 'GAS_PROPERTIES/common/GasPropertiesConstants' );
  const HSeparator = require( 'SUN/HSeparator' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Panel = require( 'SUN/Panel' );
  const ParticleFlowRateCheckbox = require( 'GAS_PROPERTIES/diffusion/view/ParticleFlowRateCheckbox' );
  const Property = require( 'AXON/Property' );
  const QuantityControl = require( 'GAS_PROPERTIES/diffusion/view/QuantityControl' );
  const RangeWithValue = require( 'DOT/RangeWithValue' );
  const StopwatchCheckbox = require( 'GAS_PROPERTIES/common/view/StopwatchCheckbox' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  const initialNumberString = require( 'string!GAS_PROPERTIES/initialNumber' );
  const massAmuString = require( 'string!GAS_PROPERTIES/massAmu' );
  const initialTemperatureKString = require( 'string!GAS_PROPERTIES/initialTemperatureK' );

  class DiffusionControlPanel extends Panel {

    /**
     * @param {DiffusionModel} model
     * @param {BooleanProperty} hasDividerProperty
     * @param {BooleanProperty} particleFlowRateVisibleProperty
     * @param {BooleanProperty} centerOfMassVisibleProperty
     * @param {BooleanProperty} stopwatchVisibleProperty
     * @param {Object} [options]
     */
    constructor( model, hasDividerProperty, particleFlowRateVisibleProperty,
                 centerOfMassVisibleProperty, stopwatchVisibleProperty, options ) {

      options = _.extend( {
        fixedWidth: 100,
        xMargin: 0
      }, GasPropertiesConstants.PANEL_OPTIONS, options );

      const separatorWidth = options.fixedWidth - ( 2 * options.xMargin );

      const spinnersEnabledProperty = new DerivedProperty( [ hasDividerProperty ], hasDivider => hasDivider );

      //TODO move to model
      const initialNumberRangeProperty = new Property( new RangeWithValue( 0, 100, 0 ) );
      const initialNumber1Property = new NumberProperty( initialNumberRangeProperty.value.defaultValue );
      const initialNumber2Property = new NumberProperty( initialNumberRangeProperty.value.defaultValue );
      const initialNumberControl = new QuantityControl( model.modelViewTransform, initialNumberString,
        initialNumber1Property, initialNumberRangeProperty,
        initialNumber2Property, initialNumberRangeProperty,
        spinnersEnabledProperty, {
          deltaValue: 10
        } );

      // TODO move to model
      const massRangeProperty = new Property( new RangeWithValue( 4, 32, 28 ) );
      const mass1Property = new NumberProperty( massRangeProperty.value.defaultValue );
      const mass2Property = new NumberProperty( massRangeProperty.value.defaultValue );
      const massControl = new QuantityControl( model.modelViewTransform, massAmuString,
        mass1Property, massRangeProperty,
        mass2Property, massRangeProperty,
        spinnersEnabledProperty, {
          deltaValue: 1
        } );

      //TODO move to model
      const initialTemperatureRangeProperty = new Property( new RangeWithValue( 50, 500, 300 ) );
      const initialTemperature1Property = new NumberProperty( initialTemperatureRangeProperty.value.defaultValue );
      const initialTemperature2Property = new NumberProperty( initialTemperatureRangeProperty.value.defaultValue );
      const initialTemperatureControl = new QuantityControl( model.modelViewTransform, initialTemperatureKString,
        initialTemperature1Property, initialTemperatureRangeProperty,
        initialTemperature2Property, initialTemperatureRangeProperty,
        spinnersEnabledProperty, {
          deltaValue: 50
        } );

      hasDividerProperty.link( hasDivider => {
        if ( hasDivider ) {
          initialNumber1Property.reset();
          initialNumber2Property.reset();
          mass1Property.reset();
          mass2Property.reset();
          initialTemperature1Property.reset();
          initialTemperature2Property.reset();
        }
      } );

      const content = new VBox( {
        align: 'left',
        spacing: 22,
        children: [
          new VBox( {
            spacing: 20,
            align: 'left',
            children: [
              //TODO alignment
              initialNumberControl,
              massControl,
              initialTemperatureControl,
              new DividerToggleButton( hasDividerProperty ) //TODO center
            ]
          } ),
          new HSeparator( separatorWidth, {
            stroke: GasPropertiesColorProfile.separatorColorProperty,
            maxWidth: separatorWidth
          } ),
          new VBox( {
            align: 'left',
            spacing: 12,
            children: [
              new ParticleFlowRateCheckbox( particleFlowRateVisibleProperty ),
              new CenterOfMassCheckbox( centerOfMassVisibleProperty ),
              new StopwatchCheckbox( stopwatchVisibleProperty )
            ]
          } )
        ]
      } );

      const fixedWidthNode = new FixedWidthNode( content, {
        fixedWidth: separatorWidth
      } );

      super( fixedWidthNode, options );
    }
  }

  return gasProperties.register( 'DiffusionControlPanel', DiffusionControlPanel );
} );