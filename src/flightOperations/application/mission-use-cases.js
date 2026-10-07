import { FincaUseCases } from '@/fieldManagement/application/finca-use-cases.js'
import { ParcelaUseCases } from '@/fieldManagement/application/parcela-use-cases.js'
import { MissionService } from '../infrastructure/mission-service.js'

export class MissionUseCases {
  #service

  constructor(service = new MissionService()) {
    this.#service = service
  }

  listFarms = () => new FincaUseCases().listFarms()

  listParcels = () => new ParcelaUseCases().listParcels()

  listCrops = () => new ParcelaUseCases().listCrops()

  listMissions = () => this.#service.getMissions()

  createMission = async (payload) => {
    const clean = {
      ...payload,
      farmArea: payload.farmArea ?? payload.parcelName ?? 'Sin parcela',
      cropType: payload.cropType ?? 'Sin cultivo',
      status: payload.status ?? 'Programada',
      progress: payload.progress ?? 10,
      date: payload.date ?? new Date().toISOString(),
      operator: payload.operator ?? 'Juan Perez'
    }

    return this.#service.createMission(clean)
  }
}
