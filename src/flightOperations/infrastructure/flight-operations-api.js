import { BaseApi } from '@/shared/infrastructure/base-api.js'
import { MissionApiEndpoint } from './mission-api-endpoint.js'

/**
 * Infrastructure facade for flight operations endpoints.
 */
export class FlightOperationsApi extends BaseApi {
  /** @type {MissionApiEndpoint} */
  #missionEndpoint

  constructor() {
    super()
    this.#missionEndpoint = new MissionApiEndpoint(this.http)
  }

  getAllMissions = () => this.#missionEndpoint.getAll()
  getMissionById = (id) => this.#missionEndpoint.getById(id)
  createMission = (mission) => this.#missionEndpoint.create(mission)
  updateMission = (mission) => this.#missionEndpoint.update(mission, mission.id)
  deleteMission = (id) => this.#missionEndpoint.delete(id)
}
