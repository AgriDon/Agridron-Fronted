import { DroneStatus } from './dron-status.enum.js'

/**
 * Operation Status domain entity representing drone telemetry and operation state.
 */
export class OperationStatus {
  latitude
  longitude
  status
  timestamp
  missionId

  constructor(latitude, longitude, status, timestamp, missionId = null) {
    this.latitude = latitude
    this.longitude = longitude
    this.status = status
    this.timestamp = timestamp
    this.missionId = missionId
  }

  updateLocation(latitude, longitude, status) {
    this.latitude = latitude
    this.longitude = longitude
    this.status = status
  }
}
