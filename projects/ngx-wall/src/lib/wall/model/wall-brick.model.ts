import {IBrickSnapshot} from './interfaces/brick-snapshot.interface';

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

        return this;
    }

    turnInto(tag: string) {
        this.tag = tag;

        this.updateState({});

        return this;
    }

    getSnapshot(): IBrickSnapshot {
        return {
            id: this.id,
            tag: this.tag,
            meta: this.meta,
            state: this.getState()
        };
    }
}
