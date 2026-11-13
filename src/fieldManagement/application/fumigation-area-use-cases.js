import { FumigationArea } from '../domain/model/fumigationArea.entity.js';
import { FieldManagementApi } from '../infrastructure/field-management-api.js';

export class FumigationAreaValidationError extends Error {
    constructor(errors) {
        super('FumigationArea validation failed');
        this.name = 'FumigationAreaValidationError';
        this.errors = errors;
    }
}

/**
 * Use cases for Fumigation Areas under Field Management.
 */
export class FumigationAreaUseCases {
    /** @type {FieldManagementApi} */
    #api;

    constructor(api = new FieldManagementApi()) {
        this.#api = api;
    }

    static validate(data) {
        const errors = {};

        const parcelId = Number(data.parcelId);
        if (!data.parcelId || !Number.isFinite(parcelId) || parcelId <= 0) {
            errors.parcelId = 'parcel.fumigation.error.parcelRequired';
        }

        if (!data.geometry?.trim()) {
            errors.geometry = 'parcel.fumigation.error.geometryRequired';
        } else {
            try {
                const parsed = JSON.parse(data.geometry);
                if (parsed.type !== 'Polygon' || !Array.isArray(parsed.coordinates)) {
                    errors.geometry = 'parcel.fumigation.error.geometryInvalid';
                }
            } catch {
                errors.geometry = 'parcel.fumigation.error.geometryInvalid';
            }
        }

        return errors;
    }

    static toEntity(data, id = 0) {
        return new FumigationArea(
            id,
            Number(data.parcelId),
            data.geometry.trim(),
            Number(data.area) || 0
        );
    }

    listFumigationAreas = async (parcelId = null) => {
        const areas = await this.#api.getAllFumigationAreas();
        if (parcelId) {
            return areas.filter(a => Number(a.parcelId) === Number(parcelId));
        }
        return areas;
    };

    createFumigationArea = async (data) => {
        const errors = FumigationAreaUseCases.validate(data);
        if (Object.keys(errors).length > 0) {
            throw new FumigationAreaValidationError(errors);
        }
        return this.#api.createFumigationArea(FumigationAreaUseCases.toEntity(data, 0));
    };

    deleteFumigationArea = async (id) => {
        return this.#api.deleteFumigationArea(id);
    };
}
