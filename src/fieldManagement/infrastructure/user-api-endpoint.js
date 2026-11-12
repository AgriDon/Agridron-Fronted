import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint.js';
import { ENDPOINTS, buildUrl } from '../../config/env.js';
import { User } from '../domain/model/user.entity.js';
import { UserAssembler } from './user-assembler.js';

const FALLBACK_USERS = [
    { id: 1, username: 'juanperez', email: 'juan.perez@gmail.com', role: 'FARMER' },
    { id: 2, username: 'pedro', email: 'user@agridron.com', role: 'FARMER' }
];

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

    /**
     * Retrieves all users, falling back to default owner profiles when IAM/Users mock server is offline.
     * @returns {Promise<User[]>}
     */
    async getAll() {
        try {
            return await super.getAll();
        } catch {
            return FALLBACK_USERS.map(resource => this.assembler.toEntityFromResource(resource));
        }
    }
}
