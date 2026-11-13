import { markRaw } from 'vue'
import { Mission } from '../domain/model/mission.entity.js'
import { MissionStatus } from '../domain/model/mission-status.enum.js'
import { FlightParameters } from '../domain/model/flight-parameters.vo.js'
import { GeoCoordinate } from '../domain/model/geo-coordinate.vo.js'

/**
 * Assembler for Mission domain entity and DTO resources.
 */
export class MissionAssembler {
  /**
   * @param {any} response
   * @returns {Mission[]}
   */
  toEntitiesFromResponse = (response) => {
    const list = Array.isArray(response) ? response : (response?.missions ?? [])
    return list.map(item => this.toEntityFromResource(item))
  }

  /**
   * @param {any} resource
   * @returns {Mission}
   */
  toEntityFromResource = (resource) => {
    let status = resource.status || MissionStatus.PLANNED
    if (typeof status === 'string') status = status.toUpperCase()
    if (!Object.values(MissionStatus).includes(status)) status = MissionStatus.PLANNED

    const flightParams = resource.flightParameters
      ? new FlightParameters(
          resource.flightParameters.altitudeMeters,
          resource.flightParameters.speedMetersPerSecond,
          resource.flightParameters.sprayRateLitersPerHectare,
          resource.flightParameters.overlapPercentage
        )
      : null

    const pausePoint = resource.lastPausePoint
      ? new GeoCoordinate(resource.lastPausePoint.latitude, resource.lastPausePoint.longitude)
      : null

    const scheduledDate = resource.scheduledAt || resource.date || new Date().toISOString()
    const operatorName = resource.operatorName || resource.operator || ''
    const productName = resource.productName || resource.product || ''

    return markRaw(
      new Mission(
        resource.id,
        resource.code ?? '',
        resource.farmArea ?? '',
        resource.cropType ?? '',
        status,
        operatorName,
        scheduledDate,
        resource.farmId ?? null,
        resource.parcelId ?? null,
        resource.droneId ?? null,
        resource.chemicalId ?? null,
        resource.operatorId ?? null,
        resource.treatmentType ?? '',
        productName,
        resource.productDose ?? '',
        resource.notes ?? '',
        resource.plannedAreaHectares ?? 0,
        resource.treatedAreaHectares ?? 0,
        Number(resource.progress) || 0,
        flightParams,
        pausePoint,
        resource.startedAt ?? null,
        resource.completedAt ?? null,
        resource.isActive ?? true
      )
    )
  }

  /**
   * @param {Mission} entity
   * @returns {any}
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
      code: entity.code,
      farmArea: entity.farmArea,
      cropType: entity.cropType,
      status: entity.status,
      operator: entity.operator,
      operatorName: entity.operator,
      date: formatIsoDate(entity.date),
      scheduledAt: formatIsoDate(entity.date),
      farmId: entity.farmId,
      parcelId: entity.parcelId,
      droneId: entity.droneId,
      chemicalId: entity.chemicalId,
      operatorId: entity.operatorId,
      treatmentType: entity.treatmentType,
      product: entity.product,
      productName: entity.product,
      productDose: entity.productDose != null && entity.productDose !== '' ? Number(entity.productDose) : null,
      notes: entity.notes,
      plannedAreaHectares: Number(entity.plannedAreaHectares) || 0,
      treatedAreaHectares: Number(entity.treatedAreaHectares) || 0,
      progress: Number(entity.progress) || 0,
      flightParameters: entity.flightParameters ? {
        altitudeMeters: entity.flightParameters.altitudeMeters,
        speedMetersPerSecond: entity.flightParameters.speedMetersPerSecond,
        sprayRateLitersPerHectare: entity.flightParameters.sprayRateLitersPerHectare,
        overlapPercentage: entity.flightParameters.overlapPercentage
      } : null,
      lastPausePoint: entity.lastPausePoint ? {
        latitude: entity.lastPausePoint.latitude,
        longitude: entity.lastPausePoint.longitude
      } : null,
      startedAt: formatIsoDate(entity.startedAt),
      completedAt: formatIsoDate(entity.completedAt),
      isActive: entity.isActive
    }
  }
}
