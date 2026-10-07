import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint.js';
import { ENDPOINTS, buildUrl } from '../../config/env.js';
import { Crop } from '../domain/model/crop.entity.js';
import { CropAssembler } from './crop-assembler.js';

/**
 * Endpoint client for crop CRUD operations.
 *
 * @extends {BaseApiEndpoint<Crop, import('./field-management-response.js').CropResource, import('./field-management-response.js').CropResponse, CropAssembler>}
 */
export class CropApiEndpoint extends BaseApiEndpoint {

    /**
     * @param {import('axios').AxiosInstance} http - The Axios client used for API requests.
     */
    constructor(http) {
        super(http, buildUrl(ENDPOINTS.crops), new CropAssembler());
    }
}