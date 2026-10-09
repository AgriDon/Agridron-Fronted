import { BaseApiEndpoint } from '@/shared/infrastructure/base-api-endpoint.js'
import { ENDPOINTS, buildUrl } from '@/config/env.js'
import { MissionAssembler } from './mission-assembler.js'

/**
 * Endpoint client for mission CRUD operations.
 */
export class MissionApiEndpoint extends BaseApiEndpoint {
  /**
   * @param {import('axios').AxiosInstance} http - Axios instance
   */
  constructor(http) {
    super(http, buildUrl(ENDPOINTS.missions), new MissionAssembler())
  }
}
