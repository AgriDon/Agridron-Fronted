import { markRaw } from 'vue'
import { Incident } from '../domain/model/incident.entity.js'
import { IncidentSeverity } from '../domain/model/incident-severity.enum.js'

/**
 * Assembler mapping between Incident domain entities and API resources.
 */
export class IncidentAssembler {
  /**
   * Converts the backend response into a list of Incident entities.
   * @param {import('./flight-operations-response.js').IncidentResponse|any[]} response
   * @returns {Incident[]}
   */
  toEntitiesFromResponse = (response) => {
    const list = Array.isArray(response) ? response : (response?.incidents || [])
    return list.map(resource => this.toEntityFromResource(resource))
  }

  /**
   * Converts one backend incident into an Incident entity.
   * @param {import('./flight-operations-response.js').IncidentResource} resource
   * @returns {Incident}
   */
  toEntityFromResource = (resource) => {
    let sev = resource.severity || IncidentSeverity.LOW
    if (typeof sev === 'string') sev = sev.toUpperCase()
    if (!Object.values(IncidentSeverity).includes(sev)) sev = IncidentSeverity.LOW

    return markRaw(
      new Incident(
        resource.id,
        resource.type || 'ANOMALY',
        resource.description || '',
        resource.occurredAt || resource.createdAt || new Date().toISOString(),
        resource.missionId ?? null,
        resource.droneId ?? null,
        sev
      )
    )
  }

  /**
   * Converts an Incident entity into the JSON resource sent to the backend.
   * @param {Incident} entity
   * @returns {any}
   */
  toResourceFromEntity = (entity) => {
    const formatIsoDate = (d) => {
      if (!d) return new Date().toISOString()
      if (d instanceof Date) return d.toISOString()
      if (typeof d === 'string' && d.trim().length > 0) {
        const parsed = new Date(d)
        return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString()
      }
      return new Date().toISOString()
    }

    return {
      id: entity.id,
      type: entity.type,
      description: entity.description,
      occurredAt: formatIsoDate(entity.occurredAt),
      missionId: entity.missionId != null ? Number(entity.missionId) : null,
      droneId: entity.droneId != null ? Number(entity.droneId) : null,
      severity: entity.severity || IncidentSeverity.LOW
    }
  }
}
