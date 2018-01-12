export class WallBrick {
    id: string;
    tag: string;
    meta: any;
    state: any = {};

    constructor(id: string, tag: string, meta: any) {
        this.id = id;
        this.tag = tag;
        this.meta = meta;
    }

    getState(): any {
        return JSON.parse(JSON.stringify(this.state));
    }

    updateState(newState) {
        this.state = newState;
    }

    turnInto(tag: string) {
        this.tag = tag;

        this.updateState({});
    }
}
