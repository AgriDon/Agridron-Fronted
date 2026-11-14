import { markRaw } from 'vue';

import { WeatherCondition } from '../domain/model/weather-condition.entity.js';

export class WeatherConditionAssembler {
    toEntityFromResponse = (response) =>
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
