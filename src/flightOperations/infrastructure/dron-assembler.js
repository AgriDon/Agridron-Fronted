import { markRaw } from 'vue'
import { Drone } from '../domain/model/dron.entity.js'
import { DroneStatus } from '../domain/model/dron-status.enum.js'

/**
 * Assembler mapping between Drone domain entities and API resources.
 */
export class DronAssembler {
  /**
   * Converts the backend response into a list of Drone entities.
   * @param {import('./flight-operations-response.js').DronResponse|any[]} response
   * @returns {Drone[]}
   */
  toEntitiesFromResponse = (response) => {
    const list = Array.isArray(response) ? response : (response?.drones || [])
    return list.map(resource => this.toEntityFromResource(resource))
  }

  /**
   * Converts one backend drone into a Drone entity.
   * @param {import('./flight-operations-response.js').DronResource} resource
   * @returns {Drone}
   */
  toEntityFromResource = (resource) => {
    let status = resource.status || DroneStatus.AVAILABLE
    if (typeof status === 'string') status = status.toUpperCase()
    if (status === 'MAINTENANCE_SOON') status = DroneStatus.MAINTENANCE
    if (!Object.values(DroneStatus).includes(status)) status = DroneStatus.AVAILABLE

    const battery = resource.batteryLevel ?? resource.battery ?? 100
    const flightHours = Number(resource.flightHours) || 0
    const nozzleId = resource.nozzleId != null ? Number(resource.nozzleId) : null
    const lastMaintenanceDate = resource.lastMaintenanceDate || null
    const nextMaintenanceDate = resource.nextMaintenanceDate || null
    const isActive = resource.isActive ?? true

    return markRaw(
      new Drone(
        resource.id,
        resource.serialNumber ?? '',
        resource.model ?? resource.modelName ?? '',
        Number(resource.capacity ?? resource.capacityLiters) || 0,
        status,
        resource.urlimg || resource.imageUrl || resource.image || '',
        battery,
        flightHours,
        nozzleId,
        lastMaintenanceDate,
        nextMaintenanceDate,
        isActive
      )
    )
  }

  /**
   * Converts a Drone entity into the JSON resource sent to the backend.
   * @param {Drone} entity
   * @returns {Record<string, any>}
   */
  toResourceFromEntity = (entity) => {
    const formatIsoDate = (d) => {
      if (!d) return null
      if (d instanceof Date) return d.toISOString()
      if (typeof d === 'string' && d.trim().length > 0) {
        const parsed = new Date(d)
        return isNaN(parsed.getTime()) ? null : parsed.toISOString()
      }
      return null
    }

    return {
      id: entity.id,
      serialNumber: entity.serialNumber,
      model: entity.modelName,
      modelName: entity.modelName,
      capacity: Number(entity.capacity) || 0,
      capacityLiters: Number(entity.capacity) || 0,
      status: entity.status,
      battery: entity.batteryLevel,
      batteryLevel: entity.batteryLevel,
      flightHours: entity.flightHours,
      nozzleId: entity.nozzleId,
      urlimg: entity.urlimg,
      imageUrl: entity.urlimg,
      lastMaintenanceDate: formatIsoDate(entity.lastMaintenanceDate),
      nextMaintenanceDate: formatIsoDate(entity.nextMaintenanceDate),
      isActive: entity.isActive
    }
  }
}
