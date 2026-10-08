export class Mission {
    constructor(id = null, farmArea = '', cropType = '', status = 'Programada', operator = '', date = '') {
        // Validate state before instantiation to protect invariants.
        this.status = Mission.normalizeStatus(status);
        this.validateState(this.status);
        this.id = id;
        this.farmArea = farmArea;
        this.cropType = cropType;
        this.operator = operator;
        this.date = date;
    }

    static normalizeStatus(status) {
        const normalized = String(status ?? 'Programada').trim();
        const statusMap = {
            PLANNED: 'Programada',
            PROGRAMADA: 'Programada',
            SCHEDULED: 'Programada',
            IN_PROGRESS: 'En curso',
            EN_PROGRESO: 'En curso',
            ACTIVE: 'En curso',
            STARTED: 'Iniciada',
            INICIADA: 'Iniciada',
            PAUSED: 'Pausada',
            PAUSADA: 'Pausada',
            COMPLETED: 'Completada',
            COMPLETADA: 'Completada',
            CANCELLED: 'Cancelada',
            CANCELADA: 'Cancelada',
            AUTHORIZED: 'Autorizada',
            AUTORIZADA: 'Autorizada'
        };

        return statusMap[normalized.toUpperCase()] ?? normalized;
    }

    // Ensure the mission status is within allowed values.
    validateState(status) {
        const validStatuses = ['Programada', 'Iniciada', 'En curso', 'Pausada', 'Completada', 'Cancelada', 'Autorizada'];
        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
        }
    }

    // Domain behavior to transition a mission to the started state.
    startMission() {
        if (this.status !== 'Programada') {
            throw new Error('Only scheduled missions can be started.');
        }
        this.status = 'Iniciada';
    }

    // Domain behavior to mark the mission as successfully completed.
    completeMission() {
        if (this.status === 'Completada') {
            throw new Error('Mission is already completed.');
        }
        this.status = 'Completada';
    }
}