import { defineStore } from 'pinia';
import { MissionUseCases } from './mission-use-cases.js';

// Instantiate use cases to handle application logic flow.
const missionUseCases = new MissionUseCases();

export const useMissionStore = defineStore('mission', {
    state: () => ({
        missions: [],
        loading: false
    }),
    actions: {
        async fetchMissions() {
            // Load missions from the application layer and keep the UI state in sync.
            this.loading = true;
            try {
                // Use the public application contract instead of an undefined infrastructure shortcut.
                this.missions = await missionUseCases.listMissions();
            } catch (error) {
                // Surface the failure without leaving the loading flag stuck.
                console.error('Error in mission store:', error);
            } finally {
                this.loading = false;
            }
        }
    }
});