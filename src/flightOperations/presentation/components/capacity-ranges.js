/**
 * Capacity ranges (liters) used by the drone capacity filter.
 * Shared by the list (to filter) and the parent view (to build the dropdown).
 */
export const CAPACITY_RANGES = [
    { key: 'upTo20',  labelKey: 'drone.capacityRange.upTo20',  matches: (liters) => liters <= 20 },
    { key: 'upTo30',  labelKey: 'drone.capacityRange.upTo30',  matches: (liters) => liters <= 30 },
    { key: 'over30',  labelKey: 'drone.capacityRange.over30',  matches: (liters) => liters > 30 }
]