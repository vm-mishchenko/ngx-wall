import {Injectable} from '@angular/core';
import {IWallModelConfig2} from '../model/interfaces/wall-model-config.interface2';
import {IWallModel} from '../model/interfaces/wall-model.interface';
import {WallModel} from '../model/wall.model';
import {WallCorePlugin2} from '../plugins/core2/wall-core.plugin2';
import {BrickRegistry} from '../registry/brick-registry.service';

@Injectable()
export class WallModelFactory {
    constructor(private brickRegistry: BrickRegistry) {
    }

    create(config?: IWallModelConfig2): IWallModel {
        const defaultConfig = {
            plan: [],
            plugins: []
        };

        config = {
            ...defaultConfig,
            ...config
        };

        // inject core plugin as initial first plugin
        // in this way factory will decouple WallModel from WallCorePlugin
        // config.plugins.unshift(new WallCorePlugin(this.brickRegistry));
        config.plugins.unshift(new WallCorePlugin2(this.brickRegistry));

        const wallModel = new WallModel(
            this.brickRegistry,
            config
        );

        wallModel.api.core2.setPlan(config.plan);

        return wallModel;
    }
}
