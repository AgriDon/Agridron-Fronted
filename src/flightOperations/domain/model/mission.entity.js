/**
 * Mission domain entity.
 */
export class Mission {
  /**
   * @param {number|null} id
   * @param {string} farmArea
   * @param {string} cropType
   * @param {string} status
   * @param {string} operator
   * @param {string} date
   * @param {number} [farmId]
   * @param {number} [parcelId]
   * @param {string} [treatmentType]
   * @param {string} [product]
   * @param {string|number} [productDose]
   * @param {string} [notes]
   * @param {number} [progress]
   */
  constructor(
    id = null,
    farmArea = '',
    cropType = '',
    status = 'PLANNED',
    operator = '',
    date = '',
    farmId = null,
    parcelId = null,
    treatmentType = '',
    product = '',
    productDose = '',
    notes = '',
    progress = 0
  ) {
    this.id = id
    this.farmArea = farmArea
    this.cropType = cropType
    this.status = status
    this.operator = operator
    this.date = date
    this.farmId = farmId
    this.parcelId = parcelId
    this.treatmentType = treatmentType
    this.product = product
    this.productDose = productDose
    this.notes = notes
    this.progress = progress
  }
}
