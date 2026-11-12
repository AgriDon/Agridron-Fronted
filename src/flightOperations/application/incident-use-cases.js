import { FlightOperationsApi } from '../infrastructure/flight-operations-api.js'
import { Incident } from '../domain/model/incident.entity.js'
import { IncidentSeverity } from '../domain/model/incident-severity.enum.js'

/**
 * Application layer use cases for flight incident reporting and monitoring.
 */
export class IncidentUseCases {
  /** @type {FlightOperationsApi} */
  #api

  constructor(api = new FlightOperationsApi()) {
    this.#api = api
  }

  /**
   * Fetches incidents associated with a specific mission.
   * @param {number|string} missionId
   * @returns {Promise<Incident[]>}
   */
  listMissionIncidents = (missionId) => this.#api.getAllIncidents({ missionId: Number(missionId) })

  /**
   * Reports an operational incident or obstacle detection during flight.
   * @param {{ missionId?: number, droneId?: number, type: string, description: string, severity?: string, occurredAt?: string }} payload
   * @returns {Promise<Incident>}
   */
  reportIncident = (payload) => {
    const entity = new Incident(
      null,
      payload.type || 'OBSTACLE_DETECTED',
      payload.description || '',
      payload.occurredAt || new Date().toISOString(),
      payload.missionId != null ? Number(payload.missionId) : null,
      payload.droneId != null ? Number(payload.droneId) : null,
      payload.severity || IncidentSeverity.HIGH
    )
    return this.#api.createIncident(entity)
  }
}
