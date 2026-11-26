export class WeatherAlert {
    #id;
    #severity;
    #message;
    #createdAt;

    constructor(id, severity, message, createdAt) {
        this.#id = id;
        this.#severity = severity;
        this.#message = message;
        this.#createdAt = createdAt;
    }

    get id() {
        return this.#id;
    }

    set id(value) {
        this.#id = value;
    }

    get severity() {
        return this.#severity;
    }

    set severity(value) {
        this.#severity = value;
    }

    get message() {
        return this.#message;
    }

    set message(value) {
        this.#message = value;
    }

    get createdAt() {
        return this.#createdAt;
    }

    set createdAt(value) {
        this.#createdAt = value;
    }
}
