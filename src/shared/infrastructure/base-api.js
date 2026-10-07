import axios from "axios";

/**
 * Shared infrastructure base class that configures the HTTP client.
 *
 * NOTE: no baseURL on purpose. Every request goes through a concrete endpoint
 * built with buildUrl(ENDPOINTS.x), which already carries the base. Setting
 * baseURL as well would double the prefix ("/api/v1/api/v1/farms") in dev,
 * where the base is relative.
 *
 * @class BaseApi
 */
export class BaseApi {
    /**
     * @private
     * Axios HTTP client instance
     * @type {import('axios').AxiosInstance}
     */
    #http;

    /**
     * Initializes the Axios HTTP client.
     */
    constructor() {
        this.#http = axios.create();

        // Interceptor placeholder for the authentication stage. When the
        // session is implemented, register the token here instead.
    }

    /**
     * Returns the configured Axios HTTP client.
     * @returns {import('axios').AxiosInstance}
     */
    get http() {
        return this.#http;
    }
}