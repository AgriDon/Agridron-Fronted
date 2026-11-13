import { BaseApiEndpoint } from '@/shared/infrastructure/base-api-endpoint.js'
import { ENDPOINTS, buildUrl } from '@/config/env.js'
import { DronAssembler } from './dron-assembler.js'

/**
 * API endpoint client for drone CRUD operations.
 */
export class DronApiEndpoint extends BaseApiEndpoint {
  /**
   * @param {import('axios').AxiosInstance} http - Axios instance
   */
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
}
