


import { BaseApiEndpoint } from '@/shared/infrastructure/base-api-endpoint.js';
import { ENDPOINTS, buildUrl } from '@/config/env.js';
import{OperationStatusAssembler} from "@/flightOperations/infrastructure/operationStatusAssembler.js";

export class OperationStatusApiEndpoint extends BaseApiEndpoint {

    /**
     * @param {import('axios').AxiosInstance} http - The Axios client used for API requests.
     */
    constructor(http) {
        super(http, buildUrl(ENDPOINTS.operationStatus), new OperationStatusAssembler());
    }
}