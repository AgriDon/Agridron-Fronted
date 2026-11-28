import { USER_ROLES } from './user.entity.js'

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
