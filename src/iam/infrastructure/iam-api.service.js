import { BaseApi } from '@/shared/infrastructure/base-api.js'
import { ENDPOINTS, buildUrl } from '@/config/env.js'
import { SignInRequest } from '../domain/model/sign-in.request.js'
import { SignUpRequest } from '../domain/model/sign-up.request.js'
import { UserAssembler } from './user.assembler.js'

const toServiceError = (error, fallbackMessage) => {
  const problem = UserAssembler.extractProblemDetails(error, fallbackMessage)
  const err = new Error(problem.message)
  err.status = problem.status
  err.title = problem.title
  err.detail = problem.detail
  return err
}

/** HTTP client for IAM authentication and user endpoints. */
export class IamApiService extends BaseApi {
  /** Authenticates credentials via `POST /authentication/sign-in` and returns `{ user, token }`. */
  async signIn(credentials) {
    try {
      const payload = credentials instanceof SignInRequest ? credentials : new SignInRequest(credentials)
      const { data } = await this.http.post(buildUrl(ENDPOINTS.signIn), payload)
      return UserAssembler.toAuthenticatedSession(data)
    } catch (error) {
      throw toServiceError(error, 'Invalid credentials')
    }
  }

  /** Registers a new account via `POST /authentication/sign-up`. */
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

  /** Confirms an account activation token via `GET /authentication/verify-email`. */
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

  /** Invalidates the active session via `POST /authentication/sign-out`. */
  async signOut() {
    try {
      const { data } = await this.http.post(buildUrl(ENDPOINTS.signOut))
      return data
    } catch (error) {
      throw toServiceError(error, 'Sign out failed')
    }
  }

  /** Fetches a user entity by identifier via `GET /users/{id}`. */
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
