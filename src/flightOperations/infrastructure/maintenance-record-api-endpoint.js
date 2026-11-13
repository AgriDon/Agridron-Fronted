import { BaseApiEndpoint } from '@/shared/infrastructure/base-api-endpoint.js'
import { ENDPOINTS, buildUrl } from '@/config/env.js'
import { MaintenanceRecordAssembler } from './maintenance-record-assembler.js'

/**
 * API endpoint client for drone maintenance records.
 */
export class MaintenanceRecordApiEndpoint extends BaseApiEndpoint {
    /**
     * @param {import('axios').AxiosInstance} http - Axios instance
     */
    constructor(http) {
        super(http, buildUrl(ENDPOINTS.maintenanceRecords), new MaintenanceRecordAssembler())
    }

    /**
     * Fetches the maintenance records of one drone (GET ?droneId=).
     * @param {number|string} droneId
     * @returns {Promise<import('../domain/model/maintenance-record.entity.js').MaintenanceRecord[]>}
     */
    async getAllByDroneId(droneId) {
        try {
            const response = await this.http.get(this.endpointUrl, { params: { droneId } })

            if (Array.isArray(response.data)) {
                return response.data.map(resource => this.assembler.toEntityFromResource(resource))
            }

            return this.assembler.toEntitiesFromResponse(response.data)
        } catch (error) {
            return this.handleError('Failed to fetch maintenance records')(error)
        }
    }
}