import { MissionService } from '../infrastructure/mission-service.js';
import { Mission } from '../domain/mission.entity.js';

export class MissionUseCases {
  #service

  constructor(service = new MissionService()) {
    this.#service = service;
  }

  // Request the current mission list from the infrastructure layer.
  listMissions = () => this.#service.getMissions();

  // Keep the application contract stable for stores and views.
  getAllMissions = () => this.listMissions();

  createMission = async (payload) => {
    // Normalize missing values before instantiating the domain entity.
    const farmArea = payload.farmArea ?? payload.parcelName ?? 'Sin parcela';
    const cropType = payload.cropType ?? 'Sin cultivo';
    const status = payload.status ?? 'Programada';
    const operator = payload.operator ?? 'Juan Pérez';
    const date = payload.date ?? new Date().toISOString();

    // Create and validate the mission entity using domain rules.
    const missionEntity = new Mission(
        payload.id ?? null,
        farmArea,
        cropType,
        status,
        operator,
        date
    );

    // Persist the validated mission entity through the infrastructure service.
    return this.#service.createMission(missionEntity);
  }

  saveMission = (payload) => this.createMission(payload);
}