import {IDistanceToSpot} from '../interfaces/distance-to-spot.interface';

export class LocationToTopLeftPointEvent {
    constructor(public spots: IDistanceToSpot[]) {
    }
}
