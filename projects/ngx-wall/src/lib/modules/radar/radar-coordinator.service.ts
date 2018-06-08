import {DOCUMENT} from '@angular/common';
import {Inject, Injectable, NgZone} from '@angular/core';
import {fromEvent, Observable, Subject, Subscription} from 'rxjs';
import {throttleTime} from 'rxjs/operators';
import {SpotDirective} from './directive/spot.directive';
import {LocationUpdatedEvent} from './events/location-updated.event';
import {IDistanceToSpot} from './interfaces/distance-to-spot.interface';
import {SpotId} from './interfaces/spot-id.type';
import {SpotModel} from './spot.model';

@Injectable()
export class RadarCoordinator {
    private spots: Map<SpotId, SpotModel> = new Map();

    private events: Subject<any> = new Subject();

    private mouseMove$: Observable<MouseEvent>;

    constructor(@Inject(DOCUMENT) doc,
                private zone: NgZone) {
        this.mouseMove$ = fromEvent(doc, 'mousemove');

        const throttleMouseTime = 30;

        // run outside Angular Zone in order to decrease performance hit
        this.zone.runOutsideAngular(() => {
            this.mouseMove$
                .pipe(
                    throttleTime(throttleMouseTime)
                )
                .subscribe((event) => {
                    this.updateSpotsInfo();
                    this.updateLocationPosition(event.clientX, event.clientY);
                });
        });
    }

    register(spotId: SpotId, spotInstance: SpotDirective) {
        this.spots.set(spotId, new SpotModel(spotInstance));
    }

    unRegister(spotId: SpotId) {
        this.spots.delete(spotId);
    }

    updateSpotsInfo() {
        this.spots.forEach((spot) => spot.updateInfo());
    }

    filterSpots(predicate: (spot: SpotModel) => void): SpotModel[] {
        return Array.from(this.spots)
            .map(([id, spot]) => spot)
            .filter((spot) => predicate(spot));
    }

    subscribe(fn: any): Subscription {
        return this.events.subscribe(fn);
    }

    private updateLocationPosition(x: number, y: number) {
        const sortedSpots: IDistanceToSpot[] = [];

        this.spots.forEach((spot) => {
            const minimalDistance = spot.getMinimalDistanceToPoint(x, y);
            const topLeftPointDistance = spot.getDistanceToTopLeftPoint(x, y);
            const bottomLeftPointDistance = spot.getDistanceToBottomLeftPoint(x, y);
            const centerLeftPointDistance = spot.getDistanceToLeftCenterPoint(x, y);
            const isCross13Line = spot.isCross13Line(y);

            sortedSpots.push({
                minimalDistance,
                topLeftPointDistance,
                bottomLeftPointDistance,
                centerLeftPointDistance,
                isCross13Line,
                data: spot.data
            });
        });

        this.events.next(new LocationUpdatedEvent(sortedSpots));
    }
}
