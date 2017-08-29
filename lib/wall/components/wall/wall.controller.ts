import { Injectable } from '@angular/core';
import { IWallConfiguration, IWallDefinition } from '../../wall.interfaces';
import { WallModel } from './wall.model';

@Injectable()
export class WallController {
    constructor(public wallModel: WallModel) {
    }

    initialize(plan: IWallDefinition, configuration: IWallConfiguration) {
        this.wallModel.initialize(plan);

        // initialize plugin
        if (configuration.plugins) {
            configuration.plugins.forEach((plugin) => {
                plugin.initialize(this.wallModel.api);
            });
        }

        if (configuration.onRegisterApi) {
            configuration.onRegisterApi(this.wallModel.api);
        }
    }
}