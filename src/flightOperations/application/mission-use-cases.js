import { FincaUseCases } from '@/fieldManagement/application/finca-use-cases.js'
import { ParcelaUseCases } from '@/fieldManagement/application/parcela-use-cases.js'
import { DroneUseCases } from './dron-use-cases.js'
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
  listDrones = (params) => new DroneUseCases(this.#api).listDrones(params)

  listMissions = (params) => this.#api.getAllMissions(params)
  getMission = (id) => this.#api.getMissionById(id)

  createMission = async (payload) => {
    const clean = {
      ...payload,
      farmArea: payload.farmArea ?? payload.parcelName ?? '',
      cropType: payload.cropType ?? '',
      status: payload.status ?? 'PLANNED',
      progress: payload.progress ?? 0,
      date: payload.date ?? new Date().toISOString(),
      scheduledAt: payload.date ?? payload.scheduledAt ?? new Date().toISOString(),
      operator: payload.operator ?? '',
      operatorName: payload.operator ?? '',
      droneId: payload.droneId != null ? Number(payload.droneId) : null,
      plannedAreaHectares: payload.plannedAreaHectares != null ? Number(payload.plannedAreaHectares) : 0,
      treatmentType: payload.treatmentType ?? '',
      product: payload.product ?? '',
      productName: payload.product ?? '',
      productDose: payload.productDose != null && payload.productDose !== '' ? Number(payload.productDose) : null,
      notes: payload.notes ?? ''
    }

    return this.#api.createMission(clean)
  }

  updateMission = (id, payload) => this.#api.updateMission({ ...payload, id })
  deleteMission = (id) => this.#api.deleteMission(id)

  // Lifecycle transitions
  assignResources = (id, payload) => this.#api.assignMissionResources(id, {
    droneId: Number(payload.droneId),
    treatmentType: payload.treatmentType || null,
    productName: payload.productName || payload.product || null,
    productDose: payload.productDose != null && payload.productDose !== '' ? Number(payload.productDose) : null,
    chemicalId: payload.chemicalId != null ? Number(payload.chemicalId) : null
  })

  assignOperator = (id, payload) => this.#api.assignMissionOperator(id, {
    operatorName: payload.operatorName || payload.operator || '',
    operatorId: payload.operatorId != null ? Number(payload.operatorId) : null
  })

  configureFlightParameters = (id, payload) => this.#api.configureMissionFlightParameters(id, {
    altitudeMeters: Number(payload.altitudeMeters) || 2.5,
    speedMetersPerSecond: Number(payload.speedMetersPerSecond) || 4.0,
    sprayRateLitersPerHectare: Number(payload.sprayRateLitersPerHectare) || 15.0,
    overlapPercentage: Number(payload.overlapPercentage) || 20.0
  })

  approveMission = (id) => this.#api.approveMission(id)

  startMission = (id, startedAt) => this.#api.startMission(id, startedAt)

  pauseMission = (id, payload) => this.#api.pauseMission(id, payload)

  resumeMission = (id) => this.#api.resumeMission(id)

  completeMission = (id, payload) => this.#api.completeMission(id, payload)

  cancelMission = (id, reason) => this.#api.cancelMission(id, reason)
}
