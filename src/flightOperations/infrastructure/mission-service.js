import axios from 'axios';
import { ENDPOINTS, buildUrl } from '../../config/env.js';
import { Mission } from '../domain/mission.entity.js';

const API_URL = buildUrl(ENDPOINTS.missions);

export class MissionService {
    // Fetch missions from the backend and convert raw objects into domain entities.
    async getMissions() {
        try {
            const response = await axios.get(API_URL);
            const missions = Array.isArray(response.data) ? response.data : [];

            // Map the API payload into the Mission model used by the application.
            return missions.map(item => new Mission(
                item.id,
                item.farmArea ?? '',
                item.cropType ?? '',
                item.status ?? 'In progress',
                item.operator ?? '',
                item.date ?? new Date().toISOString()
            ));
        } catch (error) {
            console.error('Error fetching missions:', error);
            return [];
        }
    }

    // Send a new mission payload to the API and keep default values consistent.
    async createMission(missionData) {
        try {
            const payload = {
                ...missionData,
                status: missionData.status ?? 'In progress',
                progress: missionData.progress ?? 20,
                date: missionData.date ?? new Date().toISOString(),
            };

            const response = await axios.post(API_URL, payload);
            return response.data;
        } catch (error) {
            console.error('Error creating mission:', error);
            throw error;
        }
    }
}