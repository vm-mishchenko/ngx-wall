import { Injectable } from '@angular/core';
import { Beacon } from '../beacon/beacon.interface';

@Injectable()
export class BeaconDetector {

    getNearestBeacon(beacons: Beacon[], x: number, y: number): Beacon {
        let nearestBeacon: Beacon = null;

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