import { Injectable, Injector, ReflectiveInjector } from '@angular/core';
import { WallModel } from '../../wall.model';
import { WALL_PLUGIN } from '../../wall.tokens';
import { WallConfiguration } from './wall.interfaces';
import { WallDefinition } from './interfaces/wall-definition.interface';

@Injectable()
export class WallController {
    private initializedPlugins: any[] = [];

    constructor(public wallModel: WallModel, private injector: Injector) {
    }

    initialize(plan: WallDefinition, configuration: WallConfiguration) {
        // initialize core functionality
        this.wallModel.initialize(plan || this.getDefaultPlan());

        this.initializePlugins();

        // pass initialized API back to the client
        if (configuration && configuration.onRegisterApi) {
            configuration.onRegisterApi(this.wallModel.api);
        }
    }

    initializePlugins() {
        // initialize plugins
        const plugins = this.injector.get(WALL_PLUGIN);
        const pluginInjector = ReflectiveInjector.resolveAndCreate(plugins, this.injector);

        plugins.forEach((plugin) => {
            this.initializedPlugins.push(pluginInjector.resolveAndInstantiate(plugin));
        });
    }

    destroyPlugins() {
        this.initializedPlugins.forEach((plugin) => {
            if (plugin.destroy) {
                plugin.destroy();
            }
        });

        this.initializedPlugins = [];
    }

    reset() {
        this.wallModel.reset();

        this.destroyPlugins();
    }

    getDefaultPlan() {
        return {
            bricks: [],

            layout: {
                bricks: [
                    {
                        columns: [
                            {
                                bricks: []
                            }
                        ]
                    }
                ]
            }
        };
    }
}