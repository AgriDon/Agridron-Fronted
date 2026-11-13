/**
 * Value Object for autonomous drone flight configuration.
 */
export class FlightParameters {
  altitudeMeters
  speedMetersPerSecond
  sprayRateLitersPerHectare
  overlapPercentage

  /**
   * @param {number} [altitudeMeters=2.5]
   * @param {number} [speedMetersPerSecond=4.0]
   * @param {number} [sprayRateLitersPerHectare=15.0]
   * @param {number} [overlapPercentage=20.0]
   */
  constructor(
    altitudeMeters = 2.5,
    speedMetersPerSecond = 4.0,
    sprayRateLitersPerHectare = 15.0,
    overlapPercentage = 20.0
  ) {
    this.altitudeMeters = Number(altitudeMeters) || 0
    this.speedMetersPerSecond = Number(speedMetersPerSecond) || 0
    this.sprayRateLitersPerHectare = Number(sprayRateLitersPerHectare) || 0
    this.overlapPercentage = Number(overlapPercentage) || 0
  }
}
