import { WeatherIntegrationApi } from '../infrastructure/weather-integration-api.js';

/**
 * Weather use cases: the application layer between the views and the API.
 *
 * There are no forms in this module, so there is nothing to validate; the
 * class still exists so the views never touch the infrastructure directly.
 */
export class WeatherUseCases {

    /** @type {WeatherIntegrationApi} */
    #api;

    /** @param {WeatherIntegrationApi} [api] */
    constructor(api = new WeatherIntegrationApi()) {
        this.#api = api;
    }

    /**
     * @returns {Promise<import('../domain/model/weather-condition.entity.js').WeatherCondition[]>}
     */
    listWeatherConditions = () => this.#api.getAllWeatherConditions();
}
