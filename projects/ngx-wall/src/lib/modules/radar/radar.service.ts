import {DOCUMENT} from '@angular/common';
import {Inject, Injectable, NgZone} from '@angular/core';
import {Observable} from 'rxjs/internal/Observable';
import {fromEvent} from 'rxjs/internal/observable/fromEvent';
import {shareReplay, throttleTime} from 'rxjs/internal/operators';
import {SpotDirective} from './spot.directive';
import {SpotId} from './radar.interfaces';
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
        this.mouseMove$ = fromEvent(doc, 'mousemove');

        // run outside Angular Zone in order to decrease performance hit
        this.zone.runOutsideAngular(() => {
            this.mouseMove$
                .pipe(
                    throttleTime(THROTTLE_MOUSE_MOVE_TIME),
                    shareReplay(1)
                );
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
