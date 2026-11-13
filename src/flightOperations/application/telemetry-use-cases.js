import { FlightOperationsApi } from '../infrastructure/flight-operations-api.js'
import { OperationStatus } from '../domain/model/operation-status.entity.js'

/**
 * Application layer use cases for drone telemetry in real-time.
 */
export class TelemetryUseCases {
  /** @type {FlightOperationsApi} */
  #api

  constructor(api = new FlightOperationsApi()) {
    this.#api = api
  }

  /**
   * Fetches historical and recent telemetry points for a mission.
   * @param {number|string} missionId
   * @returns {Promise<OperationStatus[]>}
   */
  listMissionTelemetry = (missionId) => this.#api.getAllOperationStatuses({ missionId: Number(missionId) })

  /**
   * Persists a live telemetry reading point to the backend.
   * Backend will automatically update drone battery and register anomaly if thresholds exceeded.
   * @param {Record<string, any>} payload
   * @returns {Promise<OperationStatus>}
   */
  recordTelemetryPoint = (payload) => {
    const entity = new OperationStatus(
      null,
      payload.missionId != null ? Number(payload.missionId) : null,
      payload.droneId != null ? Number(payload.droneId) : null,
      Number(payload.latitude) || 0,
      Number(payload.longitude) || 0,
      Number(payload.altitudeMeters) || 2.5,
      Number(payload.speedMetersPerSecond) || 4.0,
      Number(payload.batteryLevel) ?? 100,
      Number(payload.tankVolumeLiters) ?? 20,
      payload.status || 'IN_FLIGHT',
      payload.timestamp || new Date().toISOString()
    )
    return this.#api.createOperationStatus(entity)
  }
}
