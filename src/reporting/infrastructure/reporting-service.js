import { ReportingApi } from './reporting-api.js'
import { MissionReportAssembler } from './mission-report-assembler.js'
import { SavingsMetricEntity } from '../domain/model/savings-metric.entity.js'

/**
 * Service orchestrating reporting queries and converting raw data to domain entities.
 */
export class ReportingService {
  /** @type {ReportingApi} */
  #api

  /** @type {MissionReportAssembler} */
  #assembler

  constructor() {
    this.#api = new ReportingApi()
    this.#assembler = new MissionReportAssembler()
  }

  /**
   * Fetch all mission reports with parcel data resolved
   * @returns {Promise<import('../domain/model/mission-report.entity.js').MissionReportEntity[]>}
   */
  async getMissionHistory() {
    const [missions, parcels] = await Promise.all([
      this.#api.getMissions(),
      this.#api.getParcels().catch(() => [])
    ])

    return this.#assembler.toEntitiesFromMissions(missions, parcels)
  }

  /**
   * Fetch agrochemical consumption records
   * @returns {Promise<import('../domain/model/supply-usage.entity.js').SupplyUsageEntity[]>}
   */
  async getSupplyUsage() {
    const chemicals = await this.#api.getChemicals()
    return this.#assembler.toSupplyEntities(chemicals)
  }

  /**
   * Calculate or fetch operational and efficiency savings metrics
   * @param {import('../domain/model/mission-report.entity.js').MissionReportEntity[]} [missions]
   * @returns {Promise<SavingsMetricEntity>}
   */
  async getSavingsMetrics(missions = []) {
    const indicators = await this.#api.getPerformanceIndicators().catch(() => [])

    const treatedHectares = missions.reduce((acc, m) => acc + (m.area || 0), 0) || 28.5
    const totalFlightHours = Math.round((treatedHectares * 0.45) * 10) / 10
    const waterSavedLiters = Math.round(treatedHectares * 180) // 180 L saved per ha vs manual spraying (90% reduction)
    const chemicalSavedLiters = Math.round(treatedHectares * 0.8 * 10) / 10 // ~30% chemical reduction
    const costSavedUsd = Math.round(treatedHectares * 42) // Estimated cost savings per hectare
    const completedCount = missions.filter(m => m.isCompleted()).length || missions.length

    return new SavingsMetricEntity({
      treatedHectares: Math.round(treatedHectares * 10) / 10,
      totalFlightHours,
      waterSavedLiters,
      waterSavingsPercent: 90,
      chemicalSavedLiters,
      chemicalSavingsPercent: 30,
      costSavedUsd,
      averageTimePerHectareMin: 14,
      completedMissionsCount: completedCount
    })
  }
}
