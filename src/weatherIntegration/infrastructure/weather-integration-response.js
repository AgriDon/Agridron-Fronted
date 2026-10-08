/**
 * Resource representation of a weather alert.
 *
 * @typedef {object} WeatherAlertResource
 * @property {number} id Unique identifier for the alert.
 * @property {string} severity Severity of the alert: "LOW", "MEDIUM" or "HIGH".
 * @property {string} message Human readable description of the alert.
 * @property {string} createdAt ISO date string of when the alert was raised.
 */

/**
 * Resource representation of a weather condition.
 *
 * @typedef {object} WeatherConditionResource
 * @property {number} id Unique identifier for the weather condition.
 * @property {string} location Location the condition was observed at.
 * @property {number} temperature Temperature in degrees Celsius.
 * @property {number} humidity Relative humidity as a percentage.
 * @property {number} windSpeed Wind speed in kilometers per hour.
 * @property {number} precipitation Precipitation in millimeters.
 * @property {string} observedAt ISO date string of the observation.
 * @property {WeatherAlertResource[]} alerts Alerts raised for this location.
 */

/**
 * Response envelope for weather condition collection queries.
 *
 * @typedef {object} WeatherConditionResponse
 * @property {WeatherConditionResource[]} weatherConditions Array of weather condition resources included in the response.
 */

export {};
