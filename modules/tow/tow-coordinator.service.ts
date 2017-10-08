import {Inject, Injectable} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {WindowReference} from './tow.tokens';
import {BeaconDetector} from './beacon-detector/beacon-detector.service';
import {PlaceholderRenderer} from './placeholder-renderer/placeholder-renderer.service';
import {BeaconRegistry} from './beacon/beacon.registry.service';
import {Subject} from 'rxjs/Subject';
import {StartWorkingEvent} from './events/start-working.event';
import {WorkInProgressEvent} from './events/work-in-progress.event';
import {StopWorkingEvent} from './events/stop-working.event';
import {DropEvent} from './events/drop.event';
import {DetectedBeacon} from "./beacon-detector/detected-beacon";

@Injectable()
export class TowCoordinator {
    events: Subject<any> = new Subject();

    private currentYScrollPosition = 0;

    private trackingPossibleBeacons = false;

    private doc;

    private window;

    private previouslyNearestBeacon: DetectedBeacon = null;

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
            this.previouslyNearestBeacon = null;

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

        // respect window scroll position
        const yPosition = yViewportPosition + this.currentYScrollPosition;

        const detectedBeacon = this.beaconDetector.getNearestBeacon(beacons, xViewportPosition, yPosition);

        if (detectedBeacon) {
            if (this.isSameDetectedBeacon(detectedBeacon)) {
                this.previouslyNearestBeacon = detectedBeacon;

                this.renderPlaceholder();
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

        if (this.previouslyNearestBeacon) {
            const draggableId = id;
            const dropBeforeId = this.previouslyNearestBeacon.beacon.id;
            const dropEvent = new DropEvent(draggableId, dropBeforeId, this.previouslyNearestBeacon.type, this.previouslyNearestBeacon.side);

            this.events.next(dropEvent);
        }

        this.previouslyNearestBeacon = null;
    }

    startHighlightPossibleBeacons() {
        this.trackingPossibleBeacons = true;
    }

    stopHighlightPossibleBeacons() {
        this.trackingPossibleBeacons = false;
    }

    private isSameDetectedBeacon(detectedBeacon) {
        return !this.previouslyNearestBeacon ||
            this.previouslyNearestBeacon.beacon.id !== detectedBeacon.beacon.id ||
            this.previouslyNearestBeacon.type !== detectedBeacon.type ||
            this.previouslyNearestBeacon.side !== detectedBeacon.side;
    }

    private renderPlaceholder() {
        let placeholderX;
        let placeholderY;
        let placeholderSize;
        let placeholderIsHorizontal;

        if (this.previouslyNearestBeacon.type === 'horizontal') {
            placeholderX = this.previouslyNearestBeacon.beacon.x;
            placeholderY = this.previouslyNearestBeacon.beacon.y + this.previouslyNearestBeacon.beacon.height - this.currentYScrollPosition;
            placeholderSize = this.previouslyNearestBeacon.beacon.width;
            placeholderIsHorizontal = true;
        }

        if (this.previouslyNearestBeacon.type === 'vertical') {
            placeholderY = this.previouslyNearestBeacon.beacon.y - this.currentYScrollPosition;
            placeholderSize = this.previouslyNearestBeacon.beacon.height;
            placeholderIsHorizontal = false;

            if (this.previouslyNearestBeacon.side === 'left') {
                placeholderX = this.previouslyNearestBeacon.beacon.x;
            }

            if (this.previouslyNearestBeacon.side === 'right') {
                placeholderX = this.previouslyNearestBeacon.beacon.x + this.previouslyNearestBeacon.beacon.width;
            }
        }

        this.placeholderRenderer.render(placeholderX, placeholderY, placeholderSize, placeholderIsHorizontal);
    }
}