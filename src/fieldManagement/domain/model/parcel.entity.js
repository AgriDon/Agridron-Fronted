/**
 * A parcel: a subdivision of a farm that carries a single crop.
 */
export class Parcel {

    /** @type {number} */
    #id;

    /** @type {string} */
    #name;

    /** @type {number} */
    #area;

    /** @type {string} */
    #geometry;

    /** @type {number} */
    #farmId;

    /** @type {number} */
    #cropId;

    /** @type {import('./crop.entity.js').Crop | null} */
    #crop;

    /** @type {string | null} */
    #image;


    /**
     * @param {number} id
     * @param {string} name
     * @param {number} area
     * @param {string} geometry
     * @param {number} farmId
     * @param {number} cropId
     * @param {string | null} [image]
     * @param {import('./crop.entity.js').Crop | null} [crop] Resolved crop, when the parcel was loaded with it.
     */
    constructor(id, name, area, geometry, farmId, cropId, image = null, crop = null) {
        this.#id = id;
        this.#name = name;
        this.#area = area;
        this.#geometry = geometry;
        this.#farmId = farmId;
        this.#cropId = cropId;
        this.#image = image;
        this.#crop = crop;
    }


    /** @returns {number} */
    get id() {
        return this.#id;
    }

    set id(value) {
        this.#id = value;
    }

    /** @returns {string} */
    get name() {
        return this.#name;
    }

    set name(value) {
        this.#name = value;
    }

    /** @returns {number} */
    get area() {
        return this.#area;
    }

    set area(value) {
        this.#area = value;
    }

    /** @returns {string} */
    get geometry() {
        return this.#geometry;
    }

    set geometry(value) {
        this.#geometry = value;
    }

    /** @returns {number} */
    get farmId() {
        return this.#farmId;
    }

    set farmId(value) {
        this.#farmId = value;
    }

    /** @returns {number} */
    get cropId() {
        return this.#cropId;
    }

    set cropId(value) {
        this.#cropId = value;
    }

    /** @returns {import('./crop.entity.js').Crop | null} */
    get crop() {
        return this.#crop;
    }

    set crop(value) {
        this.#crop = value;
    }

    /** @returns {string | null} */
    get image() {
        return this.#image;
    }

    set image(value) {
        this.#image = value;
    }
}