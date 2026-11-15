/**
 * Resource representation of a farm.
 *
 * @typedef {import('../../shared/infrastructure/base-response.js').BaseResource} BaseResource
 *
 * @typedef {object} FarmResource
 * @property {number} id Unique identifier for the farm.
 * @property {string} name Name of the farm.
 * @property {string} location Location of the farm.
 * @property {number} ownerId Identifier of the owner of the farm.
 * @property {string} [image] URL of the farm image.
 */

/**
 * Response envelope for farm collection queries.
 *
 * @typedef {object} FarmResponse
 * @property {FarmResource[]} farms Array of farm resources included in the response.
 */

/**
 * Resource representation of a parcel.
 *
 * @typedef {object} ParcelResource
 * @property {number} id Unique identifier for the parcel.
 * @property {string} name Name of the parcel.
 * @property {number} area Area of the parcel.
 * @property {string} geometry Geometry of the parcel (GeoJSON as string).
 * @property {number} farmId Identifier of the farm this parcel belongs to.
 * @property {number} cropId Identifier of the crop assigned to this parcel.
 * @property {string} [image] URL of the parcel image.
 */

/**
 * Response envelope for parcel collection queries.
 *
 * @typedef {object} ParcelResponse
 * @property {ParcelResource[]} parcels Array of parcel resources included in the response.
 */

/**
 * Resource representation of a fumigation area.
 *
 * @typedef {object} FumigationAreaResource
 * @property {number} id Unique identifier for the fumigation area.
 * @property {number} parcelId Identifier of the parcel this fumigation area belongs to.
 * @property {string} geometry Geometry of the fumigation area (GeoJSON as string).
 * @property {number} area Area of the fumigation area.
 */

/**
 * Response envelope for fumigation area collection queries.
 *
 * @typedef {object} FumigationAreaResponse
 * @property {FumigationAreaResource[]} fumigationAreas Array of fumigation area resources included in the response.
 */

/**
 * Resource representation of a crop.
 *
 * @typedef {object} CropResource
 * @property {number} id Unique identifier for the crop.
 * @property {string} name Name of the crop.
 * @property {string} variety Variety of the crop.
 */

/**
 * Response envelope for crop collection queries.
 *
 * @typedef {object} CropResponse
 * @property {CropResource[]} crops Array of crop resources included in the response.
 */

/**
 * Resource representation of a user.
 *
 * `password` is not mapped: it stays on the backend.
 *
 * @typedef {object} UserResource
 * @property {number} id Unique identifier for the user.
 * @property {string} username Username of the user.
 * @property {string} email Email of the user.
 * @property {string} role Role assigned to the user.
 */

/**
 * Response envelope for user collection queries.
 *
 * @typedef {object} UserResponse
 * @property {UserResource[]} users Array of user resources included in the response.
 */

export {};