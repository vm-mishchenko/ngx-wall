import { Injectable } from '@angular/core';
import { IWallCoreApi } from './interfaces/wall-core-api.interface';

@Injectable()
export class WallApi {
    core: IWallCoreApi = null;

    features: any = {};

    registerCoreApi(coreApi: IWallCoreApi) {
        this.core = coreApi;
    }

    registerFeatureApi(featureName: string, api: any) {
        if (!this.features[featureName]) {
            this.features[featureName] = api;
        }
    }
}
