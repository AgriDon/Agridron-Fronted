export class WeatherCondition {
    #id;
    #location;
    #temperature;
    #humidity;
    #windSpeed;
    #precipitation;
    #precipitationProbability;
    #observedAt;
    #alerts;

    constructor(id, location, temperature, humidity, windSpeed, precipitation, precipitationProbability, observedAt, alerts = []) {
        this.#id = id;
        this.#location = location;
        this.#temperature = temperature;
        this.#humidity = humidity;
        this.#windSpeed = windSpeed;
        this.#precipitation = precipitation;
        this.#precipitationProbability = precipitationProbability;
        this.#observedAt = observedAt;
        this.#alerts = alerts;
    }

    get id() {
        return this.#id;
    }

    set id(value) {
        this.#id = value;
    }

    get location() {
        return this.#location;
    }

    set location(value) {
        this.#location = value;
    }

    get temperature() {
        return this.#temperature;
    }

    set temperature(value) {
        this.#temperature = value;
    }

    get humidity() {
        return this.#humidity;
    }

    set humidity(value) {
        this.#humidity = value;
    }

    get windSpeed() {
        return this.#windSpeed;
    }

    set windSpeed(value) {
        this.#windSpeed = value;
    }

    get precipitation() {
        return this.#precipitation;
    }

    set precipitation(value) {
        this.#precipitation = value;
    }

    get precipitationProbability() {
        return this.#precipitationProbability;
    }

    set precipitationProbability(value) {
        this.#precipitationProbability = value;
    }

    get observedAt() {
        return this.#observedAt;
    }

    set observedAt(value) {
        this.#observedAt = value;
    }

    get alerts() {
        return this.#alerts;
    }

    set alerts(value) {
        this.#alerts = value;
    }
}
