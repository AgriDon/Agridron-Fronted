
import { BaseApiEndpoint } from '@/shared/infrastructure/base-api-endpoint.js';
import { ENDPOINTS, buildUrl } from '@/config/env.js';
import { IncidentAssembler } from './incidentAssembler.js';

export class IncidentApiEndpoint extends BaseApiEndpoint {

    /**
     * @param {import('axios').AxiosInstance} http - The Axios client used for API requests.
     */
    constructor(http) {
        super(http, buildUrl(ENDPOINTS.incidents), new IncidentAssembler());
    }
}