import { IBeacon } from '../beacon/beacon.interface';

export class DetectedBeacon {
    beacon: IBeacon;
    type: string;
    side: string;
}
