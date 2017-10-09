export interface BeaconConfig {
    id: string;
    api: {
        getPosition(): BeaconPosition;
    }
}

export interface BeaconPosition {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Beacon extends BeaconPosition {
    id: string;
}