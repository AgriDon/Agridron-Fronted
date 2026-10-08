export class Mission {
    constructor(id = null, farmArea = '', cropType = '', status = 'Pending', operator = '', date = '') {
        this.id = id;
        // Selected field area for the mission.
        this.farmArea = farmArea;
        // Crop type associated with the mission.
        this.cropType = cropType;
        // Current mission state such as Pending, Started, In Progress, Paused, or Completed.
        this.status = status;
        // Assigned operator in charge of the mission.
        this.operator = operator;
        // Planned execution date for the mission.
        this.date = date;
    }
}