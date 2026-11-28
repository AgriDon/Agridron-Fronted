import axios from 'axios'

export const AUTH_TOKEN_STORAGE_KEY = 'agridron_token'
export const AUTH_USER_STORAGE_KEY = 'agridron_user'
export const AUTH_UNAUTHORIZED_EVENT = 'agridron:unauthorized'

const PUBLIC_AUTH_PATHS = [
  '/authentication/sign-in',
  '/authentication/sign-up',
  '/authentication/verify-email'
]

let unauthorizedHandler = null

/** Registers a callback invoked when any protected API request returns HTTP 401. */
export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = typeof handler === 'function' ? handler : null
}

const isPublicAuthRequest = (url = '') =>
  PUBLIC_AUTH_PATHS.some((path) => String(url).includes(path))

const clearStoredSession = () => {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
  localStorage.removeItem(AUTH_USER_STORAGE_KEY)
}

export class BaseApi {
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

  get http() {
    return this.#http
  }
}
