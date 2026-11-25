import { BaseApiEndpoint } from '@/shared/infrastructure/base-api-endpoint.js'
import { ENDPOINTS, buildUrl } from '@/config/env.js'
import { ChemicalAssembler } from './chemical-assembler.js'

/**
 * REST endpoint client for agrochemical inventory.
 */
export class ChemicalApiEndpoint extends BaseApiEndpoint {
  /**
   * @param {import('axios').AxiosInstance} http
   */
  constructor(http) {
    super(http, buildUrl(ENDPOINTS.chemicals), new ChemicalAssembler())
  }


  /**
   * Adds liters to the stock of a chemical (business rule lives in the backend).
   * POST /chemicals/{id}/restock
   * @param {number|string} id
   * @param {number} liters
   * @returns {Promise<import('../domain/model/chemical.entity.js').Chemical>}
   */
  async restock(id, liters) {
    try {
      const response = await this.http.post(`${this.endpointUrl}/${id}/restock`, { liters }, {
        headers: { 'Content-Type': 'application/json' }
      })
      return this.assembler.toEntityFromResource(response.data)
    } catch (error) {
      return this.handleError('Failed to restock chemical')(error)
    }
  }


}
