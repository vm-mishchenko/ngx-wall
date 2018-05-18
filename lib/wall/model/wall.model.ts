import {Subject} from 'rxjs';
import {Observable} from 'rxjs/index';
import {BrickRegistry} from '../registry/brick-registry.service';
import {IWallModelConfig} from './interfaces/wall-model-config.interface';
import {IWallModelPlugin} from './interfaces/wall-model-plugin.interface';
import {WallCorePlugin} from './plugins/wall-core.plugin';

export class WallModel {
    version: '0.0.0';

    // plugin api
    api: {
        [apiName: string]: any;
    } = {};

    events$: Observable<any> = new Subject();

    private plugins: Map<string, IWallModelPlugin> = new Map();

    constructor(private brickRegistry: BrickRegistry, config: IWallModelConfig) {
        // initialize core plugins
        [
            new WallCorePlugin(brickRegistry)
        ].forEach((plugin) => this.initializePlugin(plugin));

        // initialize 3rd party plugins
        config.plugins.forEach((plugin) => this.initializePlugin(plugin));

        // todo temporary proxy to core plugin
        [
            'setPlan',
            'getPlan',
            'addBrickAfterBrickId',
            'getNextBrickId',
            'getNextTextBrickId',
            'getPreviousTextBrickId',
            'getPreviousBrickId',
            'getRowCount',
            'getColumnCount',
            'turnBrickInto',
            'updateBrickState',
            'addBrickAtStart',
            'addDefaultBrick',
            'moveBrickAfterBrickId',
            'moveBrickBeforeBrickId',
            'moveBrickToNewColumn',
            'removeBrick',
            'removeBricks',
            'clear',
            'getBricksCount',
            'isBrickAheadOf',
            'subscribe',
            'traverse',
            'filterBricks',
            'sortBrickIdsByLayoutOrder',
            'getBrickIds',
            'getBrickTag',
            'getBrickSnapshot',
            'getBrickTextRepresentation'
        ].forEach((methodName) => {
            this[methodName] = this.api.core[methodName].bind(this.api.core);
        });
    }

    // register external API
    registerApi(apiName: string, api: object) {
        this.api[apiName] = api;
    }

    destroy() {
        this.plugins.forEach((plugin) => this.destroyPlugin(plugin));
    }

    private initializePlugin(plugin: IWallModelPlugin) {
        plugin.onInitialize(this);

        this.plugins.set(plugin.name, plugin);
    }

    private destroyPlugin(plugin: IWallModelPlugin) {
        if (plugin.onDestroy) {
            plugin.onDestroy();
        }
    }
}
