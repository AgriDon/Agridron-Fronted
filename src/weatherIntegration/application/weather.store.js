import { ref } from 'vue';
import { defineStore } from 'pinia';

import { WeatherUseCases } from './weather-use-cases.js';

/** Reference location used when the user does not share their position. */
export const DEFAULT_LOCATION = { name: 'Cañete', latitude: -13.08, longitude: -76.39 };

/**
 * Shared weather state: the widget, the simulator and the views read the
 * same conditions, so they are kept in one Pinia store.
 */
export const useWeatherStore = defineStore('weather', () => {
    const useCases = new WeatherUseCases();

    /** @type {import('vue').Ref<import('../domain/model/weather-condition.entity.js').WeatherCondition[]>} */
    const weatherConditions = ref([]);

    /** True when the weather shown belongs to the reference location. */
    const usingDefaultLocation = ref(false);

    /** True while the weather is being requested. */
    const loading = ref(false);

    /**
     * Loads the weather of the user's location, or of the reference location if it is not shared.
     */
    const loadWeatherConditions = () => {
        loading.value = true;
        const useDefault = () => loadWeather(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude, DEFAULT_LOCATION.name, true);
        if (!navigator.geolocation) return useDefault();
        navigator.geolocation.getCurrentPosition(({ coords }) => {
            const placeName = useCases.getLocationName(coords.latitude, coords.longitude);
            loadWeather(coords.latitude, coords.longitude, placeName, false);
        }, useDefault);
    };

    const loadWeather = async (latitude, longitude, location, isDefault) => {
        try {
            const condition = await useCases.getWeatherCondition(latitude, longitude, location);
            usingDefaultLocation.value = isDefault;
            weatherConditions.value = [condition];
        } catch {
            // If the API fails there are no conditions and the widget shows "no data".
            weatherConditions.value = [];
        } finally {
            loading.value = false;
        }
    };

    return {
        weatherConditions,
        usingDefaultLocation,
        loading,
        loadWeatherConditions,
        evaluateConditions: useCases.evaluateConditions,
        isSuitable: useCases.isSuitable,
    };
});
