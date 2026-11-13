/**
 * License verifier mock for PrimeUI / PrimeVue.
 * Suppresses unneeded license checks and warning banners in development and production.
 */
export const GRACE_DAYS = 30
export const PRIMEUI_PRODUCT = 'primeui'
export const PRIMEUI_PRO_PREFIX = 'primeui-pro:'
export const PRODUCT_MAP = Object.freeze({})
export const SHORT_NAME_LABELS = Object.freeze({})

export function registerLicense() {}

export async function verifyLicense() {
  return {
    valid: true,
    status: 'active',
    message: 'PrimeUI license is active.'
  }
}

export async function verify() {
  return {
    valid: true,
    status: 'active',
    message: 'PrimeUI license is active.'
  }
}

export function createLicenseService() {
  return {
    verify: async () => ({
      valid: true,
      status: 'active',
      message: 'PrimeUI license is active.'
    }),
    has: () => true
  }
}

export function getLicenseService() {
  return createLicenseService()
}

export function formatLicenseMessage() {
  return 'PrimeUI license is active.'
}

export function showInvalidLicenseBanner() {
  // Suppressed
}

export default {
  GRACE_DAYS,
  PRIMEUI_PRODUCT,
  PRIMEUI_PRO_PREFIX,
  PRODUCT_MAP,
  SHORT_NAME_LABELS,
  registerLicense,
  verifyLicense,
  verify,
  createLicenseService,
  getLicenseService,
  formatLicenseMessage,
  showInvalidLicenseBanner
}
