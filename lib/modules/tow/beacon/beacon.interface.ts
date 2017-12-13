export interface IBeaconConfig {
    id: string;
    api: {
        getPosition(): IBeaconPosition;
    };
}

export interface IBeaconPosition {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface IBeacon extends IBeaconPosition {
    id: string;
}
