// Copyright 2019-2024, University of Colorado Boulder

/**
 * LidDragListener is the drag listener for the container's lid. It determines the size of the opening in the top of
 * the container.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import { Node } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import gasProperties from '../../gasProperties.js';
import IdealGasLawContainer from '../model/IdealGasLawContainer.js';
import RichDragListener from '../../../../sun/js/RichDragListener.js';

export default class LidDragListener extends RichDragListener {

  public constructor( container: IdealGasLawContainer, modelViewTransform: ModelViewTransform2, parentNode: Node,
                      tandem: Tandem ) {

    // The pointer's x offset from container.getOpeningLeft(), when a drag starts.
    let startXOffset = 0;

    super( {

      start: ( event, listener ) => {

        startXOffset = modelViewTransform.modelToViewX( container.getOpeningLeft() ) -
                       parentNode.globalToParentPoint( event.pointer.point ).x;
      },

      drag: ( event, listener ) => {

        const viewX = parentNode.globalToParentPoint( event.pointer.point ).x;
        const modelX = modelViewTransform.viewToModelX( viewX + startXOffset );
        if ( modelX >= container.getOpeningRight() ) {

          // The lid is fully closed.
          container.lidWidthProperty.value = container.getMaxLidWidth();
        }
        else {

          // The lid is open.
          const openingWidth = container.getOpeningRight() - modelX;
          container.lidWidthProperty.value =
            Math.max( container.getMaxLidWidth() - openingWidth, container.getMinLidWidth() );
        }
      },

      isDisposable: false,
      tandem: tandem
    } );
  }
}

gasProperties.register( 'LidDragListener', LidDragListener );