import { defineStore } from 'pinia';
import { MissionService } from '../infrastructure/mission-service.js';

const missionService = new MissionService();

export const useMissionStore = defineStore('mission', {
    state: () => ({
        missions: [],
        loading: false
    }),
    actions: async function() {
        // Load missions from the service and keep the UI state in sync.
        this.loading = true;
        try {
            // Fetch the latest mission list from the API layer.
            this.missions = await missionService.getMissions();
        } catch (error) {
            // Surface the failure without leaving the loading flag stuck.
            console.error("Error en store:", error);
        } finally {
            this.loading = false;
        }
    }
});