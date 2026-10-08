import { markRaw } from 'vue'
import { Mission } from '../domain/model/mission.entity.js'

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
    return markRaw(
      new Mission(
        resource.id,
        resource.farmArea ?? '',
        resource.cropType ?? '',
        resource.status ?? 'PLANNED',
        resource.operator ?? '',
        resource.date ?? new Date().toISOString(),
        resource.farmId ?? null,
        resource.parcelId ?? null,
        resource.treatmentType ?? '',
        resource.product ?? '',
        resource.productDose ?? '',
        resource.notes ?? '',
        resource.progress ?? 0
      )
    )
  }

  /**
   * @param {Mission} entity
   * @returns {any}
   */
  toResourceFromEntity = (entity) => ({
    id: entity.id,
    farmArea: entity.farmArea,
    cropType: entity.cropType,
    status: entity.status,
    operator: entity.operator,
    date: entity.date,
    farmId: entity.farmId,
    parcelId: entity.parcelId,
    treatmentType: entity.treatmentType,
    product: entity.product,
    productDose: entity.productDose,
    notes: entity.notes,
    progress: entity.progress
  })
}
