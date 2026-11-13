import { BaseApiEndpoint } from '@/shared/infrastructure/base-api-endpoint.js'
import { ENDPOINTS, buildUrl } from '@/config/env.js'
import { MaintenanceRecordAssembler } from './maintenance-record-assembler.js'

export class MaintenanceRecordApiEndpoint extends BaseApiEndpoint {
    constructor(http) {
        super(http, buildUrl(ENDPOINTS.maintenanceRecords), new MaintenanceRecordAssembler())
    }
    /**
     * List maintenance records by drone id (GET ?droneId=).
     * @param {number} droneId
     * @returns {Promise<MaintenanceRecord[]>}
     */
    async getAllByDroneId(droneId) {
        return await this.getAll({ droneId })
    }
}