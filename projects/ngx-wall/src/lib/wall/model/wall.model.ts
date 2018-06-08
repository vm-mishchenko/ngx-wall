import {IWallPlugin} from '../domain/plugin/wall-plugin.interface';
import {BrickRegistry} from '../registry/public_api';
import {IWallModelConfig} from './interfaces/wall-model-config.interface';
import {IWallModel} from './interfaces/wall-model.interface';
import {IWallCorePluginApi} from './plugins/core/interfaces/wall-core-plugin-api.interface';
import {WallCorePlugin} from './plugins/core/wall-core.plugin';

export class WallModel implements IWallModel {
    version: '0.0.0';

    // plugin api
    api: {
        [apiName: string]: any;
        core: IWallCorePluginApi
    } = {
        core: null
    };

    private plugins: Map<string, IWallPlugin> = new Map();

    constructor(private brickRegistry: BrickRegistry, config: IWallModelConfig) {
        // initialize core plugins
        [
            new WallCorePlugin(brickRegistry)
        ].forEach((plugin) => this.initializePlugin(plugin));

        // initialize 3rd party plugins
        config.plugins.forEach((plugin) => this.initializePlugin(plugin));
    }

    // register external API
    registerApi(apiName: string, api: object) {
        this.api[apiName] = api;
    }

    destroy() {
        this.plugins.forEach((plugin) => this.destroyPlugin(plugin));
    }

    private initializePlugin(plugin: IWallPlugin) {
        plugin.onWallInitialize(this);

        this.plugins.set(plugin.name, plugin);
    }

    private destroyPlugin(plugin: IWallPlugin) {
        if (plugin.onWallPluginDestroy) {
            plugin.onWallPluginDestroy();
        }
    }
}
