import {IWallDefinition} from '../../wall.interfaces';
import {IWallModelConfig} from './wall-model-config.interface';

export interface IWallFactoryConfig {
    plan?: IWallDefinition;
    config?: IWallModelConfig;
}
