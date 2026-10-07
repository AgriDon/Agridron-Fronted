import { markRaw } from 'vue';

import { WeatherAlert } from '../domain/model/weather-alert.entity.js';
import { WeatherCondition } from '../domain/model/weather-condition.entity.js';

/**
 * Assembler for the weather condition resource.
 *
 * Alerts are embedded in each condition, so they are mapped here as well
 * instead of having an assembler of their own.
 *
 * @implements {import('../../shared/infrastructure/base-assembler.js').BaseAssembler<WeatherCondition, import('./weather-integration-response.js').WeatherConditionResource, import('./weather-integration-response.js').WeatherConditionResponse>}
 */
export class WeatherConditionAssembler {

    /**
     * @param {import('./weather-integration-response.js').WeatherConditionResponse} response
     * @returns {WeatherCondition[]}
     */
    toEntitiesFromResponse = (response) =>
        response.weatherConditions.map(resource => this.toEntityFromResource(resource));

    /**
     * @param {import('./weather-integration-response.js').WeatherConditionResource} resource
     * @returns {WeatherCondition}
     */
    toEntityFromResource = (resource) => {
        // markRaw: domain entities expose getters backed by private fields (#id).
        // Vue wraps objects placed in ref()/reactive() in a Proxy, and reading a
        // private field through a Proxy throws "object is not the right class".
        // Marking the instance as raw keeps it out of the reactivity system.
        const alerts = (resource.alerts ?? []).map(alert =>
            markRaw(new WeatherAlert(alert.id, alert.severity, alert.message, alert.createdAt)));

        return markRaw(new WeatherCondition(
            resource.id,
            resource.location,
            resource.temperature,
            resource.humidity,
            resource.windSpeed,
            resource.precipitation,
            resource.observedAt,
            alerts
        ));
    };

    /**
     * @param {WeatherCondition} entity
     * @returns {import('./weather-integration-response.js').WeatherConditionResource}
     */
    toResourceFromEntity = (entity) => ({
        id: entity.id,
        location: entity.location,
        temperature: entity.temperature,
        humidity: entity.humidity,
        windSpeed: entity.windSpeed,
        precipitation: entity.precipitation,
        observedAt: entity.observedAt,
        alerts: entity.alerts.map(alert =>
            ({ id: alert.id, severity: alert.severity, message: alert.message, createdAt: alert.createdAt }))
    });
}
