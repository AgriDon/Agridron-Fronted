import { BaseApiEndpoint } from '@/shared/infrastructure/base-api-endpoint.js'
import { ENDPOINTS, buildUrl } from '@/config/env.js'
import { OperationStatusAssembler } from './operation-status-assembler.js'

/**
 * API endpoint client for drone operation status telemetry.
 */
export class OperationStatusApiEndpoint extends BaseApiEndpoint {
  /**
   * @param {import('axios').AxiosInstance} http - Axios instance
   */
  constructor(http) {
    super(http, buildUrl(ENDPOINTS.operationStatus), new OperationStatusAssembler())
  }
}
