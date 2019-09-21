import {DOCUMENT} from '@angular/common';
import {Inject, Injectable, NgZone} from '@angular/core';
import {fromEvent, Observable, Subject} from 'rxjs';
import {shareReplay, throttleTime} from 'rxjs/operators';
import {SpotId} from './radar.interfaces';
import {SpotDirective} from './spot.directive';
import {SpotModel} from './spot.model';

const THROTTLE_MOUSE_MOVE_TIME = 30;

@Injectable({
    providedIn: 'root'
})
export class Radar {
    spots: Map<SpotId, SpotModel> = new Map();

    mouseMove$: Observable<MouseEvent>;

    constructor(@Inject(DOCUMENT) doc,
                private zone: NgZone) {
        this.mouseMove$ = new Subject<MouseEvent>().pipe(
            shareReplay(1)
        );

        // run outside Angular Zone in order to decrease performance hit
        this.zone.runOutsideAngular(() => {
            fromEvent<MouseEvent>(doc, 'mousemove').pipe(
                throttleTime(THROTTLE_MOUSE_MOVE_TIME),
                shareReplay(1)
            ).subscribe((event) => {
                (this.mouseMove$ as Subject<MouseEvent>).next(event);
            });
        });
    }

    registerSpot(spotId: SpotId, spotInstance: SpotDirective) {
        this.spots.set(spotId, new SpotModel(spotId, spotInstance, this));
    }

    unRegisterSpot(spotId: SpotId) {
        this.spots.get(spotId).onDestroy();
        this.spots.delete(spotId);
    }
}
