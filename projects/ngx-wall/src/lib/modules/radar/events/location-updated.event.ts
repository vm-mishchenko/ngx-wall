import {IDistanceToSpot} from '../interfaces/distance-to-spot.interface';

export class LocationUpdatedEvent {
    constructor(public spots: IDistanceToSpot[]) {
    }
}
