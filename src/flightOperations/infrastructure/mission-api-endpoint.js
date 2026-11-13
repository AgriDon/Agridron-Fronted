import { BaseApiEndpoint } from '@/shared/infrastructure/base-api-endpoint.js'
import { ENDPOINTS, buildUrl } from '@/config/env.js'
import { MissionAssembler } from './mission-assembler.js'

/**
 * Endpoint client for mission CRUD operations and lifecycle state transitions.
 */
export class MissionApiEndpoint extends BaseApiEndpoint {
  /**
   * @param {import('axios').AxiosInstance} http - Axios instance
   */
  constructor(http) {
    super(http, buildUrl(ENDPOINTS.missions), new MissionAssembler())
  }

  /**
   * Fetches missions with optional status, date or drone filter.
   * @param {{ status?: string, droneId?: number, from?: string, to?: string }} [params]
   * @returns {Promise<import('../domain/model/mission.entity.js').Mission[]>}
   */
  async getAll(params = {}) {
    try {
      const response = await this.http.get(this.endpointUrl, { params })
      if (Array.isArray(response.data)) {
        return response.data.map(resource => this.assembler.toEntityFromResource(resource))
      }
      return this.assembler.toEntitiesFromResponse(response.data)
    } catch (error) {
      return this.handleError('Failed to fetch missions')(error)
    }
  }

  /**
   * Assigns drone and chemical resources to a planned mission.
   * @param {number|string} id
   * @param {{ droneId: number, treatmentType?: string, productName?: string, productDose?: number, chemicalId?: number|null }} payload
   */
  async assignResources(id, payload) {
    try {
      const response = await this.http.post(`${this.endpointUrl}/${id}/resources`, payload)
      return this.assembler.toEntityFromResource(response.data)
    } catch (error) {
      return this.handleError('Failed to assign resources')(error)
    }
  }

  /**
   * Assigns certified technical operator to a planned mission.
   * @param {number|string} id
   * @param {{ operatorName: string, operatorId?: number|null }} payload
   */
  async assignOperator(id, payload) {
    try {
      const response = await this.http.post(`${this.endpointUrl}/${id}/operator`, payload)
      return this.assembler.toEntityFromResource(response.data)
    } catch (error) {
      return this.handleError('Failed to assign operator')(error)
    }
  }

  /**
   * Configures autonomous flight parameters for a planned mission.
   * @param {number|string} id
   * @param {{ altitudeMeters: number, speedMetersPerSecond: number, sprayRateLitersPerHectare: number, overlapPercentage: number }} payload
   */
  async configureFlightParameters(id, payload) {
    try {
      const response = await this.http.post(`${this.endpointUrl}/${id}/flight-parameters`, payload)
      return this.assembler.toEntityFromResource(response.data)
    } catch (error) {
      return this.handleError('Failed to configure flight parameters')(error)
    }
  }

  /**
   * Authorizes and approves a planned mission for takeoff.
   * @param {number|string} id
   */
  async approve(id) {
    try {
      const response = await this.http.post(`${this.endpointUrl}/${id}/approve`, {})
      return this.assembler.toEntityFromResource(response.data)
    } catch (error) {
      return this.handleError('Failed to approve mission')(error)
    }
  }

  /**
   * Launches mission execution, transitioning drone to IN_FLIGHT.
   * @param {number|string} id
   * @param {string} [startedAt]
   */
  async start(id, startedAt = new Date().toISOString()) {
    try {
      const response = await this.http.post(`${this.endpointUrl}/${id}/start`, { startedAt })
      return this.assembler.toEntityFromResource(response.data)
    } catch (error) {
      return this.handleError('Failed to start mission')(error)
    }
  }

  /**
   * Pauses an in-progress mission, saving hover coordinates.
   * @param {number|string} id
   * @param {{ latitude?: number, longitude?: number, reason?: string }} [payload]
   */
  async pause(id, payload = {}) {
    try {
      const response = await this.http.post(`${this.endpointUrl}/${id}/pause`, payload)
      return this.assembler.toEntityFromResource(response.data)
    } catch (error) {
      return this.handleError('Failed to pause mission')(error)
    }
  }

  /**
   * Resumes a paused mission.
   * @param {number|string} id
   */
  async resume(id) {
    try {
      const response = await this.http.post(`${this.endpointUrl}/${id}/resume`, {})
      return this.assembler.toEntityFromResource(response.data)
    } catch (error) {
      return this.handleError('Failed to resume mission')(error)
    }
  }

  /**
   * Completes mission execution, recording treated area and releasing drone.
   * @param {number|string} id
   * @param {{ completedAt?: string, treatedAreaHectares?: number, closingNotes?: string }} [payload]
   */
  async complete(id, payload = {}) {
    try {
      const body = {
        completedAt: payload.completedAt || new Date().toISOString(),
        treatedAreaHectares: payload.treatedAreaHectares != null ? Number(payload.treatedAreaHectares) : null,
        closingNotes: payload.closingNotes || ''
      }
      const response = await this.http.post(`${this.endpointUrl}/${id}/complete`, body)
      return this.assembler.toEntityFromResource(response.data)
    } catch (error) {
      return this.handleError('Failed to complete mission')(error)
    }
  }

  /**
   * Cancels a mission.
   * @param {number|string} id
   * @param {string} [reason]
   */
  async cancel(id, reason = '') {
    try {
      const response = await this.http.post(`${this.endpointUrl}/${id}/cancel`, { reason })
      return this.assembler.toEntityFromResource(response.data)
    } catch (error) {
      return this.handleError('Failed to cancel mission')(error)
    }
  }
}
