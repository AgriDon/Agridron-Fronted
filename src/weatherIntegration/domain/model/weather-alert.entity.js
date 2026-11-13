/**
 * A weather alert raised for a location, e.g. wind too strong to fly a drone.
 */
export class WeatherAlert {

    /** @type {number} */
    #id;

    /** @type {string} */
    #severity;

    /** @type {string} */
    #message;

    /** @type {string} */
    #createdAt;


    /**
     * @param {number} id
     * @param {string} severity - One of "LOW", "MEDIUM" or "HIGH".
     * @param {string} message
     * @param {string} createdAt - ISO date string.
     */
    constructor(id, severity, message, createdAt) {
        this.#id = id;
        this.#severity = severity;
        this.#message = message;
        this.#createdAt = createdAt;
    }


    /** @returns {number} */
    get id() {
        return this.#id;
    }

    set id(value) {
        this.#id = value;
    }

    /** @returns {string} */
    get severity() {
        return this.#severity;
    }

    set severity(value) {
        this.#severity = value;
    }

    /** @returns {string} */
    get message() {
        return this.#message;
    }

    set message(value) {
        this.#message = value;
    }

    /** @returns {string} */
    get createdAt() {
        return this.#createdAt;
    }

    set createdAt(value) {
        this.#createdAt = value;
    }
}
