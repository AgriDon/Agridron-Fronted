/**
 * Domain entity representing an agrochemical product in inventory.
 */
export class Chemical {
  /** @type {number|string} */
  #id

  /** @type {string} */
  #name

  /** @type {'herbicide'|'insecticide'|'fungicide'|'fertilizer'|string} */
  #type

  /** @type {number} */
  #stockLiters

  /** @type {number} */
  #minimumStockLiters

  /** @type {string} */
  #expirationDate

  /**
   * @param {Object} params
   * @param {number|string} params.id
   * @param {string} params.name
   * @param {'herbicide'|'insecticide'|'fungicide'|'fertilizer'|string} [params.type]
   * @param {number} [params.stockLiters]
   * @param {number} [params.minimumStockLiters]
   * @param {string} [params.expirationDate]
   */
  constructor({
    id = null,
    name = '',
    type = 'herbicide',
    stockLiters = 0,
    minimumStockLiters = 0,
    expirationDate = ''
  } = {}) {
    this.#id = id
    this.#name = name
    this.#type = type
    this.#stockLiters = Number(stockLiters) || 0
    this.#minimumStockLiters = Number(minimumStockLiters) || 0
    this.#expirationDate = expirationDate
  }

  get id() {
    return this.#id
  }

  set id(value) {
    this.#id = value
  }

  get name() {
    return this.#name
  }

  set name(value) {
    this.#name = value
  }

  get type() {
    return this.#type
  }

  set type(value) {
    this.#type = value
  }

  get stockLiters() {
    return this.#stockLiters
  }

  set stockLiters(value) {
    this.#stockLiters = Number(value) || 0
  }

  get minimumStockLiters() {
    return this.#minimumStockLiters
  }

  set minimumStockLiters(value) {
    this.#minimumStockLiters = Number(value) || 0
  }

  get expirationDate() {
    return this.#expirationDate
  }

  set expirationDate(value) {
    this.#expirationDate = value
  }

  /**
   * Checks whether the current stock is below or at the minimum threshold.
   * @returns {boolean}
   */
  isLowStock() {
    return this.#stockLiters <= this.#minimumStockLiters
  }

  /**
   * Checks if the chemical has expired based on today's date.
   * @returns {boolean}
   */
  isExpired() {
    if (!this.#expirationDate) return false
    const exp = new Date(this.#expirationDate)
    return !Number.isNaN(exp.getTime()) && exp < new Date()
  }

  /**
   * Checks if the chemical will expire within a given number of days.
   * @param {number} [days=60]
   * @returns {boolean}
   */
  isExpiringSoon(days = 60) {
    if (!this.#expirationDate) return false
    const exp = new Date(this.#expirationDate)
    if (Number.isNaN(exp.getTime())) return false
    const now = new Date()
    const diffDays = (exp.getTime() - now.getTime()) / (1000 * 3600 * 24)
    return diffDays > 0 && diffDays <= days
  }

  /**
   * Calculates restock level percentage relative to ideal stock (min * 2.5).
   * @returns {number}
   */
  stockPercentage() {
    const target = this.#minimumStockLiters * 2.5 || 100
    return Math.min(100, Math.max(0, Math.round((this.#stockLiters / target) * 100)))
  }

  /**
   * Returns suggested liters to replenish back to safe capacity.
   * @returns {number}
   */
  suggestedRestockLiters() {
    const target = this.#minimumStockLiters * 2.5
    return Math.max(0, Math.round(target - this.#stockLiters))
  }
}
