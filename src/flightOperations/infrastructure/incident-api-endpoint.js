import { BaseApiEndpoint } from '@/shared/infrastructure/base-api-endpoint.js'
import { ENDPOINTS, buildUrl } from '@/config/env.js'
import { IncidentAssembler } from './incident-assembler.js'

/**
 * API endpoint client for flight incidents.
 */
export class IncidentApiEndpoint extends BaseApiEndpoint {
  /**
   * @param {import('axios').AxiosInstance} http - Axios instance
   */
  constructor(http) {
    super(http, buildUrl(ENDPOINTS.incidents), new IncidentAssembler())
  }
}