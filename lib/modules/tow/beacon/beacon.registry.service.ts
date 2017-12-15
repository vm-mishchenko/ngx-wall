import { Injectable } from '@angular/core';
import { Radar, SpotModel } from '../../radar';

@Injectable()
export class BeaconRegistry {
    constructor(private radar: Radar) {
    }

    getBeacons() {
        this.radar.updateSpotsInfo();

        return this.radar.filterSpots((spot: SpotModel) => spot.data.isBeacon)
            .map((beacon) => {
                return {
                    id: beacon.data.brickId,
                    x: beacon.position.x,
                    y: beacon.position.y,
                    width: beacon.size.width,
                    height: beacon.size.height
                };
            });
    }
}
