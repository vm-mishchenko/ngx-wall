import {WallCoreApi2} from '../../plugins/core2/wall-core.plugin2';
import {IWallCorePluginApi} from './wall-core-plugin-api.interface';

export interface IWallModel {
    version: string;

    api: {
        [apiName: string]: any;
        core2: WallCoreApi2
    };

    destroy();

    subscribe(callback: any);

    registerApi(apiName: string, api: object);
}
