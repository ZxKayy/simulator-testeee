// Copyright 2019-2023, University of Colorado Boulder

/**
 * DiffusionParticleSystemNode renders the particle system for the 'Diffusion' screen. Other screens require
 * a separate instance of ParticlesNode for particles inside vs outside the container.  But since all particles are
 * confined to the container in the Diffusion screen, a single instance of DiffusionParticleSystemNode will be needed.
 *
 * Do not transform this Node! It's origin must be at the origin of the view coordinate frame.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import ParticleCanvasProperty from '../../common/view/ParticleCanvasProperty.js';
import ParticlesNode from '../../common/view/ParticlesNode.js';
import gasProperties from '../../gasProperties.js';
import DiffusionModel from '../model/DiffusionModel.js';
import DiffusionParticle1 from '../model/DiffusionParticle1.js';
import DiffusionParticle2 from '../model/DiffusionParticle2.js';

export default class DiffusionParticleSystemNode extends ParticlesNode {

  /**
   * @param model - passing in the entire model since we use so much of its public API
   */
  public constructor( model: DiffusionModel ) {

    // generated image for DiffusionParticle1 species
    const particle1ImageProperty = new ParticleCanvasProperty(
      () => new DiffusionParticle1(),
      model.modelViewTransform,
      model.leftSettings.radiusProperty
    );

    // generated image for DiffusionParticle2 species
    const particle2ImageProperty = new ParticleCanvasProperty(
      () => new DiffusionParticle2(),
      model.modelViewTransform,
      model.rightSettings.radiusProperty
    );

    // Arrays for each particle species
    const particleArrays = [ model.particles1, model.particles2 ];

    // Images for each particle species in particleArrays
    const imageProperties = [ particle1ImageProperty, particle2ImageProperty ];

    super( particleArrays, imageProperties, model.modelViewTransform );

    // Size the canvas to match the container bounds. See https://github.com/phetsims/gas-properties/issues/38
    this.setCanvasBounds( model.modelViewTransform.modelToViewBounds( model.container.bounds ) );
  }
}

gasProperties.register( 'DiffusionParticleSystemNode', DiffusionParticleSystemNode );