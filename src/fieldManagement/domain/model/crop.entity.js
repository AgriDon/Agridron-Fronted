/**
 * A crop planted on a parcel.
 */
export class Crop {

    /** @type {number} */
    #id;

    /** @type {string | null} */
    #name;

    /** @type {string | null} */
    #variety;


    /**
     * @param {number} id
     * @param {string | null} name
     * @param {string | null} variety
     */
    constructor(id, name, variety) {
        this.#id = id;
        this.#name = name;
        this.#variety = variety;
    }


    /** @returns {number} */
    get id() {
        return this.#id;
    }

    set id(value) {
        this.#id = value;
    }

    /** @returns {string | null} */
    get name() {
        return this.#name;
    }

    set name(value) {
        this.#name = value;
    }

    /** @returns {string | null} */
    get variety() {
        return this.#variety;
    }

    set variety(value) {
        this.#variety = value;
    }

    /** @returns {string} */
    getInformation() {
        return `${this.#name ?? 'Unknown'} (${this.#variety ?? 'N/A'})`;
    }


}