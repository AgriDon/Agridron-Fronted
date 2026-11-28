/**
 * Supported IAM user roles sent to and received from the backend API.
 *
 * @readonly
 * @enum {string}
 */
export const USER_ROLES = Object.freeze({
  FARMER: 'Farmer',
  OPERATOR: 'Operator'
})

/**
 * Domain entity representing an authenticated AgriDron platform user.
 */
export class User {
  /**
   * @param {object} [params]
   * @param {number|string|null} [params.id=null] Unique user identifier.
   * @param {string} [params.fullName=''] User full display name.
   * @param {string} [params.email=''] Registered email address.
   * @param {string} [params.role='Farmer'] Assigned role (`Farmer` | `Operator`).
   * @param {string} [params.phoneNumber=''] Contact phone number.
   * @param {string} [params.status=''] Account status reported by the backend.
   * @param {boolean} [params.emailVerified=false] Whether the user has verified their email address.
   */
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

  /**
   * Indicates whether the user holds the `Farmer` role.
   *
   * @returns {boolean}
   */
  get isFarmer() {
    return String(this.role).toLowerCase() === USER_ROLES.FARMER.toLowerCase()
  }

  /**
   * Indicates whether the user holds the `Operator` role.
   *
   * @returns {boolean}
   */
  get isOperator() {
    return String(this.role).toLowerCase() === USER_ROLES.OPERATOR.toLowerCase()
  }

  /**
   * Serializes the entity into a plain object suitable for `localStorage` persistence.
   *
   * @returns {{ id: number|string|null, fullName: string, email: string, role: string, phoneNumber: string, status: string, emailVerified: boolean }}
   */
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
