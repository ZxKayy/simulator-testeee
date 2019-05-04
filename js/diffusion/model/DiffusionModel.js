// Copyright 2018-2019, University of Colorado Boulder

/**
 * Model for the 'Diffusion' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const BaseModel = require( 'GAS_PROPERTIES/common/model/BaseModel' );
  const CollisionDetector = require( 'GAS_PROPERTIES/common/model/CollisionDetector' );
  const DiffusionContainer = require( 'GAS_PROPERTIES/diffusion/model/DiffusionContainer' );
  const DiffusionExperiment = require( 'GAS_PROPERTIES/diffusion/model/DiffusionExperiment' );
  const DiffusionParticle1 = require( 'GAS_PROPERTIES/diffusion/model/DiffusionParticle1' );
  const DiffusionParticle2 = require( 'GAS_PROPERTIES/diffusion/model/DiffusionParticle2' );
  const EnumerationProperty = require( 'AXON/EnumerationProperty' );
  const gasProperties = require( 'GAS_PROPERTIES/gasProperties' );
  const GasPropertiesConstants = require( 'GAS_PROPERTIES/common/GasPropertiesConstants' );
  const NormalTimeTransform = require( 'GAS_PROPERTIES/common/model/NormalTimeTransform' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const ParticleFlowRate = require( 'GAS_PROPERTIES/diffusion/model/ParticleFlowRate' );
  const ParticleUtils = require( 'GAS_PROPERTIES/common/model/ParticleUtils' );
  const Property = require( 'AXON/Property' );
  const SlowTimeTransform = require( 'GAS_PROPERTIES/common/model/SlowTimeTransform' );
  const Timescale = require( 'GAS_PROPERTIES/diffusion/model/Timescale' );
  const Vector2 = require( 'DOT/Vector2' );

  // constants
  const NUMBER_OF_PARTICLES_OPTIONS = { numberType: 'Integer' };
  const CENTER_OF_MASS_OPTIONS = {
    isValidValue: value => ( value === null || typeof value === 'number' ),
    units: 'pm'
  };
  const AVERAGE_TEMPERATURE_OPTIONS = {
    isValidValue: value => ( value === null || typeof value === 'number' ),
    units: 'K'
  };

  class DiffusionModel extends BaseModel {

    constructor() {

      super( {
        modelOriginOffset: new Vector2( 645, 525 ), // offset of the model's origin, in view coordinates
        stopwatchLocation: new Vector2( 35, 15 ) // in view coordinates! determined empirically
      } );

      // @public
      this.timescaleProperty = new EnumerationProperty( Timescale, Timescale.NORMAL );

      // Change the time transform to match the timescale.
      this.timescaleProperty.link( timescale => {
        if ( timescale === Timescale.NORMAL ) {
          this.timeTransform = new NormalTimeTransform();
        }
        else {
          this.timeTransform = new SlowTimeTransform();
        }
      } );

      // @public
      this.container = new DiffusionContainer();

      // @public parameters that define the experiment to be run when the container's divider is removed
      this.experiment = new DiffusionExperiment();

      // @public (read-only) particles of each type
      this.particles1 = []; // {DiffusionParticle1[]}
      this.particles2 = []; // {DiffusionParticle2[]}

      // @public (read-only) centerX of mass for particles of types DiffusionParticle1 and DiffusionParticle2
      this.centerXOfMass1Property = new Property( null, CENTER_OF_MASS_OPTIONS );
      this.centerXOfMass2Property = new Property( null, CENTER_OF_MASS_OPTIONS );

      // @public flow rate model for particles of types DiffusionParticle1 and DiffusionParticle2
      this.particleFlowRate1 = new ParticleFlowRate( this.container.dividerX, this.particles1 );
      this.particleFlowRate2 = new ParticleFlowRate( this.container.dividerX, this.particles2 );

      // @public (read-only) Data for the left half of the container
      this.leftNumberOfParticles1Property = new NumberProperty( 0, NUMBER_OF_PARTICLES_OPTIONS );
      this.leftNumberOfParticles2Property = new NumberProperty( 0, NUMBER_OF_PARTICLES_OPTIONS );
      this.leftAverageTemperatureProperty = new Property( null, AVERAGE_TEMPERATURE_OPTIONS );

      // @public (read-only) Data for the right half of the container
      this.rightNumberOfParticles1Property = new NumberProperty( 0, NUMBER_OF_PARTICLES_OPTIONS );
      this.rightNumberOfParticles2Property = new NumberProperty( 0, NUMBER_OF_PARTICLES_OPTIONS );
      this.rightAverageTemperatureProperty = new Property( null, AVERAGE_TEMPERATURE_OPTIONS );

      // @public (read-only)
      this.collisionDetector = new CollisionDetector( this.container, [ this.particles1, this.particles2 ], {
        regionLength: this.container.height / 4
      } );

      // Add or remove particles
      this.experiment.numberOfParticles1Property.link( numberOfParticles => {
        this.numberOfParticlesListener( numberOfParticles,
          this.container.leftBounds,
          this.experiment.mass1Property.value,
          this.experiment.radius1Property.value,
          this.experiment.initialTemperature1Property.value,
          this.particles1,
          DiffusionParticle1 );
      } );
      this.experiment.numberOfParticles2Property.link( numberOfParticles => {
        this.numberOfParticlesListener( numberOfParticles,
          this.container.rightBounds,
          this.experiment.mass2Property.value,
          this.experiment.radius2Property.value,
          this.experiment.initialTemperature2Property.value,
          this.particles2,
          DiffusionParticle2 );
      } );

      // Update mass and temperature of existing particles. This adjusts speed of the particles.
      Property.multilink( [ this.experiment.mass1Property, this.experiment.initialTemperature1Property ],
        ( mass, initialTemperature ) => { updateMassAndTemperature( mass, initialTemperature, this.particles1 ); }
      );
      Property.multilink( [ this.experiment.mass2Property, this.experiment.initialTemperature2Property ],
        ( mass, initialTemperature ) => { updateMassAndTemperature( mass, initialTemperature, this.particles2 ); }
      );

      // When the divider is restored, create a new initial state with same numbers of particles.
      this.container.hasDividerProperty.link( hasDivider => {
        if ( hasDivider ) {

          // Delete existing DiffusionParticle1 particles, create a new set
          const numberOfParticles1 = this.experiment.numberOfParticles1Property.value;
          this.experiment.numberOfParticles1Property.value = 0;
          this.experiment.numberOfParticles1Property.value = numberOfParticles1;

          // Delete existing DiffusionParticle2 particles, create a new set
          const numberOfParticles2 = this.experiment.numberOfParticles2Property.value;
          this.experiment.numberOfParticles2Property.value = 0;
          this.experiment.numberOfParticles2Property.value = numberOfParticles2;

          // Reset flow rate models
          this.particleFlowRate1.reset();
          this.particleFlowRate2.reset();
        }
      } );
    }

    /**
     * Resets the model.
     * @public
     * @override
     */
    reset() {
      super.reset();

      // components
      this.container.reset();

      // Properties
      this.timescaleProperty.reset();
      this.experiment.reset();
      this.particleFlowRate1.reset();
      this.particleFlowRate2.reset();
      // other Properties will be updated by experiment.reset

      assert && assert( this.particles1.length === 0, 'there should be no DiffusionParticle1 particles' );
      assert && assert( this.particles2.length === 0, 'there should be no DiffusionParticle2 particles' );
    }

    /**
     * Steps the model using model time units.
     * @param {number} dt - time delta, in ps
     * @protected
     * @override
     */
    stepModelTime( dt ) {
      super.stepModelTime( dt );

      // Step particles
      ParticleUtils.stepParticles( this.particles1, dt );
      ParticleUtils.stepParticles( this.particles2, dt );

      // Particle Flow Rate model
      if ( !this.container.hasDividerProperty.value ) {
        this.particleFlowRate1.step( dt );
        this.particleFlowRate2.step( dt );
      }

      // Collision detection and response
      this.collisionDetector.step( dt );

      // Update Properties that are based on the current state of the system.
      this.update();
    }

    /**
     * Adjusts an array of particles to have the desired number of elements.
     * @param {number} numberOfParticles - desired number of particles
     * @param {Bounds2} locationBounds - initial location will be inside this bounds
     * @param {number} mass
     * @param {number} radius
     * @param {number} initialTemperature
     * @param {Particle[]} particles - array of particles that corresponds to newValue and oldValue
     * @param particleConstructor - constructor for elements in particles array
     * @private
     */
    numberOfParticlesListener( numberOfParticles, locationBounds, mass, radius, initialTemperature, particles, particleConstructor ) {
      const delta = numberOfParticles - particles.length;
      if ( delta !== 0 ) {
        if ( delta > 0 ) {
          this.addParticles( delta, locationBounds, mass, radius, initialTemperature, particles, particleConstructor );
        }
        else {
          ParticleUtils.removeParticles( -delta, particles );
        }
      }
    }

    /**
     * Adds n particles to the end of the specified array.
     * @param {number} n
     * @param {Bounds2} locationBounds - initial location will be inside this bounds
     * @param {number} mass
     * @param {number} radius
     * @param {number} initialTemperature
     * @param {Particle[]} particles
     * @param {constructor} Constructor - a Particle subclass constructor
     * @private
     */
    addParticles( n, locationBounds, mass, radius, initialTemperature, particles, Constructor ) {

      // Create n particles
      for ( let i = 0; i < n; i++ ) {

        const particle = new Constructor( {
          mass: mass,
          radius: radius
        } );

        // Position the particle at a random location within locationBounds, accounting for particle radius.
        const x = phet.joist.random.nextDoubleBetween( locationBounds.minX + particle.radius, locationBounds.maxX - particle.radius );
        const y = phet.joist.random.nextDoubleBetween( locationBounds.minY + particle.radius, locationBounds.maxY - particle.radius );
        particle.setLocationXY( x, y );
        assert && assert( locationBounds.containsPoint( particle.location ), 'particle is outside of locationBounds' );

        // Set the initial velocity, based on initial temperature and mass.
        particle.setVelocityPolar(
          // |v| = sqrt( 3kT / m )
          Math.sqrt( 3 * GasPropertiesConstants.BOLTZMANN * initialTemperature / particle.mass ),

          // Random angle
          phet.joist.random.nextDouble() * 2 * Math.PI
        );

        particles.push( particle );
      }

      // If paused, update things that would normally be handled by step.
      if ( !this.isPlayingProperty.value ) {
        this.update();
      }
    }

    /**
     * Updates Properties that are based on the current state of the system.
     * @private
     */
    update() {
      this.updateCenterOfMass();
      this.updateParticleCounts();
      this.updateAverageTemperatures(); // do this after updateParticleCounts!
    }

    /**
     * Updates the center of mass, as shown by the center-of-mass indicators.
     * @private
     */
    updateCenterOfMass() {
      this.centerXOfMass1Property.value = ParticleUtils.getCenterXOfMass( this.particles1 );
      this.centerXOfMass2Property.value = ParticleUtils.getCenterXOfMass( this.particles2 );
    }

    /**
     * Updates particle counts for the left and right sides of the container, as displayed in the Data accordion box.
     * @private
     */
    updateParticleCounts() {
      updateLeftRightCounts( this.particles1, this.container.leftBounds,
        this.leftNumberOfParticles1Property, this.rightNumberOfParticles1Property );
      updateLeftRightCounts( this.particles2, this.container.leftBounds,
        this.leftNumberOfParticles2Property, this.rightNumberOfParticles2Property );
    }

    /**
     * Updates average temperatures for the left and right sides of the container, as displayed in the Data accordion box.
     * @private
     */
    updateAverageTemperatures() {

      let leftTotalKE = 0;
      let rightTotalKE = 0;

      // add KE contribution for particle1
      for ( let i = 0; i < this.particles1.length; i++ ) {
        const particle = this.particles1[ i ];
        if ( this.container.leftBounds.containsPoint( particle.location ) ) {
          leftTotalKE += particle.kineticEnergy;
        }
        else {
          rightTotalKE += particle.kineticEnergy;
        }
      }

      // add KE contribution for particle2
      for ( let i = 0; i < this.particles2.length; i++ ) {
        const particle = this.particles2[ i ];
        if ( this.container.leftBounds.containsPoint( particle.location ) ) {
          leftTotalKE += particle.kineticEnergy;
        }
        else {
          rightTotalKE += particle.kineticEnergy;
        }
      }

      const leftNumberOfParticles = this.leftNumberOfParticles1Property.value + this.leftNumberOfParticles2Property.value;
      const rightNumberOfParticles = this.rightNumberOfParticles1Property.value + this.rightNumberOfParticles2Property.value;

      if ( leftNumberOfParticles === 0 ) {
        this.leftAverageTemperatureProperty.value = null;
      }
      else {

        // T = (2/3)KE/k
        const leftAverageKE = leftTotalKE / leftNumberOfParticles;
        this.leftAverageTemperatureProperty.value = ( 2 / 3 ) * leftAverageKE / GasPropertiesConstants.BOLTZMANN; // K
      }

      if ( rightNumberOfParticles === 0 ) {
        this.rightAverageTemperatureProperty.value = null;
      }
      else {

        // T = (2/3)KE/k
        const rightAverageKE = rightTotalKE / rightNumberOfParticles;
        this.rightAverageTemperatureProperty.value = ( 2 / 3 ) * rightAverageKE / GasPropertiesConstants.BOLTZMANN; // K
      }
    }
  }

  /**
   * When mass or initial temperature changes, update particles and adjust their speed accordingly.
   * @param {number} mass
   * @param {number} temperature
   * @param {Particle[]} particles
   */
  function updateMassAndTemperature( mass, temperature, particles ) {
    for ( let i = 0; i < particles.length; i++ ) {
      particles[ i ].mass = mass;

      // |v| = sqrt( 3kT / m )
      particles[ i ].setVelocityMagnitude( Math.sqrt( 3 * GasPropertiesConstants.BOLTZMANN * temperature / mass ) );
    }
  }

  /**
   * Updates particle counts for the left and right sides of the container.
   * @param {Particle[]} particles
   * @param {Bounds2} leftBounds
   * @param {NumberProperty} leftNumberOfParticlesProperty
   * @param {NumberProperty} rightNumberOfParticlesProperty
   */
  function updateLeftRightCounts( particles, leftBounds, leftNumberOfParticlesProperty, rightNumberOfParticlesProperty ) {
    leftNumberOfParticlesProperty.value = 0;
    rightNumberOfParticlesProperty.value = 0;
    for ( let i = 0; i < particles.length; i++ ) {
      if ( leftBounds.containsPoint( particles[ i ].location ) ) {
        leftNumberOfParticlesProperty.value++;
      }
      else {
        rightNumberOfParticlesProperty.value++;
      }
    }
  }

  return gasProperties.register( 'DiffusionModel', DiffusionModel );
} );