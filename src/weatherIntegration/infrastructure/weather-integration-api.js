import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { WeatherCondition } from '../domain/model/weather-condition.entity.js';
import { WeatherConditionApiEndpoint } from './weather-condition-api-endpoint.js';
import { ReverseGeocodingApiEndpoint } from './reverse-geocoding-api-endpoint.js';

export class WeatherIntegrationApi extends BaseApi {
    #weatherConditionEndpoint;
    #reverseGeocodingEndpoint;

    constructor() {
        super();

        const http = this.http;

        this.#weatherConditionEndpoint = new WeatherConditionApiEndpoint(http);
        this.#reverseGeocodingEndpoint = new ReverseGeocodingApiEndpoint(http);
    }

    getWeatherConditionByCoordinates = (latitude, longitude) =>
        this.#weatherConditionEndpoint.getByCoordinates(latitude, longitude);

    getLocationName = (latitude, longitude) =>
        this.#reverseGeocodingEndpoint.getLocationName(latitude, longitude);
}
