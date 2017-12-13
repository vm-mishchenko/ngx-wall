import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export class BrickStorage {
    state: BehaviorSubject<any> = null;

    constructor(public id: string,
                public tag: string,
                public data,
                public meta: any) {
        this.state = new BehaviorSubject(data);
    }

    updateState(state: any) {
        this.data = state;

        this.state.next(state);
    }
}
