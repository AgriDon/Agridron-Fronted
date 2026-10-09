/**
 * The weather observed at a location, with the alerts raised for it.
 */
export class WeatherCondition {

    /** @type {number} */
    #id;

    /** @type {string} */
    #location;

    /** @type {number} */
    #temperature;

    /** @type {number} */
    #humidity;

    /** @type {number} */
    #windSpeed;

    /** @type {number} */
    #precipitation;

    /** @type {string} */
    #observedAt;

    /** @type {import('./weather-alert.entity.js').WeatherAlert[]} */
    #alerts;


    /**
     * @param {number} id
     * @param {string} location
     * @param {number} temperature - Degrees Celsius.
     * @param {number} humidity - Percentage.
     * @param {number} windSpeed - Kilometers per hour.
     * @param {number} precipitation - Millimeters.
     * @param {string} observedAt - ISO date string.
     * @param {import('./weather-alert.entity.js').WeatherAlert[]} [alerts]
     */
    constructor(id, location, temperature, humidity, windSpeed, precipitation, observedAt, alerts = []) {
        this.#id = id;
        this.#location = location;
        this.#temperature = temperature;
        this.#humidity = humidity;
        this.#windSpeed = windSpeed;
        this.#precipitation = precipitation;
        this.#observedAt = observedAt;
        this.#alerts = alerts;
    }


    /** @returns {number} */
    get id() {
        return this.#id;
    }

    set id(value) {
        this.#id = value;
    }

    /** @returns {string} */
    get location() {
        return this.#location;
    }

    set location(value) {
        this.#location = value;
    }

    /** @returns {number} */
    get temperature() {
        return this.#temperature;
    }

    set temperature(value) {
        this.#temperature = value;
    }

    /** @returns {number} */
    get humidity() {
        return this.#humidity;
    }

    set humidity(value) {
        this.#humidity = value;
    }

    /** @returns {number} */
    get windSpeed() {
        return this.#windSpeed;
    }

    set windSpeed(value) {
        this.#windSpeed = value;
    }

    /** @returns {number} */
    get precipitation() {
        return this.#precipitation;
    }

    set precipitation(value) {
        this.#precipitation = value;
    }

    /** @returns {string} */
    get observedAt() {
        return this.#observedAt;
    }

    set observedAt(value) {
        this.#observedAt = value;
    }

    /** @returns {import('./weather-alert.entity.js').WeatherAlert[]} */
    get alerts() {
        return this.#alerts;
    }

    set alerts(value) {
        this.#alerts = value;
    }
}
