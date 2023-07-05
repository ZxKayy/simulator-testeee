// Copyright 2019-2023, University of Colorado Boulder

/**
 * RegionNode displays a region in the 2D grid that spatially partitions the collision detection space.
 * This is used for debugging, and is not visible to the user. See GasPropertiesQueryParameters.regions.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import gasProperties from '../../gasProperties.js';
import Region from '../model/Region.js';

// constants
const FONT = new PhetFont( 14 );

export default class RegionNode extends Node {

  private readonly region: Region;
  private readonly cellNode: Node;
  private readonly countNode: Text;

  public constructor( region: Region, modelViewTransform: ModelViewTransform2 ) {

    const viewBounds = modelViewTransform.modelToViewBounds( region.bounds );

    // Cell in the 2D grid
    const cellNode = new Rectangle( viewBounds.minX, viewBounds.minY, viewBounds.width, viewBounds.height, {
      fill: 'rgba( 0, 255, 0, 0.1 )',
      stroke: 'rgba( 0, 255, 0, 0.4 )',
      lineWidth: 0.25
    } );

    // Displays the number of particles in the Region
    const countNode = new Text( region.particles.length, {
      fill: 'green',
      font: FONT,
      center: cellNode.center
    } );

    super( {
      children: [ cellNode, countNode ],
      isDisposable: false
    } );

    this.region = region;
    this.cellNode = cellNode;
    this.countNode = countNode;
  }

  /**
   * Displays the number of particles in the region.
   */
  public update(): void {
    this.countNode.string = this.region.particles.length;
    this.countNode.center = this.cellNode.center;
  }
}

gasProperties.register( 'RegionNode', RegionNode );