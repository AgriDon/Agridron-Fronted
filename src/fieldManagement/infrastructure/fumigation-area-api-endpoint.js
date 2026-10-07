import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint.js';
import { ENDPOINTS, buildUrl } from '../../config/env.js';
import { FumigationArea } from '../domain/model/fumigationArea.entity.js';
import { FumigationAreaAssembler } from './fumigation-area-assembler.js';

/**
 * Endpoint client for fumigation area CRUD operations.
 *
 * @extends {BaseApiEndpoint<FumigationArea, import('./field-management-response.js').FumigationAreaResource, import('./field-management-response.js').FumigationAreaResponse, FumigationAreaAssembler>}
 */
export class FumigationAreaApiEndpoint extends BaseApiEndpoint {

    /**
     * @param {import('axios').AxiosInstance} http - The Axios client used for API requests.
     */
    constructor(http) {
        super(http, buildUrl(ENDPOINTS.fumigationAreas), new FumigationAreaAssembler());
    }
}