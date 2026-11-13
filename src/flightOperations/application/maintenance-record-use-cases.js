import { FlightOperationsApi } from '@/flightOperations/infrastructure/flight-operations-api.js'

export class MaintenanceRecordUseCases {
    #flightOperationsApi = new FlightOperationsApi()

    /**
     * Lists maintenance records, optionally filtered by drone ID.
     * @param {Object} params
     * @param {number} [params.droneId]
     * @returns {Promise<MaintenanceRecord[]>}
     */
    listMaintenanceRecords = async (params = {}) => {
        const { droneId } = params
        if (droneId != null) {
            return await this.#flightOperationsApi.getMaintenanceRecordsByDroneId(droneId)
        } else {
            return await this.#flightOperationsApi.getAllMaintenanceRecords(params)
        }
    }

    /**
     * Registers a new maintenance record for a drone.
     * @param {MaintenanceRecord} record
     * @returns {Promise<MaintenanceRecord>}
     */
    registerMaintenance = async (record) => {
        return await this.#flightOperationsApi.createMaintenanceRecord(record)
    }
}