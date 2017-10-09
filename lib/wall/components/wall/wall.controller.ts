import { Injectable, Injector, ReflectiveInjector } from '@angular/core';
import { WallModel } from './wall.model';
import { WALL_PLUGIN } from '../../wall.tokens';
import { WallConfiguration } from './wall.interfaces';
import { WallDefinition } from "./interfaces/wall-definition.interface";

@Injectable()
export class WallController {
    constructor(public wallModel: WallModel, private injector: Injector) {
    }

    initialize(plan: WallDefinition, configuration: WallConfiguration) {
        // initialize core functionality
        this.wallModel.initialize(plan, configuration);

        // initialize plugins
        const plugins = this.injector.get(WALL_PLUGIN);
        const pluginInjector = ReflectiveInjector.resolveAndCreate(plugins, this.injector);

        plugins.forEach((plugin) => pluginInjector.resolveAndInstantiate(plugin));

        // pass initialized API back to the client
        if (configuration && configuration.onRegisterApi) {
            configuration.onRegisterApi(this.wallModel.api);
        }
    }
}