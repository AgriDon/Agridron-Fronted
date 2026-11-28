export class SignInRequest {
  constructor({ email = '', password = '' } = {}) {
    this.email = String(email).trim()
    this.password = String(password)
  }
}
