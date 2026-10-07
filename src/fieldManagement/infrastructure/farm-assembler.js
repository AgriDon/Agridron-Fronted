import { markRaw } from 'vue';

import { Farm } from '../domain/model/farm.entity.js';

/**
 * Assembler for the farm resource.
 *
 * @implements {import('../../shared/infrastructure/base-assembler.js').BaseAssembler<Farm, import('./field-management-response.js').FarmResource, import('./field-management-response.js').FarmResponse>}
 */
export class FarmAssembler {

    /**
     * @param {import('./field-management-response.js').FarmResponse} response
     * @returns {Farm[]}
     */
    toEntitiesFromResponse = (response) =>
        response.farms.map(resource => this.toEntityFromResource(resource));

    /**
     * @param {import('./field-management-response.js').FarmResource} resource
     * @returns {Farm}
     */
    toEntityFromResource = (resource) =>
        // markRaw: domain entities expose getters backed by private fields (#id).
        // Vue wraps objects placed in ref()/reactive() in a Proxy, and reading a
        // private field through a Proxy throws "object is not the right class".
        // Marking the instance as raw keeps it out of the reactivity system.
        markRaw(new Farm(resource.id, resource.name, resource.location, resource.ownerId, [], resource.image ?? null));

    /**
     * @param {Farm} entity
     * @returns {import('./field-management-response.js').FarmResource}
     */
    toResourceFromEntity = (entity) =>
        ({ id: entity.id, name: entity.name, location: entity.location, ownerId: entity.ownerId, image: entity.image ?? undefined });
}