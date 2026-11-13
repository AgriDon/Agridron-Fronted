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
}
