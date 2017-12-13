import { Injectable } from '@angular/core';
import { IBeacon, IBeaconConfig } from './beacon.interface';

@Injectable()
export class BeaconRegistry {
    private beaconConfigs: Map<string, IBeaconConfig> = new Map();
    private beacons: Map<string, IBeacon> = new Map();

    register(beaconConfig: IBeaconConfig) {
        this.beaconConfigs.set(beaconConfig.id, beaconConfig);

        this.updateBeaconPositions();
    }

    unRegister(id: string) {
        this.beaconConfigs.delete(id);
        this.beacons.delete(id);
    }

    getBeacons() {
        return Array.from(this.beacons.values());
    }

    updateBeaconPositions() {
        this.beacons = new Map();

        this.beaconConfigs.forEach((beacon, id) => {
            const position = beacon.api.getPosition();

            this.beacons.set(id, {
                id,
                x: position.x,
                y: position.y,
                width: position.width,
                height: position.height
            });
        });
    }
}
