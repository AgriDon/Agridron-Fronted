/** Supported IAM user roles exchanged with the backend API. */
export const USER_ROLES = Object.freeze({
  FARMER: 'Farmer',
  OPERATOR: 'Operator'
})

/** Authenticated platform user domain entity. */
export class User {
  constructor({
    id = null,
    fullName = '',
    email = '',
    role = USER_ROLES.FARMER,
    phoneNumber = '',
    status = '',
    emailVerified = false
  } = {}) {
    this.id = id
    this.fullName = fullName
    this.email = email
    this.role = role
    this.phoneNumber = phoneNumber
    this.status = status
    this.emailVerified = Boolean(emailVerified)
  }

  get isFarmer() {
    return String(this.role).toLowerCase() === USER_ROLES.FARMER.toLowerCase()
  }

  get isOperator() {
    return String(this.role).toLowerCase() === USER_ROLES.OPERATOR.toLowerCase()
  }

  /** Serializes the user entity for localStorage persistence. */
  toJSON() {
    return {
      id: this.id,
      fullName: this.fullName,
      email: this.email,
      role: this.role,
      phoneNumber: this.phoneNumber,
      status: this.status,
      emailVerified: this.emailVerified
    }
  }
}
