import {Drone} from "@/flightOperations/domain/model/dron.entity.js";
import { FlightOperationsApi } from '../infrastructure/FlightOperations-api.js';
import {DroneStatus} from "@/flightOperations/domain/model/dron-status.enum.ts.js";
import { Incident } from '@/flightOperations/domain/model/incident.entity.js'
import { IncidentType } from '@/flightOperations/domain/model/incident-type.enum.js'
import { IncidentSeverity } from '@/flightOperations/domain/model/incident-severity.enum.js'


/**
 * Raised when a drone payload does not pass validation.
 */
export class DroneValidationError extends Error {
    /** @param {Record<string, string>} errors - Field name -> i18n message key. */
    constructor(errors) {
        super('Drone validation failed');
        this.name = 'DroneValidationError';
        this.errors = errors;
    }
}

/**
 * Drone use cases: application layer between views and API.
 */
export class DroneUseCases {

    /** @type {FlightOperationsApi} */
    #api;

    /** @param {FlightOperationsApi} [api] */
    constructor(api = new FlightOperationsApi()) {
        this.#api = api;
    }

    /**
     * @param {{ serialNumber?: string, model?: string, capacity?: number|string, status?: string, urlimg?: string }} data
     * @returns {Record<string, string>} Field name -> i18n key. Empty when valid.
     */
    static validate(data) {
        const errors = {};

        if (!data.serialNumber?.trim()) {
            errors.serialNumber = 'drone.form.error.serial-number-required';
        }

        if (!data.model?.trim()) {
            errors.model = 'drone.form.error.model-required';
        }

        const capacity = Number(data.capacity);
        if (data.capacity === '' || data.capacity == null || Number.isNaN(capacity) || capacity <= 0) {
            errors.capacity = 'drone.form.error.capacity-invalid';
        }

        return errors;
    }

    /**
     * Transform information data from form to entity dron.
     * Status is default
     * urlimg would be optional. Check this point for the next deadline/ due date
     * @param {{ serialNumber: string, model: string, capacity: number|string, status?: string , urlimg?: string }} data
     * @param {number} id
     * @returns {Drone}
     */
    static toEntity(data, id) {
        return new Drone(
            id,
            data.serialNumber.trim(),
            data.model.trim(),
            Number(data.capacity),
            data.status ?? DroneStatus.AVAILABLE,
            data.urlimg
        );
    }

    /**
     * @returns {Promise<Drone[]>}
     */
    listDrones = () => this.#api.getAllDrones();

    /**
     * @param {number|string} id
     * @returns {Promise<Drone>}
     */
    getDrone = (id) => this.#api.getDroneById(id);

    /**
     * @param {{ serialNumber?: string, model?: string, capacity?: number|string, status?: string, urlimg?: string }} data
     * @returns {Promise<Drone>}
     * @throws {DroneValidationError}
     */
    createDrone = async (data) => {
        const errors = DroneUseCases.validate(data);

        if (Object.keys(errors).length > 0) {
            throw new DroneValidationError(errors);
        }

        return this.#api.createDrone(DroneUseCases.toEntity(data, 0));
    };

    /**
     * @param {number|string} id
     * @param {{ serialNumber?: string, model?: string, capacity?: number|string, status?: string , urlimg?: string}} data
     * @returns {Promise<Drone>}
     * @throws {DroneValidationError}
     */
    updateDrone = async (id, data) => {
        const errors = DroneUseCases.validate(data);

        if (Object.keys(errors).length > 0) {
            throw new DroneValidationError(errors);
        }

        return this.#api.updateDrone(DroneUseCases.toEntity(data, Number(id)));
    };

    /**
     * @param {number|string} id
     * @returns {Promise<void>}
     */
    deleteDrone = (id) => this.#api.deleteDrone(id);



    /**
     * Reports a mechanical failure saves it as an incident and sets the drone OUT_OF_SERVICE.
     * Not allowed while the drone is flying or when it is already out of service.
     *
     * @param {Drone} drone
     * @param {string} description - What is wrong with the drone.
     * @returns {Promise<Drone>}
     * @throws {Error} with an i18n key when the action is not allowed.
     */
    reportFailure = async (drone, description) => {
        if (!DroneUseCases.canReportFailure(drone)) {
            throw new Error('drone.failure.error.not-allowed')
        }
        if (!description?.trim()) {
            throw new Error('drone.failure.error.description-required')
        }

        await this.#api.createIncident(new Incident(
            null,
            IncidentType.EQUIPMENT_FAILURE,
            description.trim(),
            new Date().toISOString(),
            null,
            drone.id,
            IncidentSeverity.HIGH
        ))

        const updated = Object.assign(Object.create(Object.getPrototypeOf(drone)), drone, {
            status: DroneStatus.OUT_OF_SERVICE
        })

        return this.#api.updateDrone(updated)
    }

    /**
     * A failure can be reported unless the drone is flying or already out of service.
     * @param {Drone|null} drone
     * @returns {boolean}
     */
    static canReportFailure(drone) {
        return [
            DroneStatus.AVAILABLE,
            DroneStatus.ASSIGNED,
            DroneStatus.PAUSED,
            DroneStatus.MAINTENANCE
        ].includes(drone?.status)
    }


}