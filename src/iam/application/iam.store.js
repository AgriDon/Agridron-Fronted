import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  AUTH_TOKEN_STORAGE_KEY,
  AUTH_USER_STORAGE_KEY,
  AUTH_UNAUTHORIZED_EVENT
} from '@/shared/infrastructure/base-api.js'
import { User } from '../domain/model/user.entity.js'
import { IamApiService } from '../infrastructure/iam-api.service.js'

const readStoredToken = () => {
  if (typeof localStorage === 'undefined') return ''
  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || ''
}

const readStoredUser = () => {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(AUTH_USER_STORAGE_KEY)
    if (!raw) return null
    return new User(JSON.parse(raw))
  } catch {
    localStorage.removeItem(AUTH_USER_STORAGE_KEY)
    return null
  }
}

export const useIamStore = defineStore('iam', () => {
  const iamApi = new IamApiService()

  const user = ref(readStoredUser())
  const token = ref(readStoredToken())
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => Boolean(token.value && user.value))
  const isFarmer = computed(() => Boolean(user.value?.isFarmer))
  const isOperator = computed(() => Boolean(user.value?.isOperator))

  const persistSession = (nextUser, nextToken) => {
    const normalizedUser = nextUser instanceof User ? nextUser : new User(nextUser || {})
    user.value = normalizedUser
    token.value = nextToken || ''

    if (typeof localStorage !== 'undefined') {
      if (token.value) {
        localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token.value)
      }
      localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(normalizedUser.toJSON()))
    }
  }

  const clearSession = () => {
    user.value = null
    token.value = ''
    error.value = null

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
      localStorage.removeItem(AUTH_USER_STORAGE_KEY)
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, clearSession)
  }

  const signIn = async ({ email, password }) => {
    loading.value = true
    error.value = null
    try {
      const session = await iamApi.signIn({ email, password })
      persistSession(session.user, session.token)
      return session
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const signUp = async ({ fullName, email, password, phoneNumber, role }) => {
    loading.value = true
    error.value = null
    try {
      return await iamApi.signUp({ fullName, email, password, phoneNumber, role })
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const verifyEmail = async (verificationToken) => {
    loading.value = true
    error.value = null
    try {
      return await iamApi.verifyEmail(verificationToken)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const signOut = async () => {
    loading.value = true
    error.value = null
    try {
      if (token.value) {
        await iamApi.signOut()
      }
    } catch {
      // Session is still cleared locally if the backend token already expired.
    } finally {
      clearSession()
      loading.value = false
    }
  }

  const refreshCurrentUser = async () => {
    if (!user.value?.id) return null
    const freshUser = await iamApi.getUserById(user.value.id)
    if (freshUser) {
      persistSession(freshUser, token.value)
    }
    return freshUser
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isFarmer,
    isOperator,
    signIn,
    signUp,
    verifyEmail,
    signOut,
    clearSession,
    refreshCurrentUser
  }
})
