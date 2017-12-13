import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/throttleTime';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { SpotDirective } from './directive/radar.directive';
import { LocationUpdatedEvent } from './events/location-updated.event';
import { IDistanceToSpot } from './interfaces/distance-to-spot.interface';
import { windowToken } from './radar.tokens';
import { SpotModel } from './spot.model';

@Injectable()
export class RadarCoordinator {
    private spots: Map<SpotDirective, SpotModel> = new Map();

    private events: Subject<any> = new Subject();

    private moveObservable: Observable<MouseEvent>;

    private throttleMouseTime = 30;

    constructor(@Inject(DOCUMENT) doc,
                @Inject(windowToken) windowReference: any) {
        this.moveObservable = Observable.fromEvent(doc, 'mousemove');

        this.moveObservable
            .throttleTime(this.throttleMouseTime)
            .subscribe((event) => {
                this.updateSpotPosition();

                const x = event.x;
                const y = event.y + windowReference.pageYOffset;

                this.updateLocationPosition(x, y);
            });
    }

    register(spotInstance: SpotDirective) {
        this.spots.set(spotInstance, new SpotModel(spotInstance));
    }

    unRegister(spotInstance: SpotDirective) {
        this.spots.delete(spotInstance);
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
                data: spot.instance.data
            });
        });

        this.events.next(new LocationUpdatedEvent(sortedSpots));
    }

    private updateSpotPosition() {
        this.spots.forEach((spot) => {
            spot.updatePosition();
        });
    }
}
