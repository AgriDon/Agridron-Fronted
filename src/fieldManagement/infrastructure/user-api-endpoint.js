import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint.js';
import { ENDPOINTS, buildUrl } from '../../config/env.js';
import { User } from '../domain/model/user.entity.js';
import { UserAssembler } from './user-assembler.js';

/**
 * Endpoint client for user queries.
 *
 * @extends {BaseApiEndpoint<User, import('./field-management-response.js').UserResource, import('./field-management-response.js').UserResponse, UserAssembler>}
 */
export class UserApiEndpoint extends BaseApiEndpoint {

    /**
     * @param {import('axios').AxiosInstance} http - The Axios client used for API requests.
     */
    constructor(http) {
        super(http, buildUrl(ENDPOINTS.users), new UserAssembler());
    }
}