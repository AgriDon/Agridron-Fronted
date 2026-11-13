import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint.js';
import { ENDPOINTS, WEATHER_API_BASE_URL } from '../../config/env.js';
import { WeatherCondition } from '../domain/model/weather-condition.entity.js';
import { WeatherConditionAssembler } from './weather-condition-assembler.js';

/**
 * Endpoint client for the Open-Meteo forecast endpoint.
 *
 * The URL is built with WEATHER_API_BASE_URL instead of buildUrl(), because
 * this is an external provider and not the AgriDron API.
 */
export class WeatherConditionApiEndpoint extends BaseApiEndpoint {

    /**
     * @param {import('axios').AxiosInstance} http - The Axios client used for API requests.
     */
    constructor(http) {
        super(http, `${WEATHER_API_BASE_URL}${ENDPOINTS.weather}`, new WeatherConditionAssembler());
    }

    /**
     * Gets the current weather of a location and the rain probability of the next hour.
     *
     * @param {number} latitude
     * @param {number} longitude
     * @returns {Promise<WeatherCondition>} The current weather condition, without location name or alerts.
     */
    async getByCoordinates(latitude, longitude) {
        try {
            const response = await this.http.get(this.endpointUrl, {
                params: {
                    latitude,
                    longitude,
                    current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation',
                    hourly: 'precipitation_probability',
                    forecast_hours: 1,
                    timezone: 'auto',
                },
            });
            return this.assembler.toEntityFromResponse(response.data);
        } catch (error) {
            return this.handleError('Failed to fetch weather condition')(error);
        }
    }
}
