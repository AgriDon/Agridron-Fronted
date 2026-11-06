import { markRaw } from 'vue'
import { Chemical } from '../domain/model/chemical.entity.js'

/**
 * Assembler for translating between Chemical entities and API DTO resources.
 */
export class ChemicalAssembler {
  /**
   * @param {any[]} resources
   * @returns {Chemical[]}
   */
  toEntitiesFromResponse = (resources) => {
    if (!Array.isArray(resources)) return []
    return resources.map((res) => this.toEntityFromResource(res))
  }

  /**
   * @param {any} resource
   * @returns {Chemical}
   */
  toEntityFromResource = (resource) => {
    if (!resource) return null
    return markRaw(
      new Chemical({
        id: resource.id,
        name: resource.name ?? '',
        type: resource.type ?? 'herbicide',
        stockLiters: resource.stockLiters ?? 0,
        minimumStockLiters: resource.minimumStockLiters ?? 0,
        expirationDate: resource.expirationDate ?? ''
      })
    )
  }

  /**
   * @param {Chemical} entity
   * @returns {any}
   */
  toResourceFromEntity = (entity) => {
    return {
      id: entity.id,
      name: entity.name,
      type: entity.type,
      stockLiters: Number(entity.stockLiters) || 0,
      minimumStockLiters: Number(entity.minimumStockLiters) || 0,
      expirationDate: entity.expirationDate || ''
    }
  }
}
