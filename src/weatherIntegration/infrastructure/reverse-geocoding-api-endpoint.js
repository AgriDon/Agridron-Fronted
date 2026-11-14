import { ErrorHandlingEnabledBaseType } from '../../shared/infrastructure/error-handling-enabled-base-type.js';
import { REVERSE_GEOCODING_URL } from '../../config/env.js';

export class ReverseGeocodingApiEndpoint extends ErrorHandlingEnabledBaseType {
    constructor(http) {
        super();
        this.http = http;
        this.endpointUrl = REVERSE_GEOCODING_URL;
    }

    async getLocationName(latitude, longitude) {
        try {
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
