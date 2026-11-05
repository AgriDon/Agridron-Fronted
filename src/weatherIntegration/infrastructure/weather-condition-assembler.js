import { markRaw } from 'vue';

import { WeatherCondition } from '../domain/model/weather-condition.entity.js';

/**
 * Assembler for the Open-Meteo forecast response.
 *
 * The weather comes from an external read-only provider, so only the
 * response -> entity direction is needed. The location name and the alerts
 * are filled in later by the use cases.
 */
export class WeatherConditionAssembler {

    /**
     * @param {import('./weather-integration-response.js').WeatherConditionResponse} response
     * @returns {WeatherCondition}
     */
    toEntityFromResponse = (response) =>
        // markRaw: domain entities expose getters backed by private fields (#id).
        // Vue wraps objects placed in ref()/reactive() in a Proxy, and reading a
        // private field through a Proxy throws "object is not the right class".
        // Marking the instance as raw keeps it out of the reactivity system.
        markRaw(new WeatherCondition(
            1,
            '',
            response.current.temperature_2m,
            response.current.relative_humidity_2m,
            response.current.wind_speed_10m,
            response.current.precipitation,
            response.hourly.precipitation_probability[0] ?? 0,
            response.current.time,
            []
        ));
}
