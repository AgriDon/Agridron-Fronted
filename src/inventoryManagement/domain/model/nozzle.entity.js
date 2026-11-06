/**
 * Domain entity representing spray nozzles used by the drone fleet.
 */
export class Nozzle {
  /** @type {number|string} */
  #id

  /** @type {'flat-fan'|'hollow-cone'|string} */
  #type

  /** @type {number} */
  #diameterMm

  /** @type {number} */
  #stockUnits

  /** @type {'good'|'worn'|string} */
  #status

  /**
   * @param {Object} params
   * @param {number|string} params.id
   * @param {'flat-fan'|'hollow-cone'|string} [params.type]
   * @param {number} [params.diameterMm]
   * @param {number} [params.stockUnits]
   * @param {'good'|'worn'|string} [params.status]
   */
  constructor({
    id = null,
    type = 'flat-fan',
    diameterMm = 0,
    stockUnits = 0,
    status = 'good'
  } = {}) {
    this.#id = id
    this.#type = type
    this.#diameterMm = Number(diameterMm) || 0
    this.#stockUnits = Number(stockUnits) || 0
    this.#status = status
  }

  get id() {
    return this.#id
  }

  set id(value) {
    this.#id = value
  }

  get type() {
    return this.#type
  }

  set type(value) {
    this.#type = value
  }

  get diameterMm() {
    return this.#diameterMm
  }

  set diameterMm(value) {
    this.#diameterMm = Number(value) || 0
  }

  get stockUnits() {
    return this.#stockUnits
  }

  set stockUnits(value) {
    this.#stockUnits = Number(value) || 0
  }

  get status() {
    return this.#status
  }

  set status(value) {
    this.#status = value
  }

  /**
   * Indicates whether the nozzle is worn out and requires replacement.
   * @returns {boolean}
   */
  isWorn() {
    return this.#status === 'worn'
  }

  /**
   * Indicates if available stock units are critically low.
   * @param {number} [threshold=5]
   * @returns {boolean}
   */
  isLowStock(threshold = 5) {
    return this.#stockUnits <= threshold
  }
}
