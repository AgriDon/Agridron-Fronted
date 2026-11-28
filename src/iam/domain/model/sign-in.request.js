/**
 * Input contract for authenticating an existing user via `POST /authentication/sign-in`.
 */
export class SignInRequest {
  /**
   * @param {object} [params]
   * @param {string} [params.email=''] User email address (trimmed on construction).
   * @param {string} [params.password=''] Plaintext password submitted over HTTPS.
   */
  constructor({ email = '', password = '' } = {}) {
    this.email = String(email).trim()
    this.password = String(password)
  }
}
