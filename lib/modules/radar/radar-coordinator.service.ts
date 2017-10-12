import { Inject, Injectable } from '@angular/core';
import { SpotDirective } from "./directive/radar.directive";
import { Subject } from "rxjs/Subject";
import { DOCUMENT } from "@angular/common";
import { Subscription } from "rxjs/Subscription";
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/throttleTime';
import { SpotModel } from "./spot.model";
import { WindowReference } from "./radar.tokens";
import { LocationUpdatedEvent } from "./events/location-updated.event";
import { DistanceToSpot } from "./interfaces/distance-to-spot.interface";

@Injectable()
export class RadarCoordinator {
    private spots: Map<SpotDirective, SpotModel> = new Map();

    private events: Subject<any> = new Subject();

    private moveObservable: Observable<MouseEvent>;

    private throttleMouseTime = 30;

    constructor(@Inject(DOCUMENT) doc,
                @Inject(WindowReference) _window: any) {
        this.moveObservable = Observable.fromEvent(doc, 'mousemove');

        this.moveObservable
            .throttleTime(this.throttleMouseTime)
            .subscribe((event) => {
                this.updateSpotPosition();

                const x = event.x;
                const y = event.y + _window.pageYOffset;

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
        const sortedSpots: DistanceToSpot[] = [];

        this.spots.forEach((spot) => {
            const minimalDistance = spot.getMinimalDistanceToPoint(x, y);
            const topLeftPointDistance = spot.getDistanceToTopLeftPoint(x, y);
            const bottomLeftPointDistance = spot.getDistanceToBottomLeftPoint(x, y);
            const centerLeftPointDistance = spot.getDistanceToLeftCenterPoint(x, y);
            const isCross13Line = spot.isCross13Line(y);

            sortedSpots.push({
                minimalDistance: minimalDistance,
                topLeftPointDistance: topLeftPointDistance,
                bottomLeftPointDistance: bottomLeftPointDistance,
                centerLeftPointDistance: centerLeftPointDistance,
                isCross13Line: isCross13Line,
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