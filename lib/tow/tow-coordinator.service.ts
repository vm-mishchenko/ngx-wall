import {Inject, Injectable} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {WindowReference} from './tow.tokens';
import {BeaconDetector} from './beacon-detector/beacon-detector.service';
import {PlaceholderRenderer} from './placeholder-renderer/placeholder-renderer.service';
import {Beacon} from './beacon/beacon.interface';
import {BeaconRegistry} from "./beacon/beacon.registry.service";

@Injectable()
export class TowCoordinator {
    private currentYScrollPosition = 0;

    private trackingPossibleBeacons = false;

    previousNearestBeacon: Beacon = null;

    private doc;
    private window;

    private mousemoveHandler(event) {
        this.beaconRegistry.updateBeaconPositions();

        if (this.trackingPossibleBeacons) {
            const xViewportPosition = event.clientX;
            const yViewportPosition = event.clientY;

            const yPosition = yViewportPosition + this.currentYScrollPosition;

            const nearestBeacon = this.beaconDetector.getNearestBeacon(xViewportPosition, yPosition);

            if (nearestBeacon) {
                if (!this.previousNearestBeacon || this.previousNearestBeacon.id !== nearestBeacon.id) {
                    this.previousNearestBeacon = nearestBeacon;
                    this.placeholderRenderer.render(nearestBeacon.x, nearestBeacon.y + nearestBeacon.height - this.currentYScrollPosition, nearestBeacon.width);
                }
            } else {
                this.placeholderRenderer.clear();
            }
        }
    }

    private mouseUpHandler(event) {
        this.stopHighlightPossibleBeacons();
        this.placeholderRenderer.clear();
    }

    constructor(@Inject(DOCUMENT) doc,
                @Inject(WindowReference) private _window: any,
                private placeholderRenderer: PlaceholderRenderer,
                private beaconDetector: BeaconDetector,
                private beaconRegistry: BeaconRegistry) {
        this.doc = doc;
        this.window = _window;

        this.doc.addEventListener('dragstart', (e) => {
            this.mousemoveHandler(e);
        });

        this.doc.addEventListener('drag', (e) => {
            this.mousemoveHandler(e);
        });

        this.doc.addEventListener('dragend', (e) => {
            this.mouseUpHandler(e);
        });

        this.doc.addEventListener('mouseup', (e) => {
            this.mouseUpHandler(e);
        });

        this.window.addEventListener('scroll', () => {
            this.previousNearestBeacon = null;

            this.currentYScrollPosition = this.window.pageYOffset;

            this.placeholderRenderer.clear();
        });
    }

    slaveStartWorking(id: string) {
        console.log(`${id} slave start working`);

        this.beaconRegistry.updateBeaconPositions();

        this.startHighlightPossibleBeacons();
    }

    slaveStopWorking(id) {
        console.log(`${id} slave stop working`);

        this.stopHighlightPossibleBeacons();
    }

    startHighlightPossibleBeacons() {
        this.trackingPossibleBeacons = true;
    }

    stopHighlightPossibleBeacons() {
        this.trackingPossibleBeacons = false;
    }
}