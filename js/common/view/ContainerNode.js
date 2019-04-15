// Copyright 2018-2019, University of Colorado Boulder

/**
 * View of the Container. Location of the right edge of the container remains fixed.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const DragListener = require( 'SCENERY/listeners/DragListener' );
  const gasProperties = require( 'GAS_PROPERTIES/gasProperties' );
  const GasPropertiesColorProfile = require( 'GAS_PROPERTIES/common/GasPropertiesColorProfile' );
  const HandleNode = require( 'SCENERY_PHET/HandleNode' );
  const HoldConstantEnum = require( 'GAS_PROPERTIES/common/model/HoldConstantEnum' );
  const LidAnimation = require( 'GAS_PROPERTIES/common/view/LidAnimation' );
  const LidNode = require( 'GAS_PROPERTIES/common/view/LidNode' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const Shape = require( 'KITE/Shape' );

  class ContainerNode extends Node {

    /**
     * @param {Container} container
     * @param {ModelViewTransform2} modelViewTransform
     * @param {EnumerationProperty} holdConstantProperty
     * @param {Property.<Bounds2>} visibleBoundsProperty
     * @param {Object} [options]
     * @constructor
     */
    constructor( container, modelViewTransform, holdConstantProperty, visibleBoundsProperty, options ) {

      options = _.extend( {
        resizeGripColor: GasPropertiesColorProfile.resizeGripColorProperty, // {ColorDef} color of the resize handle's grip
        lidGripColor: GasPropertiesColorProfile.lidGripColorProperty, // {ColorDef} color of the lid handle's grip
        resizeHandleIsPressedListener: isPressed => {} // function(isPressed: boolean)
      }, options );

      // Constant aspects of the container, in view coordinates
      const viewLocation = modelViewTransform.modelToViewPosition( container.location );
      const viewHeight = Math.abs( modelViewTransform.modelToViewDeltaY( container.height ) );
      const viewWallThickness = modelViewTransform.modelToViewDeltaX( container.wallThickness );
      const viewOpeningLeftInset = modelViewTransform.modelToViewDeltaX( container.openingLeftInset );
      const viewOpeningRightInset = modelViewTransform.modelToViewDeltaX( container.openingRightInset );

      // Displays the walls of the container
      const wallsNode = new Path( null, {
        stroke: GasPropertiesColorProfile.containerBoundsStrokeProperty,
        lineWidth: viewWallThickness
      } );

      // Displays the previous bounds of the container, visible while dragging.
      // This is a simple rectangle, and does not need to show the previous opening in the top.
      const previousBoundsNode = new Rectangle( 0, 0, 1, 1, {
        stroke: GasPropertiesColorProfile.containerPreviousBoundsStrokeProperty,
        lineWidth: viewWallThickness,
        visible: false
      } );

      const resizeHandleNode = new HandleNode( {
        cursor: 'pointer',
        gripBaseColor: options.resizeGripColor,
        attachmentLineWidth: 1,
        rotation: -Math.PI / 2,
        scale: 0.4
      } );

      const lidNode = new LidNode( {
        cursor: 'pointer',
        baseWidth: modelViewTransform.modelToViewDeltaX( container.lidWidthProperty.value ),
        baseHeight: modelViewTransform.modelToViewDeltaX( container.lidThickness ),
        handleColor: options.lidGripColor
      } );

      assert && assert( !options.children, 'ContainerNode sets children' );
      options = _.extend( {
        children: [ previousBoundsNode, resizeHandleNode, wallsNode, lidNode ]
      }, options );

      super( options );

      // reposition the bottom-left corner of the lid's base, handle may extend past this to the left
      function updateLidPosition() {
        lidNode.x = wallsNode.left;
        lidNode.y = wallsNode.top + viewWallThickness;
      }

      // Update the container width
      container.widthProperty.link( width => {

        const viewWidth = modelViewTransform.modelToViewDeltaX( width );

        // Account for wall thickness, so that container walls are drawn around the container's model bounds.
        const wallOffset = viewWallThickness / 2;
        const left = viewLocation.x - viewWidth - wallOffset;
        const right = viewLocation.x + wallOffset;
        const top = viewLocation.y - viewHeight - wallOffset;
        const bottom = viewLocation.y + wallOffset;

        // Update the walls, start at top-left, origin at bottom-right. Shape looks like:
        //  __               ___
        // |                    |
        // |                    |
        // |                    |
        // |____________________|
        //
        wallsNode.shape = new Shape()
          .moveTo( left + viewOpeningLeftInset, top )
          .lineTo( left, top )
          .lineTo( left, bottom )
          .lineTo( right, bottom )
          .lineTo( right, top )
          .lineTo( right - viewOpeningRightInset, top );

        // reposition the resize handle
        resizeHandleNode.right = wallsNode.left + 1; // hide the overlap
        resizeHandleNode.centerY = wallsNode.centerY;

        // reposition the lid
        updateLidPosition();
      } );

      // Update the lid width
      container.lidWidthProperty.link( lidWidth => {

        // resize the base
        lidNode.setBaseWidth( modelViewTransform.modelToViewDeltaX( lidWidth ) + 1 );  // +1 to cover seam

        // reposition the lid
        updateLidPosition();
      } );

      // Hide the resize handle when volume is held constant
      holdConstantProperty.link( holdConstant => {
        resizeHandleNode.visible = ( holdConstant !== HoldConstantEnum.VOLUME &&
                                     holdConstant !== HoldConstantEnum.PRESSURE_V );
      } );

      // Cancel interaction when visibility of the resize handle changes.
      resizeHandleNode.on( 'visibility', () => resizeHandleNode.interruptSubtreeInput() );

      // Dragging the resize handle horizontally changes the container's width
      const resizeHandleDragListener = new ResizeHandleDragListener( container, modelViewTransform, this );
      resizeHandleNode.addInputListener( resizeHandleDragListener );

      // While interacting with the resize handle...
      resizeHandleDragListener.isPressedProperty.lazyLink( isPressed => {

        // disable interaction with the lid, to simplify implementation
        lidNode.interruptSubtreeInput();
        lidNode.pickable = !isPressed;

        // display the previous bounds of the container
        previousBoundsNode.visible = isPressed;
        previousBoundsNode.setRect( wallsNode.shape.bounds.minX, wallsNode.shape.bounds.minY, wallsNode.shape.bounds.width, wallsNode.shape.bounds.height );
        options.resizeHandleIsPressedListener( isPressed );

        // when the handle is released, log the opening
        !isPressed && phet.log && phet.log( `Container opening from ${container.openingLeft} to ${container.openingRight} nm` );
      } );

      // Dragging the lid horizontally changes the size of the opening in the top of the container
      lidNode.addInputListener( new LidDragListener( container, modelViewTransform, this ) );

      let lidAnimation = null;
      container.lidIsOnProperty.link( lidIsOn => {
        if ( lidIsOn ) {

          // cancel any animation that is in progress
          if ( lidAnimation ) {
            lidAnimation.stop();
            lidAnimation = null;
          }

          // restore the lid in the fully-closed position
          container.lidWidthProperty.value = container.maxLidWidth;
          lidNode.setRotation( 0 );
          updateLidPosition();
          lidNode.visible = true;
        }
        else {

          // blow the lid off of the container
          lidAnimation = new LidAnimation( lidNode, visibleBoundsProperty );
          lidAnimation.endedEmitter.addListener( () => {
            lidNode.visible = false;
          } );
          lidAnimation.start();
        }
      } );
    }
  }

  gasProperties.register( 'ContainerNode', ContainerNode );

  /**
   * Drag listener for the container's resize handle, changes the container's width.
   * Maintains a constant opening size in the top of the container, if possible.
   */
  class ResizeHandleDragListener extends DragListener {

    /**
     * @param {Container} container
     * @param {ModelViewTransform2} modelViewTransform
     * @param {Node} parentNode
     */
    constructor( container, modelViewTransform, parentNode ) {

      // pointer's x offset from the left edge of the container, when a drag starts
      let startXOffset = 0;

      // width of the opening in the top of the container, when a drag starts
      let openingWidth = 0;

      super( {

        start: ( event, listener ) => {
          const viewWidth = modelViewTransform.modelToViewX( container.left );
          startXOffset = viewWidth - parentNode.globalToParentPoint( event.pointer.point ).x;
          openingWidth = container.openingWidth;
        },

        drag: ( event, listener ) => {

          const viewX = parentNode.globalToParentPoint( event.pointer.point ).x;
          const modelX = modelViewTransform.viewToModelX( viewX + startXOffset );

          // resize the container
          const containerWidthRange = container.widthProperty.range;
          container.widthProperty.value = containerWidthRange.constrainValue( container.right - modelX );

          // resize the lid, maintaining the opening width if possible
          container.lidWidthProperty.value = Math.max( container.maxLidWidth - openingWidth, container.minLidWidth );
          openingWidth = container.openingWidth;
        }
      } );
    }
  }

  /**
   * Drag listener for the container's lid, determines the size of the opening in the top of the container.
   */
  class LidDragListener extends DragListener {

    /**
     * @param {Container} container
     * @param {ModelViewTransform2} modelViewTransform
     * @param {Node} parentNode
     */
    constructor( container, modelViewTransform, parentNode ) {

      // pointer's x offset from openingLeft, when a drag starts
      let startXOffset = 0;

      super( {

        start: ( event, listener ) => {
          startXOffset = modelViewTransform.modelToViewX( container.openingLeft ) -
                         parentNode.globalToParentPoint( event.pointer.point ).x;
        },

        drag: ( event, listener ) => {
          const viewX = parentNode.globalToParentPoint( event.pointer.point ).x;
          const modelX = modelViewTransform.viewToModelX( viewX + startXOffset );
          if ( modelX >= container.openingRight ) {

            // the lid is fully closed
            container.lidWidthProperty.value = container.maxLidWidth;
          }
          else {

            // the lid is open
            const openingWidth = container.openingRight - modelX;
            container.lidWidthProperty.value = Math.max( container.maxLidWidth - openingWidth, container.minLidWidth );
          }
        },

        // when the lid handle is released, log the opening
        end: ( listener ) => {
          phet.log && phet.log( `Container opening from ${container.openingLeft} to ${container.openingRight} nm` );
        }
      } );
    }
  }

  return ContainerNode;
} );