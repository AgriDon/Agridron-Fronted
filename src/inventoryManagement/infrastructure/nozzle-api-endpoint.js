import { BaseApiEndpoint } from '@/shared/infrastructure/base-api-endpoint.js'
import { ENDPOINTS, buildUrl } from '@/config/env.js'
import { NozzleAssembler } from './nozzle-assembler.js'

/**
 * REST endpoint client for spray nozzle inventory.
 */
export class NozzleApiEndpoint extends BaseApiEndpoint {
  /**
   * @param {import('axios').AxiosInstance} http
   */
  constructor(http) {
    super(http, buildUrl(ENDPOINTS.nozzles), new NozzleAssembler())
  }


  /**
   * Switches the nozzle condition between good and worn (business rule lives in the backend).
   * POST /nozzles/{id}/toggle-status
   * @param {number|string} id
   * @returns {Promise<import('../domain/model/nozzle.entity.js').Nozzle>}
   */
  async toggleStatus(id) {
    try {
      const response = await this.http.post(`${this.endpointUrl}/${id}/toggle-status`)
      return this.assembler.toEntityFromResource(response.data)
    } catch (error) {
      return this.handleError('Failed to toggle nozzle status')(error)
    }
  }


}
