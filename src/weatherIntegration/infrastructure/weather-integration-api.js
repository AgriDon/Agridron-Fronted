import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { WeatherCondition } from '../domain/model/weather-condition.entity.js';
import { WeatherConditionApiEndpoint } from './weather-condition-api-endpoint.js';

/**
 * Infrastructure facade for weather condition endpoint operations.
 *
 * Read only: the weather data comes from an external provider, so the
 * frontend never creates, updates or deletes it.
 */
export class WeatherIntegrationApi extends BaseApi {

    /** @type {WeatherConditionApiEndpoint} */
    #weatherConditionEndpoint;

    constructor() {
        super();

        const http = this.http;

        this.#weatherConditionEndpoint = new WeatherConditionApiEndpoint(http);
    }

    /**
     * Retrieves all weather conditions.
     * @returns {Promise<WeatherCondition[]>} Promise with the weather condition collection.
     */
    getAllWeatherConditions = () => this.#weatherConditionEndpoint.getAll();
}
