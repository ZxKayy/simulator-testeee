// Copyright 2019-2024, University of Colorado Boulder

/**
 * HistogramNode is the base class for the 'Speed' and 'Kinetic Energy' histograms.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Range from '../../../../dot/js/Range.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import Property from '../../../../axon/js/Property.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, NodeOptions, TColor, Text } from '../../../../scenery/js/imports.js';
import GasPropertiesColors from '../../common/GasPropertiesColors.js';
import gasProperties from '../../gasProperties.js';
import ChartTransform from '../../../../bamboo/js/ChartTransform.js';
import ChartRectangle from '../../../../bamboo/js/ChartRectangle.js';
import GridLineSet from '../../../../bamboo/js/GridLineSet.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import TickMarkSet from '../../../../bamboo/js/TickMarkSet.js';
import TickLabelSet from '../../../../bamboo/js/TickLabelSet.js';
import Utils from '../../../../dot/js/Utils.js';
import HistogramsModel from '../model/HistogramsModel.js';
import HistogramPlot from './HistogramPlot.js';

const AXIS_LABEL_FONT = new PhetFont( 12 );
const TICK_LABEL_FONT = new PhetFont( 12 );

type SelfOptions = {
  chartSize?: Dimension2; // size of the Rectangle that is the histogram background
  backgroundFill?: TColor; // histogram background color
  plotLineWidth?: number; // lineWidth for line segment plots
  barColor?: TColor;
};

export type HistogramNodeOptions = SelfOptions & PickRequired<NodeOptions, 'tandem'>;

export default class HistogramNode extends Node {

  // Plots
  private readonly allPlotNode: HistogramPlot;
  private readonly heavyPlotNode: HistogramPlot;
  private readonly lightPlotNode: HistogramPlot;

  // Data for each plot.
  private readonly allBinCountsProperty: Property<number[]>;
  private readonly heavyBinCountsProperty: Property<number[]>;
  private readonly lightBinCountsProperty: Property<number[]>;

  // Visibility of species-specific plots.
  public readonly heavyPlotVisibleProperty: Property<boolean>;
  public readonly lightPlotVisibleProperty: Property<boolean>;

  // Whether updates are enabled, false ignores binCountsUpdatedEmitter.
  // This is used to prevent updates when the accordion box containing a histogram is collapsed.
  public readonly updateEnabledProperty: Property<boolean>;

  /**
   * @param numberOfBins
   * @param binWidth
   * @param binCountsUpdatedEmitter - notifies when the bin counts have changed
   * @param allBinCountsProperty  - bin counts for all particles
   * @param heavyBinCountsProperty - bin counts for heavy particles
   * @param lightBinCountsProperty - bin counts for light particles
   * @param zoomLevelProperty - index into HistogramsModel.ZOOM_DESCRIPTIONS
   * @param xAxisStringProperty - label on the x-axis
   * @param yAxisStringProperty - label on the y-axis
   * @param providedOptions
   */
  protected constructor( numberOfBins: number,
                         binWidth: number,
                         binCountsUpdatedEmitter: Emitter,
                         allBinCountsProperty: Property<number[]>,
                         heavyBinCountsProperty: Property<number[]>,
                         lightBinCountsProperty: Property<number[]>,
                         zoomLevelProperty: NumberProperty,
                         xAxisStringProperty: TReadOnlyProperty<string>,
                         yAxisStringProperty: TReadOnlyProperty<string>,
                         providedOptions: HistogramNodeOptions ) {
    assert && assert( numberOfBins > 0, `invalid numberOfBins: ${numberOfBins}` );
    assert && assert( binWidth > 0, `invalid binWidth: ${binWidth}` );

    const options = optionize<HistogramNodeOptions, SelfOptions, NodeOptions>()( {

      // SelfOptions
      chartSize: new Dimension2( 150, 130 ),
      backgroundFill: 'black',
      plotLineWidth: 2,
      barColor: 'white',

      // NodeOptions
      isDisposable: false
    }, providedOptions );

    const chartTransform = new ChartTransform( {
      viewWidth: options.chartSize.width,
      viewHeight: options.chartSize.height,
      modelXRange: new Range( 0, numberOfBins ),
      modelYRange: new Range( 0, HistogramsModel.ZOOM_DESCRIPTIONS[ zoomLevelProperty.value ].yMax )
    } );

    // Main body of the chart.
    const chartRectangle = new ChartRectangle( chartTransform, {
      fill: options.backgroundFill,
      stroke: options.backgroundFill
    } );

    // x-axis label
    const xAxisLabelText = new Text( xAxisStringProperty, {
      font: AXIS_LABEL_FONT,
      fill: GasPropertiesColors.textFillProperty,
      maxWidth: 0.9 * chartTransform.viewWidth
    } );
    xAxisLabelText.boundsProperty.link( () => {
      xAxisLabelText.centerX = chartRectangle.centerX;
      xAxisLabelText.top = chartRectangle.bottom + 5;
    } );

    // y-axis label
    const yAxisLabelText = new Text( yAxisStringProperty, {
      font: AXIS_LABEL_FONT,
      fill: GasPropertiesColors.textFillProperty,
      maxWidth: 0.8 * chartTransform.viewHeight,
      rotation: -Math.PI / 2
    } );
    yAxisLabelText.boundsProperty.link( () => {
      yAxisLabelText.right = chartRectangle.left - 8;
      yAxisLabelText.bottom = chartRectangle.bottom - 10;
    } );

    // Grid lines for the y-axis.
    const yMajorGridLines = new GridLineSet( chartTransform, Orientation.VERTICAL, 2, {
      stroke: 'white',
      opacity: 0.75,
      lineWidth: 1
    } );
    const yMinorGridLines = new GridLineSet( chartTransform, Orientation.VERTICAL, 1, {
      stroke: 'white',
      opacity: 0.25,
      lineWidth: 1
    } );

    // Tick marks and labels for y-axis.
    const yTickMarks = new TickMarkSet( chartTransform, Orientation.VERTICAL, 2, {
      skipCoordinates: [ 0 ],
      edge: 'min',
      extent: 8,
      stroke: GasPropertiesColors.textFillProperty
    } );
    const yTickLabels = new TickLabelSet( chartTransform, Orientation.VERTICAL, 1, {
      skipCoordinates: [ 0 ],
      edge: 'min',
      createLabel: ( value: number ) => new Text( Utils.toFixed( value, 0 ), {
        font: TICK_LABEL_FONT,
        fill: GasPropertiesColors.textFillProperty
      } )
    } );

    // Plot for all particles.
    const allPlotNode = new HistogramPlot( chartTransform, allBinCountsProperty.value, {
      closeShape: true,
      fill: options.barColor
    } );

    // Plots for heavy and light particles.
    const heavyPlotNode = new HistogramPlot( chartTransform, heavyBinCountsProperty.value, {
      stroke: GasPropertiesColors.heavyParticleColorProperty,
      lineWidth: options.plotLineWidth
    } );
    const lightPlotNode = new HistogramPlot( chartTransform, lightBinCountsProperty.value, {
      stroke: GasPropertiesColors.lightParticleColorProperty,
      lineWidth: options.plotLineWidth
    } );

    // Parent for all chart elements that should be clipped to chartRectangle.
    const clippedNode = new Node( {
      clipArea: chartRectangle.getShape(),
      children: [ yMinorGridLines, yMajorGridLines, allPlotNode, heavyPlotNode, lightPlotNode ]
    } );

    options.children = [ yTickMarks, chartRectangle, clippedNode, xAxisLabelText, yAxisLabelText, yTickLabels ];

    super( options );

    this.allPlotNode = allPlotNode;
    this.heavyPlotNode = heavyPlotNode;
    this.lightPlotNode = lightPlotNode;
    this.allBinCountsProperty = allBinCountsProperty;
    this.heavyBinCountsProperty = heavyBinCountsProperty;
    this.lightBinCountsProperty = lightBinCountsProperty;

    this.heavyPlotVisibleProperty = new BooleanProperty( false, {
      tandem: options.tandem.createTandem( 'heavyPlotVisibleProperty' ),
      phetioDocumentation: 'whether the plot for heavy particles is visible on the histogram'
    } );

    this.lightPlotVisibleProperty = new BooleanProperty( false, {
      tandem: options.tandem.createTandem( 'lightPlotVisibleProperty' ),
      phetioDocumentation: 'whether the plot for light particles is visible on the histogram'
    } );

    this.updateEnabledProperty = new BooleanProperty( true );
    this.updateEnabledProperty.lazyLink( () => this.update() );

    // Update the histogram when the bin counts have been updated. We do this instead of observing the
    // individual bin count Properties to improve performance because the histogram should be updated atomically.
    binCountsUpdatedEmitter.addListener( () => this.update() );

    // Visibility of heavy plot, updated immediately when it's made visible.
    this.heavyPlotVisibleProperty.link( visible => {
      heavyPlotNode.visible = visible;
      visible && heavyPlotNode.setDataSet( heavyBinCountsProperty.value );
    } );

    // Visibility of light plot, updated immediately when it's made visible.
    this.lightPlotVisibleProperty.link( visible => {
      lightPlotNode.visible = visible;
      visible && lightPlotNode.setDataSet( lightBinCountsProperty.value );
    } );

    zoomLevelProperty.link( zoomLevel => {

      const zoomDescription = HistogramsModel.ZOOM_DESCRIPTIONS[ zoomLevel ];

      // Adjust the chart transform's y-axis range.
      chartTransform.setModelYRange( new Range( 0, zoomDescription.yMax ) );

      // Tick mark and label at yMax only.
      yTickMarks.setSpacing( zoomDescription.yMax );
      yTickLabels.setSpacing( zoomDescription.yMax );

      // Adjust grid lines.
      yMajorGridLines.setSpacing( zoomDescription.majorGridLineSpacing );
      if ( zoomDescription.minorGridLineSpacing !== null ) {
        yMinorGridLines.visible = true;
        yMinorGridLines.setSpacing( zoomDescription.minorGridLineSpacing );
      }
      else {
        yMinorGridLines.visible = false;
      }
    } );
  }

  public reset(): void {
    this.heavyPlotVisibleProperty.reset();
    this.lightPlotVisibleProperty.reset();
  }

  /**
   * Updates plots to display the current bin counts. Update species-specific plots only if they are visible.
   */
  private update(): void {
    if ( this.updateEnabledProperty.value ) {
      this.allPlotNode.setDataSet( this.allBinCountsProperty.value );

      if ( this.heavyPlotVisibleProperty.value ) {
        this.heavyPlotNode.setDataSet( this.heavyBinCountsProperty.value );
      }

      if ( this.lightPlotVisibleProperty.value ) {
        this.lightPlotNode.setDataSet( this.lightBinCountsProperty.value );
      }
    }
  }
}

gasProperties.register( 'HistogramNode', HistogramNode );