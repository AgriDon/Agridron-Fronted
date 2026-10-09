import { markRaw } from 'vue'
import { OperationStatus } from '../domain/model/operation-status.entity.js'

/**
 * Assembler mapping between OperationStatus domain entities and API resources.
 */
export class OperationStatusAssembler {
  /**
   * Converts backend response into a list of OperationStatus entities.
   * @param {import('./flight-operations-response.js').OperationStatusResponse|any[]} response
   * @returns {OperationStatus[]}
   */
  toEntitiesFromResponse = (response) => {
    const list = Array.isArray(response) ? response : (response?.operationStatuses || [])
    return list.map(resource => this.toEntityFromResource(resource))
  }

  /**
   * Converts one backend resource into an OperationStatus entity.
   * @param {import('./flight-operations-response.js').OperationStatusResource} resource
   * @returns {OperationStatus}
   */
  toEntityFromResource = (resource) => {
    return markRaw(
      new OperationStatus(
        resource.latitude,
        resource.longitude,
        resource.status,
        resource.timestamp,
        resource.missionId ?? null
      )
    )
  }

  /**
   * Converts an OperationStatus entity into JSON resource.
   * @param {OperationStatus} entity
   * @returns {import('./flight-operations-response.js').OperationStatusResource}
   */
  toResourceFromEntity = (entity) => ({
    latitude: entity.latitude,
    longitude: entity.longitude,
    status: entity.status,
    timestamp: entity.timestamp,
    missionId: entity.missionId
  })
}
