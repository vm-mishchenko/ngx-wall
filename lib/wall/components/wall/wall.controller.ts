import { Injectable, Injector, ReflectiveInjector } from '@angular/core';
import { WALL_PLUGIN } from '../../wall.tokens';
import { WallConfiguration } from './wall.interfaces';
import { IWallModel } from "../../wall.interfaces";
import { WallViewModel } from "../../model/wall-view.model";
import { WallApi } from "./wall-api.service";

@Injectable()
export class WallController {
    // todo
    public wallModel: any;
    private initializedPlugins: any[] = [];

    constructor(public api: WallApi,
                public wallViewModel: WallViewModel,
                private injector: Injector) {
    }

    initialize(wallModel: IWallModel, configuration: WallConfiguration) {
        this.wallModel = wallModel;

        // initialize core functionality
        this.wallViewModel.initialize(wallModel);

        this.initializePlugins();

        // pass initialized API back to the client
        if (configuration && configuration.onRegisterApi) {
            configuration.onRegisterApi(this.api);
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

    /*getDefaultPlan() {
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
    }*/
}