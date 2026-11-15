import { BaseApiEndpoint } from '@/shared/infrastructure/base-api-endpoint.js'
import { ENDPOINTS, buildUrl } from '@/config/env.js'
import { DronAssembler } from './dron-assembler.js'
import { MaintenanceRecordAssembler } from './maintenance-record-assembler.js'

/**
 * API endpoint client for drone CRUD operations.
 */
export class DronApiEndpoint extends BaseApiEndpoint {
  /**
   * @param {import('axios').AxiosInstance} http - Axios instance
   */
  /** Maps the maintenance history returned by GET /drones/{id}/maintenance-records. */
  #maintenanceAssembler = new MaintenanceRecordAssembler()

  constructor(http) {
    super(http, buildUrl(ENDPOINTS.drones), new DronAssembler())
  }

  /**
   * Fetches drones with optional status and capacity filters.
   * @param {{ status?: string, minCapacity?: number, maxCapacity?: number }} [params]
   * @returns {Promise<import('../domain/model/dron.entity.js').Drone[]>}
   */
  async getAll(params = {}) {
    try {
      const cleanParams = {}
      if (params.status) cleanParams.status = params.status
      if (params.minCapacity != null) cleanParams.minCapacity = params.minCapacity
      if (params.maxCapacity != null) cleanParams.maxCapacity = params.maxCapacity

      const response = await this.http.get(this.endpointUrl, { params: cleanParams })

      if (Array.isArray(response.data)) {
        return response.data.map(resource => this.assembler.toEntityFromResource(resource))
      }

      return this.assembler.toEntitiesFromResponse(response.data)
    } catch (error) {
      return this.handleError('Failed to fetch drones')(error)
    }
  }
  /**
   * Takes an AVAILABLE drone out of operation for maintenance (DR-005).
   * POST /drones/{id}/maintenance
   */
  async sendToMaintenance(id) {
    try {
      const response = await this.http.post(`${this.endpointUrl}/${id}/maintenance`)
      return this.assembler.toEntityFromResource(response.data)
    } catch (error) {
      return this.handleError('Failed to send drone to maintenance')(error)
    }
  }

  /**
   * Registers a finished maintenance or repair: saves it in the history and returns the drone to service.
   * POST /drones/{id}/maintenance/complete
   */
  async completeMaintenance(id, payload) {
    try {
      const response = await this.http.post(`${this.endpointUrl}/${id}/maintenance/complete`, payload)
      return this.assembler.toEntityFromResource(response.data)
    } catch (error) {
      return this.handleError('Failed to complete drone maintenance')(error)
    }
  }

  /**
   * Reports a mechanical failure (DR-006). The backend also records the FALLA_TECNICA incident.
   * POST /drones/{id}/failure
   */
  async reportFailure(id, payload) {
    try {
      const response = await this.http.post(`${this.endpointUrl}/${id}/failure`, payload)
      return this.assembler.toEntityFromResource(response.data)
    } catch (error) {
      return this.handleError('Failed to report drone failure')(error)
    }
  }

  /**
   * Maintenance history of a drone, most recent first.
   * GET /drones/{id}/maintenance-records
   */
  async getMaintenanceRecords(id) {
    try {
      const response = await this.http.get(`${this.endpointUrl}/${id}/maintenance-records`)
      return this.#maintenanceAssembler.toEntitiesFromResponse(response.data)
    } catch (error) {
      return this.handleError('Failed to fetch maintenance records')(error)
    }
  }
}
