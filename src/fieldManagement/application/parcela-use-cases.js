import { Parcel } from '../domain/model/parcel.entity.js';
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
     * @param {{ name?: string, area?: number|string, geometry?: string, farmId?: number|string, cropId?: number|string, image?: string }} data
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

        return errors;
    }

    /**
     * Builds the domain entity out of the validated payload.
     *
     * area, farmId and cropId are coerced to numbers: a text input would
     * otherwise persist strings and break later numeric comparisons.
     *
     * @param {{ name?: string, area?: number|string, geometry?: string, farmId?: number|string, cropId?: number|string, image?: string }} data
     * @param {number} id
     * @returns {Parcel}
     */
    static toEntity(data, id) {
        return new Parcel(
            id,
            data.name.trim(),
            Number(data.area),
            data.geometry.trim(),
            Number(data.farmId),
            Number(data.cropId),
            data.image?.trim() ? data.image.trim() : null,
            null
        );
    }

    /**
     * @returns {Promise<import('../domain/model/parcel.entity.js').Parcel[]>}
     */
    listParcels = () => this.#api.getAllParcels();

    /**
     * @param {number|string} id
     * @returns {Promise<import('../domain/model/parcel.entity.js').Parcel>}
     */
    getParcel = (id) => this.#api.getParcelById(id);

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
     * @param {{ name?: string, area?: number|string, geometry?: string, farmId?: number|string, cropId?: number|string, image?: string }} data
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
     * @param {{ name?: string, area?: number|string, geometry?: string, farmId?: number|string, cropId?: number|string, image?: string }} data
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
     * @param {number|string} id
     * @returns {Promise<void>}
     */
    deleteParcel = (id) => this.#api.deleteParcel(id);
}