import {Injectable} from '@angular/core';
import {IWallCoreApi} from './wall.interfaces';

@Injectable()
export class WallApi {
    core: IWallCoreApi = null;

    features: any = {};

    registerCoreApi(coreApi: any) {
        this.core = coreApi;
    }

    registerFeatureApi(featureName: string, api: any) {
        if (!this.features[featureName]) {
            this.features[featureName] = api;
        }
    }
}