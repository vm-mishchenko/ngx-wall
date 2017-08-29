import { Injectable } from '@angular/core';
import { WallComponentApi } from './wall-component-api.service';

@Injectable()
export class WallApi {
    core: WallComponentApi;

    features: any = {};

    registerFeatureApi(featureName: string, api: any) {
        if (!this.features[featureName]) {
            this.features[featureName] = api;
        }
    }
}