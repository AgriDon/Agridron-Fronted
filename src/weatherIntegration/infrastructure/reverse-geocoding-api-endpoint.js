import { ErrorHandlingEnabledBaseType } from '../../shared/infrastructure/error-handling-enabled-base-type.js';
import { REVERSE_GEOCODING_URL } from '../../config/env.js';

/**
 * Endpoint client for the BigDataCloud reverse geocoding endpoint.
 *
 * It only returns a place name, so it has no entity or assembler.
 */
export class ReverseGeocodingApiEndpoint extends ErrorHandlingEnabledBaseType {

    /**
     * @param {import('axios').AxiosInstance} http - The Axios client used for API requests.
     */
    constructor(http) {
        super();
        this.http = http;
        this.endpointUrl = REVERSE_GEOCODING_URL;
    }

    /**
     * Gets the city, district or locality name of a position.
     *
     * @param {number} latitude
     * @param {number} longitude
     * @returns {Promise<string>} The place name, or an empty string if the provider has none.
     */
    async getLocationName(latitude, longitude) {
        try {
            /** @type {{ data: import('./weather-integration-response.js').LocationNameResponse }} */
            const response = await this.http.get(this.endpointUrl, {
                params: { latitude, longitude, localityLanguage: 'es' },
            });
            const place = response.data;
            return place.city || place.locality || place.principalSubdivision || '';
        } catch (error) {
            return this.handleError('Failed to fetch location name')(error);
        }
    }
}
