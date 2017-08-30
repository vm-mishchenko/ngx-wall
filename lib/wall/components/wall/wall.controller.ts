import { Injectable } from '@angular/core';
import { IWallConfiguration, IWallDefinition } from '../../wall.interfaces';
import { WallModel } from './wall.model';

@Injectable()
export class WallController {
    constructor(public wallModel: WallModel) {
    }

    initialize(plan: IWallDefinition, configuration: IWallConfiguration) {
        // initialize core functionality
        this.wallModel.initialize(plan);

        // initialize plugins
        if (configuration.plugins) {
            configuration.plugins.forEach((plugin) => {
                plugin.initialize(this.wallModel.api);
            });
        }

        // pass initialized API back to the client
        if (configuration.onRegisterApi) {
            configuration.onRegisterApi(this.wallModel.api);
        }
    }
}