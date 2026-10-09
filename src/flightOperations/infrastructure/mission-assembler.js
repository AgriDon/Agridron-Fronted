import { markRaw } from 'vue';
import { Mission } from '@/flightOperations/domain/model/mission.entity.js';
import{IncidentAssembler} from "@/flightOperations/infrastructure/incidentAssembler.js";
import {OperationStatusAssembler} from "@/flightOperations/infrastructure/operationStatusAssembler.js";


export class MissionAssembler {
    /** @type {IncidentAssembler} */
    #incidentAssembler;
    /** @type {OperationStatusAssembler} */
    #operationStatusAssembler;

    constructor() {
        this.#incidentAssembler = new IncidentAssembler();
        this.#operationStatusAssembler = new OperationStatusAssembler();
    }

    /**
     * @param {import('./mission-response.js').MissionResponse} response
     * @returns {Mission[]}
     */
    toEntitiesFromResponse = (response) => {
        const resources = response?.missions || response || [];
        return resources.map(resource => this.toEntityFromResource(resource));
    };

    /**
     * @param {import('./mission-response.js').MissionResource} resource
     * @returns {Mission}
     */
    toEntityFromResource = (resource) => {
        const incidents = (resource.incidents || []).map(inc =>
            this.#incidentAssembler.toEntityFromResource(inc)
        );

        const operationStatuses = (resource.operationStatus || []).map(op =>
            this.#operationStatusAssembler.toEntityFromResource(op)
        );

        return markRaw(
            new Mission(
                resource.id,
                resource.code,
                resource.scheduledDate,
                resource.plannedArea,
                resource.treatedArea,
                resource.droneAssigned ?? null,
                incidents,
                operationStatuses
            )
        );
    };

    /**
     * @param {Mission} entity
     * @returns {import('./mission-response.js').MissionResource}
     */
    toResourceFromEntity = (entity) => ({
        id: entity.id,
        code: entity.code,
        scheduledDate: entity.scheduledDate,
        plannedArea: entity.plannedArea,
        treatedArea: entity.treatedArea,
        missionStatus: entity.missionStatus,
        droneAssigned: entity.dronAssigned,
        incidents: (entity.incidents || []).map(inc =>
            this.#incidentAssembler.toResourceFromEntity(inc)
        ),
        operationStatus: (entity.operationStatus || []).map(op =>
            this.#operationStatusAssembler.toResourceFromEntity(op)
        )
    });
}