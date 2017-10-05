import { Injectable } from '@angular/core';
import { Beacon, BeaconConfig } from './beacon.interface';

@Injectable()
export class BeaconRegistry {
    private beaconConfigs: Map<string, BeaconConfig> = new Map();
    private beacons: Map<string, Beacon> = new Map();

    register(beaconConfig: BeaconConfig) {
        this.beaconConfigs.set(beaconConfig.id, beaconConfig);

        this.updateBeaconPositions();
    }

    unRegister(id: string) {
        this.beaconConfigs.delete(id);
    }

    getBeacons() {
        return Array.from(this.beacons).map((beaconArray) => beaconArray[1]);
    }

    updateBeaconPositions() {
        this.beacons = new Map();

        this.beaconConfigs.forEach((beacon, id) => {
            const position = beacon.api.getPosition();

            this.beacons.set(id, {
                id: id,
                x: position.x,
                y: position.y,
                width: position.width,
                height: position.height
            });
        });
    }
}