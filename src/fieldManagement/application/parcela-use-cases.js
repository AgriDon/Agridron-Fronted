import { Parcel } from '../domain/model/parcel.entity.js';
import { validateGeoJsonPolygon } from '../domain/services/parcel-geometry.service.js';
import { FieldManagementApi } from '../infrastructure/field-management-api.js';

/**
 * Raised when a parcel payload does not pass validation.
 *
 * Carries the i18n key of each invalid field so the view can render them
 * without knowing anything about the rules.
 */
export class ParcelValidationError extends Error {
    /** @param {Record<string, string>} errors - Field name -> i18n message key. */
    constructor(errors) {
        super('Parcel validation failed');
        this.name = 'ParcelValidationError';
        this.errors = errors;
    }
}

/**
 * Parcel use cases: the application layer between the views and the API.
 */
export class ParcelaUseCases {

    /** @type {FieldManagementApi} */
    #api;

    /** @param {FieldManagementApi} [api] */
    constructor(api = new FieldManagementApi()) {
        this.#api = api;
    }

    /**
     * @param {{ name?: string, area?: number|string, geometry?: string, farmId?: number|string, cropId?: number|string, image?: string, phenologicalStage?: string }} data
     * @returns {Record<string, string>} Field name -> i18n key. Empty when valid.
     */
    static validate(data) {
        const errors = {};

        if (!data.name?.trim()) {
            errors.name = 'parcel.form.error.name-required';
        }

        const area = Number(data.area);

        if (data.area === null || data.area === undefined || data.area === '') {
            errors.area = 'parcel.form.error.area-required';
        } else if (!Number.isFinite(area) || area <= 0) {
            errors.area = 'parcel.form.error.area-min';
        }

        if (!data.geometry?.trim()) {
            errors.geometry = 'parcel.form.error.geometry-required';
        } else if (!validateGeoJsonPolygon(data.geometry)) {
            errors.geometry = 'parcel.form.error.geometry-invalid';
        }

        const farmId = Number(data.farmId);

        if (data.farmId === null || data.farmId === undefined || data.farmId === '') {
            errors.farmId = 'parcel.form.error.farm-required';
        } else if (!Number.isFinite(farmId) || farmId <= 0) {
            errors.farmId = 'parcel.form.error.farm-required';
        }

        const cropId = Number(data.cropId);

        if (data.cropId === null || data.cropId === undefined || data.cropId === '') {
            errors.cropId = 'parcel.form.error.crop-required';
        } else if (!Number.isFinite(cropId) || cropId <= 0) {
            errors.cropId = 'parcel.form.error.crop-required';
        }

        if (data.obstacleNotes && data.obstacleNotes.trim().length > Parcel.MAX_OBSTACLE_NOTES_LENGTH) {
            errors.obstacleNotes = 'parcel.form.error.obstacleNotes-max';
        }

        return errors;
    }

    /**
     * Builds the domain entity out of the validated payload.
     *
     * @param {{ name?: string, area?: number|string, geometry?: string, farmId?: number|string, cropId?: number|string, image?: string, phenologicalStage?: string, obstacleNotes?: string }} data
     * @param {number} id
     * @returns {Parcel}
     */
    static toEntity(data, id) {
        return new Parcel(
            id,
            data.name.trim(),
            Number(data.area) || 0,
            data.geometry.trim(),
            Number(data.farmId),
            Number(data.cropId),
            data.image?.trim() ? data.image.trim() : null,
            null,
            data.phenologicalStage?.trim() ? data.phenologicalStage.trim() : null,
            data.isActive ?? true,
            data.obstacleNotes?.trim() ? data.obstacleNotes.trim() : null
        );
    }

    /**
     * @param {{ includeInactive?: boolean, farmId?: number | string }} [options]
     * @returns {Promise<import('../domain/model/parcel.entity.js').Parcel[]>}
     */
    listParcels = (options = {}) => this.#api.getAllParcels(options);

    /**
     * @param {number|string} id
     * @param {{ includeInactive?: boolean }} [options]
     * @returns {Promise<import('../domain/model/parcel.entity.js').Parcel>}
     */
    getParcel = (id, options = {}) => this.#api.getParcelById(id, options);

    /**
     * @returns {Promise<import('../domain/model/crop.entity.js').Crop[]>}
     */
    listCrops = () => this.#api.getAllCrops();

    /**
     * @returns {Promise<import('../domain/model/farm.entity.js').Farm[]>}
     */
    listFarms = () => this.#api.getAllFarms();

    /**
     * Creates a parcel. The backend assigns the id.
     *
     * @param {{ name?: string, area?: number|string, geometry?: string, farmId?: number|string, cropId?: number|string, image?: string, phenologicalStage?: string }} data
     * @returns {Promise<import('../domain/model/parcel.entity.js').Parcel>}
     * @throws {ParcelValidationError}
     */
    createParcel = async (data) => {
        const errors = ParcelaUseCases.validate(data);

        if (Object.keys(errors).length > 0) {
            throw new ParcelValidationError(errors);
        }

        return this.#api.createParcel(ParcelaUseCases.toEntity(data, 0));
    };

    /**
     * @param {number|string} id
     * @param {{ name?: string, area?: number|string, geometry?: string, farmId?: number|string, cropId?: number|string, image?: string, phenologicalStage?: string }} data
     * @returns {Promise<import('../domain/model/parcel.entity.js').Parcel>}
     * @throws {ParcelValidationError}
     */
    updateParcel = async (id, data) => {
        const errors = ParcelaUseCases.validate(data);

        if (Object.keys(errors).length > 0) {
            throw new ParcelValidationError(errors);
        }

        return this.#api.updateParcel(ParcelaUseCases.toEntity(data, Number(id)));
    };

    /**
     * Deactivates (soft-deletes) a parcel, preserving historical mission records.
     *
     * @param {number|string} id
     * @returns {Promise<void>}
     */
    deactivateParcel = (id) => this.#api.deleteParcel(id);

    /**
     * Alias kept for backwards compatibility.
     *
     * @param {number|string} id
     * @returns {Promise<void>}
     */
    deleteParcel = (id) => this.deactivateParcel(id);

    /**
     * Reactivates an inactive parcel.
     *
     * @param {number|string} id
     * @returns {Promise<import('../domain/model/parcel.entity.js').Parcel>}
     */
    activateParcel = (id) => this.#api.activateParcel(id);
}
