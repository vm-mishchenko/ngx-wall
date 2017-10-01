import {Injectable} from '@angular/core';
import {Beacon} from '../beacon/beacon.interface';
import {DetectedBeacon} from "./detected-beacon";

@Injectable()
export class BeaconDetector {

    getNearestBeacon(beacons: Beacon[], x: number, y: number): DetectedBeacon {
        let detected = new DetectedBeacon();

        // TODO: need to support columns for defining nearest beacon
        beacons.forEach((beacon) => {
            if (!detected.beacon) {
                detected.beacon = beacon;
            } else {
                const distanceToTop = Math.abs(y - beacon.y - beacon.height);

                const distanceToNearestTop = Math.abs(y - detected.beacon.y - detected.beacon.height);

                if (distanceToTop < distanceToNearestTop) {
                    detected.beacon = beacon;
                }
            }
        });

        if (detected.beacon) {
            if (x < detected.beacon.x) {
                detected.type = 'vertical';
                detected.side = 'left';
            }

            if (x > detected.beacon.x + detected.beacon.width) {
                detected.type = 'vertical';
                detected.side = 'right';
            }

            if (x > detected.beacon.x && x < detected.beacon.x + detected.beacon.width) {
                detected.type = 'horizontal';
            }
        }

        return detected;
    }
}