export interface ISpotSize {
    width: number;
    height: number;
}

export interface ISpotPosition {
    x: number;
    y: number;
}

export interface ISpotInfo {
    data: any;
    id: string;
    size: ISpotSize;
    position: ISpotPosition;
}

export type SpotId = string;
