/**
 * Operation Status domain entity representing drone telemetry and operational readings.
 */
export class OperationStatus {
  id
  missionId
  droneId
  latitude
  longitude
  altitudeMeters
  speedMetersPerSecond
  batteryLevel
  tankVolumeLiters
  status
  timestamp

  /**
   * @param {number|null} [id=null]
   * @param {number|null} [missionId=null]
   * @param {number|null} [droneId=null]
   * @param {number} [latitude=0]
   * @param {number} [longitude=0]
   * @param {number} [altitudeMeters=0]
   * @param {number} [speedMetersPerSecond=0]
   * @param {number} [batteryLevel=100]
   * @param {number} [tankVolumeLiters=0]
   * @param {string} [status='IN_FLIGHT']
   * @param {string} [timestamp='']
   */
  constructor(
    id = null,
    missionId = null,
    droneId = null,
    latitude = 0,
    longitude = 0,
    altitudeMeters = 2.5,
    speedMetersPerSecond = 4.0,
    batteryLevel = 100,
    tankVolumeLiters = 20,
    status = 'IN_FLIGHT',
    timestamp = ''
  ) {
    this.id = id != null ? Number(id) : null
    this.missionId = missionId != null ? Number(missionId) : null
    this.droneId = droneId != null ? Number(droneId) : null
    this.latitude = Number(latitude) || 0
    this.longitude = Number(longitude) || 0
    this.altitudeMeters = Number(altitudeMeters) || 0
    this.speedMetersPerSecond = Number(speedMetersPerSecond) || 0
    this.batteryLevel = Number(batteryLevel) ?? 100
    this.tankVolumeLiters = Number(tankVolumeLiters) || 0
    this.status = status || 'IN_FLIGHT'
    this.timestamp = timestamp || new Date().toISOString()
  }

  updateLocation(latitude, longitude, status) {
    this.latitude = Number(latitude) || this.latitude
    this.longitude = Number(longitude) || this.longitude
    if (status) this.status = status
  }
}
