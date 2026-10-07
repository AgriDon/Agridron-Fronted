import { markRaw } from 'vue';

import { Crop } from '../domain/model/crop.entity.js';

/**
 * Assembler for the crop resource.
 *
 * @implements {import('../../shared/infrastructure/base-assembler.js').BaseAssembler<Crop, import('./field-management-response.js').CropResource, import('./field-management-response.js').CropResponse>}
 */
export class CropAssembler {

    /**
     * @param {import('./field-management-response.js').CropResponse} response
     * @returns {Crop[]}
     */
    toEntitiesFromResponse = (response) =>
        response.crops.map(resource => this.toEntityFromResource(resource));

    /**
     * @param {import('./field-management-response.js').CropResource} resource
     * @returns {Crop}
     */
    toEntityFromResource = (resource) =>
        // markRaw: see farm-assembler.js for why entities must stay out of
        // Vue's reactivity system.
        markRaw(new Crop(resource.id, resource.name, resource.variety));

    /**
     * @param {Crop} entity
     * @returns {import('./field-management-response.js').CropResource}
     */
    toResourceFromEntity = (entity) =>
        ({ id: entity.id, name: entity.name ?? '', variety: entity.variety ?? '' });
}