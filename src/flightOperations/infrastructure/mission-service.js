import { FlightOperationsApi } from './flight-operations-api.js'

/**
 * Service adapter for missions that delegates to FlightOperationsApi.
 */
export class MissionService {
  #api

  constructor(api = new FlightOperationsApi()) {
    this.#api = api
  }

  getMissions = () => this.#api.getAllMissions()
  createMission = (missionData) => this.#api.createMission(missionData)
}