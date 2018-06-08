import {IWallCorePluginApi} from '../plugins/core/interfaces/wall-core-plugin-api.interface';

export interface IWallModel {
    version: string;

    api: {
        [apiName: string]: any;
        core: IWallCorePluginApi
    };

    destroy();

    registerApi(apiName: string, api: object);
}
