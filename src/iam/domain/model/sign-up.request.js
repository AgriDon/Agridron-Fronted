import { USER_ROLES } from './user.entity.js'

/** Evaluates password complexity rules and returns `{ isValid, rules }`. */
export const validatePasswordStrength = (password = '') => {
  const value = String(password)
  const rules = {
    minLength: value.length >= 8,
    hasUppercase: /[A-Z]/.test(value),
    hasLowercase: /[a-z]/.test(value),
    hasNumber: /\d/.test(value),
    hasSpecial: /[^A-Za-z0-9\s]/.test(value)
  }

  return {
    isValid: Object.values(rules).every(Boolean),
    rules
  }
}

/** Payload contract for `POST /authentication/sign-up`. */
export class SignUpRequest {
  constructor({
    fullName = '',
    email = '',
    password = '',
    phoneNumber = '',
    role = USER_ROLES.FARMER
  } = {}) {
    this.fullName = String(fullName).trim()
    this.email = String(email).trim()
    this.password = String(password)
    this.phoneNumber = String(phoneNumber).trim()
    this.role = role || USER_ROLES.FARMER
  }
}
