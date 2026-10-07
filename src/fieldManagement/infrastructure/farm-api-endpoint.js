import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint.js';
import { ENDPOINTS, buildUrl } from '../../config/env.js';
import { Farm } from '../domain/model/farm.entity.js';
import { FarmAssembler } from './farm-assembler.js';

/**
 * Endpoint client for farm CRUD operations.
 *
 * @extends {BaseApiEndpoint<Farm, import('./field-management-response.js').FarmResource, import('./field-management-response.js').FarmResponse, FarmAssembler>}
 */
export class FarmApiEndpoint extends BaseApiEndpoint {

    /**
     * @param {import('axios').AxiosInstance} http - The Axios client used for API requests.
     */
    constructor(http) {
        super(http, buildUrl(ENDPOINTS.farms), new FarmAssembler());
    }
}