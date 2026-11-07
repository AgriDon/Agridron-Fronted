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
        resource.id,
        resource.missionId,
        resource.droneId,
        resource.latitude,
        resource.longitude,
        resource.altitudeMeters,
        resource.speedMetersPerSecond,
        resource.batteryLevel,
        resource.tankVolumeLiters,
        resource.status,
        resource.timestamp
      )
    )
  }

  /**
   * Converts an OperationStatus entity into JSON resource.
   * @param {OperationStatus} entity
   * @returns {any}
   */
  toResourceFromEntity = (entity) => {
    const formatIsoDate = (d) => {
      if (!d) return new Date().toISOString()
      if (d instanceof Date) return d.toISOString()
      if (typeof d === 'string' && d.trim().length > 0) {
        const parsed = new Date(d)
        return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString()
      }
      return new Date().toISOString()
    }

    return {
      id: entity.id,
      missionId: entity.missionId != null ? Number(entity.missionId) : null,
      droneId: entity.droneId != null ? Number(entity.droneId) : null,
      latitude: Number(entity.latitude) || 0,
      longitude: Number(entity.longitude) || 0,
      altitudeMeters: entity.altitudeMeters != null ? Number(entity.altitudeMeters) : null,
      speedMetersPerSecond: entity.speedMetersPerSecond != null ? Number(entity.speedMetersPerSecond) : null,
      batteryLevel: entity.batteryLevel != null ? Number(entity.batteryLevel) : null,
      tankVolumeLiters: entity.tankVolumeLiters != null ? Number(entity.tankVolumeLiters) : null,
      status: entity.status || 'IN_FLIGHT',
      timestamp: formatIsoDate(entity.timestamp)
    }
  }
}
