// Copyright 2019, University of Colorado Boulder

/**
 * Utility functions used in this sim.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const gasProperties = require( 'GAS_PROPERTIES/gasProperties' );
  const Util = require( 'DOT/Util' );

  const GasPropertiesUtils = {

    /**
     * Generates n values with a Gaussian mean and deviation.
     * @param {number} n - number of values to generate
     * @param {number} mean - mean of the Gaussian
     * @param {number} deviation - standard deviation of the Gaussian
     * @param {number} threshold - acceptable difference between the desired and actual mean
     * @returns {number[]}
     */
    getGaussianValues: function( n, mean, deviation, threshold ) {

      const values = [];
      let sum = 0;

      // Generate a random Gaussian sample whose values have the desired mean and standard deviation.
      for ( let i = 0; i < n; i++ ) {
        const speed = Util.boxMullerTransform( mean, deviation, phet.joist.random );
        values.push( speed );
        sum += speed;
      }
      assert && assert( values.length === n, 'wrong number of values' );

      // Adjust values so that the actual mean matches the desired mean.
      const emergentMean = sum / n;
      const deltaMean = mean - emergentMean;
      sum = 0;
      for ( let i = 0; i < values.length; i++ ) {
        const speed = values[ i ] + deltaMean;
        values[ i ] = speed;
        sum += speed;
      }

      // Verify that the actual mean is within the tolerance.
      const actualMean = sum / n;
      assert && assert( Math.abs( actualMean - mean ) < threshold,
        `mean: ${mean}, actualMean: ${actualMean}` );

      return values;
    },

    //TODO delete if unused
    /**
     * Are 2 values sufficiently close?
     * Used in situations where floating-point error prevents values from being precisely equal.
     * @param {number} value1
     * @param {number} value2
     * @param {number} threshold
     * @returns {boolean}
     */
    close( value1, value2, threshold ) {
      assert && assert( typeof value1 === 'number', `invalid value1: ${value1}` );
      assert && assert( typeof value2 === 'number', `invalid value1: ${value2}` );
      assert && assert( threshold >= 0, `invalid threshold: ${threshold}` );
      return Math.abs( value1 - value2 ) < threshold;
    }
  };

  return gasProperties.register( 'GasPropertiesUtils', GasPropertiesUtils );
} );