import axios from 'axios';
import { ENDPOINTS, buildUrl } from '../../config/env.js';
import { Mission } from '../domain/mission.entity.js';

const API_URL = buildUrl(ENDPOINTS.missions);

export class MissionService {
    // Fetch missions from the backend and map them into domain entities.
    async getMissions() {
        try {
            const response = await axios.get(API_URL);
            const missions = Array.isArray(response.data) ? response.data : [];

            // Convert raw API response items into Mission domain models.
            return missions.map(item => new Mission(
                item.id,
                item.farmArea ?? '',
                item.cropType ?? '',
                item.status ?? 'Programada',
                item.operator ?? '',
                item.date ?? new Date().toISOString()
            ));
        } catch (error) {
            console.error('Error fetching missions:', error);
            return [];
        }
    }

    // Send a mission domain entity to the API and return the created entity.
    async createMission(missionEntity) {
        try {
            // Prepare the plain object payload for the backend request.
            const payload = {
                farmArea: missionEntity.farmArea,
                cropType: missionEntity.cropType,
                status: missionEntity.status,
                operator: missionEntity.operator,
                date: missionEntity.date
            };

            const response = await axios.post(API_URL, payload);
            const data = response.data;

            // Map the response back to a Mission domain entity.
            return new Mission(
                data.id,
                data.farmArea,
                data.cropType,
                data.status,
                data.operator,
                data.date
            );
        } catch (error) {
            console.error('Error creating mission:', error);
            throw error;
        }
    }
}