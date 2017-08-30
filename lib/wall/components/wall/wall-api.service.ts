import { Injectable } from '@angular/core';

// TODO: need to implement IWallApi interface

@Injectable()
export class WallApi {
    core: any; // TODO: need implement IWallCoreApi interface

    features: any = {};

    registerFeatureApi(featureName: string, api: any) {
        if (!this.features[featureName]) {
            this.features[featureName] = api;
        }
    }
}