import { Injectable } from '@angular/core';
import { WallCoreApi } from "./interfaces/wall-core-api.interface";

@Injectable()
export class WallApi {
    core: WallCoreApi = null;

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