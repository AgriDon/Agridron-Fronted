import { BaseApi } from '@/shared/infrastructure/base-api.js'
import { ENDPOINTS, buildUrl } from '@/config/env.js'
import { SignInRequest } from '../domain/model/sign-in.request.js'
import { SignUpRequest } from '../domain/model/sign-up.request.js'
import { UserAssembler } from './user.assembler.js'

/**
 * Converts an Axios error into an `Error` instance enriched with RFC 7807 metadata.
 *
 * @param {any} error Original Axios error.
 * @param {string} fallbackMessage Default message if the response carries no problem details.
 * @returns {Error & { status: number|null, title: string, detail: string }}
 */
const toServiceError = (error, fallbackMessage) => {
  const problem = UserAssembler.extractProblemDetails(error, fallbackMessage)
  const err = new Error(problem.message)
  err.status = problem.status
  err.title = problem.title
  err.detail = problem.detail
  return err
}

/**
 * HTTP infrastructure service for IAM authentication and user retrieval endpoints.
 *
 * @extends {BaseApi}
 */
export class IamApiService extends BaseApi {
  /**
   * Authenticates a user via `POST /authentication/sign-in`.
   *
   * @param {SignInRequest|{ email: string, password: string }} credentials User credentials.
   * @returns {Promise<import('./user.assembler.js').AuthenticatedSession>} Mapped user entity and JWT token.
   * @throws {Error & { status: number|null, title: string, detail: string }}
   */
  async signIn(credentials) {
    try {
      const payload = credentials instanceof SignInRequest ? credentials : new SignInRequest(credentials)
      const { data } = await this.http.post(buildUrl(ENDPOINTS.signIn), payload)
      return UserAssembler.toAuthenticatedSession(data)
    } catch (error) {
      throw toServiceError(error, 'Invalid credentials')
    }
  }

  /**
   * Registers a new user account via `POST /authentication/sign-up`.
   *
   * @param {SignUpRequest|{ fullName: string, email: string, password: string, phoneNumber: string, role: string }} registration Registration payload.
   * @returns {Promise<{ user: import('../domain/model/user.entity.js').User|null, raw: any }>} Created user and raw backend payload.
   * @throws {Error & { status: number|null, title: string, detail: string }}
   */
  async signUp(registration) {
    try {
      const payload = registration instanceof SignUpRequest ? registration : new SignUpRequest(registration)
      const { data } = await this.http.post(buildUrl(ENDPOINTS.signUp), payload)
      return {
        user: UserAssembler.toEntityFromResource(data),
        raw: data
      }
    } catch (error) {
      throw toServiceError(error, 'Registration failed')
    }
  }

  /**
   * Verifies a user's email address via `GET /authentication/verify-email?token=...`.
   *
   * @param {string} token Verification token received via email.
   * @returns {Promise<any>} Backend confirmation response.
   * @throws {Error & { status: number|null, title: string, detail: string }}
   */
  async verifyEmail(token) {
    try {
      const { data } = await this.http.get(buildUrl(ENDPOINTS.verifyEmail), {
        params: { token }
      })
      return data
    } catch (error) {
      throw toServiceError(error, 'Invalid or expired verification token')
    }
  }

  /**
   * Invalidates the active session on the backend via `POST /authentication/sign-out`.
   *
   * @returns {Promise<any>} Backend sign-out acknowledgement.
   * @throws {Error & { status: number|null, title: string, detail: string }}
   */
  async signOut() {
    try {
      const { data } = await this.http.post(buildUrl(ENDPOINTS.signOut))
      return data
    } catch (error) {
      throw toServiceError(error, 'Sign out failed')
    }
  }

  /**
   * Retrieves a user profile by identifier via `GET /users/{id}`.
   *
   * @param {number|string} id User identifier.
   * @returns {Promise<import('../domain/model/user.entity.js').User|null>} Mapped `User` entity.
   * @throws {Error & { status: number|null, title: string, detail: string }}
   */
  async getUserById(id) {
    try {
      const { data } = await this.http.get(`${buildUrl(ENDPOINTS.users)}/${id}`)
      return UserAssembler.toEntityFromResource(data)
    } catch (error) {
      throw toServiceError(error, 'Failed to fetch user')
    }
  }
}

export default IamApiService
