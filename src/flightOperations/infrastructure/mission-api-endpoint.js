


import { BaseApiEndpoint } from '@/shared/infrastructure/base-api-endpoint.js';
import { ENDPOINTS, buildUrl } from '@/config/env.js';
import { MissionAssembler } from '@/flightOperations/infrastructure/mission-assembler.js';

export class MissionApiEndpoint extends BaseApiEndpoint {
    /**
     * @param {import('axios').AxiosInstance} http
     */
    constructor(http) {
        super(http, buildUrl(ENDPOINTS.missions), new MissionAssembler());
    }
}