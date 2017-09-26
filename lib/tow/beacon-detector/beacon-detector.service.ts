import {Injectable} from '@angular/core';
import {BeaconRegistry} from '../beacon/beacon.registry.service';
import {Beacon} from '../beacon/beacon.interface';

@Injectable()
export class BeaconDetector {
    constructor(private beaconRegistry: BeaconRegistry) {
    }

    getNearestBeacon(x: number, y: number): Beacon {
        let nearestBeacon: Beacon = null;

        const beacons = this.beaconRegistry.getBeacons();

        beacons.forEach((beacon) => {
            if (!nearestBeacon) {
                nearestBeacon = beacon;
            } else {
                const distanceToTop = Math.abs(y - beacon.y - beacon.height);
                // const distanceToBottom = Math.abs(y - beaconConfig.y + beaconConfig.height);

                const distanceToNearestTop = Math.abs(y - nearestBeacon.y - nearestBeacon.height);
                // const distanceToNearestBottom = Math.abs(y - nearestBeacon.y + nearestBeacon.height);

                if (distanceToTop < distanceToNearestTop/* || distanceToBottom < distanceToNearestBottom*/) {
                    nearestBeacon = beacon;
                }
            }
        });

        return nearestBeacon;
    }
}