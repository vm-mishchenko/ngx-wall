import { WallBrick } from './wall-brick.model';

export interface IWallRow {
    id: string;
    columns: IWallColumn[];
}

export interface IWallColumn {
    bricks: WallBrick[];
}
