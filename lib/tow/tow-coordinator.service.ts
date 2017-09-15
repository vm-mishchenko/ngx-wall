import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { WindowReference } from './tow.tokens';
import { BeaconDetector } from './beacon-detector/beacon-detector.service';
import { PlaceholderRenderer } from './placeholder-renderer/placeholder-renderer.service';
import { BeaconConfig } from './beacon/beacon.interface';

@Injectable()
export class TowCoordinator {
    private currentYScrollPosition = 0;

    private trackingPossibleBeacons = true;

    previousNearestBeacon: BeaconConfig = null;

    private doc;
    private window;

    private mousemoveHandler(event) {
        if (this.trackingPossibleBeacons) {
            const xViewportPosition = event.clientX;
            const yViewportPosition = event.clientY;

            const yPosition = yViewportPosition + this.currentYScrollPosition;

            const nearestBeacon = this.beaconDetector.detect(xViewportPosition, yPosition);

            if (nearestBeacon) {
                if (!this.previousNearestBeacon || this.previousNearestBeacon.id !== nearestBeacon.id) {
                    this.previousNearestBeacon = nearestBeacon;
                    this.placeholderRenderer.render(nearestBeacon.x, nearestBeacon.y + nearestBeacon.height, nearestBeacon.width);
                }
            } else {
                this.placeholderRenderer.clear();
            }
        }
    }

    constructor(@Inject(DOCUMENT) doc,
                @Inject(WindowReference) private _window: any,
                private placeholderRenderer: PlaceholderRenderer,
                private beaconDetector: BeaconDetector) {
        this.doc = doc;
        this.window = _window;

        this.doc.addEventListener('mousemove', (e) => {
            this.mousemoveHandler(e);
        });

        this.window.addEventListener('scroll', () => {
            this.previousNearestBeacon = null;
            this.currentYScrollPosition = this.window.scrollY;
        });
    }

    slaveStartWorking(id: string) {
        console.log(`Slave ${id} start working`);

        this.startHighlightPossibleBeacons();
    }

    slaveStopWorking(id) {
        console.log(`Slave ${id} stop working`);

        this.stopHighlightPossibleBeacons();
    }

    startHighlightPossibleBeacons() {
        this.trackingPossibleBeacons = true;
    }

    stopHighlightPossibleBeacons() {
        this.trackingPossibleBeacons = false;
    }
}