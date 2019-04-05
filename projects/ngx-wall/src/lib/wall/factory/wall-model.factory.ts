import {Injectable} from '@angular/core';
import {WallCorePlugin} from '../plugins/core/wall-core.plugin';
import {WallModel} from '../model/wall.model';
import {BrickRegistry} from '../registry/brick-registry.service';
import {IWallModel} from '../model/interfaces/wall-model.interface';
import {IWallModelConfig} from '../model/interfaces/wall-model-config.interface';

@Injectable()
export class WallModelFactory {
    constructor(private brickRegistry: BrickRegistry) {
    }

    create(config?: IWallModelConfig): IWallModel {
        const defaultConfig = {
            plan: {
                bricks: [],
                layout: {
                    bricks: []
                }
            },
            plugins: []
        };

        config = {
            ...defaultConfig,
            ...config
        };

        // inject core plugin as initial first plugin
        // in this way factory will decouple WallModel from WallCorePlugin
        config.plugins.unshift(new WallCorePlugin(this.brickRegistry));

        const wallModel = new WallModel(
            this.brickRegistry,
            config
        );

        wallModel.api.core.setPlan(config.plan);

        return wallModel;
    }
}
