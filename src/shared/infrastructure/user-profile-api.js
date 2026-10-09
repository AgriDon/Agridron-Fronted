import { BaseApi } from './base-api.js'
import { ENDPOINTS, buildUrl } from '@/config/env.js'

/**
 * Shared infrastructure service for retrieving and updating user profile settings.
 */
export class UserProfileApi extends BaseApi {
  getUserProfile = async (id = 1) => {
    const res = await this.http.get(`${buildUrl(ENDPOINTS.users)}/${id}`)
    return res.data
  }

  updateUserProfile = async (id = 1, data) => {
    const res = await this.http.patch(`${buildUrl(ENDPOINTS.users)}/${id}`, data)
    return res.data
  }
}
