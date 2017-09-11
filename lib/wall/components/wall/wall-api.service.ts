import { Injectable } from '@angular/core';
import { IWallCoreApi } from './wall.interfaces';

// TODO: need to implement IWallApi interface

@Injectable()
export class WallApi {
    core: IWallCoreApi | any = {};

    features: any = {};

    registerCoreApi(methodName: string, method: any) {
        this.core[methodName] = method;
    }

    registerFeatureApi(featureName: string, api: any) {
        if (!this.features[featureName]) {
            this.features[featureName] = api;
        }
    }
}