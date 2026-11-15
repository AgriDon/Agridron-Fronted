import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint.js';
import { ENDPOINTS, buildUrl } from '../../config/env.js';
import { Parcel } from '../domain/model/parcel.entity.js';
import { ParcelAssembler } from './parcel-assembler.js';

/**
 * Endpoint client for parcel CRUD operations.
 *
 * @extends {BaseApiEndpoint<Parcel, import('./field-management-response.js').ParcelResource, import('./field-management-response.js').ParcelResponse, ParcelAssembler>}
 */
export class ParcelApiEndpoint extends BaseApiEndpoint {

    /**
     * @param {import('axios').AxiosInstance} http - The Axios client used for API requests.
     */
    constructor(http) {
        super(http, buildUrl(ENDPOINTS.parcels), new ParcelAssembler());
    }
}