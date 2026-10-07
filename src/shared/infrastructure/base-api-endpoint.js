import { ErrorHandlingEnabledBaseType } from './error-handling-enabled-base-type.js';

/**
 * Provides generic CRUD operations for a single REST endpoint.
 *
 * @template {BaseEntity} TEntity Domain entity handled by the endpoint.
 * @template {BaseResource} TResource Resource representation exchanged with the API.
 * @template {BaseResponse} TResponse Response envelope returned for collection queries.
 * @template {BaseAssembler<TEntity, TResource, TResponse>} TAssembler Mapper that translates between entities and resources.
 *
 * @extends {ErrorHandlingEnabledBaseType}
 */
export class BaseApiEndpoint extends ErrorHandlingEnabledBaseType {

    /**
     * @param {import('axios').AxiosInstance} http - The Axios client used for API requests.
     * @param {string} endpointUrl - Full URL of the resource collection.
     * @param {TAssembler} assembler - Mapper between entities and resources.
     */
    constructor(http, endpointUrl, assembler) {
        super();
        this.http = http;
        this.endpointUrl = endpointUrl;
        this.assembler = assembler;
    }

    /**
     * Fetches all entities from the configured endpoint.
     *
     * Accepts both a bare collection (what json-server returns) and a
     * response envelope keyed by the resource name.
     *
     * @returns {Promise<TEntity[]>} The mapped entity collection.
     */
    async getAll() {
        try {
            const response = await this.http.get(this.endpointUrl);

            if (Array.isArray(response.data)) {
                return response.data.map(resource => this.assembler.toEntityFromResource(resource));
            }

            return this.assembler.toEntitiesFromResponse(response.data);
        } catch (error) {
            return this.handleError('Failed to fetch entities')(error);
        }
    }

    /**
     * Fetches a single entity by identifier.
     *
     * @param {number|string} id - Entity identifier.
     * @returns {Promise<TEntity>} The mapped entity.
     */
    async getById(id) {
        try {
            const response = await this.http.get(`${this.endpointUrl}/${id}`);
            return this.assembler.toEntityFromResource(response.data);
        } catch (error) {
            return this.handleError('Failed to fetch entity')(error);
        }
    }

    /**
     * Creates a new entity in the remote endpoint.
     *
     * @param {TEntity} entity - Entity to persist.
     * @returns {Promise<TEntity>} The created entity returned by the API.
     */
    async create(entity) {
        try {
            const resource = this.assembler.toResourceFromEntity(entity);
            const response = await this.http.post(this.endpointUrl, resource, {
                headers: { 'Content-Type': 'application/json' },
            });
            return this.assembler.toEntityFromResource(response.data);
        } catch (error) {
            return this.handleError('Failed to create entity')(error);
        }
    }

    /**
     * Updates an existing entity.
     *
     * @param {TEntity} entity - Entity state to persist.
     * @param {number|string} id - Identifier of the target entity.
     * @returns {Promise<TEntity>} The updated entity returned by the API.
     */
    async update(entity, id) {
        try {
            const resource = this.assembler.toResourceFromEntity(entity);
            const response = await this.http.put(`${this.endpointUrl}/${id}`, resource, {
                headers: { 'Content-Type': 'application/json' },
            });
            return this.assembler.toEntityFromResource(response.data);
        } catch (error) {
            return this.handleError('Failed to update entity')(error);
        }
    }

    /**
     * Deletes an entity by identifier.
     *
     * @param {number|string} id - Identifier of the entity to remove.
     * @returns {Promise<void>} Resolves when the deletion succeeds.
     */
    async delete(id) {
        try {
            await this.http.delete(`${this.endpointUrl}/${id}`);
        } catch (error) {
            return this.handleError('Failed to delete entity')(error);
        }
    }
}