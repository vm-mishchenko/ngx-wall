import { Inject, Injectable } from '@angular/core';
import { SpotDirective } from "./directive/radar.directive";
import { Subject } from "rxjs/Subject";
import { DOCUMENT } from "@angular/common";
import { Subscription } from "rxjs/Subscription";
import { SpotModel } from "./spot.model";
import { Observable } from 'rxjs/Rx';
import { WindowReference } from "./radar.tokens";
import { LocationUpdatedEvent } from "./events/location-updated.event";
import { DistanceToSpot } from "./interfaces/distance-to-spot.interface";

@Injectable()
export class RadarCoordinator {
    private spots: Map<SpotDirective, SpotModel> = new Map();

    private events: Subject<any> = new Subject();

    private moveObservable: Observable<MouseEvent>;

    private throttleMouseTime = 70;

    constructor(@Inject(DOCUMENT) doc,
                @Inject(WindowReference) _window: any) {
        this.moveObservable = Observable.fromEvent(doc, 'mousemove');

        this.moveObservable
            .throttleTime(this.throttleMouseTime)
            .subscribe((event) => {
                this.updateSpotPosition();

                // TODO: move to separete method
                const sortedSpots = this.getSortedSpotsByDistanceToPoint(event.x, event.y + _window.pageYOffset);
                this.events.next(new LocationUpdatedEvent(sortedSpots));
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

    private getSortedSpotsByDistanceToPoint(x: number, y: number): DistanceToSpot[] {
        const sortedSpots: DistanceToSpot[] = [];

        // TODO: improve algorithm - current implementation doesn't work for columns
        // maybe calculate nearest point to top left corner
        this.spots.forEach((spot) => {
            sortedSpots.push({
                distance: spot.getMinimalDistanceToPoint(x, y),
                data: spot.instance.data
            });
        });

        sortedSpots.sort((a: any, b: any) => {
            if (a.distance < b.distance) {
                return -1;
            } else if (a.distance > b.distance) {
                return 1;
            } else {
                return 0;
            }
        });

        return sortedSpots;
    }

    private updateSpotPosition() {
        this.spots.forEach((spot) => {
            spot.updatePosition();
        });
    }
}