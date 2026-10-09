/**
 * Domain entity representing an Incident in Flight Operations.
 */
export class Incident {
  id
  type
  description
  occurredAt
  missionId

  constructor(id, type, description, occurredAt, missionId = null) {
    this.id = id
    this.type = type
    this.description = description
    this.occurredAt = occurredAt
    this.missionId = missionId
  }
}
