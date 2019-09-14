import {Injectable} from '@angular/core';
import {SpotId} from './interfaces/spot-id.type';
import {RadarCoordinator} from './radar-coordinator.service';
import {SpotModel} from './spot.model';

/**
 * Public API for Radar functionality.
 */
@Injectable()
export class Radar {
    constructor(private radarCoordinator: RadarCoordinator) {
    }

    filterSpots(predicate: (spot: SpotModel) => boolean): SpotModel[] {
        return Array.from(this.radarCoordinator.spots)
            .map(([id, spot]) => spot)
            .filter((spot) => predicate(spot));
    }

    spot(spotId: SpotId) {
        return this.radarCoordinator.spots.get(spotId);
    }
}
