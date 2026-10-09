import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint.js';
import { ENDPOINTS, buildUrl } from '../../config/env.js';
import { WeatherCondition } from '../domain/model/weather-condition.entity.js';
import { WeatherConditionAssembler } from './weather-condition-assembler.js';

/**
 * Endpoint client for weather condition queries.
 *
 * @extends {BaseApiEndpoint<WeatherCondition, import('./weather-integration-response.js').WeatherConditionResource, import('./weather-integration-response.js').WeatherConditionResponse, WeatherConditionAssembler>}
 */
export class WeatherConditionApiEndpoint extends BaseApiEndpoint {

    /**
     * @param {import('axios').AxiosInstance} http - The Axios client used for API requests.
     */
    constructor(http) {
        super(http, buildUrl(ENDPOINTS.weather), new WeatherConditionAssembler());
    }
}
