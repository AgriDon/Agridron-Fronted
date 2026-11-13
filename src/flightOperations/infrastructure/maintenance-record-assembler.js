import { markRaw } from 'vue'
import { MaintenanceRecord } from '../domain/model/maintenance-record.entity.js'
import { MaintenanceType } from '../domain/model/maintenance-type.enum.js'

/**
 * Assembler mapping between MaintenanceRecord domain entities and API resources.
 */
export class MaintenanceRecordAssembler {
    /**
     * Converts the backend response into a list of MaintenanceRecord entities.
     * @param {import('./flight-operations-response.js').MaintenanceRecordResponse|any[]} response
     * @returns {MaintenanceRecord[]}
     */
    toEntitiesFromResponse = (response) => {
        const list = Array.isArray(response) ? response : (response?.records || [])
        return list.map(resource => this.toEntityFromResource(resource))
    }

    /**
     * Converts one backend maintenance record into a MaintenanceRecord entity.
     * @param {import('./flight-operations-response.js').MaintenanceRecordResource} resource
     * @returns {MaintenanceRecord}
     */
    toEntityFromResource = (resource) => {
        let type = resource.type || MaintenanceType.PREVENTIVE
        if (typeof type === 'string') type = type.toUpperCase()
        if (!Object.values(MaintenanceType).includes(type)) type = MaintenanceType.PREVENTIVE

        return markRaw(
            new MaintenanceRecord({
                id: resource.id,
                droneId: resource.droneId ?? null,
                date: resource.date || new Date().toISOString(),
                type,
                description: resource.description || '',
                technician: resource.technician || ''
            })
        )
    }

    /**
     * Converts a MaintenanceRecord entity into the JSON resource sent to the backend.
     * @param {MaintenanceRecord} entity
     * @returns {any}
     */
    toResourceFromEntity = (entity) => ({
        id: entity.id,
        droneId: entity.droneId != null ? Number(entity.droneId) : null,
        date: entity.date,
        type: entity.type,
        description: entity.description,
        technician: entity.technician
    })
}