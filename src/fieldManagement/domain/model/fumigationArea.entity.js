/**
 * A fumigation area: the geometry a drone mission treats as a treatment unit.
 */
export class FumigationArea {

    /** @type {number} */
    #id;

    /** @type {number} */
    #parcelId;

    /** @type {string} */
    #geometry;

    /** @type {number} */
    #area;


    /**
     * @param {number} id
     * @param {number} parcelId
     * @param {string} geometry
     * @param {number} area
     */
    constructor(id, parcelId, geometry, area) {
        this.#id = id;
        this.#parcelId = parcelId;
        this.#geometry = geometry;
        this.#area = area;
    }


    /** @returns {number} */
    get id() {
        return this.#id;
    }

    set id(value) {
        this.#id = value;
    }

    /** @returns {number} */
    get parcelId() {
        return this.#parcelId;
    }

    set parcelId(value) {
        this.#parcelId = value;
    }

    /** @returns {string} */
    get geometry() {
        return this.#geometry;
    }

    set geometry(value) {
        this.#geometry = value;
    }

    /** @returns {number} */
    get area() {
        return this.#area;
    }

    set area(value) {
        this.#area = value;
    }
}