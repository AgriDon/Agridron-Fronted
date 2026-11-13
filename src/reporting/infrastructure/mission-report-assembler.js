import { markRaw } from 'vue'
import { MissionReportEntity } from '../domain/model/mission-report.entity.js'
import { SupplyUsageEntity } from '../domain/model/supply-usage.entity.js'

/**
 * Assembler to convert HTTP/API responses into domain entities for Reporting.
 */
export class MissionReportAssembler {
  /**
   * @param {any[]} resources
   * @param {any[]} [parcels]
   * @returns {MissionReportEntity[]}
   */
  toEntitiesFromMissions(resources = [], parcels = []) {
    const parcelMap = new Map((parcels || []).map(p => [Number(p.id), p]))

    return (resources || []).map((res, index) => {
      const parcel = res.parcelId ? parcelMap.get(Number(res.parcelId)) : null
      const parcelArea = parcel?.area ?? (2.0 + (index % 4) * 0.5)

      // Format code as in mockup: M1-001, M2-002, etc.
      const code = `M${res.id}-00${res.id}`

      // Format parcel display: e.g. "Lote3 - Uva"
      let parcelDisplayName = res.farmArea || 'Parcela'
      if (res.cropType && !parcelDisplayName.includes(res.cropType)) {
        parcelDisplayName = `${parcelDisplayName} - ${res.cropType}`
      }

      // Format status to standard display
      let normalizedStatus = 'Completado'
      if (res.status === 'En curso' || res.status === 'IN_PROGRESS') {
        normalizedStatus = 'En curso'
      } else if (res.status === 'Programada' || res.status === 'Programado' || res.status === 'PLANNED') {
        normalizedStatus = 'Programado'
      } else if (res.status === 'Completada' || res.status === 'Completado' || res.status === 'COMPLETED') {
        normalizedStatus = 'Completado'
      }

      return markRaw(
        new MissionReportEntity({
          id: res.id,
          code,
          missionId: res.id,
          farmName: res.farmArea || 'Finca Principal',
          parcelName: parcelDisplayName,
          crop: res.cropType || 'Cultivo mixto',
          date: res.date || new Date().toISOString(),
          status: normalizedStatus,
          area: parcelArea,
          operator: res.operator || 'Operador AgriDron',
          treatmentType: res.treatmentType || 'Fumigación estándar',
          product: res.product || 'Fungicida 48%',
          dose: res.productDose ? `${res.productDose} L/ha` : '2.0 L/ha',
          appliedVolume: Math.round(parcelArea * 3.5 * 10) / 10,
          progress: res.progress ?? (normalizedStatus === 'Completado' ? 100 : 35),
          observations: res.notes || 'Operación realizada con precisión milimétrica.'
        })
      )
    })
  }

  /**
   * @param {any[]} chemicalResources
   * @returns {SupplyUsageEntity[]}
   */
  toSupplyEntities(chemicalResources = []) {
    return (chemicalResources || []).map(chem => {
      const applied = Math.round((chem.stockLiters * 0.45 + (chem.id * 3.5)) * 10) / 10
      return markRaw(
        new SupplyUsageEntity({
          id: chem.id,
          name: chem.name,
          type: chem.type,
          appliedTotal: applied,
          stockLiters: chem.stockLiters,
          minimumStockLiters: chem.minimumStockLiters,
          expirationDate: chem.expirationDate
        })
      )
    })
  }
}
