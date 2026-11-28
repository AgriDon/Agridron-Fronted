/** Payload contract for `POST /authentication/sign-in`. */
export class SignInRequest {
  constructor({ email = '', password = '' } = {}) {
    this.email = String(email).trim()
    this.password = String(password)
  }
}
