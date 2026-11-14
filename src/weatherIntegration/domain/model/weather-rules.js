export const ALERT_RULES = [
    { severity: 'HIGH', message: 'weather.alert.wind', applies: weather => weather.windSpeed > 15 },
    { severity: 'HIGH', message: 'weather.alert.rain', applies: weather => weather.precipitation > 0 },
    { severity: 'MEDIUM', message: 'weather.alert.moderateWind', applies: weather => weather.windSpeed > 10 && weather.windSpeed <= 15 },
    { severity: 'LOW', message: 'weather.alert.calmWind', applies: weather => weather.windSpeed < 3 },
    { severity: 'MEDIUM', message: 'weather.alert.rainLikely', applies: weather => weather.precipitationProbability >= 70 },
    { severity: 'LOW', message: 'weather.alert.rainPossible', applies: weather => weather.precipitationProbability >= 40 && weather.precipitationProbability < 70 },
    { severity: 'MEDIUM', message: 'weather.alert.heat', applies: weather => weather.temperature > 30 },
    { severity: 'LOW', message: 'weather.alert.lowHumidity', applies: weather => weather.humidity < 50 },
];

export const isSuitable = (weather) =>
    weather.windSpeed <= 15 && weather.temperature < 28 && weather.precipitation === 0;
