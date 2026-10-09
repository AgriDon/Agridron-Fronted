import { markRaw } from 'vue'
import { Incident } from '../domain/model/incident.entity.js'

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
    return markRaw(
      new Incident(
        resource.id,
        resource.type,
        resource.description,
        resource.occurredAt,
        resource.missionId ?? null
      )
    )
  }

  /**
   * Converts an Incident entity into the JSON resource sent to the backend.
   * @param {Incident} entity
   * @returns {import('./flight-operations-response.js').IncidentResource}
   */
  toResourceFromEntity = (entity) => ({
    id: entity.id,
    type: entity.type,
    description: entity.description,
    occurredAt: entity.occurredAt,
    missionId: entity.missionId
  })
}
