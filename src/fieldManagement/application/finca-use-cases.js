import { Farm } from '../domain/model/farm.entity.js';
import { FieldManagementApi } from '../infrastructure/field-management-api.js';

/**
 * Raised when a farm payload does not pass validation.
 *
 * Carries the i18n key of each invalid field so the view can render them
 * without knowing anything about the rules.
 */
export class FarmValidationError extends Error {
    /** @param {Record<string, string>} errors - Field name -> i18n message key. */
    constructor(errors) {
        super('Farm validation failed');
        this.name = 'FarmValidationError';
        this.errors = errors;
    }
}

/**
 * Farm use cases: the application layer between the views and the API.
 *
 * The views never touch the infrastructure directly, which keeps the
 * validation rules in one place instead of spread across components.
 */
export class FincaUseCases {

    /** @type {FieldManagementApi} */
    #api;

    /** @param {FieldManagementApi} [api] */
    constructor(api = new FieldManagementApi()) {
        this.#api = api;
    }

    /**
     * @param {{ name?: string, location?: string, ownerId?: number|string, image?: string }} data
     * @returns {Record<string, string>} Field name -> i18n key. Empty when valid.
     */
    static validate(data) {
        const errors = {};

        if (!data.name?.trim()) {
            errors.name = 'farm.form.error.name-required';
        }

        if (!data.location?.trim()) {
            errors.location = 'farm.form.error.location-required';
        }

        const ownerId = Number(data.ownerId);

        if (data.ownerId === null || data.ownerId === undefined || data.ownerId === '') {
            errors.ownerId = 'farm.form.error.ownerId-required';
        } else if (!Number.isFinite(ownerId)) {
            errors.ownerId = 'farm.form.error.ownerId-min';
        } else if (ownerId <= 0) {
            errors.ownerId = 'farm.form.error.ownerId-min';
        }

        return errors;
    }

    /**
     * Builds the domain entity out of the validated payload.
     *
     * `ownerId` is coerced to a number: a text input would otherwise persist a
     * string and break later numeric comparisons.
     *
     * @param {{ name?: string, location?: string, ownerId?: number|string, image?: string }} data
     * @param {number} id
     * @returns {Farm}
     */
    static toEntity(data, id) {
        return new Farm(
            id,
            data.name.trim(),
            data.location.trim(),
            Number(data.ownerId),
            [],
            data.image?.trim() ? data.image.trim() : null
        );
    }

    /**
     * @returns {Promise<import('../domain/model/farm.entity.js').Farm[]>}
     */
    listFarms = () => this.#api.getAllFarms();

    /**
     * @param {number|string} id
     * @returns {Promise<import('../domain/model/farm.entity.js').Farm>}
     */
    getFarm = (id) => this.#api.getFarmById(id);

    /**
     * @returns {Promise<import('../domain/model/user.entity.js').User[]>}
     */
    listUsers = () => this.#api.getAllUsers();

    /**
     * Creates a farm. The backend assigns the id.
     *
     * @param {{ name?: string, location?: string, ownerId?: number|string, image?: string }} data
     * @returns {Promise<import('../domain/model/farm.entity.js').Farm>}
     * @throws {FarmValidationError}
     */
    createFarm = async (data) => {
        const errors = FincaUseCases.validate(data);

        if (Object.keys(errors).length > 0) {
            throw new FarmValidationError(errors);
        }

        return this.#api.createFarm(FincaUseCases.toEntity(data, 0));
    };

    /**
     * @param {number|string} id
     * @param {{ name?: string, location?: string, ownerId?: number|string, image?: string }} data
     * @returns {Promise<import('../domain/model/farm.entity.js').Farm>}
     * @throws {FarmValidationError}
     */
    updateFarm = async (id, data) => {
        const errors = FincaUseCases.validate(data);

        if (Object.keys(errors).length > 0) {
            throw new FarmValidationError(errors);
        }

        return this.#api.updateFarm(FincaUseCases.toEntity(data, Number(id)));
    };

    /**
     * @param {number|string} id
     * @returns {Promise<void>}
     */
    deleteFarm = (id) => this.#api.deleteFarm(id);
}