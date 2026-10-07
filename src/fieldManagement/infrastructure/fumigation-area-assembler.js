import { markRaw } from 'vue';

import { FumigationArea } from '../domain/model/fumigationArea.entity.js';

/**
 * Assembler for the fumigation area resource.
 *
 * @implements {import('../../shared/infrastructure/base-assembler.js').BaseAssembler<FumigationArea, import('./field-management-response.js').FumigationAreaResource, import('./field-management-response.js').FumigationAreaResponse>}
 */
export class FumigationAreaAssembler {

    /**
     * @param {import('./field-management-response.js').FumigationAreaResponse} response
     * @returns {FumigationArea[]}
     */
    toEntitiesFromResponse = (response) =>
        response.fumigationAreas.map(resource => this.toEntityFromResource(resource));

    /**
     * @param {import('./field-management-response.js').FumigationAreaResource} resource
     * @returns {FumigationArea}
     */
    toEntityFromResource = (resource) =>
        // markRaw: see farm-assembler.js for why entities must stay out of
        // Vue's reactivity system.
        markRaw(new FumigationArea(resource.id, resource.parcelId, resource.geometry, resource.area));

    /**
     * @param {FumigationArea} entity
     * @returns {import('./field-management-response.js').FumigationAreaResource}
     */
    toResourceFromEntity = (entity) =>
        ({ id: entity.id, parcelId: entity.parcelId, geometry: entity.geometry, area: entity.area });
}