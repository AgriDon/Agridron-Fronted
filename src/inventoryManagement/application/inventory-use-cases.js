import { InventoryApi } from '../infrastructure/inventory-api.js'
import { Chemical } from '../domain/model/chemical.entity.js'
import { Nozzle } from '../domain/model/nozzle.entity.js'

/**
 * Validation error for inventory domain models.
 */
export class InventoryValidationError extends Error {
  /**
   * @param {Record<string, string>} errors
   */
  constructor(errors) {
    super('Inventory validation failed')
    this.name = 'InventoryValidationError'
    this.errors = errors
  }
}

/**
 * Application service for Inventory & Resource Management use cases.
 */
export class InventoryUseCases {
  /** @type {InventoryApi} */
  #api

  /**
   * @param {InventoryApi} [api]
   */
  constructor(api = new InventoryApi()) {
    this.#api = api
  }

  // ==========================================
  // Chemical Validations & Operations
  // ==========================================

  /**
   * Validates chemical form payload.
   * @param {Object} data
   * @returns {Record<string, string>}
   */
  static validateChemical(data) {
    const errors = {}

    if (!data.name || !String(data.name).trim()) {
      errors.name = 'inventory.form.error.nameRequired'
    }

    if (!data.type) {
      errors.type = 'inventory.form.error.typeRequired'
    }

    const stock = Number(data.stockLiters)
    if (data.stockLiters === '' || data.stockLiters == null || Number.isNaN(stock) || stock < 0) {
      errors.stockLiters = 'inventory.form.error.stockInvalid'
    }

    const minStock = Number(data.minimumStockLiters)
    if (data.minimumStockLiters === '' || data.minimumStockLiters == null || Number.isNaN(minStock) || minStock < 0) {
      errors.minimumStockLiters = 'inventory.form.error.minStockInvalid'
    }

    if (!data.expirationDate) {
      errors.expirationDate = 'inventory.form.error.expirationRequired'
    }

    return errors
  }

  /**
   * Fetches all chemical products in inventory.
   * @returns {Promise<Chemical[]>}
   */
  async getAllChemicals() {
    return await this.#api.getAllChemicals()
  }

  /**
   * Fetches a chemical by ID.
   * @param {number|string} id
   * @returns {Promise<Chemical>}
   */
  async getChemicalById(id) {
    return await this.#api.getChemicalById(id)
  }

  /**
   * Creates or updates a chemical product.
   * @param {Object} data
   * @returns {Promise<Chemical>}
   */
  async saveChemical(data) {
    const errors = InventoryUseCases.validateChemical(data)
    if (Object.keys(errors).length > 0) {
      throw new InventoryValidationError(errors)
    }

    const entity = new Chemical({
      id: data.id || undefined,
      name: String(data.name).trim(),
      type: data.type,
      stockLiters: Number(data.stockLiters) || 0,
      minimumStockLiters: Number(data.minimumStockLiters) || 0,
      expirationDate: data.expirationDate
    })

    if (data.id) {
      return await this.#api.updateChemical(entity)
    }
    return await this.#api.createChemical(entity)
  }

  /**
   * Deletes a chemical from inventory.
   * @param {number|string} id
   * @returns {Promise<void>}
   */
  async deleteChemical(id) {
    return await this.#api.deleteChemical(id)
  }

  /**
   * Replenishes stock for a chemical product.
   * @param {number|string} id
   * @param {number} additionalLiters
   * @returns {Promise<Chemical>}
   */
  async restockChemical(id, additionalLiters) {
    const litersToAdd = Number(additionalLiters)
    if (Number.isNaN(litersToAdd) || litersToAdd <= 0) {
      throw new Error('La cantidad de reabastecimiento debe ser mayor a 0 litros.')
    }

    const chemical = await this.#api.getChemicalById(id)
    if (!chemical) {
      throw new Error('Insumo no encontrado')
    }

    chemical.stockLiters = (chemical.stockLiters || 0) + litersToAdd
    return await this.#api.updateChemical(chemical)
  }

  // ==========================================
  // Nozzle Validations & Operations
  // ==========================================

  /**
   * Validates nozzle form payload.
   * @param {Object} data
   * @returns {Record<string, string>}
   */
  static validateNozzle(data) {
    const errors = {}

    if (!data.type) {
      errors.type = 'inventory.nozzles.error.typeRequired'
    }

    const diameter = Number(data.diameterMm)
    if (data.diameterMm === '' || data.diameterMm == null || Number.isNaN(diameter) || diameter <= 0) {
      errors.diameterMm = 'inventory.nozzles.error.diameterInvalid'
    }

    const units = Number(data.stockUnits)
    if (data.stockUnits === '' || data.stockUnits == null || Number.isNaN(units) || units < 0) {
      errors.stockUnits = 'inventory.nozzles.error.unitsInvalid'
    }

    return errors
  }

  /**
   * Fetches all nozzles in inventory.
   * @returns {Promise<Nozzle[]>}
   */
  async getAllNozzles() {
    return await this.#api.getAllNozzles()
  }

  /**
   * Creates or updates a nozzle item.
   * @param {Object} data
   * @returns {Promise<Nozzle>}
   */
  async saveNozzle(data) {
    const errors = InventoryUseCases.validateNozzle(data)
    if (Object.keys(errors).length > 0) {
      throw new InventoryValidationError(errors)
    }

    const entity = new Nozzle({
      id: data.id || undefined,
      type: data.type,
      diameterMm: Number(data.diameterMm),
      stockUnits: Number(data.stockUnits),
      status: data.status || 'good'
    })

    if (data.id) {
      return await this.#api.updateNozzle(entity)
    }
    return await this.#api.createNozzle(entity)
  }

  /**
   * Deletes a nozzle.
   * @param {number|string} id
   * @returns {Promise<void>}
   */
  async deleteNozzle(id) {
    return await this.#api.deleteNozzle(id)
  }

  /**
   * Toggles condition/status between good and worn.
   * @param {number|string} id
   * @returns {Promise<Nozzle>}
   */
  async toggleNozzleStatus(id) {
    const nozzle = await this.#api.getNozzleById(id)
    if (!nozzle) {
      throw new Error('Boquilla no encontrada')
    }
    nozzle.status = nozzle.status === 'worn' ? 'good' : 'worn'
    return await this.#api.updateNozzle(nozzle)
  }
}
