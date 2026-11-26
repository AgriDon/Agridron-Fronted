import { markRaw } from 'vue'
import { MaintenanceRecord } from '../domain/model/maintenance-record.entity.js'
import { MaintenanceType } from '../domain/model/maintenance-type.enum.js'

/**
 * Assembler mapping between MaintenanceRecord domain entities and API resources.
 */
export class MaintenanceRecordAssembler {
    /**
     * Converts the backend response into a list of MaintenanceRecord entities.
     * @param {any[]|{ maintenanceRecords?: any[] }} response
     * @returns {MaintenanceRecord[]}
     */
    toEntitiesFromResponse = (response) => {
        const list = Array.isArray(response) ? response : (response?.maintenanceRecords || [])
        return list.map(resource => this.toEntityFromResource(resource))
    }

    /**
     * Converts one backend maintenance record into a MaintenanceRecord entity.
     * @param {any} resource
     * @returns {MaintenanceRecord}
     */
    toEntityFromResource = (resource) => {
        let type = resource.type || MaintenanceType.PREVENTIVE
        if (typeof type === 'string') type = type.toLowerCase()
        if (!Object.values(MaintenanceType).includes(type)) type = MaintenanceType.PREVENTIVE

        return markRaw(
            new MaintenanceRecord({
                id: resource.id,
                droneId: resource.droneId ?? null,
                date: resource.date || '',
                type,
                description: resource.description || '',
                technician: resource.technician || ''
            })
        )
    }

    /**
     * Converts a MaintenanceRecord entity into the JSON resource sent to the backend.
     * The id is omitted when it is null so json-server generates it.
     * @param {MaintenanceRecord} entity
     * @returns {any}
     */
    toResourceFromEntity = (entity) => {
        const resource = {
            droneId: entity.droneId != null ? Number(entity.droneId) : null,
            date: entity.date,
            type: entity.type || MaintenanceType.PREVENTIVE,
            description: entity.description,
            technician: entity.technician
        }
        if (entity.id != null) resource.id = entity.id
        return resource
    }
}