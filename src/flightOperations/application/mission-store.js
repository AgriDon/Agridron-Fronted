import { defineStore } from 'pinia';
import { MissionService } from '../infrastructure/mission-service.js';

const missionService = new MissionService();

export const useMissionStore = defineStore('mission', {
    state: () => ({
        missions: [],
        loading: false
    }),
    actions: async function() {
        // Acciones para manejar las misiones
        this.loading = true;
        try {
            this.missions = await missionService.getMissions();
        } catch (error) {
            console.error("Error en store:", error);
        } finally {
            this.loading = false;
        }
    }
});