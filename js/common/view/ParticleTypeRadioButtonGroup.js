// Copyright 2018-2022, University of Colorado Boulder

/**
 * ParticleTypeRadioButtonGroup is a pair of radio buttons for selecting between heavy and light particle types.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import EnumerationDeprecatedProperty from '../../../../axon/js/EnumerationDeprecatedProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import gasProperties from '../../gasProperties.js';
import GasPropertiesColors from '../GasPropertiesColors.js';
import ParticleType from '../model/ParticleType.js';
import GasPropertiesIconFactory from './GasPropertiesIconFactory.js';

class ParticleTypeRadioButtonGroup extends RectangularRadioButtonGroup {

  /**
   * @param {EnumerationDeprecatedProperty} particleTypeProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor( particleTypeProperty, modelViewTransform, options ) {
    assert && assert( particleTypeProperty instanceof EnumerationDeprecatedProperty,
      `invalid particleTypeProperty: ${particleTypeProperty}` );
    assert && assert( modelViewTransform instanceof ModelViewTransform2,
      `invalid modelViewTransform: ${modelViewTransform}` );

    options = merge( {

      // superclass options
      orientation: 'horizontal',
      baseColor: GasPropertiesColors.radioButtonGroupBaseColorProperty,
      selectedStroke: GasPropertiesColors.radioButtonGroupSelectedStrokeProperty,
      deselectedStroke: GasPropertiesColors.radioButtonGroupDeselectedStrokeProperty,
      selectedLineWidth: 3,
      deselectedLineWidth: 1.5,
      spacing: 8,
      buttonContentXMargin: 15,
      buttonContentYMargin: 12
    }, options );

    const content = [
      {
        value: ParticleType.HEAVY,
        node: GasPropertiesIconFactory.createHeavyParticleIcon( modelViewTransform ),
        tandemName: 'heavyParticlesRadioButton'
      },
      {
        value: ParticleType.LIGHT,
        node: GasPropertiesIconFactory.createLightParticleIcon( modelViewTransform ),
        tandemName: 'lightParticlesRadioButton'
      }
    ];

    super( particleTypeProperty, content, options );
  }
}

gasProperties.register( 'ParticleTypeRadioButtonGroup', ParticleTypeRadioButtonGroup );
export default ParticleTypeRadioButtonGroup;