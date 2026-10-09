import { markRaw } from 'vue';
import {Drone} from "@/flightOperations/domain/model/dron.entity.js";

export class DronAssembler  {


    /**
     * Converts the backend response into a list of Drone entities.
     * @param  {import('./FlightOperations-response.js').DronResponse} response
     * @returns {(Drone & {[RawSymbol]?: true})[]}
     */
    toEntitiesFromResponse = (response) =>
        response.drones.map(resource => this.toEntityFromResource(resource));


    /**
     * Converts one backend drone (JSON) into a Drone entity.
     * @param {import('./FlightOperations-response.js').DronResource} resource
     * @returns {Drone}
     */

    toEntityFromResource = (resource) =>
        // markRaw: domain entities expose getters backed by private fields (#id).
        // Vue wraps objects placed in ref()/reactive() in a Proxy, and reading a
        // private field through a Proxy throws "object is not the right class".
        // Marking the instance as raw keeps it out of the reactivity system.
        markRaw (
            new Drone(
                resource.id,
                resource.serialNumber,
                resource.model,
                resource.capacity,
                resource.status,
                resource.urlimg
            )
        );


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