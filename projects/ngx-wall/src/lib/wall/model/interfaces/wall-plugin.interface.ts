import {IWallModel} from '../..';

export interface IWallPlugin {
    name: string;
    version: string;

    onWallInitialize(wallModel: IWallModel);

    onWallPluginDestroy?();
}
