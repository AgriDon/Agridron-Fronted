import { UserProfileApi } from '../infrastructure/user-profile-api.js'

/**
 * Application service for user profile and settings management.
 */
export class UserProfileService {
  #api

  constructor(api = new UserProfileApi()) {
    this.#api = api
  }

  getCurrentUser = (id = 1) => this.#api.getUserProfile(id)
  updateProfile = (id = 1, payload) => this.#api.updateUserProfile(id, payload)
  updatePreferences = (id = 1, preferences) => this.#api.updateUserProfile(id, { preferences })
}
