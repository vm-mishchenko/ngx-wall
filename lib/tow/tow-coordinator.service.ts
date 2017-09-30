import {Inject, Injectable} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {WindowReference} from './tow.tokens';
import {BeaconDetector} from './beacon-detector/beacon-detector.service';
import {PlaceholderRenderer} from './placeholder-renderer/placeholder-renderer.service';
import {Beacon} from './beacon/beacon.interface';
import {BeaconRegistry} from './beacon/beacon.registry.service';
import {Subject} from 'rxjs/Subject';
import {StartWorkingEvent} from './events/start-working.event';
import {WorkInProgressEvent} from './events/work-in-progress.event';
import {StopWorkingEvent} from './events/stop-working.event';
import {DropEvent} from './events/drop.event';

@Injectable()
export class TowCoordinator {
    events: Subject<any> = new Subject();

    private currentYScrollPosition = 0;

    private trackingPossibleBeacons = false;

    private doc;

    private window;

    private previousNearestBeacon: Beacon = null;

    constructor(@Inject(DOCUMENT) doc,
                @Inject(WindowReference) private _window: any,
                private placeholderRenderer: PlaceholderRenderer,
                private beaconDetector: BeaconDetector,
                private beaconRegistry: BeaconRegistry) {
        this.doc = doc;
        this.window = _window;

        this.doc.addEventListener('dragover', (event: DragEvent) => {
            if (this.trackingPossibleBeacons) {
                event.preventDefault();

                event.dataTransfer.dropEffect = 'move';

                this.slaveWorkProgress(event.x, event.y);
            }
        });

        this.window.addEventListener('scroll', () => {
            this.previousNearestBeacon = null;

            this.currentYScrollPosition = this.window.pageYOffset;

            this.placeholderRenderer.clear();
        });
    }

    slaveStartWorking(id: string) {
        this.startHighlightPossibleBeacons();

        this.events.next(new StartWorkingEvent());
    }

    slaveWorkProgress(xViewportPosition: number, yViewportPosition: number) {
        this.beaconRegistry.updateBeaconPositions();

        const beacons = this.beaconRegistry.getBeacons();

        const yPosition = yViewportPosition + this.currentYScrollPosition;

        const nearestBeacon = this.beaconDetector.getNearestBeacon(beacons, xViewportPosition, yPosition);

        if (nearestBeacon) {
            if (!this.previousNearestBeacon || this.previousNearestBeacon.id !== nearestBeacon.id) {
                this.previousNearestBeacon = nearestBeacon;

                this.placeholderRenderer.render(nearestBeacon.x, nearestBeacon.y + nearestBeacon.height - this.currentYScrollPosition, nearestBeacon.width);
            }
        } else {
            this.placeholderRenderer.clear();
        }

        this.events.next(new WorkInProgressEvent());
    }

    slaveStopWorking(id) {
        this.stopHighlightPossibleBeacons();
        this.placeholderRenderer.clear();
        this.events.next(new StopWorkingEvent());

        if (this.previousNearestBeacon) {
            const draggableId = id;
            const dropBeforeId = this.previousNearestBeacon.id;

            this.events.next(new DropEvent(draggableId, dropBeforeId));
        }

        this.previousNearestBeacon = null;
    }

    startHighlightPossibleBeacons() {
        this.trackingPossibleBeacons = true;
    }

    stopHighlightPossibleBeacons() {
        this.trackingPossibleBeacons = false;
    }
}