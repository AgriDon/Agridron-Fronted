import { ReportingService } from '../infrastructure/reporting-service.js'

/**
 * Application Use Cases for the Reporting Bounded Context.
 */
export class ReportingUseCases {
  /** @type {ReportingService} */
  #service

  constructor(service = new ReportingService()) {
    this.#service = service
  }

  /**
   * Loads full mission report history
   * @returns {Promise<import('../domain/model/mission-report.entity.js').MissionReportEntity[]>}
   */
  async getMissionHistory() {
    return await this.#service.getMissionHistory()
  }

  /**
   * Filters mission records within an inclusive date range
   * @param {import('../domain/model/mission-report.entity.js').MissionReportEntity[]} missions
   * @param {Date|string|null} startDate
   * @param {Date|string|null} endDate
   * @returns {import('../domain/model/mission-report.entity.js').MissionReportEntity[]}
   */
  filterByDateRange(missions, startDate, endDate) {
    if (!startDate && !endDate) return missions

    const start = startDate ? new Date(startDate).getTime() : -Infinity
    const end = endDate ? new Date(endDate).getTime() : Infinity

    return missions.filter(m => {
      if (!m.date) return true
      const missionTime = new Date(m.date).getTime()
      if (isNaN(missionTime)) return true
      return missionTime >= start && missionTime <= end
    })
  }

  /**
   * Loads agrochemical usage records
   * @returns {Promise<import('../domain/model/supply-usage.entity.js').SupplyUsageEntity[]>}
   */
  async getSupplyUsage() {
    return await this.#service.getSupplyUsage()
  }

  /**
   * Loads economic and operational savings metrics
   * @param {import('../domain/model/mission-report.entity.js').MissionReportEntity[]} [missions]
   * @returns {Promise<import('../domain/model/savings-metric.entity.js').SavingsMetricEntity>}
   */
  async getSavingsMetrics(missions = []) {
    return await this.#service.getSavingsMetrics(missions)
  }
}
