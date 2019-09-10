import {WallCorePlugin2} from '../../plugins/core2/wall-core.plugin2';

export interface IWallModel {
    version: string;

    api: {
        [apiName: string]: any;
        core: WallCorePlugin2
    };

    destroy();

    subscribe(callback: any);

    registerApi(apiName: string, api: object);
}
