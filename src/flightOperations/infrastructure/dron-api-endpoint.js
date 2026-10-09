

import {BaseApiEndpoint} from "@/shared/infrastructure/base-api-endpoint.js";
import {ENDPOINTS , buildUrl} from "@/config/env.js";
import {DronAssembler} from '@/flightOperations/infrastructure/dronAssembler.js';

export class DronApiEndpoint extends BaseApiEndpoint {
    /**
     * @param {import('axios').AxiosInstance} http - The Axios client used for API requests.
     * http: Axios is used to aks information
     * This function has instance of assembler, save and use it later.
     */
    constructor(http) {
        super(http, buildUrl(ENDPOINTS.drones), new DronAssembler());
    }


}
