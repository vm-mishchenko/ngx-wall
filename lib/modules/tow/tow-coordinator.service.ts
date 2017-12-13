import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { BeaconDetector } from './beacon-detector/beacon-detector.service';
import { DetectedBeacon } from './beacon-detector/detected-beacon';
import { BeaconRegistry } from './beacon/beacon.registry.service';
import { DropEvent } from './events/drop.event';
import { StartWorkingEvent } from './events/start-working.event';
import { StopWorkingEvent } from './events/stop-working.event';
import { WorkInProgressEvent } from './events/work-in-progress.event';
import { PlaceholderRenderer } from './placeholder-renderer/placeholder-renderer.service';
import { TOW } from './tow.constant';
import { windowToken } from './tow.tokens';

@Injectable()
export class TowCoordinator {
    events: Subject<any> = new Subject();

    private currentYScrollPosition = 0;

    private trackingPossibleBeacons = false;

    private doc;

    private window;

    private previouslyNearestBeacon: DetectedBeacon = null;

    private placeholderHeight = 2;

    constructor(@Inject(DOCUMENT) doc,
                @Inject(windowToken) private windowReference: any,
                private placeholderRenderer: PlaceholderRenderer,
                private beaconDetector: BeaconDetector,
                private beaconRegistry: BeaconRegistry) {
        this.doc = doc;
        this.window = windowReference;

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
            const dropEvent = new DropEvent(
                draggableId,
                dropBeforeId,
                this.previouslyNearestBeacon.type,
                this.previouslyNearestBeacon.side
            );

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

        if (this.previouslyNearestBeacon.type === TOW.dropTypes.horizontal) {
            placeholderX = this.previouslyNearestBeacon.beacon.x;
            placeholderSize = this.previouslyNearestBeacon.beacon.width;

            if (this.previouslyNearestBeacon.side === TOW.dropSides.top) {
                placeholderY = this.previouslyNearestBeacon.beacon.y -
                    this.currentYScrollPosition -
                    this.placeholderHeight;
            }

            if (this.previouslyNearestBeacon.side === TOW.dropSides.bottom) {
                placeholderY = this.previouslyNearestBeacon.beacon.y +
                    this.previouslyNearestBeacon.beacon.height -
                    this.currentYScrollPosition;
            }

            placeholderIsHorizontal = true;
        }

        if (this.previouslyNearestBeacon.type === TOW.dropTypes.vertical) {
            placeholderY = this.previouslyNearestBeacon.beacon.y - this.currentYScrollPosition;
            placeholderSize = this.previouslyNearestBeacon.beacon.height;
            placeholderIsHorizontal = false;

            if (this.previouslyNearestBeacon.side === TOW.dropSides.left) {
                placeholderX = this.previouslyNearestBeacon.beacon.x;
            }

            if (this.previouslyNearestBeacon.side === TOW.dropSides.right) {
                placeholderX = this.previouslyNearestBeacon.beacon.x + this.previouslyNearestBeacon.beacon.width;
            }
        }

        this.placeholderRenderer.render(placeholderX, placeholderY, placeholderSize, placeholderIsHorizontal);
    }
}
