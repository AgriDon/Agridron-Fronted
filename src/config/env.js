/**
 * Single access point for environment configuration.
 *
 * Components should import from here instead of reading import.meta.env
 * directly, so there is exactly one place to change if the variables are
 * renamed or the API moves.
 *
 * Every variable is read with a static `import.meta.env.VITE_*` expression on
 * purpose. Vite replaces those by name at transform time, in both `dev` and
 * `build`. Looking a key up dynamically (`import.meta.env[name]`) is not
 * reliable during dev, because the injected object is not always the same one
 * the lookup runs against.
 */

const variables = {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,

  VITE_SIGNIN_ENDPOINT_PATH: import.meta.env.VITE_SIGNIN_ENDPOINT_PATH,
  VITE_SIGNUP_ENDPOINT_PATH: import.meta.env.VITE_SIGNUP_ENDPOINT_PATH,
  VITE_USERS_ENDPOINT_PATH: import.meta.env.VITE_USERS_ENDPOINT_PATH,

  VITE_FARMS_ENDPOINT_PATH: import.meta.env.VITE_FARMS_ENDPOINT_PATH,
  VITE_PARCELS_ENDPOINT_PATH: import.meta.env.VITE_PARCELS_ENDPOINT_PATH,
  VITE_CROPS_ENDPOINT_PATH: import.meta.env.VITE_CROPS_ENDPOINT_PATH,
  VITE_MISSIONS_ENDPOINT_PATH: import.meta.env.VITE_MISSIONS_ENDPOINT_PATH,
  VITE_FUMIGATION_AREAS_ENDPOINT_PATH: import.meta.env.VITE_FUMIGATION_AREAS_ENDPOINT_PATH,

  VITE_MISSION_REPORTS_ENDPOINT_PATH: import.meta.env.VITE_MISSION_REPORTS_ENDPOINT_PATH,
  VITE_MISSION_HISTORIES_ENDPOINT_PATH: import.meta.env.VITE_MISSION_HISTORIES_ENDPOINT_PATH,

  VITE_DRONES_METRICS_ENDPOINT_PATH: import.meta.env.VITE_DRONES_METRICS_ENDPOINT_PATH,
  VITE_CHEMICALS_ENDPOINT_PATH: import.meta.env.VITE_CHEMICALS_ENDPOINT_PATH,
  VITE_NOZZLES_ENDPOINT_PATH: import.meta.env.VITE_NOZZLES_ENDPOINT_PATH,
  VITE_MAINTENANCE_RECORDS_ENDPOINT_PATH: import.meta.env.VITE_MAINTENANCE_RECORDS_ENDPOINT_PATH,

  VITE_OPERATIONAL_METRICS_ENDPOINT_PATH: import.meta.env.VITE_OPERATIONAL_METRICS_ENDPOINT_PATH,
  VITE_PERFORMANCE_INDICATORS_ENDPOINT_PATH: import.meta.env.VITE_PERFORMANCE_INDICATORS_ENDPOINT_PATH,

  VITE_WEATHER_ENDPOINT_PATH: import.meta.env.VITE_WEATHER_ENDPOINT_PATH
}

// Report every missing variable at once: failing on the first one hides the rest.
const missing = Object.entries(variables)
  .filter(([, value]) => !value)
  .map(([name]) => name)

if (missing.length > 0) {
  const mode = import.meta.env.MODE

  throw new Error(
    `[env] Faltan ${missing.length} variable(s) en el modo "${mode}": ${missing.join(', ')}.\n` +
    `      Revisa el archivo .env.${mode} en la raíz del proyecto.`
  )
}

export const API_BASE_URL = variables.VITE_API_BASE_URL

/** Relative paths, combined with API_BASE_URL via buildUrl(). */
export const ENDPOINTS = {
  // Authentication
  signIn: variables.VITE_SIGNIN_ENDPOINT_PATH,
  signUp: variables.VITE_SIGNUP_ENDPOINT_PATH,
  users: variables.VITE_USERS_ENDPOINT_PATH,

  // Farm management
  farms: variables.VITE_FARMS_ENDPOINT_PATH,
  parcels: variables.VITE_PARCELS_ENDPOINT_PATH,
  crops: variables.VITE_CROPS_ENDPOINT_PATH,
  missions: variables.VITE_MISSIONS_ENDPOINT_PATH,
  fumigationAreas: variables.VITE_FUMIGATION_AREAS_ENDPOINT_PATH,

  // Missions
  missionReports: variables.VITE_MISSION_REPORTS_ENDPOINT_PATH,
  missionHistories: variables.VITE_MISSION_HISTORIES_ENDPOINT_PATH,

  // Drones & equipment
  drones: variables.VITE_DRONES_METRICS_ENDPOINT_PATH,
  chemicals: variables.VITE_CHEMICALS_ENDPOINT_PATH,
  nozzles: variables.VITE_NOZZLES_ENDPOINT_PATH,
  maintenanceRecords: variables.VITE_MAINTENANCE_RECORDS_ENDPOINT_PATH,

  // Metrics
  operationalMetrics: variables.VITE_OPERATIONAL_METRICS_ENDPOINT_PATH,
  performanceIndicators: variables.VITE_PERFORMANCE_INDICATORS_ENDPOINT_PATH,

  // Weather
  weather: variables.VITE_WEATHER_ENDPOINT_PATH
}

/**
 * Joins the API base URL with an endpoint path.
 *
 * @param {string} path - One of the ENDPOINTS values.
 * @returns {string} e.g. "/api/v1/farms" in development.
 */
export const buildUrl = (path) => `${API_BASE_URL}${path}`

/** Shorthand: buildUrl(ENDPOINTS.farms) -> "/api/v1/farms" */
export const urls = Object.fromEntries(
  Object.entries(ENDPOINTS).map(([key, path]) => [key, buildUrl(path)])
)

export const isDev = import.meta.env.DEV
export const isProd = import.meta.env.PROD
export const mode = import.meta.env.MODE