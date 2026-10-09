import { markRaw } from 'vue';
import { Drone } from "@/flightOperations/domain/model/dron.entity.js";
import { DroneStatus } from "@/flightOperations/domain/model/dron-status.enum.ts.js";

export class DronAssembler  {


    /**
     * Converts the backend response into a list of Drone entities.
     * @param  {import('./FlightOperations-response.js').DronResponse} response
     * @returns {(Drone & {[RawSymbol]?: true})[]}
     */
    toEntitiesFromResponse = (response) => {
        const list = Array.isArray(response) ? response : (response?.drones || []);
        return list.map(resource => this.toEntityFromResource(resource));
    };


    /**
     * Converts one backend drone (JSON) into a Drone entity.
     * @param {import('./FlightOperations-response.js').DronResource} resource
     * @returns {Drone}
     */
    toEntityFromResource = (resource) => {
        let status = resource.status || DroneStatus.AVAILABLE;
        if (typeof status === 'string') status = status.toUpperCase();
        if (status === 'MAINTENANCE_SOON') status = DroneStatus.MAINTENANCE;
        if (!Object.values(DroneStatus).includes(status)) status = DroneStatus.AVAILABLE;

        return markRaw(
            new Drone(
                resource.id,
                resource.serialNumber ?? '',
                resource.model ?? '',
                Number(resource.capacity) || 0,
                status,
                resource.urlimg || resource.image || ''
            )
        );
    };


    /**
     * Converts a Drone entity into the JSON object sent to the backend.
     * @param {Drone} entity
     * @returns {import('./FlightOperations-response.js').DronResource}
     */
    toResourceFromEntity = (entity) =>
        ({
            id:entity.id,
            serialNumber:entity.serialNumber,
            model:entity.modelName,
            capacity:entity.capacity,
            status:entity.status,
            urlimg:entity.urlimg,
        });
}