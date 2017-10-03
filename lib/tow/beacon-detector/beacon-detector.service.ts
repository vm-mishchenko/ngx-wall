import {Injectable} from '@angular/core';
import {Beacon} from '../beacon/beacon.interface';
import {DetectedBeacon} from "./detected-beacon";

@Injectable()
export class BeaconDetector {
    getNearestBeacon(beacons: Beacon[], x: number, y: number): DetectedBeacon {
        let detected = new DetectedBeacon();

        beacons.forEach((beacon) => {
            if (!detected.beacon) {
                detected.beacon = beacon;
            } else {
                //const minimalDistanceToBeacon = this.getMinimumDistance(beacon, x, y);
                //const minimalDistanceToPreviousBeacon = this.getMinimumDistance(detected.beacon, x, y);

                const beaconPosition = this.getMinimumDistance(beacon, x, y);
                const previousBeaconPosition = this.getMinimumDistance(detected.beacon, x, y);

                if (!previousBeaconPosition.inSide) {
                    if (beaconPosition.inSide) {
                        console.log('inside')
                        console.log(beacon.height);
                        detected.beacon = beacon;
                    } else {
                        if (beaconPosition.distances[0] < previousBeaconPosition.distances[0]) {
                            detected.beacon = beacon;
                        }

                        if (beaconPosition.distances[0] === previousBeaconPosition.distances[0]) {
                            if (beaconPosition.distances[1] === previousBeaconPosition.distances[1]) {
                                if (beaconPosition.isCrossBeacon) {
                                    detected.beacon = beacon;
                                }
                            }

                            if (beaconPosition.distances[1] < previousBeaconPosition.distances[1]) {
                                detected.beacon = beacon;
                            }
                        }
                    }
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

        console.log(detected.beacon.height)

        return detected;
    }

    private getMinimumDistance(beacon: Beacon, x: number, y: number) {
        const position = {
            distances: [],
            isCrossBeacon: false,
            inSide: false
        };

        position.distances.push(Math.min.apply(null, [Math.abs(beacon.y - y), Math.abs((beacon.y + beacon.height) - y)]));
        position.distances.push(Math.min.apply(null, [Math.abs(beacon.x - x), Math.abs((beacon.x + beacon.width) - x)]));

        /*position.distances.push(Math.abs(beacon.y - y)); // line 1-2
        position.distances.push(Math.abs((beacon.y + beacon.height) - y)); // line 4-3
        position.distances.push(Math.abs(beacon.x - x)); // line 1-4
        position.distances.push(Math.abs((beacon.x + beacon.width) - x)); // line 2-3*/


        if ((x > beacon.x) && (x < beacon.x + beacon.width)) {
            position.isCrossBeacon = true;
        }

        if ((y > beacon.y) && (y < beacon.y + beacon.height)) {
            position.isCrossBeacon = true;
        }


        if ((x > beacon.x) && (x < beacon.x + beacon.width) && (y > beacon.y) && (y < beacon.y + beacon.height)) {
            position.inSide = true;
        }

        /*
                const topLeft = [beacon.x, beacon.y];
                const topRight = [beacon.x + beacon.width, beacon.y];
                const bottomLeft = [beacon.x, beacon.y + beacon.height];
                const bottomRight = [beacon.x + beacon.width, beacon.y + beacon.height];

                distances.push(this.calculateDistanceToPoint(topLeft[0], topLeft[1], x, y));
                distances.push(this.calculateDistanceToPoint(topRight[0], topRight[1], x, y));
                distances.push(this.calculateDistanceToPoint(bottomLeft[0], bottomLeft[1], x, y));
                distances.push(this.calculateDistanceToPoint(bottomRight[0], bottomRight[1], x, y));*/

        return position;

        // return Math.min.apply(null, distances);
    }

    private calculateDistanceToPoint(beaconX, beaconY, x, y) {
        return Math.sqrt(Math.abs(beaconX - x) * Math.abs(beaconX - x) + Math.abs(beaconY - y) * Math.abs(beaconY - y));
    }
}