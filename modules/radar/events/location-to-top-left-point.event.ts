import { DistanceToSpot } from "../interfaces/distance-to-spot.interface";

export class LocationToTopLeftPointEvent {
    constructor(public spots: DistanceToSpot[]) {
    }
}