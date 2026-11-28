import axios from 'axios'

/** LocalStorage key holding the active JWT bearer token. */
export const AUTH_TOKEN_STORAGE_KEY = 'agridron_token'

/** LocalStorage key holding the serialized authenticated user snapshot. */
export const AUTH_USER_STORAGE_KEY = 'agridron_user'

/** Custom window event dispatched whenever a protected API request returns HTTP 401. */
export const AUTH_UNAUTHORIZED_EVENT = 'agridron:unauthorized'

const PUBLIC_AUTH_PATHS = [
  '/authentication/sign-in',
  '/authentication/sign-up',
  '/authentication/verify-email'
]

/** @type {(() => void)|null} */
let unauthorizedHandler = null

/**
 * Registers a global handler invoked when any protected API request fails with HTTP 401.
 *
 * @param {(() => void)|null} handler Navigation callback (typically router redirect to `/sign-in`).
 */
export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = typeof handler === 'function' ? handler : null
}

/**
 * Checks whether the request URL targets a public authentication endpoint.
 *
 * @param {string} [url=''] Request URL.
 * @returns {boolean}
 */
const isPublicAuthRequest = (url = '') =>
  PUBLIC_AUTH_PATHS.some((path) => String(url).includes(path))

/**
 * Removes persisted authentication credentials from `localStorage`.
 */
const clearStoredSession = () => {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
  localStorage.removeItem(AUTH_USER_STORAGE_KEY)
}

/**
 * Shared infrastructure base class configuring the Axios HTTP client with JWT Bearer
 * authorization and automatic HTTP 401 session cleanup.
 */
export class BaseApi {
  /** @type {import('axios').AxiosInstance} */
  #http

  constructor() {
    this.#http = axios.create()

    this.#http.interceptors.request.use((config) => {
      const token =
        typeof localStorage !== 'undefined'
          ? localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
          : null

      if (token && !config.headers?.Authorization) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
      }

      return config
    })

    this.#http.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error?.response?.status
        const requestUrl = error?.config?.url || ''

        if (status === 401 && !isPublicAuthRequest(requestUrl)) {
          clearStoredSession()

          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT))
          }

          if (unauthorizedHandler) {
            unauthorizedHandler()
          } else if (typeof window !== 'undefined' && window.location.pathname !== '/sign-in') {
            window.location.assign('/sign-in')
          }
        }

        return Promise.reject(error)
      }
    )
  }

  /**
   * Returns the configured Axios client instance.
   *
   * @returns {import('axios').AxiosInstance}
   */
  get http() {
    return this.#http
  }
}
