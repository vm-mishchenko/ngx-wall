import {IWallDefinition} from './wall-definition.interface';
import {IWallPlugin} from './wall-plugin.interface';

export interface IWallModelConfig {
    plan?: IWallDefinition;
    plugins?: IWallPlugin[];
}
