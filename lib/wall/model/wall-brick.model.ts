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
        if (Object.keys(newState).length) {
            Object.assign(this.state, newState);
        } else {
            this.state = {};
        }
    }

    turnInto(tag: string) {
        this.tag = tag;

        this.updateState({});
    }
}
