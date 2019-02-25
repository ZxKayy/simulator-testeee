// Copyright 2018, University of Colorado Boulder

/**
 * A digital stopwatch
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const Circle = require( 'SCENERY/nodes/Circle' );
  const gasProperties = require( 'GAS_PROPERTIES/gasProperties' );
  const LinearFunction = require( 'DOT/LinearFunction' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Property = require( 'AXON/Property' );
  const Stopwatch = require( 'GAS_PROPERTIES/common/model/Stopwatch' );
  const Text = require( 'SCENERY/nodes/Text' );
  const TimerNode = require( 'SCENERY_PHET/TimerNode' );
  const TimerReadoutNode = require( 'SCENERY_PHET/TimerReadoutNode' );
  const ToolDragListener = require( 'GAS_PROPERTIES/common/view/ToolDragListener' );

  // strings
  const picosecondsString = require( 'string!GAS_PROPERTIES/picoseconds' );

  class StopwatchNode extends TimerNode {

    /**
     * @param {Stopwatch} stopwatch
     * @param {Property.<Bounds2|null>} dragBoundsProperty
     * @param {Object} [options]
     */
    constructor( stopwatch, dragBoundsProperty, options ) {

      options = _.extend( {

        // TimerNode options
        maxValue: 999.99,
        unitsNode: new Text( picosecondsString, {
          font: TimerReadoutNode.DEFAULT_SMALL_FONT
        } )
      }, options );

      super( stopwatch.timeProperty, stopwatch.isRunningProperty, options );

      // Put a red dot at the origin, for debugging layout.
      if ( phet.chipper.queryParameters.dev ) {
        this.addChild( new Circle( 3, { fill: 'red' } ) );
      }

      // dragging
      this.addInputListener( new ToolDragListener( this, stopwatch.locationProperty,
        dragBoundsProperty, stopwatch.visibleProperty ) );
    }

    /**
     * Creates an icon for the stopwatch, used to label check boxes.
     * @param {Object} [options]
     * @returns {Node}
     * @public
     * @static
     */
    static createIcon( options ) {

      options = _.extend( {
        scale: 0.25
      }, options );

      const stopwatchNode = new StopwatchNode(
        new Stopwatch( { visible: true } ), // model element
        new Property( null ), // dragBoundsProperty
        { pickable: false } );

      assert && assert( !options.children, 'StopwatchNode.createIcon sets children' );
      options.children = [ stopwatchNode ];

      return new Node( options );
    }
  }

  return gasProperties.register( 'StopwatchNode', StopwatchNode );
} );
 