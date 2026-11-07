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
    toEntitiesFromResponse = (response) => {
        const list = Array.isArray(response) ? response : (response?.parcels ?? []);
        return list.map(resource => this.toEntityFromResource(resource));
    };

    /**
     * @param {import('./field-management-response.js').ParcelResource} resource
     * @returns {Parcel}
     */
    toEntityFromResource = (resource) =>
        markRaw(new Parcel(
            resource.id,
            resource.name,
            Number(resource.area ?? resource.areaHectares) || 0,
            resource.geometry,
            resource.farmId,
            resource.cropId,
            resource.image ?? resource.imageUrl ?? null,
            null,
            resource.phenologicalStage ?? null,
            resource.isActive ?? true
        ));

    /**
     * @param {Parcel} entity
     * @returns {import('./field-management-response.js').ParcelResource}
     */
    toResourceFromEntity = (entity) => ({
        id: entity.id,
        name: entity.name,
        area: entity.area,
        areaHectares: entity.area,
        geometry: entity.geometry,
        farmId: entity.farmId,
        cropId: entity.cropId,
        image: entity.image ?? undefined,
        imageUrl: entity.image ?? undefined,
        phenologicalStage: entity.phenologicalStage ?? undefined
    });
}
