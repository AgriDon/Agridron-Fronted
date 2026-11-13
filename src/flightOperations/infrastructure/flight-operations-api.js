import { BaseApi } from '@/shared/infrastructure/base-api.js'
import { DronApiEndpoint } from './dron-api-endpoint.js'
import { IncidentApiEndpoint } from './incident-api-endpoint.js'
import { MissionApiEndpoint } from './mission-api-endpoint.js'
import { OperationStatusApiEndpoint } from './operation-status-api-endpoint.js'
import { MaintenanceRecordApiEndpoint } from './maintenance-record-api-endpoint.js'
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

  /** @Type {MaintenanceRecordApiEndpoint}*/
  #maintenanceEndpoint

  constructor() {
    super()
    this.#droneEndpoint = new DronApiEndpoint(this.http)
    this.#incidentEndpoint = new IncidentApiEndpoint(this.http)
    this.#missionEndpoint = new MissionApiEndpoint(this.http)
    this.#operationStatusEndpoint = new OperationStatusApiEndpoint(this.http)
    this.#maintenanceEndpoint = new MaintenanceRecordApiEndpoint(this.http)
  }

  // ---- Drones ----
  getAllDrones = (params) => this.#droneEndpoint.getAll(params)
  getDroneById = (id) => this.#droneEndpoint.getById(id)
  createDrone = (drone) => this.#droneEndpoint.create(drone)
  updateDrone = (drone) => this.#droneEndpoint.update(drone, drone.id)
  deleteDrone = (id) => this.#droneEndpoint.delete(id)

  // ---- Maintenance ----
  getMaintenanceRecordsByDroneId = (droneId) => this.#maintenanceEndpoint.getAllByDroneId(droneId)
  createMaintenanceRecord = (record) => this.#maintenanceEndpoint.create(record)

  // ---- Incidents ----
  getAllIncidents = (params) => this.#incidentEndpoint.getAll(params)
  getIncidentById = (id) => this.#incidentEndpoint.getById(id)
  createIncident = (incident) => this.#incidentEndpoint.create(incident)
  updateIncident = (incident) => this.#incidentEndpoint.update(incident, incident.id)
  deleteIncident = (id) => this.#incidentEndpoint.delete(id)

  // ---- Missions ----
  getAllMissions = (params) => this.#missionEndpoint.getAll(params)
  getMissionById = (id) => this.#missionEndpoint.getById(id)
  createMission = (mission) => this.#missionEndpoint.create(mission)
  updateMission = (mission) => this.#missionEndpoint.update(mission, mission.id)
  deleteMission = (id) => this.#missionEndpoint.delete(id)

  // ---- Mission Lifecycle & Config ----
  assignMissionResources = (id, payload) => this.#missionEndpoint.assignResources(id, payload)
  assignMissionOperator = (id, payload) => this.#missionEndpoint.assignOperator(id, payload)
  configureMissionFlightParameters = (id, payload) => this.#missionEndpoint.configureFlightParameters(id, payload)
  approveMission = (id) => this.#missionEndpoint.approve(id)
  startMission = (id, startedAt) => this.#missionEndpoint.start(id, startedAt)
  pauseMission = (id, payload) => this.#missionEndpoint.pause(id, payload)
  resumeMission = (id) => this.#missionEndpoint.resume(id)
  completeMission = (id, payload) => this.#missionEndpoint.complete(id, payload)
  cancelMission = (id, reason) => this.#missionEndpoint.cancel(id, reason)

  // ---- Operation Status Telemetry ----
  getAllOperationStatuses = (params) => this.#operationStatusEndpoint.getAll(params)
  getOperationStatusById = (id) => this.#operationStatusEndpoint.getById(id)
  createOperationStatus = (status) => this.#operationStatusEndpoint.create(status)
  updateOperationStatus = (status) => this.#operationStatusEndpoint.update(status, status.id)
  deleteOperationStatus = (id) => this.#operationStatusEndpoint.delete(id)
}
