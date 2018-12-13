import {IWallCorePluginApi} from './wall-core-plugin-api.interface';

export interface IWallModel {
    version: string;

    api: {
        [apiName: string]: any;
        core: IWallCorePluginApi
    };

    destroy();

    subscribe(callback: any);

    registerApi(apiName: string, api: object);
}
