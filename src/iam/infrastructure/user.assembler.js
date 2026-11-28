import i18n from '@/i18n.js'
import { User, USER_ROLES } from '../domain/model/user.entity.js'

const SPANISH_ERROR_MAPPINGS = [
  {
    pattern: /invalid\s+(email\s+or\s+password|credentials)/i,
    message: 'Correo electrónico o contraseña incorrectos.'
  },
  {
    pattern: /(already\s+exists|already\s+registered|already\s+in\s+use)/i,
    message: 'Ya existe una cuenta registrada con este correo electrónico.'
  },
  {
    pattern: /(inactive|not\s+verified|unverified|verify\s+your\s+email|not\s+active)/i,
    message: 'Tu cuenta aún no está activa o verificada. Revisa tu bandeja de entrada para confirmarla.'
  },
  {
    pattern: /(invalid(\s+or\s+expired)?\s+verification\s+token|verification\s+token.*(invalid|expired)|token.*expired)/i,
    message: 'El enlace de verificación es inválido o ha expirado.'
  },
  {
    pattern: /registration\s+failed/i,
    message: 'No se pudo completar el registro. Verifica tus datos e inténtalo nuevamente.'
  },
  {
    pattern: /sign\s*out\s+failed/i,
    message: 'No se pudo cerrar la sesión.'
  },
  {
    pattern: /failed\s+to\s+fetch\s+user/i,
    message: 'No se pudo obtener la información del usuario.'
  },
  {
    pattern: /network\s+error/i,
    message: 'Error de conexión con el servidor. Inténtalo nuevamente.'
  },
  {
    pattern: /unexpected\s+error/i,
    message: 'Ocurrió un error inesperado.'
  }
]

const isSpanishLocale = () => {
  const current = i18n?.global?.locale?.value ?? i18n?.global?.locale ?? ''
  return String(current).toLowerCase().startsWith('es')
}

const localizeApiMessage = (rawMessage) => {
  const normalized = typeof rawMessage === 'string' ? rawMessage.trim() : ''
  if (!normalized || !isSpanishLocale()) {
    return normalized
  }

  for (const entry of SPANISH_ERROR_MAPPINGS) {
    if (entry.pattern.test(normalized)) {
      return entry.message
    }
  }

  return normalized
}

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
      const title = localizeApiMessage(data.title || '')
      let rawDetail = data.detail || ''

      if (!rawDetail && data.errors && typeof data.errors === 'object') {
        const flattened = Object.values(data.errors).flat().filter(Boolean)
        if (flattened.length > 0) {
          rawDetail = flattened.join(' ')
        }
      }

      const detail = localizeApiMessage(rawDetail)
      const message = detail || title || localizeApiMessage(data.message || '') || localizeApiMessage(fallbackMessage)
      return { status, title, detail, message }
    }

    if (typeof data === 'string' && data.trim()) {
      const detail = localizeApiMessage(data.trim())
      return { status, title: '', detail, message: detail }
    }

    const message = localizeApiMessage(error?.message || fallbackMessage)
    return {
      status,
      title: '',
      detail: '',
      message
    }
  }

  static extractProblemMessage(error, fallbackMessage = 'Unexpected error') {
    return UserAssembler.extractProblemDetails(error, fallbackMessage).message
  }
}

export default UserAssembler
