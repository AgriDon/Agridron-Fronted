import { FincaUseCases } from '@/fieldManagement/application/finca-use-cases.js'
import { ParcelaUseCases } from '@/fieldManagement/application/parcela-use-cases.js'
import { FlightOperationsApi } from '../infrastructure/flight-operations-api.js'

/**
 * Application layer use cases for flight operations and missions.
 */
export class MissionUseCases {
  /** @type {FlightOperationsApi} */
  #api

  constructor(api = new FlightOperationsApi()) {
    this.#api = api
  }

  listFarms = () => new FincaUseCases().listFarms()
  listParcels = () => new ParcelaUseCases().listParcels()
  listCrops = () => new ParcelaUseCases().listCrops()

  listMissions = () => this.#api.getAllMissions()

  createMission = async (payload) => {
    const clean = {
      ...payload,
      farmArea: payload.farmArea ?? payload.parcelName ?? '',
      cropType: payload.cropType ?? '',
      status: payload.status ?? 'PLANNED',
      progress: payload.progress ?? 0,
      date: payload.date ?? new Date().toISOString(),
      operator: payload.operator ?? ''
    }

    return this.#api.createMission(clean)
  }
}
