// Copyright 2018-2019, University of Colorado Boulder

/**
 * ParticleType is an enumeration for particle types in the 'Ideal', 'Explore', and 'Energy' screens.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const Enumeration = require( 'PHET_CORE/Enumeration' );
  const gasProperties = require( 'GAS_PROPERTIES/gasProperties' );

  const ParticleType = Enumeration.byKeys( [ 'HEAVY', 'LIGHT' ] );

  return gasProperties.register( 'ParticleType', ParticleType );
} );