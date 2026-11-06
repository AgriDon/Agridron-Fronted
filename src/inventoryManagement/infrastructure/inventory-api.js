import { BaseApi } from '@/shared/infrastructure/base-api.js'
import { ChemicalApiEndpoint } from './chemical-api-endpoint.js'
import { NozzleApiEndpoint } from './nozzle-api-endpoint.js'

/**
 * Infrastructure facade for the Inventory & Resource Management bounded context.
 */
export class InventoryApi extends BaseApi {
  /** @type {ChemicalApiEndpoint} */
  #chemicalEndpoint

  /** @type {NozzleApiEndpoint} */
  #nozzleEndpoint

  constructor() {
    super()
    this.#chemicalEndpoint = new ChemicalApiEndpoint(this.http)
    this.#nozzleEndpoint = new NozzleApiEndpoint(this.http)
  }

  // ---- Chemicals ----
  getAllChemicals = () => this.#chemicalEndpoint.getAll()
  getChemicalById = (id) => this.#chemicalEndpoint.getById(id)
  createChemical = (chemical) => this.#chemicalEndpoint.create(chemical)
  updateChemical = (chemical) => this.#chemicalEndpoint.update(chemical, chemical.id)
  deleteChemical = (id) => this.#chemicalEndpoint.delete(id)

  // ---- Nozzles ----
  getAllNozzles = () => this.#nozzleEndpoint.getAll()
  getNozzleById = (id) => this.#nozzleEndpoint.getById(id)
  createNozzle = (nozzle) => this.#nozzleEndpoint.create(nozzle)
  updateNozzle = (nozzle) => this.#nozzleEndpoint.update(nozzle, nozzle.id)
  deleteNozzle = (id) => this.#nozzleEndpoint.delete(id)
}
