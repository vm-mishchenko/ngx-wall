import { WallBrick } from './wall-brick.model';

export interface IWallRow {
    columns: IWallColumn[];
}

export interface IWallColumn {
    bricks: WallBrick[];
}