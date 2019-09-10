import {Observable} from 'rxjs';
import {WallCoreApi2} from '../../plugins/core2/wall-core.plugin2';

export interface IWallModel {
    version: string;

    api: {
        [apiName: string]: any;
        core2: WallCoreApi2
    };

    events$: Observable<any>;
    apiRegistered$: Observable<string>;

    destroy();

    registerApi(apiName: string, api: object);
}
