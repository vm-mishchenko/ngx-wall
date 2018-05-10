import {Injectable} from '@angular/core';
import {Subject, Subscription} from 'rxjs';
import {PickOutCoordinator} from './pick-out-coordinator.service';

@Injectable()
export class PickOutService {
    events: Subject<any> = new Subject();

    constructor(private pickOutHandlerService: PickOutCoordinator) {
        this.pickOutHandlerService.changes.subscribe((e) => {
            this.events.next(e);
        });
    }

    enablePickOut() {
        this.pickOutHandlerService.enablePickOut();
    }

    disablePickOut() {
        this.pickOutHandlerService.disablePickOut();
    }

    stopPickOut() {
        this.pickOutHandlerService.stopPickOut();
    }

    subscribe(fn): Subscription {
        return this.events.subscribe(fn);
    }
}
