import { ref } from 'vue';
import { defineStore } from 'pinia';

import { WeatherUseCases } from './weather-use-cases.js';

export const DEFAULT_LOCATION = { name: 'Cañete', latitude: -13.08, longitude: -76.39 };


export const useWeatherStore = defineStore('weather', () => {
    const useCases = new WeatherUseCases();

    const weatherConditions = ref([]);
    const usingDefaultLocation = ref(false);
    const loading = ref(false);

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
        isSuitable: useCases.isSuitable,
    };
});
