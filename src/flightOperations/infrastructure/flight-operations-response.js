/**
 * Resource representation of a drone.
 * @typedef {Object} DronResource
 * @property {number|string} id
 * @property {string} serialNumber
 * @property {string} model
 * @property {number} capacity
 * @property {string} status
 * @property {string} [urlimg]
 * @property {string} [image]
 */

/**
 * Response envelope for drones collection queries.
 * @typedef {Object} DronResponse
 * @property {DronResource[]} drones Array of dron resources included in the response.
 */

/**
 * Resource representation of an Incident.
 * @typedef {Object} IncidentResource
 * @property {number|string} id
 * @property {string} type
 * @property {string} description
 * @property {string} occurredAt
 * @property {number|null} [missionId]
 */

/**
 * Response envelope for incidents collection queries.
 * @typedef {Object} IncidentResponse
 * @property {IncidentResource[]} incidents Array of incident resources included in the response.
 */

/**
 * Resource representation of an Operation Status.
 * @typedef {Object} OperationStatusResource
 * @property {number} latitude
 * @property {number} longitude
 * @property {string} status
 * @property {string|number} timestamp
 * @property {number|null} [missionId]
 */

/**
 * Response envelope for operations status collection queries.
 * @typedef {Object} OperationStatusResponse
 * @property {OperationStatusResource[]} [operationStatuses]
 */
