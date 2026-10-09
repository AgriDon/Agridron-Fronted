/**
 * Domain entity representing a mission report / historical operation record.
 */
export class MissionReportEntity {
  /**
   * @param {Object} params
   * @param {number|string} params.id
   * @param {string} [params.code]
   * @param {number|string} [params.missionId]
   * @param {string} [params.farmName]
   * @param {string} [params.parcelName]
   * @param {string} [params.crop]
   * @param {string} [params.date]
   * @param {string} [params.status]
   * @param {number} [params.area]
   * @param {string} [params.operator]
   * @param {string} [params.treatmentType]
   * @param {string} [params.product]
   * @param {string|number} [params.dose]
   * @param {number} [params.appliedVolume]
   * @param {number} [params.progress]
   * @param {string} [params.observations]
   */
  constructor({
    id,
    code,
    missionId,
    farmName = '',
    parcelName = '',
    crop = '',
    date = '',
    status = 'Completado',
    area = 0,
    operator = '',
    treatmentType = '',
    product = '',
    dose = '',
    appliedVolume = 0,
    progress = 100,
    observations = ''
  } = {}) {
    this.id = id
    this.code = code || `M${missionId || id}-00${id}`
    this.missionId = missionId || id
    this.farmName = farmName
    this.parcelName = parcelName
    this.crop = crop
    this.date = date
    this.status = status
    this.area = Number(area) || 0
    this.operator = operator
    this.treatmentType = treatmentType
    this.product = product
    this.dose = dose
    this.appliedVolume = Number(appliedVolume) || 0
    this.progress = Number(progress) || 0
    this.observations = observations
  }

  isCompleted() {
    return this.status === 'Completado' || this.status === 'COMPLETED'
  }

  isInProgress() {
    return this.status === 'En curso' || this.status === 'IN_PROGRESS'
  }

  isScheduled() {
    return (
      this.status === 'Programado' ||
      this.status === 'Programada' ||
      this.status === 'PLANNED'
    )
  }
}
