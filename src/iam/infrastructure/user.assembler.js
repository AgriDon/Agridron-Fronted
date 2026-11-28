import { User, USER_ROLES } from '../domain/model/user.entity.js'

/**
 * @typedef {object} AuthenticatedSession
 * @property {User|null} user Domain user entity.
 * @property {string} token Signed JWT bearer token.
 */

/**
 * @typedef {object} ProblemDetailsResult
 * @property {number|null} status HTTP status code returned by the API, if available.
 * @property {string} title RFC 7807 `title` field.
 * @property {string} detail RFC 7807 `detail` or flattened validation error message.
 * @property {string} message Final user-facing error message.
 */

/**
 * Translates backend IAM resources (`UserResource`, `AuthenticatedUserResource`) into domain
 * models and normalizes RFC 7807 `ProblemDetails` error responses.
 */
export class UserAssembler {
  /**
   * Maps a `UserResource` or `AuthenticatedUserResource` JSON payload to a `User` entity.
   * Supports both flat and nested `{ user, token }` response shapes.
   *
   * @param {Record<string, any>|null|undefined} resource Raw API response payload.
   * @returns {User|null}
   */
  static toEntityFromResource(resource) {
    if (!resource || typeof resource !== 'object') {
      return null
    }

    const source = resource.user && typeof resource.user === 'object' ? resource.user : resource

    return new User({
      id: source.id ?? null,
      fullName: source.fullName ?? source.name ?? source.username ?? '',
      email: source.email ?? '',
      role: source.role ?? USER_ROLES.FARMER,
      phoneNumber: source.phoneNumber ?? source.phone ?? '',
      status: source.status ?? '',
      emailVerified: source.emailVerified ?? source.isEmailVerified ?? false
    })
  }

  /**
   * Extracts the domain `User` and JWT bearer token from an `AuthenticatedUserResource`.
   *
   * @param {Record<string, any>|null|undefined} resource Raw sign-in API response.
   * @returns {AuthenticatedSession}
   */
  static toAuthenticatedSession(resource) {
    return {
      user: UserAssembler.toEntityFromResource(resource),
      token: resource?.token ?? resource?.accessToken ?? ''
    }
  }

  /**
   * Parses an Axios error into a structured `ProblemDetailsResult` following RFC 7807
   * (`detail`, `errors`, `title`) with a guaranteed fallback message.
   *
   * @param {any} error Axios error or thrown exception.
   * @param {string} [fallbackMessage='Unexpected error'] Fallback message when the server provides no detail.
   * @returns {ProblemDetailsResult}
   */
  static extractProblemDetails(error, fallbackMessage = 'Unexpected error') {
    const status = error?.response?.status ?? error?.status ?? null
    const data = error?.response?.data

    if (data && typeof data === 'object') {
      const title = data.title || ''
      let detail = data.detail || ''

      if (!detail && data.errors && typeof data.errors === 'object') {
        const flattened = Object.values(data.errors).flat().filter(Boolean)
        if (flattened.length > 0) {
          detail = flattened.join(' ')
        }
      }

      const message = detail || title || data.message || fallbackMessage
      return { status, title, detail, message }
    }

    if (typeof data === 'string' && data.trim()) {
      return { status, title: '', detail: data.trim(), message: data.trim() }
    }

    return {
      status,
      title: '',
      detail: '',
      message: error?.message || fallbackMessage
    }
  }
}

export default UserAssembler
