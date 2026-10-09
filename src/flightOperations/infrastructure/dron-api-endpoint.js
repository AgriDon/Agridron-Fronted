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
}
