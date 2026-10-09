import { DroneStatus } from './dron-status.enum.js'

/**
 * Domain entity representing a Drone in Flight Operations.
 */
export class Drone {
  id
  serialNumber
  modelName
  capacity
  status
  urlimg

  constructor(id, serialNumber, modelName, capacity, status = DroneStatus.AVAILABLE, urlimg = '') {
    if (!Object.values(DroneStatus).includes(status)) {
      throw new Error(`Estado inválido: "${status}". Debe ser un valor de DroneStatus.`)
    }
    this.id = id
    this.serialNumber = serialNumber
    this.modelName = modelName
    this.capacity = capacity
    this.status = status
    this.urlimg = urlimg
  }

  getId() { return this.id }
  getSerialNumber() { return this.serialNumber }
  getCapacity() { return this.capacity }
  getStatus() { return this.status }
  getUrlimg() { return this.urlimg }

  assignToMission() { this.status = DroneStatus.ASSIGNED }
  updateStatus(status) {
    if (!Object.values(DroneStatus).includes(status)) {
      throw new Error(`Estado inválido: "${status}". Debe ser un valor de DroneStatus.`)
    }
    this.status = status
  }
}