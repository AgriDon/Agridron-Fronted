import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint.js';
import { ENDPOINTS, buildUrl } from '../../config/env.js';
import { Parcel } from '../domain/model/parcel.entity.js';
import { ParcelAssembler } from './parcel-assembler.js';

/**
 * Endpoint client for parcel CRUD and lifecycle operations.
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

    /**
     * Fetches parcels, optionally including inactive records or filtering by farm.
     *
     * @param {{ includeInactive?: boolean, farmId?: number | string }} [options]
     * @returns {Promise<Parcel[]>}
     */
    async getAll(options = {}) {
        try {
            const params = {};
            if (options?.includeInactive) {
                params.includeInactive = true;
            }
            if (options?.farmId != null) {
                params.farmId = options.farmId;
            }

            const config = Object.keys(params).length > 0 ? { params } : undefined;
            const response = await this.http.get(this.endpointUrl, config);

            if (Array.isArray(response.data)) {
                return response.data.map(resource => this.assembler.toEntityFromResource(resource));
            }

            return this.assembler.toEntitiesFromResponse(response.data);
        } catch (error) {
            return this.handleError('Failed to fetch entities')(error);
        }
    }

    /**
     * Fetches a single parcel by identifier, optionally including inactive parcels.
     *
     * @param {number | string} id
     * @param {{ includeInactive?: boolean }} [options]
     * @returns {Promise<Parcel>}
     */
    async getById(id, options = {}) {
        try {
            const config = options?.includeInactive
                ? { params: { includeInactive: true } }
                : undefined;
            const response = await this.http.get(`${this.endpointUrl}/${id}`, config);
            return this.assembler.toEntityFromResource(response.data);
        } catch (error) {
            return this.handleError('Failed to fetch entity')(error);
        }
    }

    /**
     * Reactivates an inactive parcel.
     *
     * @param {number | string} id
     * @returns {Promise<Parcel>}
     */
    async activate(id) {
        try {
            const response = await this.http.post(`${this.endpointUrl}/${id}/activate`);
            return this.assembler.toEntityFromResource(response.data);
        } catch (error) {
            return this.handleError('Failed to activate parcel')(error);
        }
    }
}
