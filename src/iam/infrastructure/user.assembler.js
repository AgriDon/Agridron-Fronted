import { User, USER_ROLES } from '../domain/model/user.entity.js'

export class UserAssembler {
  /** Maps a UserResource or AuthenticatedUserResource payload to a User entity. */
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

  /** Extracts the domain User and JWT token from an AuthenticatedUserResource payload. */
  static toAuthenticatedSession(resource) {
    return {
      user: UserAssembler.toEntityFromResource(resource),
      token: resource?.token ?? resource?.accessToken ?? ''
    }
  }

  /** Extracts HTTP status and user-facing message from an Axios error or RFC 7807 ProblemDetails. */
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
