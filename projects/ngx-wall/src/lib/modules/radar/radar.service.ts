import {Injectable} from '@angular/core';
import {Subject, Subscription} from 'rxjs';
import {RadarCoordinator} from './radar-coordinator.service';
import {SpotModel} from './spot.model';

@Injectable()
export class Radar {
    private events: Subject<any> = new Subject();

    constructor(private radarCoordinator: RadarCoordinator) {
        this.radarCoordinator.subscribe((event) => {
            this.events.next(event);
        });
    }

    filterSpots(fn: (spot: SpotModel) => void): SpotModel[] {
        return this.radarCoordinator.filterSpots(fn);
    }

    subscribe(fn: any): Subscription {
        return this.events.subscribe(fn);
    }
}
