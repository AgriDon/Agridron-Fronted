import { markRaw } from 'vue';

import { User } from '../domain/model/user.entity.js';

/**
 * Assembler for the user resource.
 *
 * The password field of the mock backend is deliberately dropped here.
 *
 * @implements {import('../../shared/infrastructure/base-assembler.js').BaseAssembler<User, import('./field-management-response.js').UserResource, import('./field-management-response.js').UserResponse>}
 */
export class UserAssembler {

    /**
     * @param {import('./field-management-response.js').UserResponse} response
     * @returns {User[]}
     */
    toEntitiesFromResponse = (response) =>
        response.users.map(resource => this.toEntityFromResource(resource));

    /**
     * @param {import('./field-management-response.js').UserResource} resource
     * @returns {User}
     */
    toEntityFromResource = (resource) =>
        // markRaw: see farm-assembler.js for why entities must stay out of
        // Vue's reactivity system.
        markRaw(new User(resource.id, resource.username, resource.email, resource.role));

    /**
     * @param {User} entity
     * @returns {import('./field-management-response.js').UserResource}
     */
    toResourceFromEntity = (entity) =>
        ({ id: entity.id, username: entity.username, email: entity.email, role: entity.role });
}