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

export interface IDistanceToSpot {
    minimalDistance: number;
    topLeftPointDistance: number;
    bottomLeftPointDistance: number;
    centerLeftPointDistance: number;
    isCross13Line: boolean;
    data: any;
}
