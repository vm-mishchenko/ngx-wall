import { DistanceToSpot } from "../interfaces/distance-to-spot.interface";

export class LocationUpdatedEvent {
    constructor(public spots: DistanceToSpot[]) {
    }
}