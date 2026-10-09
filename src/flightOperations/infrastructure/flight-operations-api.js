import { BaseApi } from '@/shared/infrastructure/base-api.js'
import { DronApiEndpoint } from './dron-api-endpoint.js'
import { IncidentApiEndpoint } from './incident-api-endpoint.js'
import { MissionApiEndpoint } from './mission-api-endpoint.js'
import { OperationStatusApiEndpoint } from './operation-status-api-endpoint.js'

/**
 * Infrastructure facade for flight operations, drones, incidents and missions endpoints.
 */
export class FlightOperationsApi extends BaseApi {
  /** @type {DronApiEndpoint} */
  #droneEndpoint

  /** @type {IncidentApiEndpoint} */
  #incidentEndpoint

  /** @type {MissionApiEndpoint} */
  #missionEndpoint

  /** @type {OperationStatusApiEndpoint} */
  #operationStatusEndpoint

  constructor() {
    super()
    this.#droneEndpoint = new DronApiEndpoint(this.http)
    this.#incidentEndpoint = new IncidentApiEndpoint(this.http)
    this.#missionEndpoint = new MissionApiEndpoint(this.http)
    this.#operationStatusEndpoint = new OperationStatusApiEndpoint(this.http)
  }

  // ---- Drones ----
  getAllDrones = () => this.#droneEndpoint.getAll()
  getDroneById = (id) => this.#droneEndpoint.getById(id)
  createDrone = (drone) => this.#droneEndpoint.create(drone)
  updateDrone = (drone) => this.#droneEndpoint.update(drone, drone.id)
  deleteDrone = (id) => this.#droneEndpoint.delete(id)

  // ---- Incidents ----
  getAllIncidents = () => this.#incidentEndpoint.getAll()
  getIncidentById = (id) => this.#incidentEndpoint.getById(id)
  createIncident = (incident) => this.#incidentEndpoint.create(incident)
  updateIncident = (incident) => this.#incidentEndpoint.update(incident, incident.id)
  deleteIncident = (id) => this.#incidentEndpoint.delete(id)

  // ---- Missions ----
  getAllMissions = () => this.#missionEndpoint.getAll()
  getMissionById = (id) => this.#missionEndpoint.getById(id)
  createMission = (mission) => this.#missionEndpoint.create(mission)
  updateMission = (mission) => this.#missionEndpoint.update(mission, mission.id)
  deleteMission = (id) => this.#missionEndpoint.delete(id)

  // ---- Operation Status ----
  getAllOperationStatuses = () => this.#operationStatusEndpoint.getAll()
  getOperationStatusById = (id) => this.#operationStatusEndpoint.getById(id)
  createOperationStatus = (status) => this.#operationStatusEndpoint.create(status)
  updateOperationStatus = (status) => this.#operationStatusEndpoint.update(status, status.id)
  deleteOperationStatus = (id) => this.#operationStatusEndpoint.delete(id)
}
