import { BaseApiEndpoint } from '@/shared/infrastructure/base-api-endpoint.js'
import { ENDPOINTS, buildUrl } from '@/config/env.js'
import { OperationStatusAssembler } from './operation-status-assembler.js'

/**
 * Endpoint client for operation status telemetry points.
 */
export class OperationStatusApiEndpoint extends BaseApiEndpoint {
  /**
   * @param {import('axios').AxiosInstance} http - Axios instance
   */
  constructor(http) {
    super(http, buildUrl(ENDPOINTS.operationStatus), new OperationStatusAssembler())
  }

  /**
   * Fetches operation status telemetry points with optional filters.
   * @param {{ missionId?: number, droneId?: number, status?: string }} [params]
   * @returns {Promise<import('../domain/model/operation-status.entity.js').OperationStatus[]>}
   */
  async getAll(params = {}) {
    try {
      const response = await this.http.get(this.endpointUrl, { params })
      if (Array.isArray(response.data)) {
        return response.data.map(resource => this.assembler.toEntityFromResource(resource))
      }
      return this.assembler.toEntitiesFromResponse(response.data)
    } catch (error) {
      return this.handleError('Failed to fetch operations')(error)
    }
  }
}
