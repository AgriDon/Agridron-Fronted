const EARTH_RADIUS_METERS = 6371008.8
const SQUARE_METERS_PER_HECTARE = 10000
const CLOSURE_EPSILON = 1e-9

function toRadians(degrees) {
  return (degrees * Math.PI) / 180
}

function isValidCoordinate(point) {
  if (!Array.isArray(point) || point.length < 2) {
    return false
  }

  const lng = Number(point[0])
  const lat = Number(point[1])

  return (
    Number.isFinite(lng) &&
    Number.isFinite(lat) &&
    lng >= -180 &&
    lng <= 180 &&
    lat >= -90 &&
    lat <= 90
  )
}

function pointsEqual(a, b) {
  return (
    Math.abs(Number(a[0]) - Number(b[0])) <= CLOSURE_EPSILON &&
    Math.abs(Number(a[1]) - Number(b[1])) <= CLOSURE_EPSILON
  )
}

function closeRing(vertices) {
  if (!Array.isArray(vertices) || vertices.length < 3) {
    return []
  }

  const sanitized = vertices
    .filter(isValidCoordinate)
    .map(([lng, lat]) => [Number(lng), Number(lat)])

  if (sanitized.length < 3) {
    return []
  }

  const first = sanitized[0]
  const last = sanitized[sanitized.length - 1]

  if (pointsEqual(first, last)) {
    return sanitized.length >= 4 ? sanitized : []
  }

  return [...sanitized, [first[0], first[1]]]
}

/**
 * Parses a GeoJSON Polygon string or object into open `[lng, lat]` vertices.
 *
 * @param {string | object | null | undefined} geoJsonInput
 * @returns {{ valid: boolean, vertices: Array<[number, number]>, error: string | null }}
 */
export function parsePolygonVertices(geoJsonInput) {
  if (geoJsonInput === null || geoJsonInput === undefined || geoJsonInput === '') {
    return { valid: false, vertices: [], error: 'parcel.form.error.geometry-required' }
  }

  let parsed = geoJsonInput

  if (typeof geoJsonInput === 'string') {
    const trimmed = geoJsonInput.trim()
    if (!trimmed) {
      return { valid: false, vertices: [], error: 'parcel.form.error.geometry-required' }
    }

    try {
      parsed = JSON.parse(trimmed)
    } catch {
      return { valid: false, vertices: [], error: 'parcel.form.error.geometry-invalid' }
    }
  }

  if (
    !parsed ||
    typeof parsed !== 'object' ||
    parsed.type !== 'Polygon' ||
    !Array.isArray(parsed.coordinates) ||
    !Array.isArray(parsed.coordinates[0])
  ) {
    return { valid: false, vertices: [], error: 'parcel.form.error.geometry-invalid' }
  }

  const rawRing = parsed.coordinates[0]
  if (rawRing.length < 3 || !rawRing.every(isValidCoordinate)) {
    return { valid: false, vertices: [], error: 'parcel.form.error.geometry-invalid' }
  }

  const normalized = rawRing.map(([lng, lat]) => [Number(lng), Number(lat)])
  const first = normalized[0]
  const last = normalized[normalized.length - 1]
  const openVertices =
    normalized.length >= 4 && pointsEqual(first, last)
      ? normalized.slice(0, -1)
      : normalized

  if (openVertices.length < 3) {
    return { valid: false, vertices: [], error: 'parcel.form.error.geometry-invalid' }
  }

  return { valid: true, vertices: openVertices, error: null }
}

/**
 * Builds a closed canonical GeoJSON Polygon string from `[lng, lat]` vertices.
 *
 * @param {Array<[number, number]>} vertices
 * @returns {string}
 */
export function buildGeoJsonPolygon(vertices) {
  if (!Array.isArray(vertices) || vertices.length < 3) {
    return ''
  }

  const openVertices = vertices
    .filter(isValidCoordinate)
    .map(([lng, lat]) => [Number(Number(lng).toFixed(6)), Number(Number(lat).toFixed(6))])

  if (openVertices.length < 3) {
    return ''
  }

  const first = openVertices[0]
  const last = openVertices[openVertices.length - 1]
  const closedRing = pointsEqual(first, last)
    ? openVertices
    : [...openVertices, [first[0], first[1]]]

  if (closedRing.length < 4) {
    return ''
  }

  return JSON.stringify({
    type: 'Polygon',
    coordinates: [closedRing]
  })
}

/**
 * Computes the geodesic area of a polygon in hectares using the spherical excess formula,
 * matching backend GeodesicAreaCalculator.CalculateHectares.
 *
 * @param {Array<[number, number]>} vertices Open or closed array of `[lng, lat]` positions.
 * @returns {number} Area in hectares rounded to 2 decimal places.
 */
export function calculateGeodesicAreaHectares(vertices) {
  const ring = closeRing(vertices)
  const count = ring.length
  if (count < 4) {
    return 0
  }

  let sum = 0

  for (let i = 0; i < count; i++) {
    const previous = ring[(i + count - 1) % count]
    const current = ring[i]
    const next = ring[(i + 1) % count]

    sum += (toRadians(next[0]) - toRadians(previous[0])) * Math.sin(toRadians(current[1]))
  }

  const squareMeters = Math.abs((sum * EARTH_RADIUS_METERS * EARTH_RADIUS_METERS) / 2)
  const hectares = squareMeters / SQUARE_METERS_PER_HECTARE
  return Math.round(hectares * 100) / 100
}

/**
 * Validates that a GeoJSON input parses as a Polygon with positive geodesic area.
 *
 * @param {string | object | null | undefined} geoJsonInput
 * @returns {boolean}
 */
export function validateGeoJsonPolygon(geoJsonInput) {
  const { valid, vertices } = parsePolygonVertices(geoJsonInput)
  if (!valid || vertices.length < 3) {
    return false
  }

  return calculateGeodesicAreaHectares(vertices) > 0
}
