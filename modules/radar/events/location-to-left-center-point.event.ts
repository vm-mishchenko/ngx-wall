import { DistanceToSpot } from "../interfaces/distance-to-spot.interface";

export class LocationToLeftCenterPointEvent {
    constructor(public spots: DistanceToSpot[]) {
    }
}