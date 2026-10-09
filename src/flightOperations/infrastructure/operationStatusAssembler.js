import { markRaw } from 'vue';
import {OperationStatus} from "@/flightOperations/domain/model/operationStatus.entity.js";

export class OperationStatusAssembler {

    /**
     * Converts the backend response into a list of OperationStatus entities.
     * @param {import('./operation-status-response.js').OperationStatusResponse} response
     * @returns {OperationStatus[]}
     */
    toEntitiesFromResponse = (response) => {
        const resources = response?.operationStatuses || response || [];
        return resources.map(resource => this.toEntityFromResource(resource));
    };

    /**
     * Converts one backend operation status (JSON) into an OperationStatus entity.
     * @param {import('./operation-status-response.js').OperationStatusResource} resource
     * @returns {OperationStatus}
     */
    toEntityFromResource = (resource) =>
        // markRaw: keeps entity instances out of Vue's reactivity Proxy to avoid issues with private fields
        markRaw(
            new OperationStatus(
                resource.latitude,
                resource.longitude,
                resource.status,
                resource.timestamp,
                resource.missionId
            )
        );

    /**
     * Converts an OperationStatus entity into the JSON object sent to the backend.
     * @param {OperationStatus} entity
     * @returns {import('./operation-status-response.js').OperationStatusResource}
     */
    toResourceFromEntity = (entity) => ({
        latitude: entity.latitude,
        longitude: entity.longitude,
        status: entity.status,
        timestamp: entity.timestamp,
        missionId:entity.missionId
    });
}