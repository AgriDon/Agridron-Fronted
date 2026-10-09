/**
 * Domain entity representing agrochemical consumption and inventory balance.
 */
export class SupplyUsageEntity {
  /**
   * @param {Object} params
   * @param {number|string} params.id
   * @param {string} params.name
   * @param {string} [params.type]
   * @param {number} [params.appliedTotal]
   * @param {number} [params.stockLiters]
   * @param {number} [params.minimumStockLiters]
   * @param {string} [params.expirationDate]
   */
  constructor({
    id,
    name,
    type = 'herbicide',
    appliedTotal = 0,
    stockLiters = 0,
    minimumStockLiters = 0,
    expirationDate = ''
  } = {}) {
    this.id = id
    this.name = name
    this.type = type
    this.appliedTotal = Number(appliedTotal) || 0
    this.stockLiters = Number(stockLiters) || 0
    this.minimumStockLiters = Number(minimumStockLiters) || 0
    this.expirationDate = expirationDate
  }

  isLowStock() {
    return this.stockLiters <= this.minimumStockLiters
  }

  stockHealthStatus() {
    return this.isLowStock() ? 'warning' : 'success'
  }
}
