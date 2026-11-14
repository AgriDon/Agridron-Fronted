import { Drone } from '@/flightOperations/domain/model/dron.entity.js'
import { FlightOperationsApi } from '../infrastructure/flight-operations-api.js'
import { DroneStatus } from '@/flightOperations/domain/model/dron-status.enum.js'
import { Incident } from '@/flightOperations/domain/model/incident.entity.js'
import { IncidentType } from '@/flightOperations/domain/model/incident-type.enum.js'
import { IncidentSeverity } from '@/flightOperations/domain/model/incident-severity.enum.js'

/**
 * Raised when a drone payload does not pass validation.
 */
export class DroneValidationError extends Error {
  /** @param {Record<string, string>} errors - Field name -> i18n message key. */
  constructor(errors) {
    super('Drone validation failed')
    this.name = 'DroneValidationError'
    this.errors = errors
  }
}

/**
 * Drone use cases: application layer between views and API.
 */
export class DroneUseCases {
  /** @type {FlightOperationsApi} */
  #api

  /** @param {FlightOperationsApi} [api] */
  constructor(api = new FlightOperationsApi()) {
    this.#api = api
  }

  /**
   * @param {{
   *   serialNumber?: string,
   *   model?: string,
   *   modelName?: string,
   *   capacity?: number|string,
   *   status?: string,
   *   urlimg?: string,
   *   imageUrl?: string,
   *   batteryLevel?: number|string,
   *   flightHours?: number|string,
   *   nozzleId?: number|string|null,
   *   lastMaintenanceDate?: string|Date|null,
   *   nextMaintenanceDate?: string|Date|null
   * }} data
   * @param {boolean} [isEditing=false]
   * @returns {Record<string, string>} Field name -> i18n key. Empty when valid.
   */
  static validate(data, isEditing = false) {
    const errors = {}

    if (!isEditing && !data.serialNumber?.trim()) {
      errors.serialNumber = 'drone.form.error.serial-number-required'
    }

    const modelName = data.model?.trim() || data.modelName?.trim()
    if (!modelName) {
      errors.model = 'drone.form.error.model-required'
    }

    const capacity = Number(data.capacity)
    if (data.capacity === '' || data.capacity == null || Number.isNaN(capacity) || capacity <= 0) {
      errors.capacity = 'drone.form.error.capacity-invalid'
    }

    return errors
  }

  /**
   * Transform information data from form to entity drone.
   * @param {Record<string, any>} data
   * @param {number|string} id
   * @returns {Drone}
   */
  static toEntity(data, id) {
    const model = (data.model || data.modelName || '').trim()
    const serial = (data.serialNumber || '').trim()
    const url = data.urlimg || data.imageUrl || ''
    const battery = data.batteryLevel != null ? Number(data.batteryLevel) : 100
    const hours = Number(data.flightHours) || 0
    const nozzle = data.nozzleId != null && data.nozzleId !== '' ? Number(data.nozzleId) : null
    const status = data.status || DroneStatus.AVAILABLE

    return new Drone(
      id,
      serial,
      model,
      Number(data.capacity) || 0,
      status,
      url,
      battery,
      hours,
      nozzle,
      data.lastMaintenanceDate || null,
      data.nextMaintenanceDate || null,
      data.isActive !== false
    )
  }

  /**
   * @param {{ status?: string, minCapacity?: number, maxCapacity?: number }} [params]
   * @returns {Promise<Drone[]>}
   */
  listDrones = (params) => this.#api.getAllDrones(params)

  /**
   * @param {number|string} id
   * @returns {Promise<Drone>}
   */
  getDrone = (id) => this.#api.getDroneById(id)

  /**
   * @param {Record<string, any>} data
   * @returns {Promise<Drone>}
   * @throws {DroneValidationError}
   */
  createDrone = async (data) => {
    const errors = DroneUseCases.validate(data, false)

    if (Object.keys(errors).length > 0) {
      throw new DroneValidationError(errors)
    }

    return this.#api.createDrone(DroneUseCases.toEntity(data, 0))
  }

  /**
   * @param {number|string} id
   * @param {Record<string, any>} data
   * @returns {Promise<Drone>}
   * @throws {DroneValidationError}
   */
  updateDrone = async (id, data) => {
    const errors = DroneUseCases.validate(data, true)

    if (Object.keys(errors).length > 0) {
      throw new DroneValidationError(errors)
    }

    return this.#api.updateDrone(DroneUseCases.toEntity(data, Number(id)))
  }

  /**
   * @param {number|string} id
   * @returns {Promise<void>}
   */
  deleteDrone = (id) => this.#api.deleteDrone(id)


  /**
   * Only changes the status; the maintenance record is created later
   * with MaintenanceRecordUseCases.registerMaintenance.
   *
   * @param {Drone} drone
   * @returns {Promise<Drone>}
   * @throws {Error} when the drone is not AVAILABLE.
   */

  sendToMaintenance = (drone) => {
    if (drone.status !== DroneStatus.AVAILABLE) {
      throw new Error('drone.maintenance.error.send-not-available')
    }

    // Copy of the drone with the new status (the entity is markRaw, so we never mutate it).
    const updated = Object.assign(Object.create(Object.getPrototypeOf(drone)), drone, {
      status: DroneStatus.MAINTENANCE
    })

    return this.#api.updateDrone(updated)
  }



  reportFailure = async (drone, description) => {
    if (!DroneUseCases.canReportFailure(drone)) {
      throw new Error('drone.failure.error.not-allowed')
    }
    if (!description?.trim()) {
      throw new Error('drone.failure.error.description-required')
    }

    await this.#api.createIncident(new Incident(
        null,
        IncidentType.EQUIPMENT_FAILURE,
        description.trim(),
        new Date().toISOString(),
        null,
        drone.id,
        IncidentSeverity.HIGH
    ))

    const updated = Object.assign(Object.create(Object.getPrototypeOf(drone)), drone, {
      status: DroneStatus.OUT_OF_SERVICE
    })

    return this.#api.updateDrone(updated)
  }

  /**
   * A failure can be reported unless the drone is flying or already out of service.
   * @param {Drone|null} drone
   * @returns {boolean}
   */
  static canReportFailure(drone) {
    return [
      DroneStatus.AVAILABLE,
      DroneStatus.ASSIGNED,
      DroneStatus.PAUSED,
      DroneStatus.MAINTENANCE
    ].includes(drone?.status)
  }

}
