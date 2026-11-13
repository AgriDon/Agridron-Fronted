import { DroneStatus } from './dron-status.enum.js'

/**
 * Domain entity representing an agricultural Drone in Flight Operations.
 */
export class Drone {
  id
  serialNumber
  modelName
  capacity
  status
  urlimg
  batteryLevel
  flightHours
  nozzleId
  lastMaintenanceDate
  nextMaintenanceDate
  isActive

  /**
   * @param {number|string} id
   * @param {string} serialNumber
   * @param {string} modelName
   * @param {number} capacity
   * @param {string} [status]
   * @param {string} [urlimg]
   * @param {number} [batteryLevel]
   * @param {number} [flightHours]
   * @param {number|null} [nozzleId]
   * @param {string|Date|null} [lastMaintenanceDate]
   * @param {string|Date|null} [nextMaintenanceDate]
   * @param {boolean} [isActive]
   */
  constructor(
    id,
    serialNumber,
    modelName,
    capacity,
    status = DroneStatus.AVAILABLE,
    urlimg = '',
    batteryLevel = 100,
    flightHours = 0,
    nozzleId = null,
    lastMaintenanceDate = null,
    nextMaintenanceDate = null,
    isActive = true
  ) {
    if (!Object.values(DroneStatus).includes(status)) {
      throw new Error(`Estado inválido: "${status}". Debe ser un valor de DroneStatus.`)
    }
    this.id = id
    this.serialNumber = serialNumber
    this.modelName = modelName
    this.capacity = Number(capacity) || 0
    this.status = status
    this.urlimg = urlimg
    this.batteryLevel = Number(batteryLevel) ?? 100
    this.flightHours = Number(flightHours) || 0
    this.nozzleId = nozzleId != null ? Number(nozzleId) : null
    this.lastMaintenanceDate = lastMaintenanceDate
    this.nextMaintenanceDate = nextMaintenanceDate
    this.isActive = isActive !== false
  }

  getId() { return this.id }
  getSerialNumber() { return this.serialNumber }
  getModelName() { return this.modelName }
  getCapacity() { return this.capacity }
  getStatus() { return this.status }
  getUrlimg() { return this.urlimg }
  getBatteryLevel() { return this.batteryLevel }
  getFlightHours() { return this.flightHours }
  getNozzleId() { return this.nozzleId }
  getLastMaintenanceDate() { return this.lastMaintenanceDate }
  getNextMaintenanceDate() { return this.nextMaintenanceDate }

  assignToMission() { this.status = DroneStatus.ASSIGNED }

  updateStatus(status) {
    if (!Object.values(DroneStatus).includes(status)) {
      throw new Error(`Estado inválido: "${status}". Debe ser un valor de DroneStatus.`)
    }
    this.status = status
  }
}
