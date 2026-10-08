import { BaseApi } from '@/shared/infrastructure/base-api.js'
import { ENDPOINTS, buildUrl } from '@/config/env.js'

/**
 * Infrastructure HTTP client for Reporting & Analytics Bounded Context.
 */
export class ReportingApi extends BaseApi {
  /**
   * Fetch all recorded missions
   * @returns {Promise<any[]>}
   */
  async getMissions() {
    const response = await this.http.get(buildUrl(ENDPOINTS.missions))
    return response.data
  }

  /**
   * Fetch all parcels for area and geometry enrichment
   * @returns {Promise<any[]>}
   */
  async getParcels() {
    const response = await this.http.get(buildUrl(ENDPOINTS.parcels))
    return response.data
  }

  /**
   * Fetch agrochemical inventory & usage data
   * @returns {Promise<any[]>}
   */
  async getChemicals() {
    const response = await this.http.get(buildUrl(ENDPOINTS.chemicals))
    return response.data
  }

  /**
   * Fetch performance and operational indicators
   * @returns {Promise<any[]>}
   */
  async getPerformanceIndicators() {
    const response = await this.http.get(buildUrl(ENDPOINTS.performanceIndicators))
    return response.data
  }

  /**
   * Fetch technical mission reports
   * @returns {Promise<any[]>}
   */
  async getMissionReports() {
    const response = await this.http.get(buildUrl(ENDPOINTS.missionReports))
    return response.data
  }
}
