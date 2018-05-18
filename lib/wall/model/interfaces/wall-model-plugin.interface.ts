import {WallModel} from '../wall.model';

export interface IWallModelPlugin {
    name: string;

    version: string;

    onInitialize(wallModel: WallModel);

    onDestroy?();
}
