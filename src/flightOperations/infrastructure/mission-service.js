import axios from 'axios';
import { ENDPOINTS, buildUrl } from '../../config/env.js';
import { Mission } from '../domain/mission.entity.js';

const API_URL = buildUrl(ENDPOINTS.missions);

export class MissionService {
    async getMissions() {
        try {
            const response = await axios.get(API_URL);
            const missions = Array.isArray(response.data) ? response.data : [];

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