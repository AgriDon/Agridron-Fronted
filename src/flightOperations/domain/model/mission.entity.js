
import {MissionStatus} from '/src/flightOperations/domain/model/mission-status.enum.ts.js'

export class Mission {

    id;
    code;
    scheduledDate;
    plannedArea;
    treatedArea;
    missionStatus;

    //Los separo pq son atributos que depende de otras clases
    dronAssigned;
    incidents;
    operationStatus;


    constructor(id, code, scheduledDate, plannedArea, treatedArea, dron = null,  incidents = [] , operations = []) {

        this.id = id;
        this.code = code;
        this.scheduledDate = scheduledDate;
        this.missionStatus = MissionStatus.PLANNED;
        this.plannedArea = plannedArea;
        this.treatedArea = treatedArea;

        this.dronAssigned = dron;
        this.incidents = incidents;
        this.operationStatus = operations;


    }


    //Faltan2metodos

    start(){this.missionStatus = MissionStatus.IN_PROGRESS;}
    pause(){this.missionStatus = MissionStatus.PAUSED;}
    complete(){this.missionStatus = MissionStatus.COMPLETED;}
    cancel(){this.missionStatus = MissionStatus.CANCELLED;}


}