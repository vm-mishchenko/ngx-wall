import { Injectable } from '@angular/core';
import { BeaconConfig } from './beacon.interface';

@Injectable()
export class BeaconRegistry {
    private beacons: Map<string, BeaconConfig> = new Map();

    register(beaconConfig: BeaconConfig) {
        this.beacons.set(beaconConfig.id, beaconConfig);
    }

    unRegister(id: string) {
        this.beacons.delete(id);
    }

    getBeacons() {
        return this.beacons;
    }
}