
import { DroneStatus } from '@/flightOperations/domain/model/dron-status.enum.ts.js';

export class Drone {
    id;
    serialNumber;
    modelName;
    capacity;
    status;
    urlimg;

    constructor(id , serialNumber, modelName, capacity , status,urlimg) {

        //Pequeña validación, no es tan necesaria, pero es buena practica de program
        if (!Object.values(DroneStatus).includes(status)) {
            throw new Error(`Estado inválido: "${status}". Debe ser un valor de DroneStatus.`);
        }
        this.id = id;
        this.serialNumber = serialNumber;
        this.modelName = modelName;
        this.capacity = capacity;
        this.status = status
        this.urlimg = urlimg;
    }

    getId(){return this.id;}
    getSerialNumber(){return this.serialNumber;}
    getCapacity(){return this.capacity;}
    getStatus(){return this.status;}
    getUrlimg(){return this.urlimg;}

    assignToMission(){this.status = 'assignment';}
    updateStatus(status){this.status = status;}
    getLocation(){}

}