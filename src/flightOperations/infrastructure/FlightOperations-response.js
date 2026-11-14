

/** Resource representation of a drone. Look like backend
 * @typedef {Object} DronResource
 * @property {number|string} id
 * @property {string} serialNumber
 * @property {string} model
 * @property {number} capacity
 * @property {string} status
 * @property {string} urlimg
 */

/** Response envelope for drones collection queries
 * @typedef {Object} DronResponse
 * @property {DronResource[]} drones Array of dron resources included in the response.
 */


/**  esource representation of a INCIDENT. Look like backend
 * @typedef {Object} IncidentResource
 * @property {number|string} id
 * @property {number|string} type
 * @property {string} description
 * @property {string} occurredAt
 * @property {number} missionId
 */

/** Response envelope for INCIDENTS collection queries
 * @typedef {Object} IncidentResponse
 * @property {IncidentResource[]} incidents Array of INCIDENTS resources included in the response.
 */


/** Response envelope for operationStatus collection queries
 * @typedef {Object} OperationStatusResource
 * @property {number} latitude
 * @property {number} longitude
 * @property {string} status
 * @property {string|number} timestamp
 * @property {number} missionId
 */

/** Response envelope for operationsStatus collection queries
 * @typedef {Object} OperationStatusResponse
 * @property {OperationStatusResource[]} [operationStatuses]
 */



/**
 * @typedef {Object} MissionResource
 * @property {number|string} id
 * @property {string} code
 * @property {string} scheduledDate
 * @property {number} plannedArea
 * @property {number} treatedArea
 * @property {string} missionStatus
 * @property {DronResource|null} [droneAssigned]
 * @property {IncidentResource[]} [incidents]
 * @property {OperationStatusResource[]} [operationStatus]
 */

/**
 * @typedef {Object} MissionResponse
 * @property {MissionResource[]} missions
 */

