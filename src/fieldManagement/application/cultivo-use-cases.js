import { Crop } from '../domain/model/crop.entity.js';
import { FieldManagementApi } from '../infrastructure/field-management-api.js';

/**
 * Raised when a crop payload does not pass validation.
 */
export class CropValidationError extends Error {
    /** @param {Record<string, string>} errors - Field name -> i18n message key. */
    constructor(errors) {
        super('Crop validation failed');
        this.name = 'CropValidationError';
        this.errors = errors;
    }
}

/**
 * Crop use cases: application layer between views and API.
 */
export class CultivoUseCases {

    /** @type {FieldManagementApi} */
    #api;

    /** @param {FieldManagementApi} [api] */
    constructor(api = new FieldManagementApi()) {
        this.#api = api;
    }

    /**
     * @param {{ name?: string, variety?: string }} data
     * @returns {Record<string, string>} Field name -> i18n key. Empty when valid.
     */
    static validate(data) {
        const errors = {};

        if (!data.name?.trim()) {
            errors.name = 'crop.form.error.name-required';
        }

        if (!data.variety?.trim()) {
            errors.variety = 'crop.form.error.variety-required';
        }

        return errors;
    }

    /**
     * @param {{ name?: string, variety?: string }} data
     * @param {number} id
     * @returns {Crop}
     */
    static toEntity(data, id) {
        return new Crop(
            id,
            data.name.trim(),
            data.variety.trim()
        );
    }

    /**
     * @returns {Promise<import('../domain/model/crop.entity.js').Crop[]>}
     */
    listCrops = () => this.#api.getAllCrops();

    /**
     * @param {number|string} id
     * @returns {Promise<import('../domain/model/crop.entity.js').Crop>}
     */
    getCrop = (id) => this.#api.getCropById(id);

    /**
     * @param {{ name?: string, variety?: string }} data
     * @returns {Promise<import('../domain/model/crop.entity.js').Crop>}
     * @throws {CropValidationError}
     */
    createCrop = async (data) => {
        const errors = CultivoUseCases.validate(data);

        if (Object.keys(errors).length > 0) {
            throw new CropValidationError(errors);
        }

        return this.#api.createCrop(CultivoUseCases.toEntity(data, 0));
    };

    /**
     * @param {number|string} id
     * @param {{ name?: string, variety?: string }} data
     * @returns {Promise<import('../domain/model/crop.entity.js').Crop>}
     * @throws {CropValidationError}
     */
    updateCrop = async (id, data) => {
        const errors = CultivoUseCases.validate(data);

        if (Object.keys(errors).length > 0) {
            throw new CropValidationError(errors);
        }

        return this.#api.updateCrop(CultivoUseCases.toEntity(data, Number(id)));
    };

    /**
     * @param {number|string} id
     * @returns {Promise<void>}
     */
    deleteCrop = (id) => this.#api.deleteCrop(id);
}