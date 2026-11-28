import { USER_ROLES } from './user.entity.js'

/**
 * Input contract for registering a new user account via `POST /authentication/sign-up`.
 */
export class SignUpRequest {
  /**
   * @param {object} [params]
   * @param {string} [params.fullName=''] User full name.
   * @param {string} [params.email=''] Email address used for login and Brevo verification.
   * @param {string} [params.password=''] Account password.
   * @param {string} [params.phoneNumber=''] Contact phone number (e.g. `+51 999 888 777`).
   * @param {string} [params.role='Farmer'] Selected platform role (`Farmer` | `Operator`).
   */
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
