
import {MaintenanceType} from "@/flightOperations/domain/model/maintenance-type.enum.js";


export class MaintenanceRecord{

    /**
     * @param {Object} params
     * @param {number|string|null} [params.id]
     * @param {number|string|null} params.droneId - Drone that received the maintenance.
     * @param {string} params.date - Date of the maintenance (YYYY-MM-DD).
     * @param {string} [params.type] - One of MaintenanceType values.
     * @param {string} [params.description] - What was done.
     * @param {string} [params.technician] - Who performed it.
     */
    constructor({
                    id = null,
                    droneId = null,
                    date = '',
                    type = MaintenanceType.PREVENTIVE,
                    description = '',
                    technician = ''
                } = {}) {
        this.id = id
        this.droneId = droneId != null ? Number(droneId) : null
        this.date = date
        this.type = Object.values(MaintenanceType).includes(type) ? type : MaintenanceType.PREVENTIVE
        this.description = description
        this.technician = technician
    }


    /**
     *  true if type of maintenance is preventive
     * @returns {boolean}
     */
    isPreventive(){return this.type === MaintenanceType.PREVENTIVE}

    /**
     *  true if type of maintenance is corrective
     * @returns {boolean}
     */
    isCorrective(){return this.type === MaintenanceType.CORRECTIVE}


}

