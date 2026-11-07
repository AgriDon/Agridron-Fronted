import { BaseApiEndpoint } from '@/shared/infrastructure/base-api-endpoint.js'
import { ENDPOINTS, buildUrl } from '@/config/env.js'
import { IncidentAssembler } from './incident-assembler.js'

/**
 * Endpoint client for incident and telemetry anomaly records.
 */
export class IncidentApiEndpoint extends BaseApiEndpoint {
  /**
   * @param {import('axios').AxiosInstance} http - Axios instance
   */
  constructor(http) {
    super(http, buildUrl(ENDPOINTS.incidents), new IncidentAssembler())
  }

  /**
   * Fetches incidents with optional mission, drone or severity filters.
   * @param {{ missionId?: number, droneId?: number, severity?: string, type?: string }} [params]
   * @returns {Promise<import('../domain/model/incident.entity.js').Incident[]>}
   */
  async getAll(params = {}) {
    try {
      const response = await this.http.get(this.endpointUrl, { params })
      if (Array.isArray(response.data)) {
        return response.data.map(resource => this.assembler.toEntityFromResource(resource))
      }
      return this.assembler.toEntitiesFromResponse(response.data)
    } catch (error) {
      return this.handleError('Failed to fetch incidents')(error)
    }
  }
}
