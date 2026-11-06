import { markRaw } from 'vue'
import { Nozzle } from '../domain/model/nozzle.entity.js'

/**
 * Assembler for translating between Nozzle entities and API DTO resources.
 */
export class NozzleAssembler {
  /**
   * @param {any[]} resources
   * @returns {Nozzle[]}
   */
  toEntitiesFromResponse = (resources) => {
    if (!Array.isArray(resources)) return []
    return resources.map((res) => this.toEntityFromResource(res))
  }

  /**
   * @param {any} resource
   * @returns {Nozzle}
   */
  toEntityFromResource = (resource) => {
    if (!resource) return null
    return markRaw(
      new Nozzle({
        id: resource.id,
        type: resource.type ?? 'flat-fan',
        diameterMm: resource.diameterMm ?? 0,
        stockUnits: resource.stockUnits ?? 0,
        status: resource.status ?? 'good'
      })
    )
  }

  /**
   * @param {Nozzle} entity
   * @returns {any}
   */
  toResourceFromEntity = (entity) => {
    return {
      id: entity.id,
      type: entity.type,
      diameterMm: Number(entity.diameterMm) || 0,
      stockUnits: Number(entity.stockUnits) || 0,
      status: entity.status || 'good'
    }
  }
}
