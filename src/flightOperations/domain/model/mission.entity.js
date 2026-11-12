import { MissionStatus } from './mission-status.enum.js'
import { FlightParameters } from './flight-parameters.vo.js'
import { GeoCoordinate } from './geo-coordinate.vo.js'

/**
 * Mission domain aggregate root entity in Flight Operations.
 */
export class Mission {
  id
  code
  farmId
  parcelId
  droneId
  chemicalId
  operatorId
  farmArea
  cropType
  operator
  treatmentType
  product
  productDose
  notes
  status
  date
  plannedAreaHectares
  treatedAreaHectares
  progress
  flightParameters
  lastPausePoint
  startedAt
  completedAt
  isActive

  /**
   * @param {number|null} [id=null]
   * @param {string} [code='']
   * @param {string} [farmArea='']
   * @param {string} [cropType='']
   * @param {string} [status='PLANNED']
   * @param {string} [operator='']
   * @param {string} [date='']
   * @param {number|null} [farmId=null]
   * @param {number|null} [parcelId=null]
   * @param {number|null} [droneId=null]
   * @param {number|null} [chemicalId=null]
   * @param {number|null} [operatorId=null]
   * @param {string} [treatmentType='']
   * @param {string} [product='']
   * @param {string|number} [productDose='']
   * @param {string} [notes='']
   * @param {number} [plannedAreaHectares=0]
   * @param {number} [treatedAreaHectares=0]
   * @param {number} [progress=0]
   * @param {FlightParameters|null} [flightParameters=null]
   * @param {GeoCoordinate|null} [lastPausePoint=null]
   * @param {string|null} [startedAt=null]
   * @param {string|null} [completedAt=null]
   * @param {boolean} [isActive=true]
   */
  constructor(
    id = null,
    code = '',
    farmArea = '',
    cropType = '',
    status = MissionStatus.PLANNED,
    operator = '',
    date = '',
    farmId = null,
    parcelId = null,
    droneId = null,
    chemicalId = null,
    operatorId = null,
    treatmentType = '',
    product = '',
    productDose = '',
    notes = '',
    plannedAreaHectares = 0,
    treatedAreaHectares = 0,
    progress = 0,
    flightParameters = null,
    lastPausePoint = null,
    startedAt = null,
    completedAt = null,
    isActive = true
  ) {
    this.id = id
    this.code = code
    this.farmArea = farmArea
    this.cropType = cropType
    this.status = status || MissionStatus.PLANNED
    this.operator = operator
    this.date = date || new Date().toISOString()
    this.farmId = farmId != null ? Number(farmId) : null
    this.parcelId = parcelId != null ? Number(parcelId) : null
    this.droneId = droneId != null ? Number(droneId) : null
    this.chemicalId = chemicalId != null ? Number(chemicalId) : null
    this.operatorId = operatorId != null ? Number(operatorId) : null
    this.treatmentType = treatmentType
    this.product = product
    this.productDose = productDose
    this.notes = notes
    this.plannedAreaHectares = Number(plannedAreaHectares) || 0
    this.treatedAreaHectares = Number(treatedAreaHectares) || 0
    this.progress = Number(progress) || 0
    this.flightParameters = flightParameters
    this.lastPausePoint = lastPausePoint
    this.startedAt = startedAt
    this.completedAt = completedAt
    this.isActive = isActive !== false
  }

  // Domain Lifecycle Predicates
  canApprove() {
    return this.status === MissionStatus.PLANNED &&
      Boolean(this.droneId) &&
      Boolean(this.operator && this.operator.trim().length > 0)
  }

  canStart() {
    return this.status === MissionStatus.AUTHORIZED
  }

  canPause() {
    return this.status === MissionStatus.IN_PROGRESS
  }

  canResume() {
    return this.status === MissionStatus.PAUSED
  }

  canComplete() {
    return this.status === MissionStatus.IN_PROGRESS || this.status === MissionStatus.PAUSED
  }

  canCancel() {
    return this.status !== MissionStatus.COMPLETED && this.status !== MissionStatus.CANCELLED
  }
}
