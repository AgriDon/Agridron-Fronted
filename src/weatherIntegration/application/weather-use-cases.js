import { markRaw } from 'vue';

import { WeatherIntegrationApi } from '../infrastructure/weather-integration-api.js';
import { WeatherAlert } from '../domain/model/weather-alert.entity.js';
import { ALERT_RULES, isSuitable as isSuitableForSpraying } from '../domain/model/weather-rules.js';

export class WeatherUseCases {
    #api;

    constructor(api = new WeatherIntegrationApi()) {
        this.#api = api;
    }

    getWeatherCondition = async (latitude, longitude, location) => {
        const [condition, name] = await Promise.all([
            this.#api.getWeatherConditionByCoordinates(latitude, longitude),
            location,
        ]);
        condition.location = name;
        condition.alerts = this.evaluateConditions(condition);
        return condition;
    };

    getLocationName = (latitude, longitude) => {
        const coordinates = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
        return this.#api.getLocationName(latitude, longitude)
            .then(name => name || coordinates)
            .catch(() => coordinates);
    };

    evaluateConditions = (weather) =>
        ALERT_RULES.filter(rule => rule.applies(weather)).map((rule, index) =>
            markRaw(new WeatherAlert(index + 1, rule.severity, rule.message, weather.observedAt)));

    isSuitable = (weather) => isSuitableForSpraying(weather);
}
