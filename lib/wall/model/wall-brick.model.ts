import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export class WallBrick {
    id: string;
    tag: string;
    meta: any;
    state: BehaviorSubject<any> = new BehaviorSubject({});

    constructor(id: string, tag: string, meta: any) {
        this.id = id;
        this.tag = tag;
        this.meta = meta;
    }

    updateState(newState) {
        this.state.next(newState);
    }

    turnInto(tag: string) {
        this.tag = tag;

        this.updateState({});
    }
}
