/**
 * Domain entity representing operational efficiency, environmental and economic savings metrics.
 */
export class SavingsMetricEntity {
  /**
   * @param {Object} params
   * @param {number} [params.treatedHectares]
   * @param {number} [params.totalFlightHours]
   * @param {number} [params.waterSavedLiters]
   * @param {number} [params.waterSavingsPercent]
   * @param {number} [params.chemicalSavedLiters]
   * @param {number} [params.chemicalSavingsPercent]
   * @param {number} [params.costSavedUsd]
   * @param {number} [params.averageTimePerHectareMin]
   * @param {number} [params.completedMissionsCount]
   */
  constructor({
    treatedHectares = 0,
    totalFlightHours = 0,
    waterSavedLiters = 0,
    waterSavingsPercent = 90,
    chemicalSavedLiters = 0,
    chemicalSavingsPercent = 30,
    costSavedUsd = 0,
    averageTimePerHectareMin = 15,
    completedMissionsCount = 0
  } = {}) {
    this.treatedHectares = Number(treatedHectares) || 0
    this.totalFlightHours = Number(totalFlightHours) || 0
    this.waterSavedLiters = Number(waterSavedLiters) || 0
    this.waterSavingsPercent = Number(waterSavingsPercent) || 90
    this.chemicalSavedLiters = Number(chemicalSavedLiters) || 0
    this.chemicalSavingsPercent = Number(chemicalSavingsPercent) || 30
    this.costSavedUsd = Number(costSavedUsd) || 0
    this.averageTimePerHectareMin = Number(averageTimePerHectareMin) || 15
    this.completedMissionsCount = Number(completedMissionsCount) || 0
  }
}
