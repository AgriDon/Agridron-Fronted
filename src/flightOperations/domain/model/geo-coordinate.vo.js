/**
 * Value Object for geographical coordinates.
 */
export class GeoCoordinate {
  latitude
  longitude

  /**
   * @param {number} [latitude=0]
   * @param {number} [longitude=0]
   */
  constructor(latitude = 0, longitude = 0) {
    this.latitude = Number(latitude) || 0
    this.longitude = Number(longitude) || 0
  }
}
