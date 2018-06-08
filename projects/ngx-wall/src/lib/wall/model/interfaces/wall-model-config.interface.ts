import {IWallDefinition, IWallPlugin} from '../..';

export interface IWallModelConfig {
    plan?: IWallDefinition;
    plugins?: IWallPlugin[];
}
