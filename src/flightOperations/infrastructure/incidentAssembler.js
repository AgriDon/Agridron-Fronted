import { markRaw } from 'vue';
import { Incident } from '@/flightOperations/domain/model/incident.entity.js';

export class IncidentAssembler {

    /**
     * Converts the backend response into a list of Incident entities.
     * @param {import('./FlightOperations-response.js').IncidentResponse} response
     * @returns {Incident[]}
     */
    toEntitiesFromResponse = (response) =>
        response.incidents.map(resource => this.toEntityFromResource(resource));

    /**
     * Converts one backend incident (JSON) into an Incident entity.
     * @param {import('./FlightOperations-response.js').IncidentResource} resource
     * @returns {Incident}
     */
    toEntityFromResource = (resource) =>
        // markRaw: entities use private fields (#id). Vue wraps objects in a
        // Proxy inside ref()/reactive(), and reading a private field through
        // a Proxy throws. markRaw keeps the instance out of reactivity.
        markRaw(
            new Incident(
                resource.id,
                resource.type,
                resource.description,
                resource.occurredAt,
                resource.missionId
            )
        );

    /**
     * Converts an Incident entity into the JSON object sent to the backend.
     * @param {Incident} entity
     * @returns {import('./FlightOperations-response.js').IncidentResource}
     */
    toResourceFromEntity = (entity) => (
        {
            id: entity.id,
            type: entity.type,
            description: entity.description,
            occurredAt: entity.occurredAt,
            missionId: entity.missionId,
        }
        );
}