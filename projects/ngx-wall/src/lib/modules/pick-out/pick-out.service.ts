import {Injectable} from '@angular/core';
import {Subject, Subscription} from 'rxjs';
import {PickOutCoordinator} from './pick-out-coordinator.service';

@Injectable()
export class PickOutService {
    events: Subject<any> = new Subject();

    constructor(private pickOutCoordinator: PickOutCoordinator) {
        this.pickOutCoordinator.changes.subscribe((e) => {
            this.events.next(e);
        });
    }

    enablePickOut() {
        this.pickOutCoordinator.enablePickOut();
    }

    disablePickOut() {
        this.pickOutCoordinator.disablePickOut();
    }

    stopPickOut() {
        this.pickOutCoordinator.stopPickOut();
    }

    subscribe(fn): Subscription {
        return this.events.subscribe(fn);
    }
}
