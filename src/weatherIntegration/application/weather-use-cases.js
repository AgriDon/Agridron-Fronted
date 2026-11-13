import { markRaw } from 'vue';

import { WeatherIntegrationApi } from '../infrastructure/weather-integration-api.js';
import { WeatherAlert } from '../domain/model/weather-alert.entity.js';
import { ALERT_RULES, isSuitable as isSuitableForSpraying } from '../domain/model/weather-rules.js';

/**
 * Weather use cases: the application layer between the views and the API.
 *
 * It loads the weather of a position and evaluates the alert rules. The
 * shared state (the loaded conditions) lives in the weather store.
 */
export class WeatherUseCases {

    /** @type {WeatherIntegrationApi} */
    #api;

    /** @param {WeatherIntegrationApi} [api] */
    constructor(api = new WeatherIntegrationApi()) {
        this.#api = api;
    }

    /**
     * Loads the current weather of a position and evaluates its alerts.
     * The weather and the place name are requested at the same time.
     *
     * @param {number} latitude
     * @param {number} longitude
     * @param {Promise<string>|string} location - Place name, or a promise that resolves to it.
     * @returns {Promise<import('../domain/model/weather-condition.entity.js').WeatherCondition>}
     */
    getWeatherCondition = async (latitude, longitude, location) => {
        const [condition, name] = await Promise.all([
            this.#api.getWeatherConditionByCoordinates(latitude, longitude),
            location,
        ]);
        condition.location = name;
        condition.alerts = this.evaluateConditions(condition);
        return condition;
    };

    /**
     * Gets the place name of a position. If it cannot be obtained, the coordinates are used instead.
     *
     * @param {number} latitude
     * @param {number} longitude
     * @returns {Promise<string>}
     */
    getLocationName = (latitude, longitude) => {
        const coordinates = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
        return this.#api.getLocationName(latitude, longitude)
            .then(name => name || coordinates)
            .catch(() => coordinates);
    };

    /**
     * Generates the alerts of a weather condition from the alert rules.
     *
     * @param {import('../domain/model/weather-condition.entity.js').WeatherCondition} weather
     * @returns {WeatherAlert[]}
     */
    evaluateConditions = (weather) =>
        ALERT_RULES.filter(rule => rule.applies(weather)).map((rule, index) =>
            markRaw(new WeatherAlert(index + 1, rule.severity, rule.message, weather.observedAt)));

    /**
     * Tells whether the conditions are favorable for spraying. It is information, not an alert.
     *
     * @param {import('../domain/model/weather-condition.entity.js').WeatherCondition} weather
     * @returns {boolean}
     */
    isSuitable = (weather) => isSuitableForSpraying(weather);
}
