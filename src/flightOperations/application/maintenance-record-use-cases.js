import { FlightOperationsApi } from '../infrastructure/flight-operations-api.js'
import { MaintenanceRecord } from '@/flightOperations/domain/model/maintenance-record.entity.js'
import { MaintenanceType } from '@/flightOperations/domain/model/maintenance-type.enum.js'
import { DroneStatus } from '@/flightOperations/domain/model/dron-status.enum.js'

/**
 * Raised when a maintenance form does not pass validation.
 */
export class MaintenanceValidationError extends Error {
    /** @param {Record<string, string>} errors - Field name -> i18n message key. */
    constructor(errors) {
        super('Maintenance validation failed')
        this.name = 'MaintenanceValidationError'
        this.errors = errors
    }
}

/**
 * Converts a Date (from the date picker) or a string into "YYYY-MM-DD".
 * @param {Date|string|null} value
 * @returns {string|null}
 */
const toIsoDate = (value) => {
    if (!value) return null
    if (value instanceof Date) {
        const y = value.getFullYear()
        const m = String(value.getMonth() + 1).padStart(2, '0')
        const d = String(value.getDate()).padStart(2, '0')
        return `${y}-${m}-${d}`
    }
    return String(value).slice(0, 10)
}

/**
 * Maintenance use cases (DR-005): list a drone's history and register a maintenance.
 */
export class MaintenanceRecordUseCases {
    /** @type {FlightOperationsApi} */
    #api

    /** @param {FlightOperationsApi} [api] */
    constructor(api = new FlightOperationsApi()) {
        this.#api = api
    }

    /**
     * @param {{ date?: Date|string|null, type?: string, technician?: string, nextMaintenanceDate?: Date|string|null }} data
     * @returns {Record<string, string>} Field name -> i18n key. Empty when valid.
     */
    static validate(data) {
        const errors = {}
        const date = toIsoDate(data.date)
        const next = toIsoDate(data.nextMaintenanceDate)

        if (!date) errors.date = 'drone.maintenance.error.date-required'
        if (!Object.values(MaintenanceType).includes(data.type)) errors.type = 'drone.maintenance.error.type-required'
        if (!data.technician?.trim()) errors.technician = 'drone.maintenance.error.technician-required'
        if (!next) errors.nextMaintenanceDate = 'drone.maintenance.error.next-date-required'
        else if (date && next <= date) errors.nextMaintenanceDate = 'drone.maintenance.error.next-date-after'

        return errors
    }

    /**
     * Lists the maintenance records of a drone, most recent first.
     * @param {number|string} droneId
     * @returns {Promise<MaintenanceRecord[]>}
     */
    listByDrone = async (droneId) => {
        const records = await this.#api.getMaintenanceRecordsByDroneId(droneId)
        return [...records].sort((a, b) => String(b.date).localeCompare(String(a.date)))
    }

    /**
     * Saves the maintenance record and updates the drone's maintenance dates.
     * A drone in MAINTENANCE goes back to AVAILABLE.
     *
     * @param {import('@/flightOperations/domain/model/dron.entity.js').Drone} drone
     * @param {{ date: Date|string, type: string, description?: string, technician: string, nextMaintenanceDate: Date|string }} data
     * @returns {Promise<{ record: MaintenanceRecord, drone: import('@/flightOperations/domain/model/dron.entity.js').Drone }>}
     * @throws {MaintenanceValidationError}
     */
    registerMaintenance = async (drone, data) => {
        const errors = MaintenanceRecordUseCases.validate(data)
        if (Object.keys(errors).length > 0) {
            throw new MaintenanceValidationError(errors)
        }

        const record = await this.#api.createMaintenanceRecord(
            new MaintenanceRecord({
                droneId: drone.id,
                date: toIsoDate(data.date),
                type: data.type,
                description: data.description?.trim() || '',
                technician: data.technician.trim()
            })
        )

        // Copy of the drone with the new dates (the entity is markRaw, so we never mutate it).
        const changes = {
            lastMaintenanceDate: record.date,
            nextMaintenanceDate: toIsoDate(data.nextMaintenanceDate),
            status: drone.status === DroneStatus.MAINTENANCE ? DroneStatus.AVAILABLE : drone.status
        }
        const updated = Object.assign(Object.create(Object.getPrototypeOf(drone)), drone, changes)

        const savedDrone = await this.#api.updateDrone(updated)
        return { record, drone: savedDrone }
    }
}