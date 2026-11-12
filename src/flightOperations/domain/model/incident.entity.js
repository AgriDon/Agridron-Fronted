import { IncidentSeverity } from './incident-severity.enum.js'

/**
 * Domain entity representing an Incident or telemetry anomaly in Flight Operations.
 */
export class Incident {
  id
  type
  description
  occurredAt
  missionId
  droneId
  severity

  /**
   * @param {number|null} [id=null]
   * @param {string} [type='']
   * @param {string} [description='']
   * @param {string} [occurredAt='']
   * @param {number|null} [missionId=null]
   * @param {number|null} [droneId=null]
   * @param {string} [severity=IncidentSeverity.LOW]
   */
  constructor(
    id = null,
    type = '',
    description = '',
    occurredAt = '',
    missionId = null,
    droneId = null,
    severity = IncidentSeverity.LOW
  ) {
    this.id = id != null ? Number(id) : null
    this.type = type || 'ANOMALY'
    this.description = description || ''
    this.occurredAt = occurredAt || new Date().toISOString()
    this.missionId = missionId != null ? Number(missionId) : null
    this.droneId = droneId != null ? Number(droneId) : null
    this.severity = severity || IncidentSeverity.LOW
  }
}
