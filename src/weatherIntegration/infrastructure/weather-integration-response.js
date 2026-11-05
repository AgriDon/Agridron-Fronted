/**
 * Current conditions returned by the Open-Meteo forecast endpoint.
 *
 * @typedef {object} WeatherCurrentResource
 * @property {string} time Local ISO date string of the observation.
 * @property {number} temperature_2m Temperature in degrees Celsius.
 * @property {number} relative_humidity_2m Relative humidity as a percentage.
 * @property {number} wind_speed_10m Wind speed in kilometers per hour.
 * @property {number} precipitation Precipitation in millimeters.
 */

/**
 * Hourly values returned by the Open-Meteo forecast endpoint.
 *
 * @typedef {object} WeatherHourlyResource
 * @property {number[]} precipitation_probability Rain probability per hour, as a percentage.
 */

/**
 * Current conditions and next-hour rain probability returned by the Open-Meteo forecast endpoint.
 *
 * @typedef {object} WeatherConditionResponse
 * @property {WeatherCurrentResource} current Current weather values.
 * @property {WeatherHourlyResource} hourly Hourly forecast values (only the next hour is requested).
 */

/**
 * Place returned by the BigDataCloud reverse geocoding endpoint.
 *
 * @typedef {object} LocationNameResponse
 * @property {string} city City name.
 * @property {string} locality District or locality name.
 * @property {string} principalSubdivision Region name.
 */

export {};
