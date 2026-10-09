export class Incident {
    id;
    type;
    description;
    occurredAt;
    missionId;

    constructor(id, type, description, occurredAt, missionId = null) {
        this.id = id;
        this.type = type;
        this.description = description;
        this.occurredAt = occurredAt; //Por ahora es solo un simple string, ya luego cambiare a un dato que sea realmente de tipo date.
        this.missionId = missionId;
    }

    get id() { return this.id;}

    get type() { return this.type;}

    get description() { return this.description;}

    get occurredAt() { return this.occurredAt;}

    register() {}
    update(){}
}
