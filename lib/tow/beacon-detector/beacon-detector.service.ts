import { Injectable } from '@angular/core';
import { BeaconRegistry } from '../beacon/beacon.registry.service';
import { BeaconConfig } from '../beacon/beacon.interface';

@Injectable()
export class BeaconDetector {
    constructor(private beaconRegistry: BeaconRegistry) {
    }

    detect(x: number, y: number): BeaconConfig {
        let nearestBeacon: BeaconConfig = null;

        const beacons = this.beaconRegistry.getBeacons();

        beacons.forEach((beaconConfig) => {
            if (!nearestBeacon) {
                nearestBeacon = beaconConfig;
            } else {
                const distanceToTop = Math.abs(y - beaconConfig.y - beaconConfig.height);
                // const distanceToBottom = Math.abs(y - beaconConfig.y + beaconConfig.height);

                const distanceToNearestTop = Math.abs(y - nearestBeacon.y - nearestBeacon.height);
                // const distanceToNearestBottom = Math.abs(y - nearestBeacon.y + nearestBeacon.height);

                if (distanceToTop < distanceToNearestTop/* || distanceToBottom < distanceToNearestBottom*/) {
                    nearestBeacon = beaconConfig;
                }
            }
        });

        return nearestBeacon;
    }
}