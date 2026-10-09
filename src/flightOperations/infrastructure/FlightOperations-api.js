import { BaseApi } from '@/shared/infrastructure/base-api.js'
import { Drone } from '../domain/model/dron.entity.js';
import { Incident } from '../domain/model/incident.entity.js';
import { Mission } from '../domain/model/mission.entity.js';
import { OperationStatus } from '../domain/model/operationStatus.entity.js';
import { DronApiEndpoint } from './dron-api-endpoint.js';
import { IncidentApiEndpoint } from './incident-api-endpoint.js';
import { MissionApiEndpoint } from './mission-api-endpoint.js';
import { OperationStatusApiEndpoint } from './operationStatus-api-endpoint.js';

/**
 * Infrastructure facade for drone, incident, mission and operation status endpoint operations.
 * FlightOperationsApi class get http from base-api using super() of base-api
 */
export class FlightOperationsApi extends BaseApi {

    /** @type {DronApiEndpoint} */
    #droneEndpoint;

    /** @type {IncidentApiEndpoint} */
    #incidentEndpoint;

    /** @type {MissionApiEndpoint} */
    #missionEndpoint;

    /** @type {OperationStatusApiEndpoint} */
    #operationStatusEndpoint;

    constructor() {
        super();

        const http = this.http;

        this.#droneEndpoint = new DronApiEndpoint(http);
        this.#incidentEndpoint = new IncidentApiEndpoint(http);
        this.#missionEndpoint = new MissionApiEndpoint(http);
        this.#operationStatusEndpoint = new OperationStatusApiEndpoint(http);
    }

    // ---- Drones ----

    /** @returns {Promise<Drone[]>} */
    getAllDrones = () => this.#droneEndpoint.getAll();

    /**
     * @param {number|string} id
     * @returns {Promise<Drone>}
     */
    getDroneById = (id) => this.#droneEndpoint.getById(id);

    /**
     * @param {Drone} drone
     * @returns {Promise<Drone>}
     */
    createDrone = (drone) => this.#droneEndpoint.create(drone);

    /**
     * @param {Drone} drone
     * @returns {Promise<Drone>}
     */
    updateDrone = (drone)=> this.#droneEndpoint.update(drone,drone.id);

    /**
     * @param {number|string} id
     * @returns {Promise<void>}
     */
    deleteDrone = (id) => this.#droneEndpoint.delete(id);

    // ---- Incidents ----

    /** @returns {Promise<Incident[]>} */
    getAllIncidents = () => this.#incidentEndpoint.getAll();

    /**
     * @param {number|string} id
     * @returns {Promise<Incident>}
     */
    getIncidentById = (id) => this.#incidentEndpoint.getById(id);

    /**
     * @param {Incident} incident
     * @returns {Promise<Incident>}
     */
    createIncident = (incident) => this.#incidentEndpoint.create(incident);

    /**
     * @param {Incident} incident
     * @returns {Promise<Incident>}
     */
    updateIncident = (incident) => this.#incidentEndpoint.update(incident, incident.id);

    /**
     * @param {number|string} id
     * @returns {Promise<void>}
     */
    deleteIncident = (id) => this.#incidentEndpoint.delete(id);

    // ---- Missions ----

    /** @returns {Promise<Mission[]>} */
    getAllMissions = () => this.#missionEndpoint.getAll();

    /**
     * @param {number|string} id
     * @returns {Promise<Mission>}
     */
    getMissionById = (id) => this.#missionEndpoint.getById(id);

    /**
     * @param {Mission} mission
     * @returns {Promise<Mission>}
     */
    createMission = (mission) => this.#missionEndpoint.create(mission);

    /**
     * @param {Mission} mission
     * @returns {Promise<Mission>}
     */
    updateMission = (mission) => this.#missionEndpoint.update(mission, mission.id);

    /**
     * @param {number|string} id
     * @returns {Promise<void>}
     */
    deleteMission = (id) => this.#missionEndpoint.delete(id);

    // ---- Operation status ----

    /** @returns {Promise<OperationStatus[]>} */
    getAllOperationStatuses = () => this.#operationStatusEndpoint.getAll();

    /**
     * @param {number|string} id
     * @returns {Promise<OperationStatus>}
     */
    getOperationStatusById = (id) => this.#operationStatusEndpoint.getById(id);

    /**
     * @param {OperationStatus} status
     * @returns {Promise<OperationStatus>}
     */
    createOperationStatus = (status) => this.#operationStatusEndpoint.create(status);

    /**
     * @param {OperationStatus} status
     * @returns {Promise<OperationStatus>}
     */
    updateOperationStatus = (status) => this.#operationStatusEndpoint.update(status, status.id);

    /**
     * @param {number|string} id
     * @returns {Promise<void>}
     */
    deleteOperationStatus = (id) => this.#operationStatusEndpoint.delete(id);
}