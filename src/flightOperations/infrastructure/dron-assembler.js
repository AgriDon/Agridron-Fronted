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

    return markRaw(
      new Drone(
        resource.id,
        resource.serialNumber ?? '',
        resource.model ?? '',
        Number(resource.capacity) || 0,
        status,
        resource.urlimg || resource.image || ''
      )
    )
  }

  /**
   * Converts a Drone entity into the JSON resource sent to the backend.
   * @param {Drone} entity
   * @returns {import('./flight-operations-response.js').DronResource}
   */
  toResourceFromEntity = (entity) => ({
    id: entity.id,
    serialNumber: entity.serialNumber,
    model: entity.modelName,
    capacity: entity.capacity,
    status: entity.status,
    urlimg: entity.urlimg
  })
}
