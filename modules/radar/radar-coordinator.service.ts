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
import { LocationToTopLeftPointEvent } from "./events/location-to-top-left-point.event";
import { LocationToLeftCenterPointEvent } from "./events/location-to-left-center-point.event";

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
                this.updateLocationToLeftTopPoint(x, y);
                this.updateLocationToLeftCenterPoint(x, y);
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
        const sortedSpots = this.getSortedSpotsByDistanceToPoint(x, y);

        this.events.next(new LocationUpdatedEvent(sortedSpots));
    }

    private updateLocationToLeftTopPoint(x: number, y: number) {
        const sortedSpots = this.getSortedSpotsByDistanceToTopLeftPoint(x, y);

        this.events.next(new LocationToTopLeftPointEvent(sortedSpots));
    }

    private updateLocationToLeftCenterPoint(x: number, y: number) {
        const sortedSpots = this.getSortedSpotsByDistanceToLeftCenterPoint(x, y);

        this.events.next(new LocationToLeftCenterPointEvent(sortedSpots));
    }

    // todo refactor below methods
    private getSortedSpotsByDistanceToPoint(x: number, y: number): DistanceToSpot[] {
        const sortedSpots: DistanceToSpot[] = [];

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

    private getSortedSpotsByDistanceToTopLeftPoint(x: number, y: number): DistanceToSpot[] {
        const sortedSpots: DistanceToSpot[] = [];

        this.spots.forEach((spot) => {
            sortedSpots.push({
                distance: spot.getDistanceToTopLeftPoint(x, y),
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

    private getSortedSpotsByDistanceToLeftCenterPoint(x: number, y: number): DistanceToSpot[] {
        const sortedSpots: DistanceToSpot[] = [];

        this.spots.forEach((spot) => {
            sortedSpots.push({
                distance: spot.getDistanceToLeftCenterPoint(x, y),
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