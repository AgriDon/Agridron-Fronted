export class Mission {
    constructor(id = null, farmArea = '', cropType = '', status = 'Pending', operator = '', date = '') {
        this.id = id;
        this.farmArea = farmArea;       // Área de fumigación seleccionada
        this.cropType = cropType;       // Tipo de cultivo seleccionado
        this.status = status;           // Estado: Pending, Started, In Progress, Paused, Completed
        this.operator = operator;       // Operador asignado
        this.date = date;
    }
}