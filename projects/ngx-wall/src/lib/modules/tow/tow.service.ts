import {Injectable} from '@angular/core';
import {Subject, Subscription} from 'rxjs';
import {TowCoordinator} from './tow-coordinator.service';

@Injectable()
export class TowService {
    events: Subject<any> = new Subject();

    constructor(private towCoordinator: TowCoordinator) {
        this.towCoordinator.events.subscribe((e) => {
            this.events.next(e);
        });
    }

    subscribe(fn): Subscription {
        return this.events.subscribe(fn);
    }
}
