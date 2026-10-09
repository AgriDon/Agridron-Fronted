/**
 * A platform user, used to attribute farms to an owner.
 *
 * The password is intentionally absent: it never leaves the backend, and the
 * frontend has no use for it.
 */
export class User {

    /** @type {number} */
    #id;

    /** @type {string} */
    #username;

    /** @type {string} */
    #email;

    /** @type {string} */
    #role;


    /**
     * @param {number} id
     * @param {string} username
     * @param {string} email
     * @param {string} role
     */
    constructor(id, username, email, role) {
        this.#id = id;
        this.#username = username;
        this.#email = email;
        this.#role = role;
    }


    /** @returns {number} */
    get id() {
        return this.#id;
    }

    set id(value) {
        this.#id = value;
    }

    /** @returns {string} */
    get username() {
        return this.#username;
    }

    set username(value) {
        this.#username = value;
    }

    /** @returns {string} */
    get email() {
        return this.#email;
    }

    set email(value) {
        this.#email = value;
    }

    /** @returns {string} */
    get role() {
        return this.#role;
    }

    set role(value) {
        this.#role = value;
    }
}