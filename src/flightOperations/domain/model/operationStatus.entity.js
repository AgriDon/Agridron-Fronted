import {DroneStatus} from './dron-status.enum.ts.js';

export class OperationStatus {

    latitude;
    longitude;
    status;
    timestamp;
    missionId;

    constructor(latitude, longitude, status, timestamp, missionId = null) {

        this.latitude = latitude;
        this.longitude = longitude;
        this.status = status;
        this.timestamp = timestamp;
        this.missionId = missionId;
    }

    updateLocation(latitude, longitude, status) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.status = status;
    }

    get latitude() { return this.latitude; }
    get longitude() { return this.longitude; }
    get status() { return this.status; }
    get timestamp() { return this.timestamp; }

}