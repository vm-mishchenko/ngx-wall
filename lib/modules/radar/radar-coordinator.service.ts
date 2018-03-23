import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/throttleTime';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { SpotDirective } from './directive/spot.directive';
import { LocationUpdatedEvent } from './events/location-updated.event';
import { IDistanceToSpot } from './interfaces/distance-to-spot.interface';
import { SpotId } from './interfaces/spot-id.type';
import { SpotModel } from './spot.model';

@Injectable()
export class RadarCoordinator {
    private spots: Map<SpotId, SpotModel> = new Map();

    private events: Subject<any> = new Subject();

    private mouseMove$: Observable<MouseEvent>;

    constructor(@Inject(DOCUMENT) doc) {
        this.mouseMove$ = Observable.fromEvent(doc, 'mousemove');

        const throttleMouseTime = 30;

        this.mouseMove$
            .throttleTime(throttleMouseTime)
            .subscribe((event) => {
                this.updateSpotsInfo();

                const x = event.x;
                const y = event.y + window.pageYOffset;

                this.updateLocationPosition(x, y);
            });
    }

    register(spotId: SpotId, spotInstance: SpotDirective) {
        // todo: notify when new spots added
        this.spots.set(spotId, new SpotModel(spotInstance));
    }

    unRegister(spotId: SpotId) {
        // todo: notify when spot was removed
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

    getMinimumDistance(spot: SpotModel, x: number, y: number) {

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
