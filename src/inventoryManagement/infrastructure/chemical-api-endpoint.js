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
}
