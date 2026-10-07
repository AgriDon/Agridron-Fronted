/**
 * An agricultural farm, the top level entity of the field management module.
 */
export class Farm {

    /** @type {number} */
    #id;

    /** @type {string} */
    #name;

    /** @type {string} */
    #location;

    /** @type {number} */
    #ownerId;

    /** @type {import('./parcel.entity.js').Parcel[]} */
    #parcel;

    /** @type {string | null} */
    #image;


    /**
     * @param {number} id
     * @param {string} name
     * @param {string} location
     * @param {number} ownerId
     * @param {import('./parcel.entity.js').Parcel[]} [parcel]
     * @param {string | null} [image]
     */
    constructor(id, name, location, ownerId, parcel = [], image = null) {
        this.#id = id;
        this.#name = name;
        this.#location = location;
        this.#ownerId = ownerId;
        this.#parcel = parcel;
        this.#image = image;
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

    /** @returns {string} */
    get location() {
        return this.#location;
    }

    set location(value) {
        this.#location = value;
    }

    /** @returns {number} */
    get ownerId() {
        return this.#ownerId;
    }

    set ownerId(value) {
        this.#ownerId = value;
    }

    /** @returns {import('./parcel.entity.js').Parcel[]} */
    get parcel() {
        return this.#parcel;
    }

    set parcel(value) {
        this.#parcel = value;
    }

    /** @returns {string | null} */
    get image() {
        return this.#image;
    }

    set image(value) {
        this.#image = value;
    }
}