import {Beacon} from "../beacon/beacon.interface";

export class DetectedBeacon {
    beacon: Beacon;
    type: 'horizontal' | 'vertical';
    side: 'left' | 'right'
}