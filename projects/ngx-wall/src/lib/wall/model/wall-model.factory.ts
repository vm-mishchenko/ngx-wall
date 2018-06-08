import {Injectable} from '@angular/core';
import {BrickRegistry} from '../registry/brick-registry.service';
import {IWallModelConfig} from './interfaces/wall-model-config.interface';
import {IWallModel} from './interfaces/wall-model.interface';
import {WallModel} from './wall.model';

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

        const wallModel = new WallModel(
            this.brickRegistry,
            config
        );

        wallModel.api.core.setPlan(config.plan);

        return wallModel;
    }
}
