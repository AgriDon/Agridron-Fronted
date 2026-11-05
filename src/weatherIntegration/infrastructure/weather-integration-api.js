import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { WeatherCondition } from '../domain/model/weather-condition.entity.js';
import { WeatherConditionApiEndpoint } from './weather-condition-api-endpoint.js';
import { ReverseGeocodingApiEndpoint } from './reverse-geocoding-api-endpoint.js';

/**
 * Infrastructure facade for the external weather providers.
 *
 * Read only: Open-Meteo gives the weather and BigDataCloud the place name,
 * so the frontend never creates, updates or deletes this data.
 */
export class WeatherIntegrationApi extends BaseApi {

    /** @type {WeatherConditionApiEndpoint} */
    #weatherConditionEndpoint;

    /** @type {ReverseGeocodingApiEndpoint} */
    #reverseGeocodingEndpoint;

    constructor() {
        super();

        const http = this.http;

        this.#weatherConditionEndpoint = new WeatherConditionApiEndpoint(http);
        this.#reverseGeocodingEndpoint = new ReverseGeocodingApiEndpoint(http);
    }

    /**
     * Retrieves the current weather of a position.
     * @param {number} latitude
     * @param {number} longitude
     * @returns {Promise<WeatherCondition>}
     */
    getWeatherConditionByCoordinates = (latitude, longitude) =>
        this.#weatherConditionEndpoint.getByCoordinates(latitude, longitude);

    /**
     * Retrieves the place name of a position.
     * @param {number} latitude
     * @param {number} longitude
     * @returns {Promise<string>}
     */
    getLocationName = (latitude, longitude) =>
        this.#reverseGeocodingEndpoint.getLocationName(latitude, longitude);
}
