import {DOCUMENT} from '@angular/common';
import {Inject, Injectable, NgZone} from '@angular/core';
import {fromEvent, Observable} from 'rxjs';
import {shareReplay, throttleTime} from 'rxjs/operators';
import {SpotDirective} from './directive/spot.directive';
import {SpotId} from './interfaces/spot-id.type';
import {SpotModel} from './spot.model';

const THROTTLE_MOUSE_TIME = 30;

@Injectable()
export class RadarCoordinator {
    spots: Map<SpotId, SpotModel> = new Map();

    mouseMove$: Observable<MouseEvent>;

    constructor(@Inject(DOCUMENT) doc,
                private zone: NgZone) {
        this.mouseMove$ = fromEvent(doc, 'mousemove');

        // run outside Angular Zone in order to decrease performance hit
        this.zone.runOutsideAngular(() => {
            this.mouseMove$
                .pipe(
                    throttleTime(THROTTLE_MOUSE_TIME),
                    shareReplay(1)
                );
        });
    }

    register(spotId: SpotId, spotInstance: SpotDirective) {
        this.spots.set(spotId, new SpotModel(spotId, spotInstance, this));
    }

    unRegister(spotId: SpotId) {
        this.spots.get(spotId).onDestroy();
        this.spots.delete(spotId);
    }
}
