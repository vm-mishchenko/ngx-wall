import {IWallDefinition2} from './wall-definition.interface2';
import {IWallPlugin} from './wall-plugin.interface';

export interface IWallModelConfig2 {
    plan?: IWallDefinition2;
    plugins?: IWallPlugin[];
}
