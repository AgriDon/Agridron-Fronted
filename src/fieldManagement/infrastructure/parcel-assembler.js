import { markRaw } from 'vue';

import { Parcel } from '../domain/model/parcel.entity.js';

/**
 * Assembler for the parcel resource.
 *
 * @implements {import('../../shared/infrastructure/base-assembler.js').BaseAssembler<Parcel, import('./field-management-response.js').ParcelResource, import('./field-management-response.js').ParcelResponse>}
 */
export class ParcelAssembler {

    /**
     * @param {import('./field-management-response.js').ParcelResponse} response
     * @returns {Parcel[]}
     */
    toEntitiesFromResponse = (response) =>
        response.parcels.map(resource => this.toEntityFromResource(resource));

    /**
     * @param {import('./field-management-response.js').ParcelResource} resource
     * @returns {Parcel}
     */
    toEntityFromResource = (resource) =>
        // markRaw: see farm-assembler.js for why entities must stay out of
        // Vue's reactivity system.
        markRaw(new Parcel(resource.id, resource.name, resource.area, resource.geometry, resource.farmId, resource.cropId, resource.image ?? null));

    /**
     * @param {Parcel} entity
     * @returns {import('./field-management-response.js').ParcelResource}
     */
    toResourceFromEntity = (entity) =>
        ({ id: entity.id, name: entity.name, area: entity.area, geometry: entity.geometry, farmId: entity.farmId, cropId: entity.cropId, image: entity.image ?? undefined });
}