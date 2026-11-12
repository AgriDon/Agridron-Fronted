import { BaseApi } from './base-api.js'
import { ENDPOINTS, buildUrl } from '@/config/env.js'

const DEFAULT_USER_PROFILE = {
  id: 1,
  username: 'juanperez',
  name: 'Juan Pérez',
  email: 'juan.perez@gmail.com',
  role: 'Agricultor',
  avatar: 'https://img.magnific.com/foto-gratis/agricultor-que-usa-pala-cavar-suelo-sus-campos-arroz_1150-17239.jpg?semt=ais_hybrid&w=740&q=80',
  preferences: {
    emailNotifications: true,
    appNotifications: true,
    weatherAlerts: true
  }
}

/**
 * Shared infrastructure service for retrieving and updating user profile settings.
 */
export class UserProfileApi extends BaseApi {
  getUserProfile = async (id = 1) => {
    try {
      const res = await this.http.get(`${buildUrl(ENDPOINTS.users)}/${id}`)
      return res.data
    } catch {
      const cached = localStorage.getItem(`agridron_user_profile_${id}`)
      return cached ? JSON.parse(cached) : { ...DEFAULT_USER_PROFILE, id }
    }
  }

  updateUserProfile = async (id = 1, data) => {
    try {
      const res = await this.http.patch(`${buildUrl(ENDPOINTS.users)}/${id}`, data)
      return res.data
    } catch {
      const current = await this.getUserProfile(id)
      const updated = { ...current, ...data }
      localStorage.setItem(`agridron_user_profile_${id}`, JSON.stringify(updated))
      return updated
    }
  }
}
